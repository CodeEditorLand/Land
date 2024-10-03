import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IStorage, IStorageDatabase, IStorageItemsChangeEvent, IUpdateRequest } from '../../../../base/parts/storage/common/storage.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { AbstractStorageService, StorageScope } from '../../../../platform/storage/common/storage.js';
import { IUserDataProfile } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IAnyWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
export declare class BrowserStorageService extends AbstractStorageService {
    private readonly workspace;
    private readonly userDataProfileService;
    private readonly logService;
    private static BROWSER_DEFAULT_FLUSH_INTERVAL;
    private applicationStorage;
    private applicationStorageDatabase;
    private readonly applicationStoragePromise;
    private profileStorage;
    private profileStorageDatabase;
    private profileStorageProfile;
    private readonly profileStorageDisposables;
    private workspaceStorage;
    private workspaceStorageDatabase;
    get hasPendingUpdate(): boolean;
    constructor(workspace: IAnyWorkspaceIdentifier, userDataProfileService: IUserDataProfileService, logService: ILogService);
    private registerListeners;
    protected doInitialize(): Promise<void>;
    private createApplicationStorage;
    private createProfileStorage;
    private createWorkspaceStorage;
    private updateIsNew;
    protected getStorage(scope: StorageScope): IStorage | undefined;
    protected getLogDetails(scope: StorageScope): string | undefined;
    protected switchToProfile(toProfile: IUserDataProfile): Promise<void>;
    protected switchToWorkspace(toWorkspace: IAnyWorkspaceIdentifier, preserveData: boolean): Promise<void>;
    protected shouldFlushWhenIdle(): boolean;
    close(): void;
    clear(): Promise<void>;
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
}
interface IIndexedDBStorageDatabase extends IStorageDatabase, IDisposable {
    readonly name: string;
    readonly hasPendingUpdate: boolean;
    clear(): Promise<void>;
}
interface IndexedDBStorageDatabaseOptions {
    id: string;
    broadcastChanges?: boolean;
}
export declare class IndexedDBStorageDatabase extends Disposable implements IIndexedDBStorageDatabase {
    private readonly logService;
    static createApplicationStorage(logService: ILogService): Promise<IIndexedDBStorageDatabase>;
    static createProfileStorage(profile: IUserDataProfile, logService: ILogService): Promise<IIndexedDBStorageDatabase>;
    static createWorkspaceStorage(workspaceId: string, logService: ILogService): Promise<IIndexedDBStorageDatabase>;
    static create(options: IndexedDBStorageDatabaseOptions, logService: ILogService): Promise<IIndexedDBStorageDatabase>;
    private static readonly STORAGE_DATABASE_PREFIX;
    private static readonly STORAGE_OBJECT_STORE;
    private readonly _onDidChangeItemsExternal;
    readonly onDidChangeItemsExternal: import("../../../workbench.web.main.internal.js").Event<IStorageItemsChangeEvent>;
    private broadcastChannel;
    private pendingUpdate;
    get hasPendingUpdate(): boolean;
    readonly name: string;
    private readonly whenConnected;
    private constructor();
    private registerListeners;
    private connect;
    getItems(): Promise<Map<string, string>>;
    updateItems(request: IUpdateRequest): Promise<void>;
    private doUpdateItems;
    optimize(): Promise<void>;
    close(): Promise<void>;
    clear(): Promise<void>;
}
export {};
