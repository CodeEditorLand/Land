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
import { VSBuffer } from '../../../../base/common/buffer.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { FileOperationError, IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IUserDataProfileService } from '../common/userDataProfile.js';
import { updateIgnoredSettings } from '../../../../platform/userDataSync/common/settingsMerge.js';
import { IUserDataSyncUtilService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { TreeItemCollapsibleState } from '../../../common/views.js';
import { API_OPEN_EDITOR_COMMAND_ID } from '../../../browser/parts/editor/editorCommands.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { localize } from '../../../../nls.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
let SettingsResourceInitializer = class SettingsResourceInitializer {
    constructor(userDataProfileService, fileService, logService) {
        this.userDataProfileService = userDataProfileService;
        this.fileService = fileService;
        this.logService = logService;
    }
    async initialize(content) {
        const settingsContent = JSON.parse(content);
        if (settingsContent.settings === null) {
            this.logService.info(`Initializing Profile: No settings to apply...`);
            return;
        }
        await this.fileService.writeFile(this.userDataProfileService.currentProfile.settingsResource, VSBuffer.fromString(settingsContent.settings));
    }
};
SettingsResourceInitializer = __decorate([
    __param(0, IUserDataProfileService),
    __param(1, IFileService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], SettingsResourceInitializer);
export { SettingsResourceInitializer };
let SettingsResource = class SettingsResource {
    constructor(fileService, userDataSyncUtilService, logService) {
        this.fileService = fileService;
        this.userDataSyncUtilService = userDataSyncUtilService;
        this.logService = logService;
    }
    async getContent(profile) {
        const settingsContent = await this.getSettingsContent(profile);
        return JSON.stringify(settingsContent);
    }
    async getSettingsContent(profile) {
        const localContent = await this.getLocalFileContent(profile);
        if (localContent === null) {
            return { settings: null };
        }
        else {
            const ignoredSettings = this.getIgnoredSettings();
            const formattingOptions = await this.userDataSyncUtilService.resolveFormattingOptions(profile.settingsResource);
            const settings = updateIgnoredSettings(localContent || '{}', '{}', ignoredSettings, formattingOptions);
            return { settings };
        }
    }
    async apply(content, profile) {
        const settingsContent = JSON.parse(content);
        if (settingsContent.settings === null) {
            this.logService.info(`Importing Profile (${profile.name}): No settings to apply...`);
            return;
        }
        const localSettingsContent = await this.getLocalFileContent(profile);
        const formattingOptions = await this.userDataSyncUtilService.resolveFormattingOptions(profile.settingsResource);
        const contentToUpdate = updateIgnoredSettings(settingsContent.settings, localSettingsContent || '{}', this.getIgnoredSettings(), formattingOptions);
        await this.fileService.writeFile(profile.settingsResource, VSBuffer.fromString(contentToUpdate));
    }
    getIgnoredSettings() {
        const allSettings = Registry.as(Extensions.Configuration).getConfigurationProperties();
        const ignoredSettings = Object.keys(allSettings).filter(key => allSettings[key]?.scope === 2 || allSettings[key]?.scope === 6);
        return ignoredSettings;
    }
    async getLocalFileContent(profile) {
        try {
            const content = await this.fileService.readFile(profile.settingsResource);
            return content.value.toString();
        }
        catch (error) {
            if (error instanceof FileOperationError && error.fileOperationResult === 1) {
                return null;
            }
            else {
                throw error;
            }
        }
    }
};
SettingsResource = __decorate([
    __param(0, IFileService),
    __param(1, IUserDataSyncUtilService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], SettingsResource);
export { SettingsResource };
let SettingsResourceTreeItem = class SettingsResourceTreeItem {
    constructor(profile, uriIdentityService, instantiationService) {
        this.profile = profile;
        this.uriIdentityService = uriIdentityService;
        this.instantiationService = instantiationService;
        this.type = "settings";
        this.handle = "settings";
        this.label = { label: localize('settings', "Settings") };
        this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
    async getChildren() {
        return [{
                handle: this.profile.settingsResource.toString(),
                resourceUri: this.profile.settingsResource,
                collapsibleState: TreeItemCollapsibleState.None,
                parent: this,
                accessibilityInformation: {
                    label: this.uriIdentityService.extUri.basename(this.profile.settingsResource)
                },
                command: {
                    id: API_OPEN_EDITOR_COMMAND_ID,
                    title: '',
                    arguments: [this.profile.settingsResource, undefined, undefined]
                }
            }];
    }
    async hasContent() {
        const settingsContent = await this.instantiationService.createInstance(SettingsResource).getSettingsContent(this.profile);
        return settingsContent.settings !== null;
    }
    async getContent() {
        return this.instantiationService.createInstance(SettingsResource).getContent(this.profile);
    }
    isFromDefaultProfile() {
        return !this.profile.isDefault && !!this.profile.useDefaultFlags?.settings;
    }
};
SettingsResourceTreeItem = __decorate([
    __param(1, IUriIdentityService),
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], SettingsResourceTreeItem);
export { SettingsResourceTreeItem };
