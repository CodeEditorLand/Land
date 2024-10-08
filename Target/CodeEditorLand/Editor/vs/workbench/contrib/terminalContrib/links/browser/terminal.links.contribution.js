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
var TerminalLinkContribution_1;
import { Event } from '../../../../../base/common/event.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { localize2 } from '../../../../../nls.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { registerSingleton } from '../../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from '../../../accessibility/browser/accessibilityConfiguration.js';
import { isDetachedTerminalInstance } from '../../../terminal/browser/terminal.js';
import { registerActiveInstanceAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { isTerminalProcessManager } from '../../../terminal/common/terminal.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { terminalStrings } from '../../../terminal/common/terminalStrings.js';
import { ITerminalLinkProviderService } from './links.js';
import { TerminalLinkManager } from './terminalLinkManager.js';
import { TerminalLinkProviderService } from './terminalLinkProviderService.js';
import { TerminalLinkQuickpick } from './terminalLinkQuickpick.js';
import { TerminalLinkResolver } from './terminalLinkResolver.js';
// #region Services
registerSingleton(ITerminalLinkProviderService, TerminalLinkProviderService, 1 /* InstantiationType.Delayed */);
// #endregion
// #region Terminal Contributions
let TerminalLinkContribution = class TerminalLinkContribution extends DisposableStore {
    static { TerminalLinkContribution_1 = this; }
    static { this.ID = 'terminal.link'; }
    static get(instance) {
        return instance.getContribution(TerminalLinkContribution_1.ID);
    }
    constructor(_ctx, _instantiationService, _terminalLinkProviderService) {
        super();
        this._ctx = _ctx;
        this._instantiationService = _instantiationService;
        this._terminalLinkProviderService = _terminalLinkProviderService;
        this._linkResolver = this._instantiationService.createInstance(TerminalLinkResolver);
    }
    xtermReady(xterm) {
        const linkManager = this._linkManager = this.add(this._instantiationService.createInstance(TerminalLinkManager, xterm.raw, this._ctx.processManager, this._ctx.instance.capabilities, this._linkResolver));
        // Set widget manager
        if (isTerminalProcessManager(this._ctx.processManager)) {
            const disposable = linkManager.add(Event.once(this._ctx.processManager.onProcessReady)(() => {
                linkManager.setWidgetManager(this._ctx.widgetManager);
                this.delete(disposable);
            }));
        }
        else {
            linkManager.setWidgetManager(this._ctx.widgetManager);
        }
        // Attach the external link provider to the instance and listen for changes
        if (!isDetachedTerminalInstance(this._ctx.instance)) {
            for (const linkProvider of this._terminalLinkProviderService.linkProviders) {
                linkManager.externalProvideLinksCb = linkProvider.provideLinks.bind(linkProvider, this._ctx.instance);
            }
            linkManager.add(this._terminalLinkProviderService.onDidAddLinkProvider(e => {
                linkManager.externalProvideLinksCb = e.provideLinks.bind(e, this._ctx.instance);
            }));
        }
        linkManager.add(this._terminalLinkProviderService.onDidRemoveLinkProvider(() => linkManager.externalProvideLinksCb = undefined));
    }
    async showLinkQuickpick(extended) {
        if (!this._terminalLinkQuickpick) {
            this._terminalLinkQuickpick = this.add(this._instantiationService.createInstance(TerminalLinkQuickpick));
            this._terminalLinkQuickpick.onDidRequestMoreLinks(() => {
                this.showLinkQuickpick(true);
            });
        }
        const links = await this._getLinks();
        return await this._terminalLinkQuickpick.show(this._ctx.instance, links);
    }
    async _getLinks() {
        if (!this._linkManager) {
            throw new Error('terminal links are not ready, cannot generate link quick pick');
        }
        return this._linkManager.getLinks();
    }
    async openRecentLink(type) {
        if (!this._linkManager) {
            throw new Error('terminal links are not ready, cannot open a link');
        }
        this._linkManager.openRecentLink(type);
    }
};
TerminalLinkContribution = TerminalLinkContribution_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, ITerminalLinkProviderService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TerminalLinkContribution);
registerTerminalContribution(TerminalLinkContribution.ID, TerminalLinkContribution, true);
// #endregion
// #region Actions
const category = terminalStrings.actionCategory;
registerActiveInstanceAction({
    id: "workbench.action.terminal.openDetectedLink" /* TerminalLinksCommandId.OpenDetectedLink */,
    title: localize2('workbench.action.terminal.openDetectedLink', 'Open Detected Link...'),
    f1: true,
    category,
    precondition: TerminalContextKeys.terminalHasBeenCreated,
    keybinding: [{
            primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 45 /* KeyCode.KeyO */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
            when: TerminalContextKeys.focus
        }, {
            primary: 2048 /* KeyMod.CtrlCmd */ | 1024 /* KeyMod.Shift */ | 37 /* KeyCode.KeyG */,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
            when: ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal" /* AccessibleViewProviderId.Terminal */))
        },
    ],
    run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.showLinkQuickpick()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.openUrlLink" /* TerminalLinksCommandId.OpenWebLink */,
    title: localize2('workbench.action.terminal.openLastUrlLink', 'Open Last URL Link'),
    metadata: {
        description: localize2('workbench.action.terminal.openLastUrlLink.description', 'Opens the last detected URL/URI link in the terminal')
    },
    f1: true,
    category,
    precondition: TerminalContextKeys.terminalHasBeenCreated,
    run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink('url')
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.openFileLink" /* TerminalLinksCommandId.OpenFileLink */,
    title: localize2('workbench.action.terminal.openLastLocalFileLink', 'Open Last Local File Link'),
    f1: true,
    category,
    precondition: TerminalContextKeys.terminalHasBeenCreated,
    run: (activeInstance) => TerminalLinkContribution.get(activeInstance)?.openRecentLink('localFile')
});
// #endregion
