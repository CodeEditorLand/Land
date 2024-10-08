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
import { EventType } from '../../../../../base/browser/dom.js';
import { MarkdownString } from '../../../../../base/common/htmlContent.js';
import { DisposableStore, dispose, toDisposable } from '../../../../../base/common/lifecycle.js';
import { isMacintosh, OS } from '../../../../../base/common/platform.js';
import { URI } from '../../../../../base/common/uri.js';
import * as nls from '../../../../../nls.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITunnelService } from '../../../../../platform/tunnel/common/tunnel.js';
import { TerminalExternalLinkDetector } from './terminalExternalLinkDetector.js';
import { TerminalLinkDetectorAdapter } from './terminalLinkDetectorAdapter.js';
import { TerminalLocalFileLinkOpener, TerminalLocalFolderInWorkspaceLinkOpener, TerminalLocalFolderOutsideWorkspaceLinkOpener, TerminalSearchLinkOpener, TerminalUrlLinkOpener } from './terminalLinkOpeners.js';
import { TerminalLocalLinkDetector } from './terminalLocalLinkDetector.js';
import { TerminalUriLinkDetector } from './terminalUriLinkDetector.js';
import { TerminalWordLinkDetector } from './terminalWordLinkDetector.js';
import { ITerminalConfigurationService, TerminalLinkQuickPickEvent } from '../../../terminal/browser/terminal.js';
import { TerminalHover } from '../../../terminal/browser/widgets/terminalHoverWidget.js';
import { TERMINAL_CONFIG_SECTION } from '../../../terminal/common/terminal.js';
import { convertBufferRangeToViewport } from './terminalLinkHelpers.js';
import { RunOnceScheduler } from '../../../../../base/common/async.js';
import { ITerminalLogService } from '../../../../../platform/terminal/common/terminal.js';
import { TerminalMultiLineLinkDetector } from './terminalMultiLineLinkDetector.js';
import { INotificationService, Severity } from '../../../../../platform/notification/common/notification.js';
/**
 * An object responsible for managing registration of link matchers and link providers.
 */
let TerminalLinkManager = class TerminalLinkManager extends DisposableStore {
    constructor(_xterm, _processInfo, capabilities, _linkResolver, _configurationService, _instantiationService, notificationService, terminalConfigurationService, _logService, _tunnelService) {
        super();
        this._xterm = _xterm;
        this._processInfo = _processInfo;
        this._linkResolver = _linkResolver;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._logService = _logService;
        this._tunnelService = _tunnelService;
        this._standardLinkProviders = new Map();
        this._linkProvidersDisposables = [];
        this._externalLinkProviders = [];
        this._openers = new Map();
        let enableFileLinks = true;
        const enableFileLinksConfig = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).enableFileLinks;
        switch (enableFileLinksConfig) {
            case 'off':
            case false: // legacy from v1.75
                enableFileLinks = false;
                break;
            case 'notRemote':
                enableFileLinks = !this._processInfo.remoteAuthority;
                break;
        }
        // Setup link detectors in their order of priority
        if (enableFileLinks) {
            this._setupLinkDetector(TerminalMultiLineLinkDetector.id, this._instantiationService.createInstance(TerminalMultiLineLinkDetector, this._xterm, this._processInfo, this._linkResolver));
            this._setupLinkDetector(TerminalLocalLinkDetector.id, this._instantiationService.createInstance(TerminalLocalLinkDetector, this._xterm, capabilities, this._processInfo, this._linkResolver));
        }
        this._setupLinkDetector(TerminalUriLinkDetector.id, this._instantiationService.createInstance(TerminalUriLinkDetector, this._xterm, this._processInfo, this._linkResolver));
        this._setupLinkDetector(TerminalWordLinkDetector.id, this.add(this._instantiationService.createInstance(TerminalWordLinkDetector, this._xterm)));
        // Setup link openers
        const localFileOpener = this._instantiationService.createInstance(TerminalLocalFileLinkOpener);
        const localFolderInWorkspaceOpener = this._instantiationService.createInstance(TerminalLocalFolderInWorkspaceLinkOpener);
        this._openers.set("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, localFileOpener);
        this._openers.set("LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */, localFolderInWorkspaceOpener);
        this._openers.set("LocalFolderOutsideWorkspace" /* TerminalBuiltinLinkType.LocalFolderOutsideWorkspace */, this._instantiationService.createInstance(TerminalLocalFolderOutsideWorkspaceLinkOpener));
        this._openers.set("Search" /* TerminalBuiltinLinkType.Search */, this._instantiationService.createInstance(TerminalSearchLinkOpener, capabilities, this._processInfo.initialCwd, localFileOpener, localFolderInWorkspaceOpener, () => this._processInfo.os || OS));
        this._openers.set("Url" /* TerminalBuiltinLinkType.Url */, this._instantiationService.createInstance(TerminalUrlLinkOpener, !!this._processInfo.remoteAuthority));
        this._registerStandardLinkProviders();
        let activeHoverDisposable;
        let activeTooltipScheduler;
        this.add(toDisposable(() => {
            this._clearLinkProviders();
            dispose(this._externalLinkProviders);
            activeHoverDisposable?.dispose();
            activeTooltipScheduler?.dispose();
        }));
        this._xterm.options.linkHandler = {
            allowNonHttpProtocols: true,
            activate: (event, text) => {
                if (!this._isLinkActivationModifierDown(event)) {
                    return;
                }
                const colonIndex = text.indexOf(':');
                if (colonIndex === -1) {
                    throw new Error(`Could not find scheme in link "${text}"`);
                }
                const scheme = text.substring(0, colonIndex);
                if (terminalConfigurationService.config.allowedLinkSchemes.indexOf(scheme) === -1) {
                    notificationService.prompt(Severity.Warning, nls.localize('scheme', 'Opening URIs can be insecure, do you want to allow opening links with the scheme {0}?', scheme), [
                        {
                            label: nls.localize('allow', 'Allow {0}', scheme),
                            run: () => {
                                const allowedLinkSchemes = [
                                    ...terminalConfigurationService.config.allowedLinkSchemes,
                                    scheme
                                ];
                                this._configurationService.updateValue(`terminal.integrated.allowedLinkSchemes`, allowedLinkSchemes);
                            }
                        }
                    ]);
                }
                this._openers.get("Url" /* TerminalBuiltinLinkType.Url */)?.open({
                    type: "Url" /* TerminalBuiltinLinkType.Url */,
                    text,
                    bufferRange: null,
                    uri: URI.parse(text)
                });
            },
            hover: (e, text, range) => {
                activeHoverDisposable?.dispose();
                activeHoverDisposable = undefined;
                activeTooltipScheduler?.dispose();
                activeTooltipScheduler = new RunOnceScheduler(() => {
                    const core = this._xterm._core;
                    const cellDimensions = {
                        width: core._renderService.dimensions.css.cell.width,
                        height: core._renderService.dimensions.css.cell.height
                    };
                    const terminalDimensions = {
                        width: this._xterm.cols,
                        height: this._xterm.rows
                    };
                    activeHoverDisposable = this._showHover({
                        viewportRange: convertBufferRangeToViewport(range, this._xterm.buffer.active.viewportY),
                        cellDimensions,
                        terminalDimensions
                    }, this._getLinkHoverString(text, text), undefined, (text) => this._xterm.options.linkHandler?.activate(e, text, range));
                    // Clear out scheduler until next hover event
                    activeTooltipScheduler?.dispose();
                    activeTooltipScheduler = undefined;
                }, this._configurationService.getValue('workbench.hover.delay'));
                activeTooltipScheduler.schedule();
            }
        };
    }
    _setupLinkDetector(id, detector, isExternal = false) {
        const detectorAdapter = this.add(this._instantiationService.createInstance(TerminalLinkDetectorAdapter, detector));
        this.add(detectorAdapter.onDidActivateLink(e => {
            // Prevent default electron link handling so Alt+Click mode works normally
            e.event?.preventDefault();
            // Require correct modifier on click unless event is coming from linkQuickPick selection
            if (e.event && !(e.event instanceof TerminalLinkQuickPickEvent) && !this._isLinkActivationModifierDown(e.event)) {
                return;
            }
            // Just call the handler if there is no before listener
            if (e.link.activate) {
                // Custom activate call (external links only)
                e.link.activate(e.link.text);
            }
            else {
                this._openLink(e.link);
            }
        }));
        this.add(detectorAdapter.onDidShowHover(e => this._tooltipCallback(e.link, e.viewportRange, e.modifierDownCallback, e.modifierUpCallback)));
        if (!isExternal) {
            this._standardLinkProviders.set(id, detectorAdapter);
        }
        return detectorAdapter;
    }
    async _openLink(link) {
        this._logService.debug('Opening link', link);
        const opener = this._openers.get(link.type);
        if (!opener) {
            throw new Error(`No matching opener for link type "${link.type}"`);
        }
        await opener.open(link);
    }
    async openRecentLink(type) {
        let links;
        let i = this._xterm.buffer.active.length;
        while ((!links || links.length === 0) && i >= this._xterm.buffer.active.viewportY) {
            links = await this._getLinksForType(i, type);
            i--;
        }
        if (!links || links.length < 1) {
            return undefined;
        }
        const event = new TerminalLinkQuickPickEvent(EventType.CLICK);
        links[0].activate(event, links[0].text);
        return links[0];
    }
    async getLinks() {
        // Fetch and await the viewport results
        const viewportLinksByLinePromises = [];
        for (let i = this._xterm.buffer.active.viewportY + this._xterm.rows - 1; i >= this._xterm.buffer.active.viewportY; i--) {
            viewportLinksByLinePromises.push(this._getLinksForLine(i));
        }
        const viewportLinksByLine = await Promise.all(viewportLinksByLinePromises);
        // Assemble viewport links
        const viewportLinks = {
            wordLinks: [],
            webLinks: [],
            fileLinks: [],
            folderLinks: [],
        };
        for (const links of viewportLinksByLine) {
            if (links) {
                const { wordLinks, webLinks, fileLinks, folderLinks } = links;
                if (wordLinks?.length) {
                    viewportLinks.wordLinks.push(...wordLinks.reverse());
                }
                if (webLinks?.length) {
                    viewportLinks.webLinks.push(...webLinks.reverse());
                }
                if (fileLinks?.length) {
                    viewportLinks.fileLinks.push(...fileLinks.reverse());
                }
                if (folderLinks?.length) {
                    viewportLinks.folderLinks.push(...folderLinks.reverse());
                }
            }
        }
        // Fetch the remaining results async
        const aboveViewportLinksPromises = [];
        for (let i = this._xterm.buffer.active.viewportY - 1; i >= 0; i--) {
            aboveViewportLinksPromises.push(this._getLinksForLine(i));
        }
        const belowViewportLinksPromises = [];
        for (let i = this._xterm.buffer.active.length - 1; i >= this._xterm.buffer.active.viewportY + this._xterm.rows; i--) {
            belowViewportLinksPromises.push(this._getLinksForLine(i));
        }
        // Assemble all links in results
        const allLinks = Promise.all(aboveViewportLinksPromises).then(async (aboveViewportLinks) => {
            const belowViewportLinks = await Promise.all(belowViewportLinksPromises);
            const allResults = {
                wordLinks: [...viewportLinks.wordLinks],
                webLinks: [...viewportLinks.webLinks],
                fileLinks: [...viewportLinks.fileLinks],
                folderLinks: [...viewportLinks.folderLinks]
            };
            for (const links of [...belowViewportLinks, ...aboveViewportLinks]) {
                if (links) {
                    const { wordLinks, webLinks, fileLinks, folderLinks } = links;
                    if (wordLinks?.length) {
                        allResults.wordLinks.push(...wordLinks.reverse());
                    }
                    if (webLinks?.length) {
                        allResults.webLinks.push(...webLinks.reverse());
                    }
                    if (fileLinks?.length) {
                        allResults.fileLinks.push(...fileLinks.reverse());
                    }
                    if (folderLinks?.length) {
                        allResults.folderLinks.push(...folderLinks.reverse());
                    }
                }
            }
            return allResults;
        });
        return {
            viewport: viewportLinks,
            all: allLinks
        };
    }
    async _getLinksForLine(y) {
        const unfilteredWordLinks = await this._getLinksForType(y, 'word');
        const webLinks = await this._getLinksForType(y, 'url');
        const fileLinks = await this._getLinksForType(y, 'localFile');
        const folderLinks = await this._getLinksForType(y, 'localFolder');
        const words = new Set();
        let wordLinks;
        if (unfilteredWordLinks) {
            wordLinks = [];
            for (const link of unfilteredWordLinks) {
                if (!words.has(link.text) && link.text.length > 1) {
                    wordLinks.push(link);
                    words.add(link.text);
                }
            }
        }
        return { wordLinks, webLinks, fileLinks, folderLinks };
    }
    async _getLinksForType(y, type) {
        switch (type) {
            case 'word':
                return (await new Promise(r => this._standardLinkProviders.get(TerminalWordLinkDetector.id)?.provideLinks(y, r)));
            case 'url':
                return (await new Promise(r => this._standardLinkProviders.get(TerminalUriLinkDetector.id)?.provideLinks(y, r)));
            case 'localFile': {
                const links = (await new Promise(r => this._standardLinkProviders.get(TerminalLocalLinkDetector.id)?.provideLinks(y, r)));
                return links?.filter(link => link.type === "LocalFile" /* TerminalBuiltinLinkType.LocalFile */);
            }
            case 'localFolder': {
                const links = (await new Promise(r => this._standardLinkProviders.get(TerminalLocalLinkDetector.id)?.provideLinks(y, r)));
                return links?.filter(link => link.type === "LocalFolderInWorkspace" /* TerminalBuiltinLinkType.LocalFolderInWorkspace */);
            }
        }
    }
    _tooltipCallback(link, viewportRange, modifierDownCallback, modifierUpCallback) {
        if (!this._widgetManager) {
            return;
        }
        const core = this._xterm._core;
        const cellDimensions = {
            width: core._renderService.dimensions.css.cell.width,
            height: core._renderService.dimensions.css.cell.height
        };
        const terminalDimensions = {
            width: this._xterm.cols,
            height: this._xterm.rows
        };
        // Don't pass the mouse event as this avoids the modifier check
        this._showHover({
            viewportRange,
            cellDimensions,
            terminalDimensions,
            modifierDownCallback,
            modifierUpCallback
        }, this._getLinkHoverString(link.text, link.label), link.actions, (text) => link.activate(undefined, text), link);
    }
    _showHover(targetOptions, text, actions, linkHandler, link) {
        if (this._widgetManager) {
            const widget = this._instantiationService.createInstance(TerminalHover, targetOptions, text, actions, linkHandler);
            const attached = this._widgetManager.attachWidget(widget);
            if (attached) {
                link?.onInvalidated(() => attached.dispose());
            }
            return attached;
        }
        return undefined;
    }
    setWidgetManager(widgetManager) {
        this._widgetManager = widgetManager;
    }
    _clearLinkProviders() {
        dispose(this._linkProvidersDisposables);
        this._linkProvidersDisposables.length = 0;
    }
    _registerStandardLinkProviders() {
        // Forward any external link provider requests to the registered provider if it exists. This
        // helps maintain the relative priority of the link providers as it's defined by the order
        // in which they're registered in xterm.js.
        //
        /**
         * There's a bit going on here but here's another view:
         * - {@link externalProvideLinksCb} The external callback that gives the links (eg. from
         *   exthost)
         * - {@link proxyLinkProvider} A proxy that forwards the call over to
         *   {@link externalProvideLinksCb}
         * - {@link wrappedLinkProvider} Wraps the above in an `TerminalLinkDetectorAdapter`
         */
        const proxyLinkProvider = async (bufferLineNumber) => {
            return this.externalProvideLinksCb?.(bufferLineNumber);
        };
        const detectorId = `extension-${this._externalLinkProviders.length}`;
        const wrappedLinkProvider = this._setupLinkDetector(detectorId, new TerminalExternalLinkDetector(detectorId, this._xterm, proxyLinkProvider), true);
        this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(wrappedLinkProvider));
        for (const p of this._standardLinkProviders.values()) {
            this._linkProvidersDisposables.push(this._xterm.registerLinkProvider(p));
        }
    }
    _isLinkActivationModifierDown(event) {
        const editorConf = this._configurationService.getValue('editor');
        if (editorConf.multiCursorModifier === 'ctrlCmd') {
            return !!event.altKey;
        }
        return isMacintosh ? event.metaKey : event.ctrlKey;
    }
    _getLinkHoverString(uri, label) {
        const editorConf = this._configurationService.getValue('editor');
        let clickLabel = '';
        if (editorConf.multiCursorModifier === 'ctrlCmd') {
            if (isMacintosh) {
                clickLabel = nls.localize('terminalLinkHandler.followLinkAlt.mac', "option + click");
            }
            else {
                clickLabel = nls.localize('terminalLinkHandler.followLinkAlt', "alt + click");
            }
        }
        else {
            if (isMacintosh) {
                clickLabel = nls.localize('terminalLinkHandler.followLinkCmd', "cmd + click");
            }
            else {
                clickLabel = nls.localize('terminalLinkHandler.followLinkCtrl', "ctrl + click");
            }
        }
        let fallbackLabel = nls.localize('followLink', "Follow link");
        try {
            if (this._tunnelService.canTunnel(URI.parse(uri))) {
                fallbackLabel = nls.localize('followForwardedLink', "Follow link using forwarded port");
            }
        }
        catch {
            // No-op, already set to fallback
        }
        const markdown = new MarkdownString('', true);
        // Escapes markdown in label & uri
        if (label) {
            label = markdown.appendText(label).value;
            markdown.value = '';
        }
        if (uri) {
            uri = markdown.appendText(uri).value;
            markdown.value = '';
        }
        label = label || fallbackLabel;
        // Use the label when uri is '' so the link displays correctly
        uri = uri || label;
        // Although if there is a space in the uri, just replace it completely
        if (/(\s|&nbsp;)/.test(uri)) {
            uri = nls.localize('followLinkUrl', 'Link');
        }
        return markdown.appendLink(uri, label).appendMarkdown(` (${clickLabel})`);
    }
};
TerminalLinkManager = __decorate([
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, INotificationService),
    __param(7, ITerminalConfigurationService),
    __param(8, ITerminalLogService),
    __param(9, ITunnelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalLinkManager);
export { TerminalLinkManager };
