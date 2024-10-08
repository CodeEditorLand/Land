import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IEnvironment } from '../../services/extensions/common/extensionHostProtocol.js';
import { IExtHostConsumerFileSystem } from './extHostFileSystemConsumer.js';
import { URI } from '../../../base/common/uri.js';
export declare const IExtensionStoragePaths: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtensionStoragePaths>;
export interface IExtensionStoragePaths {
    readonly _serviceBrand: undefined;
    whenReady: Promise<any>;
    workspaceValue(extension: IExtensionDescription): URI | undefined;
    globalValue(extension: IExtensionDescription): URI;
    onWillDeactivateAll(): void;
}
export declare class ExtensionStoragePaths implements IExtensionStoragePaths {
    protected readonly _logService: ILogService;
    private readonly _extHostFileSystem;
    readonly _serviceBrand: undefined;
    private readonly _workspace?;
    protected readonly _environment: IEnvironment;
    readonly whenReady: Promise<URI | undefined>;
    private _value?;
    constructor(initData: IExtHostInitDataService, _logService: ILogService, _extHostFileSystem: IExtHostConsumerFileSystem);
    protected _getWorkspaceStorageURI(storageName: string): Promise<URI>;
    private _getOrCreateWorkspaceStoragePath;
    workspaceValue(extension: IExtensionDescription): URI | undefined;
    globalValue(extension: IExtensionDescription): URI;
    onWillDeactivateAll(): void;
}
