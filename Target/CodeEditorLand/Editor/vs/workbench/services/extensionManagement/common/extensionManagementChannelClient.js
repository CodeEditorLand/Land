/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { ExtensionManagementChannelClient as BaseExtensionManagementChannelClient } from '../../../../platform/extensionManagement/common/extensionManagementIpc.js';
import { Emitter } from '../../../../base/common/event.js';
import { delta } from '../../../../base/common/arrays.js';
import { compare } from '../../../../base/common/strings.js';
export class ProfileAwareExtensionManagementChannelClient extends BaseExtensionManagementChannelClient {
    get onProfileAwareDidInstallExtensions() { return this._onDidProfileAwareInstallExtensions.event; }
    get onProfileAwareDidUninstallExtension() { return this._onDidProfileAwareUninstallExtension.event; }
    get onProfileAwareDidUpdateExtensionMetadata() { return this._onDidProfileAwareUpdateExtensionMetadata.event; }
    constructor(channel, userDataProfileService, uriIdentityService) {
        super(channel);
        this.userDataProfileService = userDataProfileService;
        this.uriIdentityService = uriIdentityService;
        this._onDidChangeProfile = this._register(new Emitter());
        this.onDidChangeProfile = this._onDidChangeProfile.event;
        this._onDidProfileAwareInstallExtensions = this._register(new Emitter());
        this._onDidProfileAwareUninstallExtension = this._register(new Emitter());
        this._onDidProfileAwareUpdateExtensionMetadata = this._register(new Emitter());
        this._register(userDataProfileService.onDidChangeCurrentProfile(e => {
            if (!this.uriIdentityService.extUri.isEqual(e.previous.extensionsResource, e.profile.extensionsResource)) {
                e.join(this.whenProfileChanged(e));
            }
        }));
    }
    async onInstallExtensionEvent(data) {
        const result = this.filterEvent(data.profileLocation, data.applicationScoped ?? false);
        if (result instanceof Promise ? await result : result) {
            this._onInstallExtension.fire(data);
        }
    }
    async onDidInstallExtensionsEvent(results) {
        const filtered = [];
        for (const e of results) {
            const result = this.filterEvent(e.profileLocation, e.applicationScoped ?? e.local?.isApplicationScoped ?? false);
            if (result instanceof Promise ? await result : result) {
                filtered.push(e);
            }
        }
        if (filtered.length) {
            this._onDidInstallExtensions.fire(filtered);
        }
        this._onDidProfileAwareInstallExtensions.fire(results);
    }
    async onUninstallExtensionEvent(data) {
        const result = this.filterEvent(data.profileLocation, data.applicationScoped ?? false);
        if (result instanceof Promise ? await result : result) {
            this._onUninstallExtension.fire(data);
        }
    }
    async onDidUninstallExtensionEvent(data) {
        const result = this.filterEvent(data.profileLocation, data.applicationScoped ?? false);
        if (result instanceof Promise ? await result : result) {
            this._onDidUninstallExtension.fire(data);
        }
        this._onDidProfileAwareUninstallExtension.fire(data);
    }
    async onDidUpdateExtensionMetadataEvent(data) {
        const result = this.filterEvent(data.profileLocation, data.local?.isApplicationScoped ?? false);
        if (result instanceof Promise ? await result : result) {
            this._onDidUpdateExtensionMetadata.fire(data);
        }
        this._onDidProfileAwareUpdateExtensionMetadata.fire(data);
    }
    async install(vsix, installOptions) {
        installOptions = { ...installOptions, profileLocation: await this.getProfileLocation(installOptions?.profileLocation) };
        return super.install(vsix, installOptions);
    }
    async installFromLocation(location, profileLocation) {
        return super.installFromLocation(location, await this.getProfileLocation(profileLocation));
    }
    async installFromGallery(extension, installOptions) {
        installOptions = { ...installOptions, profileLocation: await this.getProfileLocation(installOptions?.profileLocation) };
        return super.installFromGallery(extension, installOptions);
    }
    async installGalleryExtensions(extensions) {
        const infos = [];
        for (const extension of extensions) {
            infos.push({ ...extension, options: { ...extension.options, profileLocation: await this.getProfileLocation(extension.options?.profileLocation) } });
        }
        return super.installGalleryExtensions(infos);
    }
    async uninstall(extension, options) {
        options = { ...options, profileLocation: await this.getProfileLocation(options?.profileLocation) };
        return super.uninstall(extension, options);
    }
    async uninstallExtensions(extensions) {
        const infos = [];
        for (const { extension, options } of extensions) {
            infos.push({ extension, options: { ...options, profileLocation: await this.getProfileLocation(options?.profileLocation) } });
        }
        return super.uninstallExtensions(infos);
    }
    async getInstalled(type = null, extensionsProfileResource, productVersion) {
        return super.getInstalled(type, await this.getProfileLocation(extensionsProfileResource), productVersion);
    }
    async updateMetadata(local, metadata, extensionsProfileResource) {
        return super.updateMetadata(local, metadata, await this.getProfileLocation(extensionsProfileResource));
    }
    async toggleAppliationScope(local, fromProfileLocation) {
        return super.toggleAppliationScope(local, await this.getProfileLocation(fromProfileLocation));
    }
    async copyExtensions(fromProfileLocation, toProfileLocation) {
        return super.copyExtensions(await this.getProfileLocation(fromProfileLocation), await this.getProfileLocation(toProfileLocation));
    }
    async whenProfileChanged(e) {
        const previousProfileLocation = await this.getProfileLocation(e.previous.extensionsResource);
        const currentProfileLocation = await this.getProfileLocation(e.profile.extensionsResource);
        if (this.uriIdentityService.extUri.isEqual(previousProfileLocation, currentProfileLocation)) {
            return;
        }
        const eventData = await this.switchExtensionsProfile(previousProfileLocation, currentProfileLocation);
        this._onDidChangeProfile.fire(eventData);
    }
    async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
        const oldExtensions = await this.getInstalled(1 /* ExtensionType.User */, previousProfileLocation);
        const newExtensions = await this.getInstalled(1 /* ExtensionType.User */, currentProfileLocation);
        if (preserveExtensions?.length) {
            const extensionsToInstall = [];
            for (const extension of oldExtensions) {
                if (preserveExtensions.some(id => ExtensionIdentifier.equals(extension.identifier.id, id)) &&
                    !newExtensions.some(e => ExtensionIdentifier.equals(e.identifier.id, extension.identifier.id))) {
                    extensionsToInstall.push(extension.identifier);
                }
            }
            if (extensionsToInstall.length) {
                await this.installExtensionsFromProfile(extensionsToInstall, previousProfileLocation, currentProfileLocation);
            }
        }
        return delta(oldExtensions, newExtensions, (a, b) => compare(`${ExtensionIdentifier.toKey(a.identifier.id)}@${a.manifest.version}`, `${ExtensionIdentifier.toKey(b.identifier.id)}@${b.manifest.version}`));
    }
    async getProfileLocation(profileLocation) {
        return profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource;
    }
}
