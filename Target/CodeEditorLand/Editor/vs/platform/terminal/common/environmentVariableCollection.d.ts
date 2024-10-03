import { IProcessEnvironment } from '../../../base/common/platform.js';
import { EnvironmentVariableScope, IEnvironmentVariableCollection, IExtensionOwnedEnvironmentVariableMutator, IMergedEnvironmentVariableCollection, IMergedEnvironmentVariableCollectionDiff } from './environmentVariable.js';
type VariableResolver = (str: string) => Promise<string>;
export declare class MergedEnvironmentVariableCollection implements IMergedEnvironmentVariableCollection {
    readonly collections: ReadonlyMap<string, IEnvironmentVariableCollection>;
    private readonly map;
    private readonly descriptionMap;
    constructor(collections: ReadonlyMap<string, IEnvironmentVariableCollection>);
    applyToProcessEnvironment(env: IProcessEnvironment, scope: EnvironmentVariableScope | undefined, variableResolver?: VariableResolver): Promise<void>;
    private _encodeColons;
    diff(other: IMergedEnvironmentVariableCollection, scope: EnvironmentVariableScope | undefined): IMergedEnvironmentVariableCollectionDiff | undefined;
    getVariableMap(scope: EnvironmentVariableScope | undefined): Map<string, IExtensionOwnedEnvironmentVariableMutator[]>;
    getDescriptionMap(scope: EnvironmentVariableScope | undefined): Map<string, string | undefined>;
    private populateDescriptionMap;
}
export {};
