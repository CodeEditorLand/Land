import { IStorageService } from '../../../platform/storage/common/storage.js';
import { MainThreadStorageShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IExtensionIdWithVersion, IExtensionStorageService } from '../../../platform/extensionManagement/common/extensionStorage.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../platform/log/common/log.js';
export declare class MainThreadStorage implements MainThreadStorageShape {
    private readonly _extensionStorageService;
    private readonly _storageService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _proxy;
    private readonly _storageListener;
    private readonly _sharedStorageKeysToWatch;
    constructor(extHostContext: IExtHostContext, _extensionStorageService: IExtensionStorageService, _storageService: IStorageService, _instantiationService: IInstantiationService, _logService: ILogService);
    dispose(): void;
    $initializeExtensionStorage(shared: boolean, extensionId: string): Promise<string | undefined>;
    $setValue(shared: boolean, key: string, value: object): Promise<void>;
    $registerExtensionStorageKeysToSync(extension: IExtensionIdWithVersion, keys: string[]): void;
    private checkAndMigrateExtensionStorage;
}
