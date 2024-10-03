import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITerminalContribution, ITerminalInstance, ITerminalService, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import { TerminalWidgetManager } from '../../../terminal/browser/widgets/widgetManager.js';
import { ITerminalProcessManager } from '../../../terminal/common/terminal.js';
import type { Terminal } from '@xterm/xterm';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IAccessibleViewService, NavigationType } from '../../../../../platform/accessibility/browser/accessibleView.js';
export declare class TerminalAccessibleViewContribution extends Disposable implements ITerminalContribution {
    private readonly _instance;
    private readonly _accessibleViewService;
    private readonly _instantiationService;
    private readonly _terminalService;
    private readonly _configurationService;
    private readonly _contextKeyService;
    private readonly _accessibilitySignalService;
    static readonly ID = "terminal.accessibleBufferProvider";
    static get(instance: ITerminalInstance): TerminalAccessibleViewContribution | null;
    private _bufferTracker;
    private _bufferProvider;
    private _xterm;
    private readonly _onDidRunCommand;
    constructor(_instance: ITerminalInstance, processManager: ITerminalProcessManager, widgetManager: TerminalWidgetManager, _accessibleViewService: IAccessibleViewService, _instantiationService: IInstantiationService, _terminalService: ITerminalService, _configurationService: IConfigurationService, _contextKeyService: IContextKeyService, _accessibilitySignalService: IAccessibilitySignalService);
    xtermReady(xterm: IXtermTerminal & {
        raw: Terminal;
    }): void;
    private _updateCommandExecutedListener;
    private _isTerminalAccessibleViewOpen;
    show(): void;
    navigateToCommand(type: NavigationType): void;
    private _getCommandsWithEditorLine;
    private _getEditorLineForCommand;
}
export declare class TerminalAccessibilityHelpContribution extends Disposable {
    static ID: 'terminalAccessibilityHelpContribution';
    constructor();
}
