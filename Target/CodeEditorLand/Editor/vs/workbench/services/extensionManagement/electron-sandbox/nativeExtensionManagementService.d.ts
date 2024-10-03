import { IChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { DidChangeProfileEvent, IProfileAwareExtensionManagementService } from '../common/extensionManagement.js';
import { URI } from '../../../../base/common/uri.js';
import { ILocalExtension, InstallOptions } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IDownloadService } from '../../../../platform/download/common/download.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ProfileAwareExtensionManagementChannelClient } from '../common/extensionManagementChannelClient.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
export declare class NativeExtensionManagementService extends ProfileAwareExtensionManagementChannelClient implements IProfileAwareExtensionManagementService {
    private readonly fileService;
    private readonly downloadService;
    private readonly nativeEnvironmentService;
    private readonly logService;
    constructor(channel: IChannel, userDataProfileService: IUserDataProfileService, uriIdentityService: IUriIdentityService, fileService: IFileService, downloadService: IDownloadService, nativeEnvironmentService: INativeWorkbenchEnvironmentService, logService: ILogService);
    protected filterEvent(profileLocation: URI, isApplicationScoped: boolean): boolean;
    install(vsix: URI, options?: InstallOptions): Promise<ILocalExtension>;
    private downloadVsix;
    protected switchExtensionsProfile(previousProfileLocation: URI, currentProfileLocation: URI, preserveExtensions?: ExtensionIdentifier[]): Promise<DidChangeProfileEvent>;
}
