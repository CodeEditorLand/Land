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
import { equals } from '../../../base/common/arrays.js';
import { createCancelablePromise, RunOnceScheduler } from '../../../base/common/async.js';
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../base/common/errorMessage.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { isEqual } from '../../../base/common/resources.js';
import { isBoolean, isUndefined } from '../../../base/common/types.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IExtensionGalleryService } from '../../extensionManagement/common/extensionManagement.js';
import { IFileService } from '../../files/common/files.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { ExtensionsSynchroniser } from './extensionsSync.js';
import { GlobalStateSynchroniser } from './globalStateSync.js';
import { KeybindingsSynchroniser } from './keybindingsSync.js';
import { SettingsSynchroniser } from './settingsSync.js';
import { SnippetsSynchroniser } from './snippetsSync.js';
import { TasksSynchroniser } from './tasksSync.js';
import { UserDataProfilesManifestSynchroniser } from './userDataProfilesManifestSync.js';
import { ALL_SYNC_RESOURCES, createSyncHeaders, IUserDataSyncEnablementService, IUserDataSyncLogService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService, UserDataSyncError, UserDataSyncStoreError, USER_DATA_SYNC_CONFIGURATION_SCOPE, IUserDataSyncResourceProviderService, IUserDataSyncLocalStoreService } from './userDataSync.js';
const LAST_SYNC_TIME_KEY = 'sync.lastSyncTime';
let UserDataSyncService = class UserDataSyncService extends Disposable {
    get status() { return this._status; }
    get conflicts() { return this._conflicts; }
    get lastSyncTime() { return this._lastSyncTime; }
    constructor(fileService, userDataSyncStoreService, userDataSyncStoreManagementService, instantiationService, logService, telemetryService, storageService, userDataSyncEnablementService, userDataProfilesService, userDataSyncResourceProviderService, userDataSyncLocalStoreService) {
        super();
        this.fileService = fileService;
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this.instantiationService = instantiationService;
        this.logService = logService;
        this.telemetryService = telemetryService;
        this.storageService = storageService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.userDataProfilesService = userDataProfilesService;
        this.userDataSyncResourceProviderService = userDataSyncResourceProviderService;
        this.userDataSyncLocalStoreService = userDataSyncLocalStoreService;
        this._status = "uninitialized";
        this._onDidChangeStatus = this._register(new Emitter());
        this.onDidChangeStatus = this._onDidChangeStatus.event;
        this._onDidChangeLocal = this._register(new Emitter());
        this.onDidChangeLocal = this._onDidChangeLocal.event;
        this._conflicts = [];
        this._onDidChangeConflicts = this._register(new Emitter());
        this.onDidChangeConflicts = this._onDidChangeConflicts.event;
        this._syncErrors = [];
        this._onSyncErrors = this._register(new Emitter());
        this.onSyncErrors = this._onSyncErrors.event;
        this._lastSyncTime = undefined;
        this._onDidChangeLastSyncTime = this._register(new Emitter());
        this.onDidChangeLastSyncTime = this._onDidChangeLastSyncTime.event;
        this._onDidResetLocal = this._register(new Emitter());
        this.onDidResetLocal = this._onDidResetLocal.event;
        this._onDidResetRemote = this._register(new Emitter());
        this.onDidResetRemote = this._onDidResetRemote.event;
        this.activeProfileSynchronizers = new Map();
        this._status = userDataSyncStoreManagementService.userDataSyncStore ? "idle" : "uninitialized";
        this._lastSyncTime = this.storageService.getNumber(LAST_SYNC_TIME_KEY, -1, undefined);
        this._register(toDisposable(() => this.clearActiveProfileSynchronizers()));
        this._register(new RunOnceScheduler(() => this.cleanUpStaleStorageData(), 5 * 1000)).schedule();
    }
    async createSyncTask(manifest, disableCache) {
        this.checkEnablement();
        this.logService.info('Sync started.');
        const startTime = new Date().getTime();
        const executionId = generateUuid();
        try {
            const syncHeaders = createSyncHeaders(executionId);
            if (disableCache) {
                syncHeaders['Cache-Control'] = 'no-cache';
            }
            manifest = await this.userDataSyncStoreService.manifest(manifest, syncHeaders);
        }
        catch (error) {
            const userDataSyncError = UserDataSyncError.toUserDataSyncError(error);
            reportUserDataSyncError(userDataSyncError, executionId, this.userDataSyncStoreManagementService, this.telemetryService);
            throw userDataSyncError;
        }
        const executed = false;
        const that = this;
        let cancellablePromise;
        return {
            manifest,
            async run() {
                if (executed) {
                    throw new Error('Can run a task only once');
                }
                cancellablePromise = createCancelablePromise(token => that.sync(manifest, false, executionId, token));
                await cancellablePromise.finally(() => cancellablePromise = undefined);
                that.logService.info(`Sync done. Took ${new Date().getTime() - startTime}ms`);
                that.updateLastSyncTime();
            },
            stop() {
                cancellablePromise?.cancel();
                return that.stop();
            }
        };
    }
    async createManualSyncTask() {
        this.checkEnablement();
        if (this.userDataSyncEnablementService.isEnabled()) {
            throw new UserDataSyncError('Cannot start manual sync when sync is enabled', "LocalError");
        }
        this.logService.info('Sync started.');
        const startTime = new Date().getTime();
        const executionId = generateUuid();
        const syncHeaders = createSyncHeaders(executionId);
        let manifest;
        try {
            manifest = await this.userDataSyncStoreService.manifest(null, syncHeaders);
        }
        catch (error) {
            const userDataSyncError = UserDataSyncError.toUserDataSyncError(error);
            reportUserDataSyncError(userDataSyncError, executionId, this.userDataSyncStoreManagementService, this.telemetryService);
            throw userDataSyncError;
        }
        await this.resetLocal();
        const that = this;
        const cancellableToken = new CancellationTokenSource();
        return {
            id: executionId,
            async merge() {
                return that.sync(manifest, true, executionId, cancellableToken.token);
            },
            async apply() {
                try {
                    try {
                        await that.applyManualSync(manifest, executionId, cancellableToken.token);
                    }
                    catch (error) {
                        if (UserDataSyncError.toUserDataSyncError(error).code === "MethodNotFound") {
                            that.logService.info('Client is making invalid requests. Cleaning up data...');
                            await that.cleanUpRemoteData();
                            that.logService.info('Applying manual sync again...');
                            await that.applyManualSync(manifest, executionId, cancellableToken.token);
                        }
                        else {
                            throw error;
                        }
                    }
                }
                catch (error) {
                    that.logService.error(error);
                    throw error;
                }
                that.logService.info(`Sync done. Took ${new Date().getTime() - startTime}ms`);
                that.updateLastSyncTime();
            },
            async stop() {
                cancellableToken.cancel();
                await that.stop();
                await that.resetLocal();
            }
        };
    }
    async sync(manifest, merge, executionId, token) {
        this._syncErrors = [];
        try {
            if (this.status !== "hasConflicts") {
                this.setStatus("syncing");
            }
            const defaultProfileSynchronizer = this.getOrCreateActiveProfileSynchronizer(this.userDataProfilesService.defaultProfile, undefined);
            this._syncErrors.push(...await this.syncProfile(defaultProfileSynchronizer, manifest, merge, executionId, token));
            const userDataProfileManifestSynchronizer = defaultProfileSynchronizer.enabled.find(s => s.resource === "profiles");
            if (userDataProfileManifestSynchronizer) {
                const syncProfiles = (await userDataProfileManifestSynchronizer.getLastSyncedProfiles()) || [];
                if (token.isCancellationRequested) {
                    return;
                }
                await this.syncRemoteProfiles(syncProfiles, manifest, merge, executionId, token);
            }
        }
        finally {
            if (this.status !== "hasConflicts") {
                this.setStatus("idle");
            }
            this._onSyncErrors.fire(this._syncErrors);
        }
    }
    async syncRemoteProfiles(remoteProfiles, manifest, merge, executionId, token) {
        for (const syncProfile of remoteProfiles) {
            if (token.isCancellationRequested) {
                return;
            }
            const profile = this.userDataProfilesService.profiles.find(p => p.id === syncProfile.id);
            if (!profile) {
                this.logService.error(`Profile with id:${syncProfile.id} and name: ${syncProfile.name} does not exist locally to sync.`);
                continue;
            }
            this.logService.info('Syncing profile.', syncProfile.name);
            const profileSynchronizer = this.getOrCreateActiveProfileSynchronizer(profile, syncProfile);
            this._syncErrors.push(...await this.syncProfile(profileSynchronizer, manifest, merge, executionId, token));
        }
        for (const [key, profileSynchronizerItem] of this.activeProfileSynchronizers.entries()) {
            if (this.userDataProfilesService.profiles.some(p => p.id === profileSynchronizerItem[0].profile.id)) {
                continue;
            }
            await profileSynchronizerItem[0].resetLocal();
            profileSynchronizerItem[1].dispose();
            this.activeProfileSynchronizers.delete(key);
        }
    }
    async applyManualSync(manifest, executionId, token) {
        try {
            this.setStatus("syncing");
            const profileSynchronizers = this.getActiveProfileSynchronizers();
            for (const profileSynchronizer of profileSynchronizers) {
                if (token.isCancellationRequested) {
                    return;
                }
                await profileSynchronizer.apply(executionId, token);
            }
            const defaultProfileSynchronizer = profileSynchronizers.find(s => s.profile.isDefault);
            if (!defaultProfileSynchronizer) {
                return;
            }
            const userDataProfileManifestSynchronizer = defaultProfileSynchronizer.enabled.find(s => s.resource === "profiles");
            if (!userDataProfileManifestSynchronizer) {
                return;
            }
            const remoteProfiles = (await userDataProfileManifestSynchronizer.getRemoteSyncedProfiles(manifest?.latest ?? null)) || [];
            const remoteProfilesToSync = remoteProfiles.filter(remoteProfile => profileSynchronizers.every(s => s.profile.id !== remoteProfile.id));
            if (remoteProfilesToSync.length) {
                await this.syncRemoteProfiles(remoteProfilesToSync, manifest, false, executionId, token);
            }
        }
        finally {
            this.setStatus("idle");
        }
    }
    async syncProfile(profileSynchronizer, manifest, merge, executionId, token) {
        const errors = await profileSynchronizer.sync(manifest, merge, executionId, token);
        return errors.map(([syncResource, error]) => ({ profile: profileSynchronizer.profile, syncResource, error }));
    }
    async stop() {
        if (this.status !== "idle") {
            await Promise.allSettled(this.getActiveProfileSynchronizers().map(profileSynchronizer => profileSynchronizer.stop()));
        }
    }
    async resolveContent(resource) {
        const content = await this.userDataSyncResourceProviderService.resolveContent(resource);
        if (content) {
            return content;
        }
        for (const profileSynchronizer of this.getActiveProfileSynchronizers()) {
            for (const synchronizer of profileSynchronizer.enabled) {
                const content = await synchronizer.resolveContent(resource);
                if (content) {
                    return content;
                }
            }
        }
        return null;
    }
    async replace(syncResourceHandle) {
        this.checkEnablement();
        const profileSyncResource = this.userDataSyncResourceProviderService.resolveUserDataSyncResource(syncResourceHandle);
        if (!profileSyncResource) {
            return;
        }
        const content = await this.resolveContent(syncResourceHandle.uri);
        if (!content) {
            return;
        }
        await this.performAction(profileSyncResource.profile, async (synchronizer) => {
            if (profileSyncResource.syncResource === synchronizer.resource) {
                await synchronizer.replace(content);
                return true;
            }
            return undefined;
        });
        return;
    }
    async accept(syncResource, resource, content, apply) {
        this.checkEnablement();
        await this.performAction(syncResource.profile, async (synchronizer) => {
            if (syncResource.syncResource === synchronizer.resource) {
                await synchronizer.accept(resource, content);
                if (apply) {
                    await synchronizer.apply(isBoolean(apply) ? false : apply.force, createSyncHeaders(generateUuid()));
                }
                return true;
            }
            return undefined;
        });
    }
    async hasLocalData() {
        const result = await this.performAction(this.userDataProfilesService.defaultProfile, async (synchronizer) => {
            if (synchronizer.resource !== "globalState" && await synchronizer.hasLocalData()) {
                return true;
            }
            return undefined;
        });
        return !!result;
    }
    async hasPreviouslySynced() {
        const result = await this.performAction(this.userDataProfilesService.defaultProfile, async (synchronizer) => {
            if (await synchronizer.hasPreviouslySynced()) {
                return true;
            }
            return undefined;
        });
        return !!result;
    }
    async reset() {
        this.checkEnablement();
        await this.resetRemote();
        await this.resetLocal();
    }
    async resetRemote() {
        this.checkEnablement();
        try {
            await this.userDataSyncStoreService.clear();
            this.logService.info('Cleared data on server');
        }
        catch (e) {
            this.logService.error(e);
        }
        this._onDidResetRemote.fire();
    }
    async resetLocal() {
        this.checkEnablement();
        this._lastSyncTime = undefined;
        this.storageService.remove(LAST_SYNC_TIME_KEY, -1);
        for (const [synchronizer] of this.activeProfileSynchronizers.values()) {
            try {
                await synchronizer.resetLocal();
            }
            catch (e) {
                this.logService.error(e);
            }
        }
        this.clearActiveProfileSynchronizers();
        this._onDidResetLocal.fire();
        this.logService.info('Did reset the local sync state.');
    }
    async cleanUpStaleStorageData() {
        const allKeys = this.storageService.keys(-1, 1);
        const lastSyncProfileKeys = [];
        for (const key of allKeys) {
            if (!key.endsWith('.lastSyncUserData')) {
                continue;
            }
            const segments = key.split('.');
            if (segments.length === 3) {
                lastSyncProfileKeys.push([key, segments[0]]);
            }
        }
        if (!lastSyncProfileKeys.length) {
            return;
        }
        const disposables = new DisposableStore();
        try {
            let defaultProfileSynchronizer = this.activeProfileSynchronizers.get(this.userDataProfilesService.defaultProfile.id)?.[0];
            if (!defaultProfileSynchronizer) {
                defaultProfileSynchronizer = disposables.add(this.instantiationService.createInstance(ProfileSynchronizer, this.userDataProfilesService.defaultProfile, undefined));
            }
            const userDataProfileManifestSynchronizer = defaultProfileSynchronizer.enabled.find(s => s.resource === "profiles");
            if (!userDataProfileManifestSynchronizer) {
                return;
            }
            const lastSyncedProfiles = await userDataProfileManifestSynchronizer.getLastSyncedProfiles();
            const lastSyncedCollections = lastSyncedProfiles?.map(p => p.collection) ?? [];
            for (const [key, collection] of lastSyncProfileKeys) {
                if (!lastSyncedCollections.includes(collection)) {
                    this.logService.info(`Removing last sync state for stale profile: ${collection}`);
                    this.storageService.remove(key, -1);
                }
            }
        }
        finally {
            disposables.dispose();
        }
    }
    async cleanUpRemoteData() {
        const remoteProfiles = await this.userDataSyncResourceProviderService.getRemoteSyncedProfiles();
        const remoteProfileCollections = remoteProfiles.map(profile => profile.collection);
        const allCollections = await this.userDataSyncStoreService.getAllCollections();
        const redundantCollections = allCollections.filter(c => !remoteProfileCollections.includes(c));
        if (redundantCollections.length) {
            this.logService.info(`Deleting ${redundantCollections.length} redundant collections on server`);
            await Promise.allSettled(redundantCollections.map(collectionId => this.userDataSyncStoreService.deleteCollection(collectionId)));
            this.logService.info(`Deleted redundant collections on server`);
        }
        const updatedRemoteProfiles = remoteProfiles.filter(profile => allCollections.includes(profile.collection));
        if (updatedRemoteProfiles.length !== remoteProfiles.length) {
            const profileManifestSynchronizer = this.instantiationService.createInstance(UserDataProfilesManifestSynchroniser, this.userDataProfilesService.defaultProfile, undefined);
            try {
                this.logService.info('Resetting the last synced state of profiles');
                await profileManifestSynchronizer.resetLocal();
                this.logService.info('Did reset the last synced state of profiles');
                this.logService.info(`Updating remote profiles with invalid collections on server`);
                await profileManifestSynchronizer.updateRemoteProfiles(updatedRemoteProfiles, null);
                this.logService.info(`Updated remote profiles on server`);
            }
            finally {
                profileManifestSynchronizer.dispose();
            }
        }
    }
    async saveRemoteActivityData(location) {
        this.checkEnablement();
        const data = await this.userDataSyncStoreService.getActivityData();
        await this.fileService.writeFile(location, data);
    }
    async extractActivityData(activityDataResource, location) {
        const content = (await this.fileService.readFile(activityDataResource)).value.toString();
        const activityData = JSON.parse(content);
        if (activityData.resources) {
            for (const resource in activityData.resources) {
                for (const version of activityData.resources[resource]) {
                    await this.userDataSyncLocalStoreService.writeResource(resource, version.content, new Date(version.created * 1000), undefined, location);
                }
            }
        }
        if (activityData.collections) {
            for (const collection in activityData.collections) {
                for (const resource in activityData.collections[collection].resources) {
                    for (const version of activityData.collections[collection].resources?.[resource] ?? []) {
                        await this.userDataSyncLocalStoreService.writeResource(resource, version.content, new Date(version.created * 1000), collection, location);
                    }
                }
            }
        }
    }
    async performAction(profile, action) {
        const disposables = new DisposableStore();
        try {
            const activeProfileSyncronizer = this.activeProfileSynchronizers.get(profile.id);
            if (activeProfileSyncronizer) {
                const result = await this.performActionWithProfileSynchronizer(activeProfileSyncronizer[0], action, disposables);
                return isUndefined(result) ? null : result;
            }
            if (profile.isDefault) {
                const defaultProfileSynchronizer = disposables.add(this.instantiationService.createInstance(ProfileSynchronizer, profile, undefined));
                const result = await this.performActionWithProfileSynchronizer(defaultProfileSynchronizer, action, disposables);
                return isUndefined(result) ? null : result;
            }
            if (this.userDataProfilesService.isEnabled()) {
                return null;
            }
            const userDataProfileManifestSynchronizer = disposables.add(this.instantiationService.createInstance(UserDataProfilesManifestSynchroniser, profile, undefined));
            const manifest = await this.userDataSyncStoreService.manifest(null);
            const syncProfiles = (await userDataProfileManifestSynchronizer.getRemoteSyncedProfiles(manifest?.latest ?? null)) || [];
            const syncProfile = syncProfiles.find(syncProfile => syncProfile.id === profile.id);
            if (syncProfile) {
                const profileSynchronizer = disposables.add(this.instantiationService.createInstance(ProfileSynchronizer, profile, syncProfile.collection));
                const result = await this.performActionWithProfileSynchronizer(profileSynchronizer, action, disposables);
                return isUndefined(result) ? null : result;
            }
            return null;
        }
        finally {
            disposables.dispose();
        }
    }
    async performActionWithProfileSynchronizer(profileSynchronizer, action, disposables) {
        const allSynchronizers = [...profileSynchronizer.enabled, ...profileSynchronizer.disabled.reduce((synchronizers, syncResource) => {
                if (syncResource !== "workspaceState") {
                    synchronizers.push(disposables.add(profileSynchronizer.createSynchronizer(syncResource)));
                }
                return synchronizers;
            }, [])];
        for (const synchronizer of allSynchronizers) {
            const result = await action(synchronizer);
            if (!isUndefined(result)) {
                return result;
            }
        }
        return undefined;
    }
    setStatus(status) {
        const oldStatus = this._status;
        if (this._status !== status) {
            this._status = status;
            this._onDidChangeStatus.fire(status);
            if (oldStatus === "hasConflicts") {
                this.updateLastSyncTime();
            }
        }
    }
    updateConflicts() {
        const conflicts = this.getActiveProfileSynchronizers().map(synchronizer => synchronizer.conflicts).flat();
        if (!equals(this._conflicts, conflicts, (a, b) => a.profile.id === b.profile.id && a.syncResource === b.syncResource && equals(a.conflicts, b.conflicts, (a, b) => isEqual(a.previewResource, b.previewResource)))) {
            this._conflicts = conflicts;
            this._onDidChangeConflicts.fire(conflicts);
        }
    }
    updateLastSyncTime() {
        if (this.status === "idle") {
            this._lastSyncTime = new Date().getTime();
            this.storageService.store(LAST_SYNC_TIME_KEY, this._lastSyncTime, -1, 1);
            this._onDidChangeLastSyncTime.fire(this._lastSyncTime);
        }
    }
    getOrCreateActiveProfileSynchronizer(profile, syncProfile) {
        let activeProfileSynchronizer = this.activeProfileSynchronizers.get(profile.id);
        if (activeProfileSynchronizer && activeProfileSynchronizer[0].collection !== syncProfile?.collection) {
            this.logService.error('Profile synchronizer collection does not match with the remote sync profile collection');
            activeProfileSynchronizer[1].dispose();
            activeProfileSynchronizer = undefined;
            this.activeProfileSynchronizers.delete(profile.id);
        }
        if (!activeProfileSynchronizer) {
            const disposables = new DisposableStore();
            const profileSynchronizer = disposables.add(this.instantiationService.createInstance(ProfileSynchronizer, profile, syncProfile?.collection));
            disposables.add(profileSynchronizer.onDidChangeStatus(e => this.setStatus(e)));
            disposables.add(profileSynchronizer.onDidChangeConflicts(conflicts => this.updateConflicts()));
            disposables.add(profileSynchronizer.onDidChangeLocal(e => this._onDidChangeLocal.fire(e)));
            this.activeProfileSynchronizers.set(profile.id, activeProfileSynchronizer = [profileSynchronizer, disposables]);
        }
        return activeProfileSynchronizer[0];
    }
    getActiveProfileSynchronizers() {
        const profileSynchronizers = [];
        for (const [profileSynchronizer] of this.activeProfileSynchronizers.values()) {
            profileSynchronizers.push(profileSynchronizer);
        }
        return profileSynchronizers;
    }
    clearActiveProfileSynchronizers() {
        this.activeProfileSynchronizers.forEach(([, disposable]) => disposable.dispose());
        this.activeProfileSynchronizers.clear();
    }
    checkEnablement() {
        if (!this.userDataSyncStoreManagementService.userDataSyncStore) {
            throw new Error('Not enabled');
        }
    }
};
UserDataSyncService = __decorate([
    __param(0, IFileService),
    __param(1, IUserDataSyncStoreService),
    __param(2, IUserDataSyncStoreManagementService),
    __param(3, IInstantiationService),
    __param(4, IUserDataSyncLogService),
    __param(5, ITelemetryService),
    __param(6, IStorageService),
    __param(7, IUserDataSyncEnablementService),
    __param(8, IUserDataProfilesService),
    __param(9, IUserDataSyncResourceProviderService),
    __param(10, IUserDataSyncLocalStoreService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserDataSyncService);
export { UserDataSyncService };
let ProfileSynchronizer = class ProfileSynchronizer extends Disposable {
    get enabled() { return this._enabled.sort((a, b) => a[1] - b[1]).map(([synchronizer]) => synchronizer); }
    get disabled() { return ALL_SYNC_RESOURCES.filter(syncResource => !this.userDataSyncEnablementService.isResourceEnabled(syncResource)); }
    get status() { return this._status; }
    get conflicts() { return this._conflicts; }
    constructor(profile, collection, userDataSyncEnablementService, instantiationService, extensionGalleryService, userDataSyncStoreManagementService, telemetryService, logService, userDataProfilesService, configurationService) {
        super();
        this.profile = profile;
        this.collection = collection;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.instantiationService = instantiationService;
        this.extensionGalleryService = extensionGalleryService;
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this.telemetryService = telemetryService;
        this.logService = logService;
        this.userDataProfilesService = userDataProfilesService;
        this.configurationService = configurationService;
        this._enabled = [];
        this._status = "idle";
        this._onDidChangeStatus = this._register(new Emitter());
        this.onDidChangeStatus = this._onDidChangeStatus.event;
        this._onDidChangeLocal = this._register(new Emitter());
        this.onDidChangeLocal = this._onDidChangeLocal.event;
        this._conflicts = [];
        this._onDidChangeConflicts = this._register(new Emitter());
        this.onDidChangeConflicts = this._onDidChangeConflicts.event;
        this._register(userDataSyncEnablementService.onDidChangeResourceEnablement(([syncResource, enablement]) => this.onDidChangeResourceEnablement(syncResource, enablement)));
        this._register(toDisposable(() => this._enabled.splice(0, this._enabled.length).forEach(([, , disposable]) => disposable.dispose())));
        for (const syncResource of ALL_SYNC_RESOURCES) {
            if (userDataSyncEnablementService.isResourceEnabled(syncResource)) {
                this.registerSynchronizer(syncResource);
            }
        }
    }
    onDidChangeResourceEnablement(syncResource, enabled) {
        if (enabled) {
            this.registerSynchronizer(syncResource);
        }
        else {
            this.deRegisterSynchronizer(syncResource);
        }
    }
    registerSynchronizer(syncResource) {
        if (this._enabled.some(([synchronizer]) => synchronizer.resource === syncResource)) {
            return;
        }
        if (syncResource === "extensions" && !this.extensionGalleryService.isEnabled()) {
            this.logService.info('Skipping extensions sync because gallery is not configured');
            return;
        }
        if (syncResource === "profiles") {
            if (!this.profile.isDefault) {
                return;
            }
            if (!this.userDataProfilesService.isEnabled()) {
                return;
            }
        }
        if (syncResource === "workspaceState") {
            return;
        }
        if (syncResource !== "profiles" && this.profile.useDefaultFlags?.[syncResource]) {
            this.logService.debug(`Skipping syncing ${syncResource} in ${this.profile.name} because it is already synced by default profile`);
            return;
        }
        const disposables = new DisposableStore();
        const synchronizer = disposables.add(this.createSynchronizer(syncResource));
        disposables.add(synchronizer.onDidChangeStatus(() => this.updateStatus()));
        disposables.add(synchronizer.onDidChangeConflicts(() => this.updateConflicts()));
        disposables.add(synchronizer.onDidChangeLocal(() => this._onDidChangeLocal.fire(syncResource)));
        const order = this.getOrder(syncResource);
        this._enabled.push([synchronizer, order, disposables]);
    }
    deRegisterSynchronizer(syncResource) {
        const index = this._enabled.findIndex(([synchronizer]) => synchronizer.resource === syncResource);
        if (index !== -1) {
            const [[synchronizer, , disposable]] = this._enabled.splice(index, 1);
            disposable.dispose();
            this.updateStatus();
            synchronizer.stop().then(null, error => this.logService.error(error));
        }
    }
    createSynchronizer(syncResource) {
        switch (syncResource) {
            case "settings": return this.instantiationService.createInstance(SettingsSynchroniser, this.profile, this.collection);
            case "keybindings": return this.instantiationService.createInstance(KeybindingsSynchroniser, this.profile, this.collection);
            case "snippets": return this.instantiationService.createInstance(SnippetsSynchroniser, this.profile, this.collection);
            case "tasks": return this.instantiationService.createInstance(TasksSynchroniser, this.profile, this.collection);
            case "globalState": return this.instantiationService.createInstance(GlobalStateSynchroniser, this.profile, this.collection);
            case "extensions": return this.instantiationService.createInstance(ExtensionsSynchroniser, this.profile, this.collection);
            case "profiles": return this.instantiationService.createInstance(UserDataProfilesManifestSynchroniser, this.profile, this.collection);
        }
    }
    async sync(manifest, merge, executionId, token) {
        if (token.isCancellationRequested) {
            return [];
        }
        const synchronizers = this.enabled;
        if (!synchronizers.length) {
            return [];
        }
        try {
            const syncErrors = [];
            const syncHeaders = createSyncHeaders(executionId);
            const resourceManifest = (this.collection ? manifest?.collections?.[this.collection]?.latest : manifest?.latest) ?? null;
            const userDataSyncConfiguration = merge ? await this.getUserDataSyncConfiguration(resourceManifest) : {};
            for (const synchroniser of synchronizers) {
                if (token.isCancellationRequested) {
                    return [];
                }
                if (!this.userDataSyncEnablementService.isResourceEnabled(synchroniser.resource)) {
                    return [];
                }
                try {
                    if (merge) {
                        const preview = await synchroniser.preview(resourceManifest, userDataSyncConfiguration, syncHeaders);
                        if (preview) {
                            for (const resourcePreview of preview.resourcePreviews) {
                                if ((resourcePreview.localChange !== 0 || resourcePreview.remoteChange !== 0) && resourcePreview.mergeState === "preview") {
                                    await synchroniser.merge(resourcePreview.previewResource);
                                }
                            }
                        }
                    }
                    else {
                        await synchroniser.sync(resourceManifest, syncHeaders);
                    }
                }
                catch (e) {
                    const userDataSyncError = UserDataSyncError.toUserDataSyncError(e);
                    reportUserDataSyncError(userDataSyncError, executionId, this.userDataSyncStoreManagementService, this.telemetryService);
                    if (canBailout(e)) {
                        throw userDataSyncError;
                    }
                    this.logService.error(e);
                    this.logService.error(`${synchroniser.resource}: ${toErrorMessage(e)}`);
                    syncErrors.push([synchroniser.resource, userDataSyncError]);
                }
            }
            return syncErrors;
        }
        finally {
            this.updateStatus();
        }
    }
    async apply(executionId, token) {
        const syncHeaders = createSyncHeaders(executionId);
        for (const synchroniser of this.enabled) {
            if (token.isCancellationRequested) {
                return;
            }
            try {
                await synchroniser.apply(false, syncHeaders);
            }
            catch (e) {
                const userDataSyncError = UserDataSyncError.toUserDataSyncError(e);
                reportUserDataSyncError(userDataSyncError, executionId, this.userDataSyncStoreManagementService, this.telemetryService);
                if (canBailout(e)) {
                    throw userDataSyncError;
                }
                this.logService.error(e);
                this.logService.error(`${synchroniser.resource}: ${toErrorMessage(e)}`);
            }
        }
    }
    async stop() {
        for (const synchroniser of this.enabled) {
            try {
                if (synchroniser.status !== "idle") {
                    await synchroniser.stop();
                }
            }
            catch (e) {
                this.logService.error(e);
            }
        }
    }
    async resetLocal() {
        for (const synchroniser of this.enabled) {
            try {
                await synchroniser.resetLocal();
            }
            catch (e) {
                this.logService.error(`${synchroniser.resource}: ${toErrorMessage(e)}`);
                this.logService.error(e);
            }
        }
    }
    async getUserDataSyncConfiguration(manifest) {
        if (!this.profile.isDefault) {
            return {};
        }
        const local = this.configurationService.getValue(USER_DATA_SYNC_CONFIGURATION_SCOPE);
        const settingsSynchronizer = this.enabled.find(synchronizer => synchronizer instanceof SettingsSynchroniser);
        if (settingsSynchronizer) {
            const remote = await settingsSynchronizer.getRemoteUserDataSyncConfiguration(manifest);
            return { ...local, ...remote };
        }
        return local;
    }
    setStatus(status) {
        if (this._status !== status) {
            this._status = status;
            this._onDidChangeStatus.fire(status);
        }
    }
    updateStatus() {
        this.updateConflicts();
        if (this.enabled.some(s => s.status === "hasConflicts")) {
            return this.setStatus("hasConflicts");
        }
        if (this.enabled.some(s => s.status === "syncing")) {
            return this.setStatus("syncing");
        }
        return this.setStatus("idle");
    }
    updateConflicts() {
        const conflicts = this.enabled.filter(s => s.status === "hasConflicts")
            .filter(s => s.conflicts.conflicts.length > 0)
            .map(s => s.conflicts);
        if (!equals(this._conflicts, conflicts, (a, b) => a.syncResource === b.syncResource && equals(a.conflicts, b.conflicts, (a, b) => isEqual(a.previewResource, b.previewResource)))) {
            this._conflicts = conflicts;
            this._onDidChangeConflicts.fire(conflicts);
        }
    }
    getOrder(syncResource) {
        switch (syncResource) {
            case "settings": return 0;
            case "keybindings": return 1;
            case "snippets": return 2;
            case "tasks": return 3;
            case "globalState": return 4;
            case "extensions": return 5;
            case "profiles": return 6;
            case "workspaceState": return 7;
        }
    }
};
ProfileSynchronizer = __decorate([
    __param(2, IUserDataSyncEnablementService),
    __param(3, IInstantiationService),
    __param(4, IExtensionGalleryService),
    __param(5, IUserDataSyncStoreManagementService),
    __param(6, ITelemetryService),
    __param(7, IUserDataSyncLogService),
    __param(8, IUserDataProfilesService),
    __param(9, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ProfileSynchronizer);
function canBailout(e) {
    if (e instanceof UserDataSyncError) {
        switch (e.code) {
            case "MethodNotFound":
            case "TooLarge":
            case "RemoteTooManyRequests":
            case "TooManyRequestsAndRetryAfter":
            case "LocalTooManyRequests":
            case "LocalTooManyProfiles":
            case "Gone":
            case "UpgradeRequired":
            case "IncompatibleRemoteContent":
            case "IncompatibleLocalContent":
                return true;
        }
    }
    return false;
}
function reportUserDataSyncError(userDataSyncError, executionId, userDataSyncStoreManagementService, telemetryService) {
    telemetryService.publicLog2('sync/error', {
        code: userDataSyncError.code,
        serverCode: userDataSyncError instanceof UserDataSyncStoreError ? String(userDataSyncError.serverCode) : undefined,
        url: userDataSyncError instanceof UserDataSyncStoreError ? userDataSyncError.url : undefined,
        resource: userDataSyncError.resource,
        executionId,
        service: userDataSyncStoreManagementService.userDataSyncStore.url.toString()
    });
}
