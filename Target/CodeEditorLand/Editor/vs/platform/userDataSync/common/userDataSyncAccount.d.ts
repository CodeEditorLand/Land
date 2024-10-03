import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IUserDataSyncLogService, IUserDataSyncStoreService } from './userDataSync.js';
export interface IUserDataSyncAccount {
    readonly authenticationProviderId: string;
    readonly token: string;
}
export declare const IUserDataSyncAccountService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncAccountService>;
export interface IUserDataSyncAccountService {
    readonly _serviceBrand: undefined;
    readonly onTokenFailed: Event<boolean>;
    readonly account: IUserDataSyncAccount | undefined;
    readonly onDidChangeAccount: Event<IUserDataSyncAccount | undefined>;
    updateAccount(account: IUserDataSyncAccount | undefined): Promise<void>;
}
export declare class UserDataSyncAccountService extends Disposable implements IUserDataSyncAccountService {
    private readonly userDataSyncStoreService;
    private readonly logService;
    _serviceBrand: any;
    private _account;
    get account(): IUserDataSyncAccount | undefined;
    private _onDidChangeAccount;
    readonly onDidChangeAccount: Event<IUserDataSyncAccount | undefined>;
    private _onTokenFailed;
    readonly onTokenFailed: Event<boolean>;
    private wasTokenFailed;
    constructor(userDataSyncStoreService: IUserDataSyncStoreService, logService: IUserDataSyncLogService);
    updateAccount(account: IUserDataSyncAccount | undefined): Promise<void>;
}
