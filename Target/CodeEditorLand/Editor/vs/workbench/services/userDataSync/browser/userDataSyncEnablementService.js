import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUserDataSyncEnablementService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { UserDataSyncEnablementService as BaseUserDataSyncEnablementService } from '../../../../platform/userDataSync/common/userDataSyncEnablementService.js';
export class UserDataSyncEnablementService extends BaseUserDataSyncEnablementService {
    get workbenchEnvironmentService() { return this.environmentService; }
    getResourceSyncStateVersion(resource) {
        return resource === "extensions" ? this.workbenchEnvironmentService.options?.settingsSyncOptions?.extensionsSyncStateVersion : undefined;
    }
}
registerSingleton(IUserDataSyncEnablementService, UserDataSyncEnablementService, 1);
