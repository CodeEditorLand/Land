import { hasDriveLetter, toSlashes } from './extpath.js';
import { posix, sep, win32 } from './path.js';
import { isMacintosh, isWindows, OS } from './platform.js';
import { extUri, extUriIgnorePathCase } from './resources.js';
import { rtrim, startsWithIgnoreCase } from './strings.js';
export function getPathLabel(resource, formatting) {
    const { os, tildify: tildifier, relative: relatifier } = formatting;
    if (relatifier) {
        const relativePath = getRelativePathLabel(resource, relatifier, os);
        if (typeof relativePath === 'string') {
            return relativePath;
        }
    }
    let absolutePath = resource.fsPath;
    if (os === 1 && !isWindows) {
        absolutePath = absolutePath.replace(/\//g, '\\');
    }
    else if (os !== 1 && isWindows) {
        absolutePath = absolutePath.replace(/\\/g, '/');
    }
    if (os !== 1 && tildifier?.userHome) {
        const userHome = tildifier.userHome.fsPath;
        let userHomeCandidate;
        if (resource.scheme !== tildifier.userHome.scheme && resource.path[0] === posix.sep && resource.path[1] !== posix.sep) {
            userHomeCandidate = tildifier.userHome.with({ path: resource.path }).fsPath;
        }
        else {
            userHomeCandidate = absolutePath;
        }
        absolutePath = tildify(userHomeCandidate, userHome, os);
    }
    const pathLib = os === 1 ? win32 : posix;
    return pathLib.normalize(normalizeDriveLetter(absolutePath, os === 1));
}
function getRelativePathLabel(resource, relativePathProvider, os) {
    const pathLib = os === 1 ? win32 : posix;
    const extUriLib = os === 3 ? extUri : extUriIgnorePathCase;
    const workspace = relativePathProvider.getWorkspace();
    const firstFolder = workspace.folders.at(0);
    if (!firstFolder) {
        return undefined;
    }
    if (resource.scheme !== firstFolder.uri.scheme && resource.path[0] === posix.sep && resource.path[1] !== posix.sep) {
        resource = firstFolder.uri.with({ path: resource.path });
    }
    const folder = relativePathProvider.getWorkspaceFolder(resource);
    if (!folder) {
        return undefined;
    }
    let relativePathLabel = undefined;
    if (extUriLib.isEqual(folder.uri, resource)) {
        relativePathLabel = '';
    }
    else {
        relativePathLabel = extUriLib.relativePath(folder.uri, resource) ?? '';
    }
    if (relativePathLabel) {
        relativePathLabel = pathLib.normalize(relativePathLabel);
    }
    if (workspace.folders.length > 1 && !relativePathProvider.noPrefix) {
        const rootName = folder.name ? folder.name : extUriLib.basenameOrAuthority(folder.uri);
        relativePathLabel = relativePathLabel ? `${rootName} • ${relativePathLabel}` : rootName;
    }
    return relativePathLabel;
}
export function normalizeDriveLetter(path, isWindowsOS = isWindows) {
    if (hasDriveLetter(path, isWindowsOS)) {
        return path.charAt(0).toUpperCase() + path.slice(1);
    }
    return path;
}
let normalizedUserHomeCached = Object.create(null);
export function tildify(path, userHome, os = OS) {
    if (os === 1 || !path || !userHome) {
        return path;
    }
    let normalizedUserHome = normalizedUserHomeCached.original === userHome ? normalizedUserHomeCached.normalized : undefined;
    if (!normalizedUserHome) {
        normalizedUserHome = userHome;
        if (isWindows) {
            normalizedUserHome = toSlashes(normalizedUserHome);
        }
        normalizedUserHome = `${rtrim(normalizedUserHome, posix.sep)}${posix.sep}`;
        normalizedUserHomeCached = { original: userHome, normalized: normalizedUserHome };
    }
    let normalizedPath = path;
    if (isWindows) {
        normalizedPath = toSlashes(normalizedPath);
    }
    if (os === 3 ? normalizedPath.startsWith(normalizedUserHome) : startsWithIgnoreCase(normalizedPath, normalizedUserHome)) {
        return `~/${normalizedPath.substr(normalizedUserHome.length)}`;
    }
    return path;
}
export function untildify(path, userHome) {
    return path.replace(/^~($|\/|\\)/, `${userHome}$1`);
}
const ellipsis = '\u2026';
const unc = '\\\\';
const home = '~';
export function shorten(paths, pathSeparator = sep) {
    const shortenedPaths = new Array(paths.length);
    let match = false;
    for (let pathIndex = 0; pathIndex < paths.length; pathIndex++) {
        const originalPath = paths[pathIndex];
        if (originalPath === '') {
            shortenedPaths[pathIndex] = `.${pathSeparator}`;
            continue;
        }
        if (!originalPath) {
            shortenedPaths[pathIndex] = originalPath;
            continue;
        }
        match = true;
        let prefix = '';
        let trimmedPath = originalPath;
        if (trimmedPath.indexOf(unc) === 0) {
            prefix = trimmedPath.substr(0, trimmedPath.indexOf(unc) + unc.length);
            trimmedPath = trimmedPath.substr(trimmedPath.indexOf(unc) + unc.length);
        }
        else if (trimmedPath.indexOf(pathSeparator) === 0) {
            prefix = trimmedPath.substr(0, trimmedPath.indexOf(pathSeparator) + pathSeparator.length);
            trimmedPath = trimmedPath.substr(trimmedPath.indexOf(pathSeparator) + pathSeparator.length);
        }
        else if (trimmedPath.indexOf(home) === 0) {
            prefix = trimmedPath.substr(0, trimmedPath.indexOf(home) + home.length);
            trimmedPath = trimmedPath.substr(trimmedPath.indexOf(home) + home.length);
        }
        const segments = trimmedPath.split(pathSeparator);
        for (let subpathLength = 1; match && subpathLength <= segments.length; subpathLength++) {
            for (let start = segments.length - subpathLength; match && start >= 0; start--) {
                match = false;
                let subpath = segments.slice(start, start + subpathLength).join(pathSeparator);
                for (let otherPathIndex = 0; !match && otherPathIndex < paths.length; otherPathIndex++) {
                    if (otherPathIndex !== pathIndex && paths[otherPathIndex] && paths[otherPathIndex].indexOf(subpath) > -1) {
                        const isSubpathEnding = (start + subpathLength === segments.length);
                        const subpathWithSep = (start > 0 && paths[otherPathIndex].indexOf(pathSeparator) > -1) ? pathSeparator + subpath : subpath;
                        const isOtherPathEnding = paths[otherPathIndex].endsWith(subpathWithSep);
                        match = !isSubpathEnding || isOtherPathEnding;
                    }
                }
                if (!match) {
                    let result = '';
                    if (segments[0].endsWith(':') || prefix !== '') {
                        if (start === 1) {
                            start = 0;
                            subpathLength++;
                            subpath = segments[0] + pathSeparator + subpath;
                        }
                        if (start > 0) {
                            result = segments[0] + pathSeparator;
                        }
                        result = prefix + result;
                    }
                    if (start > 0) {
                        result = result + ellipsis + pathSeparator;
                    }
                    result = result + subpath;
                    if (start + subpathLength < segments.length) {
                        result = result + pathSeparator + ellipsis;
                    }
                    shortenedPaths[pathIndex] = result;
                }
            }
        }
        if (match) {
            shortenedPaths[pathIndex] = originalPath;
        }
    }
    return shortenedPaths;
}
var Type;
(function (Type) {
    Type[Type["TEXT"] = 0] = "TEXT";
    Type[Type["VARIABLE"] = 1] = "VARIABLE";
    Type[Type["SEPARATOR"] = 2] = "SEPARATOR";
})(Type || (Type = {}));
export function template(template, values = Object.create(null)) {
    const segments = [];
    let inVariable = false;
    let curVal = '';
    for (const char of template) {
        if (char === '$' || (inVariable && char === '{')) {
            if (curVal) {
                segments.push({ value: curVal, type: Type.TEXT });
            }
            curVal = '';
            inVariable = true;
        }
        else if (char === '}' && inVariable) {
            const resolved = values[curVal];
            if (typeof resolved === 'string') {
                if (resolved.length) {
                    segments.push({ value: resolved, type: Type.VARIABLE });
                }
            }
            else if (resolved) {
                const prevSegment = segments[segments.length - 1];
                if (!prevSegment || prevSegment.type !== Type.SEPARATOR) {
                    segments.push({ value: resolved.label, type: Type.SEPARATOR });
                }
            }
            curVal = '';
            inVariable = false;
        }
        else {
            curVal += char;
        }
    }
    if (curVal && !inVariable) {
        segments.push({ value: curVal, type: Type.TEXT });
    }
    return segments.filter((segment, index) => {
        if (segment.type === Type.SEPARATOR) {
            const left = segments[index - 1];
            const right = segments[index + 1];
            return [left, right].every(segment => segment && (segment.type === Type.VARIABLE || segment.type === Type.TEXT) && segment.value.length > 0);
        }
        return true;
    }).map(segment => segment.value).join('');
}
export function mnemonicMenuLabel(label, forceDisableMnemonics) {
    if (isMacintosh || forceDisableMnemonics) {
        return label.replace(/\(&&\w\)|&&/g, '').replace(/&/g, isMacintosh ? '&' : '&&');
    }
    return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
}
export function mnemonicButtonLabel(label, forceDisableMnemonics) {
    if (isMacintosh || forceDisableMnemonics) {
        return label.replace(/\(&&\w\)|&&/g, '');
    }
    if (isWindows) {
        return label.replace(/&&|&/g, m => m === '&' ? '&&' : '&');
    }
    return label.replace(/&&/g, '_');
}
export function unmnemonicLabel(label) {
    return label.replace(/&/g, '&&');
}
export function splitRecentLabel(recentLabel) {
    if (recentLabel.endsWith(']')) {
        const lastIndexOfSquareBracket = recentLabel.lastIndexOf(' [', recentLabel.length - 2);
        if (lastIndexOfSquareBracket !== -1) {
            const split = splitName(recentLabel.substring(0, lastIndexOfSquareBracket));
            const remoteNameWithSpace = recentLabel.substring(lastIndexOfSquareBracket);
            return { name: split.name + remoteNameWithSpace, parentPath: split.parentPath };
        }
    }
    return splitName(recentLabel);
}
function splitName(fullPath) {
    const p = fullPath.indexOf('/') !== -1 ? posix : win32;
    const name = p.basename(fullPath);
    const parentPath = p.dirname(fullPath);
    if (name.length) {
        return { name, parentPath };
    }
    return { name: parentPath, parentPath: '' };
}
