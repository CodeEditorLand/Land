import { INativeHostService } from '../../native/common/native.js';
import { IProductService } from '../../product/common/productService.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { UserDataAutoSyncService as BaseUserDataAutoSyncService } from '../common/userDataAutoSyncService.js';
import { IUserDataSyncEnablementService, IUserDataSyncLogService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService } from '../common/userDataSync.js';
import { IUserDataSyncAccountService } from '../common/userDataSyncAccount.js';
import { IUserDataSyncMachinesService } from '../common/userDataSyncMachines.js';
export declare class UserDataAutoSyncService extends BaseUserDataAutoSyncService {
    constructor(productService: IProductService, userDataSyncStoreManagementService: IUserDataSyncStoreManagementService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncEnablementService: IUserDataSyncEnablementService, userDataSyncService: IUserDataSyncService, nativeHostService: INativeHostService, logService: IUserDataSyncLogService, authTokenService: IUserDataSyncAccountService, telemetryService: ITelemetryService, userDataSyncMachinesService: IUserDataSyncMachinesService, storageService: IStorageService);
}
