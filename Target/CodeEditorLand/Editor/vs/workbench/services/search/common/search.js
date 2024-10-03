import { mapArrayOrNot } from '../../../../base/common/arrays.js';
import * as glob from '../../../../base/common/glob.js';
import * as objects from '../../../../base/common/objects.js';
import * as extpath from '../../../../base/common/extpath.js';
import { fuzzyContains, getNLines } from '../../../../base/common/strings.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import * as paths from '../../../../base/common/path.js';
import { isCancellationError } from '../../../../base/common/errors.js';
import { TextSearchCompleteMessageType } from './searchExtTypes.js';
import { isThenable } from '../../../../base/common/async.js';
export { TextSearchCompleteMessageType };
export const VIEWLET_ID = 'workbench.view.search';
export const PANEL_ID = 'workbench.panel.search';
export const VIEW_ID = 'workbench.view.search';
export const SEARCH_RESULT_LANGUAGE_ID = 'search-result';
export const SEARCH_EXCLUDE_CONFIG = 'search.exclude';
export const DEFAULT_MAX_SEARCH_RESULTS = 20000;
const SEARCH_ELIDED_PREFIX = '⟪ ';
const SEARCH_ELIDED_SUFFIX = ' characters skipped ⟫';
const SEARCH_ELIDED_MIN_LEN = (SEARCH_ELIDED_PREFIX.length + SEARCH_ELIDED_SUFFIX.length + 5) * 2;
export const ISearchService = createDecorator('searchService');
export function resultIsMatch(result) {
    return !!result.rangeLocations && !!result.previewText;
}
export function isFileMatch(p) {
    return !!p.resource;
}
export function isProgressMessage(p) {
    return !!p.message;
}
export class FileMatch {
    constructor(resource) {
        this.resource = resource;
        this.results = [];
    }
}
export class TextSearchMatch {
    constructor(text, ranges, previewOptions, webviewIndex) {
        this.rangeLocations = [];
        this.webviewIndex = webviewIndex;
        const rangesArr = Array.isArray(ranges) ? ranges : [ranges];
        if (previewOptions && previewOptions.matchLines === 1 && isSingleLineRangeList(rangesArr)) {
            text = getNLines(text, previewOptions.matchLines);
            let result = '';
            let shift = 0;
            let lastEnd = 0;
            const leadingChars = Math.floor(previewOptions.charsPerLine / 5);
            for (const range of rangesArr) {
                const previewStart = Math.max(range.startColumn - leadingChars, 0);
                const previewEnd = range.startColumn + previewOptions.charsPerLine;
                if (previewStart > lastEnd + leadingChars + SEARCH_ELIDED_MIN_LEN) {
                    const elision = SEARCH_ELIDED_PREFIX + (previewStart - lastEnd) + SEARCH_ELIDED_SUFFIX;
                    result += elision + text.slice(previewStart, previewEnd);
                    shift += previewStart - (lastEnd + elision.length);
                }
                else {
                    result += text.slice(lastEnd, previewEnd);
                }
                lastEnd = previewEnd;
                this.rangeLocations.push({
                    source: range,
                    preview: new OneLineRange(0, range.startColumn - shift, range.endColumn - shift)
                });
            }
            this.previewText = result;
        }
        else {
            const firstMatchLine = Array.isArray(ranges) ? ranges[0].startLineNumber : ranges.startLineNumber;
            const rangeLocs = mapArrayOrNot(ranges, r => ({
                preview: new SearchRange(r.startLineNumber - firstMatchLine, r.startColumn, r.endLineNumber - firstMatchLine, r.endColumn),
                source: r
            }));
            this.rangeLocations = Array.isArray(rangeLocs) ? rangeLocs : [rangeLocs];
            this.previewText = text;
        }
    }
}
function isSingleLineRangeList(ranges) {
    const line = ranges[0].startLineNumber;
    for (const r of ranges) {
        if (r.startLineNumber !== line || r.endLineNumber !== line) {
            return false;
        }
    }
    return true;
}
export class SearchRange {
    constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
        this.startLineNumber = startLineNumber;
        this.startColumn = startColumn;
        this.endLineNumber = endLineNumber;
        this.endColumn = endColumn;
    }
}
export class OneLineRange extends SearchRange {
    constructor(lineNumber, startColumn, endColumn) {
        super(lineNumber, startColumn, lineNumber, endColumn);
    }
}
export function getExcludes(configuration, includeSearchExcludes = true) {
    const fileExcludes = configuration && configuration.files && configuration.files.exclude;
    const searchExcludes = includeSearchExcludes && configuration && configuration.search && configuration.search.exclude;
    if (!fileExcludes && !searchExcludes) {
        return undefined;
    }
    if (!fileExcludes || !searchExcludes) {
        return fileExcludes || searchExcludes || undefined;
    }
    let allExcludes = Object.create(null);
    allExcludes = objects.mixin(allExcludes, objects.deepClone(fileExcludes));
    allExcludes = objects.mixin(allExcludes, objects.deepClone(searchExcludes), true);
    return allExcludes;
}
export function pathIncludedInQuery(queryProps, fsPath) {
    if (queryProps.excludePattern && glob.match(queryProps.excludePattern, fsPath)) {
        return false;
    }
    if (queryProps.includePattern || queryProps.usingSearchPaths) {
        if (queryProps.includePattern && glob.match(queryProps.includePattern, fsPath)) {
            return true;
        }
        if (queryProps.usingSearchPaths) {
            return !!queryProps.folderQueries && queryProps.folderQueries.some(fq => {
                const searchPath = fq.folder.fsPath;
                if (extpath.isEqualOrParent(fsPath, searchPath)) {
                    const relPath = paths.relative(searchPath, fsPath);
                    return !fq.includePattern || !!glob.match(fq.includePattern, relPath);
                }
                else {
                    return false;
                }
            });
        }
        return false;
    }
    return true;
}
export var SearchErrorCode;
(function (SearchErrorCode) {
    SearchErrorCode[SearchErrorCode["unknownEncoding"] = 1] = "unknownEncoding";
    SearchErrorCode[SearchErrorCode["regexParseError"] = 2] = "regexParseError";
    SearchErrorCode[SearchErrorCode["globParseError"] = 3] = "globParseError";
    SearchErrorCode[SearchErrorCode["invalidLiteral"] = 4] = "invalidLiteral";
    SearchErrorCode[SearchErrorCode["rgProcessError"] = 5] = "rgProcessError";
    SearchErrorCode[SearchErrorCode["other"] = 6] = "other";
    SearchErrorCode[SearchErrorCode["canceled"] = 7] = "canceled";
})(SearchErrorCode || (SearchErrorCode = {}));
export class SearchError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
export function deserializeSearchError(error) {
    const errorMsg = error.message;
    if (isCancellationError(error)) {
        return new SearchError(errorMsg, SearchErrorCode.canceled);
    }
    try {
        const details = JSON.parse(errorMsg);
        return new SearchError(details.message, details.code);
    }
    catch (e) {
        return new SearchError(errorMsg, SearchErrorCode.other);
    }
}
export function serializeSearchError(searchError) {
    const details = { message: searchError.message, code: searchError.code };
    return new Error(JSON.stringify(details));
}
export function isSerializedSearchComplete(arg) {
    if (arg.type === 'error') {
        return true;
    }
    else if (arg.type === 'success') {
        return true;
    }
    else {
        return false;
    }
}
export function isSerializedSearchSuccess(arg) {
    return arg.type === 'success';
}
export function isSerializedFileMatch(arg) {
    return !!arg.path;
}
export function isFilePatternMatch(candidate, filePatternToUse, fuzzy = true) {
    const pathToMatch = candidate.searchPath ? candidate.searchPath : candidate.relativePath;
    return fuzzy ?
        fuzzyContains(pathToMatch, filePatternToUse) :
        glob.match(filePatternToUse, pathToMatch);
}
export class SerializableFileMatch {
    constructor(path) {
        this.path = path;
        this.results = [];
    }
    addMatch(match) {
        this.results.push(match);
    }
    serialize() {
        return {
            path: this.path,
            results: this.results,
            numMatches: this.results.length
        };
    }
}
export function resolvePatternsForProvider(globalPattern, folderPattern) {
    const merged = {
        ...(globalPattern || {}),
        ...(folderPattern || {})
    };
    return Object.keys(merged)
        .filter(key => {
        const value = merged[key];
        return typeof value === 'boolean' && value;
    });
}
export class QueryGlobTester {
    constructor(config, folderQuery) {
        this._parsedIncludeExpression = null;
        this._excludeExpression = folderQuery.excludePattern?.map(excludePattern => {
            return {
                ...(config.excludePattern || {}),
                ...(excludePattern.pattern || {})
            };
        }) ?? [];
        if (this._excludeExpression.length === 0) {
            this._excludeExpression = [config.excludePattern || {}];
        }
        this._parsedExcludeExpression = this._excludeExpression.map(e => glob.parse(e));
        let includeExpression = config.includePattern;
        if (folderQuery.includePattern) {
            if (includeExpression) {
                includeExpression = {
                    ...includeExpression,
                    ...folderQuery.includePattern
                };
            }
            else {
                includeExpression = folderQuery.includePattern;
            }
        }
        if (includeExpression) {
            this._parsedIncludeExpression = glob.parse(includeExpression);
        }
    }
    _evalParsedExcludeExpression(testPath, basename, hasSibling) {
        let result = null;
        for (const folderExclude of this._parsedExcludeExpression) {
            const evaluation = folderExclude(testPath, basename, hasSibling);
            if (typeof evaluation === 'string') {
                result = evaluation;
                break;
            }
        }
        return result;
    }
    matchesExcludesSync(testPath, basename, hasSibling) {
        if (this._parsedExcludeExpression && this._evalParsedExcludeExpression(testPath, basename, hasSibling)) {
            return true;
        }
        return false;
    }
    includedInQuerySync(testPath, basename, hasSibling) {
        if (this._parsedExcludeExpression && this._evalParsedExcludeExpression(testPath, basename, hasSibling)) {
            return false;
        }
        if (this._parsedIncludeExpression && !this._parsedIncludeExpression(testPath, basename, hasSibling)) {
            return false;
        }
        return true;
    }
    includedInQuery(testPath, basename, hasSibling) {
        const isIncluded = () => {
            return this._parsedIncludeExpression ?
                !!(this._parsedIncludeExpression(testPath, basename, hasSibling)) :
                true;
        };
        return Promise.all(this._parsedExcludeExpression.map(e => {
            const excluded = e(testPath, basename, hasSibling);
            if (isThenable(excluded)) {
                return excluded.then(excluded => {
                    if (excluded) {
                        return false;
                    }
                    return isIncluded();
                });
            }
            return isIncluded();
        })).then(e => e.some(e => !!e));
    }
    hasSiblingExcludeClauses() {
        return this._excludeExpression.reduce((prev, curr) => hasSiblingClauses(curr) || prev, false);
    }
}
function hasSiblingClauses(pattern) {
    for (const key in pattern) {
        if (typeof pattern[key] !== 'boolean') {
            return true;
        }
    }
    return false;
}
export function hasSiblingPromiseFn(siblingsFn) {
    if (!siblingsFn) {
        return undefined;
    }
    let siblings;
    return (name) => {
        if (!siblings) {
            siblings = (siblingsFn() || Promise.resolve([]))
                .then(list => list ? listToMap(list) : {});
        }
        return siblings.then(map => !!map[name]);
    };
}
export function hasSiblingFn(siblingsFn) {
    if (!siblingsFn) {
        return undefined;
    }
    let siblings;
    return (name) => {
        if (!siblings) {
            const list = siblingsFn();
            siblings = list ? listToMap(list) : {};
        }
        return !!siblings[name];
    };
}
function listToMap(list) {
    const map = {};
    for (const key of list) {
        map[key] = true;
    }
    return map;
}
export function excludeToGlobPattern(excludesForFolder) {
    return excludesForFolder.flatMap(exclude => exclude.patterns.map(pattern => {
        return exclude.baseUri ?
            {
                baseUri: exclude.baseUri,
                pattern: pattern
            } : pattern;
    }));
}
export const DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS = {
    matchLines: 100,
    charsPerLine: 10000
};
