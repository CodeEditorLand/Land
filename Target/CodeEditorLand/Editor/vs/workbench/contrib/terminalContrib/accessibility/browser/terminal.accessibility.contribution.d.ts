import type { Terminal } from '@xterm/xterm';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IAccessibleViewService, NavigationType } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ITerminalContribution, ITerminalInstance, ITerminalService, IXtermTerminal } from '../../../terminal/browser/terminal.js';
import { type ITerminalContributionContext } from '../../../terminal/browser/terminalExtensions.js';
export declare class TerminalAccessibleViewContribution extends Disposable implements ITerminalContribution {
    private readonly _ctx;
    private readonly _accessibilitySignalService;
    private readonly _accessibleViewService;
    private readonly _configurationService;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    private readonly _terminalService;
    static readonly ID = "terminal.accessibleBufferProvider";
    static get(instance: ITerminalInstance): TerminalAccessibleViewContribution | null;
    private _bufferTracker;
    private _bufferProvider;
    private _xterm;
    private readonly _onDidRunCommand;
    constructor(_ctx: ITerminalContributionContext, _accessibilitySignalService: IAccessibilitySignalService, _accessibleViewService: IAccessibleViewService, _configurationService: IConfigurationService, _contextKeyService: IContextKeyService, _instantiationService: IInstantiationService, _terminalService: ITerminalService);
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
