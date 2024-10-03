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
    escape = 1,
    strong = 2,
    weak = 3
}
export interface IShellQuotingOptions {
    escape?: string | {
        escapeChar: string;
        charsToEscape: string;
    };
    strong?: string;
    weak?: string;
}
export interface IShellConfiguration {
    executable?: string;
    args?: string[];
    quoting?: IShellQuotingOptions;
}
export interface ICommandOptionsConfig {
    cwd?: string;
    env?: IStringDictionary<string>;
    shell?: IShellConfiguration;
}
export interface IPresentationOptionsConfig {
    reveal?: string;
    revealProblems?: string;
    echo?: boolean;
    focus?: boolean;
    panel?: string;
    showReuseMessage?: boolean;
    clear?: boolean;
    group?: string;
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
    isWatching?: boolean;
    isBuildCommand?: boolean;
    isTestCommand?: boolean;
}
export interface ILegacyCommandProperties {
    type?: string;
    showOutput?: string;
    echoCommand?: boolean;
    terminal?: IPresentationOptionsConfig;
    suppressTaskName?: boolean;
    taskSelector?: string;
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
    command?: CommandString;
    options?: ICommandOptionsConfig;
    args?: CommandString[];
}
export interface ICommandProperties extends IBaseCommandProperties {
    windows?: IBaseCommandProperties;
    osx?: IBaseCommandProperties;
    linux?: IBaseCommandProperties;
}
export interface IGroupKind {
    kind?: string;
    isDefault?: boolean | string;
}
export interface IConfigurationProperties {
    taskName?: string;
    label?: string;
    identifier?: string;
    isBackground?: boolean;
    promptOnClose?: boolean;
    group?: string | IGroupKind;
    detail?: string;
    dependsOn?: string | ITaskIdentifier | Array<string | ITaskIdentifier>;
    dependsOrder?: string;
    presentation?: IPresentationOptionsConfig;
    options?: ICommandOptionsConfig;
    problemMatcher?: ProblemMatcherConfig.ProblemMatcherType;
    runOptions?: IRunOptionsConfig;
    icon?: {
        id: string;
        color?: string;
    };
    color?: string;
    hide?: boolean;
}
export interface ICustomTask extends ICommandProperties, IConfigurationProperties {
    type?: string;
}
export interface IConfiguringTask extends IConfigurationProperties {
    type?: string;
}
export interface IBaseTaskRunnerConfiguration {
    command?: CommandString;
    isShellCommand?: boolean;
    type?: string;
    options?: ICommandOptionsConfig;
    args?: CommandString[];
    showOutput?: string;
    echoCommand?: boolean;
    group?: string | IGroupKind;
    presentation?: IPresentationOptionsConfig;
    suppressTaskName?: boolean;
    taskSelector?: string;
    problemMatcher?: ProblemMatcherConfig.ProblemMatcherType;
    isWatching?: boolean;
    isBackground?: boolean;
    promptOnClose?: boolean;
    tasks?: Array<ICustomTask | IConfiguringTask>;
    declares?: ProblemMatcherConfig.INamedProblemMatcher[];
    inputs?: ConfiguredInput[];
}
export interface IExternalTaskRunnerConfiguration extends IBaseTaskRunnerConfiguration {
    _runner?: string;
    runner?: string;
    version: string;
    windows?: IBaseTaskRunnerConfiguration;
    osx?: IBaseTaskRunnerConfiguration;
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
