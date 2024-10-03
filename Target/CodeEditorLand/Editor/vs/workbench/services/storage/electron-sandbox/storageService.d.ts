import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { RemoteStorageService } from '../../../../platform/storage/common/storageService.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IAnyWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
export declare class NativeWorkbenchStorageService extends RemoteStorageService {
    private readonly userDataProfileService;
    constructor(workspace: IAnyWorkspaceIdentifier | undefined, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, mainProcessService: IMainProcessService, environmentService: IEnvironmentService);
    private registerListeners;
}
