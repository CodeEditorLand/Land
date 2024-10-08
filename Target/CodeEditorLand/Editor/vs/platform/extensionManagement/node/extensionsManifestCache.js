/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from '../../../base/common/lifecycle.js';
import { USER_MANIFEST_CACHE_FILE } from '../../extensions/common/extensions.js';
import { toFileOperationResult } from '../../files/common/files.js';
export class ExtensionsManifestCache extends Disposable {
    constructor(userDataProfilesService, fileService, uriIdentityService, extensionsManagementService, logService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
        this.logService = logService;
        this._register(extensionsManagementService.onDidInstallExtensions(e => this.onDidInstallExtensions(e)));
        this._register(extensionsManagementService.onDidUninstallExtension(e => this.onDidUnInstallExtension(e)));
    }
    onDidInstallExtensions(results) {
        for (const r of results) {
            if (r.local) {
                this.invalidate(r.profileLocation);
            }
        }
    }
    onDidUnInstallExtension(e) {
        if (!e.error) {
            this.invalidate(e.profileLocation);
        }
    }
    async invalidate(extensionsManifestLocation) {
        if (extensionsManifestLocation) {
            for (const profile of this.userDataProfilesService.profiles) {
                if (this.uriIdentityService.extUri.isEqual(profile.extensionsResource, extensionsManifestLocation)) {
                    await this.deleteUserCacheFile(profile);
                }
            }
        }
        else {
            await this.deleteUserCacheFile(this.userDataProfilesService.defaultProfile);
        }
    }
    async deleteUserCacheFile(profile) {
        try {
            await this.fileService.del(this.uriIdentityService.extUri.joinPath(profile.cacheHome, USER_MANIFEST_CACHE_FILE));
        }
        catch (error) {
            if (toFileOperationResult(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                this.logService.error(error);
            }
        }
    }
}
