import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { IAccessibleViewContentProvider, AccessibleViewProviderId, IAccessibleViewOptions, IAccessibleViewSymbol } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { ITerminalCommand } from '../../../../../platform/terminal/common/capabilities/capabilities.js';
import { ICurrentPartialCommand } from '../../../../../platform/terminal/common/capabilities/commandDetection/terminalCommand.js';
import { AccessibilityVerbositySettingId } from '../../../accessibility/browser/accessibilityConfiguration.js';
import { ITerminalInstance, ITerminalService } from '../../../terminal/browser/terminal.js';
import { BufferContentTracker } from './bufferContentTracker.js';
export declare class TerminalAccessibleBufferProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _instance;
    private _bufferTracker;
    id: AccessibleViewProviderId;
    options: IAccessibleViewOptions;
    verbositySettingKey: AccessibilityVerbositySettingId;
    private readonly _onDidRequestClearProvider;
    readonly onDidRequestClearLastProvider: import("../../../../workbench.web.main.internal.js").Event<AccessibleViewProviderId>;
    private _focusedInstance;
    constructor(_instance: Pick<ITerminalInstance, 'onDidExecuteText' | 'focus' | 'shellType' | 'capabilities' | 'onDidRequestFocus' | 'resource' | 'onDisposed'>, _bufferTracker: BufferContentTracker, customHelp: () => string, _modelService: IModelService, configurationService: IConfigurationService, _contextKeyService: IContextKeyService, _terminalService: ITerminalService);
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
