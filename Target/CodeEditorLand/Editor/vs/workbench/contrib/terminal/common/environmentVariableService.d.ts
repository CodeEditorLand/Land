import { Event } from '../../../../base/common/event.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IEnvironmentVariableCollectionWithPersistence, IEnvironmentVariableService } from './environmentVariable.js';
import { IMergedEnvironmentVariableCollection } from '../../../../platform/terminal/common/environmentVariable.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
/**
 * Tracks and persists environment variable collections as defined by extensions.
 */
export declare class EnvironmentVariableService extends Disposable implements IEnvironmentVariableService {
    private readonly _extensionService;
    private readonly _storageService;
    readonly _serviceBrand: undefined;
    collections: Map<string, IEnvironmentVariableCollectionWithPersistence>;
    mergedCollection: IMergedEnvironmentVariableCollection;
    private readonly _onDidChangeCollections;
    get onDidChangeCollections(): Event<IMergedEnvironmentVariableCollection>;
    constructor(_extensionService: IExtensionService, _storageService: IStorageService);
    set(extensionIdentifier: string, collection: IEnvironmentVariableCollectionWithPersistence): void;
    delete(extensionIdentifier: string): void;
    private _updateCollections;
    private _persistCollectionsEventually;
    protected _persistCollections(): void;
    private _notifyCollectionUpdatesEventually;
    protected _notifyCollectionUpdates(): void;
    private _resolveMergedCollection;
    private _invalidateExtensionCollections;
}
