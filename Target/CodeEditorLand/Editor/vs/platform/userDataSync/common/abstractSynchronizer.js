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
import { createCancelablePromise, ThrottledDelayer } from '../../../base/common/async.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { parse } from '../../../base/common/json.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { uppercaseFirstLetter } from '../../../base/common/strings.js';
import { isUndefined } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { localize } from '../../../nls.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { FileOperationError, IFileService, toFileOperationResult } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { getServiceMachineId } from '../../externalServices/common/serviceMachineId.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { getLastSyncResourceUri, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, IUserDataSyncUtilService, PREVIEW_DIR_NAME, UserDataSyncError, USER_DATA_SYNC_CONFIGURATION_SCOPE, USER_DATA_SYNC_SCHEME, getPathSegments } from './userDataSync.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
export function isRemoteUserData(thing) {
    if (thing
        && (thing.ref !== undefined && typeof thing.ref === 'string' && thing.ref !== '')
        && (thing.syncData !== undefined && (thing.syncData === null || isSyncData(thing.syncData)))) {
        return true;
    }
    return false;
}
export function isSyncData(thing) {
    if (thing
        && (thing.version !== undefined && typeof thing.version === 'number')
        && (thing.content !== undefined && typeof thing.content === 'string')) {
        if (Object.keys(thing).length === 2) {
            return true;
        }
        if (Object.keys(thing).length === 3
            && (thing.machineId !== undefined && typeof thing.machineId === 'string')) {
            return true;
        }
    }
    return false;
}
export function getSyncResourceLogLabel(syncResource, profile) {
    return `${uppercaseFirstLetter(syncResource)}${profile.isDefault ? '' : ` (${profile.name})`}`;
}
let AbstractSynchroniser = class AbstractSynchroniser extends Disposable {
    get status() { return this._status; }
    get conflicts() { return { ...this.syncResource, conflicts: this._conflicts }; }
    constructor(syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService) {
        super();
        this.syncResource = syncResource;
        this.collection = collection;
        this.fileService = fileService;
        this.environmentService = environmentService;
        this.storageService = storageService;
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.userDataSyncLocalStoreService = userDataSyncLocalStoreService;
        this.userDataSyncEnablementService = userDataSyncEnablementService;
        this.telemetryService = telemetryService;
        this.logService = logService;
        this.configurationService = configurationService;
        this.syncPreviewPromise = null;
        this._status = "idle";
        this._onDidChangStatus = this._register(new Emitter());
        this.onDidChangeStatus = this._onDidChangStatus.event;
        this._conflicts = [];
        this._onDidChangeConflicts = this._register(new Emitter());
        this.onDidChangeConflicts = this._onDidChangeConflicts.event;
        this.localChangeTriggerThrottler = this._register(new ThrottledDelayer(50));
        this._onDidChangeLocal = this._register(new Emitter());
        this.onDidChangeLocal = this._onDidChangeLocal.event;
        this.lastSyncUserDataStateKey = `${this.collection ? `${this.collection}.` : ''}${this.syncResource.syncResource}.lastSyncUserData`;
        this.hasSyncResourceStateVersionChanged = false;
        this.syncHeaders = {};
        this.resource = this.syncResource.syncResource;
        this.syncResourceLogLabel = getSyncResourceLogLabel(syncResource.syncResource, syncResource.profile);
        this.extUri = uriIdentityService.extUri;
        this.syncFolder = this.extUri.joinPath(environmentService.userDataSyncHome, ...getPathSegments(syncResource.profile.isDefault ? undefined : syncResource.profile.id, syncResource.syncResource));
        this.syncPreviewFolder = this.extUri.joinPath(this.syncFolder, PREVIEW_DIR_NAME);
        this.lastSyncResource = getLastSyncResourceUri(syncResource.profile.isDefault ? undefined : syncResource.profile.id, syncResource.syncResource, environmentService, this.extUri);
        this.currentMachineIdPromise = getServiceMachineId(environmentService, fileService, storageService);
    }
    triggerLocalChange() {
        this.localChangeTriggerThrottler.trigger(() => this.doTriggerLocalChange());
    }
    async doTriggerLocalChange() {
        if (this.status === "hasConflicts") {
            this.logService.info(`${this.syncResourceLogLabel}: In conflicts state and local change detected. Syncing again...`);
            const preview = await this.syncPreviewPromise;
            this.syncPreviewPromise = null;
            const status = await this.performSync(preview.remoteUserData, preview.lastSyncUserData, true, this.getUserDataSyncConfiguration());
            this.setStatus(status);
        }
        else {
            this.logService.trace(`${this.syncResourceLogLabel}: Checking for local changes...`);
            const lastSyncUserData = await this.getLastSyncUserData();
            const hasRemoteChanged = lastSyncUserData ? await this.hasRemoteChanged(lastSyncUserData) : true;
            if (hasRemoteChanged) {
                this._onDidChangeLocal.fire();
            }
        }
    }
    setStatus(status) {
        if (this._status !== status) {
            this._status = status;
            this._onDidChangStatus.fire(status);
        }
    }
    async sync(manifest, headers = {}) {
        await this._sync(manifest, true, this.getUserDataSyncConfiguration(), headers);
    }
    async preview(manifest, userDataSyncConfiguration, headers = {}) {
        return this._sync(manifest, false, userDataSyncConfiguration, headers);
    }
    async apply(force, headers = {}) {
        try {
            this.syncHeaders = { ...headers };
            const status = await this.doApply(force);
            this.setStatus(status);
            return this.syncPreviewPromise;
        }
        finally {
            this.syncHeaders = {};
        }
    }
    async _sync(manifest, apply, userDataSyncConfiguration, headers) {
        try {
            this.syncHeaders = { ...headers };
            if (this.status === "hasConflicts") {
                this.logService.info(`${this.syncResourceLogLabel}: Skipped synchronizing ${this.resource.toLowerCase()} as there are conflicts.`);
                return this.syncPreviewPromise;
            }
            if (this.status === "syncing") {
                this.logService.info(`${this.syncResourceLogLabel}: Skipped synchronizing ${this.resource.toLowerCase()} as it is running already.`);
                return this.syncPreviewPromise;
            }
            this.logService.trace(`${this.syncResourceLogLabel}: Started synchronizing ${this.resource.toLowerCase()}...`);
            this.setStatus("syncing");
            let status = "idle";
            try {
                const lastSyncUserData = await this.getLastSyncUserData();
                const remoteUserData = await this.getLatestRemoteUserData(manifest, lastSyncUserData);
                status = await this.performSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
                if (status === "hasConflicts") {
                    this.logService.info(`${this.syncResourceLogLabel}: Detected conflicts while synchronizing ${this.resource.toLowerCase()}.`);
                }
                else if (status === "idle") {
                    this.logService.trace(`${this.syncResourceLogLabel}: Finished synchronizing ${this.resource.toLowerCase()}.`);
                }
                return this.syncPreviewPromise || null;
            }
            finally {
                this.setStatus(status);
            }
        }
        finally {
            this.syncHeaders = {};
        }
    }
    async replace(content) {
        const syncData = this.parseSyncData(content);
        if (!syncData) {
            return false;
        }
        await this.stop();
        try {
            this.logService.trace(`${this.syncResourceLogLabel}: Started resetting ${this.resource.toLowerCase()}...`);
            this.setStatus("syncing");
            const lastSyncUserData = await this.getLastSyncUserData();
            const remoteUserData = await this.getLatestRemoteUserData(null, lastSyncUserData);
            const isRemoteDataFromCurrentMachine = await this.isRemoteDataFromCurrentMachine(remoteUserData);
            const resourcePreviewResults = await this.generateSyncPreview({ ref: remoteUserData.ref, syncData }, lastSyncUserData, isRemoteDataFromCurrentMachine, this.getUserDataSyncConfiguration(), CancellationToken.None);
            const resourcePreviews = [];
            for (const resourcePreviewResult of resourcePreviewResults) {
                const acceptResult = await this.getAcceptResult(resourcePreviewResult, resourcePreviewResult.remoteResource, undefined, CancellationToken.None);
                const { remoteChange } = await this.getAcceptResult(resourcePreviewResult, resourcePreviewResult.previewResource, resourcePreviewResult.remoteContent, CancellationToken.None);
                resourcePreviews.push([resourcePreviewResult, { ...acceptResult, remoteChange: remoteChange !== 0 ? remoteChange : 2 }]);
            }
            await this.applyResult(remoteUserData, lastSyncUserData, resourcePreviews, false);
            this.logService.info(`${this.syncResourceLogLabel}: Finished resetting ${this.resource.toLowerCase()}.`);
        }
        finally {
            this.setStatus("idle");
        }
        return true;
    }
    async isRemoteDataFromCurrentMachine(remoteUserData) {
        const machineId = await this.currentMachineIdPromise;
        return !!remoteUserData.syncData?.machineId && remoteUserData.syncData.machineId === machineId;
    }
    async getLatestRemoteUserData(manifest, lastSyncUserData) {
        if (lastSyncUserData) {
            const latestRef = manifest ? manifest[this.resource] : undefined;
            if (lastSyncUserData.ref === latestRef) {
                return lastSyncUserData;
            }
            if (latestRef === undefined && lastSyncUserData.syncData === null) {
                return lastSyncUserData;
            }
        }
        return this.getRemoteUserData(lastSyncUserData);
    }
    async performSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration) {
        if (remoteUserData.syncData && remoteUserData.syncData.version > this.version) {
            this.telemetryService.publicLog2('sync/incompatible', { source: this.resource });
            throw new UserDataSyncError(localize({ key: 'incompatible', comment: ['This is an error while syncing a resource that its local version is not compatible with its remote version.'] }, "Cannot sync {0} as its local version {1} is not compatible with its remote version {2}", this.resource, this.version, remoteUserData.syncData.version), "IncompatibleLocalContent", this.resource);
        }
        try {
            return await this.doSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
        }
        catch (e) {
            if (e instanceof UserDataSyncError) {
                switch (e.code) {
                    case "LocalPreconditionFailed":
                        this.logService.info(`${this.syncResourceLogLabel}: Failed to synchronize ${this.syncResourceLogLabel} as there is a new local version available. Synchronizing again...`);
                        return this.performSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
                    case "Conflict":
                    case "PreconditionFailed":
                        this.logService.info(`${this.syncResourceLogLabel}: Failed to synchronize as there is a new remote version available. Synchronizing again...`);
                        remoteUserData = await this.getRemoteUserData(null);
                        lastSyncUserData = await this.getLastSyncUserData();
                        return this.performSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration);
                }
            }
            throw e;
        }
    }
    async doSync(remoteUserData, lastSyncUserData, apply, userDataSyncConfiguration) {
        try {
            const isRemoteDataFromCurrentMachine = await this.isRemoteDataFromCurrentMachine(remoteUserData);
            const acceptRemote = !isRemoteDataFromCurrentMachine && lastSyncUserData === null && this.getStoredLastSyncUserDataStateContent() !== undefined;
            const merge = apply && !acceptRemote;
            if (!this.syncPreviewPromise) {
                this.syncPreviewPromise = createCancelablePromise(token => this.doGenerateSyncResourcePreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, merge, userDataSyncConfiguration, token));
            }
            let preview = await this.syncPreviewPromise;
            if (apply && acceptRemote) {
                this.logService.info(`${this.syncResourceLogLabel}: Accepting remote because it was synced before and the last sync data is not available.`);
                for (const resourcePreview of preview.resourcePreviews) {
                    preview = (await this.accept(resourcePreview.remoteResource)) || preview;
                }
            }
            this.updateConflicts(preview.resourcePreviews);
            if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict")) {
                return "hasConflicts";
            }
            if (apply) {
                return await this.doApply(false);
            }
            return "syncing";
        }
        catch (error) {
            this.syncPreviewPromise = null;
            throw error;
        }
    }
    async merge(resource) {
        await this.updateSyncResourcePreview(resource, async (resourcePreview) => {
            const mergeResult = await this.getMergeResult(resourcePreview, CancellationToken.None);
            await this.fileService.writeFile(resourcePreview.previewResource, VSBuffer.fromString(mergeResult?.content || ''));
            const acceptResult = mergeResult && !mergeResult.hasConflicts
                ? await this.getAcceptResult(resourcePreview, resourcePreview.previewResource, undefined, CancellationToken.None)
                : undefined;
            resourcePreview.acceptResult = acceptResult;
            resourcePreview.mergeState = mergeResult.hasConflicts ? "conflict" : acceptResult ? "accepted" : "preview";
            resourcePreview.localChange = acceptResult ? acceptResult.localChange : mergeResult.localChange;
            resourcePreview.remoteChange = acceptResult ? acceptResult.remoteChange : mergeResult.remoteChange;
            return resourcePreview;
        });
        return this.syncPreviewPromise;
    }
    async accept(resource, content) {
        await this.updateSyncResourcePreview(resource, async (resourcePreview) => {
            const acceptResult = await this.getAcceptResult(resourcePreview, resource, content, CancellationToken.None);
            resourcePreview.acceptResult = acceptResult;
            resourcePreview.mergeState = "accepted";
            resourcePreview.localChange = acceptResult.localChange;
            resourcePreview.remoteChange = acceptResult.remoteChange;
            return resourcePreview;
        });
        return this.syncPreviewPromise;
    }
    async discard(resource) {
        await this.updateSyncResourcePreview(resource, async (resourcePreview) => {
            const mergeResult = await this.getMergeResult(resourcePreview, CancellationToken.None);
            await this.fileService.writeFile(resourcePreview.previewResource, VSBuffer.fromString(mergeResult.content || ''));
            resourcePreview.acceptResult = undefined;
            resourcePreview.mergeState = "preview";
            resourcePreview.localChange = mergeResult.localChange;
            resourcePreview.remoteChange = mergeResult.remoteChange;
            return resourcePreview;
        });
        return this.syncPreviewPromise;
    }
    async updateSyncResourcePreview(resource, updateResourcePreview) {
        if (!this.syncPreviewPromise) {
            return;
        }
        let preview = await this.syncPreviewPromise;
        const index = preview.resourcePreviews.findIndex(({ localResource, remoteResource, previewResource }) => this.extUri.isEqual(localResource, resource) || this.extUri.isEqual(remoteResource, resource) || this.extUri.isEqual(previewResource, resource));
        if (index === -1) {
            return;
        }
        this.syncPreviewPromise = createCancelablePromise(async (token) => {
            const resourcePreviews = [...preview.resourcePreviews];
            resourcePreviews[index] = await updateResourcePreview(resourcePreviews[index]);
            return {
                ...preview,
                resourcePreviews
            };
        });
        preview = await this.syncPreviewPromise;
        this.updateConflicts(preview.resourcePreviews);
        if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict")) {
            this.setStatus("hasConflicts");
        }
        else {
            this.setStatus("syncing");
        }
    }
    async doApply(force) {
        if (!this.syncPreviewPromise) {
            return "idle";
        }
        const preview = await this.syncPreviewPromise;
        if (preview.resourcePreviews.some(({ mergeState }) => mergeState === "conflict")) {
            return "hasConflicts";
        }
        if (preview.resourcePreviews.some(({ mergeState }) => mergeState !== "accepted")) {
            return "syncing";
        }
        await this.applyResult(preview.remoteUserData, preview.lastSyncUserData, preview.resourcePreviews.map(resourcePreview => ([resourcePreview, resourcePreview.acceptResult])), force);
        this.syncPreviewPromise = null;
        await this.clearPreviewFolder();
        return "idle";
    }
    async clearPreviewFolder() {
        try {
            await this.fileService.del(this.syncPreviewFolder, { recursive: true });
        }
        catch (error) { }
    }
    updateConflicts(resourcePreviews) {
        const conflicts = resourcePreviews.filter(({ mergeState }) => mergeState === "conflict");
        if (!equals(this._conflicts, conflicts, (a, b) => this.extUri.isEqual(a.previewResource, b.previewResource))) {
            this._conflicts = conflicts;
            this._onDidChangeConflicts.fire(this.conflicts);
        }
    }
    async hasPreviouslySynced() {
        const lastSyncData = await this.getLastSyncUserData();
        return !!lastSyncData && lastSyncData.syncData !== null;
    }
    async resolvePreviewContent(uri) {
        const syncPreview = this.syncPreviewPromise ? await this.syncPreviewPromise : null;
        if (syncPreview) {
            for (const resourcePreview of syncPreview.resourcePreviews) {
                if (this.extUri.isEqual(resourcePreview.acceptedResource, uri)) {
                    return resourcePreview.acceptResult ? resourcePreview.acceptResult.content : null;
                }
                if (this.extUri.isEqual(resourcePreview.remoteResource, uri)) {
                    return resourcePreview.remoteContent;
                }
                if (this.extUri.isEqual(resourcePreview.localResource, uri)) {
                    return resourcePreview.localContent;
                }
                if (this.extUri.isEqual(resourcePreview.baseResource, uri)) {
                    return resourcePreview.baseContent;
                }
            }
        }
        return null;
    }
    async resetLocal() {
        this.storageService.remove(this.lastSyncUserDataStateKey, -1);
        try {
            await this.fileService.del(this.lastSyncResource);
        }
        catch (error) {
            if (toFileOperationResult(error) !== 1) {
                this.logService.error(error);
            }
        }
    }
    async doGenerateSyncResourcePreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, merge, userDataSyncConfiguration, token) {
        const resourcePreviewResults = await this.generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine, userDataSyncConfiguration, token);
        const resourcePreviews = [];
        for (const resourcePreviewResult of resourcePreviewResults) {
            const acceptedResource = resourcePreviewResult.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' });
            if (resourcePreviewResult.localChange === 0 && resourcePreviewResult.remoteChange === 0) {
                resourcePreviews.push({
                    ...resourcePreviewResult,
                    acceptedResource,
                    acceptResult: { content: null, localChange: 0, remoteChange: 0 },
                    mergeState: "accepted"
                });
            }
            else {
                const mergeResult = merge ? await this.getMergeResult(resourcePreviewResult, token) : undefined;
                if (token.isCancellationRequested) {
                    break;
                }
                await this.fileService.writeFile(resourcePreviewResult.previewResource, VSBuffer.fromString(mergeResult?.content || ''));
                const acceptResult = mergeResult && !mergeResult.hasConflicts
                    ? await this.getAcceptResult(resourcePreviewResult, resourcePreviewResult.previewResource, undefined, token)
                    : undefined;
                resourcePreviews.push({
                    ...resourcePreviewResult,
                    acceptResult,
                    mergeState: mergeResult?.hasConflicts ? "conflict" : acceptResult ? "accepted" : "preview",
                    localChange: acceptResult ? acceptResult.localChange : mergeResult ? mergeResult.localChange : resourcePreviewResult.localChange,
                    remoteChange: acceptResult ? acceptResult.remoteChange : mergeResult ? mergeResult.remoteChange : resourcePreviewResult.remoteChange
                });
            }
        }
        return { syncResource: this.resource, profile: this.syncResource.profile, remoteUserData, lastSyncUserData, resourcePreviews, isLastSyncFromCurrentMachine: isRemoteDataFromCurrentMachine };
    }
    async getLastSyncUserData() {
        let storedLastSyncUserDataStateContent = this.getStoredLastSyncUserDataStateContent();
        if (!storedLastSyncUserDataStateContent) {
            storedLastSyncUserDataStateContent = await this.migrateLastSyncUserData();
        }
        if (!storedLastSyncUserDataStateContent) {
            this.logService.info(`${this.syncResourceLogLabel}: Last sync data state does not exist.`);
            return null;
        }
        const lastSyncUserDataState = JSON.parse(storedLastSyncUserDataStateContent);
        const resourceSyncStateVersion = this.userDataSyncEnablementService.getResourceSyncStateVersion(this.resource);
        this.hasSyncResourceStateVersionChanged = !!lastSyncUserDataState.version && !!resourceSyncStateVersion && lastSyncUserDataState.version !== resourceSyncStateVersion;
        if (this.hasSyncResourceStateVersionChanged) {
            this.logService.info(`${this.syncResourceLogLabel}: Reset last sync state because last sync state version ${lastSyncUserDataState.version} is not compatible with current sync state version ${resourceSyncStateVersion}.`);
            await this.resetLocal();
            return null;
        }
        let syncData = undefined;
        let retrial = 1;
        while (syncData === undefined && retrial++ < 6) {
            try {
                const lastSyncStoredRemoteUserData = await this.readLastSyncStoredRemoteUserData();
                if (lastSyncStoredRemoteUserData) {
                    if (lastSyncStoredRemoteUserData.ref === lastSyncUserDataState.ref) {
                        syncData = lastSyncStoredRemoteUserData.syncData;
                    }
                    else {
                        this.logService.info(`${this.syncResourceLogLabel}: Last sync data stored locally is not same as the last sync state.`);
                    }
                }
                break;
            }
            catch (error) {
                if (error instanceof FileOperationError && error.fileOperationResult === 1) {
                    this.logService.info(`${this.syncResourceLogLabel}: Last sync resource does not exist locally.`);
                    break;
                }
                else if (error instanceof UserDataSyncError) {
                    throw error;
                }
                else {
                    this.logService.error(error, retrial);
                }
            }
        }
        if (syncData === undefined) {
            try {
                const content = await this.userDataSyncStoreService.resolveResourceContent(this.resource, lastSyncUserDataState.ref, this.collection, this.syncHeaders);
                syncData = content === null ? null : this.parseSyncData(content);
                await this.writeLastSyncStoredRemoteUserData({ ref: lastSyncUserDataState.ref, syncData });
            }
            catch (error) {
                if (error instanceof UserDataSyncError && error.code === "NotFound") {
                    this.logService.info(`${this.syncResourceLogLabel}: Last sync resource does not exist remotely.`);
                }
                else {
                    throw error;
                }
            }
        }
        if (syncData === undefined) {
            return null;
        }
        return {
            ...lastSyncUserDataState,
            syncData,
        };
    }
    async updateLastSyncUserData(lastSyncRemoteUserData, additionalProps = {}) {
        if (additionalProps['ref'] || additionalProps['version']) {
            throw new Error('Cannot have core properties as additional');
        }
        const version = this.userDataSyncEnablementService.getResourceSyncStateVersion(this.resource);
        const lastSyncUserDataState = {
            ref: lastSyncRemoteUserData.ref,
            version,
            ...additionalProps
        };
        this.storageService.store(this.lastSyncUserDataStateKey, JSON.stringify(lastSyncUserDataState), -1, 1);
        await this.writeLastSyncStoredRemoteUserData(lastSyncRemoteUserData);
    }
    getStoredLastSyncUserDataStateContent() {
        return this.storageService.get(this.lastSyncUserDataStateKey, -1);
    }
    async readLastSyncStoredRemoteUserData() {
        const content = (await this.fileService.readFile(this.lastSyncResource)).value.toString();
        try {
            const lastSyncStoredRemoteUserData = content ? JSON.parse(content) : undefined;
            if (isRemoteUserData(lastSyncStoredRemoteUserData)) {
                return lastSyncStoredRemoteUserData;
            }
        }
        catch (e) {
            this.logService.error(e);
        }
        return undefined;
    }
    async writeLastSyncStoredRemoteUserData(lastSyncRemoteUserData) {
        await this.fileService.writeFile(this.lastSyncResource, VSBuffer.fromString(JSON.stringify(lastSyncRemoteUserData)));
    }
    async migrateLastSyncUserData() {
        try {
            const content = await this.fileService.readFile(this.lastSyncResource);
            const userData = JSON.parse(content.value.toString());
            await this.fileService.del(this.lastSyncResource);
            if (userData.ref && userData.content !== undefined) {
                this.storageService.store(this.lastSyncUserDataStateKey, JSON.stringify({
                    ...userData,
                    content: undefined,
                }), -1, 1);
                await this.writeLastSyncStoredRemoteUserData({ ref: userData.ref, syncData: userData.content === null ? null : JSON.parse(userData.content) });
            }
            else {
                this.logService.info(`${this.syncResourceLogLabel}: Migrating last sync user data. Invalid data.`, userData);
            }
        }
        catch (error) {
            if (error instanceof FileOperationError && error.fileOperationResult === 1) {
                this.logService.info(`${this.syncResourceLogLabel}: Migrating last sync user data. Resource does not exist.`);
            }
            else {
                this.logService.error(error);
            }
        }
        return this.storageService.get(this.lastSyncUserDataStateKey, -1);
    }
    async getRemoteUserData(lastSyncData) {
        const { ref, content } = await this.getUserData(lastSyncData);
        let syncData = null;
        if (content !== null) {
            syncData = this.parseSyncData(content);
        }
        return { ref, syncData };
    }
    parseSyncData(content) {
        try {
            const syncData = JSON.parse(content);
            if (isSyncData(syncData)) {
                return syncData;
            }
        }
        catch (error) {
            this.logService.error(error);
        }
        throw new UserDataSyncError(localize('incompatible sync data', "Cannot parse sync data as it is not compatible with the current version."), "IncompatibleRemoteContent", this.resource);
    }
    async getUserData(lastSyncData) {
        const lastSyncUserData = lastSyncData ? { ref: lastSyncData.ref, content: lastSyncData.syncData ? JSON.stringify(lastSyncData.syncData) : null } : null;
        return this.userDataSyncStoreService.readResource(this.resource, lastSyncUserData, this.collection, this.syncHeaders);
    }
    async updateRemoteUserData(content, ref) {
        const machineId = await this.currentMachineIdPromise;
        const syncData = { version: this.version, machineId, content };
        try {
            ref = await this.userDataSyncStoreService.writeResource(this.resource, JSON.stringify(syncData), ref, this.collection, this.syncHeaders);
            return { ref, syncData };
        }
        catch (error) {
            if (error instanceof UserDataSyncError && error.code === "TooLarge") {
                error = new UserDataSyncError(error.message, error.code, this.resource);
            }
            throw error;
        }
    }
    async backupLocal(content) {
        const syncData = { version: this.version, content };
        return this.userDataSyncLocalStoreService.writeResource(this.resource, JSON.stringify(syncData), new Date(), this.syncResource.profile.isDefault ? undefined : this.syncResource.profile.id);
    }
    async stop() {
        if (this.status === "idle") {
            return;
        }
        this.logService.trace(`${this.syncResourceLogLabel}: Stopping synchronizing ${this.resource.toLowerCase()}.`);
        if (this.syncPreviewPromise) {
            this.syncPreviewPromise.cancel();
            this.syncPreviewPromise = null;
        }
        this.updateConflicts([]);
        await this.clearPreviewFolder();
        this.setStatus("idle");
        this.logService.info(`${this.syncResourceLogLabel}: Stopped synchronizing ${this.resource.toLowerCase()}.`);
    }
    getUserDataSyncConfiguration() {
        return this.configurationService.getValue(USER_DATA_SYNC_CONFIGURATION_SCOPE);
    }
};
AbstractSynchroniser = __decorate([
    __param(2, IFileService),
    __param(3, IEnvironmentService),
    __param(4, IStorageService),
    __param(5, IUserDataSyncStoreService),
    __param(6, IUserDataSyncLocalStoreService),
    __param(7, IUserDataSyncEnablementService),
    __param(8, ITelemetryService),
    __param(9, IUserDataSyncLogService),
    __param(10, IConfigurationService),
    __param(11, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AbstractSynchroniser);
export { AbstractSynchroniser };
let AbstractFileSynchroniser = class AbstractFileSynchroniser extends AbstractSynchroniser {
    constructor(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService) {
        super(syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
        this.file = file;
        this._register(this.fileService.watch(this.extUri.dirname(file)));
        this._register(this.fileService.onDidFilesChange(e => this.onFileChanges(e)));
    }
    async getLocalFileContent() {
        try {
            return await this.fileService.readFile(this.file);
        }
        catch (error) {
            return null;
        }
    }
    async updateLocalFileContent(newContent, oldContent, force) {
        try {
            if (oldContent) {
                await this.fileService.writeFile(this.file, VSBuffer.fromString(newContent), force ? undefined : oldContent);
            }
            else {
                await this.fileService.createFile(this.file, VSBuffer.fromString(newContent), { overwrite: force });
            }
        }
        catch (e) {
            if ((e instanceof FileOperationError && e.fileOperationResult === 1) ||
                (e instanceof FileOperationError && e.fileOperationResult === 3)) {
                throw new UserDataSyncError(e.message, "LocalPreconditionFailed");
            }
            else {
                throw e;
            }
        }
    }
    async deleteLocalFile() {
        try {
            await this.fileService.del(this.file);
        }
        catch (e) {
            if (!(e instanceof FileOperationError && e.fileOperationResult === 1)) {
                throw e;
            }
        }
    }
    onFileChanges(e) {
        if (!e.contains(this.file)) {
            return;
        }
        this.triggerLocalChange();
    }
};
AbstractFileSynchroniser = __decorate([
    __param(3, IFileService),
    __param(4, IEnvironmentService),
    __param(5, IStorageService),
    __param(6, IUserDataSyncStoreService),
    __param(7, IUserDataSyncLocalStoreService),
    __param(8, IUserDataSyncEnablementService),
    __param(9, ITelemetryService),
    __param(10, IUserDataSyncLogService),
    __param(11, IConfigurationService),
    __param(12, IUriIdentityService),
    __metadata("design:paramtypes", [URI, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AbstractFileSynchroniser);
export { AbstractFileSynchroniser };
let AbstractJsonFileSynchroniser = class AbstractJsonFileSynchroniser extends AbstractFileSynchroniser {
    constructor(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, userDataSyncUtilService, configurationService, uriIdentityService) {
        super(file, syncResource, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
        this.userDataSyncUtilService = userDataSyncUtilService;
        this._formattingOptions = undefined;
    }
    hasErrors(content, isArray) {
        const parseErrors = [];
        const result = parse(content, parseErrors, { allowEmptyContent: true, allowTrailingComma: true });
        return parseErrors.length > 0 || (!isUndefined(result) && isArray !== Array.isArray(result));
    }
    getFormattingOptions() {
        if (!this._formattingOptions) {
            this._formattingOptions = this.userDataSyncUtilService.resolveFormattingOptions(this.file);
        }
        return this._formattingOptions;
    }
};
AbstractJsonFileSynchroniser = __decorate([
    __param(3, IFileService),
    __param(4, IEnvironmentService),
    __param(5, IStorageService),
    __param(6, IUserDataSyncStoreService),
    __param(7, IUserDataSyncLocalStoreService),
    __param(8, IUserDataSyncEnablementService),
    __param(9, ITelemetryService),
    __param(10, IUserDataSyncLogService),
    __param(11, IUserDataSyncUtilService),
    __param(12, IConfigurationService),
    __param(13, IUriIdentityService),
    __metadata("design:paramtypes", [URI, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AbstractJsonFileSynchroniser);
export { AbstractJsonFileSynchroniser };
let AbstractInitializer = class AbstractInitializer {
    constructor(resource, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService) {
        this.resource = resource;
        this.userDataProfilesService = userDataProfilesService;
        this.environmentService = environmentService;
        this.logService = logService;
        this.fileService = fileService;
        this.storageService = storageService;
        this.extUri = uriIdentityService.extUri;
        this.lastSyncResource = getLastSyncResourceUri(undefined, this.resource, environmentService, this.extUri);
    }
    async initialize({ ref, content }) {
        if (!content) {
            this.logService.info('Remote content does not exist.', this.resource);
            return;
        }
        const syncData = this.parseSyncData(content);
        if (!syncData) {
            return;
        }
        try {
            await this.doInitialize({ ref, syncData });
        }
        catch (error) {
            this.logService.error(error);
        }
    }
    parseSyncData(content) {
        try {
            const syncData = JSON.parse(content);
            if (isSyncData(syncData)) {
                return syncData;
            }
        }
        catch (error) {
            this.logService.error(error);
        }
        this.logService.info('Cannot parse sync data as it is not compatible with the current version.', this.resource);
        return undefined;
    }
    async updateLastSyncUserData(lastSyncRemoteUserData, additionalProps = {}) {
        if (additionalProps['ref'] || additionalProps['version']) {
            throw new Error('Cannot have core properties as additional');
        }
        const lastSyncUserDataState = {
            ref: lastSyncRemoteUserData.ref,
            version: undefined,
            ...additionalProps
        };
        this.storageService.store(`${this.resource}.lastSyncUserData`, JSON.stringify(lastSyncUserDataState), -1, 1);
        await this.fileService.writeFile(this.lastSyncResource, VSBuffer.fromString(JSON.stringify(lastSyncRemoteUserData)));
    }
};
AbstractInitializer = __decorate([
    __param(1, IUserDataProfilesService),
    __param(2, IEnvironmentService),
    __param(3, ILogService),
    __param(4, IFileService),
    __param(5, IStorageService),
    __param(6, IUriIdentityService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object])
], AbstractInitializer);
export { AbstractInitializer };
