import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IStorageService } from '../../storage/common/storage.js';
import { IProductService } from '../../product/common/productService.js';
import { ILogService } from '../../log/common/log.js';
import { IExtension } from '../../extensions/common/extensions.js';
import { IStringDictionary } from '../../../base/common/collections.js';
import { IExtensionManagementService, IGalleryExtension } from './extensionManagement.js';
export interface IExtensionIdWithVersion {
    id: string;
    version: string;
}
export declare const IExtensionStorageService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionStorageService>;
export interface IExtensionStorageService {
    readonly _serviceBrand: undefined;
    getExtensionState(extension: IExtension | IGalleryExtension | string, global: boolean): IStringDictionary<any> | undefined;
    getExtensionStateRaw(extension: IExtension | IGalleryExtension | string, global: boolean): string | undefined;
    setExtensionState(extension: IExtension | IGalleryExtension | string, state: IStringDictionary<any> | undefined, global: boolean): void;
    readonly onDidChangeExtensionStorageToSync: Event<void>;
    setKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion, keys: string[]): void;
    getKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion): string[] | undefined;
    addToMigrationList(from: string, to: string): void;
    getSourceExtensionToMigrate(target: string): string | undefined;
}
export declare class ExtensionStorageService extends Disposable implements IExtensionStorageService {
    private readonly storageService;
    private readonly productService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private static LARGE_STATE_WARNING_THRESHOLD;
    private static toKey;
    private static fromKey;
    static removeOutdatedExtensionVersions(extensionManagementService: IExtensionManagementService, storageService: IStorageService): Promise<void>;
    private static readAllExtensionsWithKeysForSync;
    private readonly _onDidChangeExtensionStorageToSync;
    readonly onDidChangeExtensionStorageToSync: Event<void>;
    private readonly extensionsWithKeysForSync;
    constructor(storageService: IStorageService, productService: IProductService, logService: ILogService);
    private onDidChangeStorageValue;
    private getExtensionId;
    getExtensionState(extension: IExtension | IGalleryExtension | string, global: boolean): IStringDictionary<any> | undefined;
    getExtensionStateRaw(extension: IExtension | IGalleryExtension | string, global: boolean): string | undefined;
    setExtensionState(extension: IExtension | IGalleryExtension | string, state: IStringDictionary<any> | undefined, global: boolean): void;
    setKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion, keys: string[]): void;
    getKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion): string[] | undefined;
    addToMigrationList(from: string, to: string): void;
    getSourceExtensionToMigrate(toExtensionId: string): string | undefined;
    private get migrationList();
    private set migrationList(value);
}
