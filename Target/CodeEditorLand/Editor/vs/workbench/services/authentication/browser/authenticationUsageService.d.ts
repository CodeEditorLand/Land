import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IAuthenticationService } from '../common/authentication.js';
export interface IAccountUsage {
    extensionId: string;
    extensionName: string;
    lastUsed: number;
    scopes?: string[];
}
export declare const IAuthenticationUsageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAuthenticationUsageService>;
export interface IAuthenticationUsageService {
    readonly _serviceBrand: undefined;
    /**
     * Initializes the cache of extensions that use authentication. Ideally used in a contribution that can be run eventually after the workspace is loaded.
     */
    initializeExtensionUsageCache(): Promise<void>;
    /**
     * Checks if an extension uses authentication
     * @param extensionId The id of the extension to check
     */
    extensionUsesAuth(extensionId: string): Promise<boolean>;
    /**
     * Reads the usages for an account
     * @param providerId The id of the authentication provider to get usages for
     * @param accountName The name of the account to get usages for
     */
    readAccountUsages(providerId: string, accountName: string): IAccountUsage[];
    /**
     *
     * @param providerId The id of the authentication provider to get usages for
     * @param accountName The name of the account to get usages for
     */
    removeAccountUsage(providerId: string, accountName: string): void;
    /**
     * Adds a usage for an account
     * @param providerId The id of the authentication provider to get usages for
     * @param accountName The name of the account to get usages for
     * @param extensionId The id of the extension to add a usage for
     * @param extensionName The name of the extension to add a usage for
     */
    addAccountUsage(providerId: string, accountName: string, scopes: ReadonlyArray<string>, extensionId: string, extensionName: string): void;
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
    addAccountUsage(providerId: string, accountName: string, scopes: string[], extensionId: string, extensionName: string): void;
    private _addExtensionsToCache;
}
