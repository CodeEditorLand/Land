import { Event } from '../../../base/common/event.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService, WillCreateProfileEvent, WillRemoveProfileEvent, IUserDataProfile } from '../common/userDataProfile.js';
import { UserDataProfilesService } from '../node/userDataProfile.js';
import { IAnyWorkspaceIdentifier, IEmptyWorkspaceIdentifier } from '../../workspace/common/workspace.js';
import { IStateService } from '../../state/node/state.js';
export declare const IUserDataProfilesMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataProfilesMainService>;
export interface IUserDataProfilesMainService extends IUserDataProfilesService {
    getProfileForWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier): IUserDataProfile | undefined;
    unsetWorkspace(workspaceIdentifier: IAnyWorkspaceIdentifier, transient?: boolean): void;
    getAssociatedEmptyWindows(): IEmptyWorkspaceIdentifier[];
    readonly onWillCreateProfile: Event<WillCreateProfileEvent>;
    readonly onWillRemoveProfile: Event<WillRemoveProfileEvent>;
}
export declare class UserDataProfilesMainService extends UserDataProfilesService implements IUserDataProfilesMainService {
    constructor(stateService: IStateService, uriIdentityService: IUriIdentityService, environmentService: INativeEnvironmentService, fileService: IFileService, logService: ILogService);
    getAssociatedEmptyWindows(): IEmptyWorkspaceIdentifier[];
}
