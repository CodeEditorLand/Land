import { IProcessEnvironment } from '../../../base/common/platform.js';
import { IWorkspaceFolderData } from '../../workspace/common/workspace.js';
export declare enum EnvironmentVariableMutatorType {
    Replace = 1,
    Append = 2,
    Prepend = 3
}
export interface IEnvironmentVariableMutator {
    readonly variable: string;
    readonly value: string;
    readonly type: EnvironmentVariableMutatorType;
    readonly scope?: EnvironmentVariableScope;
    readonly options?: IEnvironmentVariableMutatorOptions;
}
export interface IEnvironmentVariableCollectionDescription {
    readonly description: string | undefined;
    readonly scope?: EnvironmentVariableScope;
}
export interface IEnvironmentVariableMutatorOptions {
    applyAtProcessCreation?: boolean;
    applyAtShellIntegration?: boolean;
}
export type EnvironmentVariableScope = {
    workspaceFolder?: IWorkspaceFolderData;
};
export interface IEnvironmentVariableCollection {
    readonly map: ReadonlyMap<string, IEnvironmentVariableMutator>;
    readonly descriptionMap?: ReadonlyMap<string, IEnvironmentVariableCollectionDescription>;
}
export type ISerializableEnvironmentVariableCollection = [string, IEnvironmentVariableMutator][];
export type ISerializableEnvironmentDescriptionMap = [string, IEnvironmentVariableCollectionDescription][];
export interface IExtensionOwnedEnvironmentDescriptionMutator extends IEnvironmentVariableCollectionDescription {
    readonly extensionIdentifier: string;
}
export type ISerializableEnvironmentVariableCollections = [string, ISerializableEnvironmentVariableCollection, ISerializableEnvironmentDescriptionMap][];
export interface IExtensionOwnedEnvironmentVariableMutator extends IEnvironmentVariableMutator {
    readonly extensionIdentifier: string;
}
export interface IMergedEnvironmentVariableCollectionDiff {
    added: ReadonlyMap<string, IExtensionOwnedEnvironmentVariableMutator[]>;
    changed: ReadonlyMap<string, IExtensionOwnedEnvironmentVariableMutator[]>;
    removed: ReadonlyMap<string, IExtensionOwnedEnvironmentVariableMutator[]>;
}
type VariableResolver = (str: string) => Promise<string>;
export interface IMergedEnvironmentVariableCollection {
    readonly collections: ReadonlyMap<string, IEnvironmentVariableCollection>;
    getVariableMap(scope: EnvironmentVariableScope | undefined): Map<string, IExtensionOwnedEnvironmentVariableMutator[]>;
    getDescriptionMap(scope: EnvironmentVariableScope | undefined): Map<string, string | undefined>;
    applyToProcessEnvironment(env: IProcessEnvironment, scope: EnvironmentVariableScope | undefined, variableResolver?: VariableResolver): Promise<void>;
    diff(other: IMergedEnvironmentVariableCollection, scope: EnvironmentVariableScope | undefined): IMergedEnvironmentVariableCollectionDiff | undefined;
}
export {};
