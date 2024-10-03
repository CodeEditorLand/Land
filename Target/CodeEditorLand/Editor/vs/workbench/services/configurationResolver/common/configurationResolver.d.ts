import { IStringDictionary } from '../../../../base/common/collections.js';
import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { IProcessEnvironment } from '../../../../base/common/platform.js';
import { ErrorNoTelemetry } from '../../../../base/common/errors.js';
export declare const IConfigurationResolverService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IConfigurationResolverService>;
export interface IConfigurationResolverService {
    readonly _serviceBrand: undefined;
    resolveWithEnvironment(environment: IProcessEnvironment, folder: IWorkspaceFolder | undefined, value: string): Promise<string>;
    resolveAsync(folder: IWorkspaceFolder | undefined, value: string): Promise<string>;
    resolveAsync(folder: IWorkspaceFolder | undefined, value: string[]): Promise<string[]>;
    resolveAsync(folder: IWorkspaceFolder | undefined, value: IStringDictionary<string>): Promise<IStringDictionary<string>>;
    resolveAnyAsync(folder: IWorkspaceFolder | undefined, config: any, commandValueMapping?: IStringDictionary<string>): Promise<any>;
    resolveAnyMap(folder: IWorkspaceFolder | undefined, config: any, commandValueMapping?: IStringDictionary<string>): Promise<{
        newConfig: any;
        resolvedVariables: Map<string, string>;
    }>;
    resolveWithInteractionReplace(folder: IWorkspaceFolder | undefined, config: any, section?: string, variables?: IStringDictionary<string>, target?: ConfigurationTarget): Promise<any>;
    resolveWithInteraction(folder: IWorkspaceFolder | undefined, config: any, section?: string, variables?: IStringDictionary<string>, target?: ConfigurationTarget): Promise<Map<string, string> | undefined>;
    contributeVariable(variable: string, resolution: () => Promise<string | undefined>): void;
}
interface PromptStringInputInfo {
    id: string;
    type: 'promptString';
    description: string;
    default?: string;
    password?: boolean;
}
interface PickStringInputInfo {
    id: string;
    type: 'pickString';
    description: string;
    options: (string | {
        value: string;
        label?: string;
    })[];
    default?: string;
}
interface CommandInputInfo {
    id: string;
    type: 'command';
    command: string;
    args?: any;
}
export type ConfiguredInput = PromptStringInputInfo | PickStringInputInfo | CommandInputInfo;
export declare enum VariableKind {
    Unknown = "unknown",
    Env = "env",
    Config = "config",
    Command = "command",
    Input = "input",
    ExtensionInstallFolder = "extensionInstallFolder",
    WorkspaceFolder = "workspaceFolder",
    Cwd = "cwd",
    WorkspaceFolderBasename = "workspaceFolderBasename",
    UserHome = "userHome",
    LineNumber = "lineNumber",
    SelectedText = "selectedText",
    File = "file",
    FileWorkspaceFolder = "fileWorkspaceFolder",
    FileWorkspaceFolderBasename = "fileWorkspaceFolderBasename",
    RelativeFile = "relativeFile",
    RelativeFileDirname = "relativeFileDirname",
    FileDirname = "fileDirname",
    FileExtname = "fileExtname",
    FileBasename = "fileBasename",
    FileBasenameNoExtension = "fileBasenameNoExtension",
    FileDirnameBasename = "fileDirnameBasename",
    ExecPath = "execPath",
    ExecInstallFolder = "execInstallFolder",
    PathSeparator = "pathSeparator",
    PathSeparatorAlias = "/"
}
export declare class VariableError extends ErrorNoTelemetry {
    readonly variable: VariableKind;
    constructor(variable: VariableKind, message?: string);
}
export {};
