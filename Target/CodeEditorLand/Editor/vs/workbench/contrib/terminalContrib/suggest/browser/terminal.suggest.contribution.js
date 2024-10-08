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
var TerminalSuggestContribution_1;
import * as dom from '../../../../../base/browser/dom.js';
import { AutoOpenBarrier } from '../../../../../base/common/async.js';
import { Event } from '../../../../../base/common/event.js';
import { DisposableStore, MutableDisposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { isWindows } from '../../../../../base/common/platform.js';
import { localize2 } from '../../../../../nls.js';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { TerminalLocation } from '../../../../../platform/terminal/common/terminal.js';
import { registerActiveInstanceAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { registerSendSequenceKeybinding } from '../../../terminal/browser/terminalKeybindings.js';
import { TERMINAL_CONFIG_SECTION } from '../../../terminal/common/terminal.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { terminalSuggestConfigSection } from '../common/terminalSuggestConfiguration.js';
import { parseCompletionsFromShell, SuggestAddon } from './terminalSuggestAddon.js';
import { TerminalClipboardContribution } from '../../clipboard/browser/terminal.clipboard.contribution.js';
// #region Terminal Contributions
let TerminalSuggestContribution = class TerminalSuggestContribution extends DisposableStore {
    static { TerminalSuggestContribution_1 = this; }
    static { this.ID = 'terminal.suggest'; }
    static get(instance) {
        return instance.getContribution(TerminalSuggestContribution_1.ID);
    }
    get addon() { return this._addon.value; }
    static { this._cachedPwshCommands = new Set(); }
    constructor(_ctx, _contextKeyService, _configurationService, _instantiationService, _storageService) {
        super();
        this._ctx = _ctx;
        this._contextKeyService = _contextKeyService;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._storageService = _storageService;
        this._addon = new MutableDisposable();
        this._terminalSuggestWidgetContextKeys = new Set(TerminalContextKeys.suggestWidgetVisible.key);
        this.add(toDisposable(() => this._addon?.dispose()));
        this._terminalSuggestWidgetVisibleContextKey = TerminalContextKeys.suggestWidgetVisible.bindTo(this._contextKeyService);
        // Attempt to load cached pwsh commands if not already loaded
        if (TerminalSuggestContribution_1._cachedPwshCommands.size === 0) {
            const config = this._storageService.get("terminal.suggest.pwshCommands" /* Constants.CachedPwshCommandsStorageKey */, -1 /* StorageScope.APPLICATION */, undefined);
            if (config !== undefined) {
                const completions = JSON.parse(config);
                for (const c of completions) {
                    TerminalSuggestContribution_1._cachedPwshCommands.add(c);
                }
            }
        }
        this.add(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.suggest.enabled" /* TerminalSuggestSettingId.Enabled */)) {
                this.clearSuggestCache();
            }
        }));
    }
    xtermReady(xterm) {
        this._xterm = xterm.raw;
        const config = this._configurationService.getValue(terminalSuggestConfigSection);
        const enabled = config.enabled;
        if (!enabled) {
            return;
        }
        this.add(xterm.raw.parser.registerOscHandler(633 /* ShellIntegrationOscPs.VSCode */, data => {
            return this._handleVSCodeSequence(data);
        }));
    }
    _handleVSCodeSequence(data) {
        if (!this._xterm) {
            return false;
        }
        // Pass the sequence along to the capability
        const [command, ...args] = data.split(';');
        switch (command) {
            case "CompletionsPwshCommands" /* VSCodeSuggestOscPt.CompletionsPwshCommands */:
                return this._handleCompletionsPwshCommandsSequence(this._xterm, data, command, args);
        }
        // Unrecognized sequence
        return false;
    }
    async _handleCompletionsPwshCommandsSequence(terminal, data, command, args) {
        const type = args[0];
        const rawCompletions = JSON.parse(data.slice(command.length + type.length + 2 /*semi-colons*/));
        const completions = parseCompletionsFromShell(rawCompletions);
        const set = TerminalSuggestContribution_1._cachedPwshCommands;
        set.clear();
        for (const c of completions) {
            set.add(c);
        }
        this._storageService.store("terminal.suggest.pwshCommands" /* Constants.CachedPwshCommandsStorageKey */, JSON.stringify(Array.from(set.values())), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        return true;
    }
    clearSuggestCache() {
        TerminalSuggestContribution_1._cachedPwshCommands.clear();
        this._storageService.remove("terminal.suggest.pwshCommands" /* Constants.CachedPwshCommandsStorageKey */, -1 /* StorageScope.APPLICATION */);
    }
    xtermOpen(xterm) {
        const config = this._configurationService.getValue(terminalSuggestConfigSection);
        const enabled = config.enabled;
        if (!enabled) {
            return;
        }
        this.add(Event.runAndSubscribe(this._ctx.instance.onDidChangeShellType, async () => {
            this._loadSuggestAddon(xterm.raw);
        }));
        this.add(this._contextKeyService.onDidChangeContext(e => {
            if (e.affectsSome(this._terminalSuggestWidgetContextKeys)) {
                this._loadSuggestAddon(xterm.raw);
            }
        }));
        this.add(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.sendKeybindingsToShell" /* TerminalSettingId.SendKeybindingsToShell */)) {
                this._loadSuggestAddon(xterm.raw);
            }
        }));
    }
    _loadSuggestAddon(xterm) {
        const sendingKeybindingsToShell = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).sendKeybindingsToShell;
        if (sendingKeybindingsToShell || this._ctx.instance.shellType !== 'pwsh') {
            this._addon.clear();
            return;
        }
        if (this._terminalSuggestWidgetVisibleContextKey) {
            const addon = this._addon.value = this._instantiationService.createInstance(SuggestAddon, TerminalSuggestContribution_1._cachedPwshCommands, this._ctx.instance.capabilities, this._terminalSuggestWidgetVisibleContextKey);
            xterm.loadAddon(addon);
            if (this._ctx.instance.target === TerminalLocation.Editor) {
                addon.setContainerWithOverflow(xterm.element);
            }
            else {
                addon.setContainerWithOverflow(dom.findParentWithClass(xterm.element, 'panel'));
            }
            addon.setScreen(xterm.element.querySelector('.xterm-screen'));
            this.add(this._ctx.instance.onDidBlur(() => addon.hideSuggestWidget()));
            this.add(addon.onAcceptedCompletion(async (text) => {
                this._ctx.instance.focus();
                this._ctx.instance.sendText(text, false);
            }));
            const clipboardContrib = TerminalClipboardContribution.get(this._ctx.instance);
            this.add(clipboardContrib.onWillPaste(() => addon.isPasting = true));
            this.add(clipboardContrib.onDidPaste(() => {
                // Delay this slightly as synchronizing the prompt input is debounced
                setTimeout(() => addon.isPasting = false, 100);
            }));
            // If completions are requested, pause and queue input events until completions are
            // received. This fixing some problems in PowerShell, particularly enter not executing
            // when typing quickly and some characters being printed twice. On Windows this isn't
            // needed because inputs are _not_ echoed when not handled immediately.
            // TODO: This should be based on the OS of the pty host, not the client
            if (!isWindows) {
                let barrier;
                this.add(addon.onDidRequestCompletions(() => {
                    barrier = new AutoOpenBarrier(2000);
                    this._ctx.instance.pauseInputEvents(barrier);
                }));
                this.add(addon.onDidReceiveCompletions(() => {
                    barrier?.open();
                    barrier = undefined;
                }));
            }
        }
    }
};
TerminalSuggestContribution = TerminalSuggestContribution_1 = __decorate([
    __param(1, IContextKeyService),
    __param(2, IConfigurationService),
    __param(3, IInstantiationService),
    __param(4, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TerminalSuggestContribution);
registerTerminalContribution(TerminalSuggestContribution.ID, TerminalSuggestContribution);
// #endregion
// #region Keybindings
registerSendSequenceKeybinding('\x1b[24~e', {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType" /* TerminalContextKeyStrings.ShellType */, "pwsh" /* GeneralShellType.PowerShell */), TerminalContextKeys.terminalShellIntegrationEnabled, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.enabled" /* TerminalSuggestSettingId.Enabled */}`, true)),
    primary: 2048 /* KeyMod.CtrlCmd */ | 10 /* KeyCode.Space */,
    mac: { primary: 256 /* KeyMod.WinCtrl */ | 10 /* KeyCode.Space */ }
});
// #endregion
// #region Actions
registerActiveInstanceAction({
    id: "workbench.action.terminal.selectPrevSuggestion" /* TerminalSuggestCommandId.SelectPrevSuggestion */,
    title: localize2('workbench.action.terminal.selectPrevSuggestion', 'Select the Previous Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        // Up is bound to other workbench keybindings that this needs to beat
        primary: 16 /* KeyCode.UpArrow */,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.selectPrevPageSuggestion" /* TerminalSuggestCommandId.SelectPrevPageSuggestion */,
    title: localize2('workbench.action.terminal.selectPrevPageSuggestion', 'Select the Previous Page Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        // Up is bound to other workbench keybindings that this needs to beat
        primary: 11 /* KeyCode.PageUp */,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousPageSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.selectNextSuggestion" /* TerminalSuggestCommandId.SelectNextSuggestion */,
    title: localize2('workbench.action.terminal.selectNextSuggestion', 'Select the Next Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        // Down is bound to other workbench keybindings that this needs to beat
        primary: 18 /* KeyCode.DownArrow */,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.selectNextPageSuggestion" /* TerminalSuggestCommandId.SelectNextPageSuggestion */,
    title: localize2('workbench.action.terminal.selectNextPageSuggestion', 'Select the Next Page Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        // Down is bound to other workbench keybindings that this needs to beat
        primary: 12 /* KeyCode.PageDown */,
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextPageSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.acceptSelectedSuggestion" /* TerminalSuggestCommandId.AcceptSelectedSuggestion */,
    title: localize2('workbench.action.terminal.acceptSelectedSuggestion', 'Accept Selected Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 2 /* KeyCode.Tab */,
        // Tab is bound to other workbench keybindings that this needs to beat
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.acceptSelectedSuggestionEnter" /* TerminalSuggestCommandId.AcceptSelectedSuggestionEnter */,
    title: localize2('workbench.action.terminal.acceptSelectedSuggestionEnter', 'Accept Selected Suggestion (Enter)'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 3 /* KeyCode.Enter */,
        // Enter is bound to other workbench keybindings that this needs to beat
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1,
        when: ContextKeyExpr.notEquals(`config.${"terminal.integrated.suggest.runOnEnter" /* TerminalSuggestSettingId.RunOnEnter */}`, 'ignore'),
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion(undefined, true)
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.hideSuggestWidget" /* TerminalSuggestCommandId.HideSuggestWidget */,
    title: localize2('workbench.action.terminal.hideSuggestWidget', 'Hide Suggest Widget'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 9 /* KeyCode.Escape */,
        // Escape is bound to other workbench keybindings that this needs to beat
        weight: 200 /* KeybindingWeight.WorkbenchContrib */ + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.hideSuggestWidget()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.clearSuggestCache" /* TerminalSuggestCommandId.ClearSuggestCache */,
    title: localize2('workbench.action.terminal.clearSuggestCache', 'Clear Suggest Cache'),
    f1: true,
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.clearSuggestCache()
});
// #endregion
