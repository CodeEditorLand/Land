import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IAuthenticationService } from '../common/authentication.js';
export interface IAccountUsage {
    extensionId: string;
    extensionName: string;
    lastUsed: number;
}
export declare const IAuthenticationUsageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuthenticationUsageService>;
export interface IAuthenticationUsageService {
    readonly _serviceBrand: undefined;
    initializeExtensionUsageCache(): Promise<void>;
    extensionUsesAuth(extensionId: string): Promise<boolean>;
    readAccountUsages(providerId: string, accountName: string): IAccountUsage[];
    removeAccountUsage(providerId: string, accountName: string): void;
    addAccountUsage(providerId: string, accountName: string, extensionId: string, extensionName: string): void;
}
export declare class AuthenticationUsageService extends Disposable implements IAuthenticationUsageService {
    private readonly _storageService;
    private readonly _authenticationService;
    private readonly _logService;
    _serviceBrand: undefined;
    private _queue;
    private _extensionsUsingAuth;
    constructor(_storageService: IStorageService, _authenticationService: IAuthenticationService, _logService: ILogService, productService: IProductService);
    initializeExtensionUsageCache(): Promise<void>;
    extensionUsesAuth(extensionId: string): Promise<boolean>;
    readAccountUsages(providerId: string, accountName: string): IAccountUsage[];
    removeAccountUsage(providerId: string, accountName: string): void;
    addAccountUsage(providerId: string, accountName: string, extensionId: string, extensionName: string): void;
    private _addExtensionsToCache;
}
