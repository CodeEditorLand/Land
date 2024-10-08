import { IStringDictionary } from '../../../../base/common/collections.js';
import { Platform } from '../../../../base/common/platform.js';
import { ValidationStatus, IProblemReporter as IProblemReporterBase } from '../../../../base/common/parsers.js';
import { INamedProblemMatcher, Config as ProblemMatcherConfig, ProblemMatcher } from './problemMatcher.js';
import { IWorkspaceFolder, IWorkspace } from '../../../../platform/workspace/common/workspace.js';
import * as Tasks from './tasks.js';
import { ITaskDefinitionRegistry } from './taskDefinitionRegistry.js';
import { ConfiguredInput } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
export declare const enum ShellQuoting {
    /**
     * Default is character escaping.
     */
    escape = 1,
    /**
     * Default is strong quoting
     */
    strong = 2,
    /**
     * Default is weak quoting.
     */
    weak = 3
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
    executable?: string;
    args?: string[];
    quoting?: IShellQuotingOptions;
}
export interface ICommandOptionsConfig {
    /**
     * The current working directory of the executed program or shell.
     * If omitted VSCode's current workspace root is used.
     */
    cwd?: string;
    /**
     * The additional environment of the executed program or shell. If omitted
     * the parent process' environment is used.
     */
    env?: IStringDictionary<string>;
    /**
     * The shell configuration;
     */
    shell?: IShellConfiguration;
}
export interface IPresentationOptionsConfig {
    /**
     * Controls whether the terminal executing a task is brought to front or not.
     * Defaults to `RevealKind.Always`.
     */
    reveal?: string;
    /**
     * Controls whether the problems panel is revealed when running this task or not.
     * Defaults to `RevealKind.Never`.
     */
    revealProblems?: string;
    /**
     * Controls whether the executed command is printed to the output window or terminal as well.
     */
    echo?: boolean;
    /**
     * Controls whether the terminal is focus when this task is executed
     */
    focus?: boolean;
    /**
     * Controls whether the task runs in a new terminal
     */
    panel?: string;
    /**
     * Controls whether to show the "Terminal will be reused by tasks, press any key to close it" message.
     */
    showReuseMessage?: boolean;
    /**
     * Controls whether the terminal should be cleared before running the task.
     */
    clear?: boolean;
    /**
     * Controls whether the task is executed in a specific terminal group using split panes.
     */
    group?: string;
    /**
     * Controls whether the terminal that the task runs in is closed when the task completes.
     * Note that if the terminal process exits with a non-zero exit code, it will not close.
     */
    close?: boolean;
}
export interface IRunOptionsConfig {
    reevaluateOnRerun?: boolean;
    runOn?: string;
    instanceLimit?: number;
}
export interface ITaskIdentifier {
    type?: string;
    [name: string]: any;
}
export declare namespace ITaskIdentifier {
    function is(value: any): value is ITaskIdentifier;
}
export interface ILegacyTaskProperties {
    /**
     * @deprecated Use `isBackground` instead.
     * Whether the executed command is kept alive and is watching the file system.
     */
    isWatching?: boolean;
    /**
     * @deprecated Use `group` instead.
     * Whether this task maps to the default build command.
     */
    isBuildCommand?: boolean;
    /**
     * @deprecated Use `group` instead.
     * Whether this task maps to the default test command.
     */
    isTestCommand?: boolean;
}
export interface ILegacyCommandProperties {
    /**
     * Whether this is a shell or process
     */
    type?: string;
    /**
     * @deprecated Use presentation options
     * Controls whether the output view of the running tasks is brought to front or not.
     * See BaseTaskRunnerConfiguration#showOutput for details.
     */
    showOutput?: string;
    /**
     * @deprecated Use presentation options
     * Controls whether the executed command is printed to the output windows as well.
     */
    echoCommand?: boolean;
    /**
     * @deprecated Use presentation instead
     */
    terminal?: IPresentationOptionsConfig;
    /**
     * @deprecated Use inline commands.
     * See BaseTaskRunnerConfiguration#suppressTaskName for details.
     */
    suppressTaskName?: boolean;
    /**
     * Some commands require that the task argument is highlighted with a special
     * prefix (e.g. /t: for msbuild). This property can be used to control such
     * a prefix.
     */
    taskSelector?: string;
    /**
     * @deprecated use the task type instead.
     * Specifies whether the command is a shell command and therefore must
     * be executed in a shell interpreter (e.g. cmd.exe, bash, ...).
     *
     * Defaults to false if omitted.
     */
    isShellCommand?: boolean | IShellConfiguration;
}
export type CommandString = string | string[] | {
    value: string | string[];
    quoting: 'escape' | 'strong' | 'weak';
};
export declare namespace CommandString {
    function value(value: CommandString): string;
}
export interface IBaseCommandProperties {
    /**
     * The command to be executed. Can be an external program or a shell
     * command.
     */
    command?: CommandString;
    /**
     * The command options used when the command is executed. Can be omitted.
     */
    options?: ICommandOptionsConfig;
    /**
     * The arguments passed to the command or additional arguments passed to the
     * command when using a global command.
     */
    args?: CommandString[];
}
export interface ICommandProperties extends IBaseCommandProperties {
    /**
     * Windows specific command properties
     */
    windows?: IBaseCommandProperties;
    /**
     * OSX specific command properties
     */
    osx?: IBaseCommandProperties;
    /**
     * linux specific command properties
     */
    linux?: IBaseCommandProperties;
}
export interface IGroupKind {
    kind?: string;
    isDefault?: boolean | string;
}
export interface IConfigurationProperties {
    /**
     * The task's name
     */
    taskName?: string;
    /**
     * The UI label used for the task.
     */
    label?: string;
    /**
     * An optional identifier which can be used to reference a task
     * in a dependsOn or other attributes.
     */
    identifier?: string;
    /**
     * Whether the executed command is kept alive and runs in the background.
     */
    isBackground?: boolean;
    /**
     * Whether the task should prompt on close for confirmation if running.
     */
    promptOnClose?: boolean;
    /**
     * Defines the group the task belongs too.
     */
    group?: string | IGroupKind;
    /**
     * A description of the task.
     */
    detail?: string;
    /**
     * The other tasks the task depend on
     */
    dependsOn?: string | ITaskIdentifier | Array<string | ITaskIdentifier>;
    /**
     * The order the dependsOn tasks should be executed in.
     */
    dependsOrder?: string;
    /**
     * Controls the behavior of the used terminal
     */
    presentation?: IPresentationOptionsConfig;
    /**
     * Controls shell options.
     */
    options?: ICommandOptionsConfig;
    /**
     * The problem matcher(s) to use to capture problems in the tasks
     * output.
     */
    problemMatcher?: ProblemMatcherConfig.ProblemMatcherType;
    /**
     * Task run options. Control run related properties.
     */
    runOptions?: IRunOptionsConfig;
    /**
     * The icon for this task in the terminal tabs list
     */
    icon?: {
        id: string;
        color?: string;
    };
    /**
     * The icon's color in the terminal tabs list
     */
    color?: string;
    /**
     * Do not show this task in the run task quickpick
     */
    hide?: boolean;
}
export interface ICustomTask extends ICommandProperties, IConfigurationProperties {
    /**
     * Custom tasks have the type CUSTOMIZED_TASK_TYPE
     */
    type?: string;
}
export interface IConfiguringTask extends IConfigurationProperties {
    /**
     * The contributed type of the task
     */
    type?: string;
}
/**
 * The base task runner configuration
 */
export interface IBaseTaskRunnerConfiguration {
    /**
     * The command to be executed. Can be an external program or a shell
     * command.
     */
    command?: CommandString;
    /**
     * @deprecated Use type instead
     *
     * Specifies whether the command is a shell command and therefore must
     * be executed in a shell interpreter (e.g. cmd.exe, bash, ...).
     *
     * Defaults to false if omitted.
     */
    isShellCommand?: boolean;
    /**
     * The task type
     */
    type?: string;
    /**
     * The command options used when the command is executed. Can be omitted.
     */
    options?: ICommandOptionsConfig;
    /**
     * The arguments passed to the command. Can be omitted.
     */
    args?: CommandString[];
    /**
     * Controls whether the output view of the running tasks is brought to front or not.
     * Valid values are:
     *   "always": bring the output window always to front when a task is executed.
     *   "silent": only bring it to front if no problem matcher is defined for the task executed.
     *   "never": never bring the output window to front.
     *
     * If omitted "always" is used.
     */
    showOutput?: string;
    /**
     * Controls whether the executed command is printed to the output windows as well.
     */
    echoCommand?: boolean;
    /**
     * The group
     */
    group?: string | IGroupKind;
    /**
     * Controls the behavior of the used terminal
     */
    presentation?: IPresentationOptionsConfig;
    /**
     * If set to false the task name is added as an additional argument to the
     * command when executed. If set to true the task name is suppressed. If
     * omitted false is used.
     */
    suppressTaskName?: boolean;
    /**
     * Some commands require that the task argument is highlighted with a special
     * prefix (e.g. /t: for msbuild). This property can be used to control such
     * a prefix.
     */
    taskSelector?: string;
    /**
     * The problem matcher(s) to used if a global command is executed (e.g. no tasks
     * are defined). A tasks.json file can either contain a global problemMatcher
     * property or a tasks property but not both.
     */
    problemMatcher?: ProblemMatcherConfig.ProblemMatcherType;
    /**
     * @deprecated Use `isBackground` instead.
     *
     * Specifies whether a global command is a watching the filesystem. A task.json
     * file can either contain a global isWatching property or a tasks property
     * but not both.
     */
    isWatching?: boolean;
    /**
     * Specifies whether a global command is a background task.
     */
    isBackground?: boolean;
    /**
     * Whether the task should prompt on close for confirmation if running.
     */
    promptOnClose?: boolean;
    /**
     * The configuration of the available tasks. A tasks.json file can either
     * contain a global problemMatcher property or a tasks property but not both.
     */
    tasks?: Array<ICustomTask | IConfiguringTask>;
    /**
     * Problem matcher declarations.
     */
    declares?: ProblemMatcherConfig.INamedProblemMatcher[];
    /**
     * Optional user input variables.
     */
    inputs?: ConfiguredInput[];
}
/**
 * A configuration of an external build system. BuildConfiguration.buildSystem
 * must be set to 'program'
 */
export interface IExternalTaskRunnerConfiguration extends IBaseTaskRunnerConfiguration {
    _runner?: string;
    /**
     * Determines the runner to use
     */
    runner?: string;
    /**
     * The config's version number
     */
    version: string;
    /**
     * Windows specific task configuration
     */
    windows?: IBaseTaskRunnerConfiguration;
    /**
     * Mac specific task configuration
     */
    osx?: IBaseTaskRunnerConfiguration;
    /**
     * Linux specific task configuration
     */
    linux?: IBaseTaskRunnerConfiguration;
}
type TaskConfigurationValueWithErrors<T> = {
    value?: T;
    errors?: string[];
};
export declare namespace RunOnOptions {
    function fromString(value: string | undefined): Tasks.RunOnOptions;
}
export declare namespace RunOptions {
    function fromConfiguration(value: IRunOptionsConfig | undefined): Tasks.IRunOptions;
    function assignProperties(target: Tasks.IRunOptions, source: Tasks.IRunOptions | undefined): Tasks.IRunOptions;
    function fillProperties(target: Tasks.IRunOptions, source: Tasks.IRunOptions | undefined): Tasks.IRunOptions;
}
export interface IParseContext {
    workspaceFolder: IWorkspaceFolder;
    workspace: IWorkspace | undefined;
    problemReporter: IProblemReporter;
    namedProblemMatchers: IStringDictionary<INamedProblemMatcher>;
    uuidMap: UUIDMap;
    engine: Tasks.ExecutionEngine;
    schemaVersion: Tasks.JsonSchemaVersion;
    platform: Platform;
    taskLoadIssues: string[];
    contextKeyService: IContextKeyService;
}
export declare namespace ProblemMatcherConverter {
    function namedFrom(this: void, declares: ProblemMatcherConfig.INamedProblemMatcher[] | undefined, context: IParseContext): IStringDictionary<INamedProblemMatcher>;
    function fromWithOsConfig(this: void, external: IConfigurationProperties & {
        [key: string]: any;
    }, context: IParseContext): TaskConfigurationValueWithErrors<ProblemMatcher[]>;
    function from(this: void, config: ProblemMatcherConfig.ProblemMatcherType | undefined, context: IParseContext): TaskConfigurationValueWithErrors<ProblemMatcher[]>;
}
export declare namespace GroupKind {
    function from(this: void, external: string | IGroupKind | undefined): Tasks.TaskGroup | undefined;
    function to(group: Tasks.TaskGroup | string): IGroupKind | string;
}
export interface ITaskParseResult {
    custom: Tasks.CustomTask[];
    configured: Tasks.ConfiguringTask[];
}
export declare namespace TaskParser {
    function from(this: void, externals: Array<ICustomTask | IConfiguringTask> | undefined, globals: IGlobals, context: IParseContext, source: TaskConfigSource, registry?: Partial<ITaskDefinitionRegistry>): ITaskParseResult;
    function assignTasks(target: Tasks.CustomTask[], source: Tasks.CustomTask[]): Tasks.CustomTask[];
}
export interface IGlobals {
    command?: Tasks.ICommandConfiguration;
    problemMatcher?: ProblemMatcher[];
    promptOnClose?: boolean;
    suppressTaskName?: boolean;
}
export declare namespace ExecutionEngine {
    function from(config: IExternalTaskRunnerConfiguration): Tasks.ExecutionEngine;
}
export declare namespace JsonSchemaVersion {
    function from(config: IExternalTaskRunnerConfiguration): Tasks.JsonSchemaVersion;
}
export interface IParseResult {
    validationStatus: ValidationStatus;
    custom: Tasks.CustomTask[];
    configured: Tasks.ConfiguringTask[];
    engine: Tasks.ExecutionEngine;
}
export interface IProblemReporter extends IProblemReporterBase {
}
export declare class UUIDMap {
    private last;
    private current;
    constructor(other?: UUIDMap);
    start(): void;
    getUUID(identifier: string): string;
    finish(): void;
}
export declare enum TaskConfigSource {
    TasksJson = 0,
    WorkspaceFile = 1,
    User = 2
}
export declare function parse(workspaceFolder: IWorkspaceFolder, workspace: IWorkspace | undefined, platform: Platform, configuration: IExternalTaskRunnerConfiguration, logger: IProblemReporter, source: TaskConfigSource, contextKeyService: IContextKeyService, isRecents?: boolean): IParseResult;
export declare function createCustomTask(contributedTask: Tasks.ContributedTask, configuredProps: Tasks.ConfiguringTask | Tasks.CustomTask): Tasks.CustomTask;
export {};
