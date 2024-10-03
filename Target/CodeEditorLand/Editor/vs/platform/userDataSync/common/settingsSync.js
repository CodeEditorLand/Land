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
import { distinct } from '../../../base/common/arrays.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { Event } from '../../../base/common/event.js';
import { localize } from '../../../nls.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { ConfigurationModelParser } from '../../configuration/common/configurationModels.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { IFileService } from '../../files/common/files.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractInitializer, AbstractJsonFileSynchroniser } from './abstractSynchronizer.js';
import { getIgnoredSettings, isEmpty, merge, updateIgnoredSettings } from './settingsMerge.js';
import { IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, IUserDataSyncUtilService, UserDataSyncError, USER_DATA_SYNC_CONFIGURATION_SCOPE, USER_DATA_SYNC_SCHEME, getIgnoredSettingsForExtension } from './userDataSync.js';
function isSettingsSyncContent(thing) {
    return thing
        && (thing.settings && typeof thing.settings === 'string')
        && Object.keys(thing).length === 1;
}
export function parseSettingsSyncContent(syncContent) {
    const parsed = JSON.parse(syncContent);
    return isSettingsSyncContent(parsed) ? parsed : { settings: syncContent };
}
let SettingsSynchroniser = class SettingsSynchroniser extends AbstractJsonFileSynchroniser {
    constructor(profile, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, userDataSyncUtilService, configurationService, userDataSyncEnablementService, telemetryService, extensionManagementService, uriIdentityService) {
        super(profile.settingsResource, { syncResource: "settings", profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService);
        this.profile = profile;
        this.extensionManagementService = extensionManagementService;
        this.version = 2;
        this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'settings.json');
        this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' });
        this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' });
        this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' });
        this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' });
        this.coreIgnoredSettings = undefined;
        this.systemExtensionsIgnoredSettings = undefined;
        this.userExtensionsIgnoredSettings = undefined;
    }
    async getRemoteUserDataSyncConfiguration(manifest) {
        const lastSyncUserData = await this.getLastSyncUserData();
        const remoteUserData = await this.getLatestRemoteUserData(manifest, lastSyncUserData);
        const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
        const parser = new ConfigurationModelParser(USER_DATA_SYNC_CONFIGURATION_SCOPE, this.logService);
        if (remoteSettingsSyncContent?.settings) {
            parser.parse(remoteSettingsSyncContent.settings);
        }
        return parser.configurationModel.getValue(USER_DATA_SYNC_CONFIGURATION_SCOPE) || {};
    }
    async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
        const fileContent = await this.getLocalFileContent();
        const formattingOptions = await this.getFormattingOptions();
        const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
        lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
        const lastSettingsSyncContent = lastSyncUserData ? this.getSettingsSyncContent(lastSyncUserData) : null;
        const ignoredSettings = await this.getIgnoredSettings();
        let mergedContent = null;
        let hasLocalChanged = false;
        let hasRemoteChanged = false;
        let hasConflicts = false;
        if (remoteSettingsSyncContent) {
            let localContent = fileContent ? fileContent.value.toString().trim() : '{}';
            localContent = localContent || '{}';
            this.validateContent(localContent);
            this.logService.trace(`${this.syncResourceLogLabel}: Merging remote settings with local settings...`);
            const result = merge(localContent, remoteSettingsSyncContent.settings, lastSettingsSyncContent ? lastSettingsSyncContent.settings : null, ignoredSettings, [], formattingOptions);
            mergedContent = result.localContent || result.remoteContent;
            hasLocalChanged = result.localContent !== null;
            hasRemoteChanged = result.remoteContent !== null;
            hasConflicts = result.hasConflicts;
        }
        else if (fileContent) {
            this.logService.trace(`${this.syncResourceLogLabel}: Remote settings does not exist. Synchronizing settings for the first time.`);
            mergedContent = fileContent.value.toString().trim() || '{}';
            this.validateContent(mergedContent);
            hasRemoteChanged = true;
        }
        const localContent = fileContent ? fileContent.value.toString() : null;
        const baseContent = lastSettingsSyncContent?.settings ?? null;
        const previewResult = {
            content: hasConflicts ? baseContent : mergedContent,
            localChange: hasLocalChanged ? 2 : 0,
            remoteChange: hasRemoteChanged ? 2 : 0,
            hasConflicts
        };
        return [{
                fileContent,
                baseResource: this.baseResource,
                baseContent,
                localResource: this.localResource,
                localContent,
                localChange: previewResult.localChange,
                remoteResource: this.remoteResource,
                remoteContent: remoteSettingsSyncContent ? remoteSettingsSyncContent.settings : null,
                remoteChange: previewResult.remoteChange,
                previewResource: this.previewResource,
                previewResult,
                acceptedResource: this.acceptedResource,
            }];
    }
    async hasRemoteChanged(lastSyncUserData) {
        const lastSettingsSyncContent = this.getSettingsSyncContent(lastSyncUserData);
        if (lastSettingsSyncContent === null) {
            return true;
        }
        const fileContent = await this.getLocalFileContent();
        const localContent = fileContent ? fileContent.value.toString().trim() : '';
        const ignoredSettings = await this.getIgnoredSettings();
        const formattingOptions = await this.getFormattingOptions();
        const result = merge(localContent || '{}', lastSettingsSyncContent.settings, lastSettingsSyncContent.settings, ignoredSettings, [], formattingOptions);
        return result.remoteContent !== null;
    }
    async getMergeResult(resourcePreview, token) {
        const formatUtils = await this.getFormattingOptions();
        const ignoredSettings = await this.getIgnoredSettings();
        return {
            ...resourcePreview.previewResult,
            content: resourcePreview.previewResult.content ? updateIgnoredSettings(resourcePreview.previewResult.content, '{}', ignoredSettings, formatUtils) : null
        };
    }
    async getAcceptResult(resourcePreview, resource, content, token) {
        const formattingOptions = await this.getFormattingOptions();
        const ignoredSettings = await this.getIgnoredSettings();
        if (this.extUri.isEqual(resource, this.localResource)) {
            return {
                content: resourcePreview.fileContent ? updateIgnoredSettings(resourcePreview.fileContent.value.toString(), '{}', ignoredSettings, formattingOptions) : null,
                localChange: 0,
                remoteChange: 2,
            };
        }
        if (this.extUri.isEqual(resource, this.remoteResource)) {
            return {
                content: resourcePreview.remoteContent !== null ? updateIgnoredSettings(resourcePreview.remoteContent, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : '{}', ignoredSettings, formattingOptions) : null,
                localChange: 2,
                remoteChange: 0,
            };
        }
        if (this.extUri.isEqual(resource, this.previewResource)) {
            if (content === undefined) {
                return {
                    content: resourcePreview.previewResult.content,
                    localChange: resourcePreview.previewResult.localChange,
                    remoteChange: resourcePreview.previewResult.remoteChange,
                };
            }
            else {
                return {
                    content: content !== null ? updateIgnoredSettings(content, resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : '{}', ignoredSettings, formattingOptions) : null,
                    localChange: 2,
                    remoteChange: 2,
                };
            }
        }
        throw new Error(`Invalid Resource: ${resource.toString()}`);
    }
    async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
        const { fileContent } = resourcePreviews[0][0];
        let { content, localChange, remoteChange } = resourcePreviews[0][1];
        if (localChange === 0 && remoteChange === 0) {
            this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing settings.`);
        }
        content = content ? content.trim() : '{}';
        content = content || '{}';
        this.validateContent(content);
        if (localChange !== 0) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating local settings...`);
            if (fileContent) {
                await this.backupLocal(JSON.stringify(this.toSettingsSyncContent(fileContent.value.toString())));
            }
            await this.updateLocalFileContent(content, fileContent, force);
            await this.configurationService.reloadConfiguration(3);
            this.logService.info(`${this.syncResourceLogLabel}: Updated local settings`);
        }
        if (remoteChange !== 0) {
            const formatUtils = await this.getFormattingOptions();
            const remoteSettingsSyncContent = this.getSettingsSyncContent(remoteUserData);
            const ignoredSettings = await this.getIgnoredSettings(content);
            content = updateIgnoredSettings(content, remoteSettingsSyncContent ? remoteSettingsSyncContent.settings : '{}', ignoredSettings, formatUtils);
            this.logService.trace(`${this.syncResourceLogLabel}: Updating remote settings...`);
            remoteUserData = await this.updateRemoteUserData(JSON.stringify(this.toSettingsSyncContent(content)), force ? null : remoteUserData.ref);
            this.logService.info(`${this.syncResourceLogLabel}: Updated remote settings`);
        }
        try {
            await this.fileService.del(this.previewResource);
        }
        catch (e) { }
        if (lastSyncUserData?.ref !== remoteUserData.ref) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized settings...`);
            await this.updateLastSyncUserData(remoteUserData);
            this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized settings`);
        }
    }
    async hasLocalData() {
        try {
            const localFileContent = await this.getLocalFileContent();
            if (localFileContent) {
                return !isEmpty(localFileContent.value.toString());
            }
        }
        catch (error) {
            if (error.fileOperationResult !== 1) {
                return true;
            }
        }
        return false;
    }
    async resolveContent(uri) {
        if (this.extUri.isEqual(this.remoteResource, uri)
            || this.extUri.isEqual(this.localResource, uri)
            || this.extUri.isEqual(this.acceptedResource, uri)
            || this.extUri.isEqual(this.baseResource, uri)) {
            return this.resolvePreviewContent(uri);
        }
        return null;
    }
    async resolvePreviewContent(resource) {
        let content = await super.resolvePreviewContent(resource);
        if (content) {
            const formatUtils = await this.getFormattingOptions();
            const ignoredSettings = await this.getIgnoredSettings();
            content = updateIgnoredSettings(content, '{}', ignoredSettings, formatUtils);
        }
        return content;
    }
    getSettingsSyncContent(remoteUserData) {
        return remoteUserData.syncData ? this.parseSettingsSyncContent(remoteUserData.syncData.content) : null;
    }
    parseSettingsSyncContent(syncContent) {
        try {
            return parseSettingsSyncContent(syncContent);
        }
        catch (e) {
            this.logService.error(e);
        }
        return null;
    }
    toSettingsSyncContent(settings) {
        return { settings };
    }
    async getIgnoredSettings(content) {
        if (!this.coreIgnoredSettings) {
            this.coreIgnoredSettings = this.userDataSyncUtilService.resolveDefaultCoreIgnoredSettings();
        }
        if (!this.systemExtensionsIgnoredSettings) {
            this.systemExtensionsIgnoredSettings = this.getIgnoredSettingForSystemExtensions();
        }
        if (!this.userExtensionsIgnoredSettings) {
            this.userExtensionsIgnoredSettings = this.getIgnoredSettingForUserExtensions();
            const disposable = this._register(Event.any(Event.filter(this.extensionManagementService.onDidInstallExtensions, (e => e.some(({ local }) => !!local))), Event.filter(this.extensionManagementService.onDidUninstallExtension, (e => !e.error)))(() => {
                disposable.dispose();
                this.userExtensionsIgnoredSettings = undefined;
            }));
        }
        const defaultIgnoredSettings = (await Promise.all([this.coreIgnoredSettings, this.systemExtensionsIgnoredSettings, this.userExtensionsIgnoredSettings])).flat();
        return getIgnoredSettings(defaultIgnoredSettings, this.configurationService, content);
    }
    async getIgnoredSettingForSystemExtensions() {
        const systemExtensions = await this.extensionManagementService.getInstalled(0);
        return distinct(systemExtensions.map(e => getIgnoredSettingsForExtension(e.manifest)).flat());
    }
    async getIgnoredSettingForUserExtensions() {
        const userExtensions = await this.extensionManagementService.getInstalled(1, this.profile.extensionsResource);
        return distinct(userExtensions.map(e => getIgnoredSettingsForExtension(e.manifest)).flat());
    }
    validateContent(content) {
        if (this.hasErrors(content, false)) {
            throw new UserDataSyncError(localize('errorInvalidSettings', "Unable to sync settings as there are errors/warning in settings file."), "LocalInvalidContent", this.resource);
        }
    }
};
SettingsSynchroniser = __decorate([
    __param(2, IFileService),
    __param(3, IEnvironmentService),
    __param(4, IStorageService),
    __param(5, IUserDataSyncStoreService),
    __param(6, IUserDataSyncLocalStoreService),
    __param(7, IUserDataSyncLogService),
    __param(8, IUserDataSyncUtilService),
    __param(9, IConfigurationService),
    __param(10, IUserDataSyncEnablementService),
    __param(11, ITelemetryService),
    __param(12, IExtensionManagementService),
    __param(13, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], SettingsSynchroniser);
export { SettingsSynchroniser };
let SettingsInitializer = class SettingsInitializer extends AbstractInitializer {
    constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
        super("settings", userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
    }
    async doInitialize(remoteUserData) {
        const settingsSyncContent = remoteUserData.syncData ? this.parseSettingsSyncContent(remoteUserData.syncData.content) : null;
        if (!settingsSyncContent) {
            this.logService.info('Skipping initializing settings because remote settings does not exist.');
            return;
        }
        const isEmpty = await this.isEmpty();
        if (!isEmpty) {
            this.logService.info('Skipping initializing settings because local settings exist.');
            return;
        }
        await this.fileService.writeFile(this.userDataProfilesService.defaultProfile.settingsResource, VSBuffer.fromString(settingsSyncContent.settings));
        await this.updateLastSyncUserData(remoteUserData);
    }
    async isEmpty() {
        try {
            const fileContent = await this.fileService.readFile(this.userDataProfilesService.defaultProfile.settingsResource);
            return isEmpty(fileContent.value.toString().trim());
        }
        catch (error) {
            return error.fileOperationResult === 1;
        }
    }
    parseSettingsSyncContent(syncContent) {
        try {
            return parseSettingsSyncContent(syncContent);
        }
        catch (e) {
            this.logService.error(e);
        }
        return null;
    }
};
SettingsInitializer = __decorate([
    __param(0, IFileService),
    __param(1, IUserDataProfilesService),
    __param(2, IEnvironmentService),
    __param(3, IUserDataSyncLogService),
    __param(4, IStorageService),
    __param(5, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], SettingsInitializer);
export { SettingsInitializer };
