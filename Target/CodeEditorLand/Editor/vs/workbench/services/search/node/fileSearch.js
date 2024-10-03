import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from '../../../../base/common/path.js';
import { StringDecoder } from 'string_decoder';
import * as arrays from '../../../../base/common/arrays.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import * as glob from '../../../../base/common/glob.js';
import * as normalization from '../../../../base/common/normalization.js';
import { isEqualOrParent } from '../../../../base/common/extpath.js';
import * as platform from '../../../../base/common/platform.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import * as strings from '../../../../base/common/strings.js';
import * as types from '../../../../base/common/types.js';
import { Promises } from '../../../../base/node/pfs.js';
import { isFilePatternMatch, hasSiblingFn } from '../common/search.js';
import { spawnRipgrepCmd } from './ripgrepFileSearch.js';
import { prepareQuery } from '../../../../base/common/fuzzyScorer.js';
const killCmds = new Set();
process.on('exit', () => {
    killCmds.forEach(cmd => cmd());
});
export class FileWalker {
    constructor(config) {
        this.normalizedFilePatternLowercase = null;
        this.maxFilesize = null;
        this.isCanceled = false;
        this.fileWalkSW = null;
        this.cmdSW = null;
        this.cmdResultCount = 0;
        this.config = config;
        this.filePattern = config.filePattern || '';
        this.includePattern = config.includePattern && glob.parse(config.includePattern);
        this.maxResults = config.maxResults || null;
        this.exists = !!config.exists;
        this.walkedPaths = Object.create(null);
        this.resultCount = 0;
        this.isLimitHit = false;
        this.directoriesWalked = 0;
        this.filesWalked = 0;
        this.errors = [];
        if (this.filePattern) {
            this.normalizedFilePatternLowercase = config.shouldGlobMatchFilePattern ? null : prepareQuery(this.filePattern).normalizedLowercase;
        }
        this.globalExcludePattern = config.excludePattern && glob.parse(config.excludePattern);
        this.folderExcludePatterns = new Map();
        config.folderQueries.forEach(folderQuery => {
            const folderExcludeExpression = {};
            folderQuery.excludePattern?.forEach(excludePattern => {
                Object.assign(folderExcludeExpression, excludePattern.pattern || {}, this.config.excludePattern || {});
            });
            if (!folderQuery.excludePattern?.length) {
                Object.assign(folderExcludeExpression, this.config.excludePattern || {});
            }
            const fqPath = folderQuery.folder.fsPath;
            config.folderQueries
                .map(rootFolderQuery => rootFolderQuery.folder.fsPath)
                .filter(rootFolder => rootFolder !== fqPath)
                .forEach(otherRootFolder => {
                if (isEqualOrParent(otherRootFolder, fqPath)) {
                    folderExcludeExpression[path.relative(fqPath, otherRootFolder)] = true;
                }
            });
            this.folderExcludePatterns.set(fqPath, new AbsoluteAndRelativeParsedExpression(folderExcludeExpression, fqPath));
        });
    }
    cancel() {
        this.isCanceled = true;
        killCmds.forEach(cmd => cmd());
    }
    walk(folderQueries, extraFiles, numThreads, onResult, onMessage, done) {
        this.fileWalkSW = StopWatch.create(false);
        if (this.isCanceled) {
            return done(null, this.isLimitHit);
        }
        extraFiles.forEach(extraFilePath => {
            const basename = path.basename(extraFilePath.fsPath);
            if (this.globalExcludePattern && this.globalExcludePattern(extraFilePath.fsPath, basename)) {
                return;
            }
            this.matchFile(onResult, { relativePath: extraFilePath.fsPath, searchPath: undefined });
        });
        this.cmdSW = StopWatch.create(false);
        this.parallel(folderQueries, (folderQuery, rootFolderDone) => {
            this.call(this.cmdTraversal, this, folderQuery, numThreads, onResult, onMessage, (err) => {
                if (err) {
                    const errorMessage = toErrorMessage(err);
                    console.error(errorMessage);
                    this.errors.push(errorMessage);
                    rootFolderDone(err, undefined);
                }
                else {
                    rootFolderDone(null, undefined);
                }
            });
        }, (errors, _result) => {
            this.fileWalkSW.stop();
            const err = errors ? arrays.coalesce(errors)[0] : null;
            done(err, this.isLimitHit);
        });
    }
    parallel(list, fn, callback) {
        const results = new Array(list.length);
        const errors = new Array(list.length);
        let didErrorOccur = false;
        let doneCount = 0;
        if (list.length === 0) {
            return callback(null, []);
        }
        list.forEach((item, index) => {
            fn(item, (error, result) => {
                if (error) {
                    didErrorOccur = true;
                    results[index] = null;
                    errors[index] = error;
                }
                else {
                    results[index] = result;
                    errors[index] = null;
                }
                if (++doneCount === list.length) {
                    return callback(didErrorOccur ? errors : null, results);
                }
            });
        });
    }
    call(fun, that, ...args) {
        try {
            fun.apply(that, args);
        }
        catch (e) {
            args[args.length - 1](e);
        }
    }
    cmdTraversal(folderQuery, numThreads, onResult, onMessage, cb) {
        const rootFolder = folderQuery.folder.fsPath;
        const isMac = platform.isMacintosh;
        const killCmd = () => cmd && cmd.kill();
        killCmds.add(killCmd);
        let done = (err) => {
            killCmds.delete(killCmd);
            done = () => { };
            cb(err);
        };
        let leftover = '';
        const tree = this.initDirectoryTree();
        const ripgrep = spawnRipgrepCmd(this.config, folderQuery, this.config.includePattern, this.folderExcludePatterns.get(folderQuery.folder.fsPath).expression, numThreads);
        const cmd = ripgrep.cmd;
        const noSiblingsClauses = !Object.keys(ripgrep.siblingClauses).length;
        const escapedArgs = ripgrep.rgArgs.args
            .map(arg => arg.match(/^-/) ? arg : `'${arg}'`)
            .join(' ');
        let rgCmd = `${ripgrep.rgDiskPath} ${escapedArgs}\n - cwd: ${ripgrep.cwd}`;
        if (ripgrep.rgArgs.siblingClauses) {
            rgCmd += `\n - Sibling clauses: ${JSON.stringify(ripgrep.rgArgs.siblingClauses)}`;
        }
        onMessage({ message: rgCmd });
        this.cmdResultCount = 0;
        this.collectStdout(cmd, 'utf8', onMessage, (err, stdout, last) => {
            if (err) {
                done(err);
                return;
            }
            if (this.isLimitHit) {
                done();
                return;
            }
            const normalized = leftover + (isMac ? normalization.normalizeNFC(stdout || '') : stdout);
            const relativeFiles = normalized.split('\n');
            if (last) {
                const n = relativeFiles.length;
                relativeFiles[n - 1] = relativeFiles[n - 1].trim();
                if (!relativeFiles[n - 1]) {
                    relativeFiles.pop();
                }
            }
            else {
                leftover = relativeFiles.pop() || '';
            }
            if (relativeFiles.length && relativeFiles[0].indexOf('\n') !== -1) {
                done(new Error('Splitting up files failed'));
                return;
            }
            this.cmdResultCount += relativeFiles.length;
            if (noSiblingsClauses) {
                for (const relativePath of relativeFiles) {
                    this.matchFile(onResult, { base: rootFolder, relativePath, searchPath: this.getSearchPath(folderQuery, relativePath) });
                    if (this.isLimitHit) {
                        killCmd();
                        break;
                    }
                }
                if (last || this.isLimitHit) {
                    done();
                }
                return;
            }
            this.addDirectoryEntries(folderQuery, tree, rootFolder, relativeFiles, onResult);
            if (last) {
                this.matchDirectoryTree(tree, rootFolder, onResult);
                done();
            }
        });
    }
    spawnFindCmd(folderQuery) {
        const excludePattern = this.folderExcludePatterns.get(folderQuery.folder.fsPath);
        const basenames = excludePattern.getBasenameTerms();
        const pathTerms = excludePattern.getPathTerms();
        const args = ['-L', '.'];
        if (basenames.length || pathTerms.length) {
            args.push('-not', '(', '(');
            for (const basename of basenames) {
                args.push('-name', basename);
                args.push('-o');
            }
            for (const path of pathTerms) {
                args.push('-path', path);
                args.push('-o');
            }
            args.pop();
            args.push(')', '-prune', ')');
        }
        args.push('-type', 'f');
        return childProcess.spawn('find', args, { cwd: folderQuery.folder.fsPath });
    }
    readStdout(cmd, encoding, cb) {
        let all = '';
        this.collectStdout(cmd, encoding, () => { }, (err, stdout, last) => {
            if (err) {
                cb(err);
                return;
            }
            all += stdout;
            if (last) {
                cb(null, all);
            }
        });
    }
    collectStdout(cmd, encoding, onMessage, cb) {
        let onData = (err, stdout, last) => {
            if (err || last) {
                onData = () => { };
                this.cmdSW?.stop();
            }
            cb(err, stdout, last);
        };
        let gotData = false;
        if (cmd.stdout) {
            this.forwardData(cmd.stdout, encoding, onData);
            cmd.stdout.once('data', () => gotData = true);
        }
        else {
            onMessage({ message: 'stdout is null' });
        }
        let stderr;
        if (cmd.stderr) {
            stderr = this.collectData(cmd.stderr);
        }
        else {
            onMessage({ message: 'stderr is null' });
        }
        cmd.on('error', (err) => {
            onData(err);
        });
        cmd.on('close', (code) => {
            let stderrText;
            if (!gotData && (stderrText = this.decodeData(stderr, encoding)) && rgErrorMsgForDisplay(stderrText)) {
                onData(new Error(`command failed with error code ${code}: ${this.decodeData(stderr, encoding)}`));
            }
            else {
                if (this.exists && code === 0) {
                    this.isLimitHit = true;
                }
                onData(null, '', true);
            }
        });
    }
    forwardData(stream, encoding, cb) {
        const decoder = new StringDecoder(encoding);
        stream.on('data', (data) => {
            cb(null, decoder.write(data));
        });
        return decoder;
    }
    collectData(stream) {
        const buffers = [];
        stream.on('data', (data) => {
            buffers.push(data);
        });
        return buffers;
    }
    decodeData(buffers, encoding) {
        const decoder = new StringDecoder(encoding);
        return buffers.map(buffer => decoder.write(buffer)).join('');
    }
    initDirectoryTree() {
        const tree = {
            rootEntries: [],
            pathToEntries: Object.create(null)
        };
        tree.pathToEntries['.'] = tree.rootEntries;
        return tree;
    }
    addDirectoryEntries(folderQuery, { pathToEntries }, base, relativeFiles, onResult) {
        if (relativeFiles.indexOf(this.filePattern) !== -1) {
            this.matchFile(onResult, {
                base,
                relativePath: this.filePattern,
                searchPath: this.getSearchPath(folderQuery, this.filePattern)
            });
        }
        const add = (relativePath) => {
            const basename = path.basename(relativePath);
            const dirname = path.dirname(relativePath);
            let entries = pathToEntries[dirname];
            if (!entries) {
                entries = pathToEntries[dirname] = [];
                add(dirname);
            }
            entries.push({
                base,
                relativePath,
                basename,
                searchPath: this.getSearchPath(folderQuery, relativePath),
            });
        };
        relativeFiles.forEach(add);
    }
    matchDirectoryTree({ rootEntries, pathToEntries }, rootFolder, onResult) {
        const self = this;
        const excludePattern = this.folderExcludePatterns.get(rootFolder);
        const filePattern = this.filePattern;
        function matchDirectory(entries) {
            self.directoriesWalked++;
            const hasSibling = hasSiblingFn(() => entries.map(entry => entry.basename));
            for (let i = 0, n = entries.length; i < n; i++) {
                const entry = entries[i];
                const { relativePath, basename } = entry;
                if (excludePattern.test(relativePath, basename, filePattern !== basename ? hasSibling : undefined)) {
                    continue;
                }
                const sub = pathToEntries[relativePath];
                if (sub) {
                    matchDirectory(sub);
                }
                else {
                    self.filesWalked++;
                    if (relativePath === filePattern) {
                        continue;
                    }
                    self.matchFile(onResult, entry);
                }
                if (self.isLimitHit) {
                    break;
                }
            }
        }
        matchDirectory(rootEntries);
    }
    getStats() {
        return {
            cmdTime: this.cmdSW.elapsed(),
            fileWalkTime: this.fileWalkSW.elapsed(),
            directoriesWalked: this.directoriesWalked,
            filesWalked: this.filesWalked,
            cmdResultCount: this.cmdResultCount
        };
    }
    doWalk(folderQuery, relativeParentPath, files, onResult, done) {
        const rootFolder = folderQuery.folder;
        const hasSibling = hasSiblingFn(() => files);
        this.parallel(files, (file, clb) => {
            if (this.isCanceled || this.isLimitHit) {
                return clb(null);
            }
            const currentRelativePath = relativeParentPath ? [relativeParentPath, file].join(path.sep) : file;
            if (this.folderExcludePatterns.get(folderQuery.folder.fsPath).test(currentRelativePath, file, this.config.filePattern !== file ? hasSibling : undefined)) {
                return clb(null);
            }
            const currentAbsolutePath = [rootFolder.fsPath, currentRelativePath].join(path.sep);
            fs.lstat(currentAbsolutePath, (error, lstat) => {
                if (error || this.isCanceled || this.isLimitHit) {
                    return clb(null);
                }
                this.statLinkIfNeeded(currentAbsolutePath, lstat, (error, stat) => {
                    if (error || this.isCanceled || this.isLimitHit) {
                        return clb(null);
                    }
                    if (stat.isDirectory()) {
                        this.directoriesWalked++;
                        return this.realPathIfNeeded(currentAbsolutePath, lstat, (error, realpath) => {
                            if (error || this.isCanceled || this.isLimitHit) {
                                return clb(null);
                            }
                            realpath = realpath || '';
                            if (this.walkedPaths[realpath]) {
                                return clb(null);
                            }
                            this.walkedPaths[realpath] = true;
                            return Promises.readdir(currentAbsolutePath).then(children => {
                                if (this.isCanceled || this.isLimitHit) {
                                    return clb(null);
                                }
                                this.doWalk(folderQuery, currentRelativePath, children, onResult, err => clb(err || null));
                            }, error => {
                                clb(null);
                            });
                        });
                    }
                    else {
                        this.filesWalked++;
                        if (currentRelativePath === this.filePattern) {
                            return clb(null, undefined);
                        }
                        if (this.maxFilesize && types.isNumber(stat.size) && stat.size > this.maxFilesize) {
                            return clb(null, undefined);
                        }
                        this.matchFile(onResult, {
                            base: rootFolder.fsPath,
                            relativePath: currentRelativePath,
                            searchPath: this.getSearchPath(folderQuery, currentRelativePath),
                        });
                    }
                    return clb(null, undefined);
                });
            });
        }, (error) => {
            const filteredErrors = error ? arrays.coalesce(error) : error;
            return done(filteredErrors && filteredErrors.length > 0 ? filteredErrors[0] : undefined);
        });
    }
    matchFile(onResult, candidate) {
        if (this.isFileMatch(candidate) && (!this.includePattern || this.includePattern(candidate.relativePath, path.basename(candidate.relativePath)))) {
            this.resultCount++;
            if (this.exists || (this.maxResults && this.resultCount > this.maxResults)) {
                this.isLimitHit = true;
            }
            if (!this.isLimitHit) {
                onResult(candidate);
            }
        }
    }
    isFileMatch(candidate) {
        if (this.filePattern) {
            if (this.filePattern === '*') {
                return true;
            }
            if (this.normalizedFilePatternLowercase) {
                return isFilePatternMatch(candidate, this.normalizedFilePatternLowercase);
            }
            else if (this.filePattern) {
                return isFilePatternMatch(candidate, this.filePattern, false);
            }
        }
        return true;
    }
    statLinkIfNeeded(path, lstat, clb) {
        if (lstat.isSymbolicLink()) {
            return fs.stat(path, clb);
        }
        return clb(null, lstat);
    }
    realPathIfNeeded(path, lstat, clb) {
        if (lstat.isSymbolicLink()) {
            return fs.realpath(path, (error, realpath) => {
                if (error) {
                    return clb(error);
                }
                return clb(null, realpath);
            });
        }
        return clb(null, path);
    }
    getSearchPath(folderQuery, relativePath) {
        if (folderQuery.folderName) {
            return path.join(folderQuery.folderName, relativePath);
        }
        return relativePath;
    }
}
export class Engine {
    constructor(config, numThreads) {
        this.folderQueries = config.folderQueries;
        this.extraFiles = config.extraFileResources || [];
        this.numThreads = numThreads;
        this.walker = new FileWalker(config);
    }
    search(onResult, onProgress, done) {
        this.walker.walk(this.folderQueries, this.extraFiles, this.numThreads, onResult, onProgress, (err, isLimitHit) => {
            done(err, {
                limitHit: isLimitHit,
                stats: this.walker.getStats(),
                messages: [],
            });
        });
    }
    cancel() {
        this.walker.cancel();
    }
}
class AbsoluteAndRelativeParsedExpression {
    constructor(expression, root) {
        this.expression = expression;
        this.root = root;
        this.init(expression);
    }
    init(expr) {
        let absoluteGlobExpr;
        let relativeGlobExpr;
        Object.keys(expr)
            .filter(key => expr[key])
            .forEach(key => {
            if (path.isAbsolute(key)) {
                absoluteGlobExpr = absoluteGlobExpr || glob.getEmptyExpression();
                absoluteGlobExpr[key] = expr[key];
            }
            else {
                relativeGlobExpr = relativeGlobExpr || glob.getEmptyExpression();
                relativeGlobExpr[key] = expr[key];
            }
        });
        this.absoluteParsedExpr = absoluteGlobExpr && glob.parse(absoluteGlobExpr, { trimForExclusions: true });
        this.relativeParsedExpr = relativeGlobExpr && glob.parse(relativeGlobExpr, { trimForExclusions: true });
    }
    test(_path, basename, hasSibling) {
        return (this.relativeParsedExpr && this.relativeParsedExpr(_path, basename, hasSibling)) ||
            (this.absoluteParsedExpr && this.absoluteParsedExpr(path.join(this.root, _path), basename, hasSibling));
    }
    getBasenameTerms() {
        const basenameTerms = [];
        if (this.absoluteParsedExpr) {
            basenameTerms.push(...glob.getBasenameTerms(this.absoluteParsedExpr));
        }
        if (this.relativeParsedExpr) {
            basenameTerms.push(...glob.getBasenameTerms(this.relativeParsedExpr));
        }
        return basenameTerms;
    }
    getPathTerms() {
        const pathTerms = [];
        if (this.absoluteParsedExpr) {
            pathTerms.push(...glob.getPathTerms(this.absoluteParsedExpr));
        }
        if (this.relativeParsedExpr) {
            pathTerms.push(...glob.getPathTerms(this.relativeParsedExpr));
        }
        return pathTerms;
    }
}
function rgErrorMsgForDisplay(msg) {
    const lines = msg.trim().split('\n');
    const firstLine = lines[0].trim();
    if (firstLine.startsWith('Error parsing regex')) {
        return firstLine;
    }
    if (firstLine.startsWith('regex parse error')) {
        return strings.uppercaseFirstLetter(lines[lines.length - 1].trim());
    }
    if (firstLine.startsWith('error parsing glob') ||
        firstLine.startsWith('unsupported encoding')) {
        return firstLine.charAt(0).toUpperCase() + firstLine.substr(1);
    }
    if (firstLine === `Literal '\\n' not allowed.`) {
        return `Literal '\\n' currently not supported`;
    }
    if (firstLine.startsWith('Literal ')) {
        return firstLine;
    }
    return undefined;
}
