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
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { TerminalLocation } from '../../../../../platform/terminal/common/terminal.js';
import { registerActiveInstanceAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { TERMINAL_CONFIG_SECTION } from '../../../terminal/common/terminal.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { parseCompletionsFromShell, SuggestAddon } from './terminalSuggestAddon.js';
import { terminalSuggestConfigSection } from '../common/terminalSuggestConfiguration.js';
import { registerSendSequenceKeybinding } from '../../../terminal/browser/terminalKeybindings.js';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../../platform/accessibility/common/accessibility.js';
let TerminalSuggestContribution = class TerminalSuggestContribution extends DisposableStore {
    static { TerminalSuggestContribution_1 = this; }
    static { this.ID = 'terminal.suggest'; }
    static get(instance) {
        return instance.getContribution(TerminalSuggestContribution_1.ID);
    }
    get addon() { return this._addon.value; }
    static { this._cachedPwshCommands = new Set(); }
    constructor(_instance, processManager, widgetManager, _contextKeyService, _configurationService, _instantiationService, _storageService) {
        super();
        this._instance = _instance;
        this._contextKeyService = _contextKeyService;
        this._configurationService = _configurationService;
        this._instantiationService = _instantiationService;
        this._storageService = _storageService;
        this._addon = new MutableDisposable();
        this._terminalSuggestWidgetContextKeys = new Set(TerminalContextKeys.suggestWidgetVisible.key);
        this.add(toDisposable(() => this._addon?.dispose()));
        this._terminalSuggestWidgetVisibleContextKey = TerminalContextKeys.suggestWidgetVisible.bindTo(this._contextKeyService);
        if (TerminalSuggestContribution_1._cachedPwshCommands.size === 0) {
            const config = this._storageService.get("terminal.suggest.pwshCommands", -1, undefined);
            if (config !== undefined) {
                const completions = JSON.parse(config);
                for (const c of completions) {
                    TerminalSuggestContribution_1._cachedPwshCommands.add(c);
                }
            }
        }
        this.add(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.suggest.enabled")) {
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
        this.add(xterm.raw.parser.registerOscHandler(633, data => {
            return this._handleVSCodeSequence(data);
        }));
    }
    _handleVSCodeSequence(data) {
        if (!this._xterm) {
            return false;
        }
        const [command, ...args] = data.split(';');
        switch (command) {
            case "CompletionsPwshCommands":
                return this._handleCompletionsPwshCommandsSequence(this._xterm, data, command, args);
        }
        return false;
    }
    async _handleCompletionsPwshCommandsSequence(terminal, data, command, args) {
        const type = args[0];
        const rawCompletions = JSON.parse(data.slice(command.length + type.length + 2));
        const completions = parseCompletionsFromShell(rawCompletions);
        const set = TerminalSuggestContribution_1._cachedPwshCommands;
        set.clear();
        for (const c of completions) {
            set.add(c);
        }
        this._storageService.store("terminal.suggest.pwshCommands", JSON.stringify(Array.from(set.values())), -1, 1);
        return true;
    }
    clearSuggestCache() {
        TerminalSuggestContribution_1._cachedPwshCommands.clear();
        this._storageService.remove("terminal.suggest.pwshCommands", -1);
    }
    xtermOpen(xterm) {
        const config = this._configurationService.getValue(terminalSuggestConfigSection);
        const enabled = config.enabled;
        if (!enabled) {
            return;
        }
        this.add(Event.runAndSubscribe(this._instance.onDidChangeShellType, async () => {
            this._loadSuggestAddon(xterm.raw);
        }));
        this.add(this._contextKeyService.onDidChangeContext(e => {
            if (e.affectsSome(this._terminalSuggestWidgetContextKeys)) {
                this._loadSuggestAddon(xterm.raw);
            }
        }));
        this.add(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.sendKeybindingsToShell")) {
                this._loadSuggestAddon(xterm.raw);
            }
        }));
    }
    _loadSuggestAddon(xterm) {
        const sendingKeybindingsToShell = this._configurationService.getValue(TERMINAL_CONFIG_SECTION).sendKeybindingsToShell;
        if (sendingKeybindingsToShell || this._instance.shellType !== 'pwsh') {
            this._addon.clear();
            return;
        }
        if (this._terminalSuggestWidgetVisibleContextKey) {
            const addon = this._addon.value = this._instantiationService.createInstance(SuggestAddon, TerminalSuggestContribution_1._cachedPwshCommands, this._instance.capabilities, this._terminalSuggestWidgetVisibleContextKey);
            xterm.loadAddon(addon);
            if (this._instance.target === TerminalLocation.Editor) {
                addon.setContainerWithOverflow(xterm.element);
            }
            else {
                addon.setContainerWithOverflow(dom.findParentWithClass(xterm.element, 'panel'));
            }
            addon.setScreen(xterm.element.querySelector('.xterm-screen'));
            this.add(this._instance.onDidBlur(() => addon.hideSuggestWidget()));
            this.add(addon.onAcceptedCompletion(async (text) => {
                this._instance.focus();
                this._instance.sendText(text, false);
            }));
            this.add(this._instance.onWillPaste(() => addon.isPasting = true));
            this.add(this._instance.onDidPaste(() => {
                setTimeout(() => addon.isPasting = false, 100);
            }));
            if (!isWindows) {
                let barrier;
                this.add(addon.onDidRequestCompletions(() => {
                    barrier = new AutoOpenBarrier(2000);
                    this._instance.pauseInputEvents(barrier);
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
    __param(3, IContextKeyService),
    __param(4, IConfigurationService),
    __param(5, IInstantiationService),
    __param(6, IStorageService),
    __metadata("design:paramtypes", [Object, Object, TerminalWidgetManager, Object, Object, Object, Object])
], TerminalSuggestContribution);
registerTerminalContribution(TerminalSuggestContribution.ID, TerminalSuggestContribution);
registerSendSequenceKeybinding('\x1b[24~e', {
    when: ContextKeyExpr.and(TerminalContextKeys.focus, ContextKeyExpr.equals("terminalShellType", "pwsh"), TerminalContextKeys.terminalShellIntegrationEnabled, CONTEXT_ACCESSIBILITY_MODE_ENABLED.negate(), ContextKeyExpr.equals(`config.${"terminal.integrated.suggest.enabled"}`, true)),
    primary: 2048 | 10,
    mac: { primary: 256 | 10 }
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.selectPrevSuggestion",
    title: localize2('workbench.action.terminal.selectPrevSuggestion', 'Select the Previous Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 16,
        weight: 200 + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.selectPrevPageSuggestion",
    title: localize2('workbench.action.terminal.selectPrevPageSuggestion', 'Select the Previous Page Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 11,
        weight: 200 + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectPreviousPageSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.selectNextSuggestion",
    title: localize2('workbench.action.terminal.selectNextSuggestion', 'Select the Next Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 18,
        weight: 200 + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.selectNextPageSuggestion",
    title: localize2('workbench.action.terminal.selectNextPageSuggestion', 'Select the Next Page Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 12,
        weight: 200 + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.selectNextPageSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.acceptSelectedSuggestion",
    title: localize2('workbench.action.terminal.acceptSelectedSuggestion', 'Accept Selected Suggestion'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 2,
        weight: 200 + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.acceptSelectedSuggestionEnter",
    title: localize2('workbench.action.terminal.acceptSelectedSuggestionEnter', 'Accept Selected Suggestion (Enter)'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 3,
        weight: 200 + 1,
        when: ContextKeyExpr.notEquals(`config.${"terminal.integrated.suggest.runOnEnter"}`, 'ignore'),
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.acceptSelectedSuggestion(undefined, true)
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.hideSuggestWidget",
    title: localize2('workbench.action.terminal.hideSuggestWidget', 'Hide Suggest Widget'),
    f1: false,
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), TerminalContextKeys.focus, TerminalContextKeys.isOpen, TerminalContextKeys.suggestWidgetVisible),
    keybinding: {
        primary: 9,
        weight: 200 + 1
    },
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.addon?.hideSuggestWidget()
});
registerActiveInstanceAction({
    id: "workbench.action.terminal.clearSuggestCache",
    title: localize2('workbench.action.terminal.clearSuggestCache', 'Clear Suggest Cache'),
    f1: true,
    run: (activeInstance) => TerminalSuggestContribution.get(activeInstance)?.clearSuggestCache()
});
