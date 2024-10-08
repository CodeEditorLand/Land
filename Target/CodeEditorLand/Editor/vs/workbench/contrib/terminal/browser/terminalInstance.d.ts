import * as dom from '../../../../base/browser/dom.js';
import { Barrier } from '../../../../base/common/async.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, type IReference } from '../../../../base/common/lifecycle.js';
import { OperatingSystem } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKey, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IMarkProperties } from '../../../../platform/terminal/common/capabilities/capabilities.js';
import { TerminalCapabilityStoreMultiplexer } from '../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js';
import { IMergedEnvironmentVariableCollection } from '../../../../platform/terminal/common/environmentVariable.js';
import { IReconnectionProperties, IShellLaunchConfig, ITerminalDimensionsOverride, ITerminalLaunchError, ITerminalLogService, TerminalExitReason, TerminalIcon, TerminalLocation, TerminalShellType, TitleEventSource } from '../../../../platform/terminal/common/terminal.js';
import { IColorTheme, IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceContextService, IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IRequestAddInstanceToGroupEvent, ITerminalConfigurationService, ITerminalContribution, ITerminalInstance, IXtermColorProvider } from './terminal.js';
import { TerminalProcessManager } from './terminalProcessManager.js';
import { ITerminalStatusList } from './terminalStatusList.js';
import { XtermTerminal } from './xterm/xtermTerminal.js';
import { ITerminalProfileResolverService, ProcessState } from '../common/terminal.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { IPathService } from '../../../services/path/common/pathService.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import type { IMarker } from '@xterm/xterm';
import type { IMenu } from '../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
export declare class TerminalInstance extends Disposable implements ITerminalInstance {
    private readonly _terminalShellTypeContextKey;
    private _shellLaunchConfig;
    private readonly _contextKeyService;
    private readonly _contextMenuService;
    private readonly _terminalConfigurationService;
    private readonly _terminalProfileResolverService;
    private readonly _pathService;
    private readonly _keybindingService;
    private readonly _notificationService;
    private readonly _preferencesService;
    private readonly _viewsService;
    private readonly _themeService;
    private readonly _configurationService;
    private readonly _logService;
    private readonly _storageService;
    private readonly _accessibilityService;
    private readonly _productService;
    private readonly _quickInputService;
    private readonly _workspaceContextService;
    private readonly _editorService;
    private readonly _workspaceTrustRequestService;
    private readonly _historyService;
    private readonly _telemetryService;
    private readonly _openerService;
    private readonly _commandService;
    private readonly _accessibilitySignalService;
    private readonly _viewDescriptorService;
    private static _lastKnownCanvasDimensions;
    private static _lastKnownGridDimensions;
    private static _instanceIdCounter;
    private readonly _scopedInstantiationService;
    private readonly _processManager;
    private readonly _contributions;
    private readonly _resource;
    /**
     * Resolves when xterm.js is ready, this will be undefined if the terminal instance is disposed
     * before xterm.js could be created.
     */
    private _xtermReadyPromise;
    private _pressAnyKeyToCloseListener;
    private _instanceId;
    private _latestXtermWriteData;
    private _latestXtermParseData;
    private _isExiting;
    private _hadFocusOnExit;
    private _isVisible;
    private _exitCode;
    private _exitReason;
    private _skipTerminalCommands;
    private _shellType;
    private _title;
    private _titleSource;
    private _container;
    private _wrapperElement;
    get domElement(): HTMLElement;
    private _horizontalScrollbar;
    private _terminalFocusContextKey;
    private _terminalHasFixedWidth;
    private _terminalHasTextContextKey;
    private _terminalAltBufferActiveContextKey;
    private _terminalShellIntegrationEnabledContextKey;
    private _cols;
    private _rows;
    private _fixedCols;
    private _fixedRows;
    private _cwd;
    private _initialCwd;
    private _injectedArgs;
    private _layoutSettingsChanged;
    private _dimensionsOverride;
    private _areLinksReady;
    private readonly _initialDataEventsListener;
    private _initialDataEvents;
    private _containerReadyBarrier;
    private _attachBarrier;
    private _icon;
    private readonly _messageTitleDisposable;
    private _widgetManager;
    private readonly _dndObserver;
    private _lastLayoutDimensions;
    private _hasHadInput;
    private _description?;
    private _processName;
    private _sequence?;
    private _staticTitle?;
    private _workspaceFolder?;
    private _labelComputer?;
    private _userHome?;
    private _hasScrollBar?;
    private _usedShellIntegrationInjection;
    get usedShellIntegrationInjection(): boolean;
    private _lineDataEventAddon;
    private readonly _scopedContextKeyService;
    private _resizeDebouncer?;
    private _pauseInputEventBarrier;
    pauseInputEvents(barrier: Barrier): void;
    readonly capabilities: TerminalCapabilityStoreMultiplexer;
    readonly statusList: ITerminalStatusList;
    get store(): DisposableStore;
    get extEnvironmentVariableCollection(): IMergedEnvironmentVariableCollection | undefined;
    xterm?: XtermTerminal;
    disableLayout: boolean;
    get waitOnExit(): ITerminalInstance['waitOnExit'];
    set waitOnExit(value: ITerminalInstance['waitOnExit']);
    private _targetRef;
    get targetRef(): IReference<TerminalLocation | undefined>;
    get target(): TerminalLocation | undefined;
    set target(value: TerminalLocation | undefined);
    get instanceId(): number;
    get resource(): URI;
    get cols(): number;
    get rows(): number;
    get isDisposed(): boolean;
    get fixedCols(): number | undefined;
    get fixedRows(): number | undefined;
    get maxCols(): number;
    get maxRows(): number;
    get processId(): number | undefined;
    get processReady(): Promise<void>;
    get hasChildProcesses(): boolean;
    get reconnectionProperties(): IReconnectionProperties | undefined;
    get areLinksReady(): boolean;
    get initialDataEvents(): string[] | undefined;
    get exitCode(): number | undefined;
    get exitReason(): TerminalExitReason | undefined;
    get hadFocusOnExit(): boolean;
    get isTitleSetByProcess(): boolean;
    get shellLaunchConfig(): IShellLaunchConfig;
    get shellType(): TerminalShellType | undefined;
    get os(): OperatingSystem | undefined;
    get isRemote(): boolean;
    get remoteAuthority(): string | undefined;
    get hasFocus(): boolean;
    get title(): string;
    get titleSource(): TitleEventSource;
    get icon(): TerminalIcon | undefined;
    get color(): string | undefined;
    get processName(): string;
    get sequence(): string | undefined;
    get staticTitle(): string | undefined;
    get workspaceFolder(): IWorkspaceFolder | undefined;
    get cwd(): string | undefined;
    get initialCwd(): string | undefined;
    get description(): string | undefined;
    get userHome(): string | undefined;
    get shellIntegrationNonce(): string;
    get injectedArgs(): string[] | undefined;
    private readonly _onExit;
    readonly onExit: Event<number | ITerminalLaunchError | undefined>;
    private readonly _onDisposed;
    readonly onDisposed: Event<ITerminalInstance>;
    private readonly _onProcessIdReady;
    readonly onProcessIdReady: Event<ITerminalInstance>;
    private readonly _onProcessReplayComplete;
    readonly onProcessReplayComplete: Event<void>;
    private readonly _onTitleChanged;
    readonly onTitleChanged: Event<ITerminalInstance>;
    private readonly _onIconChanged;
    readonly onIconChanged: Event<{
        instance: ITerminalInstance;
        userInitiated: boolean;
    }>;
    private readonly _onWillData;
    readonly onWillData: Event<string>;
    private readonly _onData;
    readonly onData: Event<string>;
    private readonly _onBinary;
    readonly onBinary: Event<string>;
    private readonly _onRequestExtHostProcess;
    readonly onRequestExtHostProcess: Event<ITerminalInstance>;
    private readonly _onDimensionsChanged;
    readonly onDimensionsChanged: Event<void>;
    private readonly _onMaximumDimensionsChanged;
    readonly onMaximumDimensionsChanged: Event<void>;
    private readonly _onDidFocus;
    readonly onDidFocus: Event<ITerminalInstance>;
    private readonly _onDidRequestFocus;
    readonly onDidRequestFocus: Event<void>;
    private readonly _onDidBlur;
    readonly onDidBlur: Event<ITerminalInstance>;
    private readonly _onDidInputData;
    readonly onDidInputData: Event<string>;
    private readonly _onDidChangeSelection;
    readonly onDidChangeSelection: Event<ITerminalInstance>;
    private readonly _onRequestAddInstanceToGroup;
    readonly onRequestAddInstanceToGroup: Event<IRequestAddInstanceToGroupEvent>;
    private readonly _onDidChangeHasChildProcesses;
    readonly onDidChangeHasChildProcesses: Event<boolean>;
    private readonly _onDidExecuteText;
    readonly onDidExecuteText: Event<void>;
    private readonly _onDidChangeTarget;
    readonly onDidChangeTarget: Event<TerminalLocation | undefined>;
    private readonly _onDidSendText;
    readonly onDidSendText: Event<string>;
    private readonly _onDidChangeShellType;
    readonly onDidChangeShellType: Event<TerminalShellType>;
    private readonly _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<boolean>;
    private readonly _onLineData;
    readonly onLineData: Event<string>;
    constructor(_terminalShellTypeContextKey: IContextKey<string>, _shellLaunchConfig: IShellLaunchConfig, _contextKeyService: IContextKeyService, _contextMenuService: IContextMenuService, instantiationService: IInstantiationService, _terminalConfigurationService: ITerminalConfigurationService, _terminalProfileResolverService: ITerminalProfileResolverService, _pathService: IPathService, _keybindingService: IKeybindingService, _notificationService: INotificationService, _preferencesService: IPreferencesService, _viewsService: IViewsService, _themeService: IThemeService, _configurationService: IConfigurationService, _logService: ITerminalLogService, _storageService: IStorageService, _accessibilityService: IAccessibilityService, _productService: IProductService, _quickInputService: IQuickInputService, workbenchEnvironmentService: IWorkbenchEnvironmentService, _workspaceContextService: IWorkspaceContextService, _editorService: IEditorService, _workspaceTrustRequestService: IWorkspaceTrustRequestService, _historyService: IHistoryService, _telemetryService: ITelemetryService, _openerService: IOpenerService, _commandService: ICommandService, _accessibilitySignalService: IAccessibilitySignalService, _viewDescriptorService: IViewDescriptorService);
    getContribution<T extends ITerminalContribution>(id: string): T | null;
    private _getIcon;
    private _getColor;
    private _initDimensions;
    /**
     * Evaluates and sets the cols and rows of the terminal if possible.
     * @param width The width of the container.
     * @param height The height of the container.
     * @return The terminal's width if it requires a layout.
     */
    private _evaluateColsAndRows;
    private _setLastKnownColsAndRows;
    private _fireMaximumDimensionsChanged;
    private _getDimension;
    get persistentProcessId(): number | undefined;
    get shouldPersist(): boolean;
    static getXtermConstructor(keybindingService: IKeybindingService, contextKeyService: IContextKeyService): Promise<any>;
    /**
     * Create xterm.js instance and attach data listeners.
     */
    protected _createXterm(): Promise<XtermTerminal | undefined>;
    runCommand(commandLine: string, shouldExecute: boolean): Promise<void>;
    detachFromElement(): void;
    attachToElement(container: HTMLElement): void;
    /**
     * Opens the the terminal instance inside the parent DOM element previously set with
     * `attachToElement`, you must ensure the parent DOM element is explicitly visible before
     * invoking this function as it performs some DOM calculations internally
     */
    private _open;
    private _setFocus;
    private _setShellIntegrationContextKey;
    resetFocusContextKey(): void;
    private _initDragAndDrop;
    hasSelection(): boolean;
    get selection(): string | undefined;
    clearSelection(): void;
    private _refreshAltBufferContextKey;
    dispose(reason?: TerminalExitReason): void;
    detachProcessAndDispose(reason: TerminalExitReason): Promise<void>;
    focus(force?: boolean): void;
    focusWhenReady(force?: boolean): Promise<void>;
    sendText(text: string, shouldExecute: boolean, bracketedPasteMode?: boolean): Promise<void>;
    sendPath(originalPath: string | URI, shouldExecute: boolean): Promise<void>;
    preparePathForShell(originalPath: string | URI): Promise<string>;
    setVisible(visible: boolean): void;
    scrollDownLine(): void;
    scrollDownPage(): void;
    scrollToBottom(): void;
    scrollUpLine(): void;
    scrollUpPage(): void;
    scrollToTop(): void;
    clearBuffer(): void;
    private _refreshSelectionContextKey;
    protected _createProcessManager(): TerminalProcessManager;
    private _createProcess;
    registerMarker(offset?: number): IMarker | undefined;
    addBufferMarker(properties: IMarkProperties): void;
    scrollToMark(startMarkId: string, endMarkId?: string, highlight?: boolean): void;
    freePortKillProcess(port: string, command: string): Promise<void>;
    private _onProcessData;
    private _writeProcessData;
    /**
     * Called when either a process tied to a terminal has exited or when a terminal renderer
     * simulates a process exiting (e.g. custom execution task).
     * @param exitCode The exit code of the process, this is undefined when the terminal was exited
     * through user action.
     */
    private _onProcessExit;
    private _relaunchWithShellIntegrationDisabled;
    /**
     * Ensure write calls to xterm.js have finished before resolving.
     */
    private _flushXtermData;
    private _attachPressAnyKeyToCloseListener;
    private _writeInitialText;
    reuseTerminal(shell: IShellLaunchConfig, reset?: boolean): Promise<void>;
    relaunch(): void;
    private _onTitleChange;
    private _trust;
    private _updateProcessCwd;
    updateConfig(): void;
    private _updateUnicodeVersion;
    updateAccessibilitySupport(): void;
    private _setCommandsToSkipShell;
    layout(dimension: dom.Dimension): void;
    private _resize;
    private _updatePtyDimensions;
    setShellType(shellType: TerminalShellType | undefined): void;
    private _setAriaLabel;
    private _updateTitleProperties;
    setOverrideDimensions(dimensions: ITerminalDimensionsOverride | undefined, immediate?: boolean): void;
    setFixedDimensions(): Promise<void>;
    private _parseFixedDimension;
    toggleSizeToContentWidth(): Promise<void>;
    private _refreshScrollbar;
    private _addScrollbar;
    private _removeScrollbar;
    private _setResolvedShellLaunchConfig;
    private _onEnvironmentVariableInfoChanged;
    private _refreshEnvironmentVariableInfoWidgetState;
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    private _refreshProperty;
    private _updateProperty;
    rename(title?: string): Promise<void>;
    private _setTitle;
    changeIcon(icon?: TerminalIcon): Promise<TerminalIcon | undefined>;
    changeColor(color?: string, skipQuickPick?: boolean): Promise<string | undefined>;
    forceScrollbarVisibility(): void;
    resetScrollbarVisibility(): void;
    setParentContextKeyService(parentContextKeyService: IContextKeyService): void;
    handleMouseEvent(event: MouseEvent, contextMenu: IMenu): Promise<{
        cancelContextMenu: boolean;
    } | void>;
}
declare const enum TerminalLabelType {
    Title = "title",
    Description = "description"
}
export declare class TerminalLabelComputer extends Disposable {
    private readonly _fileService;
    private readonly _terminalConfigurationService;
    private readonly _workspaceContextService;
    private _title;
    private _description;
    get title(): string | undefined;
    get description(): string;
    private readonly _onDidChangeLabel;
    readonly onDidChangeLabel: Event<{
        title: string;
        description: string;
    }>;
    constructor(_fileService: IFileService, _terminalConfigurationService: ITerminalConfigurationService, _workspaceContextService: IWorkspaceContextService);
    refreshLabel(instance: Pick<ITerminalInstance, 'shellLaunchConfig' | 'cwd' | 'fixedCols' | 'fixedRows' | 'initialCwd' | 'processName' | 'sequence' | 'userHome' | 'workspaceFolder' | 'staticTitle' | 'capabilities' | 'title' | 'description'>, reset?: boolean): void;
    computeLabel(instance: Pick<ITerminalInstance, 'shellLaunchConfig' | 'cwd' | 'fixedCols' | 'fixedRows' | 'initialCwd' | 'processName' | 'sequence' | 'userHome' | 'workspaceFolder' | 'staticTitle' | 'capabilities' | 'title' | 'description'>, labelTemplate: string, labelType: TerminalLabelType, reset?: boolean): string;
}
export declare function parseExitResult(exitCodeOrError: ITerminalLaunchError | number | undefined, shellLaunchConfig: IShellLaunchConfig, processState: ProcessState, initialCwd: string | undefined): {
    code: number | undefined;
    message: string | undefined;
} | undefined;
export declare class TerminalInstanceColorProvider implements IXtermColorProvider {
    private readonly _target;
    private readonly _viewDescriptorService;
    constructor(_target: IReference<TerminalLocation | undefined>, _viewDescriptorService: IViewDescriptorService);
    getBackgroundColor(theme: IColorTheme): import("../../../../base/common/color.js").Color | undefined;
}
export {};
