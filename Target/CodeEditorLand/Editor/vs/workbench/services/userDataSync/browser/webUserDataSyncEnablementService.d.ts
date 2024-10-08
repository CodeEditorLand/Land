import { IUserDataSyncEnablementService, SyncResource } from '../../../../platform/userDataSync/common/userDataSync.js';
import { UserDataSyncEnablementService } from './userDataSyncEnablementService.js';
export declare class WebUserDataSyncEnablementService extends UserDataSyncEnablementService implements IUserDataSyncEnablementService {
    private enabled;
    canToggleEnablement(): boolean;
    isEnabled(): boolean;
    setEnablement(enabled: boolean): void;
    getResourceSyncStateVersion(resource: SyncResource): string | undefined;
    private isTrusted;
}
