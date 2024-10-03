import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IProductService } from '../../product/common/productService.js';
import { IStorageService } from '../../storage/common/storage.js';
import { IUserDataSyncStore, IUserDataSyncStoreManagementService, UserDataSyncStoreType } from './userDataSync.js';
import { IUserDataSyncAccount, IUserDataSyncAccountService } from './userDataSyncAccount.js';
import { AbstractUserDataSyncStoreManagementService } from './userDataSyncStoreService.js';
export declare class UserDataSyncAccountServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IUserDataSyncAccountService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataSyncAccountServiceChannelClient extends Disposable implements IUserDataSyncAccountService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    private _account;
    get account(): IUserDataSyncAccount | undefined;
    get onTokenFailed(): Event<boolean>;
    private _onDidChangeAccount;
    readonly onDidChangeAccount: Event<IUserDataSyncAccount | undefined>;
    constructor(channel: IChannel);
    updateAccount(account: IUserDataSyncAccount | undefined): Promise<undefined>;
}
export declare class UserDataSyncStoreManagementServiceChannel implements IServerChannel {
    private readonly service;
    constructor(service: IUserDataSyncStoreManagementService);
    listen(_: unknown, event: string): Event<any>;
    call(context: any, command: string, args?: any): Promise<any>;
}
export declare class UserDataSyncStoreManagementServiceChannelClient extends AbstractUserDataSyncStoreManagementService implements IUserDataSyncStoreManagementService {
    private readonly channel;
    constructor(channel: IChannel, productService: IProductService, configurationService: IConfigurationService, storageService: IStorageService);
    switch(type: UserDataSyncStoreType): Promise<void>;
    getPreviousUserDataSyncStore(): Promise<IUserDataSyncStore>;
    private revive;
}
