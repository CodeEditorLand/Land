import type * as vscode from 'vscode';
import { Event, Emitter } from '../../../base/common/event.js';
import { ExtHostTerminalServiceShape, MainThreadTerminalServiceShape, ITerminalDimensionsDto, ITerminalLinkDto, ExtHostTerminalIdentifier, ICommandDto, ITerminalQuickFixOpenerDto, ITerminalQuickFixTerminalCommandDto, TerminalCommandMatchResultDto, ITerminalCommandDto } from './extHost.protocol.js';
import { URI } from '../../../base/common/uri.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IDisposable, Disposable } from '../../../base/common/lifecycle.js';
import { TerminalExitReason } from './extHostTypes.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { IEnvironmentVariableCollectionDescription, IEnvironmentVariableMutator, ISerializableEnvironmentVariableCollection } from '../../../platform/terminal/common/environmentVariable.js';
import { ICreateContributedTerminalProfileOptions, IShellLaunchConfigDto, ITerminalChildProcess, ITerminalLaunchError, ITerminalProfile, TerminalIcon, TerminalLocation } from '../../../platform/terminal/common/terminal.js';
import { ThemeColor } from '../../../base/common/themables.js';
import { IExtHostCommands } from './extHostCommands.js';
export interface IExtHostTerminalService extends ExtHostTerminalServiceShape, IDisposable {
    readonly _serviceBrand: undefined;
    activeTerminal: vscode.Terminal | undefined;
    terminals: vscode.Terminal[];
    readonly onDidCloseTerminal: Event<vscode.Terminal>;
    readonly onDidOpenTerminal: Event<vscode.Terminal>;
    readonly onDidChangeActiveTerminal: Event<vscode.Terminal | undefined>;
    readonly onDidChangeTerminalDimensions: Event<vscode.TerminalDimensionsChangeEvent>;
    readonly onDidChangeTerminalState: Event<vscode.Terminal>;
    readonly onDidWriteTerminalData: Event<vscode.TerminalDataWriteEvent>;
    readonly onDidExecuteTerminalCommand: Event<vscode.TerminalExecutedCommand>;
    readonly onDidChangeShell: Event<string>;
    createTerminal(name?: string, shellPath?: string, shellArgs?: readonly string[] | string): vscode.Terminal;
    createTerminalFromOptions(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
    createExtensionTerminal(options: vscode.ExtensionTerminalOptions): vscode.Terminal;
    attachPtyToTerminal(id: number, pty: vscode.Pseudoterminal): void;
    getDefaultShell(useAutomationShell: boolean): string;
    getDefaultShellArgs(useAutomationShell: boolean): string[] | string;
    registerLinkProvider(provider: vscode.TerminalLinkProvider): vscode.Disposable;
    registerProfileProvider(extension: IExtensionDescription, id: string, provider: vscode.TerminalProfileProvider): vscode.Disposable;
    registerTerminalQuickFixProvider(id: string, extensionId: string, provider: vscode.TerminalQuickFixProvider): vscode.Disposable;
    getEnvironmentVariableCollection(extension: IExtensionDescription): IEnvironmentVariableCollection;
    getTerminalById(id: number): ExtHostTerminal | null;
    getTerminalIdByApiObject(apiTerminal: vscode.Terminal): number | null;
}
interface IEnvironmentVariableCollection extends vscode.EnvironmentVariableCollection {
    getScoped(scope: vscode.EnvironmentVariableScope): vscode.EnvironmentVariableCollection;
}
export interface ITerminalInternalOptions {
    cwd?: string | URI;
    isFeatureTerminal?: boolean;
    forceShellIntegration?: boolean;
    useShellEnvironment?: boolean;
    resolvedExtHostIdentifier?: ExtHostTerminalIdentifier;
    location?: TerminalLocation | {
        viewColumn: number;
        preserveState?: boolean;
    } | {
        splitActiveTerminal: boolean;
    };
}
export declare const IExtHostTerminalService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostTerminalService>;
export declare class ExtHostTerminal extends Disposable {
    private _proxy;
    _id: ExtHostTerminalIdentifier;
    private readonly _creationOptions;
    private _name?;
    private _disposed;
    private _pidPromise;
    private _cols;
    private _pidPromiseComplete;
    private _rows;
    private _exitStatus;
    private _state;
    private _selection;
    shellIntegration: vscode.TerminalShellIntegration | undefined;
    isOpen: boolean;
    readonly value: vscode.Terminal;
    protected readonly _onWillDispose: Emitter<void>;
    readonly onWillDispose: Event<void>;
    constructor(_proxy: MainThreadTerminalServiceShape, _id: ExtHostTerminalIdentifier, _creationOptions: vscode.TerminalOptions | vscode.ExtensionTerminalOptions, _name?: string | undefined);
    dispose(): void;
    create(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): Promise<void>;
    createExtensionTerminal(location?: TerminalLocation | vscode.TerminalEditorLocationOptions | vscode.TerminalSplitLocationOptions, internalOptions?: ITerminalInternalOptions, parentTerminal?: ExtHostTerminalIdentifier, iconPath?: TerminalIcon, color?: ThemeColor): Promise<number>;
    private _serializeParentTerminal;
    private _checkDisposed;
    set name(name: string);
    setExitStatus(code: number | undefined, reason: TerminalExitReason): void;
    setDimensions(cols: number, rows: number): boolean;
    setInteractedWith(): boolean;
    setSelection(selection: string | undefined): void;
    _setProcessId(processId: number | undefined): void;
}
export declare abstract class BaseExtHostTerminalService extends Disposable implements IExtHostTerminalService, ExtHostTerminalServiceShape {
    private readonly _extHostCommands;
    readonly _serviceBrand: undefined;
    protected _proxy: MainThreadTerminalServiceShape;
    protected _activeTerminal: ExtHostTerminal | undefined;
    protected _terminals: ExtHostTerminal[];
    protected _terminalProcesses: Map<number, ITerminalChildProcess>;
    protected _terminalProcessDisposables: {
        [id: number]: IDisposable;
    };
    protected _extensionTerminalAwaitingStart: {
        [id: number]: {
            initialDimensions: ITerminalDimensionsDto | undefined;
        } | undefined;
    };
    protected _getTerminalPromises: {
        [id: number]: Promise<ExtHostTerminal | undefined>;
    };
    protected _environmentVariableCollections: Map<string, UnifiedEnvironmentVariableCollection>;
    private _defaultProfile;
    private _defaultAutomationProfile;
    private readonly _lastQuickFixCommands;
    private readonly _bufferer;
    private readonly _linkProviders;
    private readonly _profileProviders;
    private readonly _quickFixProviders;
    private readonly _terminalLinkCache;
    private readonly _terminalLinkCancellationSource;
    get activeTerminal(): vscode.Terminal | undefined;
    get terminals(): vscode.Terminal[];
    protected readonly _onDidCloseTerminal: Emitter<vscode.Terminal>;
    readonly onDidCloseTerminal: Event<vscode.Terminal>;
    protected readonly _onDidOpenTerminal: Emitter<vscode.Terminal>;
    readonly onDidOpenTerminal: Event<vscode.Terminal>;
    protected readonly _onDidChangeActiveTerminal: Emitter<vscode.Terminal | undefined>;
    readonly onDidChangeActiveTerminal: Event<vscode.Terminal | undefined>;
    protected readonly _onDidChangeTerminalDimensions: Emitter<vscode.TerminalDimensionsChangeEvent>;
    readonly onDidChangeTerminalDimensions: Event<vscode.TerminalDimensionsChangeEvent>;
    protected readonly _onDidChangeTerminalState: Emitter<vscode.Terminal>;
    readonly onDidChangeTerminalState: Event<vscode.Terminal>;
    protected readonly _onDidChangeShell: Emitter<string>;
    readonly onDidChangeShell: Event<string>;
    protected readonly _onDidWriteTerminalData: Emitter<vscode.TerminalDataWriteEvent>;
    readonly onDidWriteTerminalData: Event<vscode.TerminalDataWriteEvent>;
    protected readonly _onDidExecuteCommand: Emitter<vscode.TerminalExecutedCommand>;
    readonly onDidExecuteTerminalCommand: Event<vscode.TerminalExecutedCommand>;
    constructor(supportsProcesses: boolean, _extHostCommands: IExtHostCommands, extHostRpc: IExtHostRpcService);
    abstract createTerminal(name?: string, shellPath?: string, shellArgs?: string[] | string): vscode.Terminal;
    abstract createTerminalFromOptions(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
    getDefaultShell(useAutomationShell: boolean): string;
    getDefaultShellArgs(useAutomationShell: boolean): string[] | string;
    createExtensionTerminal(options: vscode.ExtensionTerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
    protected _serializeParentTerminal(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): ITerminalInternalOptions;
    attachPtyToTerminal(id: number, pty: vscode.Pseudoterminal): void;
    $acceptActiveTerminalChanged(id: number | null): Promise<void>;
    $acceptTerminalProcessData(id: number, data: string): Promise<void>;
    $acceptTerminalDimensions(id: number, cols: number, rows: number): Promise<void>;
    $acceptDidExecuteCommand(id: number, command: ITerminalCommandDto): Promise<void>;
    $acceptTerminalMaximumDimensions(id: number, cols: number, rows: number): Promise<void>;
    $acceptTerminalTitleChange(id: number, name: string): Promise<void>;
    $acceptTerminalClosed(id: number, exitCode: number | undefined, exitReason: TerminalExitReason): Promise<void>;
    $acceptTerminalOpened(id: number, extHostTerminalId: string | undefined, name: string, shellLaunchConfigDto: IShellLaunchConfigDto): void;
    $acceptTerminalProcessId(id: number, processId: number): Promise<void>;
    $startExtensionTerminal(id: number, initialDimensions: ITerminalDimensionsDto | undefined): Promise<ITerminalLaunchError | undefined>;
    protected _setupExtHostProcessListeners(id: number, p: ITerminalChildProcess): IDisposable;
    $acceptProcessAckDataEvent(id: number, charCount: number): void;
    $acceptProcessInput(id: number, data: string): void;
    $acceptTerminalInteraction(id: number): void;
    $acceptTerminalSelection(id: number, selection: string | undefined): void;
    $acceptProcessResize(id: number, cols: number, rows: number): void;
    $acceptProcessShutdown(id: number, immediate: boolean): void;
    $acceptProcessRequestInitialCwd(id: number): void;
    $acceptProcessRequestCwd(id: number): void;
    $acceptProcessRequestLatency(id: number): Promise<number>;
    registerLinkProvider(provider: vscode.TerminalLinkProvider): vscode.Disposable;
    registerProfileProvider(extension: IExtensionDescription, id: string, provider: vscode.TerminalProfileProvider): vscode.Disposable;
    registerTerminalQuickFixProvider(id: string, extensionId: string, provider: vscode.TerminalQuickFixProvider): vscode.Disposable;
    $provideTerminalQuickFixes(id: string, matchResult: TerminalCommandMatchResultDto): Promise<(ITerminalQuickFixTerminalCommandDto | ITerminalQuickFixOpenerDto | ICommandDto)[] | ITerminalQuickFixTerminalCommandDto | ITerminalQuickFixOpenerDto | ICommandDto | undefined>;
    $createContributedProfileTerminal(id: string, options: ICreateContributedTerminalProfileOptions): Promise<void>;
    $provideLinks(terminalId: number, line: string): Promise<ITerminalLinkDto[]>;
    $activateLink(terminalId: number, linkId: number): void;
    private _onProcessExit;
    getTerminalById(id: number): ExtHostTerminal | null;
    getTerminalIdByApiObject(terminal: vscode.Terminal): number | null;
    private _getTerminalObjectById;
    private _getTerminalObjectIndexById;
    getEnvironmentVariableCollection(extension: IExtensionDescription): IEnvironmentVariableCollection;
    private _syncEnvironmentVariableCollection;
    $initEnvironmentVariableCollections(collections: [string, ISerializableEnvironmentVariableCollection][]): void;
    $acceptDefaultProfile(profile: ITerminalProfile, automationProfile: ITerminalProfile): void;
    private _setEnvironmentVariableCollection;
}
declare class UnifiedEnvironmentVariableCollection extends Disposable {
    readonly map: Map<string, IEnvironmentVariableMutator>;
    private readonly scopedCollections;
    readonly descriptionMap: Map<string, IEnvironmentVariableCollectionDescription>;
    private _persistent;
    get persistent(): boolean;
    set persistent(value: boolean);
    protected readonly _onDidChangeCollection: Emitter<void>;
    get onDidChangeCollection(): Event<void>;
    constructor(serialized?: ISerializableEnvironmentVariableCollection);
    getScopedEnvironmentVariableCollection(scope: vscode.EnvironmentVariableScope | undefined): IEnvironmentVariableCollection;
    replace(variable: string, value: string, options: vscode.EnvironmentVariableMutatorOptions | undefined, scope: vscode.EnvironmentVariableScope | undefined): void;
    append(variable: string, value: string, options: vscode.EnvironmentVariableMutatorOptions | undefined, scope: vscode.EnvironmentVariableScope | undefined): void;
    prepend(variable: string, value: string, options: vscode.EnvironmentVariableMutatorOptions | undefined, scope: vscode.EnvironmentVariableScope | undefined): void;
    private _setIfDiffers;
    get(variable: string, scope: vscode.EnvironmentVariableScope | undefined): vscode.EnvironmentVariableMutator | undefined;
    private getKey;
    private getScopeKey;
    private getWorkspaceKey;
    getVariableMap(scope: vscode.EnvironmentVariableScope | undefined): Map<string, vscode.EnvironmentVariableMutator>;
    delete(variable: string, scope: vscode.EnvironmentVariableScope | undefined): void;
    clear(scope: vscode.EnvironmentVariableScope | undefined): void;
    setDescription(description: string | vscode.MarkdownString | undefined, scope: vscode.EnvironmentVariableScope | undefined): void;
    getDescription(scope: vscode.EnvironmentVariableScope | undefined): string | vscode.MarkdownString | undefined;
    private clearDescription;
}
export declare class WorkerExtHostTerminalService extends BaseExtHostTerminalService {
    constructor(extHostCommands: IExtHostCommands, extHostRpc: IExtHostRpcService);
    createTerminal(name?: string, shellPath?: string, shellArgs?: string[] | string): vscode.Terminal;
    createTerminalFromOptions(options: vscode.TerminalOptions, internalOptions?: ITerminalInternalOptions): vscode.Terminal;
}
export {};
