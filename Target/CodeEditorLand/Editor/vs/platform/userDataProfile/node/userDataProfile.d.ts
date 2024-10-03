import { URI } from '../../../base/common/uri.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IStateReadService, IStateService } from '../../state/node/state.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService, UserDataProfilesService as BaseUserDataProfilesService, StoredUserDataProfile, StoredProfileAssociations } from '../common/userDataProfile.js';
export declare class UserDataProfilesReadonlyService extends BaseUserDataProfilesService implements IUserDataProfilesService {
    private readonly stateReadonlyService;
    private readonly nativeEnvironmentService;
    protected static readonly PROFILE_ASSOCIATIONS_MIGRATION_KEY = "profileAssociationsMigration";
    constructor(stateReadonlyService: IStateReadService, uriIdentityService: IUriIdentityService, nativeEnvironmentService: INativeEnvironmentService, fileService: IFileService, logService: ILogService);
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected getStoredProfileAssociations(): StoredProfileAssociations;
    protected getDefaultProfileExtensionsLocation(): URI;
}
export declare class UserDataProfilesService extends UserDataProfilesReadonlyService implements IUserDataProfilesService {
    protected readonly stateService: IStateService;
    constructor(stateService: IStateService, uriIdentityService: IUriIdentityService, environmentService: INativeEnvironmentService, fileService: IFileService, logService: ILogService);
    protected saveStoredProfiles(storedProfiles: StoredUserDataProfile[]): void;
    protected getStoredProfiles(): StoredUserDataProfile[];
    protected saveStoredProfileAssociations(storedProfileAssociations: StoredProfileAssociations): void;
    protected getStoredProfileAssociations(): StoredProfileAssociations;
}
export declare class ServerUserDataProfilesService extends UserDataProfilesService implements IUserDataProfilesService {
    constructor(uriIdentityService: IUriIdentityService, environmentService: INativeEnvironmentService, fileService: IFileService, logService: ILogService);
    init(): Promise<void>;
}
