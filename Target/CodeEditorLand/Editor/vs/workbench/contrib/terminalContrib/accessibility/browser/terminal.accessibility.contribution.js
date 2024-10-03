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
var TextAreaSyncContribution_1, TerminalAccessibleViewContribution_1;
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { localize2 } from '../../../../../nls.js';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../../platform/accessibility/common/accessibility.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { AccessibilityHelpAction, AccessibleViewAction } from '../../../accessibility/browser/accessibleViewActions.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { registerTerminalAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { TerminalContextKeys } from '../../../terminal/common/terminalContextKey.js';
import { BufferContentTracker } from './bufferContentTracker.js';
import { TerminalAccessibilityHelpProvider } from './terminalAccessibilityHelp.js';
import { TextAreaSyncAddon } from './textAreaSyncAddon.js';
import { Position } from '../../../../../editor/common/core/position.js';
import { TerminalAccessibleBufferProvider } from './terminalAccessibleBufferProvider.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { Event } from '../../../../../base/common/event.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IAccessibleViewService } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { accessibleViewCurrentProviderId, accessibleViewIsShown } from '../../../accessibility/browser/accessibilityConfiguration.js';
import { isWindows } from '../../../../../base/common/platform.js';
let TextAreaSyncContribution = class TextAreaSyncContribution extends DisposableStore {
    static { TextAreaSyncContribution_1 = this; }
    static { this.ID = 'terminal.textAreaSync'; }
    static get(instance) {
        return instance.getContribution(TextAreaSyncContribution_1.ID);
    }
    constructor(_instance, processManager, widgetManager, _instantiationService) {
        super();
        this._instance = _instance;
        this._instantiationService = _instantiationService;
    }
    layout(xterm) {
        if (this._addon) {
            return;
        }
        this._addon = this.add(this._instantiationService.createInstance(TextAreaSyncAddon, this._instance.capabilities));
        xterm.raw.loadAddon(this._addon);
        this._addon.activate(xterm.raw);
    }
};
TextAreaSyncContribution = TextAreaSyncContribution_1 = __decorate([
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, TerminalWidgetManager, Object])
], TextAreaSyncContribution);
registerTerminalContribution(TextAreaSyncContribution.ID, TextAreaSyncContribution);
let TerminalAccessibleViewContribution = class TerminalAccessibleViewContribution extends Disposable {
    static { TerminalAccessibleViewContribution_1 = this; }
    static { this.ID = 'terminal.accessibleBufferProvider'; }
    static get(instance) {
        return instance.getContribution(TerminalAccessibleViewContribution_1.ID);
    }
    constructor(_instance, processManager, widgetManager, _accessibleViewService, _instantiationService, _terminalService, _configurationService, _contextKeyService, _accessibilitySignalService) {
        super();
        this._instance = _instance;
        this._accessibleViewService = _accessibleViewService;
        this._instantiationService = _instantiationService;
        this._terminalService = _terminalService;
        this._configurationService = _configurationService;
        this._contextKeyService = _contextKeyService;
        this._accessibilitySignalService = _accessibilitySignalService;
        this._onDidRunCommand = new MutableDisposable();
        this._register(AccessibleViewAction.addImplementation(90, 'terminal', () => {
            if (this._terminalService.activeInstance !== this._instance) {
                return false;
            }
            this.show();
            return true;
        }, TerminalContextKeys.focus));
        this._register(_instance.onDidExecuteText(() => {
            const focusAfterRun = _configurationService.getValue("terminal.integrated.focusAfterRun");
            if (focusAfterRun === 'terminal') {
                _instance.focus(true);
            }
            else if (focusAfterRun === 'accessible-buffer') {
                this.show();
            }
        }));
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.accessibleViewFocusOnCommandExecution")) {
                this._updateCommandExecutedListener();
            }
        }));
        this._register(this._instance.capabilities.onDidAddCapability(e => {
            if (e.capability.type === 2) {
                this._updateCommandExecutedListener();
            }
        }));
    }
    xtermReady(xterm) {
        const addon = this._instantiationService.createInstance(TextAreaSyncAddon, this._instance.capabilities);
        xterm.raw.loadAddon(addon);
        addon.activate(xterm.raw);
        this._xterm = xterm;
        this._register(this._xterm.raw.onWriteParsed(async () => {
            if (this._terminalService.activeInstance !== this._instance) {
                return;
            }
            if (this._isTerminalAccessibleViewOpen() && this._xterm.raw.buffer.active.baseY === 0) {
                this.show();
            }
        }));
        const onRequestUpdateEditor = Event.latch(this._xterm.raw.onScroll);
        this._register(onRequestUpdateEditor(() => {
            if (this._terminalService.activeInstance !== this._instance) {
                return;
            }
            if (this._isTerminalAccessibleViewOpen()) {
                this.show();
            }
        }));
    }
    _updateCommandExecutedListener() {
        if (!this._instance.capabilities.has(2)) {
            return;
        }
        if (!this._configurationService.getValue("terminal.integrated.accessibleViewFocusOnCommandExecution")) {
            this._onDidRunCommand.clear();
            return;
        }
        else if (this._onDidRunCommand.value) {
            return;
        }
        const capability = this._instance.capabilities.get(2);
        this._onDidRunCommand.value = this._register(capability.onCommandExecuted(() => {
            if (this._instance.hasFocus) {
                this.show();
            }
        }));
    }
    _isTerminalAccessibleViewOpen() {
        return accessibleViewCurrentProviderId.getValue(this._contextKeyService) === "terminal";
    }
    show() {
        if (!this._xterm) {
            return;
        }
        if (!this._bufferTracker) {
            this._bufferTracker = this._register(this._instantiationService.createInstance(BufferContentTracker, this._xterm));
        }
        if (!this._bufferProvider) {
            this._bufferProvider = this._register(this._instantiationService.createInstance(TerminalAccessibleBufferProvider, this._instance, this._bufferTracker, () => {
                return this._register(this._instantiationService.createInstance(TerminalAccessibilityHelpProvider, this._instance, this._xterm)).provideContent();
            }));
        }
        const position = this._configurationService.getValue("terminal.integrated.accessibleViewPreserveCursorPosition") ? this._accessibleViewService.getPosition("terminal") : undefined;
        this._accessibleViewService.show(this._bufferProvider, position);
    }
    navigateToCommand(type) {
        const currentLine = this._accessibleViewService.getPosition("terminal")?.lineNumber;
        const commands = this._getCommandsWithEditorLine();
        if (!commands?.length || !currentLine) {
            return;
        }
        const filteredCommands = type === "previous" ? commands.filter(c => c.lineNumber < currentLine).sort((a, b) => b.lineNumber - a.lineNumber) : commands.filter(c => c.lineNumber > currentLine).sort((a, b) => a.lineNumber - b.lineNumber);
        if (!filteredCommands.length) {
            return;
        }
        const command = filteredCommands[0];
        const commandLine = command.command.command;
        if (!isWindows && commandLine) {
            this._accessibleViewService.setPosition(new Position(command.lineNumber, 1), true);
            alert(commandLine);
        }
        else {
            this._accessibleViewService.setPosition(new Position(command.lineNumber, 1), true, true);
        }
        if (command.exitCode) {
            this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalCommandFailed);
        }
        else {
            this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalCommandSucceeded);
        }
    }
    _getCommandsWithEditorLine() {
        const capability = this._instance.capabilities.get(2);
        const commands = capability?.commands;
        const currentCommand = capability?.currentCommand;
        if (!commands?.length) {
            return;
        }
        const result = [];
        for (const command of commands) {
            const lineNumber = this._getEditorLineForCommand(command);
            if (!lineNumber) {
                continue;
            }
            result.push({ command, lineNumber, exitCode: command.exitCode });
        }
        if (currentCommand) {
            const lineNumber = this._getEditorLineForCommand(currentCommand);
            if (!!lineNumber) {
                result.push({ command: currentCommand, lineNumber });
            }
        }
        return result;
    }
    _getEditorLineForCommand(command) {
        if (!this._bufferTracker) {
            return;
        }
        let line;
        if ('marker' in command) {
            line = command.marker?.line;
        }
        else if ('commandStartMarker' in command) {
            line = command.commandStartMarker?.line;
        }
        if (line === undefined || line < 0) {
            return;
        }
        line = this._bufferTracker.bufferToEditorLineMapping.get(line);
        if (line === undefined) {
            return;
        }
        return line + 1;
    }
};
TerminalAccessibleViewContribution = TerminalAccessibleViewContribution_1 = __decorate([
    __param(3, IAccessibleViewService),
    __param(4, IInstantiationService),
    __param(5, ITerminalService),
    __param(6, IConfigurationService),
    __param(7, IContextKeyService),
    __param(8, IAccessibilitySignalService),
    __metadata("design:paramtypes", [Object, Object, TerminalWidgetManager, Object, Object, Object, Object, Object, Object])
], TerminalAccessibleViewContribution);
export { TerminalAccessibleViewContribution };
registerTerminalContribution(TerminalAccessibleViewContribution.ID, TerminalAccessibleViewContribution);
export class TerminalAccessibilityHelpContribution extends Disposable {
    constructor() {
        super();
        this._register(AccessibilityHelpAction.addImplementation(105, 'terminal', async (accessor) => {
            const instantiationService = accessor.get(IInstantiationService);
            const terminalService = accessor.get(ITerminalService);
            const accessibleViewService = accessor.get(IAccessibleViewService);
            const instance = await terminalService.getActiveOrCreateInstance();
            await terminalService.revealActiveTerminal();
            const terminal = instance?.xterm;
            if (!terminal) {
                return;
            }
            accessibleViewService.show(instantiationService.createInstance(TerminalAccessibilityHelpProvider, instance, terminal));
        }, ContextKeyExpr.or(TerminalContextKeys.focus, ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal")))));
    }
}
registerTerminalContribution(TerminalAccessibilityHelpContribution.ID, TerminalAccessibilityHelpContribution);
class FocusAccessibleBufferAction extends Action2 {
    constructor() {
        super({
            id: "workbench.action.terminal.focusAccessibleBuffer",
            title: localize2('workbench.action.terminal.focusAccessibleBuffer', "Focus Accessible Terminal View"),
            precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated),
            keybinding: [
                {
                    primary: 512 | 60,
                    secondary: [2048 | 16],
                    linux: {
                        primary: 512 | 60 | 1024,
                        secondary: [2048 | 16]
                    },
                    weight: 200,
                    when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, TerminalContextKeys.focus)
                }
            ]
        });
    }
    async run(accessor, ...args) {
        const terminalService = accessor.get(ITerminalService);
        const terminal = await terminalService.getActiveOrCreateInstance();
        if (!terminal?.xterm) {
            return;
        }
        TerminalAccessibleViewContribution.get(terminal)?.show();
    }
}
registerAction2(FocusAccessibleBufferAction);
registerTerminalAction({
    id: "workbench.action.terminal.accessibleBufferGoToNextCommand",
    title: localize2('workbench.action.terminal.accessibleBufferGoToNextCommand', "Accessible Buffer Go to Next Command"),
    precondition: ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated, ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal"))),
    keybinding: [
        {
            primary: 512 | 18,
            when: ContextKeyExpr.and(ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal"))),
            weight: 200 + 2
        }
    ],
    run: async (c) => {
        const instance = await c.service.activeInstance;
        if (!instance) {
            return;
        }
        await TerminalAccessibleViewContribution.get(instance)?.navigateToCommand("next");
    }
});
registerTerminalAction({
    id: "workbench.action.terminal.accessibleBufferGoToPreviousCommand",
    title: localize2('workbench.action.terminal.accessibleBufferGoToPreviousCommand', "Accessible Buffer Go to Previous Command"),
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal"))),
    keybinding: [
        {
            primary: 512 | 16,
            when: ContextKeyExpr.and(ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal"))),
            weight: 200 + 2
        }
    ],
    run: async (c) => {
        const instance = await c.service.activeInstance;
        if (!instance) {
            return;
        }
        await TerminalAccessibleViewContribution.get(instance)?.navigateToCommand("previous");
    }
});
registerTerminalAction({
    id: "workbench.action.terminal.scrollToBottomAccessibleView",
    title: localize2('workbench.action.terminal.scrollToBottomAccessibleView', 'Scroll to Accessible View Bottom'),
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal"))),
    keybinding: {
        primary: 2048 | 13,
        linux: { primary: 1024 | 13 },
        when: accessibleViewCurrentProviderId.isEqualTo("terminal"),
        weight: 200
    },
    run: (c, accessor) => {
        const accessibleViewService = accessor.get(IAccessibleViewService);
        const lastPosition = accessibleViewService.getLastPosition();
        if (!lastPosition) {
            return;
        }
        accessibleViewService.setPosition(lastPosition, true);
    }
});
registerTerminalAction({
    id: "workbench.action.terminal.scrollToTopAccessibleView",
    title: localize2('workbench.action.terminal.scrollToTopAccessibleView', 'Scroll to Accessible View Top'),
    precondition: ContextKeyExpr.and(ContextKeyExpr.or(TerminalContextKeys.processSupported, TerminalContextKeys.terminalHasBeenCreated), ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal"))),
    keybinding: {
        primary: 2048 | 14,
        linux: { primary: 1024 | 14 },
        when: accessibleViewCurrentProviderId.isEqualTo("terminal"),
        weight: 200
    },
    run: (c, accessor) => {
        const accessibleViewService = accessor.get(IAccessibleViewService);
        accessibleViewService.setPosition(new Position(1, 1), true);
    }
});
