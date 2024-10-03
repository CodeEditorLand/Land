const nodeReq = (module) => {
    if (typeof require.__$__nodeRequire === 'function') {
        return require.__$__nodeRequire(module);
    }
    return undefined;
};
const fs = nodeReq('fs');
const path = nodeReq('path');
let inlineResources = false;
let inlineResourcesLimit = 5000;
const contentsMap = {};
const pathMap = {};
const entryPoints = {};
const inlinedResources = [];
export function load(name, req, load, config) {
    if (!fs) {
        throw new Error(`Cannot load files without 'fs'!`);
    }
    config = config || {};
    const myConfig = (config['vs/css'] || {});
    inlineResources = (typeof myConfig.inlineResources === 'undefined' ? false : myConfig.inlineResources);
    inlineResourcesLimit = (myConfig.inlineResourcesLimit || 5000);
    const cssUrl = req.toUrl(name + '.css');
    let contents = fs.readFileSync(cssUrl, 'utf8');
    if (contents.charCodeAt(0) === 65279) {
        contents = contents.substring(1);
    }
    if (config.isBuild) {
        contentsMap[name] = contents;
        pathMap[name] = cssUrl;
    }
    load({});
}
export function write(pluginName, moduleName, write) {
    const entryPoint = write.getEntryPoint();
    entryPoints[entryPoint] = entryPoints[entryPoint] || [];
    entryPoints[entryPoint].push({
        moduleName: moduleName,
        contents: contentsMap[moduleName],
        fsPath: pathMap[moduleName],
    });
    write.asModule(pluginName + '!' + moduleName, 'define([\'vs/css!' + entryPoint + '\'], {});');
}
export function writeFile(pluginName, moduleName, req, write, config) {
    if (entryPoints && entryPoints.hasOwnProperty(moduleName)) {
        const fileName = req.toUrl(moduleName + '.css');
        const contents = [
            '/*---------------------------------------------------------',
            ' * Copyright (c) Microsoft Corporation. All rights reserved.',
            ' *--------------------------------------------------------*/'
        ], entries = entryPoints[moduleName];
        for (let i = 0; i < entries.length; i++) {
            if (inlineResources) {
                contents.push(rewriteOrInlineUrls(entries[i].fsPath, entries[i].moduleName, moduleName, entries[i].contents, inlineResources === 'base64', inlineResourcesLimit));
            }
            else {
                contents.push(rewriteUrls(entries[i].moduleName, moduleName, entries[i].contents));
            }
        }
        write(fileName, contents.join('\r\n'));
    }
}
export function getInlinedResources() {
    return inlinedResources || [];
}
function rewriteOrInlineUrls(originalFileFSPath, originalFile, newFile, contents, forceBase64, inlineByteLimit) {
    if (!fs || !path) {
        throw new Error(`Cannot rewrite or inline urls without 'fs' or 'path'!`);
    }
    return CSSPluginUtilities.replaceURL(contents, (url) => {
        if (/\.(svg|png)$/.test(url)) {
            const fsPath = path.join(path.dirname(originalFileFSPath), url);
            const fileContents = fs.readFileSync(fsPath);
            if (fileContents.length < inlineByteLimit) {
                const normalizedFSPath = fsPath.replace(/\\/g, '/');
                inlinedResources.push(normalizedFSPath);
                const MIME = /\.svg$/.test(url) ? 'image/svg+xml' : 'image/png';
                let DATA = ';base64,' + fileContents.toString('base64');
                if (!forceBase64 && /\.svg$/.test(url)) {
                    const newText = fileContents.toString()
                        .replace(/"/g, '\'')
                        .replace(/%/g, '%25')
                        .replace(/</g, '%3C')
                        .replace(/>/g, '%3E')
                        .replace(/&/g, '%26')
                        .replace(/#/g, '%23')
                        .replace(/\s+/g, ' ');
                    const encodedData = ',' + newText;
                    if (encodedData.length < DATA.length) {
                        DATA = encodedData;
                    }
                }
                return '"data:' + MIME + DATA + '"';
            }
        }
        const absoluteUrl = CSSPluginUtilities.joinPaths(CSSPluginUtilities.pathOf(originalFile), url);
        return CSSPluginUtilities.relativePath(newFile, absoluteUrl);
    });
}
export function rewriteUrls(originalFile, newFile, contents) {
    return CSSPluginUtilities.replaceURL(contents, (url) => {
        const absoluteUrl = CSSPluginUtilities.joinPaths(CSSPluginUtilities.pathOf(originalFile), url);
        return CSSPluginUtilities.relativePath(newFile, absoluteUrl);
    });
}
export class CSSPluginUtilities {
    static startsWith(haystack, needle) {
        return haystack.length >= needle.length && haystack.substr(0, needle.length) === needle;
    }
    static pathOf(filename) {
        const lastSlash = filename.lastIndexOf('/');
        if (lastSlash !== -1) {
            return filename.substr(0, lastSlash + 1);
        }
        else {
            return '';
        }
    }
    static joinPaths(a, b) {
        function findSlashIndexAfterPrefix(haystack, prefix) {
            if (CSSPluginUtilities.startsWith(haystack, prefix)) {
                return Math.max(prefix.length, haystack.indexOf('/', prefix.length));
            }
            return 0;
        }
        let aPathStartIndex = 0;
        aPathStartIndex = aPathStartIndex || findSlashIndexAfterPrefix(a, '//');
        aPathStartIndex = aPathStartIndex || findSlashIndexAfterPrefix(a, 'http://');
        aPathStartIndex = aPathStartIndex || findSlashIndexAfterPrefix(a, 'https://');
        function pushPiece(pieces, piece) {
            if (piece === './') {
                return;
            }
            if (piece === '../') {
                const prevPiece = (pieces.length > 0 ? pieces[pieces.length - 1] : null);
                if (prevPiece && prevPiece === '/') {
                    return;
                }
                if (prevPiece && prevPiece !== '../') {
                    pieces.pop();
                    return;
                }
            }
            pieces.push(piece);
        }
        function push(pieces, path) {
            while (path.length > 0) {
                const slashIndex = path.indexOf('/');
                const piece = (slashIndex >= 0 ? path.substring(0, slashIndex + 1) : path);
                path = (slashIndex >= 0 ? path.substring(slashIndex + 1) : '');
                pushPiece(pieces, piece);
            }
        }
        let pieces = [];
        push(pieces, a.substr(aPathStartIndex));
        if (b.length > 0 && b.charAt(0) === '/') {
            pieces = [];
        }
        push(pieces, b);
        return a.substring(0, aPathStartIndex) + pieces.join('');
    }
    static commonPrefix(str1, str2) {
        const len = Math.min(str1.length, str2.length);
        for (let i = 0; i < len; i++) {
            if (str1.charCodeAt(i) !== str2.charCodeAt(i)) {
                return str1.substring(0, i);
            }
        }
        return str1.substring(0, len);
    }
    static commonFolderPrefix(fromPath, toPath) {
        const prefix = CSSPluginUtilities.commonPrefix(fromPath, toPath);
        const slashIndex = prefix.lastIndexOf('/');
        if (slashIndex === -1) {
            return '';
        }
        return prefix.substring(0, slashIndex + 1);
    }
    static relativePath(fromPath, toPath) {
        if (CSSPluginUtilities.startsWith(toPath, '/') || CSSPluginUtilities.startsWith(toPath, 'http://') || CSSPluginUtilities.startsWith(toPath, 'https://')) {
            return toPath;
        }
        const prefix = CSSPluginUtilities.commonFolderPrefix(fromPath, toPath);
        fromPath = fromPath.substr(prefix.length);
        toPath = toPath.substr(prefix.length);
        const upCount = fromPath.split('/').length;
        let result = '';
        for (let i = 1; i < upCount; i++) {
            result += '../';
        }
        return result + toPath;
    }
    static replaceURL(contents, replacer) {
        return contents.replace(/url\(\s*([^\)]+)\s*\)?/g, (_, ...matches) => {
            let url = matches[0];
            if (url.charAt(0) === '"' || url.charAt(0) === '\'') {
                url = url.substring(1);
            }
            while (url.length > 0 && (url.charAt(url.length - 1) === ' ' || url.charAt(url.length - 1) === '\t')) {
                url = url.substring(0, url.length - 1);
            }
            if (url.charAt(url.length - 1) === '"' || url.charAt(url.length - 1) === '\'') {
                url = url.substring(0, url.length - 1);
            }
            if (!CSSPluginUtilities.startsWith(url, 'data:') && !CSSPluginUtilities.startsWith(url, 'http://') && !CSSPluginUtilities.startsWith(url, 'https://')) {
                url = replacer(url);
            }
            return 'url(' + url + ')';
        });
    }
}
