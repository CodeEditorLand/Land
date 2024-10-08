import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ConfigurationSyncStore } from '../../../base/common/product.js';
import { URI } from '../../../base/common/uri.js';
import { IHeaders, IRequestContext, IRequestOptions } from '../../../base/parts/request/common/request.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { IStorageService } from '../../storage/common/storage.js';
import { IResourceRefHandle, IUserData, IUserDataManifest, IUserDataSyncLogService, IUserDataSyncStore, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, ServerResource, UserDataSyncErrorCode, UserDataSyncStoreType } from './userDataSync.js';
import { VSBufferReadableStream } from '../../../base/common/buffer.js';
type UserDataSyncStore = IUserDataSyncStore & {
    defaultType: UserDataSyncStoreType;
};
export declare abstract class AbstractUserDataSyncStoreManagementService extends Disposable implements IUserDataSyncStoreManagementService {
    protected readonly productService: IProductService;
    protected readonly configurationService: IConfigurationService;
    protected readonly storageService: IStorageService;
    _serviceBrand: any;
    private readonly _onDidChangeUserDataSyncStore;
    readonly onDidChangeUserDataSyncStore: Event<void>;
    private _userDataSyncStore;
    get userDataSyncStore(): UserDataSyncStore | undefined;
    protected get userDataSyncStoreType(): UserDataSyncStoreType | undefined;
    protected set userDataSyncStoreType(type: UserDataSyncStoreType | undefined);
    constructor(productService: IProductService, configurationService: IConfigurationService, storageService: IStorageService);
    protected updateUserDataSyncStore(): void;
    protected toUserDataSyncStore(configurationSyncStore: ConfigurationSyncStore & {
        web?: ConfigurationSyncStore;
    } | undefined): UserDataSyncStore | undefined;
    abstract switch(type: UserDataSyncStoreType): Promise<void>;
    abstract getPreviousUserDataSyncStore(): Promise<IUserDataSyncStore | undefined>;
}
export declare class UserDataSyncStoreManagementService extends AbstractUserDataSyncStoreManagementService implements IUserDataSyncStoreManagementService {
    private readonly previousConfigurationSyncStore;
    constructor(productService: IProductService, configurationService: IConfigurationService, storageService: IStorageService);
    switch(type: UserDataSyncStoreType): Promise<void>;
    getPreviousUserDataSyncStore(): Promise<IUserDataSyncStore | undefined>;
}
export declare class UserDataSyncStoreClient extends Disposable {
    private readonly requestService;
    private readonly logService;
    private readonly storageService;
    private userDataSyncStoreUrl;
    private authToken;
    private readonly commonHeadersPromise;
    private readonly session;
    private _onTokenFailed;
    readonly onTokenFailed: Event<UserDataSyncErrorCode>;
    private _onTokenSucceed;
    readonly onTokenSucceed: Event<void>;
    private _donotMakeRequestsUntil;
    get donotMakeRequestsUntil(): Date | undefined;
    private _onDidChangeDonotMakeRequestsUntil;
    readonly onDidChangeDonotMakeRequestsUntil: Event<void>;
    constructor(userDataSyncStoreUrl: URI | undefined, productService: IProductService, requestService: IRequestService, logService: IUserDataSyncLogService, environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService);
    setAuthToken(token: string, type: string): void;
    protected updateUserDataSyncStoreUrl(userDataSyncStoreUrl: URI | undefined): void;
    private initDonotMakeRequestsUntil;
    private resetDonotMakeRequestsUntilPromise;
    private setDonotMakeRequestsUntil;
    getAllCollections(headers?: IHeaders): Promise<string[]>;
    createCollection(headers?: IHeaders): Promise<string>;
    deleteCollection(collection?: string, headers?: IHeaders): Promise<void>;
    getAllResourceRefs(resource: ServerResource, collection?: string): Promise<IResourceRefHandle[]>;
    resolveResourceContent(resource: ServerResource, ref: string, collection?: string, headers?: IHeaders): Promise<string | null>;
    deleteResource(resource: ServerResource, ref: string | null, collection?: string): Promise<void>;
    deleteResources(): Promise<void>;
    readResource(resource: ServerResource, oldValue: IUserData | null, collection?: string, headers?: IHeaders): Promise<IUserData>;
    writeResource(resource: ServerResource, data: string, ref: string | null, collection?: string, headers?: IHeaders): Promise<string>;
    manifest(oldValue: IUserDataManifest | null, headers?: IHeaders): Promise<IUserDataManifest | null>;
    clear(): Promise<void>;
    getActivityData(): Promise<VSBufferReadableStream>;
    private getResourceUrl;
    private clearSession;
    private request;
    private addSessionHeaders;
}
export declare class UserDataSyncStoreService extends UserDataSyncStoreClient implements IUserDataSyncStoreService {
    _serviceBrand: any;
    constructor(userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, productService: IProductService, requestService: IRequestService, logService: IUserDataSyncLogService, environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService);
}
export declare class RequestsSession {
    private readonly limit;
    private readonly interval;
    private readonly requestService;
    private readonly logService;
    private requests;
    private startTime;
    constructor(limit: number, interval: number, /* in ms */ requestService: IRequestService, logService: IUserDataSyncLogService);
    request(url: string, options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    private isExpired;
    private reset;
}
export {};
