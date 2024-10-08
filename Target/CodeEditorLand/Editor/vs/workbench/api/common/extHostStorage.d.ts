import { ExtHostStorageShape } from './extHost.protocol.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IExtensionIdWithVersion } from '../../../platform/extensionManagement/common/extensionStorage.js';
import { ILogService } from '../../../platform/log/common/log.js';
export interface IStorageChangeEvent {
    shared: boolean;
    key: string;
    value: object;
}
export declare class ExtHostStorage implements ExtHostStorageShape {
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private _proxy;
    private readonly _onDidChangeStorage;
    readonly onDidChangeStorage: import("../../workbench.web.main.internal.js").Event<IStorageChangeEvent>;
    constructor(mainContext: IExtHostRpcService, _logService: ILogService);
    registerExtensionStorageKeysToSync(extension: IExtensionIdWithVersion, keys: string[]): void;
    initializeExtensionStorage(shared: boolean, key: string, defaultValue?: object): Promise<object | undefined>;
    setValue(shared: boolean, key: string, value: object): Promise<void>;
    $acceptValue(shared: boolean, key: string, value: string): void;
    private safeParseValue;
}
export interface IExtHostStorage extends ExtHostStorage {
}
export declare const IExtHostStorage: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostStorage>;
