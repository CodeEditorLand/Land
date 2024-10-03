import { IDimension } from '../../../../base/browser/dom.js';
import { Orientation } from '../../../../base/browser/ui/splitview/splitview.js';
import { Color } from '../../../../base/common/color.js';
import { Event, IDynamicListEventMultiplexer, type DynamicListEventMultiplexer } from '../../../../base/common/event.js';
import { DisposableStore, IDisposable, type IReference } from '../../../../base/common/lifecycle.js';
import { OperatingSystem } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { IKeyMods } from '../../../../platform/quickinput/common/quickInput.js';
import { IMarkProperties, ITerminalCapabilityImplMap, ITerminalCapabilityStore, ITerminalCommand, TerminalCapability } from '../../../../platform/terminal/common/capabilities/capabilities.js';
import { IMergedEnvironmentVariableCollection } from '../../../../platform/terminal/common/environmentVariable.js';
import { IExtensionTerminalProfile, IReconnectionProperties, IShellIntegration, IShellLaunchConfig, ITerminalBackend, ITerminalDimensions, ITerminalLaunchError, ITerminalProfile, ITerminalTabLayoutInfoById, TerminalExitReason, TerminalIcon, TerminalLocation, TerminalShellType, TerminalType, TitleEventSource, WaitOnExitValue } from '../../../../platform/terminal/common/terminal.js';
import { IColorTheme } from '../../../../platform/theme/common/themeService.js';
import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IEditableData } from '../../../common/views.js';
import { ITerminalStatusList } from './terminalStatusList.js';
import { XtermTerminal } from './xterm/xtermTerminal.js';
import { IRegisterContributedProfileArgs, IRemoteTerminalAttachTarget, IStartExtensionTerminalRequest, ITerminalConfiguration, ITerminalFont, ITerminalProcessExtHostProxy, ITerminalProcessInfo } from '../common/terminal.js';
import type { IMarker, ITheme, Terminal as RawXtermTerminal, IBufferRange } from '@xterm/xterm';
import { ScrollPosition } from './xterm/markNavigationAddon.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { GroupIdentifier } from '../../../common/editor.js';
import { ACTIVE_GROUP_TYPE, AUX_WINDOW_GROUP_TYPE, SIDE_GROUP_TYPE } from '../../../services/editor/common/editorService.js';
import type { ICurrentPartialCommand } from '../../../../platform/terminal/common/capabilities/commandDetection/terminalCommand.js';
import type { IXtermCore } from './xterm-private.js';
import type { IMenu } from '../../../../platform/actions/common/actions.js';
import type { Barrier } from '../../../../base/common/async.js';
export declare const ITerminalService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalService>;
export declare const ITerminalConfigurationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalConfigurationService>;
export declare const ITerminalEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalEditorService>;
export declare const ITerminalGroupService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalGroupService>;
export declare const ITerminalInstanceService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITerminalInstanceService>;
export interface ITerminalContribution extends IDisposable {
    layout?(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }, dimension: IDimension): void;
    xtermOpen?(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
    xtermReady?(xterm: IXtermTerminal & {
        raw: RawXtermTerminal;
    }): void;
}
export interface ITerminalInstanceService {
    readonly _serviceBrand: undefined;
    onDidCreateInstance: Event<ITerminalInstance>;
    onDidRegisterBackend: Event<ITerminalBackend>;
    convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile?: IShellLaunchConfig | ITerminalProfile, cwd?: string | URI): IShellLaunchConfig;
    createInstance(launchConfig: IShellLaunchConfig, target: TerminalLocation): ITerminalInstance;
    getBackend(remoteAuthority?: string): Promise<ITerminalBackend | undefined>;
    getRegisteredBackends(): IterableIterator<ITerminalBackend>;
    didRegisterBackend(backend: ITerminalBackend): void;
}
export declare const enum Direction {
    Left = 0,
    Right = 1,
    Up = 2,
    Down = 3
}
export interface IQuickPickTerminalObject {
    config: IRegisterContributedProfileArgs | ITerminalProfile | {
        profile: IExtensionTerminalProfile;
        options: {
            icon?: string;
            color?: string;
        };
    } | undefined;
    keyMods: IKeyMods | undefined;
}
export interface IMarkTracker {
    scrollToPreviousMark(scrollPosition?: ScrollPosition, retainSelection?: boolean, skipEmptyCommands?: boolean): void;
    scrollToNextMark(): void;
    selectToPreviousMark(): void;
    selectToNextMark(): void;
    selectToPreviousLine(): void;
    selectToNextLine(): void;
    clear(): void;
    scrollToClosestMarker(startMarkerId: string, endMarkerId?: string, highlight?: boolean | undefined): void;
    scrollToLine(line: number, position: ScrollPosition): void;
    revealCommand(command: ITerminalCommand | ICurrentPartialCommand, position?: ScrollPosition): void;
    revealRange(range: IBufferRange): void;
    registerTemporaryDecoration(marker: IMarker, endMarker: IMarker | undefined, showOutline: boolean): void;
    showCommandGuide(command: ITerminalCommand | undefined): void;
    saveScrollState(): void;
    restoreScrollState(): void;
}
export interface ITerminalGroup {
    activeInstance: ITerminalInstance | undefined;
    terminalInstances: ITerminalInstance[];
    title: string;
    readonly onDidDisposeInstance: Event<ITerminalInstance>;
    readonly onDisposed: Event<ITerminalGroup>;
    readonly onInstancesChanged: Event<void>;
    readonly onPanelOrientationChanged: Event<Orientation>;
    focusPreviousPane(): void;
    focusNextPane(): void;
    resizePane(direction: Direction): void;
    resizePanes(relativeSizes: number[]): void;
    setActiveInstanceByIndex(index: number, force?: boolean): void;
    attachToElement(element: HTMLElement): void;
    addInstance(instance: ITerminalInstance): void;
    removeInstance(instance: ITerminalInstance): void;
    moveInstance(instances: ITerminalInstance | ITerminalInstance[], index: number, position: 'before' | 'after'): void;
    setVisible(visible: boolean): void;
    layout(width: number, height: number): void;
    addDisposable(disposable: IDisposable): void;
    split(shellLaunchConfig: IShellLaunchConfig): ITerminalInstance;
    getLayoutInfo(isActive: boolean): ITerminalTabLayoutInfoById;
}
export declare const enum TerminalConnectionState {
    Connecting = 0,
    Connected = 1
}
export interface IDetachedXTermOptions {
    cols: number;
    rows: number;
    colorProvider: IXtermColorProvider;
    capabilities?: ITerminalCapabilityStore;
    readonly?: boolean;
    processInfo: ITerminalProcessInfo;
}
export interface IBaseTerminalInstance {
    readonly capabilities: ITerminalCapabilityStore;
    readonly domElement?: HTMLElement;
    readonly selection: string | undefined;
    hasSelection(): boolean;
    clearSelection(): void;
    focus(force?: boolean): void;
    forceScrollbarVisibility(): void;
    resetScrollbarVisibility(): void;
    getContribution<T extends ITerminalContribution>(id: string): T | null;
}
export interface IDetachedTerminalInstance extends IDisposable, IBaseTerminalInstance {
    readonly xterm: IDetachedXtermTerminal;
    attachToElement(container: HTMLElement, options?: Partial<IXtermAttachToElementOptions>): void;
}
export declare const isDetachedTerminalInstance: (t: ITerminalInstance | IDetachedTerminalInstance) => t is IDetachedTerminalInstance;
export interface ITerminalService extends ITerminalInstanceHost {
    readonly _serviceBrand: undefined;
    readonly instances: readonly ITerminalInstance[];
    readonly detachedInstances: Iterable<IDetachedTerminalInstance>;
    readonly defaultLocation: TerminalLocation;
    readonly isProcessSupportRegistered: boolean;
    readonly connectionState: TerminalConnectionState;
    readonly whenConnected: Promise<void>;
    readonly restoredGroupCount: number;
    readonly onDidCreateInstance: Event<ITerminalInstance>;
    readonly onDidChangeInstanceDimensions: Event<ITerminalInstance>;
    readonly onDidRequestStartExtensionTerminal: Event<IStartExtensionTerminalRequest>;
    readonly onDidRegisterProcessSupport: Event<void>;
    readonly onDidChangeConnectionState: Event<void>;
    readonly onDidChangeActiveGroup: Event<ITerminalGroup | undefined>;
    readonly onAnyInstanceData: Event<{
        instance: ITerminalInstance;
        data: string;
    }>;
    readonly onAnyInstanceDataInput: Event<ITerminalInstance>;
    readonly onAnyInstanceIconChange: Event<{
        instance: ITerminalInstance;
        userInitiated: boolean;
    }>;
    readonly onAnyInstanceMaximumDimensionsChange: Event<ITerminalInstance>;
    readonly onAnyInstancePrimaryStatusChange: Event<ITerminalInstance>;
    readonly onAnyInstanceProcessIdReady: Event<ITerminalInstance>;
    readonly onAnyInstanceSelectionChange: Event<ITerminalInstance>;
    readonly onAnyInstanceTitleChange: Event<ITerminalInstance>;
    createTerminal(options?: ICreateTerminalOptions): Promise<ITerminalInstance>;
    createDetachedTerminal(options: IDetachedXTermOptions): Promise<IDetachedTerminalInstance>;
    getInstanceFromId(terminalId: number): ITerminalInstance | undefined;
    getInstanceFromIndex(terminalIndex: number): ITerminalInstance;
    getReconnectedTerminals(reconnectionOwner: string): ITerminalInstance[] | undefined;
    getActiveOrCreateInstance(options?: {
        acceptsInput?: boolean;
    }): Promise<ITerminalInstance>;
    revealTerminal(source: ITerminalInstance, preserveFocus?: boolean): Promise<void>;
    revealActiveTerminal(preserveFocus?: boolean): Promise<void>;
    moveToEditor(source: ITerminalInstance, group?: GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE): void;
    moveIntoNewEditor(source: ITerminalInstance): void;
    moveToTerminalView(source: ITerminalInstance | URI): Promise<void>;
    getPrimaryBackend(): ITerminalBackend | undefined;
    refreshActiveGroup(): void;
    registerProcessSupport(isSupported: boolean): void;
    showProfileQuickPick(type: 'setDefault' | 'createInstance', cwd?: string | URI): Promise<ITerminalInstance | undefined>;
    setContainers(panelContainer: HTMLElement, terminalContainer: HTMLElement): void;
    requestStartExtensionTerminal(proxy: ITerminalProcessExtHostProxy, cols: number, rows: number): Promise<ITerminalLaunchError | undefined>;
    isAttachedToTerminal(remoteTerm: IRemoteTerminalAttachTarget): boolean;
    getEditableData(instance: ITerminalInstance): IEditableData | undefined;
    setEditable(instance: ITerminalInstance, data: IEditableData | null): void;
    isEditable(instance: ITerminalInstance | undefined): boolean;
    safeDisposeTerminal(instance: ITerminalInstance): Promise<void>;
    getDefaultInstanceHost(): ITerminalInstanceHost;
    getInstanceHost(target: ITerminalLocationOptions | undefined): Promise<ITerminalInstanceHost>;
    resolveLocation(location?: ITerminalLocationOptions): Promise<TerminalLocation | undefined>;
    setNativeDelegate(nativeCalls: ITerminalServiceNativeDelegate): void;
    getEditingTerminal(): ITerminalInstance | undefined;
    setEditingTerminal(instance: ITerminalInstance | undefined): void;
    createOnInstanceEvent<T>(getEvent: (instance: ITerminalInstance) => Event<T>): DynamicListEventMultiplexer<ITerminalInstance, T>;
    createOnInstanceCapabilityEvent<T extends TerminalCapability, K>(capabilityId: T, getEvent: (capability: ITerminalCapabilityImplMap[T]) => Event<K>): IDynamicListEventMultiplexer<{
        instance: ITerminalInstance;
        data: K;
    }>;
}
export interface ITerminalConfigurationService {
    readonly _serviceBrand: undefined;
    readonly config: Readonly<ITerminalConfiguration>;
    readonly onConfigChanged: Event<void>;
    setPanelContainer(panelContainer: HTMLElement): void;
    configFontIsMonospace(): boolean;
    getFont(w: Window, xtermCore?: IXtermCore, excludeDimensions?: boolean): ITerminalFont;
}
export declare class TerminalLinkQuickPickEvent extends MouseEvent {
}
export interface ITerminalServiceNativeDelegate {
    getWindowCount(): Promise<number>;
}
export interface ITerminalEditorService extends ITerminalInstanceHost {
    readonly _serviceBrand: undefined;
    readonly instances: readonly ITerminalInstance[];
    openEditor(instance: ITerminalInstance, editorOptions?: TerminalEditorLocation): Promise<void>;
    detachInstance(instance: ITerminalInstance): void;
    splitInstance(instanceToSplit: ITerminalInstance, shellLaunchConfig?: IShellLaunchConfig): ITerminalInstance;
    revealActiveEditor(preserveFocus?: boolean): Promise<void>;
    resolveResource(instance: ITerminalInstance): URI;
    reviveInput(deserializedInput: IDeserializedTerminalEditorInput): EditorInput;
    getInputFromResource(resource: URI): EditorInput;
}
export declare const terminalEditorId = "terminalEditor";
interface ITerminalEditorInputObject {
    readonly id: number;
    readonly pid: number;
    readonly title: string;
    readonly titleSource: TitleEventSource;
    readonly cwd: string;
    readonly icon: TerminalIcon | undefined;
    readonly color: string | undefined;
    readonly hasChildProcesses?: boolean;
    readonly type?: TerminalType;
    readonly isFeatureTerminal?: boolean;
    readonly hideFromUser?: boolean;
    readonly reconnectionProperties?: IReconnectionProperties;
    readonly shellIntegrationNonce: string;
}
export interface ISerializedTerminalEditorInput extends ITerminalEditorInputObject {
}
export interface IDeserializedTerminalEditorInput extends ITerminalEditorInputObject {
}
export type ITerminalLocationOptions = TerminalLocation | TerminalEditorLocation | {
    parentTerminal: Promise<ITerminalInstance> | ITerminalInstance;
} | {
    splitActiveTerminal: boolean;
};
export interface ICreateTerminalOptions {
    config?: IShellLaunchConfig | ITerminalProfile | IExtensionTerminalProfile;
    cwd?: string | URI;
    resource?: URI;
    location?: ITerminalLocationOptions;
    skipContributedProfileCheck?: boolean;
}
export interface TerminalEditorLocation {
    viewColumn: GroupIdentifier | SIDE_GROUP_TYPE | ACTIVE_GROUP_TYPE | AUX_WINDOW_GROUP_TYPE;
    preserveFocus?: boolean;
}
export interface ITerminalGroupService extends ITerminalInstanceHost {
    readonly _serviceBrand: undefined;
    readonly instances: readonly ITerminalInstance[];
    readonly groups: readonly ITerminalGroup[];
    activeGroup: ITerminalGroup | undefined;
    readonly activeGroupIndex: number;
    lastAccessedMenu: 'inline-tab' | 'tab-list';
    readonly onDidChangeActiveGroup: Event<ITerminalGroup | undefined>;
    readonly onDidDisposeGroup: Event<ITerminalGroup>;
    readonly onDidChangeGroups: Event<void>;
    readonly onDidShow: Event<void>;
    readonly onDidChangePanelOrientation: Event<Orientation>;
    createGroup(shellLaunchConfig?: IShellLaunchConfig): ITerminalGroup;
    createGroup(instance?: ITerminalInstance): ITerminalGroup;
    getGroupForInstance(instance: ITerminalInstance): ITerminalGroup | undefined;
    moveGroup(source: ITerminalInstance | ITerminalInstance[], target: ITerminalInstance): void;
    moveGroupToEnd(source: ITerminalInstance | ITerminalInstance[]): void;
    moveInstance(source: ITerminalInstance, target: ITerminalInstance, side: 'before' | 'after'): void;
    unsplitInstance(instance: ITerminalInstance): void;
    joinInstances(instances: ITerminalInstance[]): void;
    instanceIsSplit(instance: ITerminalInstance): boolean;
    getGroupLabels(): string[];
    setActiveGroupByIndex(index: number): void;
    setActiveGroupToNext(): void;
    setActiveGroupToPrevious(): void;
    setActiveInstanceByIndex(terminalIndex: number): void;
    setContainer(container: HTMLElement): void;
    showPanel(focus?: boolean): Promise<void>;
    hidePanel(): void;
    focusTabs(): void;
    focusHover(): void;
    updateVisibility(): void;
}
export interface ITerminalInstanceHost {
    readonly activeInstance: ITerminalInstance | undefined;
    readonly instances: readonly ITerminalInstance[];
    readonly onDidDisposeInstance: Event<ITerminalInstance>;
    readonly onDidFocusInstance: Event<ITerminalInstance>;
    readonly onDidChangeActiveInstance: Event<ITerminalInstance | undefined>;
    readonly onDidChangeInstances: Event<void>;
    readonly onDidChangeInstanceCapability: Event<ITerminalInstance>;
    setActiveInstance(instance: ITerminalInstance): void;
    focusInstance(instance: ITerminalInstance): void;
    focusActiveInstance(): Promise<void>;
    getInstanceFromResource(resource: URI | undefined): ITerminalInstance | undefined;
}
export interface ITerminalExternalLinkProvider {
    provideLinks(instance: ITerminalInstance, line: string): Promise<ITerminalLink[] | undefined>;
}
export interface ITerminalLink {
    startIndex: number;
    length: number;
    label?: string;
    activate(text: string): void;
}
export interface ISearchOptions {
    regex?: boolean;
    wholeWord?: boolean;
    caseSensitive?: boolean;
    incremental?: boolean;
}
export interface ITerminalInstance extends IBaseTerminalInstance {
    readonly instanceId: number;
    readonly resource: URI;
    readonly cols: number;
    readonly rows: number;
    readonly maxCols: number;
    readonly maxRows: number;
    readonly fixedCols?: number;
    readonly fixedRows?: number;
    readonly domElement: HTMLElement;
    readonly icon?: TerminalIcon;
    readonly color?: string;
    readonly reconnectionProperties?: IReconnectionProperties;
    readonly processName: string;
    readonly sequence?: string;
    readonly staticTitle?: string;
    readonly workspaceFolder?: IWorkspaceFolder;
    readonly cwd?: string;
    readonly initialCwd?: string;
    readonly os?: OperatingSystem;
    readonly usedShellIntegrationInjection: boolean;
    readonly injectedArgs: string[] | undefined;
    readonly extEnvironmentVariableCollection: IMergedEnvironmentVariableCollection | undefined;
    readonly store: DisposableStore;
    readonly statusList: ITerminalStatusList;
    processId: number | undefined;
    target: TerminalLocation | undefined;
    targetRef: IReference<TerminalLocation | undefined>;
    readonly persistentProcessId: number | undefined;
    readonly shouldPersist: boolean;
    readonly isDisposed: boolean;
    readonly isRemote: boolean;
    readonly remoteAuthority: string | undefined;
    readonly hasFocus: boolean;
    waitOnExit: WaitOnExitValue | undefined;
    onTitleChanged: Event<ITerminalInstance>;
    onIconChanged: Event<{
        instance: ITerminalInstance;
        userInitiated: boolean;
    }>;
    onDisposed: Event<ITerminalInstance>;
    onProcessIdReady: Event<ITerminalInstance>;
    onProcessReplayComplete: Event<void>;
    onRequestExtHostProcess: Event<ITerminalInstance>;
    onDimensionsChanged: Event<void>;
    onMaximumDimensionsChanged: Event<void>;
    onDidChangeHasChildProcesses: Event<boolean>;
    onDidFocus: Event<ITerminalInstance>;
    onDidRequestFocus: Event<void>;
    onDidBlur: Event<ITerminalInstance>;
    onDidInputData: Event<string>;
    onDidChangeSelection: Event<ITerminalInstance>;
    onDidExecuteText: Event<void>;
    onDidChangeTarget: Event<TerminalLocation | undefined>;
    onDidSendText: Event<string>;
    onDidChangeShellType: Event<TerminalShellType>;
    onDidChangeVisibility: Event<boolean>;
    onWillPaste: Event<string>;
    onDidPaste: Event<string>;
    onRequestAddInstanceToGroup: Event<IRequestAddInstanceToGroupEvent>;
    onData: Event<string>;
    onWillData: Event<string>;
    onBinary: Event<string>;
    onLineData: Event<string>;
    onExit: Event<number | ITerminalLaunchError | undefined>;
    readonly exitCode: number | undefined;
    readonly exitReason: TerminalExitReason | undefined;
    readonly xterm?: XtermTerminal;
    readonly initialDataEvents: string[] | undefined;
    readonly processReady: Promise<void>;
    readonly hasChildProcesses: boolean;
    readonly title: string;
    readonly titleSource: TitleEventSource;
    readonly shellType: TerminalShellType | undefined;
    readonly hadFocusOnExit: boolean;
    isTitleSetByProcess: boolean;
    readonly shellLaunchConfig: IShellLaunchConfig;
    disableLayout: boolean;
    description: string | undefined;
    userHome: string | undefined;
    shellIntegrationNonce: string;
    registerMarker(offset?: number): IMarker | undefined;
    addBufferMarker(properties: IMarkProperties): void;
    scrollToMark(startMarkId: string, endMarkId?: string, highlight?: boolean): void;
    dispose(reason?: TerminalExitReason): void;
    detachProcessAndDispose(reason: TerminalExitReason): Promise<void>;
    copySelection(asHtml?: boolean, command?: ITerminalCommand): Promise<void>;
    resetFocusContextKey(): void;
    focusWhenReady(force?: boolean): Promise<void>;
    paste(): Promise<void>;
    pasteSelection(): Promise<void>;
    overrideCopyOnSelection(value: boolean): IDisposable;
    sendText(text: string, shouldExecute: boolean, bracketedPasteMode?: boolean): Promise<void>;
    sendPath(originalPath: string | URI, shouldExecute: boolean): Promise<void>;
    runCommand(command: string, shouldExecute?: boolean): void;
    preparePathForShell(originalPath: string): Promise<string>;
    scrollDownLine(): void;
    scrollDownPage(): void;
    scrollToBottom(): void;
    scrollUpLine(): void;
    scrollUpPage(): void;
    scrollToTop(): void;
    clearBuffer(): void;
    attachToElement(container: HTMLElement): void;
    detachFromElement(): void;
    layout(dimension: {
        width: number;
        height: number;
    }): void;
    setVisible(visible: boolean): void;
    reuseTerminal(shell: IShellLaunchConfig): Promise<void>;
    relaunch(): void;
    setOverrideDimensions(dimensions: ITerminalDimensions): void;
    setFixedDimensions(): Promise<void>;
    toggleSizeToContentWidth(): Promise<void>;
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    rename(title?: string): Promise<void>;
    changeIcon(icon?: TerminalIcon): Promise<TerminalIcon | undefined>;
    changeColor(color?: string, skipQuickPick?: boolean): Promise<string | undefined>;
    runRecent(type: 'command' | 'cwd'): Promise<void>;
    freePortKillProcess(port: string, commandToRun: string): Promise<void>;
    setParentContextKeyService(parentContextKeyService: IContextKeyService): void;
    handleMouseEvent(event: MouseEvent, contextMenu: IMenu): Promise<{
        cancelContextMenu: boolean;
    } | void>;
    pauseInputEvents(barrier: Barrier): void;
}
export declare const enum XtermTerminalConstants {
    SearchHighlightLimit = 1000
}
export interface IXtermAttachToElementOptions {
    enableGpu: boolean;
}
export interface IXtermTerminal extends IDisposable {
    readonly markTracker: IMarkTracker;
    readonly shellIntegration: IShellIntegration;
    readonly onDidChangeSelection: Event<void>;
    readonly onDidChangeFindResults: Event<{
        resultIndex: number;
        resultCount: number;
    }>;
    readonly onDidChangeFocus: Event<boolean>;
    readonly textureAtlas: Promise<ImageBitmap> | undefined;
    readonly isStdinDisabled: boolean;
    readonly isFocused: boolean;
    readonly isGpuAccelerated: boolean;
    attachToElement(container: HTMLElement, options?: Partial<IXtermAttachToElementOptions>): void;
    findResult?: {
        resultIndex: number;
        resultCount: number;
    };
    findNext(term: string, searchOptions: ISearchOptions): Promise<boolean>;
    findPrevious(term: string, searchOptions: ISearchOptions): Promise<boolean>;
    forceRedraw(): void;
    getFont(): ITerminalFont;
    hasSelection(): boolean;
    clearSelection(): void;
    selectAll(): void;
    selectMarkedRange(fromMarkerId: string, toMarkerId: string, scrollIntoView?: boolean): void;
    copySelection(copyAsHtml?: boolean): void;
    focus(): void;
    scrollDownLine(): void;
    scrollDownPage(): void;
    scrollToBottom(): void;
    scrollUpLine(): void;
    scrollUpPage(): void;
    scrollToTop(): void;
    scrollToLine(line: number, position?: ScrollPosition): void;
    clearBuffer(): void;
    clearSearchDecorations(): void;
    clearActiveSearchDecoration(): void;
    getBufferReverseIterator(): IterableIterator<string>;
    getContentsAsHtml(): Promise<string>;
    refresh(): void;
    getXtermTheme(theme?: IColorTheme): ITheme;
}
export interface IDetachedXtermTerminal extends IXtermTerminal {
    write(data: string | Uint8Array, callback?: () => void): void;
    resize(columns: number, rows: number): void;
}
export interface IInternalXtermTerminal {
    _writeText(data: string): void;
}
export interface IXtermColorProvider {
    getBackgroundColor(theme: IColorTheme): Color | undefined;
}
export interface IRequestAddInstanceToGroupEvent {
    uri: URI;
    side: 'before' | 'after';
}
export declare const enum LinuxDistro {
    Unknown = 1,
    Fedora = 2,
    Ubuntu = 3
}
export declare const enum TerminalDataTransfers {
    Terminals = "Terminals"
}
export {};
