import { Event } from '../../../base/common/event.js';
import { IProcessEnvironment, OperatingSystem } from '../../../base/common/platform.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IPtyHostProcessReplayEvent, ISerializedCommandDetectionCapability, ITerminalCapabilityStore } from './capabilities/capabilities.js';
import { IGetTerminalLayoutInfoArgs, IProcessDetails, ISetTerminalLayoutInfoArgs } from './terminalProcess.js';
import { ThemeIcon } from '../../../base/common/themables.js';
import { ISerializableEnvironmentVariableCollections } from './environmentVariable.js';
import { RawContextKey } from '../../contextkey/common/contextkey.js';
import { IWorkspaceFolder } from '../../workspace/common/workspace.js';
import type * as performance from '../../../base/common/performance.js';
import { ILogService } from '../../log/common/log.js';
export declare const terminalTabFocusModeContextKey: RawContextKey<boolean>;
export declare const enum TerminalSettingPrefix {
    AutomationProfile = "terminal.integrated.automationProfile.",
    DefaultProfile = "terminal.integrated.defaultProfile.",
    Profiles = "terminal.integrated.profiles."
}
export declare const enum TerminalSettingId {
    SendKeybindingsToShell = "terminal.integrated.sendKeybindingsToShell",
    AutomationProfileLinux = "terminal.integrated.automationProfile.linux",
    AutomationProfileMacOs = "terminal.integrated.automationProfile.osx",
    AutomationProfileWindows = "terminal.integrated.automationProfile.windows",
    ProfilesWindows = "terminal.integrated.profiles.windows",
    ProfilesMacOs = "terminal.integrated.profiles.osx",
    ProfilesLinux = "terminal.integrated.profiles.linux",
    DefaultProfileLinux = "terminal.integrated.defaultProfile.linux",
    DefaultProfileMacOs = "terminal.integrated.defaultProfile.osx",
    DefaultProfileWindows = "terminal.integrated.defaultProfile.windows",
    UseWslProfiles = "terminal.integrated.useWslProfiles",
    TabsDefaultColor = "terminal.integrated.tabs.defaultColor",
    TabsDefaultIcon = "terminal.integrated.tabs.defaultIcon",
    TabsEnabled = "terminal.integrated.tabs.enabled",
    TabsEnableAnimation = "terminal.integrated.tabs.enableAnimation",
    TabsHideCondition = "terminal.integrated.tabs.hideCondition",
    TabsShowActiveTerminal = "terminal.integrated.tabs.showActiveTerminal",
    TabsShowActions = "terminal.integrated.tabs.showActions",
    TabsLocation = "terminal.integrated.tabs.location",
    TabsFocusMode = "terminal.integrated.tabs.focusMode",
    MacOptionIsMeta = "terminal.integrated.macOptionIsMeta",
    MacOptionClickForcesSelection = "terminal.integrated.macOptionClickForcesSelection",
    AltClickMovesCursor = "terminal.integrated.altClickMovesCursor",
    CopyOnSelection = "terminal.integrated.copyOnSelection",
    EnableMultiLinePasteWarning = "terminal.integrated.enableMultiLinePasteWarning",
    DrawBoldTextInBrightColors = "terminal.integrated.drawBoldTextInBrightColors",
    FontFamily = "terminal.integrated.fontFamily",
    FontSize = "terminal.integrated.fontSize",
    LetterSpacing = "terminal.integrated.letterSpacing",
    LineHeight = "terminal.integrated.lineHeight",
    MinimumContrastRatio = "terminal.integrated.minimumContrastRatio",
    TabStopWidth = "terminal.integrated.tabStopWidth",
    FastScrollSensitivity = "terminal.integrated.fastScrollSensitivity",
    MouseWheelScrollSensitivity = "terminal.integrated.mouseWheelScrollSensitivity",
    BellDuration = "terminal.integrated.bellDuration",
    FontWeight = "terminal.integrated.fontWeight",
    FontWeightBold = "terminal.integrated.fontWeightBold",
    CursorBlinking = "terminal.integrated.cursorBlinking",
    CursorStyle = "terminal.integrated.cursorStyle",
    CursorStyleInactive = "terminal.integrated.cursorStyleInactive",
    CursorWidth = "terminal.integrated.cursorWidth",
    Scrollback = "terminal.integrated.scrollback",
    DetectLocale = "terminal.integrated.detectLocale",
    DefaultLocation = "terminal.integrated.defaultLocation",
    GpuAcceleration = "terminal.integrated.gpuAcceleration",
    TerminalTitleSeparator = "terminal.integrated.tabs.separator",
    TerminalTitle = "terminal.integrated.tabs.title",
    TerminalDescription = "terminal.integrated.tabs.description",
    RightClickBehavior = "terminal.integrated.rightClickBehavior",
    MiddleClickBehavior = "terminal.integrated.middleClickBehavior",
    Cwd = "terminal.integrated.cwd",
    ConfirmOnExit = "terminal.integrated.confirmOnExit",
    ConfirmOnKill = "terminal.integrated.confirmOnKill",
    EnableBell = "terminal.integrated.enableBell",
    EnableVisualBell = "terminal.integrated.enableVisualBell",
    CommandsToSkipShell = "terminal.integrated.commandsToSkipShell",
    AllowChords = "terminal.integrated.allowChords",
    AllowMnemonics = "terminal.integrated.allowMnemonics",
    TabFocusMode = "terminal.integrated.tabFocusMode",
    EnvMacOs = "terminal.integrated.env.osx",
    EnvLinux = "terminal.integrated.env.linux",
    EnvWindows = "terminal.integrated.env.windows",
    EnvironmentChangesIndicator = "terminal.integrated.environmentChangesIndicator",
    EnvironmentChangesRelaunch = "terminal.integrated.environmentChangesRelaunch",
    ExperimentalWindowsUseConptyDll = "terminal.integrated.experimental.windowsUseConptyDll",
    ShowExitAlert = "terminal.integrated.showExitAlert",
    SplitCwd = "terminal.integrated.splitCwd",
    WindowsEnableConpty = "terminal.integrated.windowsEnableConpty",
    WordSeparators = "terminal.integrated.wordSeparators",
    EnableFileLinks = "terminal.integrated.enableFileLinks",
    AllowedLinkSchemes = "terminal.integrated.allowedLinkSchemes",
    UnicodeVersion = "terminal.integrated.unicodeVersion",
    EnablePersistentSessions = "terminal.integrated.enablePersistentSessions",
    PersistentSessionReviveProcess = "terminal.integrated.persistentSessionReviveProcess",
    HideOnStartup = "terminal.integrated.hideOnStartup",
    CustomGlyphs = "terminal.integrated.customGlyphs",
    RescaleOverlappingGlyphs = "terminal.integrated.rescaleOverlappingGlyphs",
    PersistentSessionScrollback = "terminal.integrated.persistentSessionScrollback",
    InheritEnv = "terminal.integrated.inheritEnv",
    ShowLinkHover = "terminal.integrated.showLinkHover",
    IgnoreProcessNames = "terminal.integrated.ignoreProcessNames",
    ShellIntegrationEnabled = "terminal.integrated.shellIntegration.enabled",
    ShellIntegrationShowWelcome = "terminal.integrated.shellIntegration.showWelcome",
    ShellIntegrationDecorationsEnabled = "terminal.integrated.shellIntegration.decorationsEnabled",
    ShellIntegrationCommandHistory = "terminal.integrated.shellIntegration.history",
    EnableImages = "terminal.integrated.enableImages",
    SmoothScrolling = "terminal.integrated.smoothScrolling",
    IgnoreBracketedPasteMode = "terminal.integrated.ignoreBracketedPasteMode",
    FocusAfterRun = "terminal.integrated.focusAfterRun",
    DeveloperPtyHostLatency = "terminal.integrated.developer.ptyHost.latency",
    DeveloperPtyHostStartupDelay = "terminal.integrated.developer.ptyHost.startupDelay",
    DevMode = "terminal.integrated.developer.devMode"
}
export declare const enum PosixShellType {
    Bash = "bash",
    Fish = "fish",
    Sh = "sh",
    Csh = "csh",
    Ksh = "ksh",
    Zsh = "zsh"
}
export declare const enum WindowsShellType {
    CommandPrompt = "cmd",
    Wsl = "wsl",
    GitBash = "gitbash"
}
export declare const enum GeneralShellType {
    PowerShell = "pwsh",
    Python = "python",
    Julia = "julia",
    NuShell = "nu"
}
export type TerminalShellType = PosixShellType | WindowsShellType | GeneralShellType;
export interface IRawTerminalInstanceLayoutInfo<T> {
    relativeSize: number;
    terminal: T;
}
export type ITerminalInstanceLayoutInfoById = IRawTerminalInstanceLayoutInfo<number>;
export type ITerminalInstanceLayoutInfo = IRawTerminalInstanceLayoutInfo<IPtyHostAttachTarget>;
export interface IRawTerminalTabLayoutInfo<T> {
    isActive: boolean;
    activePersistentProcessId: number | undefined;
    terminals: IRawTerminalInstanceLayoutInfo<T>[];
}
export type ITerminalTabLayoutInfoById = IRawTerminalTabLayoutInfo<number>;
export interface IRawTerminalsLayoutInfo<T> {
    tabs: IRawTerminalTabLayoutInfo<T>[];
}
export interface IPtyHostAttachTarget {
    id: number;
    pid: number;
    title: string;
    titleSource: TitleEventSource;
    cwd: string;
    workspaceId: string;
    workspaceName: string;
    isOrphan: boolean;
    icon: TerminalIcon | undefined;
    fixedDimensions: IFixedTerminalDimensions | undefined;
    environmentVariableCollections: ISerializableEnvironmentVariableCollections | undefined;
    reconnectionProperties?: IReconnectionProperties;
    waitOnExit?: WaitOnExitValue;
    hideFromUser?: boolean;
    isFeatureTerminal?: boolean;
    type?: TerminalType;
    hasChildProcesses: boolean;
    shellIntegrationNonce: string;
}
export interface IReconnectionProperties {
    ownerId: string;
    data?: unknown;
}
export type TerminalType = 'Task' | 'Local' | undefined;
export declare enum TitleEventSource {
    Api = 0,
    Process = 1,
    Sequence = 2,
    Config = 3
}
export type ITerminalsLayoutInfo = IRawTerminalsLayoutInfo<IPtyHostAttachTarget | null>;
export type ITerminalsLayoutInfoById = IRawTerminalsLayoutInfo<number>;
export declare enum TerminalIpcChannels {
    LocalPty = "localPty",
    PtyHost = "ptyHost",
    PtyHostWindow = "ptyHostWindow",
    Logger = "logger",
    Heartbeat = "heartbeat"
}
export declare const enum ProcessPropertyType {
    Cwd = "cwd",
    InitialCwd = "initialCwd",
    FixedDimensions = "fixedDimensions",
    Title = "title",
    ShellType = "shellType",
    HasChildProcesses = "hasChildProcesses",
    ResolvedShellLaunchConfig = "resolvedShellLaunchConfig",
    OverrideDimensions = "overrideDimensions",
    FailedShellIntegrationActivation = "failedShellIntegrationActivation",
    UsedShellIntegrationInjection = "usedShellIntegrationInjection"
}
export interface IProcessProperty<T extends ProcessPropertyType> {
    type: T;
    value: IProcessPropertyMap[T];
}
export interface IProcessPropertyMap {
    [ProcessPropertyType.Cwd]: string;
    [ProcessPropertyType.InitialCwd]: string;
    [ProcessPropertyType.FixedDimensions]: IFixedTerminalDimensions;
    [ProcessPropertyType.Title]: string;
    [ProcessPropertyType.ShellType]: TerminalShellType | undefined;
    [ProcessPropertyType.HasChildProcesses]: boolean;
    [ProcessPropertyType.ResolvedShellLaunchConfig]: IShellLaunchConfig;
    [ProcessPropertyType.OverrideDimensions]: ITerminalDimensionsOverride | undefined;
    [ProcessPropertyType.FailedShellIntegrationActivation]: boolean | undefined;
    [ProcessPropertyType.UsedShellIntegrationInjection]: boolean | undefined;
}
export interface IFixedTerminalDimensions {
    cols?: number;
    rows?: number;
}
export interface IPtyService {
    readonly _serviceBrand: undefined;
    readonly onProcessData: Event<{
        id: number;
        event: IProcessDataEvent | string;
    }>;
    readonly onProcessReady: Event<{
        id: number;
        event: IProcessReadyEvent;
    }>;
    readonly onProcessReplay: Event<{
        id: number;
        event: IPtyHostProcessReplayEvent;
    }>;
    readonly onProcessOrphanQuestion: Event<{
        id: number;
    }>;
    readonly onDidRequestDetach: Event<{
        requestId: number;
        workspaceId: string;
        instanceId: number;
    }>;
    readonly onDidChangeProperty: Event<{
        id: number;
        property: IProcessProperty<any>;
    }>;
    readonly onProcessExit: Event<{
        id: number;
        event: number | undefined;
    }>;
    createProcess(shellLaunchConfig: IShellLaunchConfig, cwd: string, cols: number, rows: number, unicodeVersion: '6' | '11', env: IProcessEnvironment, executableEnv: IProcessEnvironment, options: ITerminalProcessOptions, shouldPersist: boolean, workspaceId: string, workspaceName: string): Promise<number>;
    attachToProcess(id: number): Promise<void>;
    detachFromProcess(id: number, forcePersist?: boolean): Promise<void>;
    shutdownAll(): Promise<void>;
    listProcesses(): Promise<IProcessDetails[]>;
    getPerformanceMarks(): Promise<performance.PerformanceMark[]>;
    getLatency(): Promise<IPtyHostLatencyMeasurement[]>;
    start(id: number): Promise<ITerminalLaunchError | {
        injectedArgs: string[];
    } | undefined>;
    shutdown(id: number, immediate: boolean): Promise<void>;
    input(id: number, data: string): Promise<void>;
    resize(id: number, cols: number, rows: number): Promise<void>;
    clearBuffer(id: number): Promise<void>;
    getInitialCwd(id: number): Promise<string>;
    getCwd(id: number): Promise<string>;
    acknowledgeDataEvent(id: number, charCount: number): Promise<void>;
    setUnicodeVersion(id: number, version: '6' | '11'): Promise<void>;
    processBinary(id: number, data: string): Promise<void>;
    orphanQuestionReply(id: number): Promise<void>;
    updateTitle(id: number, title: string, titleSource: TitleEventSource): Promise<void>;
    updateIcon(id: number, userInitiated: boolean, icon: TerminalIcon, color?: string): Promise<void>;
    installAutoReply(match: string, reply: string): Promise<void>;
    uninstallAllAutoReplies(): Promise<void>;
    getDefaultSystemShell(osOverride?: OperatingSystem): Promise<string>;
    getEnvironment(): Promise<IProcessEnvironment>;
    getWslPath(original: string, direction: 'unix-to-win' | 'win-to-unix'): Promise<string>;
    getRevivedPtyNewId(workspaceId: string, id: number): Promise<number | undefined>;
    setTerminalLayoutInfo(args: ISetTerminalLayoutInfoArgs): Promise<void>;
    getTerminalLayoutInfo(args: IGetTerminalLayoutInfoArgs): Promise<ITerminalsLayoutInfo | undefined>;
    reduceConnectionGraceTime(): Promise<void>;
    requestDetachInstance(workspaceId: string, instanceId: number): Promise<IProcessDetails | undefined>;
    acceptDetachInstanceReply(requestId: number, persistentProcessId?: number): Promise<void>;
    freePortKillProcess(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    serializeTerminalState(ids: number[]): Promise<string>;
    reviveTerminalProcesses(workspaceId: string, state: ISerializedTerminalState[], dateTimeFormatLocate: string): Promise<void>;
    refreshProperty<T extends ProcessPropertyType>(id: number, property: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(id: number, property: T, value: IProcessPropertyMap[T]): Promise<void>;
    refreshIgnoreProcessNames?(names: string[]): Promise<void>;
}
export declare const IPtyService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IPtyService>;
export interface IPtyServiceContribution {
    handleProcessReady(persistentProcessId: number, process: ITerminalChildProcess): void;
    handleProcessDispose(persistentProcessId: number): void;
    handleProcessInput(persistentProcessId: number, data: string): void;
    handleProcessResize(persistentProcessId: number, cols: number, rows: number): void;
}
export interface IPtyHostController {
    readonly onPtyHostExit: Event<number>;
    readonly onPtyHostStart: Event<void>;
    readonly onPtyHostUnresponsive: Event<void>;
    readonly onPtyHostResponsive: Event<void>;
    readonly onPtyHostRequestResolveVariables: Event<IRequestResolveVariablesEvent>;
    restartPtyHost(): Promise<void>;
    acceptPtyHostResolvedVariables(requestId: number, resolved: string[]): Promise<void>;
    getProfiles(workspaceId: string, profiles: unknown, defaultProfile: unknown, includeDetectedProfiles?: boolean): Promise<ITerminalProfile[]>;
}
export interface IPtyHostService extends IPtyService, IPtyHostController {
}
export interface IPtyHostLatencyMeasurement {
    label: string;
    latency: number;
}
export interface ICrossVersionSerializedTerminalState {
    version: number;
    state: unknown;
}
export interface ISerializedTerminalState {
    id: number;
    shellLaunchConfig: IShellLaunchConfig;
    processDetails: IProcessDetails;
    processLaunchConfig: IPersistentTerminalProcessLaunchConfig;
    unicodeVersion: '6' | '11';
    replayEvent: IPtyHostProcessReplayEvent;
    timestamp: number;
}
export interface IPersistentTerminalProcessLaunchConfig {
    env: IProcessEnvironment;
    executableEnv: IProcessEnvironment;
    options: ITerminalProcessOptions;
}
export interface IRequestResolveVariablesEvent {
    requestId: number;
    workspaceId: string;
    originalText: string[];
}
export declare enum HeartbeatConstants {
    BeatInterval = 5000,
    ConnectingBeatInterval = 20000,
    FirstWaitMultiplier = 1.2,
    SecondWaitMultiplier = 1,
    CreateProcessTimeout = 5000
}
export interface IHeartbeatService {
    readonly onBeat: Event<void>;
}
export interface IShellLaunchConfig {
    name?: string;
    type?: 'Task' | 'Local';
    executable?: string;
    args?: string[] | string;
    cwd?: string | URI;
    env?: ITerminalEnvironment;
    ignoreConfigurationCwd?: boolean;
    reconnectionProperties?: IReconnectionProperties;
    waitOnExit?: WaitOnExitValue;
    initialText?: string | {
        text: string;
        trailingNewLine: boolean;
    };
    customPtyImplementation?: (terminalId: number, cols: number, rows: number) => ITerminalChildProcess;
    extHostTerminalId?: string;
    attachPersistentProcess?: {
        id: number;
        findRevivedId?: boolean;
        pid: number;
        title: string;
        titleSource: TitleEventSource;
        cwd: string;
        icon?: TerminalIcon;
        color?: string;
        hasChildProcesses?: boolean;
        fixedDimensions?: IFixedTerminalDimensions;
        environmentVariableCollections?: ISerializableEnvironmentVariableCollections;
        reconnectionProperties?: IReconnectionProperties;
        type?: TerminalType;
        waitOnExit?: WaitOnExitValue;
        hideFromUser?: boolean;
        isFeatureTerminal?: boolean;
        shellIntegrationNonce: string;
    };
    strictEnv?: boolean;
    useShellEnvironment?: boolean;
    hideFromUser?: boolean;
    isFeatureTerminal?: boolean;
    isExtensionOwnedTerminal?: boolean;
    icon?: TerminalIcon;
    color?: string;
    parentTerminalId?: number;
    fixedDimensions?: IFixedTerminalDimensions;
    isTransient?: boolean;
    forceShellIntegration?: boolean;
    ignoreShellIntegration?: boolean;
}
export type WaitOnExitValue = boolean | string | ((exitCode: number) => string);
export interface ICreateContributedTerminalProfileOptions {
    icon?: URI | string | {
        light: URI;
        dark: URI;
    };
    color?: string;
    location?: TerminalLocation | {
        viewColumn: number;
        preserveState?: boolean;
    } | {
        splitActiveTerminal: boolean;
    };
    cwd?: string | URI;
}
export declare enum TerminalLocation {
    Panel = 1,
    Editor = 2
}
export declare const enum TerminalLocationString {
    TerminalView = "view",
    Editor = "editor"
}
export type TerminalIcon = ThemeIcon | URI | {
    light: URI;
    dark: URI;
};
export interface IShellLaunchConfigDto {
    name?: string;
    executable?: string;
    args?: string[] | string;
    cwd?: string | UriComponents;
    env?: ITerminalEnvironment;
    useShellEnvironment?: boolean;
    hideFromUser?: boolean;
    reconnectionProperties?: IReconnectionProperties;
    type?: 'Task' | 'Local';
    isFeatureTerminal?: boolean;
}
export interface ITerminalProcessOptions {
    shellIntegration: {
        enabled: boolean;
        suggestEnabled: boolean;
        nonce: string;
    };
    windowsEnableConpty: boolean;
    windowsUseConptyDll: boolean;
    environmentVariableCollections: ISerializableEnvironmentVariableCollections | undefined;
    workspaceFolder: IWorkspaceFolder | undefined;
}
export interface ITerminalEnvironment {
    [key: string]: string | null | undefined;
}
export interface ITerminalLaunchError {
    message: string;
    code?: number;
}
export interface IProcessReadyEvent {
    pid: number;
    cwd: string;
    windowsPty: IProcessReadyWindowsPty | undefined;
}
export interface IProcessReadyWindowsPty {
    backend: 'conpty' | 'winpty';
    buildNumber: number;
}
export interface ITerminalChildProcess {
    id: number;
    shouldPersist: boolean;
    onProcessData: Event<IProcessDataEvent | string>;
    onProcessReady: Event<IProcessReadyEvent>;
    onProcessReplayComplete?: Event<void>;
    onDidChangeProperty: Event<IProcessProperty<any>>;
    onProcessExit: Event<number | undefined>;
    onRestoreCommands?: Event<ISerializedCommandDetectionCapability>;
    start(): Promise<ITerminalLaunchError | {
        injectedArgs: string[];
    } | undefined>;
    detach?(forcePersist?: boolean): Promise<void>;
    freePortKillProcess?(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    shutdown(immediate: boolean): void;
    input(data: string): void;
    processBinary(data: string): Promise<void>;
    resize(cols: number, rows: number): void;
    clearBuffer(): void | Promise<void>;
    acknowledgeDataEvent(charCount: number): void;
    setUnicodeVersion(version: '6' | '11'): Promise<void>;
    getInitialCwd(): Promise<string>;
    getCwd(): Promise<string>;
    refreshProperty<T extends ProcessPropertyType>(property: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(property: T, value: IProcessPropertyMap[T]): Promise<void>;
}
export interface IReconnectConstants {
    graceTime: number;
    shortGraceTime: number;
    scrollback: number;
}
export declare const enum LocalReconnectConstants {
    GraceTime = 60000,
    ShortGraceTime = 6000
}
export declare const enum FlowControlConstants {
    HighWatermarkChars = 100000,
    LowWatermarkChars = 5000,
    CharCountAckSize = 5000
}
export interface IProcessDataEvent {
    data: string;
    trackCommit: boolean;
    writePromise?: Promise<void>;
}
export interface ITerminalDimensions {
    cols: number;
    rows: number;
}
export interface ITerminalProfile {
    profileName: string;
    path: string;
    isDefault: boolean;
    isUnsafePath?: boolean;
    requiresUnsafePath?: string;
    isAutoDetected?: boolean;
    isFromPath?: boolean;
    args?: string | string[] | undefined;
    env?: ITerminalEnvironment;
    overrideName?: boolean;
    color?: string;
    icon?: ThemeIcon | URI | {
        light: URI;
        dark: URI;
    };
}
export interface ITerminalDimensionsOverride extends Readonly<ITerminalDimensions> {
    forceExactSize?: boolean;
}
export declare const enum ProfileSource {
    GitBash = "Git Bash",
    Pwsh = "PowerShell"
}
export interface IBaseUnresolvedTerminalProfile {
    args?: string | string[] | undefined;
    isAutoDetected?: boolean;
    overrideName?: boolean;
    icon?: string | ThemeIcon | URI | {
        light: URI;
        dark: URI;
    };
    color?: string;
    env?: ITerminalEnvironment;
    requiresPath?: string | ITerminalUnsafePath;
}
type OneOrN<T> = T | T[];
export interface ITerminalUnsafePath {
    path: string;
    isUnsafe: true;
}
export interface ITerminalExecutable extends IBaseUnresolvedTerminalProfile {
    path: OneOrN<string | ITerminalUnsafePath>;
}
export interface ITerminalProfileSource extends IBaseUnresolvedTerminalProfile {
    source: ProfileSource;
}
export interface ITerminalProfileContribution {
    title: string;
    id: string;
    icon?: URI | {
        light: URI;
        dark: URI;
    } | string;
    color?: string;
}
export interface IExtensionTerminalProfile extends ITerminalProfileContribution {
    extensionIdentifier: string;
}
export type ITerminalProfileObject = ITerminalExecutable | ITerminalProfileSource | IExtensionTerminalProfile | null;
export interface IShellIntegration {
    readonly capabilities: ITerminalCapabilityStore;
    readonly status: ShellIntegrationStatus;
    readonly onDidChangeStatus: Event<ShellIntegrationStatus>;
    deserialize(serialized: ISerializedCommandDetectionCapability): void;
}
export interface ITerminalContributions {
    profiles?: ITerminalProfileContribution[];
}
export declare const enum ShellIntegrationStatus {
    Off = 0,
    FinalTerm = 1,
    VSCode = 2
}
export declare enum TerminalExitReason {
    Unknown = 0,
    Shutdown = 1,
    Process = 2,
    User = 3,
    Extension = 4
}
export interface ITerminalOutputMatch {
    regexMatch: RegExpMatchArray;
    outputLines: string[];
}
export interface ITerminalOutputMatcher {
    lineMatcher: string | RegExp;
    anchor: 'top' | 'bottom';
    offset: number;
    length: number;
    multipleMatches?: boolean;
}
export interface ITerminalCommandSelector {
    id: string;
    commandLineMatcher: string | RegExp;
    outputMatcher?: ITerminalOutputMatcher;
    exitStatus: boolean;
    commandExitResult: 'success' | 'error';
    kind?: 'fix' | 'explain';
}
export interface ITerminalBackend extends ITerminalBackendPtyServiceContributions {
    readonly remoteAuthority: string | undefined;
    readonly isResponsive: boolean;
    readonly whenReady: Promise<void>;
    setReady(): void;
    onPtyHostUnresponsive: Event<void>;
    onPtyHostResponsive: Event<void>;
    onPtyHostRestart: Event<void>;
    onDidRequestDetach: Event<{
        requestId: number;
        workspaceId: string;
        instanceId: number;
    }>;
    attachToProcess(id: number): Promise<ITerminalChildProcess | undefined>;
    attachToRevivedProcess(id: number): Promise<ITerminalChildProcess | undefined>;
    listProcesses(): Promise<IProcessDetails[]>;
    getLatency(): Promise<IPtyHostLatencyMeasurement[]>;
    getDefaultSystemShell(osOverride?: OperatingSystem): Promise<string>;
    getProfiles(profiles: unknown, defaultProfile: unknown, includeDetectedProfiles?: boolean): Promise<ITerminalProfile[]>;
    getWslPath(original: string, direction: 'unix-to-win' | 'win-to-unix'): Promise<string>;
    getEnvironment(): Promise<IProcessEnvironment>;
    getShellEnvironment(): Promise<IProcessEnvironment | undefined>;
    setTerminalLayoutInfo(layoutInfo?: ITerminalsLayoutInfoById): Promise<void>;
    updateTitle(id: number, title: string, titleSource: TitleEventSource): Promise<void>;
    updateIcon(id: number, userInitiated: boolean, icon: TerminalIcon, color?: string): Promise<void>;
    getTerminalLayoutInfo(): Promise<ITerminalsLayoutInfo | undefined>;
    getPerformanceMarks(): Promise<performance.PerformanceMark[]>;
    reduceConnectionGraceTime(): Promise<void>;
    requestDetachInstance(workspaceId: string, instanceId: number): Promise<IProcessDetails | undefined>;
    acceptDetachInstanceReply(requestId: number, persistentProcessId?: number): Promise<void>;
    persistTerminalState(): Promise<void>;
    createProcess(shellLaunchConfig: IShellLaunchConfig, cwd: string, cols: number, rows: number, unicodeVersion: '6' | '11', env: IProcessEnvironment, options: ITerminalProcessOptions, shouldPersist: boolean): Promise<ITerminalChildProcess>;
    restartPtyHost(): void;
}
export interface ITerminalBackendPtyServiceContributions {
    installAutoReply(match: string, reply: string): Promise<void>;
    uninstallAllAutoReplies(): Promise<void>;
}
export declare const TerminalExtensions: {
    Backend: string;
};
export interface ITerminalBackendRegistry {
    backends: ReadonlyMap<string, ITerminalBackend>;
    registerTerminalBackend(backend: ITerminalBackend): void;
    getTerminalBackend(remoteAuthority?: string): ITerminalBackend | undefined;
}
export declare const ILocalPtyService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILocalPtyService>;
export interface ILocalPtyService extends IPtyHostService {
}
export declare const ITerminalLogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ITerminalLogService>;
export interface ITerminalLogService extends ILogService {
    readonly _logBrand: undefined;
}
export {};
