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
import { Event } from '../../../base/common/event.js';
import { deepClone } from '../../../base/common/objects.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { FileOperationError, IFileService } from '../../files/common/files.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractInitializer, AbstractSynchroniser } from './abstractSynchronizer.js';
import { areSame, merge } from './snippetsMerge.js';
import { IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, USER_DATA_SYNC_SCHEME } from './userDataSync.js';
export function parseSnippets(syncData) {
    return JSON.parse(syncData.content);
}
let SnippetsSynchroniser = class SnippetsSynchroniser extends AbstractSynchroniser {
    constructor(profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, telemetryService, uriIdentityService) {
        super({ syncResource: "snippets", profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
        this.version = 1;
        this.snippetsFolder = profile.snippetsHome;
        this._register(this.fileService.watch(environmentService.userRoamingDataHome));
        this._register(this.fileService.watch(this.snippetsFolder));
        this._register(Event.filter(this.fileService.onDidFilesChange, e => e.affects(this.snippetsFolder))(() => this.triggerLocalChange()));
    }
    async generateSyncPreview(remoteUserData, lastSyncUserData, isRemoteDataFromCurrentMachine) {
        const local = await this.getSnippetsFileContents();
        const localSnippets = this.toSnippetsContents(local);
        const remoteSnippets = remoteUserData.syncData ? this.parseSnippets(remoteUserData.syncData) : null;
        lastSyncUserData = lastSyncUserData === null && isRemoteDataFromCurrentMachine ? remoteUserData : lastSyncUserData;
        const lastSyncSnippets = lastSyncUserData && lastSyncUserData.syncData ? this.parseSnippets(lastSyncUserData.syncData) : null;
        if (remoteSnippets) {
            this.logService.trace(`${this.syncResourceLogLabel}: Merging remote snippets with local snippets...`);
        }
        else {
            this.logService.trace(`${this.syncResourceLogLabel}: Remote snippets does not exist. Synchronizing snippets for the first time.`);
        }
        const mergeResult = merge(localSnippets, remoteSnippets, lastSyncSnippets);
        return this.getResourcePreviews(mergeResult, local, remoteSnippets || {}, lastSyncSnippets || {});
    }
    async hasRemoteChanged(lastSyncUserData) {
        const lastSyncSnippets = lastSyncUserData.syncData ? this.parseSnippets(lastSyncUserData.syncData) : null;
        if (lastSyncSnippets === null) {
            return true;
        }
        const local = await this.getSnippetsFileContents();
        const localSnippets = this.toSnippetsContents(local);
        const mergeResult = merge(localSnippets, lastSyncSnippets, lastSyncSnippets);
        return Object.keys(mergeResult.remote.added).length > 0 || Object.keys(mergeResult.remote.updated).length > 0 || mergeResult.remote.removed.length > 0 || mergeResult.conflicts.length > 0;
    }
    async getMergeResult(resourcePreview, token) {
        return resourcePreview.previewResult;
    }
    async getAcceptResult(resourcePreview, resource, content, token) {
        if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }))) {
            return {
                content: resourcePreview.fileContent ? resourcePreview.fileContent.value.toString() : null,
                localChange: 0,
                remoteChange: resourcePreview.fileContent
                    ? resourcePreview.remoteContent !== null ? 2 : 1
                    : 3
            };
        }
        if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }))) {
            return {
                content: resourcePreview.remoteContent,
                localChange: resourcePreview.remoteContent !== null
                    ? resourcePreview.fileContent ? 2 : 1
                    : 3,
                remoteChange: 0,
            };
        }
        if (this.extUri.isEqualOrParent(resource, this.syncPreviewFolder)) {
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
                    localChange: content === null
                        ? resourcePreview.fileContent !== null ? 3 : 0
                        : 2,
                    remoteChange: content === null
                        ? resourcePreview.remoteContent !== null ? 3 : 0
                        : 2
                };
            }
        }
        throw new Error(`Invalid Resource: ${resource.toString()}`);
    }
    async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
        const accptedResourcePreviews = resourcePreviews.map(([resourcePreview, acceptResult]) => ({ ...resourcePreview, acceptResult }));
        if (accptedResourcePreviews.every(({ localChange, remoteChange }) => localChange === 0 && remoteChange === 0)) {
            this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing snippets.`);
        }
        if (accptedResourcePreviews.some(({ localChange }) => localChange !== 0)) {
            await this.updateLocalBackup(accptedResourcePreviews);
            await this.updateLocalSnippets(accptedResourcePreviews, force);
        }
        if (accptedResourcePreviews.some(({ remoteChange }) => remoteChange !== 0)) {
            remoteUserData = await this.updateRemoteSnippets(accptedResourcePreviews, remoteUserData, force);
        }
        if (lastSyncUserData?.ref !== remoteUserData.ref) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized snippets...`);
            await this.updateLastSyncUserData(remoteUserData);
            this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized snippets`);
        }
        for (const { previewResource } of accptedResourcePreviews) {
            try {
                await this.fileService.del(previewResource);
            }
            catch (e) { }
        }
    }
    getResourcePreviews(snippetsMergeResult, localFileContent, remoteSnippets, baseSnippets) {
        const resourcePreviews = new Map();
        for (const key of Object.keys(snippetsMergeResult.local.added)) {
            const previewResult = {
                content: snippetsMergeResult.local.added[key],
                hasConflicts: false,
                localChange: 1,
                remoteChange: 0,
            };
            resourcePreviews.set(key, {
                baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' }),
                baseContent: null,
                fileContent: null,
                localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }),
                localContent: null,
                remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                remoteContent: remoteSnippets[key],
                previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                previewResult,
                localChange: previewResult.localChange,
                remoteChange: previewResult.remoteChange,
                acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' })
            });
        }
        for (const key of Object.keys(snippetsMergeResult.local.updated)) {
            const previewResult = {
                content: snippetsMergeResult.local.updated[key],
                hasConflicts: false,
                localChange: 2,
                remoteChange: 0,
            };
            const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
            resourcePreviews.set(key, {
                baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' }),
                baseContent: baseSnippets[key] ?? null,
                localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }),
                fileContent: localFileContent[key],
                localContent,
                remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                remoteContent: remoteSnippets[key],
                previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                previewResult,
                localChange: previewResult.localChange,
                remoteChange: previewResult.remoteChange,
                acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' })
            });
        }
        for (const key of snippetsMergeResult.local.removed) {
            const previewResult = {
                content: null,
                hasConflicts: false,
                localChange: 3,
                remoteChange: 0,
            };
            const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
            resourcePreviews.set(key, {
                baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' }),
                baseContent: baseSnippets[key] ?? null,
                localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }),
                fileContent: localFileContent[key],
                localContent,
                remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                remoteContent: null,
                previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                previewResult,
                localChange: previewResult.localChange,
                remoteChange: previewResult.remoteChange,
                acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' })
            });
        }
        for (const key of Object.keys(snippetsMergeResult.remote.added)) {
            const previewResult = {
                content: snippetsMergeResult.remote.added[key],
                hasConflicts: false,
                localChange: 0,
                remoteChange: 1,
            };
            const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
            resourcePreviews.set(key, {
                baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' }),
                baseContent: baseSnippets[key] ?? null,
                localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }),
                fileContent: localFileContent[key],
                localContent,
                remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                remoteContent: null,
                previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                previewResult,
                localChange: previewResult.localChange,
                remoteChange: previewResult.remoteChange,
                acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' })
            });
        }
        for (const key of Object.keys(snippetsMergeResult.remote.updated)) {
            const previewResult = {
                content: snippetsMergeResult.remote.updated[key],
                hasConflicts: false,
                localChange: 0,
                remoteChange: 2,
            };
            const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
            resourcePreviews.set(key, {
                baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' }),
                baseContent: baseSnippets[key] ?? null,
                localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }),
                fileContent: localFileContent[key],
                localContent,
                remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                remoteContent: remoteSnippets[key],
                previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                previewResult,
                localChange: previewResult.localChange,
                remoteChange: previewResult.remoteChange,
                acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' })
            });
        }
        for (const key of snippetsMergeResult.remote.removed) {
            const previewResult = {
                content: null,
                hasConflicts: false,
                localChange: 0,
                remoteChange: 3,
            };
            resourcePreviews.set(key, {
                baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' }),
                baseContent: baseSnippets[key] ?? null,
                localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }),
                fileContent: null,
                localContent: null,
                remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                remoteContent: remoteSnippets[key],
                previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                previewResult,
                localChange: previewResult.localChange,
                remoteChange: previewResult.remoteChange,
                acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' })
            });
        }
        for (const key of snippetsMergeResult.conflicts) {
            const previewResult = {
                content: baseSnippets[key] ?? null,
                hasConflicts: true,
                localChange: localFileContent[key] ? 2 : 1,
                remoteChange: remoteSnippets[key] ? 2 : 1
            };
            const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
            resourcePreviews.set(key, {
                baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' }),
                baseContent: baseSnippets[key] ?? null,
                localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }),
                fileContent: localFileContent[key] || null,
                localContent,
                remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                remoteContent: remoteSnippets[key] || null,
                previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                previewResult,
                localChange: previewResult.localChange,
                remoteChange: previewResult.remoteChange,
                acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' })
            });
        }
        for (const key of Object.keys(localFileContent)) {
            if (!resourcePreviews.has(key)) {
                const previewResult = {
                    content: localFileContent[key] ? localFileContent[key].value.toString() : null,
                    hasConflicts: false,
                    localChange: 0,
                    remoteChange: 0
                };
                const localContent = localFileContent[key] ? localFileContent[key].value.toString() : null;
                resourcePreviews.set(key, {
                    baseResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' }),
                    baseContent: baseSnippets[key] ?? null,
                    localResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }),
                    fileContent: localFileContent[key] || null,
                    localContent,
                    remoteResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }),
                    remoteContent: remoteSnippets[key] || null,
                    previewResource: this.extUri.joinPath(this.syncPreviewFolder, key),
                    previewResult,
                    localChange: previewResult.localChange,
                    remoteChange: previewResult.remoteChange,
                    acceptedResource: this.extUri.joinPath(this.syncPreviewFolder, key).with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' })
                });
            }
        }
        return [...resourcePreviews.values()];
    }
    async resolveContent(uri) {
        if (this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' }))
            || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' }))
            || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' }))
            || this.extUri.isEqualOrParent(uri, this.syncPreviewFolder.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' }))) {
            return this.resolvePreviewContent(uri);
        }
        return null;
    }
    async hasLocalData() {
        try {
            const localSnippets = await this.getSnippetsFileContents();
            if (Object.keys(localSnippets).length) {
                return true;
            }
        }
        catch (error) {
        }
        return false;
    }
    async updateLocalBackup(resourcePreviews) {
        const local = {};
        for (const resourcePreview of resourcePreviews) {
            if (resourcePreview.fileContent) {
                local[this.extUri.basename(resourcePreview.localResource)] = resourcePreview.fileContent;
            }
        }
        await this.backupLocal(JSON.stringify(this.toSnippetsContents(local)));
    }
    async updateLocalSnippets(resourcePreviews, force) {
        for (const { fileContent, acceptResult, localResource, remoteResource, localChange } of resourcePreviews) {
            if (localChange !== 0) {
                const key = remoteResource ? this.extUri.basename(remoteResource) : this.extUri.basename(localResource);
                const resource = this.extUri.joinPath(this.snippetsFolder, key);
                if (localChange === 3) {
                    this.logService.trace(`${this.syncResourceLogLabel}: Deleting snippet...`, this.extUri.basename(resource));
                    await this.fileService.del(resource);
                    this.logService.info(`${this.syncResourceLogLabel}: Deleted snippet`, this.extUri.basename(resource));
                }
                else if (localChange === 1) {
                    this.logService.trace(`${this.syncResourceLogLabel}: Creating snippet...`, this.extUri.basename(resource));
                    await this.fileService.createFile(resource, VSBuffer.fromString(acceptResult.content), { overwrite: force });
                    this.logService.info(`${this.syncResourceLogLabel}: Created snippet`, this.extUri.basename(resource));
                }
                else {
                    this.logService.trace(`${this.syncResourceLogLabel}: Updating snippet...`, this.extUri.basename(resource));
                    await this.fileService.writeFile(resource, VSBuffer.fromString(acceptResult.content), force ? undefined : fileContent);
                    this.logService.info(`${this.syncResourceLogLabel}: Updated snippet`, this.extUri.basename(resource));
                }
            }
        }
    }
    async updateRemoteSnippets(resourcePreviews, remoteUserData, forcePush) {
        const currentSnippets = remoteUserData.syncData ? this.parseSnippets(remoteUserData.syncData) : {};
        const newSnippets = deepClone(currentSnippets);
        for (const { acceptResult, localResource, remoteResource, remoteChange } of resourcePreviews) {
            if (remoteChange !== 0) {
                const key = localResource ? this.extUri.basename(localResource) : this.extUri.basename(remoteResource);
                if (remoteChange === 3) {
                    delete newSnippets[key];
                }
                else {
                    newSnippets[key] = acceptResult.content;
                }
            }
        }
        if (!areSame(currentSnippets, newSnippets)) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating remote snippets...`);
            remoteUserData = await this.updateRemoteUserData(JSON.stringify(newSnippets), forcePush ? null : remoteUserData.ref);
            this.logService.info(`${this.syncResourceLogLabel}: Updated remote snippets`);
        }
        return remoteUserData;
    }
    parseSnippets(syncData) {
        return parseSnippets(syncData);
    }
    toSnippetsContents(snippetsFileContents) {
        const snippets = {};
        for (const key of Object.keys(snippetsFileContents)) {
            snippets[key] = snippetsFileContents[key].value.toString();
        }
        return snippets;
    }
    async getSnippetsFileContents() {
        const snippets = {};
        let stat;
        try {
            stat = await this.fileService.resolve(this.snippetsFolder);
        }
        catch (e) {
            if (e instanceof FileOperationError && e.fileOperationResult === 1) {
                return snippets;
            }
            else {
                throw e;
            }
        }
        for (const entry of stat.children || []) {
            const resource = entry.resource;
            const extension = this.extUri.extname(resource);
            if (extension === '.json' || extension === '.code-snippets') {
                const key = this.extUri.relativePath(this.snippetsFolder, resource);
                const content = await this.fileService.readFile(resource);
                snippets[key] = content;
            }
        }
        return snippets;
    }
};
SnippetsSynchroniser = __decorate([
    __param(2, IEnvironmentService),
    __param(3, IFileService),
    __param(4, IStorageService),
    __param(5, IUserDataSyncStoreService),
    __param(6, IUserDataSyncLocalStoreService),
    __param(7, IUserDataSyncLogService),
    __param(8, IConfigurationService),
    __param(9, IUserDataSyncEnablementService),
    __param(10, ITelemetryService),
    __param(11, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], SnippetsSynchroniser);
export { SnippetsSynchroniser };
let SnippetsInitializer = class SnippetsInitializer extends AbstractInitializer {
    constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
        super("snippets", userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
    }
    async doInitialize(remoteUserData) {
        const remoteSnippets = remoteUserData.syncData ? JSON.parse(remoteUserData.syncData.content) : null;
        if (!remoteSnippets) {
            this.logService.info('Skipping initializing snippets because remote snippets does not exist.');
            return;
        }
        const isEmpty = await this.isEmpty();
        if (!isEmpty) {
            this.logService.info('Skipping initializing snippets because local snippets exist.');
            return;
        }
        for (const key of Object.keys(remoteSnippets)) {
            const content = remoteSnippets[key];
            if (content) {
                const resource = this.extUri.joinPath(this.userDataProfilesService.defaultProfile.snippetsHome, key);
                await this.fileService.createFile(resource, VSBuffer.fromString(content));
                this.logService.info('Created snippet', this.extUri.basename(resource));
            }
        }
        await this.updateLastSyncUserData(remoteUserData);
    }
    async isEmpty() {
        try {
            const stat = await this.fileService.resolve(this.userDataProfilesService.defaultProfile.snippetsHome);
            return !stat.children?.length;
        }
        catch (error) {
            return error.fileOperationResult === 1;
        }
    }
};
SnippetsInitializer = __decorate([
    __param(0, IFileService),
    __param(1, IUserDataProfilesService),
    __param(2, IEnvironmentService),
    __param(3, IUserDataSyncLogService),
    __param(4, IStorageService),
    __param(5, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], SnippetsInitializer);
export { SnippetsInitializer };
