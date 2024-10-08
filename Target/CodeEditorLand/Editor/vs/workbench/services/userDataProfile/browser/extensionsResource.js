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
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { GlobalExtensionEnablementService } from '../../../../platform/extensionManagement/common/extensionEnablementService.js';
import { EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT, IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { areSameExtensions } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUserDataProfileStorageService } from '../../../../platform/userDataProfile/common/userDataProfileStorageService.js';
import { TreeItemCollapsibleState } from '../../../common/views.js';
import { IUserDataProfileService } from '../common/userDataProfile.js';
let ExtensionsResourceInitializer = class ExtensionsResourceInitializer {
    constructor(userDataProfileService, extensionManagementService, extensionGalleryService, extensionEnablementService, logService) {
        this.userDataProfileService = userDataProfileService;
        this.extensionManagementService = extensionManagementService;
        this.extensionGalleryService = extensionGalleryService;
        this.extensionEnablementService = extensionEnablementService;
        this.logService = logService;
    }
    async initialize(content) {
        const profileExtensions = JSON.parse(content);
        const installedExtensions = await this.extensionManagementService.getInstalled(undefined, this.userDataProfileService.currentProfile.extensionsResource);
        const extensionsToEnableOrDisable = [];
        const extensionsToInstall = [];
        for (const e of profileExtensions) {
            const isDisabled = this.extensionEnablementService.getDisabledExtensions().some(disabledExtension => areSameExtensions(disabledExtension, e.identifier));
            const installedExtension = installedExtensions.find(installed => areSameExtensions(installed.identifier, e.identifier));
            if (!installedExtension || (!installedExtension.isBuiltin && installedExtension.preRelease !== e.preRelease)) {
                extensionsToInstall.push(e);
            }
            if (isDisabled !== !!e.disabled) {
                extensionsToEnableOrDisable.push({ extension: e.identifier, enable: !e.disabled });
            }
        }
        const extensionsToUninstall = installedExtensions.filter(extension => !extension.isBuiltin && !profileExtensions.some(({ identifier }) => areSameExtensions(identifier, extension.identifier)));
        for (const { extension, enable } of extensionsToEnableOrDisable) {
            if (enable) {
                this.logService.trace(`Initializing Profile: Enabling extension...`, extension.id);
                await this.extensionEnablementService.enableExtension(extension);
                this.logService.info(`Initializing Profile: Enabled extension...`, extension.id);
            }
            else {
                this.logService.trace(`Initializing Profile: Disabling extension...`, extension.id);
                await this.extensionEnablementService.disableExtension(extension);
                this.logService.info(`Initializing Profile: Disabled extension...`, extension.id);
            }
        }
        if (extensionsToInstall.length) {
            const galleryExtensions = await this.extensionGalleryService.getExtensions(extensionsToInstall.map(e => ({ ...e.identifier, version: e.version, hasPreRelease: e.version ? undefined : e.preRelease })), CancellationToken.None);
            await Promise.all(extensionsToInstall.map(async (e) => {
                const extension = galleryExtensions.find(galleryExtension => areSameExtensions(galleryExtension.identifier, e.identifier));
                if (!extension) {
                    return;
                }
                if (await this.extensionManagementService.canInstall(extension)) {
                    this.logService.trace(`Initializing Profile: Installing extension...`, extension.identifier.id, extension.version);
                    await this.extensionManagementService.installFromGallery(extension, {
                        isMachineScoped: false, /* set isMachineScoped value to prevent install and sync dialog in web */
                        donotIncludePackAndDependencies: true,
                        installGivenVersion: !!e.version,
                        installPreReleaseVersion: e.preRelease,
                        profileLocation: this.userDataProfileService.currentProfile.extensionsResource,
                        context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
                    });
                    this.logService.info(`Initializing Profile: Installed extension...`, extension.identifier.id, extension.version);
                }
                else {
                    this.logService.info(`Initializing Profile: Skipped installing extension because it cannot be installed.`, extension.identifier.id);
                }
            }));
        }
        if (extensionsToUninstall.length) {
            await Promise.all(extensionsToUninstall.map(e => this.extensionManagementService.uninstall(e)));
        }
    }
};
ExtensionsResourceInitializer = __decorate([
    __param(0, IUserDataProfileService),
    __param(1, IExtensionManagementService),
    __param(2, IExtensionGalleryService),
    __param(3, IGlobalExtensionEnablementService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ExtensionsResourceInitializer);
export { ExtensionsResourceInitializer };
let ExtensionsResource = class ExtensionsResource {
    constructor(extensionManagementService, extensionGalleryService, userDataProfileStorageService, instantiationService, logService) {
        this.extensionManagementService = extensionManagementService;
        this.extensionGalleryService = extensionGalleryService;
        this.userDataProfileStorageService = userDataProfileStorageService;
        this.instantiationService = instantiationService;
        this.logService = logService;
    }
    async getContent(profile, exclude) {
        const extensions = await this.getLocalExtensions(profile);
        return this.toContent(extensions, exclude);
    }
    toContent(extensions, exclude) {
        return JSON.stringify(exclude?.length ? extensions.filter(e => !exclude.includes(e.identifier.id.toLowerCase())) : extensions);
    }
    async apply(content, profile, progress, token) {
        return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
            const profileExtensions = await this.getProfileExtensions(content);
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
            const extensionsToEnableOrDisable = [];
            const extensionsToInstall = [];
            for (const e of profileExtensions) {
                const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => areSameExtensions(disabledExtension, e.identifier));
                const installedExtension = installedExtensions.find(installed => areSameExtensions(installed.identifier, e.identifier));
                if (!installedExtension || (!installedExtension.isBuiltin && installedExtension.preRelease !== e.preRelease)) {
                    extensionsToInstall.push(e);
                }
                if (isDisabled !== !!e.disabled) {
                    extensionsToEnableOrDisable.push({ extension: e.identifier, enable: !e.disabled });
                }
            }
            const extensionsToUninstall = installedExtensions.filter(extension => !extension.isBuiltin && !profileExtensions.some(({ identifier }) => areSameExtensions(identifier, extension.identifier)) && !extension.isApplicationScoped);
            for (const { extension, enable } of extensionsToEnableOrDisable) {
                if (enable) {
                    this.logService.trace(`Importing Profile (${profile.name}): Enabling extension...`, extension.id);
                    await extensionEnablementService.enableExtension(extension);
                    this.logService.info(`Importing Profile (${profile.name}): Enabled extension...`, extension.id);
                }
                else {
                    this.logService.trace(`Importing Profile (${profile.name}): Disabling extension...`, extension.id);
                    await extensionEnablementService.disableExtension(extension);
                    this.logService.info(`Importing Profile (${profile.name}): Disabled extension...`, extension.id);
                }
            }
            if (extensionsToInstall.length) {
                this.logService.info(`Importing Profile (${profile.name}): Started installing extensions.`);
                const galleryExtensions = await this.extensionGalleryService.getExtensions(extensionsToInstall.map(e => ({ ...e.identifier, version: e.version, hasPreRelease: e.version ? undefined : e.preRelease })), CancellationToken.None);
                const installExtensionInfos = [];
                await Promise.all(extensionsToInstall.map(async (e) => {
                    const extension = galleryExtensions.find(galleryExtension => areSameExtensions(galleryExtension.identifier, e.identifier));
                    if (!extension) {
                        return;
                    }
                    if (await this.extensionManagementService.canInstall(extension)) {
                        installExtensionInfos.push({
                            extension,
                            options: {
                                isMachineScoped: false, /* set isMachineScoped value to prevent install and sync dialog in web */
                                donotIncludePackAndDependencies: true,
                                installGivenVersion: !!e.version,
                                installPreReleaseVersion: e.preRelease,
                                profileLocation: profile.extensionsResource,
                                context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
                            }
                        });
                    }
                    else {
                        this.logService.info(`Importing Profile (${profile.name}): Skipped installing extension because it cannot be installed.`, extension.identifier.id);
                    }
                }));
                if (installExtensionInfos.length) {
                    if (token) {
                        for (const installExtensionInfo of installExtensionInfos) {
                            if (token.isCancellationRequested) {
                                return;
                            }
                            progress?.(localize('installingExtension', "Installing extension {0}...", installExtensionInfo.extension.displayName ?? installExtensionInfo.extension.identifier.id));
                            await this.extensionManagementService.installFromGallery(installExtensionInfo.extension, installExtensionInfo.options);
                        }
                    }
                    else {
                        await this.extensionManagementService.installGalleryExtensions(installExtensionInfos);
                    }
                }
                this.logService.info(`Importing Profile (${profile.name}): Finished installing extensions.`);
            }
            if (extensionsToUninstall.length) {
                await Promise.all(extensionsToUninstall.map(e => this.extensionManagementService.uninstall(e)));
            }
        });
    }
    async copy(from, to, disableExtensions) {
        await this.extensionManagementService.copyExtensions(from.extensionsResource, to.extensionsResource);
        const extensionsToDisable = await this.withProfileScopedServices(from, async (extensionEnablementService) => extensionEnablementService.getDisabledExtensions());
        if (disableExtensions) {
            const extensions = await this.extensionManagementService.getInstalled(1 /* ExtensionType.User */, to.extensionsResource);
            for (const extension of extensions) {
                extensionsToDisable.push(extension.identifier);
            }
        }
        await this.withProfileScopedServices(to, async (extensionEnablementService) => Promise.all(extensionsToDisable.map(extension => extensionEnablementService.disableExtension(extension))));
    }
    async getLocalExtensions(profile) {
        return this.withProfileScopedServices(profile, async (extensionEnablementService) => {
            const result = new Map();
            const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
            const disabledExtensions = extensionEnablementService.getDisabledExtensions();
            for (const extension of installedExtensions) {
                const { identifier, preRelease } = extension;
                const disabled = disabledExtensions.some(disabledExtension => areSameExtensions(disabledExtension, identifier));
                if (extension.isBuiltin && !disabled) {
                    // skip enabled builtin extensions
                    continue;
                }
                if (!extension.isBuiltin) {
                    if (!extension.identifier.uuid) {
                        // skip user extensions without uuid
                        continue;
                    }
                }
                const existing = result.get(identifier.id.toLowerCase());
                if (existing?.disabled) {
                    // Remove the duplicate disabled extension
                    result.delete(identifier.id.toLowerCase());
                }
                const profileExtension = { identifier, displayName: extension.manifest.displayName };
                if (disabled) {
                    profileExtension.disabled = true;
                }
                if (!extension.isBuiltin && extension.pinned) {
                    profileExtension.version = extension.manifest.version;
                }
                if (!profileExtension.version && preRelease) {
                    profileExtension.preRelease = true;
                }
                profileExtension.applicationScoped = extension.isApplicationScoped;
                result.set(profileExtension.identifier.id.toLowerCase(), profileExtension);
            }
            return [...result.values()];
        });
    }
    async getProfileExtensions(content) {
        return JSON.parse(content);
    }
    async withProfileScopedServices(profile, fn) {
        return this.userDataProfileStorageService.withProfileScopedStorageService(profile, async (storageService) => {
            const disposables = new DisposableStore();
            const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IStorageService, storageService])));
            const extensionEnablementService = disposables.add(instantiationService.createInstance(GlobalExtensionEnablementService));
            try {
                return await fn(extensionEnablementService);
            }
            finally {
                disposables.dispose();
            }
        });
    }
};
ExtensionsResource = __decorate([
    __param(0, IExtensionManagementService),
    __param(1, IExtensionGalleryService),
    __param(2, IUserDataProfileStorageService),
    __param(3, IInstantiationService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ExtensionsResource);
export { ExtensionsResource };
export class ExtensionsResourceTreeItem {
    constructor() {
        this.type = "extensions" /* ProfileResourceType.Extensions */;
        this.handle = "extensions" /* ProfileResourceType.Extensions */;
        this.label = { label: localize('extensions', "Extensions") };
        this.collapsibleState = TreeItemCollapsibleState.Expanded;
        this.contextValue = "extensions" /* ProfileResourceType.Extensions */;
        this.excludedExtensions = new Set();
    }
    async getChildren() {
        const extensions = (await this.getExtensions()).sort((a, b) => (a.displayName ?? a.identifier.id).localeCompare(b.displayName ?? b.identifier.id));
        const that = this;
        return extensions.map(e => ({
            ...e,
            handle: e.identifier.id.toLowerCase(),
            parent: this,
            label: { label: e.displayName || e.identifier.id },
            description: e.applicationScoped ? localize('all profiles and disabled', "All Profiles") : undefined,
            collapsibleState: TreeItemCollapsibleState.None,
            checkbox: that.checkbox ? {
                get isChecked() { return !that.excludedExtensions.has(e.identifier.id.toLowerCase()); },
                set isChecked(value) {
                    if (value) {
                        that.excludedExtensions.delete(e.identifier.id.toLowerCase());
                    }
                    else {
                        that.excludedExtensions.add(e.identifier.id.toLowerCase());
                    }
                },
                tooltip: localize('exclude', "Select {0} Extension", e.displayName || e.identifier.id),
                accessibilityInformation: {
                    label: localize('exclude', "Select {0} Extension", e.displayName || e.identifier.id),
                }
            } : undefined,
            themeIcon: Codicon.extensions,
            command: {
                id: 'extension.open',
                title: '',
                arguments: [e.identifier.id, undefined, true]
            }
        }));
    }
    async hasContent() {
        const extensions = await this.getExtensions();
        return extensions.length > 0;
    }
}
let ExtensionsResourceExportTreeItem = class ExtensionsResourceExportTreeItem extends ExtensionsResourceTreeItem {
    constructor(profile, instantiationService) {
        super();
        this.profile = profile;
        this.instantiationService = instantiationService;
    }
    isFromDefaultProfile() {
        return !this.profile.isDefault && !!this.profile.useDefaultFlags?.extensions;
    }
    getExtensions() {
        return this.instantiationService.createInstance(ExtensionsResource).getLocalExtensions(this.profile);
    }
    async getContent() {
        return this.instantiationService.createInstance(ExtensionsResource).getContent(this.profile, [...this.excludedExtensions.values()]);
    }
};
ExtensionsResourceExportTreeItem = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], ExtensionsResourceExportTreeItem);
export { ExtensionsResourceExportTreeItem };
let ExtensionsResourceImportTreeItem = class ExtensionsResourceImportTreeItem extends ExtensionsResourceTreeItem {
    constructor(content, instantiationService) {
        super();
        this.content = content;
        this.instantiationService = instantiationService;
    }
    isFromDefaultProfile() {
        return false;
    }
    getExtensions() {
        return this.instantiationService.createInstance(ExtensionsResource).getProfileExtensions(this.content);
    }
    async getContent() {
        const extensionsResource = this.instantiationService.createInstance(ExtensionsResource);
        const extensions = await extensionsResource.getProfileExtensions(this.content);
        return extensionsResource.toContent(extensions, [...this.excludedExtensions.values()]);
    }
};
ExtensionsResourceImportTreeItem = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [String, Object])
], ExtensionsResourceImportTreeItem);
export { ExtensionsResourceImportTreeItem };
