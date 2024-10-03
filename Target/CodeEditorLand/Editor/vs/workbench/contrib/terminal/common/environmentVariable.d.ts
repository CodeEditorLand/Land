import { Event } from '../../../../base/common/event.js';
import { EnvironmentVariableScope, IEnvironmentVariableCollection, IMergedEnvironmentVariableCollection } from '../../../../platform/terminal/common/environmentVariable.js';
import { ITerminalStatus } from './terminal.js';
export declare const IEnvironmentVariableService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEnvironmentVariableService>;
export interface IEnvironmentVariableService {
    readonly _serviceBrand: undefined;
    readonly collections: ReadonlyMap<string, IEnvironmentVariableCollection>;
    readonly mergedCollection: IMergedEnvironmentVariableCollection;
    onDidChangeCollections: Event<IMergedEnvironmentVariableCollection>;
    set(extensionIdentifier: string, collection: IEnvironmentVariableCollection): void;
    delete(extensionIdentifier: string): void;
}
export interface IEnvironmentVariableCollectionWithPersistence extends IEnvironmentVariableCollection {
    readonly persistent: boolean;
}
export interface IEnvironmentVariableInfo {
    readonly requiresAction: boolean;
    getStatus(scope: EnvironmentVariableScope | undefined): ITerminalStatus;
}
