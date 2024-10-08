import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IAccessibleViewContentProvider, AccessibleViewProviderId, IAccessibleViewOptions, IAccessibleViewSymbol } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ITerminalCommand } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { ICurrentPartialCommand } from '../../../../../platform/terminal/common/capabilities/commandDetection/terminalCommand.js';
import { AccessibilityVerbositySettingId } from '../../../accessibility/browser/accessibilityConfiguration.js';
import { ITerminalInstance, ITerminalService } from '../../../terminal/browser/terminal.js';
import { BufferContentTracker } from './bufferContentTracker.js';
export declare class TerminalAccessibleBufferProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _instance;
    private _bufferTracker;
    readonly id = AccessibleViewProviderId.Terminal;
    readonly options: IAccessibleViewOptions;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Terminal;
    private _focusedInstance;
    private readonly _onDidRequestClearProvider;
    readonly onDidRequestClearLastProvider: import("../../../../workbench.web.main.internal.js").Event<AccessibleViewProviderId>;
    constructor(_instance: Pick<ITerminalInstance, 'onDidExecuteText' | 'focus' | 'shellType' | 'capabilities' | 'onDidRequestFocus' | 'resource' | 'onDisposed'>, _bufferTracker: BufferContentTracker, customHelp: () => string, configurationService: IConfigurationService, terminalService: ITerminalService);
    onClose(): void;
    provideContent(): string;
    getSymbols(): IAccessibleViewSymbol[];
    private _getCommandsWithEditorLine;
    private _getEditorLineForCommand;
}
export interface ICommandWithEditorLine {
    command: ITerminalCommand | ICurrentPartialCommand;
    lineNumber: number;
    exitCode?: number;
}
