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
import { VSBuffer } from '../../../base/common/buffer.js';
import { getErrorMessage } from '../../../base/common/errors.js';
import { Event } from '../../../base/common/event.js';
import { parse } from '../../../base/common/json.js';
import { toFormattedString } from '../../../base/common/jsonFormatter.js';
import { isWeb } from '../../../base/common/platform.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { getServiceMachineId } from '../../externalServices/common/serviceMachineId.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { AbstractInitializer, AbstractSynchroniser, getSyncResourceLogLabel, isSyncData } from './abstractSynchronizer.js';
import { edit } from './content.js';
import { merge } from './globalStateMerge.js';
import { ALL_SYNC_RESOURCES, createSyncHeaders, getEnablementKey, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, SYNC_SERVICE_URL_TYPE, UserDataSyncError, USER_DATA_SYNC_SCHEME } from './userDataSync.js';
import { UserDataSyncStoreClient } from './userDataSyncStoreService.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataProfileStorageService } from '../../userDataProfile/common/userDataProfileStorageService.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
const argvStoragePrefx = 'globalState.argv.';
const argvProperties = ['locale'];
export function stringify(globalState, format) {
    const storageKeys = globalState.storage ? Object.keys(globalState.storage).sort() : [];
    const storage = {};
    storageKeys.forEach(key => storage[key] = globalState.storage[key]);
    globalState.storage = storage;
    return format ? toFormattedString(globalState, {}) : JSON.stringify(globalState);
}
const GLOBAL_STATE_DATA_VERSION = 1;
/**
 * Synchronises global state that includes
 * 	- Global storage with user scope
 * 	- Locale from argv properties
 *
 * Global storage is synced without checking version just like other resources (settings, keybindings).
 * If there is a change in format of the value of a storage key which requires migration then
 * 		Owner of that key should remove that key from user scope and replace that with new user scoped key.
 */
let GlobalStateSynchroniser = class GlobalStateSynchroniser extends AbstractSynchroniser {
    constructor(profile, collection, userDataProfileStorageService, fileService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, environmentService, userDataSyncEnablementService, telemetryService, configurationService, storageService, uriIdentityService, instantiationService) {
        super({ syncResource: "globalState" /* SyncResource.GlobalState */, profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
        this.userDataProfileStorageService = userDataProfileStorageService;
        this.version = GLOBAL_STATE_DATA_VERSION;
        this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'globalState.json');
        this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' });
        this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' });
        this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' });
        this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' });
        this.localGlobalStateProvider = instantiationService.createInstance(LocalGlobalStateProvider);
        this._register(fileService.watch(this.extUri.dirname(this.environmentService.argvResource)));
        this._register(Event.any(
        /* Locale change */
        Event.filter(fileService.onDidFilesChange, e => e.contains(this.environmentService.argvResource)), Event.filter(userDataProfileStorageService.onDidChange, e => {
            /* StorageTarget has changed in profile storage */
            if (e.targetChanges.some(profile => this.syncResource.profile.id === profile.id)) {
                return true;
            }
            /* User storage data has changed in profile storage */
            if (e.valueChanges.some(({ profile, changes }) => this.syncResource.profile.id === profile.id && changes.some(change => change.target === 0 /* StorageTarget.USER */))) {
                return true;
            }
            return false;
        }))((() => this.triggerLocalChange())));
    }
    async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
        const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
        // Use remote data as last sync data if last sync data does not exist and remote data is from same machine
        lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
        const lastSyncGlobalState = lastSyncUserData && lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
        const localGlobalState = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
        if (remoteGlobalState) {
            this.logService.trace(`${this.syncResourceLogLabel}: Merging remote ui state with local ui state...`);
        }
        else {
            this.logService.trace(`${this.syncResourceLogLabel}: Remote ui state does not exist. Synchronizing ui state for the first time.`);
        }
        const storageKeys = await this.getStorageKeys(lastSyncGlobalState);
        const { local, remote } = merge(localGlobalState.storage, remoteGlobalState ? remoteGlobalState.storage : null, lastSyncGlobalState ? lastSyncGlobalState.storage : null, storageKeys, this.logService);
        const previewResult = {
            content: null,
            local,
            remote,
            localChange: Object.keys(local.added).length > 0 || Object.keys(local.updated).length > 0 || local.removed.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
            remoteChange: remote.all !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
        };
        const localContent = stringify(localGlobalState, false);
        return [{
                baseResource: this.baseResource,
                baseContent: lastSyncGlobalState ? stringify(lastSyncGlobalState, false) : localContent,
                localResource: this.localResource,
                localContent,
                localUserData: localGlobalState,
                remoteResource: this.remoteResource,
                remoteContent: remoteGlobalState ? stringify(remoteGlobalState, false) : null,
                previewResource: this.previewResource,
                previewResult,
                localChange: previewResult.localChange,
                remoteChange: previewResult.remoteChange,
                acceptedResource: this.acceptedResource,
                storageKeys
            }];
    }
    async hasRemoteChanged(lastSyncUserData) {
        const lastSyncGlobalState = lastSyncUserData.syncData ? JSON.parse(lastSyncUserData.syncData.content) : null;
        if (lastSyncGlobalState === null) {
            return true;
        }
        const localGlobalState = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
        const storageKeys = await this.getStorageKeys(lastSyncGlobalState);
        const { remote } = merge(localGlobalState.storage, lastSyncGlobalState.storage, lastSyncGlobalState.storage, storageKeys, this.logService);
        return remote.all !== null;
    }
    async getMergeResult(resourcePreview, token) {
        return { ...resourcePreview.previewResult, hasConflicts: false };
    }
    async getAcceptResult(resourcePreview, resource, content, token) {
        /* Accept local resource */
        if (this.extUri.isEqual(resource, this.localResource)) {
            return this.acceptLocal(resourcePreview);
        }
        /* Accept remote resource */
        if (this.extUri.isEqual(resource, this.remoteResource)) {
            return this.acceptRemote(resourcePreview);
        }
        /* Accept preview resource */
        if (this.extUri.isEqual(resource, this.previewResource)) {
            return resourcePreview.previewResult;
        }
        throw new Error(`Invalid Resource: ${resource.toString()}`);
    }
    async acceptLocal(resourcePreview) {
        return {
            content: resourcePreview.localContent,
            local: { added: {}, removed: [], updated: {} },
            remote: { added: Object.keys(resourcePreview.localUserData.storage), removed: [], updated: [], all: resourcePreview.localUserData.storage },
            localChange: 0 /* Change.None */,
            remoteChange: 2 /* Change.Modified */,
        };
    }
    async acceptRemote(resourcePreview) {
        if (resourcePreview.remoteContent !== null) {
            const remoteGlobalState = JSON.parse(resourcePreview.remoteContent);
            const { local, remote } = merge(resourcePreview.localUserData.storage, remoteGlobalState.storage, null, resourcePreview.storageKeys, this.logService);
            return {
                content: resourcePreview.remoteContent,
                local,
                remote,
                localChange: Object.keys(local.added).length > 0 || Object.keys(local.updated).length > 0 || local.removed.length > 0 ? 2 /* Change.Modified */ : 0 /* Change.None */,
                remoteChange: remote !== null ? 2 /* Change.Modified */ : 0 /* Change.None */,
            };
        }
        else {
            return {
                content: resourcePreview.remoteContent,
                local: { added: {}, removed: [], updated: {} },
                remote: { added: [], removed: [], updated: [], all: null },
                localChange: 0 /* Change.None */,
                remoteChange: 0 /* Change.None */,
            };
        }
    }
    async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
        const { localUserData } = resourcePreviews[0][0];
        const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
        if (localChange === 0 /* Change.None */ && remoteChange === 0 /* Change.None */) {
            this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing ui state.`);
        }
        if (localChange !== 0 /* Change.None */) {
            // update local
            this.logService.trace(`${this.syncResourceLogLabel}: Updating local ui state...`);
            await this.backupLocal(JSON.stringify(localUserData));
            await this.localGlobalStateProvider.writeLocalGlobalState(local, this.syncResource.profile);
            this.logService.info(`${this.syncResourceLogLabel}: Updated local ui state`);
        }
        if (remoteChange !== 0 /* Change.None */) {
            // update remote
            this.logService.trace(`${this.syncResourceLogLabel}: Updating remote ui state...`);
            const content = JSON.stringify({ storage: remote.all });
            remoteUserData = await this.updateRemoteUserData(content, force ? null : remoteUserData.ref);
            this.logService.info(`${this.syncResourceLogLabel}: Updated remote ui state.${remote.added.length ? ` Added: ${remote.added}.` : ''}${remote.updated.length ? ` Updated: ${remote.updated}.` : ''}${remote.removed.length ? ` Removed: ${remote.removed}.` : ''}`);
        }
        if (lastSyncUserData?.ref !== remoteUserData.ref) {
            // update last sync
            this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized ui state...`);
            await this.updateLastSyncUserData(remoteUserData);
            this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized ui state`);
        }
    }
    async resolveContent(uri) {
        if (this.extUri.isEqual(this.remoteResource, uri)
            || this.extUri.isEqual(this.baseResource, uri)
            || this.extUri.isEqual(this.localResource, uri)
            || this.extUri.isEqual(this.acceptedResource, uri)) {
            const content = await this.resolvePreviewContent(uri);
            return content ? stringify(JSON.parse(content), true) : content;
        }
        return null;
    }
    async hasLocalData() {
        try {
            const { storage } = await this.localGlobalStateProvider.getLocalGlobalState(this.syncResource.profile);
            if (Object.keys(storage).length > 1 || storage[`${argvStoragePrefx}.locale`]?.value !== 'en') {
                return true;
            }
        }
        catch (error) {
            /* ignore error */
        }
        return false;
    }
    async getStorageKeys(lastSyncGlobalState) {
        const storageData = await this.userDataProfileStorageService.readStorageData(this.syncResource.profile);
        const user = [], machine = [];
        for (const [key, value] of storageData) {
            if (value.target === 0 /* StorageTarget.USER */) {
                user.push(key);
            }
            else if (value.target === 1 /* StorageTarget.MACHINE */) {
                machine.push(key);
            }
        }
        const registered = [...user, ...machine];
        const unregistered = lastSyncGlobalState?.storage ? Object.keys(lastSyncGlobalState.storage).filter(key => !key.startsWith(argvStoragePrefx) && !registered.includes(key) && storageData.get(key) !== undefined) : [];
        if (!isWeb) {
            // Following keys are synced only in web. Do not sync these keys in other platforms
            const keysSyncedOnlyInWeb = [...ALL_SYNC_RESOURCES.map(resource => getEnablementKey(resource)), SYNC_SERVICE_URL_TYPE];
            unregistered.push(...keysSyncedOnlyInWeb);
            machine.push(...keysSyncedOnlyInWeb);
        }
        return { user, machine, unregistered };
    }
};
GlobalStateSynchroniser = __decorate([
    __param(2, IUserDataProfileStorageService),
    __param(3, IFileService),
    __param(4, IUserDataSyncStoreService),
    __param(5, IUserDataSyncLocalStoreService),
    __param(6, IUserDataSyncLogService),
    __param(7, IEnvironmentService),
    __param(8, IUserDataSyncEnablementService),
    __param(9, ITelemetryService),
    __param(10, IConfigurationService),
    __param(11, IStorageService),
    __param(12, IUriIdentityService),
    __param(13, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], GlobalStateSynchroniser);
export { GlobalStateSynchroniser };
let LocalGlobalStateProvider = class LocalGlobalStateProvider {
    constructor(fileService, environmentService, userDataProfileStorageService, logService) {
        this.fileService = fileService;
        this.environmentService = environmentService;
        this.userDataProfileStorageService = userDataProfileStorageService;
        this.logService = logService;
    }
    async getLocalGlobalState(profile) {
        const storage = {};
        if (profile.isDefault) {
            const argvContent = await this.getLocalArgvContent();
            const argvValue = parse(argvContent);
            for (const argvProperty of argvProperties) {
                if (argvValue[argvProperty] !== undefined) {
                    storage[`${argvStoragePrefx}${argvProperty}`] = { version: 1, value: argvValue[argvProperty] };
                }
            }
        }
        const storageData = await this.userDataProfileStorageService.readStorageData(profile);
        for (const [key, value] of storageData) {
            if (value.value && value.target === 0 /* StorageTarget.USER */) {
                storage[key] = { version: 1, value: value.value };
            }
        }
        return { storage };
    }
    async getLocalArgvContent() {
        try {
            this.logService.debug('GlobalStateSync#getLocalArgvContent', this.environmentService.argvResource);
            const content = await this.fileService.readFile(this.environmentService.argvResource);
            this.logService.debug('GlobalStateSync#getLocalArgvContent - Resolved', this.environmentService.argvResource);
            return content.value.toString();
        }
        catch (error) {
            this.logService.debug(getErrorMessage(error));
        }
        return '{}';
    }
    async writeLocalGlobalState({ added, removed, updated }, profile) {
        const syncResourceLogLabel = getSyncResourceLogLabel("globalState" /* SyncResource.GlobalState */, profile);
        const argv = {};
        const updatedStorage = new Map();
        const storageData = await this.userDataProfileStorageService.readStorageData(profile);
        const handleUpdatedStorage = (keys, storage) => {
            for (const key of keys) {
                if (key.startsWith(argvStoragePrefx)) {
                    argv[key.substring(argvStoragePrefx.length)] = storage ? storage[key].value : undefined;
                    continue;
                }
                if (storage) {
                    const storageValue = storage[key];
                    if (storageValue.value !== storageData.get(key)?.value) {
                        updatedStorage.set(key, storageValue.value);
                    }
                }
                else {
                    if (storageData.get(key) !== undefined) {
                        updatedStorage.set(key, undefined);
                    }
                }
            }
        };
        handleUpdatedStorage(Object.keys(added), added);
        handleUpdatedStorage(Object.keys(updated), updated);
        handleUpdatedStorage(removed);
        if (Object.keys(argv).length) {
            this.logService.trace(`${syncResourceLogLabel}: Updating locale...`);
            const argvContent = await this.getLocalArgvContent();
            let content = argvContent;
            for (const argvProperty of Object.keys(argv)) {
                content = edit(content, [argvProperty], argv[argvProperty], {});
            }
            if (argvContent !== content) {
                this.logService.trace(`${syncResourceLogLabel}: Updating locale...`);
                await this.fileService.writeFile(this.environmentService.argvResource, VSBuffer.fromString(content));
                this.logService.info(`${syncResourceLogLabel}: Updated locale.`);
            }
            this.logService.info(`${syncResourceLogLabel}: Updated locale`);
        }
        if (updatedStorage.size) {
            this.logService.trace(`${syncResourceLogLabel}: Updating global state...`);
            await this.userDataProfileStorageService.updateStorageData(profile, updatedStorage, 0 /* StorageTarget.USER */);
            this.logService.info(`${syncResourceLogLabel}: Updated global state`, [...updatedStorage.keys()]);
        }
    }
};
LocalGlobalStateProvider = __decorate([
    __param(0, IFileService),
    __param(1, IEnvironmentService),
    __param(2, IUserDataProfileStorageService),
    __param(3, IUserDataSyncLogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], LocalGlobalStateProvider);
export { LocalGlobalStateProvider };
let GlobalStateInitializer = class GlobalStateInitializer extends AbstractInitializer {
    constructor(storageService, fileService, userDataProfilesService, environmentService, logService, uriIdentityService) {
        super("globalState" /* SyncResource.GlobalState */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
    }
    async doInitialize(remoteUserData) {
        const remoteGlobalState = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
        if (!remoteGlobalState) {
            this.logService.info('Skipping initializing global state because remote global state does not exist.');
            return;
        }
        const argv = {};
        const storage = {};
        for (const key of Object.keys(remoteGlobalState.storage)) {
            if (key.startsWith(argvStoragePrefx)) {
                argv[key.substring(argvStoragePrefx.length)] = remoteGlobalState.storage[key].value;
            }
            else {
                if (this.storageService.get(key, 0 /* StorageScope.PROFILE */) === undefined) {
                    storage[key] = remoteGlobalState.storage[key].value;
                }
            }
        }
        if (Object.keys(argv).length) {
            let content = '{}';
            try {
                const fileContent = await this.fileService.readFile(this.environmentService.argvResource);
                content = fileContent.value.toString();
            }
            catch (error) { }
            for (const argvProperty of Object.keys(argv)) {
                content = edit(content, [argvProperty], argv[argvProperty], {});
            }
            await this.fileService.writeFile(this.environmentService.argvResource, VSBuffer.fromString(content));
        }
        if (Object.keys(storage).length) {
            const storageEntries = [];
            for (const key of Object.keys(storage)) {
                storageEntries.push({ key, value: storage[key], scope: 0 /* StorageScope.PROFILE */, target: 0 /* StorageTarget.USER */ });
            }
            this.storageService.storeAll(storageEntries, true);
        }
    }
};
GlobalStateInitializer = __decorate([
    __param(0, IStorageService),
    __param(1, IFileService),
    __param(2, IUserDataProfilesService),
    __param(3, IEnvironmentService),
    __param(4, IUserDataSyncLogService),
    __param(5, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], GlobalStateInitializer);
export { GlobalStateInitializer };
let UserDataSyncStoreTypeSynchronizer = class UserDataSyncStoreTypeSynchronizer {
    constructor(userDataSyncStoreClient, storageService, environmentService, fileService, logService) {
        this.userDataSyncStoreClient = userDataSyncStoreClient;
        this.storageService = storageService;
        this.environmentService = environmentService;
        this.fileService = fileService;
        this.logService = logService;
    }
    getSyncStoreType(userData) {
        const remoteGlobalState = this.parseGlobalState(userData);
        return remoteGlobalState?.storage[SYNC_SERVICE_URL_TYPE]?.value;
    }
    async sync(userDataSyncStoreType) {
        const syncHeaders = createSyncHeaders(generateUuid());
        try {
            return await this.doSync(userDataSyncStoreType, syncHeaders);
        }
        catch (e) {
            if (e instanceof UserDataSyncError) {
                switch (e.code) {
                    case "PreconditionFailed" /* UserDataSyncErrorCode.PreconditionFailed */:
                        this.logService.info(`Failed to synchronize UserDataSyncStoreType as there is a new remote version available. Synchronizing again...`);
                        return this.doSync(userDataSyncStoreType, syncHeaders);
                }
            }
            throw e;
        }
    }
    async doSync(userDataSyncStoreType, syncHeaders) {
        // Read the global state from remote
        const globalStateUserData = await this.userDataSyncStoreClient.readResource("globalState" /* SyncResource.GlobalState */, null, undefined, syncHeaders);
        const remoteGlobalState = this.parseGlobalState(globalStateUserData) || { storage: {} };
        // Update the sync store type
        remoteGlobalState.storage[SYNC_SERVICE_URL_TYPE] = { value: userDataSyncStoreType, version: GLOBAL_STATE_DATA_VERSION };
        // Write the global state to remote
        const machineId = await getServiceMachineId(this.environmentService, this.fileService, this.storageService);
        const syncDataToUpdate = { version: GLOBAL_STATE_DATA_VERSION, machineId, content: stringify(remoteGlobalState, false) };
        await this.userDataSyncStoreClient.writeResource("globalState" /* SyncResource.GlobalState */, JSON.stringify(syncDataToUpdate), globalStateUserData.ref, undefined, syncHeaders);
    }
    parseGlobalState({ content }) {
        if (!content) {
            return null;
        }
        const syncData = JSON.parse(content);
        if (isSyncData(syncData)) {
            return syncData ? JSON.parse(syncData.content) : null;
        }
        throw new Error('Invalid remote data');
    }
};
UserDataSyncStoreTypeSynchronizer = __decorate([
    __param(1, IStorageService),
    __param(2, IEnvironmentService),
    __param(3, IFileService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [UserDataSyncStoreClient, Object, Object, Object, Object])
], UserDataSyncStoreTypeSynchronizer);
export { UserDataSyncStoreTypeSynchronizer };
