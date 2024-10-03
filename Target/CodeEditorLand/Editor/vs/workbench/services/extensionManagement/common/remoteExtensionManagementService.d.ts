import { IChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { URI } from '../../../../base/common/uri.js';
import { DidChangeProfileEvent, IProfileAwareExtensionManagementService } from './extensionManagement.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IRemoteUserDataProfilesService } from '../../userDataProfile/common/remoteUserDataProfiles.js';
import { ProfileAwareExtensionManagementChannelClient } from './extensionManagementChannelClient.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
export declare class RemoteExtensionManagementService extends ProfileAwareExtensionManagementChannelClient implements IProfileAwareExtensionManagementService {
    private readonly userDataProfilesService;
    private readonly remoteUserDataProfilesService;
    constructor(channel: IChannel, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, remoteUserDataProfilesService: IRemoteUserDataProfilesService, uriIdentityService: IUriIdentityService);
    protected filterEvent(profileLocation: URI, applicationScoped: boolean): Promise<boolean>;
    protected getProfileLocation(profileLocation: URI): Promise<URI>;
    protected getProfileLocation(profileLocation?: URI): Promise<URI | undefined>;
    protected switchExtensionsProfile(previousProfileLocation: URI, currentProfileLocation: URI, preserveExtensions?: ExtensionIdentifier[]): Promise<DidChangeProfileEvent>;
}
