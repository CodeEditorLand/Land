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
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { localize } from '../../../../../nls.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { accessibleViewIsShown, accessibleViewCurrentProviderId } from '../../../accessibility/browser/accessibilityConfiguration.js';
let TerminalAccessibilityHelpProvider = class TerminalAccessibilityHelpProvider extends Disposable {
    onClose() {
        const expr = ContextKeyExpr.and(accessibleViewIsShown, ContextKeyExpr.equals(accessibleViewCurrentProviderId.key, "terminal-help"));
        if (expr?.evaluate(this._contextKeyService.getContext(null))) {
            this._commandService.executeCommand("workbench.action.terminal.focusAccessibleBuffer");
        }
        else {
            this._instance.focus();
        }
        this.dispose();
    }
    constructor(_instance, _xterm, _instantiationService, _contextKeyService, _commandService, _configurationService) {
        super();
        this._instance = _instance;
        this._contextKeyService = _contextKeyService;
        this._commandService = _commandService;
        this._configurationService = _configurationService;
        this.id = "terminal-help";
        this._hasShellIntegration = false;
        this.options = {
            type: "help",
            readMoreUrl: 'https://code.visualstudio.com/docs/editor/accessibility#_terminal-accessibility'
        };
        this.verbositySettingKey = "accessibility.verbosity.terminal";
        this._hasShellIntegration = _xterm.shellIntegration.status === 2;
    }
    provideContent() {
        const content = [
            localize('focusAccessibleTerminalView', 'The Focus Accessible Terminal View command<keybinding:{0}> enables screen readers to read terminal contents.', "workbench.action.terminal.focusAccessibleBuffer"),
            localize('preserveCursor', 'Customize the behavior of the cursor when toggling between the terminal and accessible view with `terminal.integrated.accessibleViewPreserveCursorPosition.`'),
            localize('openDetectedLink', 'The Open Detected Link command<keybinding:{0}> enables screen readers to easily open links found in the terminal.', "workbench.action.terminal.openDetectedLink"),
            localize('newWithProfile', 'The Create New Terminal (With Profile) command<keybinding:{0}> allows for easy terminal creation using a specific profile.', "workbench.action.terminal.newWithProfile"),
            localize('focusAfterRun', 'Configure what gets focused after running selected text in the terminal with `{0}`.', "terminal.integrated.focusAfterRun")
        ];
        if (!this._configurationService.getValue("terminal.integrated.accessibleViewFocusOnCommandExecution")) {
            content.push(localize('focusViewOnExecution', 'Enable `terminal.integrated.accessibleViewFocusOnCommandExecution` to automatically focus the terminal accessible view when a command is executed in the terminal.'));
        }
        if (this._instance.shellType === "cmd") {
            content.push(localize('commandPromptMigration', "Consider using powershell instead of command prompt for an improved experience"));
        }
        if (this._hasShellIntegration) {
            content.push(localize('shellIntegration', "The terminal has a feature called shell integration that offers an enhanced experience and provides useful commands for screen readers such as:"));
            content.push('- ' + localize('goToNextCommand', 'Go to Next Command<keybinding:{0}> in the accessible view', "workbench.action.terminal.accessibleBufferGoToNextCommand"));
            content.push('- ' + localize('goToPreviousCommand', 'Go to Previous Command<keybinding:{0}> in the accessible view', "workbench.action.terminal.accessibleBufferGoToPreviousCommand"));
            content.push('- ' + localize('goToSymbol', 'Go to Symbol<keybinding:{0}>', "editor.action.accessibleViewGoToSymbol"));
            content.push('- ' + localize('runRecentCommand', 'Run Recent Command<keybinding:{0}>', "workbench.action.terminal.runRecentCommand"));
            content.push('- ' + localize('goToRecentDirectory', 'Go to Recent Directory<keybinding:{0}>', "workbench.action.terminal.goToRecentDirectory"));
        }
        else {
            content.push(localize('noShellIntegration', 'Shell integration is not enabled. Some accessibility features may not be available.'));
        }
        return content.join('\n');
    }
};
TerminalAccessibilityHelpProvider = __decorate([
    __param(2, IInstantiationService),
    __param(3, IContextKeyService),
    __param(4, ICommandService),
    __param(5, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], TerminalAccessibilityHelpProvider);
export { TerminalAccessibilityHelpProvider };
