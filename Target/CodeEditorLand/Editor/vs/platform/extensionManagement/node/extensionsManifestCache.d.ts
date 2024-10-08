import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IExtensionManagementService } from '../common/extensionManagement.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
export declare class ExtensionsManifestCache extends Disposable {
    private readonly userDataProfilesService;
    private readonly fileService;
    private readonly uriIdentityService;
    private readonly logService;
    constructor(userDataProfilesService: IUserDataProfilesService, fileService: IFileService, uriIdentityService: IUriIdentityService, extensionsManagementService: IExtensionManagementService, logService: ILogService);
    private onDidInstallExtensions;
    private onDidUnInstallExtension;
    invalidate(extensionsManifestLocation: URI | undefined): Promise<void>;
    private deleteUserCacheFile;
}
