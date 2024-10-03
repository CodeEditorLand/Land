import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, IUserDataProfilesService, StoredProfileAssociations, StoredUserDataProfile, UserDataProfilesService } from '../common/userDataProfile.js';
export declare class BrowserUserDataProfilesService extends UserDataProfilesService implements IUserDataProfilesService {
    private readonly changesBroadcastChannel;
    constructor(environmentService: IEnvironmentService, fileService: IFileService, uriIdentityService: IUriIdentityService, logService: ILogService);
    private updateTransientProfiles;
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected triggerProfilesChanges(added: IUserDataProfile[], removed: IUserDataProfile[], updated: IUserDataProfile[]): void;
    protected saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void;
    protected getStoredProfileAssociations(): StoredProfileAssociations;
    protected saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void;
}
