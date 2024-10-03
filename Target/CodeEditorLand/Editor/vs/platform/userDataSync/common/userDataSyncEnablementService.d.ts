import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUserDataSyncEnablementService, IUserDataSyncStoreManagementService, SyncResource } from './userDataSync.js';
export declare class UserDataSyncEnablementService extends Disposable implements IUserDataSyncEnablementService {
    private readonly storageService;
    private readonly telemetryService;
    protected readonly environmentService: IEnvironmentService;
    private readonly userDataSyncStoreManagementService;
    _serviceBrand: any;
    private _onDidChangeEnablement;
    readonly onDidChangeEnablement: Event<boolean>;
    private _onDidChangeResourceEnablement;
    readonly onDidChangeResourceEnablement: Event<[SyncResource, boolean]>;
    constructor(storageService: IStorageService, telemetryService: ITelemetryService, environmentService: IEnvironmentService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService);
    isEnabled(): boolean;
    canToggleEnablement(): boolean;
    setEnablement(enabled: boolean): void;
    isResourceEnabled(resource: SyncResource): boolean;
    setResourceEnablement(resource: SyncResource, enabled: boolean): void;
    getResourceSyncStateVersion(resource: SyncResource): string | undefined;
    private storeResourceEnablement;
    private onDidStorageChange;
}
