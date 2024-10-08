import { IStringDictionary } from '../../../../base/common/collections.js';
import { IProcessEnvironment } from '../../../../base/common/platform.js';
import { URI as uri } from '../../../../base/common/uri.js';
import { IConfigurationResolverService } from './configurationResolver.js';
import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
interface IVariableResolveContext {
    getFolderUri(folderName: string): uri | undefined;
    getWorkspaceFolderCount(): number;
    getConfigurationValue(folderUri: uri | undefined, section: string): string | undefined;
    getAppRoot(): string | undefined;
    getExecPath(): string | undefined;
    getFilePath(): string | undefined;
    getWorkspaceFolderPathForFile?(): string | undefined;
    getSelectedText(): string | undefined;
    getLineNumber(): string | undefined;
    getExtension(id: string): Promise<{
        readonly extensionLocation: uri;
    } | undefined>;
}
export declare class AbstractVariableResolverService implements IConfigurationResolverService {
    static readonly VARIABLE_LHS = "${";
    static readonly VARIABLE_REGEXP: RegExp;
    readonly _serviceBrand: undefined;
    private _context;
    private _labelService?;
    private _envVariablesPromise?;
    private _userHomePromise?;
    protected _contributedVariables: Map<string, () => Promise<string | undefined>>;
    constructor(_context: IVariableResolveContext, _labelService?: ILabelService, _userHomePromise?: Promise<string>, _envVariablesPromise?: Promise<IProcessEnvironment>);
    private prepareEnv;
    resolveWithEnvironment(environment: IProcessEnvironment, root: IWorkspaceFolder | undefined, value: string): Promise<string>;
    resolveAsync(root: IWorkspaceFolder | undefined, value: string): Promise<string>;
    resolveAsync(root: IWorkspaceFolder | undefined, value: string[]): Promise<string[]>;
    resolveAsync(root: IWorkspaceFolder | undefined, value: IStringDictionary<string>): Promise<IStringDictionary<string>>;
    private resolveAnyBase;
    resolveAnyAsync(workspaceFolder: IWorkspaceFolder | undefined, config: any, commandValueMapping?: IStringDictionary<string>): Promise<any>;
    resolveAnyMap(workspaceFolder: IWorkspaceFolder | undefined, config: any, commandValueMapping?: IStringDictionary<string>): Promise<{
        newConfig: any;
        resolvedVariables: Map<string, string>;
    }>;
    resolveWithInteractionReplace(folder: IWorkspaceFolder | undefined, config: any, section?: string, variables?: IStringDictionary<string>): Promise<any>;
    resolveWithInteraction(folder: IWorkspaceFolder | undefined, config: any, section?: string, variables?: IStringDictionary<string>): Promise<Map<string, string> | undefined>;
    contributeVariable(variable: string, resolution: () => Promise<string | undefined>): void;
    private recursiveResolve;
    private resolveString;
    private fsPath;
    private evaluateSingleVariable;
    private resolveFromMap;
}
export {};
