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
import { Promises } from '../../../base/common/async.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { getErrorMessage } from '../../../base/common/errors.js';
import { Event } from '../../../base/common/event.js';
import { toFormattedString } from '../../../base/common/jsonFormatter.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { compare } from '../../../base/common/strings.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { GlobalExtensionEnablementService } from '../../extensionManagement/common/extensionEnablementService.js';
import { IExtensionGalleryService, IExtensionManagementService, ExtensionManagementError, DISABLED_EXTENSIONS_STORAGE_PATH, EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT, EXTENSION_INSTALL_SOURCE_CONTEXT } from '../../extensionManagement/common/extensionManagement.js';
import { areSameExtensions } from '../../extensionManagement/common/extensionManagementUtil.js';
import { ExtensionStorageService, IExtensionStorageService } from '../../extensionManagement/common/extensionStorage.js';
import { isApplicationScopedExtension } from '../../extensions/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ServiceCollection } from '../../instantiation/common/serviceCollection.js';
import { ILogService } from '../../log/common/log.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractInitializer, AbstractSynchroniser, getSyncResourceLogLabel } from './abstractSynchronizer.js';
import { merge } from './extensionsMerge.js';
import { IIgnoredExtensionsManagementService } from './ignoredExtensions.js';
import { IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, USER_DATA_SYNC_SCHEME } from './userDataSync.js';
import { IUserDataProfileStorageService } from '../../userDataProfile/common/userDataProfileStorageService.js';
async function parseAndMigrateExtensions(syncData, extensionManagementService) {
    const extensions = JSON.parse(syncData.content);
    if (syncData.version === 1
        || syncData.version === 2) {
        const builtinExtensions = (await extensionManagementService.getInstalled(0)).filter(e => e.isBuiltin);
        for (const extension of extensions) {
            if (syncData.version === 1) {
                if (extension.enabled === false) {
                    extension.disabled = true;
                }
                delete extension.enabled;
            }
            if (syncData.version === 2) {
                if (builtinExtensions.every(installed => !areSameExtensions(installed.identifier, extension.identifier))) {
                    extension.installed = true;
                }
            }
        }
    }
    return extensions;
}
export function parseExtensions(syncData) {
    return JSON.parse(syncData.content);
}
export function stringify(extensions, format) {
    extensions.sort((e1, e2) => {
        if (!e1.identifier.uuid && e2.identifier.uuid) {
            return -1;
        }
        if (e1.identifier.uuid && !e2.identifier.uuid) {
            return 1;
        }
        return compare(e1.identifier.id, e2.identifier.id);
    });
    return format ? toFormattedString(extensions, {}) : JSON.stringify(extensions);
}
let ExtensionsSynchroniser = class ExtensionsSynchroniser extends AbstractSynchroniser {
    constructor(profile, collection, environmentService, fileService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, extensionManagementService, ignoredExtensionsManagementService, logService, configurationService, userDataSyncEnablementService, telemetryService, extensionStorageService, uriIdentityService, userDataProfileStorageService, instantiationService) {
        super({ syncResource: "extensions", profile }, collection, fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
        this.extensionManagementService = extensionManagementService;
        this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
        this.instantiationService = instantiationService;
        this.version = 6;
        this.previewResource = this.extUri.joinPath(this.syncPreviewFolder, 'extensions.json');
        this.baseResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'base' });
        this.localResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'local' });
        this.remoteResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'remote' });
        this.acceptedResource = this.previewResource.with({ scheme: USER_DATA_SYNC_SCHEME, authority: 'accepted' });
        this.localExtensionsProvider = this.instantiationService.createInstance(LocalExtensionsProvider);
        this._register(Event.any(Event.filter(this.extensionManagementService.onDidInstallExtensions, (e => e.some(({ local }) => !!local))), Event.filter(this.extensionManagementService.onDidUninstallExtension, (e => !e.error)), Event.filter(userDataProfileStorageService.onDidChange, e => e.valueChanges.some(({ profile, changes }) => this.syncResource.profile.id === profile.id && changes.some(change => change.key === DISABLED_EXTENSIONS_STORAGE_PATH))), extensionStorageService.onDidChangeExtensionStorageToSync)(() => this.triggerLocalChange()));
    }
    async generateSyncPreview(remoteUserData, lastSyncUserData) {
        const remoteExtensions = remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
        const skippedExtensions = lastSyncUserData?.skippedExtensions ?? [];
        const builtinExtensions = lastSyncUserData?.builtinExtensions ?? null;
        const lastSyncExtensions = lastSyncUserData?.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
        const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
        if (remoteExtensions) {
            this.logService.trace(`${this.syncResourceLogLabel}: Merging remote extensions with local extensions...`);
        }
        else {
            this.logService.trace(`${this.syncResourceLogLabel}: Remote extensions does not exist. Synchronizing extensions for the first time.`);
        }
        const { local, remote } = merge(localExtensions, remoteExtensions, lastSyncExtensions, skippedExtensions, ignoredExtensions, builtinExtensions);
        const previewResult = {
            local, remote,
            content: this.getPreviewContent(localExtensions, local.added, local.updated, local.removed),
            localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 : 0,
            remoteChange: remote !== null ? 2 : 0,
        };
        const localContent = this.stringify(localExtensions, false);
        return [{
                skippedExtensions,
                builtinExtensions,
                baseResource: this.baseResource,
                baseContent: lastSyncExtensions ? this.stringify(lastSyncExtensions, false) : localContent,
                localResource: this.localResource,
                localContent,
                localExtensions,
                remoteResource: this.remoteResource,
                remoteExtensions,
                remoteContent: remoteExtensions ? this.stringify(remoteExtensions, false) : null,
                previewResource: this.previewResource,
                previewResult,
                localChange: previewResult.localChange,
                remoteChange: previewResult.remoteChange,
                acceptedResource: this.acceptedResource,
            }];
    }
    async hasRemoteChanged(lastSyncUserData) {
        const lastSyncExtensions = lastSyncUserData.syncData ? await parseAndMigrateExtensions(lastSyncUserData.syncData, this.extensionManagementService) : null;
        const { localExtensions, ignoredExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
        const { remote } = merge(localExtensions, lastSyncExtensions, lastSyncExtensions, lastSyncUserData.skippedExtensions || [], ignoredExtensions, lastSyncUserData.builtinExtensions || []);
        return remote !== null;
    }
    getPreviewContent(localExtensions, added, updated, removed) {
        const preview = [...added, ...updated];
        const idsOrUUIDs = new Set();
        const addIdentifier = (identifier) => {
            idsOrUUIDs.add(identifier.id.toLowerCase());
            if (identifier.uuid) {
                idsOrUUIDs.add(identifier.uuid);
            }
        };
        preview.forEach(({ identifier }) => addIdentifier(identifier));
        removed.forEach(addIdentifier);
        for (const localExtension of localExtensions) {
            if (idsOrUUIDs.has(localExtension.identifier.id.toLowerCase()) || (localExtension.identifier.uuid && idsOrUUIDs.has(localExtension.identifier.uuid))) {
                continue;
            }
            preview.push(localExtension);
        }
        return this.stringify(preview, false);
    }
    async getMergeResult(resourcePreview, token) {
        return { ...resourcePreview.previewResult, hasConflicts: false };
    }
    async getAcceptResult(resourcePreview, resource, content, token) {
        if (this.extUri.isEqual(resource, this.localResource)) {
            return this.acceptLocal(resourcePreview);
        }
        if (this.extUri.isEqual(resource, this.remoteResource)) {
            return this.acceptRemote(resourcePreview);
        }
        if (this.extUri.isEqual(resource, this.previewResource)) {
            return resourcePreview.previewResult;
        }
        throw new Error(`Invalid Resource: ${resource.toString()}`);
    }
    async acceptLocal(resourcePreview) {
        const installedExtensions = await this.extensionManagementService.getInstalled(undefined, this.syncResource.profile.extensionsResource);
        const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
        const mergeResult = merge(resourcePreview.localExtensions, null, null, resourcePreview.skippedExtensions, ignoredExtensions, resourcePreview.builtinExtensions);
        const { local, remote } = mergeResult;
        return {
            content: resourcePreview.localContent,
            local,
            remote,
            localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 : 0,
            remoteChange: remote !== null ? 2 : 0,
        };
    }
    async acceptRemote(resourcePreview) {
        const installedExtensions = await this.extensionManagementService.getInstalled(undefined, this.syncResource.profile.extensionsResource);
        const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
        const remoteExtensions = resourcePreview.remoteContent ? JSON.parse(resourcePreview.remoteContent) : null;
        if (remoteExtensions !== null) {
            const mergeResult = merge(resourcePreview.localExtensions, remoteExtensions, resourcePreview.localExtensions, [], ignoredExtensions, resourcePreview.builtinExtensions);
            const { local, remote } = mergeResult;
            return {
                content: resourcePreview.remoteContent,
                local,
                remote,
                localChange: local.added.length > 0 || local.removed.length > 0 || local.updated.length > 0 ? 2 : 0,
                remoteChange: remote !== null ? 2 : 0,
            };
        }
        else {
            return {
                content: resourcePreview.remoteContent,
                local: { added: [], removed: [], updated: [] },
                remote: null,
                localChange: 0,
                remoteChange: 0,
            };
        }
    }
    async applyResult(remoteUserData, lastSyncUserData, resourcePreviews, force) {
        let { skippedExtensions, builtinExtensions, localExtensions } = resourcePreviews[0][0];
        const { local, remote, localChange, remoteChange } = resourcePreviews[0][1];
        if (localChange === 0 && remoteChange === 0) {
            this.logService.info(`${this.syncResourceLogLabel}: No changes found during synchronizing extensions.`);
        }
        if (localChange !== 0) {
            await this.backupLocal(JSON.stringify(localExtensions));
            skippedExtensions = await this.localExtensionsProvider.updateLocalExtensions(local.added, local.removed, local.updated, skippedExtensions, this.syncResource.profile);
        }
        if (remote) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating remote extensions...`);
            const content = JSON.stringify(remote.all);
            remoteUserData = await this.updateRemoteUserData(content, force ? null : remoteUserData.ref);
            this.logService.info(`${this.syncResourceLogLabel}: Updated remote extensions.${remote.added.length ? ` Added: ${JSON.stringify(remote.added.map(e => e.identifier.id))}.` : ''}${remote.updated.length ? ` Updated: ${JSON.stringify(remote.updated.map(e => e.identifier.id))}.` : ''}${remote.removed.length ? ` Removed: ${JSON.stringify(remote.removed.map(e => e.identifier.id))}.` : ''}`);
        }
        if (lastSyncUserData?.ref !== remoteUserData.ref) {
            this.logService.trace(`${this.syncResourceLogLabel}: Updating last synchronized extensions...`);
            builtinExtensions = this.computeBuiltinExtensions(localExtensions, builtinExtensions);
            await this.updateLastSyncUserData(remoteUserData, { skippedExtensions, builtinExtensions });
            this.logService.info(`${this.syncResourceLogLabel}: Updated last synchronized extensions.${skippedExtensions.length ? ` Skipped: ${JSON.stringify(skippedExtensions.map(e => e.identifier.id))}.` : ''}`);
        }
    }
    computeBuiltinExtensions(localExtensions, previousBuiltinExtensions) {
        const localExtensionsSet = new Set();
        const builtinExtensions = [];
        for (const localExtension of localExtensions) {
            localExtensionsSet.add(localExtension.identifier.id.toLowerCase());
            if (!localExtension.installed) {
                builtinExtensions.push(localExtension.identifier);
            }
        }
        if (previousBuiltinExtensions) {
            for (const builtinExtension of previousBuiltinExtensions) {
                if (!localExtensionsSet.has(builtinExtension.id.toLowerCase())) {
                    builtinExtensions.push(builtinExtension);
                }
            }
        }
        return builtinExtensions;
    }
    async resolveContent(uri) {
        if (this.extUri.isEqual(this.remoteResource, uri)
            || this.extUri.isEqual(this.baseResource, uri)
            || this.extUri.isEqual(this.localResource, uri)
            || this.extUri.isEqual(this.acceptedResource, uri)) {
            const content = await this.resolvePreviewContent(uri);
            return content ? this.stringify(JSON.parse(content), true) : content;
        }
        return null;
    }
    stringify(extensions, format) {
        return stringify(extensions, format);
    }
    async hasLocalData() {
        try {
            const { localExtensions } = await this.localExtensionsProvider.getLocalExtensions(this.syncResource.profile);
            if (localExtensions.some(e => e.installed || e.disabled)) {
                return true;
            }
        }
        catch (error) {
        }
        return false;
    }
};
ExtensionsSynchroniser = __decorate([
    __param(2, IEnvironmentService),
    __param(3, IFileService),
    __param(4, IStorageService),
    __param(5, IUserDataSyncStoreService),
    __param(6, IUserDataSyncLocalStoreService),
    __param(7, IExtensionManagementService),
    __param(8, IIgnoredExtensionsManagementService),
    __param(9, IUserDataSyncLogService),
    __param(10, IConfigurationService),
    __param(11, IUserDataSyncEnablementService),
    __param(12, ITelemetryService),
    __param(13, IExtensionStorageService),
    __param(14, IUriIdentityService),
    __param(15, IUserDataProfileStorageService),
    __param(16, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ExtensionsSynchroniser);
export { ExtensionsSynchroniser };
let LocalExtensionsProvider = class LocalExtensionsProvider {
    constructor(extensionManagementService, userDataProfileStorageService, extensionGalleryService, ignoredExtensionsManagementService, instantiationService, logService) {
        this.extensionManagementService = extensionManagementService;
        this.userDataProfileStorageService = userDataProfileStorageService;
        this.extensionGalleryService = extensionGalleryService;
        this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
        this.instantiationService = instantiationService;
        this.logService = logService;
    }
    async getLocalExtensions(profile) {
        const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
        const ignoredExtensions = this.ignoredExtensionsManagementService.getIgnoredExtensions(installedExtensions);
        const localExtensions = await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
            const disabledExtensions = extensionEnablementService.getDisabledExtensions();
            return installedExtensions
                .map(extension => {
                const { identifier, isBuiltin, manifest, preRelease, pinned, isApplicationScoped } = extension;
                const syncExntesion = { identifier, preRelease, version: manifest.version, pinned: !!pinned };
                if (isApplicationScoped && !isApplicationScopedExtension(manifest)) {
                    syncExntesion.isApplicationScoped = isApplicationScoped;
                }
                if (disabledExtensions.some(disabledExtension => areSameExtensions(disabledExtension, identifier))) {
                    syncExntesion.disabled = true;
                }
                if (!isBuiltin) {
                    syncExntesion.installed = true;
                }
                try {
                    const keys = extensionStorageService.getKeysForSync({ id: identifier.id, version: manifest.version });
                    if (keys) {
                        const extensionStorageState = extensionStorageService.getExtensionState(extension, true) || {};
                        syncExntesion.state = Object.keys(extensionStorageState).reduce((state, key) => {
                            if (keys.includes(key)) {
                                state[key] = extensionStorageState[key];
                            }
                            return state;
                        }, {});
                    }
                }
                catch (error) {
                    this.logService.info(`${getSyncResourceLogLabel("extensions", profile)}: Error while parsing extension state`, getErrorMessage(error));
                }
                return syncExntesion;
            });
        });
        return { localExtensions, ignoredExtensions };
    }
    async updateLocalExtensions(added, removed, updated, skippedExtensions, profile) {
        const syncResourceLogLabel = getSyncResourceLogLabel("extensions", profile);
        const extensionsToInstall = [];
        const syncExtensionsToInstall = new Map();
        const removeFromSkipped = [];
        const addToSkipped = [];
        const installedExtensions = await this.extensionManagementService.getInstalled(undefined, profile.extensionsResource);
        if (added.length || updated.length) {
            await this.withProfileScopedServices(profile, async (extensionEnablementService, extensionStorageService) => {
                await Promises.settled([...added, ...updated].map(async (e) => {
                    const installedExtension = installedExtensions.find(installed => areSameExtensions(installed.identifier, e.identifier));
                    if (installedExtension && installedExtension.isBuiltin) {
                        if (e.state && installedExtension.manifest.version === e.version) {
                            this.updateExtensionState(e.state, installedExtension, installedExtension.manifest.version, extensionStorageService);
                        }
                        const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => areSameExtensions(disabledExtension, e.identifier));
                        if (isDisabled !== !!e.disabled) {
                            if (e.disabled) {
                                this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id);
                                await extensionEnablementService.disableExtension(e.identifier);
                                this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id);
                            }
                            else {
                                this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id);
                                await extensionEnablementService.enableExtension(e.identifier);
                                this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id);
                            }
                        }
                        removeFromSkipped.push(e.identifier);
                        return;
                    }
                    const version = e.pinned ? e.version : undefined;
                    const extension = (await this.extensionGalleryService.getExtensions([{ ...e.identifier, version, preRelease: version ? undefined : e.preRelease }], CancellationToken.None))[0];
                    if (e.state &&
                        (installedExtension ? installedExtension.manifest.version === e.version
                            : !!extension)) {
                        this.updateExtensionState(e.state, installedExtension || extension, installedExtension?.manifest.version, extensionStorageService);
                    }
                    if (extension) {
                        try {
                            const isDisabled = extensionEnablementService.getDisabledExtensions().some(disabledExtension => areSameExtensions(disabledExtension, e.identifier));
                            if (isDisabled !== !!e.disabled) {
                                if (e.disabled) {
                                    this.logService.trace(`${syncResourceLogLabel}: Disabling extension...`, e.identifier.id, extension.version);
                                    await extensionEnablementService.disableExtension(extension.identifier);
                                    this.logService.info(`${syncResourceLogLabel}: Disabled extension`, e.identifier.id, extension.version);
                                }
                                else {
                                    this.logService.trace(`${syncResourceLogLabel}: Enabling extension...`, e.identifier.id, extension.version);
                                    await extensionEnablementService.enableExtension(extension.identifier);
                                    this.logService.info(`${syncResourceLogLabel}: Enabled extension`, e.identifier.id, extension.version);
                                }
                            }
                            if (!installedExtension
                                || installedExtension.preRelease !== e.preRelease
                                || installedExtension.pinned !== e.pinned
                                || (version && installedExtension.manifest.version !== version)) {
                                if (await this.extensionManagementService.canInstall(extension)) {
                                    extensionsToInstall.push({
                                        extension, options: {
                                            isMachineScoped: false,
                                            donotIncludePackAndDependencies: true,
                                            installGivenVersion: e.pinned && !!e.version,
                                            pinned: e.pinned,
                                            installPreReleaseVersion: e.preRelease,
                                            profileLocation: profile.extensionsResource,
                                            isApplicationScoped: e.isApplicationScoped,
                                            context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true, [EXTENSION_INSTALL_SOURCE_CONTEXT]: "settingsSync" }
                                        }
                                    });
                                    syncExtensionsToInstall.set(extension.identifier.id.toLowerCase(), e);
                                }
                                else {
                                    this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because it cannot be installed.`, extension.displayName || extension.identifier.id);
                                    addToSkipped.push(e);
                                }
                            }
                        }
                        catch (error) {
                            addToSkipped.push(e);
                            this.logService.error(error);
                            this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, extension.displayName || extension.identifier.id);
                        }
                    }
                    else {
                        addToSkipped.push(e);
                        this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the extension is not found.`, e.identifier.id);
                    }
                }));
            });
        }
        if (removed.length) {
            const extensionsToRemove = installedExtensions.filter(({ identifier, isBuiltin }) => !isBuiltin && removed.some(r => areSameExtensions(identifier, r)));
            await Promises.settled(extensionsToRemove.map(async (extensionToRemove) => {
                this.logService.trace(`${syncResourceLogLabel}: Uninstalling local extension...`, extensionToRemove.identifier.id);
                await this.extensionManagementService.uninstall(extensionToRemove, { donotIncludePack: true, donotCheckDependents: true, profileLocation: profile.extensionsResource });
                this.logService.info(`${syncResourceLogLabel}: Uninstalled local extension.`, extensionToRemove.identifier.id);
                removeFromSkipped.push(extensionToRemove.identifier);
            }));
        }
        const results = await this.extensionManagementService.installGalleryExtensions(extensionsToInstall);
        for (const { identifier, local, error, source } of results) {
            const gallery = source;
            if (local) {
                this.logService.info(`${syncResourceLogLabel}: Installed extension.`, identifier.id, gallery.version);
                removeFromSkipped.push(identifier);
            }
            else {
                const e = syncExtensionsToInstall.get(identifier.id.toLowerCase());
                if (e) {
                    addToSkipped.push(e);
                    this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension`, gallery.displayName || gallery.identifier.id);
                }
                if (error instanceof ExtensionManagementError && ["Incompatible", "IncompatibleApi", "IncompatibleTargetPlatform"].includes(error.code)) {
                    this.logService.info(`${syncResourceLogLabel}: Skipped synchronizing extension because the compatible extension is not found.`, gallery.displayName || gallery.identifier.id);
                }
                else if (error) {
                    this.logService.error(error);
                }
            }
        }
        const newSkippedExtensions = [];
        for (const skippedExtension of skippedExtensions) {
            if (!removeFromSkipped.some(e => areSameExtensions(e, skippedExtension.identifier))) {
                newSkippedExtensions.push(skippedExtension);
            }
        }
        for (const skippedExtension of addToSkipped) {
            if (!newSkippedExtensions.some(e => areSameExtensions(e.identifier, skippedExtension.identifier))) {
                newSkippedExtensions.push(skippedExtension);
            }
        }
        return newSkippedExtensions;
    }
    updateExtensionState(state, extension, version, extensionStorageService) {
        const extensionState = extensionStorageService.getExtensionState(extension, true) || {};
        const keys = version ? extensionStorageService.getKeysForSync({ id: extension.identifier.id, version }) : undefined;
        if (keys) {
            keys.forEach(key => { extensionState[key] = state[key]; });
        }
        else {
            Object.keys(state).forEach(key => extensionState[key] = state[key]);
        }
        extensionStorageService.setExtensionState(extension, extensionState, true);
    }
    async withProfileScopedServices(profile, fn) {
        return this.userDataProfileStorageService.withProfileScopedStorageService(profile, async (storageService) => {
            const disposables = new DisposableStore();
            const instantiationService = disposables.add(this.instantiationService.createChild(new ServiceCollection([IStorageService, storageService])));
            const extensionEnablementService = disposables.add(instantiationService.createInstance(GlobalExtensionEnablementService));
            const extensionStorageService = disposables.add(instantiationService.createInstance(ExtensionStorageService));
            try {
                return await fn(extensionEnablementService, extensionStorageService);
            }
            finally {
                disposables.dispose();
            }
        });
    }
};
LocalExtensionsProvider = __decorate([
    __param(0, IExtensionManagementService),
    __param(1, IUserDataProfileStorageService),
    __param(2, IExtensionGalleryService),
    __param(3, IIgnoredExtensionsManagementService),
    __param(4, IInstantiationService),
    __param(5, IUserDataSyncLogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], LocalExtensionsProvider);
export { LocalExtensionsProvider };
let AbstractExtensionsInitializer = class AbstractExtensionsInitializer extends AbstractInitializer {
    constructor(extensionManagementService, ignoredExtensionsManagementService, fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
        super("extensions", userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
        this.extensionManagementService = extensionManagementService;
        this.ignoredExtensionsManagementService = ignoredExtensionsManagementService;
    }
    async parseExtensions(remoteUserData) {
        return remoteUserData.syncData ? await parseAndMigrateExtensions(remoteUserData.syncData, this.extensionManagementService) : null;
    }
    generatePreview(remoteExtensions, localExtensions) {
        const installedExtensions = [];
        const newExtensions = [];
        const disabledExtensions = [];
        for (const extension of remoteExtensions) {
            if (this.ignoredExtensionsManagementService.hasToNeverSyncExtension(extension.identifier.id)) {
                continue;
            }
            const installedExtension = localExtensions.find(i => areSameExtensions(i.identifier, extension.identifier));
            if (installedExtension) {
                installedExtensions.push(installedExtension);
                if (extension.disabled) {
                    disabledExtensions.push(extension.identifier);
                }
            }
            else if (extension.installed) {
                newExtensions.push({ ...extension.identifier, preRelease: !!extension.preRelease });
                if (extension.disabled) {
                    disabledExtensions.push(extension.identifier);
                }
            }
        }
        return { installedExtensions, newExtensions, disabledExtensions, remoteExtensions };
    }
};
AbstractExtensionsInitializer = __decorate([
    __param(0, IExtensionManagementService),
    __param(1, IIgnoredExtensionsManagementService),
    __param(2, IFileService),
    __param(3, IUserDataProfilesService),
    __param(4, IEnvironmentService),
    __param(5, ILogService),
    __param(6, IStorageService),
    __param(7, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], AbstractExtensionsInitializer);
export { AbstractExtensionsInitializer };
