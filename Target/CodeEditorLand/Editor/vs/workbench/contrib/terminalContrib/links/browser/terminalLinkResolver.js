var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { removeLinkSuffix, removeLinkQueryString, winDrivePrefix } from './terminalLinkParsing.js';
import { URI } from '../../../../../base/common/uri.js';
import { Schemas } from '../../../../../base/common/network.js';
import { isWindows, OS } from '../../../../../base/common/platform.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { posix, win32 } from '../../../../../base/common/path.js';
import { mainWindow } from '../../../../../base/browser/window.js';
let TerminalLinkResolver = class TerminalLinkResolver {
    constructor(_fileService) {
        this._fileService = _fileService;
        this._resolvedLinkCaches = new Map();
    }
    async resolveLink(processManager, link, uri) {
        if (uri && uri.scheme === Schemas.file && processManager.remoteAuthority) {
            uri = uri.with({
                scheme: Schemas.vscodeRemote,
                authority: processManager.remoteAuthority
            });
        }
        let cache = this._resolvedLinkCaches.get(processManager.remoteAuthority ?? '');
        if (!cache) {
            cache = new LinkCache();
            this._resolvedLinkCaches.set(processManager.remoteAuthority ?? '', cache);
        }
        const cached = cache.get(uri || link);
        if (cached !== undefined) {
            return cached;
        }
        if (uri) {
            try {
                const stat = await this._fileService.stat(uri);
                const result = { uri, link, isDirectory: stat.isDirectory };
                cache.set(uri, result);
                return result;
            }
            catch (e) {
                cache.set(uri, null);
                return null;
            }
        }
        let linkUrl = removeLinkSuffix(link);
        linkUrl = removeLinkQueryString(linkUrl);
        if (linkUrl.length === 0) {
            cache.set(link, null);
            return null;
        }
        if (isWindows && link.match(/^\/mnt\/[a-z]/i) && processManager.backend) {
            linkUrl = await processManager.backend.getWslPath(linkUrl, 'unix-to-win');
        }
        else if (isWindows && link.match(/^(?:\/\/|\\\\)wsl(?:\$|\.localhost)(\/|\\)/)) {
        }
        else {
            const preprocessedLink = this._preprocessPath(linkUrl, processManager.initialCwd, processManager.os, processManager.userHome);
            if (!preprocessedLink) {
                cache.set(link, null);
                return null;
            }
            linkUrl = preprocessedLink;
        }
        try {
            let uri;
            if (processManager.remoteAuthority) {
                uri = URI.from({
                    scheme: Schemas.vscodeRemote,
                    authority: processManager.remoteAuthority,
                    path: linkUrl
                });
            }
            else {
                uri = URI.file(linkUrl);
            }
            try {
                const stat = await this._fileService.stat(uri);
                const result = { uri, link, isDirectory: stat.isDirectory };
                cache.set(link, result);
                return result;
            }
            catch (e) {
                cache.set(link, null);
                return null;
            }
        }
        catch {
            cache.set(link, null);
            return null;
        }
    }
    _preprocessPath(link, initialCwd, os, userHome) {
        const osPath = this._getOsPath(os);
        if (link.charAt(0) === '~') {
            if (!userHome) {
                return null;
            }
            link = osPath.join(userHome, link.substring(1));
        }
        else if (link.charAt(0) !== '/' && link.charAt(0) !== '~') {
            if (os === 1) {
                if (!link.match('^' + winDrivePrefix) && !link.startsWith('\\\\?\\')) {
                    if (!initialCwd) {
                        return null;
                    }
                    link = osPath.join(initialCwd, link);
                }
                else {
                    link = link.replace(/^\\\\\?\\/, '');
                }
            }
            else {
                if (!initialCwd) {
                    return null;
                }
                link = osPath.join(initialCwd, link);
            }
        }
        link = osPath.normalize(link);
        return link;
    }
    _getOsPath(os) {
        return (os ?? OS) === 1 ? win32 : posix;
    }
};
TerminalLinkResolver = __decorate([
    __param(0, IFileService),
    __metadata("design:paramtypes", [Object])
], TerminalLinkResolver);
export { TerminalLinkResolver };
class LinkCache {
    constructor() {
        this._cache = new Map();
        this._cacheTilTimeout = 0;
    }
    set(link, value) {
        if (this._cacheTilTimeout) {
            mainWindow.clearTimeout(this._cacheTilTimeout);
        }
        this._cacheTilTimeout = mainWindow.setTimeout(() => this._cache.clear(), 10000);
        this._cache.set(this._getKey(link), value);
    }
    get(link) {
        return this._cache.get(this._getKey(link));
    }
    _getKey(link) {
        if (URI.isUri(link)) {
            return link.toString();
        }
        return link;
    }
}
