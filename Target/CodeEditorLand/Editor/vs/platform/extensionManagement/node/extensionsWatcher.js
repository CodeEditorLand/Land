import { getErrorMessage } from '../../../base/common/errors.js';
import { Emitter } from '../../../base/common/event.js';
import { combinedDisposable, Disposable, DisposableMap } from '../../../base/common/lifecycle.js';
import { ResourceSet } from '../../../base/common/map.js';
import { getIdAndVersion } from '../common/extensionManagementUtil.js';
import { ExtensionIdentifier } from '../../extensions/common/extensions.js';
export class ExtensionsWatcher extends Disposable {
    constructor(extensionManagementService, extensionsScannerService, userDataProfilesService, extensionsProfileScannerService, uriIdentityService, fileService, logService) {
        super();
        this.extensionManagementService = extensionManagementService;
        this.extensionsScannerService = extensionsScannerService;
        this.userDataProfilesService = userDataProfilesService;
        this.extensionsProfileScannerService = extensionsProfileScannerService;
        this.uriIdentityService = uriIdentityService;
        this.fileService = fileService;
        this.logService = logService;
        this._onDidChangeExtensionsByAnotherSource = this._register(new Emitter());
        this.onDidChangeExtensionsByAnotherSource = this._onDidChangeExtensionsByAnotherSource.event;
        this.allExtensions = new Map;
        this.extensionsProfileWatchDisposables = this._register(new DisposableMap());
        this.initialize().then(null, error => logService.error('Error while initializing Extensions Watcher', getErrorMessage(error)));
    }
    async initialize() {
        await this.extensionsScannerService.initializeDefaultProfileExtensions();
        await this.onDidChangeProfiles(this.userDataProfilesService.profiles);
        this.registerListeners();
        await this.uninstallExtensionsNotInProfiles();
    }
    registerListeners() {
        this._register(this.userDataProfilesService.onDidChangeProfiles(e => this.onDidChangeProfiles(e.added)));
        this._register(this.extensionsProfileScannerService.onAddExtensions(e => this.onAddExtensions(e)));
        this._register(this.extensionsProfileScannerService.onDidAddExtensions(e => this.onDidAddExtensions(e)));
        this._register(this.extensionsProfileScannerService.onRemoveExtensions(e => this.onRemoveExtensions(e)));
        this._register(this.extensionsProfileScannerService.onDidRemoveExtensions(e => this.onDidRemoveExtensions(e)));
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
    }
    async onDidChangeProfiles(added) {
        try {
            if (added.length) {
                await Promise.all(added.map(profile => {
                    this.extensionsProfileWatchDisposables.set(profile.id, combinedDisposable(this.fileService.watch(this.uriIdentityService.extUri.dirname(profile.extensionsResource)), this.fileService.watch(profile.extensionsResource)));
                    return this.populateExtensionsFromProfile(profile.extensionsResource);
                }));
            }
        }
        catch (error) {
            this.logService.error(error);
            throw error;
        }
    }
    async onAddExtensions(e) {
        for (const extension of e.extensions) {
            this.addExtensionWithKey(this.getKey(extension.identifier, extension.version), e.profileLocation);
        }
    }
    async onDidAddExtensions(e) {
        for (const extension of e.extensions) {
            const key = this.getKey(extension.identifier, extension.version);
            if (e.error) {
                this.removeExtensionWithKey(key, e.profileLocation);
            }
            else {
                this.addExtensionWithKey(key, e.profileLocation);
            }
        }
    }
    async onRemoveExtensions(e) {
        for (const extension of e.extensions) {
            this.removeExtensionWithKey(this.getKey(extension.identifier, extension.version), e.profileLocation);
        }
    }
    async onDidRemoveExtensions(e) {
        const extensionsToUninstall = [];
        const promises = [];
        for (const extension of e.extensions) {
            const key = this.getKey(extension.identifier, extension.version);
            if (e.error) {
                this.addExtensionWithKey(key, e.profileLocation);
            }
            else {
                this.removeExtensionWithKey(key, e.profileLocation);
                if (!this.allExtensions.has(key)) {
                    this.logService.debug('Extension is removed from all profiles', extension.identifier.id, extension.version);
                    promises.push(this.extensionManagementService.scanInstalledExtensionAtLocation(extension.location)
                        .then(result => {
                        if (result) {
                            extensionsToUninstall.push(result);
                        }
                        else {
                            this.logService.info('Extension not found at the location', extension.location.toString());
                        }
                    }, error => this.logService.error(error)));
                }
            }
        }
        try {
            await Promise.all(promises);
            if (extensionsToUninstall.length) {
                await this.uninstallExtensionsNotInProfiles(extensionsToUninstall);
            }
        }
        catch (error) {
            this.logService.error(error);
        }
    }
    onDidFilesChange(e) {
        for (const profile of this.userDataProfilesService.profiles) {
            if (e.contains(profile.extensionsResource, 0, 1)) {
                this.onDidExtensionsProfileChange(profile.extensionsResource);
            }
        }
    }
    async onDidExtensionsProfileChange(profileLocation) {
        const added = [], removed = [];
        const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(profileLocation);
        const extensionKeys = new Set();
        const cached = new Set();
        for (const [key, profiles] of this.allExtensions) {
            if (profiles.has(profileLocation)) {
                cached.add(key);
            }
        }
        for (const extension of extensions) {
            const key = this.getKey(extension.identifier, extension.version);
            extensionKeys.add(key);
            if (!cached.has(key)) {
                added.push(extension.identifier);
                this.addExtensionWithKey(key, profileLocation);
            }
        }
        for (const key of cached) {
            if (!extensionKeys.has(key)) {
                const extension = this.fromKey(key);
                if (extension) {
                    removed.push(extension.identifier);
                    this.removeExtensionWithKey(key, profileLocation);
                }
            }
        }
        if (added.length || removed.length) {
            this._onDidChangeExtensionsByAnotherSource.fire({ added: added.length ? { extensions: added, profileLocation } : undefined, removed: removed.length ? { extensions: removed, profileLocation } : undefined });
        }
    }
    async populateExtensionsFromProfile(extensionsProfileLocation) {
        const extensions = await this.extensionsProfileScannerService.scanProfileExtensions(extensionsProfileLocation);
        for (const extension of extensions) {
            this.addExtensionWithKey(this.getKey(extension.identifier, extension.version), extensionsProfileLocation);
        }
    }
    async uninstallExtensionsNotInProfiles(toUninstall) {
        if (!toUninstall) {
            const installed = await this.extensionManagementService.scanAllUserInstalledExtensions();
            toUninstall = installed.filter(installedExtension => !this.allExtensions.has(this.getKey(installedExtension.identifier, installedExtension.manifest.version)));
        }
        if (toUninstall.length) {
            await this.extensionManagementService.markAsUninstalled(...toUninstall);
        }
    }
    addExtensionWithKey(key, extensionsProfileLocation) {
        let profiles = this.allExtensions.get(key);
        if (!profiles) {
            this.allExtensions.set(key, profiles = new ResourceSet((uri) => this.uriIdentityService.extUri.getComparisonKey(uri)));
        }
        profiles.add(extensionsProfileLocation);
    }
    removeExtensionWithKey(key, profileLocation) {
        const profiles = this.allExtensions.get(key);
        if (profiles) {
            profiles.delete(profileLocation);
        }
        if (!profiles?.size) {
            this.allExtensions.delete(key);
        }
    }
    getKey(identifier, version) {
        return `${ExtensionIdentifier.toKey(identifier.id)}@${version}`;
    }
    fromKey(key) {
        const [id, version] = getIdAndVersion(key);
        return version ? { identifier: { id }, version } : undefined;
    }
}
