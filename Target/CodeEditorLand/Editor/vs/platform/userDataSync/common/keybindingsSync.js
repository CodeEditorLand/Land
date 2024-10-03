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
import { isNonEmptyArray } from '../../../base/common/arrays.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { Event } from '../../../base/common/event.js';
import { parse } from '../../../base/common/json.js';
import { OS } from '../../../base/common/platform.js';
import { isUndefined } from '../../../base/common/types.js';
import { localize } from '../../../nls.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractInitializer, AbstractJsonFileSynchroniser } from './abstractSynchronizer.js';
import { merge } from './keybindingsMerge.js';
import { IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, IUserDataSyncUtilService, UserDataSyncError, USER_DATA_SYNC_SCHEME, CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM } from './userDataSync.js';
export function getKeybindingsContentFromSyncContent(syncContent, platformSpecific, logService) {
    try {
        const parsed = JSON.parse(syncContent);
        if (!platformSpecific) {
            return isUndefined(parsed.all) ? null : parsed.all;
        }
        switch (OS) {
            case 2:
                return isUndefined(parsed.mac) ? null : parsed.mac;
            case 3:
                return isUndefined(parsed.linux) ? null : parsed.linux;
            case 1:
                return isUndefined(parsed.windows) ? null : parsed.windows;
        }
    }
    catch (e) {
        logService.error(e);
        return null;
    }
}
let KeybindingsSynchroniser = class KeybindingsSynchroniser extends AbstractJsonFileSynchroniser {
    constructor(profile, collection, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, userDataSyncUtilService, telemetryService, uriIdentityService) {
        super(profile.keybindingsResource, { syncResource: "keybindings", profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService);
        this.version = 2;
        this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'keybindings.json');
        this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' });
        this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' });
        this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' });
        this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' });
        this._register(Event.filter(configurationService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.keybindingsPerPlatform'))(() => this.triggerLocalChange()));
    }
    async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration) {
        const remoteContent = remoteUserData.syncData ? getKeybindingsContentFromSyncContent(remoteUserData.syncData.content, userDataSyncConfiguration.keybindingsPerPlatform ?? this.syncKeybindingsPerPlatform(), this.logService) : null;
        lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
        const lastSyncContent = lastSyncUserData ? this.getKeybindingsContentFromLastSyncUserData(lastSyncUserData) : null;
        const fileContent = await this.getLocalFileContent();
        const formattingOptions = await this.getFormattingOptions();
        let mergedContent = null;
        let hasLocalChanged = false;
        let hasRemoteChanged = false;
        let hasConflicts = false;
        if (remoteContent) {
            let localContent = fileContent ? fileContent.value.toString() : '[]';
            localContent = localContent || '[]';
            if (this.hasErrors(localContent, true)) {
                throw new UserDataSyncError(localize('errorInvalidSettings', "Unable to sync keybindings because the content in the file is not valid. Please open the file and correct it."), "LocalInvalidContent", this.resource);
            }
            if (!lastSyncContent
                || lastSyncContent !== localContent
                || lastSyncContent !== remoteContent) {
                this.logService.trace(`${this.syncResourceLogLabel}: Merging remote keybindings with local keybindings...`);
                const result = await merge(localContent, remoteContent, lastSyncContent, formattingOptions, this.userDataSyncUtilService);
                if (result.hasChanges) {
                    mergedContent = result.mergeContent;
                    hasConflicts = result.hasConflicts;
                    hasLocalChanged = hasConflicts || result.mergeContent !== localContent;
                    hasRemoteChanged = hasConflicts || result.mergeContent !== remoteContent;
                }
            }
        }
        else if (fileContent) {
            this.logService.trace(`${this.syncResourceLogLabel}: Remote keybindings does not exist. Synchronizing keybindings for the first time.`);
            mergedContent = fileContent.value.toString();
            hasRemoteChanged = true;
        }
        const previewResult = {
            content: hasConflicts ? lastSyncContent : mergedContent,
            localChange: hasLocalChanged ? fileContent ? 2 : 1 : 0,
            remoteChange: hasRemoteChanged ? 2 : 0,
            hasConflicts
        };
        const localContent = fileContent ? fileContent.value.toString() : null;
        return [{
                fileContent,
                baseResource: this.baseResource,
                baseContent: lastSyncContent,
                localResource: this.localResource,
                localContent,
                localChange: previewResult.localChange,
                remoteResource: this.remoteResource,
                remoteContent,
                remoteChange: previewResult.remoteChange,
                previewResource: this.previewResource,
                previewResult,
                acceptedResource: this.acceptedResource,
            }];
    }
    async hasRemoteChanged(lastSyncUserData) {
        const lastSyncContent = this.getKeybindingsContentFromLastSyncUserData(lastSyncUserData);
        if (lastSyncContent === null) {
            return true;
        }
        const fileContent = await this.getLocalFileContent();
        const localContent = fileContent ? fileContent.value.toString() : '';
        const formattingOptions = await this.getFormattingOptions();
        const result = await merge(localContent || '[]', lastSyncContent, lastSyncContent, formattingOptions, this.userDataSyncUtilService);
        return result.hasConflicts || result.mergeContent !== lastSyncContent;
    }
    async getMergeResult(resourcePreview, token) {
        return resourcePreview.previewResult;
    }
    async getAcceptResult(resourcePreview, resource, content, token) {
        if (this.extUri.isEqual(resource, this.localResource)) {
            return {
                content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
                localChange: 0,
                remoteChange: 2,
            };
        }
        if (this.extUri.isEqual(resource, this.remoteResource)) {
            return {
                content: resourcePreview.remoteContent,
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
                    content,
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
            this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing keybindings.`);
        }
        if (content !== null) {
            content = content.trim();
            content = content || '[]';
            if (this.hasErrors(content, true)) {
                throw new UserDataSyncError(localize('errorInvalidSettings', "Unable to sync keybindings because the content in the file is not valid. Please open the file and correct it."), "LocalInvalidContent", this.resource);
            }
        }
        if (localChange !== 0) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating local keybindings...`);
            if (fileContent) {
                await this.backupLocal(this.toSyncContent(fileContent.value.toString()));
            }
            await this.updateLocalFileContent(content || '[]', fileContent, force);
            this.logService.info(`${this.syncResourceLogLabel}: Updated local keybindings`);
        }
        if (remoteChange !== 0) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating remote keybindings...`);
            const remoteContents = this.toSyncContent(content || '[]', remoteUserData.syncData?.content);
            remoteUserData = await this.updateRemoteUserData(remoteContents, force ? null : remoteUserData.ref);
            this.logService.info(`${this.syncResourceLogLabel}: Updated remote keybindings`);
        }
        try {
            await this.fileService.del(this.previewResource);
        }
        catch (e) { }
        if (lastSyncUserData?.ref !== remoteUserData.ref) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized keybindings...`);
            await this.updateLastSyncUserData(remoteUserData, { platformSpecific: this.syncKeybindingsPerPlatform() });
            this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized keybindings`);
        }
    }
    async hasLocalData() {
        try {
            const localFileContent = await this.getLocalFileContent();
            if (localFileContent) {
                const keybindings = parse(localFileContent.value.toString());
                if (isNonEmptyArray(keybindings)) {
                    return true;
                }
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
            || this.extUri.isEqual(this.baseResource, uri)
            || this.extUri.isEqual(this.localResource, uri)
            || this.extUri.isEqual(this.acceptedResource, uri)) {
            return this.resolvePreviewContent(uri);
        }
        return null;
    }
    getKeybindingsContentFromLastSyncUserData(lastSyncUserData) {
        if (!lastSyncUserData.syncData) {
            return null;
        }
        if (lastSyncUserData.platformSpecific !== undefined && lastSyncUserData.platformSpecific !== this.syncKeybindingsPerPlatform()) {
            return null;
        }
        return getKeybindingsContentFromSyncContent(lastSyncUserData.syncData.content, this.syncKeybindingsPerPlatform(), this.logService);
    }
    toSyncContent(keybindingsContent, syncContent) {
        let parsed = {};
        try {
            parsed = JSON.parse(syncContent || '{}');
        }
        catch (e) {
            this.logService.error(e);
        }
        if (this.syncKeybindingsPerPlatform()) {
            delete parsed.all;
        }
        else {
            parsed.all = keybindingsContent;
        }
        switch (OS) {
            case 2:
                parsed.mac = keybindingsContent;
                break;
            case 3:
                parsed.linux = keybindingsContent;
                break;
            case 1:
                parsed.windows = keybindingsContent;
                break;
        }
        return JSON.stringify(parsed);
    }
    syncKeybindingsPerPlatform() {
        return !!this.configurationService.getValue(CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM);
    }
};
KeybindingsSynchroniser = __decorate([
    __param(2, IUserDataSyncStoreService),
    __param(3, IUserDataSyncLocalStoreService),
    __param(4, IUserDataSyncLogService),
    __param(5, IConfigurationService),
    __param(6, IUserDataSyncEnablementService),
    __param(7, IFileService),
    __param(8, IEnvironmentService),
    __param(9, IStorageService),
    __param(10, IUserDataSyncUtilService),
    __param(11, ITelemetryService),
    __param(12, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], KeybindingsSynchroniser);
export { KeybindingsSynchroniser };
let KeybindingsInitializer = class KeybindingsInitializer extends AbstractInitializer {
    constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
        super("keybindings", userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
    }
    async doInitialize(remoteUserData) {
        const keybindingsContent = remoteUserData.syncData ? this.getKeybindingsContentFromSyncContent(remoteUserData.syncData.content) : null;
        if (!keybindingsContent) {
            this.logService.info('Skipping initializing keybindings because remote keybindings does not exist.');
            return;
        }
        const isEmpty = await this.isEmpty();
        if (!isEmpty) {
            this.logService.info('Skipping initializing keybindings because local keybindings exist.');
            return;
        }
        await this.fileService.writeFile(this.userDataProfilesService.defaultProfile.keybindingsResource, VSBuffer.fromString(keybindingsContent));
        await this.updateLastSyncUserData(remoteUserData);
    }
    async isEmpty() {
        try {
            const fileContent = await this.fileService.readFile(this.userDataProfilesService.defaultProfile.settingsResource);
            const keybindings = parse(fileContent.value.toString());
            return !isNonEmptyArray(keybindings);
        }
        catch (error) {
            return error.fileOperationResult === 1;
        }
    }
    getKeybindingsContentFromSyncContent(syncContent) {
        try {
            return getKeybindingsContentFromSyncContent(syncContent, true, this.logService);
        }
        catch (e) {
            this.logService.error(e);
            return null;
        }
    }
};
KeybindingsInitializer = __decorate([
    __param(0, IFileService),
    __param(1, IUserDataProfilesService),
    __param(2, IEnvironmentService),
    __param(3, IUserDataSyncLogService),
    __param(4, IStorageService),
    __param(5, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], KeybindingsInitializer);
export { KeybindingsInitializer };
