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
var UserDataSyncResourceProviderService_1;
import { URI } from '../../../base/common/uri.js';
import { localize } from '../../../nls.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { getServiceMachineId } from '../../externalServices/common/serviceMachineId.js';
import { IStorageService } from '../../storage/common/storage.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService, UserDataSyncError, USER_DATA_SYNC_SCHEME, CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM } from './userDataSync.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { isSyncData } from './abstractSynchronizer.js';
import { parseSnippets } from './snippetsSync.js';
import { parseSettingsSyncContent } from './settingsSync.js';
import { getKeybindingsContentFromSyncContent } from './keybindingsSync.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { getTasksContentFromSyncContent } from './tasksSync.js';
import { LocalExtensionsProvider, parseExtensions, stringify as stringifyExtensions } from './extensionsSync.js';
import { LocalGlobalStateProvider, stringify as stringifyGlobalState } from './globalStateSync.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { parseUserDataProfilesManifest, stringifyLocalProfiles } from './userDataProfilesManifestSync.js';
import { toFormattedString } from '../../../base/common/jsonFormatter.js';
import { trim } from '../../../base/common/strings.js';
let UserDataSyncResourceProviderService = class UserDataSyncResourceProviderService {
    static { UserDataSyncResourceProviderService_1 = this; }
    static { this.NOT_EXISTING_RESOURCE = 'not-existing-resource'; }
    static { this.REMOTE_BACKUP_AUTHORITY = 'remote-backup'; }
    static { this.LOCAL_BACKUP_AUTHORITY = 'local-backup'; }
    constructor(userDataSyncStoreService, userDataSyncLocalStoreService, logService, uriIdentityService, environmentService, storageService, fileService, userDataProfilesService, configurationService, instantiationService) {
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.userDataSyncLocalStoreService = userDataSyncLocalStoreService;
        this.logService = logService;
        this.environmentService = environmentService;
        this.storageService = storageService;
        this.fileService = fileService;
        this.userDataProfilesService = userDataProfilesService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.extUri = uriIdentityService.extUri;
    }
    async getRemoteSyncedProfiles() {
        const userData = await this.userDataSyncStoreService.readResource("profiles" /* SyncResource.Profiles */, null, undefined);
        if (userData.content) {
            const syncData = this.parseSyncData(userData.content, "profiles" /* SyncResource.Profiles */);
            return parseUserDataProfilesManifest(syncData);
        }
        return [];
    }
    async getLocalSyncedProfiles(location) {
        const refs = await this.userDataSyncLocalStoreService.getAllResourceRefs("profiles" /* SyncResource.Profiles */, undefined, location);
        if (refs.length) {
            const content = await this.userDataSyncLocalStoreService.resolveResourceContent("profiles" /* SyncResource.Profiles */, refs[0].ref, undefined, location);
            if (content) {
                const syncData = this.parseSyncData(content, "profiles" /* SyncResource.Profiles */);
                return parseUserDataProfilesManifest(syncData);
            }
        }
        return [];
    }
    async getLocalSyncedMachines(location) {
        const refs = await this.userDataSyncLocalStoreService.getAllResourceRefs('machines', undefined, location);
        if (refs.length) {
            const content = await this.userDataSyncLocalStoreService.resolveResourceContent('machines', refs[0].ref, undefined, location);
            if (content) {
                const machinesData = JSON.parse(content);
                return machinesData.machines.map(m => ({ ...m, isCurrent: false }));
            }
        }
        return [];
    }
    async getRemoteSyncResourceHandles(syncResource, profile) {
        const handles = await this.userDataSyncStoreService.getAllResourceRefs(syncResource, profile?.collection);
        return handles.map(({ created, ref }) => ({
            created,
            uri: this.toUri({
                remote: true,
                syncResource,
                profile: profile?.id ?? this.userDataProfilesService.defaultProfile.id,
                location: undefined,
                collection: profile?.collection,
                ref,
                node: undefined,
            })
        }));
    }
    async getLocalSyncResourceHandles(syncResource, profile, location) {
        const handles = await this.userDataSyncLocalStoreService.getAllResourceRefs(syncResource, profile?.collection, location);
        return handles.map(({ created, ref }) => ({
            created,
            uri: this.toUri({
                remote: false,
                syncResource,
                profile: profile?.id ?? this.userDataProfilesService.defaultProfile.id,
                collection: profile?.collection,
                ref,
                node: undefined,
                location,
            })
        }));
    }
    resolveUserDataSyncResource({ uri }) {
        const resolved = this.resolveUri(uri);
        const profile = resolved ? this.userDataProfilesService.profiles.find(p => p.id === resolved.profile) : undefined;
        return resolved && profile ? { profile, syncResource: resolved?.syncResource } : undefined;
    }
    async getAssociatedResources({ uri }) {
        const resolved = this.resolveUri(uri);
        if (!resolved) {
            return [];
        }
        const profile = this.userDataProfilesService.profiles.find(p => p.id === resolved.profile);
        switch (resolved.syncResource) {
            case "settings" /* SyncResource.Settings */: return this.getSettingsAssociatedResources(uri, profile);
            case "keybindings" /* SyncResource.Keybindings */: return this.getKeybindingsAssociatedResources(uri, profile);
            case "tasks" /* SyncResource.Tasks */: return this.getTasksAssociatedResources(uri, profile);
            case "snippets" /* SyncResource.Snippets */: return this.getSnippetsAssociatedResources(uri, profile);
            case "globalState" /* SyncResource.GlobalState */: return this.getGlobalStateAssociatedResources(uri, profile);
            case "extensions" /* SyncResource.Extensions */: return this.getExtensionsAssociatedResources(uri, profile);
            case "profiles" /* SyncResource.Profiles */: return this.getProfilesAssociatedResources(uri, profile);
            case "workspaceState" /* SyncResource.WorkspaceState */: return [];
        }
    }
    async getMachineId({ uri }) {
        const resolved = this.resolveUri(uri);
        if (!resolved) {
            return undefined;
        }
        if (resolved.remote) {
            if (resolved.ref) {
                const { content } = await this.getUserData(resolved.syncResource, resolved.ref, resolved.collection);
                if (content) {
                    const syncData = this.parseSyncData(content, resolved.syncResource);
                    return syncData?.machineId;
                }
            }
            return undefined;
        }
        if (resolved.location) {
            if (resolved.ref) {
                const content = await this.userDataSyncLocalStoreService.resolveResourceContent(resolved.syncResource, resolved.ref, resolved.collection, resolved.location);
                if (content) {
                    const syncData = this.parseSyncData(content, resolved.syncResource);
                    return syncData?.machineId;
                }
            }
            return undefined;
        }
        return getServiceMachineId(this.environmentService, this.fileService, this.storageService);
    }
    async resolveContent(uri) {
        const resolved = this.resolveUri(uri);
        if (!resolved) {
            return null;
        }
        if (resolved.node === UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE) {
            return null;
        }
        if (resolved.ref) {
            const content = await this.getContentFromStore(resolved.remote, resolved.syncResource, resolved.collection, resolved.ref, resolved.location);
            if (resolved.node && content) {
                return this.resolveNodeContent(resolved.syncResource, content, resolved.node);
            }
            return content;
        }
        if (!resolved.remote && !resolved.node) {
            return this.resolveLatestContent(resolved.syncResource, resolved.profile);
        }
        return null;
    }
    async getContentFromStore(remote, syncResource, collection, ref, location) {
        if (remote) {
            const { content } = await this.getUserData(syncResource, ref, collection);
            return content;
        }
        return this.userDataSyncLocalStoreService.resolveResourceContent(syncResource, ref, collection, location);
    }
    resolveNodeContent(syncResource, content, node) {
        const syncData = this.parseSyncData(content, syncResource);
        switch (syncResource) {
            case "settings" /* SyncResource.Settings */: return this.resolveSettingsNodeContent(syncData, node);
            case "keybindings" /* SyncResource.Keybindings */: return this.resolveKeybindingsNodeContent(syncData, node);
            case "tasks" /* SyncResource.Tasks */: return this.resolveTasksNodeContent(syncData, node);
            case "snippets" /* SyncResource.Snippets */: return this.resolveSnippetsNodeContent(syncData, node);
            case "globalState" /* SyncResource.GlobalState */: return this.resolveGlobalStateNodeContent(syncData, node);
            case "extensions" /* SyncResource.Extensions */: return this.resolveExtensionsNodeContent(syncData, node);
            case "profiles" /* SyncResource.Profiles */: return this.resolveProfileNodeContent(syncData, node);
            case "workspaceState" /* SyncResource.WorkspaceState */: return null;
        }
    }
    async resolveLatestContent(syncResource, profileId) {
        const profile = this.userDataProfilesService.profiles.find(p => p.id === profileId);
        if (!profile) {
            return null;
        }
        switch (syncResource) {
            case "globalState" /* SyncResource.GlobalState */: return this.resolveLatestGlobalStateContent(profile);
            case "extensions" /* SyncResource.Extensions */: return this.resolveLatestExtensionsContent(profile);
            case "profiles" /* SyncResource.Profiles */: return this.resolveLatestProfilesContent(profile);
            case "settings" /* SyncResource.Settings */: return null;
            case "keybindings" /* SyncResource.Keybindings */: return null;
            case "tasks" /* SyncResource.Tasks */: return null;
            case "snippets" /* SyncResource.Snippets */: return null;
            case "workspaceState" /* SyncResource.WorkspaceState */: return null;
        }
    }
    getSettingsAssociatedResources(uri, profile) {
        const resource = this.extUri.joinPath(uri, 'settings.json');
        const comparableResource = profile ? profile.settingsResource : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
        return [{ resource, comparableResource }];
    }
    resolveSettingsNodeContent(syncData, node) {
        switch (node) {
            case 'settings.json':
                return parseSettingsSyncContent(syncData.content).settings;
        }
        return null;
    }
    getKeybindingsAssociatedResources(uri, profile) {
        const resource = this.extUri.joinPath(uri, 'keybindings.json');
        const comparableResource = profile ? profile.keybindingsResource : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
        return [{ resource, comparableResource }];
    }
    resolveKeybindingsNodeContent(syncData, node) {
        switch (node) {
            case 'keybindings.json':
                return getKeybindingsContentFromSyncContent(syncData.content, !!this.configurationService.getValue(CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM), this.logService);
        }
        return null;
    }
    getTasksAssociatedResources(uri, profile) {
        const resource = this.extUri.joinPath(uri, 'tasks.json');
        const comparableResource = profile ? profile.tasksResource : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
        return [{ resource, comparableResource }];
    }
    resolveTasksNodeContent(syncData, node) {
        switch (node) {
            case 'tasks.json':
                return getTasksContentFromSyncContent(syncData.content, this.logService);
        }
        return null;
    }
    async getSnippetsAssociatedResources(uri, profile) {
        const content = await this.resolveContent(uri);
        if (content) {
            const syncData = this.parseSyncData(content, "snippets" /* SyncResource.Snippets */);
            if (syncData) {
                const snippets = parseSnippets(syncData);
                const result = [];
                for (const snippet of Object.keys(snippets)) {
                    const resource = this.extUri.joinPath(uri, snippet);
                    const comparableResource = profile ? this.extUri.joinPath(profile.snippetsHome, snippet) : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
                    result.push({ resource, comparableResource });
                }
                return result;
            }
        }
        return [];
    }
    resolveSnippetsNodeContent(syncData, node) {
        return parseSnippets(syncData)[node] || null;
    }
    getExtensionsAssociatedResources(uri, profile) {
        const resource = this.extUri.joinPath(uri, 'extensions.json');
        const comparableResource = profile
            ? this.toUri({
                remote: false,
                syncResource: "extensions" /* SyncResource.Extensions */,
                profile: profile.id,
                location: undefined,
                collection: undefined,
                ref: undefined,
                node: undefined,
            })
            : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
        return [{ resource, comparableResource }];
    }
    resolveExtensionsNodeContent(syncData, node) {
        switch (node) {
            case 'extensions.json':
                return stringifyExtensions(parseExtensions(syncData), true);
        }
        return null;
    }
    async resolveLatestExtensionsContent(profile) {
        const { localExtensions } = await this.instantiationService.createInstance(LocalExtensionsProvider).getLocalExtensions(profile);
        return stringifyExtensions(localExtensions, true);
    }
    getGlobalStateAssociatedResources(uri, profile) {
        const resource = this.extUri.joinPath(uri, 'globalState.json');
        const comparableResource = profile
            ? this.toUri({
                remote: false,
                syncResource: "globalState" /* SyncResource.GlobalState */,
                profile: profile.id,
                location: undefined,
                collection: undefined,
                ref: undefined,
                node: undefined,
            })
            : this.extUri.joinPath(uri, UserDataSyncResourceProviderService_1.NOT_EXISTING_RESOURCE);
        return [{ resource, comparableResource }];
    }
    resolveGlobalStateNodeContent(syncData, node) {
        switch (node) {
            case 'globalState.json':
                return stringifyGlobalState(JSON.parse(syncData.content), true);
        }
        return null;
    }
    async resolveLatestGlobalStateContent(profile) {
        const localGlobalState = await this.instantiationService.createInstance(LocalGlobalStateProvider).getLocalGlobalState(profile);
        return stringifyGlobalState(localGlobalState, true);
    }
    getProfilesAssociatedResources(uri, profile) {
        const resource = this.extUri.joinPath(uri, 'profiles.json');
        const comparableResource = this.toUri({
            remote: false,
            syncResource: "profiles" /* SyncResource.Profiles */,
            profile: this.userDataProfilesService.defaultProfile.id,
            location: undefined,
            collection: undefined,
            ref: undefined,
            node: undefined,
        });
        return [{ resource, comparableResource }];
    }
    resolveProfileNodeContent(syncData, node) {
        switch (node) {
            case 'profiles.json':
                return toFormattedString(JSON.parse(syncData.content), {});
        }
        return null;
    }
    async resolveLatestProfilesContent(profile) {
        return stringifyLocalProfiles(this.userDataProfilesService.profiles.filter(p => !p.isDefault && !p.isTransient), true);
    }
    toUri(syncResourceUriInfo) {
        const authority = syncResourceUriInfo.remote ? UserDataSyncResourceProviderService_1.REMOTE_BACKUP_AUTHORITY : UserDataSyncResourceProviderService_1.LOCAL_BACKUP_AUTHORITY;
        const paths = [];
        if (syncResourceUriInfo.location) {
            paths.push(`scheme:${syncResourceUriInfo.location.scheme}`);
            paths.push(`authority:${syncResourceUriInfo.location.authority}`);
            paths.push(trim(syncResourceUriInfo.location.path, '/'));
        }
        paths.push(`syncResource:${syncResourceUriInfo.syncResource}`);
        paths.push(`profile:${syncResourceUriInfo.profile}`);
        if (syncResourceUriInfo.collection) {
            paths.push(`collection:${syncResourceUriInfo.collection}`);
        }
        if (syncResourceUriInfo.ref) {
            paths.push(`ref:${syncResourceUriInfo.ref}`);
        }
        if (syncResourceUriInfo.node) {
            paths.push(syncResourceUriInfo.node);
        }
        return this.extUri.joinPath(URI.from({ scheme: USER_DATA_SYNC_SCHEME, authority, path: `/`, query: syncResourceUriInfo.location?.query, fragment: syncResourceUriInfo.location?.fragment }), ...paths);
    }
    resolveUri(uri) {
        if (uri.scheme !== USER_DATA_SYNC_SCHEME) {
            return undefined;
        }
        const paths = [];
        while (uri.path !== '/') {
            paths.unshift(this.extUri.basename(uri));
            uri = this.extUri.dirname(uri);
        }
        if (paths.length < 2) {
            return undefined;
        }
        const remote = uri.authority === UserDataSyncResourceProviderService_1.REMOTE_BACKUP_AUTHORITY;
        let scheme;
        let authority;
        const locationPaths = [];
        let syncResource;
        let profile;
        let collection;
        let ref;
        let node;
        while (paths.length) {
            const path = paths.shift();
            if (path.startsWith('scheme:')) {
                scheme = path.substring('scheme:'.length);
            }
            else if (path.startsWith('authority:')) {
                authority = path.substring('authority:'.length);
            }
            else if (path.startsWith('syncResource:')) {
                syncResource = path.substring('syncResource:'.length);
            }
            else if (path.startsWith('profile:')) {
                profile = path.substring('profile:'.length);
            }
            else if (path.startsWith('collection:')) {
                collection = path.substring('collection:'.length);
            }
            else if (path.startsWith('ref:')) {
                ref = path.substring('ref:'.length);
            }
            else if (!syncResource) {
                locationPaths.push(path);
            }
            else {
                node = path;
            }
        }
        return {
            remote,
            syncResource: syncResource,
            profile: profile,
            collection,
            ref,
            node,
            location: scheme && authority !== undefined ? this.extUri.joinPath(URI.from({ scheme, authority, query: uri.query, fragment: uri.fragment, path: '/' }), ...locationPaths) : undefined
        };
    }
    parseSyncData(content, syncResource) {
        try {
            const syncData = JSON.parse(content);
            if (isSyncData(syncData)) {
                return syncData;
            }
        }
        catch (error) {
            this.logService.error(error);
        }
        throw new UserDataSyncError(localize('incompatible sync data', "Cannot parse sync data as it is not compatible with the current version."), "IncompatibleRemoteContent" /* UserDataSyncErrorCode.IncompatibleRemoteContent */, syncResource);
    }
    async getUserData(syncResource, ref, collection) {
        const content = await this.userDataSyncStoreService.resolveResourceContent(syncResource, ref, collection);
        return { ref, content };
    }
};
UserDataSyncResourceProviderService = UserDataSyncResourceProviderService_1 = __decorate([
    __param(0, IUserDataSyncStoreService),
    __param(1, IUserDataSyncLocalStoreService),
    __param(2, IUserDataSyncLogService),
    __param(3, IUriIdentityService),
    __param(4, IEnvironmentService),
    __param(5, IStorageService),
    __param(6, IFileService),
    __param(7, IUserDataProfilesService),
    __param(8, IConfigurationService),
    __param(9, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserDataSyncResourceProviderService);
export { UserDataSyncResourceProviderService };
