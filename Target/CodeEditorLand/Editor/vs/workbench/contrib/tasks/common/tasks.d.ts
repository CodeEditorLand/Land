import * as nls from '../../../../nls.js';
import { IJSONSchemaMap } from '../../../../base/common/jsonSchema.js';
import { UriComponents, URI } from '../../../../base/common/uri.js';
import { ProblemMatcher } from './problemMatcher.js';
import { IWorkspaceFolder, IWorkspace } from '../../../../platform/workspace/common/workspace.js';
import { RawContextKey, ContextKeyExpression } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { TerminalExitReason } from '../../../../platform/terminal/common/terminal.js';
export declare const USER_TASKS_GROUP_KEY = "settings";
export declare const TASK_RUNNING_STATE: RawContextKey<boolean>;
export declare const TASKS_CATEGORY: nls.ILocalizedString;
export declare enum ShellQuoting {
    /**
     * Use character escaping.
     */
    Escape = 1,
    /**
     * Use strong quoting
     */
    Strong = 2,
    /**
     * Use weak quoting.
     */
    Weak = 3
}
export declare const CUSTOMIZED_TASK_TYPE = "$customized";
export declare namespace ShellQuoting {
    function from(this: void, value: string): ShellQuoting;
}
export interface IShellQuotingOptions {
    /**
     * The character used to do character escaping.
     */
    escape?: string | {
        escapeChar: string;
        charsToEscape: string;
    };
    /**
     * The character used for string quoting.
     */
    strong?: string;
    /**
     * The character used for weak quoting.
     */
    weak?: string;
}
export interface IShellConfiguration {
    /**
     * The shell executable.
     */
    executable?: string;
    /**
     * The arguments to be passed to the shell executable.
     */
    args?: string[];
    /**
     * Which kind of quotes the shell supports.
     */
    quoting?: IShellQuotingOptions;
}
export interface CommandOptions {
    /**
     * The shell to use if the task is a shell command.
     */
    shell?: IShellConfiguration;
    /**
     * The current working directory of the executed program or shell.
     * If omitted VSCode's current workspace root is used.
     */
    cwd?: string;
    /**
     * The environment of the executed program or shell. If omitted
     * the parent process' environment is used.
     */
    env?: {
        [key: string]: string;
    };
}
export declare namespace CommandOptions {
    const defaults: CommandOptions;
}
export declare enum RevealKind {
    /**
     * Always brings the terminal to front if the task is executed.
     */
    Always = 1,
    /**
     * Only brings the terminal to front if a problem is detected executing the task
     * e.g. the task couldn't be started,
     * the task ended with an exit code other than zero,
     * or the problem matcher found an error.
     */
    Silent = 2,
    /**
     * The terminal never comes to front when the task is executed.
     */
    Never = 3
}
export declare namespace RevealKind {
    function fromString(this: void, value: string): RevealKind;
}
export declare enum RevealProblemKind {
    /**
     * Never reveals the problems panel when this task is executed.
     */
    Never = 1,
    /**
     * Only reveals the problems panel if a problem is found.
     */
    OnProblem = 2,
    /**
     * Never reveals the problems panel when this task is executed.
     */
    Always = 3
}
export declare namespace RevealProblemKind {
    function fromString(this: void, value: string): RevealProblemKind;
}
export declare enum PanelKind {
    /**
     * Shares a panel with other tasks. This is the default.
     */
    Shared = 1,
    /**
     * Uses a dedicated panel for this tasks. The panel is not
     * shared with other tasks.
     */
    Dedicated = 2,
    /**
     * Creates a new panel whenever this task is executed.
     */
    New = 3
}
export declare namespace PanelKind {
    function fromString(value: string): PanelKind;
}
export interface IPresentationOptions {
    /**
     * Controls whether the task output is reveal in the user interface.
     * Defaults to `RevealKind.Always`.
     */
    reveal: RevealKind;
    /**
     * Controls whether the problems pane is revealed when running this task or not.
     * Defaults to `RevealProblemKind.Never`.
     */
    revealProblems: RevealProblemKind;
    /**
     * Controls whether the command associated with the task is echoed
     * in the user interface.
     */
    echo: boolean;
    /**
     * Controls whether the panel showing the task output is taking focus.
     */
    focus: boolean;
    /**
     * Controls if the task panel is used for this task only (dedicated),
     * shared between tasks (shared) or if a new panel is created on
     * every task execution (new). Defaults to `TaskInstanceKind.Shared`
     */
    panel: PanelKind;
    /**
     * Controls whether to show the "Terminal will be reused by tasks, press any key to close it" message.
     */
    showReuseMessage: boolean;
    /**
     * Controls whether to clear the terminal before executing the task.
     */
    clear: boolean;
    /**
     * Controls whether the task is executed in a specific terminal group using split panes.
     */
    group?: string;
    /**
     * Controls whether the terminal that the task runs in is closed when the task completes.
     */
    close?: boolean;
}
export declare namespace PresentationOptions {
    const defaults: IPresentationOptions;
}
export declare enum RuntimeType {
    Shell = 1,
    Process = 2,
    CustomExecution = 3
}
export declare namespace RuntimeType {
    function fromString(value: string): RuntimeType;
    function toString(value: RuntimeType): string;
}
export interface IQuotedString {
    value: string;
    quoting: ShellQuoting;
}
export type CommandString = string | IQuotedString;
export declare namespace CommandString {
    function value(value: CommandString): string;
}
export interface ICommandConfiguration {
    /**
     * The task type
     */
    runtime?: RuntimeType;
    /**
     * The command to execute
     */
    name?: CommandString;
    /**
     * Additional command options.
     */
    options?: CommandOptions;
    /**
     * Command arguments.
     */
    args?: CommandString[];
    /**
     * The task selector if needed.
     */
    taskSelector?: string;
    /**
     * Whether to suppress the task name when merging global args
     *
     */
    suppressTaskName?: boolean;
    /**
     * Describes how the task is presented in the UI.
     */
    presentation?: IPresentationOptions;
}
export declare namespace TaskGroup {
    const Clean: TaskGroup;
    const Build: TaskGroup;
    const Rebuild: TaskGroup;
    const Test: TaskGroup;
    function is(value: any): value is string;
    function from(value: string | TaskGroup | undefined): TaskGroup | undefined;
}
export interface TaskGroup {
    _id: string;
    isDefault?: boolean | string;
}
export declare const enum TaskScope {
    Global = 1,
    Workspace = 2,
    Folder = 3
}
export declare namespace TaskSourceKind {
    const Workspace: 'workspace';
    const Extension: 'extension';
    const InMemory: 'inMemory';
    const WorkspaceFile: 'workspaceFile';
    const User: 'user';
    function toConfigurationTarget(kind: string): ConfigurationTarget;
}
export interface ITaskSourceConfigElement {
    workspaceFolder?: IWorkspaceFolder;
    workspace?: IWorkspace;
    file: string;
    index: number;
    element: any;
}
interface IBaseTaskSource {
    readonly kind: string;
    readonly label: string;
}
export interface IWorkspaceTaskSource extends IBaseTaskSource {
    readonly kind: 'workspace';
    readonly config: ITaskSourceConfigElement;
    readonly customizes?: KeyedTaskIdentifier;
}
export interface IExtensionTaskSource extends IBaseTaskSource {
    readonly kind: 'extension';
    readonly extension?: string;
    readonly scope: TaskScope;
    readonly workspaceFolder: IWorkspaceFolder | undefined;
}
export interface IExtensionTaskSourceTransfer {
    __workspaceFolder: UriComponents;
    __definition: {
        type: string;
        [name: string]: any;
    };
}
export interface IInMemoryTaskSource extends IBaseTaskSource {
    readonly kind: 'inMemory';
}
export interface IUserTaskSource extends IBaseTaskSource {
    readonly kind: 'user';
    readonly config: ITaskSourceConfigElement;
    readonly customizes?: KeyedTaskIdentifier;
}
export interface WorkspaceFileTaskSource extends IBaseTaskSource {
    readonly kind: 'workspaceFile';
    readonly config: ITaskSourceConfigElement;
    readonly customizes?: KeyedTaskIdentifier;
}
export type TaskSource = IWorkspaceTaskSource | IExtensionTaskSource | IInMemoryTaskSource | IUserTaskSource | WorkspaceFileTaskSource;
export type FileBasedTaskSource = IWorkspaceTaskSource | IUserTaskSource | WorkspaceFileTaskSource;
export interface ITaskIdentifier {
    type: string;
    [name: string]: any;
}
export interface KeyedTaskIdentifier extends ITaskIdentifier {
    _key: string;
}
export interface ITaskDependency {
    uri: URI | string;
    task: string | KeyedTaskIdentifier | undefined;
}
export declare const enum DependsOrder {
    parallel = "parallel",
    sequence = "sequence"
}
export interface IConfigurationProperties {
    /**
     * The task's name
     */
    name?: string;
    /**
     * The task's name
     */
    identifier?: string;
    /**
     * The task's group;
     */
    group?: string | TaskGroup;
    /**
     * The presentation options
     */
    presentation?: IPresentationOptions;
    /**
     * The command options;
     */
    options?: CommandOptions;
    /**
     * Whether the task is a background task or not.
     */
    isBackground?: boolean;
    /**
     * Whether the task should prompt on close for confirmation if running.
     */
    promptOnClose?: boolean;
    /**
     * The other tasks this task depends on.
     */
    dependsOn?: ITaskDependency[];
    /**
     * The order the dependsOn tasks should be executed in.
     */
    dependsOrder?: DependsOrder;
    /**
     * A description of the task.
     */
    detail?: string;
    /**
     * The problem watchers to use for this task
     */
    problemMatchers?: Array<string | ProblemMatcher>;
    /**
     * The icon for this task in the terminal tabs list
     */
    icon?: {
        id?: string;
        color?: string;
    };
    /**
     * Do not show this task in the run task quickpick
     */
    hide?: boolean;
}
export declare enum RunOnOptions {
    default = 1,
    folderOpen = 2
}
export interface IRunOptions {
    reevaluateOnRerun?: boolean;
    runOn?: RunOnOptions;
    instanceLimit?: number;
}
export declare namespace RunOptions {
    const defaults: IRunOptions;
}
export declare abstract class CommonTask {
    /**
     * The task's internal id
     */
    readonly _id: string;
    /**
     * The cached label.
     */
    _label: string;
    type?: string;
    runOptions: IRunOptions;
    configurationProperties: IConfigurationProperties;
    _source: IBaseTaskSource;
    private _taskLoadMessages;
    protected constructor(id: string, label: string | undefined, type: string | undefined, runOptions: IRunOptions, configurationProperties: IConfigurationProperties, source: IBaseTaskSource);
    getDefinition(useSource?: boolean): KeyedTaskIdentifier | undefined;
    getMapKey(): string;
    getKey(): string | undefined;
    protected abstract getFolderId(): string | undefined;
    getCommonTaskId(): string;
    clone(): Task;
    protected abstract fromObject(object: any): Task;
    getWorkspaceFolder(): IWorkspaceFolder | undefined;
    getWorkspaceFileName(): string | undefined;
    getTelemetryKind(): string;
    matches(key: string | KeyedTaskIdentifier | undefined, compareId?: boolean): boolean;
    getQualifiedLabel(): string;
    getTaskExecution(): ITaskExecution;
    addTaskLoadMessages(messages: string[] | undefined): void;
    get taskLoadMessages(): string[] | undefined;
}
/**
 * For tasks of type shell or process, this is created upon parse
 * of the tasks.json or workspace file.
 * For ContributedTasks of all other types, this is the result of
 * resolving a ConfiguringTask.
 */
export declare class CustomTask extends CommonTask {
    type: '$customized';
    instance: number | undefined;
    /**
     * Indicated the source of the task (e.g. tasks.json or extension)
     */
    _source: FileBasedTaskSource;
    hasDefinedMatchers: boolean;
    /**
     * The command configuration
     */
    command: ICommandConfiguration;
    constructor(id: string, source: FileBasedTaskSource, label: string, type: string, command: ICommandConfiguration | undefined, hasDefinedMatchers: boolean, runOptions: IRunOptions, configurationProperties: IConfigurationProperties);
    clone(): CustomTask;
    customizes(): KeyedTaskIdentifier | undefined;
    getDefinition(useSource?: boolean): KeyedTaskIdentifier;
    static is(value: any): value is CustomTask;
    getMapKey(): string;
    protected getFolderId(): string | undefined;
    getCommonTaskId(): string;
    /**
     * @returns A key representing the task
     */
    getKey(): string | undefined;
    getWorkspaceFolder(): IWorkspaceFolder | undefined;
    getWorkspaceFileName(): string | undefined;
    getTelemetryKind(): string;
    protected fromObject(object: CustomTask): CustomTask;
}
/**
 * After a contributed task has been parsed, but before
 * the task has been resolved via the extension, its properties
 * are stored in this
 */
export declare class ConfiguringTask extends CommonTask {
    /**
     * Indicated the source of the task (e.g. tasks.json or extension)
     */
    _source: FileBasedTaskSource;
    configures: KeyedTaskIdentifier;
    constructor(id: string, source: FileBasedTaskSource, label: string | undefined, type: string | undefined, configures: KeyedTaskIdentifier, runOptions: IRunOptions, configurationProperties: IConfigurationProperties);
    static is(value: any): value is ConfiguringTask;
    protected fromObject(object: any): Task;
    getDefinition(): KeyedTaskIdentifier;
    getWorkspaceFileName(): string | undefined;
    getWorkspaceFolder(): IWorkspaceFolder | undefined;
    protected getFolderId(): string | undefined;
    getKey(): string | undefined;
}
/**
 * A task from an extension created via resolveTask or provideTask
 */
export declare class ContributedTask extends CommonTask {
    /**
     * Indicated the source of the task (e.g. tasks.json or extension)
     * Set in the super constructor
     */
    _source: IExtensionTaskSource;
    instance: number | undefined;
    defines: KeyedTaskIdentifier;
    hasDefinedMatchers: boolean;
    /**
     * The command configuration
     */
    command: ICommandConfiguration;
    /**
     * The icon for the task
     */
    icon: {
        id?: string;
        color?: string;
    } | undefined;
    /**
     * Don't show the task in the run task quickpick
     */
    hide?: boolean;
    constructor(id: string, source: IExtensionTaskSource, label: string, type: string | undefined, defines: KeyedTaskIdentifier, command: ICommandConfiguration, hasDefinedMatchers: boolean, runOptions: IRunOptions, configurationProperties: IConfigurationProperties);
    clone(): ContributedTask;
    getDefinition(): KeyedTaskIdentifier;
    static is(value: any): value is ContributedTask;
    getMapKey(): string;
    protected getFolderId(): string | undefined;
    getKey(): string | undefined;
    getWorkspaceFolder(): IWorkspaceFolder | undefined;
    getTelemetryKind(): string;
    protected fromObject(object: ContributedTask): ContributedTask;
}
export declare class InMemoryTask extends CommonTask {
    /**
     * Indicated the source of the task (e.g. tasks.json or extension)
     */
    _source: IInMemoryTaskSource;
    instance: number | undefined;
    type: 'inMemory';
    constructor(id: string, source: IInMemoryTaskSource, label: string, type: string, runOptions: IRunOptions, configurationProperties: IConfigurationProperties);
    clone(): InMemoryTask;
    static is(value: any): value is InMemoryTask;
    getTelemetryKind(): string;
    getMapKey(): string;
    protected getFolderId(): undefined;
    protected fromObject(object: InMemoryTask): InMemoryTask;
}
export type Task = CustomTask | ContributedTask | InMemoryTask;
export interface ITaskExecution {
    id: string;
    task: Task;
}
export declare enum ExecutionEngine {
    Process = 1,
    Terminal = 2
}
export declare namespace ExecutionEngine {
    const _default: ExecutionEngine;
}
export declare const enum JsonSchemaVersion {
    V0_1_0 = 1,
    V2_0_0 = 2
}
export interface ITaskSet {
    tasks: Task[];
    extension?: IExtensionDescription;
}
export interface ITaskDefinition {
    extensionId: string;
    taskType: string;
    required: string[];
    properties: IJSONSchemaMap;
    when?: ContextKeyExpression;
}
export declare class TaskSorter {
    private _order;
    constructor(workspaceFolders: IWorkspaceFolder[]);
    compare(a: Task | ConfiguringTask, b: Task | ConfiguringTask): number;
}
export declare const enum TaskEventKind {
    DependsOnStarted = "dependsOnStarted",
    AcquiredInput = "acquiredInput",
    Start = "start",
    ProcessStarted = "processStarted",
    Active = "active",
    Inactive = "inactive",
    Changed = "changed",
    Terminated = "terminated",
    ProcessEnded = "processEnded",
    End = "end"
}
export declare const enum TaskRunType {
    SingleRun = "singleRun",
    Background = "background"
}
export interface ITaskChangedEvent {
    kind: TaskEventKind.Changed;
}
interface ITaskCommon {
    taskId: string;
    runType: TaskRunType;
    taskName: string | undefined;
    group: string | TaskGroup | undefined;
    __task: Task;
}
export interface ITaskProcessStartedEvent extends ITaskCommon {
    kind: TaskEventKind.ProcessStarted;
    terminalId: number;
    processId: number;
}
export interface ITaskProcessEndedEvent extends ITaskCommon {
    kind: TaskEventKind.ProcessEnded;
    terminalId: number | undefined;
    exitCode?: number;
}
export interface ITaskTerminatedEvent extends ITaskCommon {
    kind: TaskEventKind.Terminated;
    terminalId: number;
    exitReason: TerminalExitReason | undefined;
}
export interface ITaskStartedEvent extends ITaskCommon {
    kind: TaskEventKind.Start;
    terminalId: number;
    resolvedVariables: Map<string, string>;
}
export interface ITaskGeneralEvent extends ITaskCommon {
    kind: TaskEventKind.AcquiredInput | TaskEventKind.DependsOnStarted | TaskEventKind.Active | TaskEventKind.Inactive | TaskEventKind.End;
    terminalId: number | undefined;
}
export type ITaskEvent = ITaskChangedEvent | ITaskProcessStartedEvent | ITaskProcessEndedEvent | ITaskTerminatedEvent | ITaskStartedEvent | ITaskGeneralEvent;
export declare const enum TaskRunSource {
    System = 0,
    User = 1,
    FolderOpen = 2,
    ConfigurationChange = 3,
    Reconnect = 4
}
export declare namespace TaskEvent {
    function start(task: Task, terminalId: number, resolvedVariables: Map<string, string>): ITaskStartedEvent;
    function processStarted(task: Task, terminalId: number, processId: number): ITaskProcessStartedEvent;
    function processEnded(task: Task, terminalId: number | undefined, exitCode: number | undefined): ITaskProcessEndedEvent;
    function terminated(task: Task, terminalId: number, exitReason: TerminalExitReason | undefined): ITaskTerminatedEvent;
    function general(kind: TaskEventKind.AcquiredInput | TaskEventKind.DependsOnStarted | TaskEventKind.Active | TaskEventKind.Inactive | TaskEventKind.End, task: Task, terminalId?: number): ITaskGeneralEvent;
    function changed(): ITaskChangedEvent;
}
export declare namespace KeyedTaskIdentifier {
    function create(value: ITaskIdentifier): KeyedTaskIdentifier;
}
export declare const enum TaskSettingId {
    AutoDetect = "task.autoDetect",
    SaveBeforeRun = "task.saveBeforeRun",
    ShowDecorations = "task.showDecorations",
    ProblemMatchersNeverPrompt = "task.problemMatchers.neverPrompt",
    SlowProviderWarning = "task.slowProviderWarning",
    QuickOpenHistory = "task.quickOpen.history",
    QuickOpenDetail = "task.quickOpen.detail",
    QuickOpenSkip = "task.quickOpen.skip",
    QuickOpenShowAll = "task.quickOpen.showAll",
    AllowAutomaticTasks = "task.allowAutomaticTasks",
    Reconnection = "task.reconnection",
    VerboseLogging = "task.verboseLogging"
}
export declare const enum TasksSchemaProperties {
    Tasks = "tasks",
    SuppressTaskName = "tasks.suppressTaskName",
    Windows = "tasks.windows",
    Osx = "tasks.osx",
    Linux = "tasks.linux",
    ShowOutput = "tasks.showOutput",
    IsShellCommand = "tasks.isShellCommand",
    ServiceTestSetting = "tasks.service.testSetting"
}
export declare namespace TaskDefinition {
    function createTaskIdentifier(external: ITaskIdentifier, reporter: {
        error(message: string): void;
    }): KeyedTaskIdentifier | undefined;
}
export {};
