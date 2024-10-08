import { IUserDataSyncEnablementService, SyncResource } from '../../../../platform/userDataSync/common/userDataSync.js';
import { UserDataSyncEnablementService as BaseUserDataSyncEnablementService } from '../../../../platform/userDataSync/common/userDataSyncEnablementService.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
export declare class UserDataSyncEnablementService extends BaseUserDataSyncEnablementService implements IUserDataSyncEnablementService {
    protected get workbenchEnvironmentService(): IBrowserWorkbenchEnvironmentService;
    getResourceSyncStateVersion(resource: SyncResource): string | undefined;
}
