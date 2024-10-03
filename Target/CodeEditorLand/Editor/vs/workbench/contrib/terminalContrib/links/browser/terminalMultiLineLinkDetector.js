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
import { IUriIdentityService } from '../../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceContextService } from '../../../../../platform/workspace/common/workspace.js';
import { convertLinkRangeToBuffer, getXtermLineContent } from './terminalLinkHelpers.js';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
const lineNumberPrefixMatchers = [
    /^ *(?<link>(?<line>\d+):(?<col>\d+)?)/
];
const gitDiffMatchers = [
    /^(?<link>@@ .+ \+(?<toFileLine>\d+),(?<toFileCount>\d+) @@)/
];
let TerminalMultiLineLinkDetector = class TerminalMultiLineLinkDetector {
    static { this.id = 'multiline'; }
    constructor(xterm, _processManager, _linkResolver, _logService, _uriIdentityService, _workspaceContextService) {
        this.xterm = xterm;
        this._processManager = _processManager;
        this._linkResolver = _linkResolver;
        this._logService = _logService;
        this._uriIdentityService = _uriIdentityService;
        this._workspaceContextService = _workspaceContextService;
        this.maxLinkLength = 500;
    }
    async detect(lines, startLine, endLine) {
        const links = [];
        const text = getXtermLineContent(this.xterm.buffer.active, startLine, endLine, this.xterm.cols);
        if (text === '' || text.length > 2000) {
            return [];
        }
        this._logService.trace('terminalMultiLineLinkDetector#detect text', text);
        for (const matcher of lineNumberPrefixMatchers) {
            const match = text.match(matcher);
            const group = match?.groups;
            if (!group) {
                continue;
            }
            const link = group?.link;
            const line = group?.line;
            const col = group?.col;
            if (!link || line === undefined) {
                continue;
            }
            if (link.length > 1024) {
                continue;
            }
            this._logService.trace('terminalMultiLineLinkDetector#detect candidate', link);
            let possiblePath;
            for (let index = startLine - 1; index >= 0; index--) {
                if (this.xterm.buffer.active.getLine(index).isWrapped) {
                    continue;
                }
                const text = getXtermLineContent(this.xterm.buffer.active, index, index, this.xterm.cols);
                if (!text.match(/^\s*\d/)) {
                    possiblePath = text;
                    break;
                }
            }
            if (!possiblePath) {
                continue;
            }
            const linkStat = await this._linkResolver.resolveLink(this._processManager, possiblePath);
            if (linkStat) {
                let type;
                if (linkStat.isDirectory) {
                    if (this._isDirectoryInsideWorkspace(linkStat.uri)) {
                        type = "LocalFolderInWorkspace";
                    }
                    else {
                        type = "LocalFolderOutsideWorkspace";
                    }
                }
                else {
                    type = "LocalFile";
                }
                const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
                    startColumn: 1,
                    startLineNumber: 1,
                    endColumn: 1 + text.length,
                    endLineNumber: 1
                }, startLine);
                const simpleLink = {
                    text: link,
                    uri: linkStat.uri,
                    selection: {
                        startLineNumber: parseInt(line),
                        startColumn: col ? parseInt(col) : 1
                    },
                    disableTrimColon: true,
                    bufferRange: bufferRange,
                    type
                };
                this._logService.trace('terminalMultiLineLinkDetector#detect verified link', simpleLink);
                links.push(simpleLink);
                break;
            }
        }
        if (links.length === 0) {
            for (const matcher of gitDiffMatchers) {
                const match = text.match(matcher);
                const group = match?.groups;
                if (!group) {
                    continue;
                }
                const link = group?.link;
                const toFileLine = group?.toFileLine;
                const toFileCount = group?.toFileCount;
                if (!link || toFileLine === undefined) {
                    continue;
                }
                if (link.length > 1024) {
                    continue;
                }
                this._logService.trace('terminalMultiLineLinkDetector#detect candidate', link);
                let possiblePath;
                for (let index = startLine - 1; index >= 0; index--) {
                    if (this.xterm.buffer.active.getLine(index).isWrapped) {
                        continue;
                    }
                    const text = getXtermLineContent(this.xterm.buffer.active, index, index, this.xterm.cols);
                    const match = text.match(/\+\+\+ b\/(?<path>.+)/);
                    if (match) {
                        possiblePath = match.groups?.path;
                        break;
                    }
                }
                if (!possiblePath) {
                    continue;
                }
                const linkStat = await this._linkResolver.resolveLink(this._processManager, possiblePath);
                if (linkStat) {
                    let type;
                    if (linkStat.isDirectory) {
                        if (this._isDirectoryInsideWorkspace(linkStat.uri)) {
                            type = "LocalFolderInWorkspace";
                        }
                        else {
                            type = "LocalFolderOutsideWorkspace";
                        }
                    }
                    else {
                        type = "LocalFile";
                    }
                    const bufferRange = convertLinkRangeToBuffer(lines, this.xterm.cols, {
                        startColumn: 1,
                        startLineNumber: 1,
                        endColumn: 1 + link.length,
                        endLineNumber: 1
                    }, startLine);
                    const simpleLink = {
                        text: link,
                        uri: linkStat.uri,
                        selection: {
                            startLineNumber: parseInt(toFileLine),
                            startColumn: 1,
                            endLineNumber: parseInt(toFileLine) + parseInt(toFileCount)
                        },
                        bufferRange: bufferRange,
                        type
                    };
                    this._logService.trace('terminalMultiLineLinkDetector#detect verified link', simpleLink);
                    links.push(simpleLink);
                    break;
                }
            }
        }
        return links;
    }
    _isDirectoryInsideWorkspace(uri) {
        const folders = this._workspaceContextService.getWorkspace().folders;
        for (let i = 0; i < folders.length; i++) {
            if (this._uriIdentityService.extUri.isEqualOrParent(uri, folders[i].uri)) {
                return true;
            }
        }
        return false;
    }
};
TerminalMultiLineLinkDetector = __decorate([
    __param(3, ITerminalLogService),
    __param(4, IUriIdentityService),
    __param(5, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], TerminalMultiLineLinkDetector);
export { TerminalMultiLineLinkDetector };
