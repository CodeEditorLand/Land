/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { getWindow } from '../../../../base/browser/dom.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { Schemas } from '../../../../base/common/network.js';
import * as osPath from '../../../../base/common/path.js';
import * as platform from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITunnelService } from '../../../../platform/tunnel/common/tunnel.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IPathService } from '../../../services/path/common/pathService.js';
const CONTROL_CODES = '\\u0000-\\u0020\\u007f-\\u009f';
const WEB_LINK_REGEX = new RegExp('(?:[a-zA-Z][a-zA-Z0-9+.-]{2,}:\\/\\/|data:|www\\.)[^\\s' + CONTROL_CODES + '"]{2,}[^\\s' + CONTROL_CODES + '"\')}\\],:;.!?]', 'ug');
const WIN_ABSOLUTE_PATH = /(?:[a-zA-Z]:(?:(?:\\|\/)[\w\.-]*)+)/;
const WIN_RELATIVE_PATH = /(?:(?:\~|\.)(?:(?:\\|\/)[\w\.-]*)+)/;
const WIN_PATH = new RegExp(`(${WIN_ABSOLUTE_PATH.source}|${WIN_RELATIVE_PATH.source})`);
const POSIX_PATH = /((?:\~|\.)?(?:\/[\w\.-]*)+)/;
const LINE_COLUMN = /(?:\:([\d]+))?(?:\:([\d]+))?/;
const PATH_LINK_REGEX = new RegExp(`${platform.isWindows ? WIN_PATH.source : POSIX_PATH.source}${LINE_COLUMN.source}`, 'g');
const LINE_COLUMN_REGEX = /:([\d]+)(?::([\d]+))?$/;
const MAX_LENGTH = 2000;
let LinkDetector = class LinkDetector {
    constructor(editorService, fileService, openerService, pathService, tunnelService, environmentService, configurationService, hoverService) {
        this.editorService = editorService;
        this.fileService = fileService;
        this.openerService = openerService;
        this.pathService = pathService;
        this.tunnelService = tunnelService;
        this.environmentService = environmentService;
        this.configurationService = configurationService;
        this.hoverService = hoverService;
        // noop
    }
    /**
     * Matches and handles web urls, absolute and relative file links in the string provided.
     * Returns <span/> element that wraps the processed string, where matched links are replaced by <a/>.
     * 'onclick' event is attached to all anchored links that opens them in the editor.
     * When splitLines is true, each line of the text, even if it contains no links, is wrapped in a <span>
     * and added as a child of the returned <span>.
     * If a `hoverBehavior` is passed, hovers may be added using the workbench hover service.
     * This should be preferred for new code where hovers are desirable.
     */
    linkify(text, splitLines, workspaceFolder, includeFulltext, hoverBehavior) {
        return this._linkify(text, splitLines, workspaceFolder, includeFulltext, hoverBehavior);
    }
    _linkify(text, splitLines, workspaceFolder, includeFulltext, hoverBehavior, defaultRef) {
        if (splitLines) {
            const lines = text.split('\n');
            for (let i = 0; i < lines.length - 1; i++) {
                lines[i] = lines[i] + '\n';
            }
            if (!lines[lines.length - 1]) {
                // Remove the last element ('') that split added.
                lines.pop();
            }
            const elements = lines.map(line => this._linkify(line, false, workspaceFolder, includeFulltext, hoverBehavior, defaultRef));
            if (elements.length === 1) {
                // Do not wrap single line with extra span.
                return elements[0];
            }
            const container = document.createElement('span');
            elements.forEach(e => container.appendChild(e));
            return container;
        }
        const container = document.createElement('span');
        for (const part of this.detectLinks(text)) {
            try {
                switch (part.kind) {
                    case 'text':
                        container.appendChild(defaultRef ? this.linkifyLocation(part.value, defaultRef.locationReference, defaultRef.session, hoverBehavior) : document.createTextNode(part.value));
                        break;
                    case 'web':
                        container.appendChild(this.createWebLink(includeFulltext ? text : undefined, part.value, hoverBehavior));
                        break;
                    case 'path': {
                        const path = part.captures[0];
                        const lineNumber = part.captures[1] ? Number(part.captures[1]) : 0;
                        const columnNumber = part.captures[2] ? Number(part.captures[2]) : 0;
                        container.appendChild(this.createPathLink(includeFulltext ? text : undefined, part.value, path, lineNumber, columnNumber, workspaceFolder, hoverBehavior));
                        break;
                    }
                }
            }
            catch (e) {
                container.appendChild(document.createTextNode(part.value));
            }
        }
        return container;
    }
    /**
     * Linkifies a location reference.
     */
    linkifyLocation(text, locationReference, session, hoverBehavior) {
        const link = this.createLink(text);
        this.decorateLink(link, undefined, text, hoverBehavior, async (preserveFocus) => {
            const location = await session.resolveLocationReference(locationReference);
            await location.source.openInEditor(this.editorService, {
                startLineNumber: location.line,
                startColumn: location.column,
                endLineNumber: location.endLine ?? location.line,
                endColumn: location.endColumn ?? location.column,
            }, preserveFocus);
        });
        return link;
    }
    /**
     * Makes an {@link ILinkDetector} that links everything in the output to the
     * reference if they don't have other explicit links.
     */
    makeReferencedLinkDetector(locationReference, session) {
        return {
            linkify: (text, splitLines, workspaceFolder, includeFulltext, hoverBehavior) => this._linkify(text, splitLines, workspaceFolder, includeFulltext, hoverBehavior, { locationReference, session }),
            linkifyLocation: this.linkifyLocation.bind(this),
        };
    }
    createWebLink(fulltext, url, hoverBehavior) {
        const link = this.createLink(url);
        let uri = URI.parse(url);
        // if the URI ends with something like `foo.js:12:3`, parse
        // that into a fragment to reveal that location (#150702)
        const lineCol = LINE_COLUMN_REGEX.exec(uri.path);
        if (lineCol) {
            uri = uri.with({
                path: uri.path.slice(0, lineCol.index),
                fragment: `L${lineCol[0].slice(1)}`
            });
        }
        this.decorateLink(link, uri, fulltext, hoverBehavior, async () => {
            if (uri.scheme === Schemas.file) {
                // Just using fsPath here is unsafe: https://github.com/microsoft/vscode/issues/109076
                const fsPath = uri.fsPath;
                const path = await this.pathService.path;
                const fileUrl = osPath.normalize(((path.sep === osPath.posix.sep) && platform.isWindows) ? fsPath.replace(/\\/g, osPath.posix.sep) : fsPath);
                const fileUri = URI.parse(fileUrl);
                const exists = await this.fileService.exists(fileUri);
                if (!exists) {
                    return;
                }
                await this.editorService.openEditor({
                    resource: fileUri,
                    options: {
                        pinned: true,
                        selection: lineCol ? { startLineNumber: +lineCol[1], startColumn: +lineCol[2] } : undefined,
                    },
                });
                return;
            }
            this.openerService.open(url, { allowTunneling: (!!this.environmentService.remoteAuthority && this.configurationService.getValue('remote.forwardOnOpen')) });
        });
        return link;
    }
    createPathLink(fulltext, text, path, lineNumber, columnNumber, workspaceFolder, hoverBehavior) {
        if (path[0] === '/' && path[1] === '/') {
            // Most likely a url part which did not match, for example ftp://path.
            return document.createTextNode(text);
        }
        const options = { selection: { startLineNumber: lineNumber, startColumn: columnNumber } };
        if (path[0] === '.') {
            if (!workspaceFolder) {
                return document.createTextNode(text);
            }
            const uri = workspaceFolder.toResource(path);
            const link = this.createLink(text);
            this.decorateLink(link, uri, fulltext, hoverBehavior, (preserveFocus) => this.editorService.openEditor({ resource: uri, options: { ...options, preserveFocus } }));
            return link;
        }
        if (path[0] === '~') {
            const userHome = this.pathService.resolvedUserHome;
            if (userHome) {
                path = osPath.join(userHome.fsPath, path.substring(1));
            }
        }
        const link = this.createLink(text);
        link.tabIndex = 0;
        const uri = URI.file(osPath.normalize(path));
        this.fileService.stat(uri).then(stat => {
            if (stat.isDirectory) {
                return;
            }
            this.decorateLink(link, uri, fulltext, hoverBehavior, (preserveFocus) => this.editorService.openEditor({ resource: uri, options: { ...options, preserveFocus } }));
        }).catch(() => {
            // If the uri can not be resolved we should not spam the console with error, remain quite #86587
        });
        return link;
    }
    createLink(text) {
        const link = document.createElement('a');
        link.textContent = text;
        return link;
    }
    decorateLink(link, uri, fulltext, hoverBehavior, onClick) {
        link.classList.add('link');
        const followLink = uri && this.tunnelService.canTunnel(uri) ? localize('followForwardedLink', "follow link using forwarded port") : localize('followLink', "follow link");
        const title = link.ariaLabel = fulltext
            ? (platform.isMacintosh ? localize('fileLinkWithPathMac', "Cmd + click to {0}\n{1}", followLink, fulltext) : localize('fileLinkWithPath', "Ctrl + click to {0}\n{1}", followLink, fulltext))
            : (platform.isMacintosh ? localize('fileLinkMac', "Cmd + click to {0}", followLink) : localize('fileLink', "Ctrl + click to {0}", followLink));
        if (hoverBehavior?.type === 0 /* DebugLinkHoverBehavior.Rich */) {
            hoverBehavior.store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('element'), link, title));
        }
        else if (hoverBehavior?.type !== 2 /* DebugLinkHoverBehavior.None */) {
            link.title = title;
        }
        link.onmousemove = (event) => { link.classList.toggle('pointer', platform.isMacintosh ? event.metaKey : event.ctrlKey); };
        link.onmouseleave = () => link.classList.remove('pointer');
        link.onclick = (event) => {
            const selection = getWindow(link).getSelection();
            if (!selection || selection.type === 'Range') {
                return; // do not navigate when user is selecting
            }
            if (!(platform.isMacintosh ? event.metaKey : event.ctrlKey)) {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            onClick(false);
        };
        link.onkeydown = e => {
            const event = new StandardKeyboardEvent(e);
            if (event.keyCode === 3 /* KeyCode.Enter */ || event.keyCode === 10 /* KeyCode.Space */) {
                event.preventDefault();
                event.stopPropagation();
                onClick(event.keyCode === 10 /* KeyCode.Space */);
            }
        };
    }
    detectLinks(text) {
        if (text.length > MAX_LENGTH) {
            return [{ kind: 'text', value: text, captures: [] }];
        }
        const regexes = [WEB_LINK_REGEX, PATH_LINK_REGEX];
        const kinds = ['web', 'path'];
        const result = [];
        const splitOne = (text, regexIndex) => {
            if (regexIndex >= regexes.length) {
                result.push({ value: text, kind: 'text', captures: [] });
                return;
            }
            const regex = regexes[regexIndex];
            let currentIndex = 0;
            let match;
            regex.lastIndex = 0;
            while ((match = regex.exec(text)) !== null) {
                const stringBeforeMatch = text.substring(currentIndex, match.index);
                if (stringBeforeMatch) {
                    splitOne(stringBeforeMatch, regexIndex + 1);
                }
                const value = match[0];
                result.push({
                    value: value,
                    kind: kinds[regexIndex],
                    captures: match.slice(1)
                });
                currentIndex = match.index + value.length;
            }
            const stringAfterMatches = text.substring(currentIndex);
            if (stringAfterMatches) {
                splitOne(stringAfterMatches, regexIndex + 1);
            }
        };
        splitOne(text, 0);
        return result;
    }
};
LinkDetector = __decorate([
    __param(0, IEditorService),
    __param(1, IFileService),
    __param(2, IOpenerService),
    __param(3, IPathService),
    __param(4, ITunnelService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, IConfigurationService),
    __param(7, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], LinkDetector);
export { LinkDetector };
