import type { ITerminalAddon } from '@xterm/headless';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ITerminalCapabilityStore, ITerminalCommand } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { IAction } from '../../../../../base/common/actions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
import type { Terminal } from '@xterm/xterm';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
import { IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IActionWidgetService } from '../../../../../platform/actionWidget/browser/actionWidget.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { URI } from '../../../../../base/common/uri.js';
import { ITerminalQuickFixResolvedExtensionOptions, ITerminalQuickFix, ITerminalQuickFixOptions, ITerminalQuickFixService, TerminalQuickFixType } from './quickFix.js';
import { ITerminalCommandSelector } from '../../../../../platform/terminal/common/terminal.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
export interface ITerminalQuickFixAddon {
    showMenu(): void;
    onDidRequestRerunCommand: Event<{
        command: string;
        shouldExecute?: boolean;
    }>;
    registerCommandFinishedListener(options: ITerminalQuickFixOptions): void;
}
export declare class TerminalQuickFixAddon extends Disposable implements ITerminalAddon, ITerminalQuickFixAddon {
    private readonly _aliases;
    private readonly _capabilities;
    private readonly _quickFixService;
    private readonly _commandService;
    private readonly _configurationService;
    private readonly _accessibilitySignalService;
    private readonly _openerService;
    private readonly _telemetryService;
    private readonly _extensionService;
    private readonly _actionWidgetService;
    private readonly _labelService;
    private readonly _onDidRequestRerunCommand;
    readonly onDidRequestRerunCommand: Event<{
        command: string;
        shouldExecute?: boolean;
    }>;
    private _terminal;
    private _commandListeners;
    private _quickFixes;
    private _decoration;
    private _currentRenderContext;
    private _lastQuickFixId;
    private _registeredSelectors;
    constructor(_aliases: string[][] | undefined, _capabilities: ITerminalCapabilityStore, _quickFixService: ITerminalQuickFixService, _commandService: ICommandService, _configurationService: IConfigurationService, _accessibilitySignalService: IAccessibilitySignalService, _openerService: IOpenerService, _telemetryService: ITelemetryService, _extensionService: IExtensionService, _actionWidgetService: IActionWidgetService, _labelService: ILabelService);
    activate(terminal: Terminal): void;
    showMenu(): void;
    registerCommandSelector(selector: ITerminalCommandSelector): void;
    registerCommandFinishedListener(options: ITerminalQuickFixOptions | ITerminalQuickFixResolvedExtensionOptions): void;
    private _registerCommandHandlers;
    private _resolveQuickFixes;
    private _disposeQuickFix;
    private _registerQuickFixDecoration;
}
export interface ITerminalAction extends IAction {
    type: TerminalQuickFixType;
    kind?: 'fix' | 'explain';
    source: string;
    uri?: URI;
    command?: string;
    shouldExecute?: boolean;
}
export declare function getQuickFixesForCommand(aliases: string[][] | undefined, terminal: Terminal, terminalCommand: ITerminalCommand, quickFixOptions: Map<string, ITerminalQuickFixOptions[]>, commandService: ICommandService, openerService: IOpenerService, labelService: ILabelService, onDidRequestRerunCommand?: Emitter<{
    command: string;
    shouldExecute?: boolean;
}>, getResolvedFixes?: (selector: ITerminalQuickFixOptions, lines?: string[]) => Promise<ITerminalQuickFix | ITerminalQuickFix[] | undefined>): Promise<ITerminalAction[] | undefined>;
