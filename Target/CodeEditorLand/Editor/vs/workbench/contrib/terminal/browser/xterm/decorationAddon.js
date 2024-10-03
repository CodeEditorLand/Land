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
import * as dom from '../../../../../base/browser/dom.js';
import { Separator } from '../../../../../base/common/actions.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore, dispose, toDisposable } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { localize } from '../../../../../nls.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IClipboardService } from '../../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { INotificationService, Severity } from '../../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { terminalDecorationError, terminalDecorationIncomplete, terminalDecorationMark, terminalDecorationSuccess } from '../terminalIcons.js';
import { TerminalDecorationHoverManager, updateLayout } from './decorationStyles.js';
import { TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR, TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR, TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR } from '../../common/terminalColorRegistry.js';
import { ILifecycleService } from '../../../../services/lifecycle/common/lifecycle.js';
let DecorationAddon = class DecorationAddon extends Disposable {
    constructor(_capabilities, _clipboardService, _contextMenuService, _configurationService, _themeService, _openerService, _quickInputService, lifecycleService, _commandService, instantiationService, _accessibilitySignalService, _notificationService) {
        super();
        this._capabilities = _capabilities;
        this._clipboardService = _clipboardService;
        this._contextMenuService = _contextMenuService;
        this._configurationService = _configurationService;
        this._themeService = _themeService;
        this._openerService = _openerService;
        this._quickInputService = _quickInputService;
        this._commandService = _commandService;
        this._accessibilitySignalService = _accessibilitySignalService;
        this._notificationService = _notificationService;
        this._capabilityDisposables = new Map();
        this._decorations = new Map();
        this._onDidRequestRunCommand = this._register(new Emitter());
        this.onDidRequestRunCommand = this._onDidRequestRunCommand.event;
        this._register(toDisposable(() => this._dispose()));
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("terminal.integrated.fontSize") || e.affectsConfiguration("terminal.integrated.lineHeight")) {
                this.refreshLayouts();
            }
            else if (e.affectsConfiguration('workbench.colorCustomizations')) {
                this._refreshStyles(true);
            }
            else if (e.affectsConfiguration("terminal.integrated.shellIntegration.decorationsEnabled")) {
                this._removeCapabilityDisposables(2);
                this._updateDecorationVisibility();
            }
        }));
        this._register(this._themeService.onDidColorThemeChange(() => this._refreshStyles(true)));
        this._updateDecorationVisibility();
        this._register(this._capabilities.onDidAddCapabilityType(c => this._createCapabilityDisposables(c)));
        this._register(this._capabilities.onDidRemoveCapabilityType(c => this._removeCapabilityDisposables(c)));
        this._register(lifecycleService.onWillShutdown(() => this._disposeAllDecorations()));
        this._terminalDecorationHoverManager = this._register(instantiationService.createInstance(TerminalDecorationHoverManager));
    }
    _removeCapabilityDisposables(c) {
        const disposables = this._capabilityDisposables.get(c);
        if (disposables) {
            dispose(disposables);
        }
        this._capabilityDisposables.delete(c);
    }
    _createCapabilityDisposables(c) {
        const store = new DisposableStore();
        const capability = this._capabilities.get(c);
        if (!capability || this._capabilityDisposables.has(c)) {
            return;
        }
        switch (capability.type) {
            case 4:
                store.add(capability.onMarkAdded(mark => this.registerMarkDecoration(mark)));
                break;
            case 2: {
                const disposables = this._getCommandDetectionListeners(capability);
                for (const d of disposables) {
                    store.add(d);
                }
                break;
            }
        }
        this._capabilityDisposables.set(c, store);
    }
    registerMarkDecoration(mark) {
        if (!this._terminal || (!this._showGutterDecorations && !this._showOverviewRulerDecorations)) {
            return undefined;
        }
        if (mark.hidden) {
            return undefined;
        }
        return this.registerCommandDecoration(undefined, undefined, mark);
    }
    _updateDecorationVisibility() {
        const showDecorations = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled");
        this._showGutterDecorations = (showDecorations === 'both' || showDecorations === 'gutter');
        this._showOverviewRulerDecorations = (showDecorations === 'both' || showDecorations === 'overviewRuler');
        this._disposeAllDecorations();
        if (this._showGutterDecorations || this._showOverviewRulerDecorations) {
            this._attachToCommandCapability();
            this._updateGutterDecorationVisibility();
        }
        const currentCommand = this._capabilities.get(2)?.executingCommandObject;
        if (currentCommand) {
            this.registerCommandDecoration(currentCommand, true);
        }
    }
    _disposeAllDecorations() {
        this._placeholderDecoration?.dispose();
        for (const value of this._decorations.values()) {
            value.decoration.dispose();
            dispose(value.disposables);
        }
    }
    _updateGutterDecorationVisibility() {
        const commandDecorationElements = this._terminal?.element?.querySelectorAll("terminal-command-decoration");
        if (commandDecorationElements) {
            for (const commandDecorationElement of commandDecorationElements) {
                this._updateCommandDecorationVisibility(commandDecorationElement);
            }
        }
    }
    _updateCommandDecorationVisibility(commandDecorationElement) {
        if (this._showGutterDecorations) {
            commandDecorationElement.classList.remove("hide");
        }
        else {
            commandDecorationElement.classList.add("hide");
        }
    }
    refreshLayouts() {
        updateLayout(this._configurationService, this._placeholderDecoration?.element);
        for (const decoration of this._decorations) {
            updateLayout(this._configurationService, decoration[1].decoration.element);
        }
    }
    _refreshStyles(refreshOverviewRulerColors) {
        if (refreshOverviewRulerColors) {
            for (const decoration of this._decorations.values()) {
                const color = this._getDecorationCssColor(decoration)?.toString() ?? '';
                if (decoration.decoration.options?.overviewRulerOptions) {
                    decoration.decoration.options.overviewRulerOptions.color = color;
                }
                else if (decoration.decoration.options) {
                    decoration.decoration.options.overviewRulerOptions = { color };
                }
            }
        }
        this._updateClasses(this._placeholderDecoration?.element);
        for (const decoration of this._decorations.values()) {
            this._updateClasses(decoration.decoration.element, decoration.exitCode, decoration.markProperties);
        }
    }
    _dispose() {
        this._terminalDecorationHoverManager.dispose();
        for (const disposable of this._capabilityDisposables.values()) {
            dispose(disposable);
        }
        this.clearDecorations();
    }
    _clearPlaceholder() {
        this._placeholderDecoration?.dispose();
        this._placeholderDecoration = undefined;
    }
    clearDecorations() {
        this._placeholderDecoration?.marker.dispose();
        this._clearPlaceholder();
        this._disposeAllDecorations();
        this._decorations.clear();
    }
    _attachToCommandCapability() {
        if (this._capabilities.has(2)) {
            const capability = this._capabilities.get(2);
            const disposables = this._getCommandDetectionListeners(capability);
            const store = new DisposableStore();
            for (const d of disposables) {
                store.add(d);
            }
            this._capabilityDisposables.set(2, store);
        }
    }
    _getCommandDetectionListeners(capability) {
        if (this._capabilityDisposables.has(2)) {
            const disposables = this._capabilityDisposables.get(2);
            dispose(disposables);
            this._capabilityDisposables.delete(capability.type);
        }
        const commandDetectionListeners = [];
        if (capability.executingCommandObject?.marker) {
            this.registerCommandDecoration(capability.executingCommandObject, true);
        }
        commandDetectionListeners.push(capability.onCommandStarted(command => this.registerCommandDecoration(command, true)));
        for (const command of capability.commands) {
            this.registerCommandDecoration(command);
        }
        commandDetectionListeners.push(capability.onCommandFinished(command => {
            this.registerCommandDecoration(command);
            if (command.exitCode) {
                this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalCommandFailed);
            }
            else {
                this._accessibilitySignalService.playSignal(AccessibilitySignal.terminalCommandSucceeded);
            }
        }));
        commandDetectionListeners.push(capability.onCommandInvalidated(commands => {
            for (const command of commands) {
                const id = command.marker?.id;
                if (id) {
                    const match = this._decorations.get(id);
                    if (match) {
                        match.decoration.dispose();
                        dispose(match.disposables);
                    }
                }
            }
        }));
        commandDetectionListeners.push(capability.onCurrentCommandInvalidated((request) => {
            if (request.reason === "noProblemsReported") {
                const lastDecoration = Array.from(this._decorations.entries())[this._decorations.size - 1];
                lastDecoration?.[1].decoration.dispose();
            }
            else if (request.reason === "windows") {
                this._clearPlaceholder();
            }
        }));
        return commandDetectionListeners;
    }
    activate(terminal) {
        this._terminal = terminal;
        this._attachToCommandCapability();
    }
    registerCommandDecoration(command, beforeCommandExecution, markProperties) {
        if (!this._terminal || (beforeCommandExecution && !command) || (!this._showGutterDecorations && !this._showOverviewRulerDecorations)) {
            return undefined;
        }
        const marker = command?.marker || markProperties?.marker;
        if (!marker) {
            throw new Error(`cannot add a decoration for a command ${JSON.stringify(command)} with no marker`);
        }
        this._clearPlaceholder();
        const color = this._getDecorationCssColor(command)?.toString() ?? '';
        const decoration = this._terminal.registerDecoration({
            marker,
            overviewRulerOptions: this._showOverviewRulerDecorations ? (beforeCommandExecution
                ? { color, position: 'left' }
                : { color, position: command?.exitCode ? 'right' : 'left' }) : undefined
        });
        if (!decoration) {
            return undefined;
        }
        if (beforeCommandExecution) {
            this._placeholderDecoration = decoration;
        }
        decoration.onRender(element => {
            if (element.classList.contains(".xterm-decoration-overview-ruler")) {
                return;
            }
            if (!this._decorations.get(decoration.marker.id)) {
                decoration.onDispose(() => this._decorations.delete(decoration.marker.id));
                this._decorations.set(decoration.marker.id, {
                    decoration,
                    disposables: this._createDisposables(element, command, markProperties),
                    exitCode: command?.exitCode,
                    markProperties: command?.markProperties
                });
            }
            if (!element.classList.contains("codicon") || command?.marker?.line === 0) {
                updateLayout(this._configurationService, element);
                this._updateClasses(element, command?.exitCode, command?.markProperties || markProperties);
            }
        });
        return decoration;
    }
    _createDisposables(element, command, markProperties) {
        if (command?.exitCode === undefined && !command?.markProperties) {
            return [];
        }
        else if (command?.markProperties || markProperties) {
            return [this._terminalDecorationHoverManager.createHover(element, command || markProperties, markProperties?.hoverMessage)];
        }
        return [...this._createContextMenu(element, command), this._terminalDecorationHoverManager.createHover(element, command)];
    }
    _updateClasses(element, exitCode, markProperties) {
        if (!element) {
            return;
        }
        for (const classes of element.classList) {
            element.classList.remove(classes);
        }
        element.classList.add("terminal-command-decoration", "codicon", "xterm-decoration");
        if (markProperties) {
            element.classList.add("default-color", ...ThemeIcon.asClassNameArray(terminalDecorationMark));
            if (!markProperties.hoverMessage) {
                element.classList.add("default");
            }
        }
        else {
            this._updateCommandDecorationVisibility(element);
            if (exitCode === undefined) {
                element.classList.add("default-color", "default");
                element.classList.add(...ThemeIcon.asClassNameArray(terminalDecorationIncomplete));
            }
            else if (exitCode) {
                element.classList.add("error");
                element.classList.add(...ThemeIcon.asClassNameArray(terminalDecorationError));
            }
            else {
                element.classList.add(...ThemeIcon.asClassNameArray(terminalDecorationSuccess));
            }
        }
    }
    _createContextMenu(element, command) {
        return [
            dom.addDisposableListener(element, dom.EventType.MOUSE_DOWN, async (e) => {
                e.stopImmediatePropagation();
            }),
            dom.addDisposableListener(element, dom.EventType.CLICK, async (e) => {
                e.stopImmediatePropagation();
                this._terminalDecorationHoverManager.hideHover();
                const actions = await this._getCommandActions(command);
                this._contextMenuService.showContextMenu({ getAnchor: () => element, getActions: () => actions });
            }),
            dom.addDisposableListener(element, dom.EventType.CONTEXT_MENU, async (e) => {
                e.stopImmediatePropagation();
                this._terminalDecorationHoverManager.hideHover();
                const actions = this._getContextMenuActions();
                this._contextMenuService.showContextMenu({ getAnchor: () => element, getActions: () => actions });
            }),
        ];
    }
    _getContextMenuActions() {
        const label = localize('workbench.action.terminal.toggleVisibility', "Toggle Visibility");
        return [
            {
                class: undefined, tooltip: label, id: 'terminal.toggleVisibility', label, enabled: true,
                run: async () => {
                    this._showToggleVisibilityQuickPick();
                }
            }
        ];
    }
    async _getCommandActions(command) {
        const actions = [];
        if (command.command !== '') {
            const labelRun = localize("terminal.rerunCommand", 'Rerun Command');
            actions.push({
                class: undefined, tooltip: labelRun, id: 'terminal.rerunCommand', label: labelRun, enabled: true,
                run: async () => {
                    if (command.command === '') {
                        return;
                    }
                    if (!command.isTrusted) {
                        const shouldRun = await new Promise(r => {
                            this._notificationService.prompt(Severity.Info, localize('rerun', 'Do you want to run the command: {0}', command.command), [{
                                    label: localize('yes', 'Yes'),
                                    run: () => r(true)
                                }, {
                                    label: localize('no', 'No'),
                                    run: () => r(false)
                                }]);
                        });
                        if (!shouldRun) {
                            return;
                        }
                    }
                    this._onDidRequestRunCommand.fire({ command });
                }
            });
            actions.push(new Separator());
            const labelCopy = localize("terminal.copyCommand", 'Copy Command');
            actions.push({
                class: undefined, tooltip: labelCopy, id: 'terminal.copyCommand', label: labelCopy, enabled: true,
                run: () => this._clipboardService.writeText(command.command)
            });
        }
        if (command.hasOutput()) {
            const labelCopyCommandAndOutput = localize("terminal.copyCommandAndOutput", 'Copy Command and Output');
            actions.push({
                class: undefined, tooltip: labelCopyCommandAndOutput, id: 'terminal.copyCommandAndOutput', label: labelCopyCommandAndOutput, enabled: true,
                run: () => {
                    const output = command.getOutput();
                    if (typeof output === 'string') {
                        this._clipboardService.writeText(`${command.command !== '' ? command.command + '\n' : ''}${output}`);
                    }
                }
            });
            const labelText = localize("terminal.copyOutput", 'Copy Output');
            actions.push({
                class: undefined, tooltip: labelText, id: 'terminal.copyOutput', label: labelText, enabled: true,
                run: () => {
                    const text = command.getOutput();
                    if (typeof text === 'string') {
                        this._clipboardService.writeText(text);
                    }
                }
            });
            const labelHtml = localize("terminal.copyOutputAsHtml", 'Copy Output as HTML');
            actions.push({
                class: undefined, tooltip: labelHtml, id: 'terminal.copyOutputAsHtml', label: labelHtml, enabled: true,
                run: () => this._onDidRequestRunCommand.fire({ command, copyAsHtml: true })
            });
        }
        if (actions.length > 0) {
            actions.push(new Separator());
        }
        const labelRunRecent = localize('workbench.action.terminal.runRecentCommand', "Run Recent Command");
        actions.push({
            class: undefined, tooltip: labelRunRecent, id: 'workbench.action.terminal.runRecentCommand', label: labelRunRecent, enabled: true,
            run: () => this._commandService.executeCommand('workbench.action.terminal.runRecentCommand')
        });
        const labelGoToRecent = localize('workbench.action.terminal.goToRecentDirectory', "Go To Recent Directory");
        actions.push({
            class: undefined, tooltip: labelRunRecent, id: 'workbench.action.terminal.goToRecentDirectory', label: labelGoToRecent, enabled: true,
            run: () => this._commandService.executeCommand('workbench.action.terminal.goToRecentDirectory')
        });
        actions.push(new Separator());
        const labelAbout = localize("terminal.learnShellIntegration", 'Learn About Shell Integration');
        actions.push({
            class: undefined, tooltip: labelAbout, id: 'terminal.learnShellIntegration', label: labelAbout, enabled: true,
            run: () => this._openerService.open('https://code.visualstudio.com/docs/terminal/shell-integration')
        });
        return actions;
    }
    _showToggleVisibilityQuickPick() {
        const quickPick = this._register(this._quickInputService.createQuickPick());
        quickPick.hideInput = true;
        quickPick.hideCheckAll = true;
        quickPick.canSelectMany = true;
        quickPick.title = localize('toggleVisibility', 'Toggle visibility');
        const configValue = this._configurationService.getValue("terminal.integrated.shellIntegration.decorationsEnabled");
        const gutterIcon = {
            label: localize('gutter', 'Gutter command decorations'),
            picked: configValue !== 'never' && configValue !== 'overviewRuler'
        };
        const overviewRulerIcon = {
            label: localize('overviewRuler', 'Overview ruler command decorations'),
            picked: configValue !== 'never' && configValue !== 'gutter'
        };
        quickPick.items = [gutterIcon, overviewRulerIcon];
        const selectedItems = [];
        if (configValue !== 'never') {
            if (configValue !== 'gutter') {
                selectedItems.push(gutterIcon);
            }
            if (configValue !== 'overviewRuler') {
                selectedItems.push(overviewRulerIcon);
            }
        }
        quickPick.selectedItems = selectedItems;
        this._register(quickPick.onDidChangeSelection(async (e) => {
            let newValue = 'never';
            if (e.includes(gutterIcon)) {
                if (e.includes(overviewRulerIcon)) {
                    newValue = 'both';
                }
                else {
                    newValue = 'gutter';
                }
            }
            else if (e.includes(overviewRulerIcon)) {
                newValue = 'overviewRuler';
            }
            await this._configurationService.updateValue("terminal.integrated.shellIntegration.decorationsEnabled", newValue);
        }));
        quickPick.ok = false;
        quickPick.show();
    }
    _getDecorationCssColor(decorationOrCommand) {
        let colorId;
        if (decorationOrCommand?.exitCode === undefined) {
            colorId = TERMINAL_COMMAND_DECORATION_DEFAULT_BACKGROUND_COLOR;
        }
        else {
            colorId = decorationOrCommand.exitCode ? TERMINAL_COMMAND_DECORATION_ERROR_BACKGROUND_COLOR : TERMINAL_COMMAND_DECORATION_SUCCESS_BACKGROUND_COLOR;
        }
        return this._themeService.getColorTheme().getColor(colorId)?.toString();
    }
};
DecorationAddon = __decorate([
    __param(1, IClipboardService),
    __param(2, IContextMenuService),
    __param(3, IConfigurationService),
    __param(4, IThemeService),
    __param(5, IOpenerService),
    __param(6, IQuickInputService),
    __param(7, ILifecycleService),
    __param(8, ICommandService),
    __param(9, IInstantiationService),
    __param(10, IAccessibilitySignalService),
    __param(11, INotificationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], DecorationAddon);
export { DecorationAddon };
