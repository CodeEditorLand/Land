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
import { IRemoteUserDataProfilesService } from '../../userDataProfile/common/remoteUserDataProfiles.js';
import { ProfileAwareExtensionManagementChannelClient } from './extensionManagementChannelClient.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
let RemoteExtensionManagementService = class RemoteExtensionManagementService extends ProfileAwareExtensionManagementChannelClient {
    constructor(channel, userDataProfileService, userDataProfilesService, remoteUserDataProfilesService, uriIdentityService) {
        super(channel, userDataProfileService, uriIdentityService);
        this.userDataProfilesService = userDataProfilesService;
        this.remoteUserDataProfilesService = remoteUserDataProfilesService;
    }
    async filterEvent(profileLocation, applicationScoped) {
        if (applicationScoped) {
            return true;
        }
        if (!profileLocation && this.userDataProfileService.currentProfile.isDefault) {
            return true;
        }
        const currentRemoteProfile = await this.remoteUserDataProfilesService.getRemoteProfile(this.userDataProfileService.currentProfile);
        if (this.uriIdentityService.extUri.isEqual(currentRemoteProfile.extensionsResource, profileLocation)) {
            return true;
        }
        return false;
    }
    async getProfileLocation(profileLocation) {
        if (!profileLocation && this.userDataProfileService.currentProfile.isDefault) {
            return undefined;
        }
        profileLocation = await super.getProfileLocation(profileLocation);
        let profile = this.userDataProfilesService.profiles.find(p => this.uriIdentityService.extUri.isEqual(p.extensionsResource, profileLocation));
        if (profile) {
            profile = await this.remoteUserDataProfilesService.getRemoteProfile(profile);
        }
        else {
            profile = (await this.remoteUserDataProfilesService.getRemoteProfiles()).find(p => this.uriIdentityService.extUri.isEqual(p.extensionsResource, profileLocation));
        }
        return profile?.extensionsResource;
    }
    async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
        const remoteProfiles = await this.remoteUserDataProfilesService.getRemoteProfiles();
        const previousProfile = remoteProfiles.find(p => this.uriIdentityService.extUri.isEqual(p.extensionsResource, previousProfileLocation));
        const currentProfile = remoteProfiles.find(p => this.uriIdentityService.extUri.isEqual(p.extensionsResource, currentProfileLocation));
        if (previousProfile?.id === currentProfile?.id) {
            return { added: [], removed: [] };
        }
        return super.switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions);
    }
};
RemoteExtensionManagementService = __decorate([
    __param(1, IUserDataProfileService),
    __param(2, IUserDataProfilesService),
    __param(3, IRemoteUserDataProfilesService),
    __param(4, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], RemoteExtensionManagementService);
export { RemoteExtensionManagementService };
