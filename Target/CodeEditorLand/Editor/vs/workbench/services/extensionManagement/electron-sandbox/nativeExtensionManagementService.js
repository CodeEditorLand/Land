/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { joinPath } from '../../../../base/common/resources.js';
import { Schemas } from '../../../../base/common/network.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IDownloadService } from '../../../../platform/download/common/download.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { ProfileAwareExtensionManagementChannelClient } from '../common/extensionManagementChannelClient.js';
import { ExtensionIdentifier, isResolverExtension } from '../../../../platform/extensions/common/extensions.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
let NativeExtensionManagementService = class NativeExtensionManagementService extends ProfileAwareExtensionManagementChannelClient {
    constructor(channel, userDataProfileService, uriIdentityService, fileService, downloadService, nativeEnvironmentService, logService) {
        super(channel, userDataProfileService, uriIdentityService);
        this.fileService = fileService;
        this.downloadService = downloadService;
        this.nativeEnvironmentService = nativeEnvironmentService;
        this.logService = logService;
    }
    filterEvent(profileLocation, isApplicationScoped) {
        return isApplicationScoped || this.uriIdentityService.extUri.isEqual(this.userDataProfileService.currentProfile.extensionsResource, profileLocation);
    }
    async install(vsix, options) {
        const { location, cleanup } = await this.downloadVsix(vsix);
        try {
            return await super.install(location, options);
        }
        finally {
            await cleanup();
        }
    }
    async downloadVsix(vsix) {
        if (vsix.scheme === Schemas.file) {
            return { location: vsix, async cleanup() { } };
        }
        this.logService.trace('Downloading extension from', vsix.toString());
        const location = joinPath(this.nativeEnvironmentService.extensionsDownloadLocation, generateUuid());
        await this.downloadService.download(vsix, location);
        this.logService.info('Downloaded extension to', location.toString());
        const cleanup = async () => {
            try {
                await this.fileService.del(location);
            }
            catch (error) {
                this.logService.error(error);
            }
        };
        return { location, cleanup };
    }
    async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
        if (this.nativeEnvironmentService.remoteAuthority) {
            const previousInstalledExtensions = await this.getInstalled(1 /* ExtensionType.User */, previousProfileLocation);
            const resolverExtension = previousInstalledExtensions.find(e => isResolverExtension(e.manifest, this.nativeEnvironmentService.remoteAuthority));
            if (resolverExtension) {
                if (!preserveExtensions) {
                    preserveExtensions = [];
                }
                preserveExtensions.push(new ExtensionIdentifier(resolverExtension.identifier.id));
            }
        }
        return super.switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions);
    }
};
NativeExtensionManagementService = __decorate([
    __param(1, IUserDataProfileService),
    __param(2, IUriIdentityService),
    __param(3, IFileService),
    __param(4, IDownloadService),
    __param(5, INativeWorkbenchEnvironmentService),
    __param(6, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], NativeExtensionManagementService);
export { NativeExtensionManagementService };
