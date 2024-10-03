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
var TerminalHistoryContribution_1;
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { localize2 } from '../../../../../nls.js';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../../platform/accessibility/common/accessibility.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { TerminalLocation } from '../../../../../platform/terminal/common/terminal.js';
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from '../../../accessibility/browser/accessibilityConfiguration.js';
import { registerActiveInstanceAction, registerTerminalAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { clearShellFileHistory, getCommandHistory, getDirectoryHistory } from '../common/history.js';
import { showRunRecentQuickPick } from './terminalRunRecentQuickPick.js';
let TerminalHistoryContribution = class TerminalHistoryContribution extends Disposable {
    static { TerminalHistoryContribution_1 = this; }
    static { this.ID = 'terminal.history'; }
    static get(instance) {
        return instance.getContribution(TerminalHistoryContribution_1.ID);
    }
    constructor(_ctx, _contextKeyService, _instantiationService) {
        super();
        this._ctx = _ctx;
        this._contextKeyService = _contextKeyService;
        this._instantiationService = _instantiationService;
        this._terminalInRunCommandPicker = TerminalContextKeys.inTerminalRunCommandPicker.bindTo(this._contextKeyService);
        this._register(_ctx.instance.capabilities.onDidAddCapabilityType(e => {
            switch (e) {
                case 0: {
                    _ctx.instance.capabilities.get(0)?.onDidChangeCwd(e => {
                        this._instantiationService.invokeFunction(getDirectoryHistory)?.add(e, { remoteAuthority: _ctx.instance.remoteAuthority });
                    });
                    break;
                }
                case 2: {
                    _ctx.instance.capabilities.get(2)?.onCommandFinished(e => {
                        if (e.command.trim().length > 0) {
                            this._instantiationService.invokeFunction(getCommandHistory)?.add(e.command, { shellType: _ctx.instance.shellType });
                        }
                    });
                    break;
                }
            }
        }));
    }
    async runRecent(type, filterMode, value) {
        return this._instantiationService.invokeFunction(showRunRecentQuickPick, this._ctx.instance, this._terminalInRunCommandPicker, type, filterMode, value);
    }
};
TerminalHistoryContribution = TerminalHistoryContribution_1 = __decorate([
    __param(1, IContextKeyService),
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TerminalHistoryContribution);
registerTerminalContribution(TerminalHistoryContribution.ID, TerminalHistoryContribution);
const precondition = ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated);
registerTerminalAction({
    id: "workbench.action.terminal.clearPreviousSessionHistory",
    title: localize2('workbench.action.terminal.clearPreviousSessionHistory', 'Clear Previous Session History'),
    precondition,
    run: async (c, accessor) => {
        getCommandHistory(accessor).clear();
        clearShellFileHistory();
    }
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.goToRecentDirectory",
    title: localize2('workbench.action.terminal.goToRecentDirectory', 'Go to Recent Directory...'),
    metadata: {
        description: localize2('goToRecentDirectory.metadata', 'Goes to a recent folder'),
    },
    precondition,
    keybinding: {
        primary: 2048 | 37,
        when: TerminalContextKeys.focus,
        weight: 200
    },
    run: async (activeInstance, c) => {
        const history = TerminalHistoryContribution.get(activeInstance);
        if (!history) {
            return;
        }
        await history.runRecent('cwd');
        if (activeInstance?.target === TerminalLocation.Editor) {
            await c.editorService.revealActiveEditor();
        }
        else {
            await c.groupService.showPanel(false);
        }
    }
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.runRecentCommand",
    title: localize2('workbench.action.terminal.runRecentCommand', 'Run Recent Command...'),
    precondition,
    keybinding: [
        {
            primary: 2048 | 48,
            when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(TerminalContextKeys.focus, ContextKeyExpr.and(accessibleViewIsShown, accessibleViewCurrentProviderId.isEqualTo("terminal")))),
            weight: 200
        },
        {
            primary: 2048 | 512 | 48,
            mac: { primary: 256 | 512 | 48 },
            when: ContextKeyExpr.and(TerminalContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate()),
            weight: 200
        }
    ],
    run: async (activeInstance, c) => {
        const history = TerminalHistoryContribution.get(activeInstance);
        if (!history) {
            return;
        }
        await history.runRecent('command');
        if (activeInstance?.target === TerminalLocation.Editor) {
            await c.editorService.revealActiveEditor();
        }
        else {
            await c.groupService.showPanel(false);
        }
    }
});
