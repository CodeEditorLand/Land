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
import { IBuiltinExtensionsScannerService, parseEnabledApiProposalNames } from '../../../../platform/extensions/common/extensions.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { IWebExtensionsScannerService } from '../common/extensionManagement.js';
import { isWeb, Language } from '../../../../base/common/platform.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { Queue } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IExtensionGalleryService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { areSameExtensions, getGalleryExtensionId, getExtensionId } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { localizeManifest } from '../../../../platform/extensionManagement/common/extensionNls.js';
import { localize, localize2 } from '../../../../nls.js';
import * as semver from '../../../../base/common/semver/semver.js';
import { isString, isUndefined } from '../../../../base/common/types.js';
import { getErrorMessage } from '../../../../base/common/errors.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IExtensionManifestPropertiesService } from '../../extensions/common/extensionManifestPropertiesService.js';
import { IExtensionResourceLoaderService, migratePlatformSpecificExtensionGalleryResourceURL } from '../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { IsWebContext } from '../../../../platform/contextkey/common/contextkeys.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { basename } from '../../../../base/common/path.js';
import { IExtensionStorageService } from '../../../../platform/extensionManagement/common/extensionStorage.js';
import { isNonEmptyArray } from '../../../../base/common/arrays.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { validateExtensionManifest } from '../../../../platform/extensions/common/extensionValidator.js';
import Severity from '../../../../base/common/severity.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
function isGalleryExtensionInfo(obj) {
    const galleryExtensionInfo = obj;
    return typeof galleryExtensionInfo?.id === 'string'
        && (galleryExtensionInfo.preRelease === undefined || typeof galleryExtensionInfo.preRelease === 'boolean')
        && (galleryExtensionInfo.migrateStorageFrom === undefined || typeof galleryExtensionInfo.migrateStorageFrom === 'string');
}
function isUriComponents(thing) {
    if (!thing) {
        return false;
    }
    return isString(thing.path) &&
        isString(thing.scheme);
}
let WebExtensionsScannerService = class WebExtensionsScannerService extends Disposable {
    constructor(environmentService, builtinExtensionsScannerService, fileService, logService, galleryService, extensionManifestPropertiesService, extensionResourceLoaderService, extensionStorageService, storageService, productService, userDataProfilesService, uriIdentityService, lifecycleService) {
        super();
        this.environmentService = environmentService;
        this.builtinExtensionsScannerService = builtinExtensionsScannerService;
        this.fileService = fileService;
        this.logService = logService;
        this.galleryService = galleryService;
        this.extensionManifestPropertiesService = extensionManifestPropertiesService;
        this.extensionResourceLoaderService = extensionResourceLoaderService;
        this.extensionStorageService = extensionStorageService;
        this.storageService = storageService;
        this.productService = productService;
        this.userDataProfilesService = userDataProfilesService;
        this.uriIdentityService = uriIdentityService;
        this.systemExtensionsCacheResource = undefined;
        this.customBuiltinExtensionsCacheResource = undefined;
        this.resourcesAccessQueueMap = new ResourceMap();
        if (isWeb) {
            this.systemExtensionsCacheResource = joinPath(environmentService.userRoamingDataHome, 'systemExtensionsCache.json');
            this.customBuiltinExtensionsCacheResource = joinPath(environmentService.userRoamingDataHome, 'customBuiltinExtensionsCache.json');
            lifecycleService.when(4).then(() => this.updateCaches());
        }
        this.extensionsEnabledWithApiProposalVersion = productService.extensionsEnabledWithApiProposalVersion?.map(id => id.toLowerCase()) ?? [];
    }
    readCustomBuiltinExtensionsInfoFromEnv() {
        if (!this._customBuiltinExtensionsInfoPromise) {
            this._customBuiltinExtensionsInfoPromise = (async () => {
                let extensions = [];
                const extensionLocations = [];
                const extensionGalleryResources = [];
                const extensionsToMigrate = [];
                const customBuiltinExtensionsInfo = this.environmentService.options && Array.isArray(this.environmentService.options.additionalBuiltinExtensions)
                    ? this.environmentService.options.additionalBuiltinExtensions.map(additionalBuiltinExtension => isString(additionalBuiltinExtension) ? { id: additionalBuiltinExtension } : additionalBuiltinExtension)
                    : [];
                for (const e of customBuiltinExtensionsInfo) {
                    if (isGalleryExtensionInfo(e)) {
                        extensions.push({ id: e.id, preRelease: !!e.preRelease });
                        if (e.migrateStorageFrom) {
                            extensionsToMigrate.push([e.migrateStorageFrom, e.id]);
                        }
                    }
                    else if (isUriComponents(e)) {
                        const extensionLocation = URI.revive(e);
                        if (this.extensionResourceLoaderService.isExtensionGalleryResource(extensionLocation)) {
                            extensionGalleryResources.push(extensionLocation);
                        }
                        else {
                            extensionLocations.push(extensionLocation);
                        }
                    }
                }
                if (extensions.length) {
                    extensions = await this.checkAdditionalBuiltinExtensions(extensions);
                }
                if (extensions.length) {
                    this.logService.info('Found additional builtin gallery extensions in env', extensions);
                }
                if (extensionLocations.length) {
                    this.logService.info('Found additional builtin location extensions in env', extensionLocations.map(e => e.toString()));
                }
                if (extensionGalleryResources.length) {
                    this.logService.info('Found additional builtin extension gallery resources in env', extensionGalleryResources.map(e => e.toString()));
                }
                return { extensions, extensionsToMigrate, extensionLocations, extensionGalleryResources };
            })();
        }
        return this._customBuiltinExtensionsInfoPromise;
    }
    async checkAdditionalBuiltinExtensions(extensions) {
        const extensionsControlManifest = await this.galleryService.getExtensionsControlManifest();
        const result = [];
        for (const extension of extensions) {
            if (extensionsControlManifest.malicious.some(e => areSameExtensions(e, { id: extension.id }))) {
                this.logService.info(`Checking additional builtin extensions: Ignoring '${extension.id}' because it is reported to be malicious.`);
                continue;
            }
            const deprecationInfo = extensionsControlManifest.deprecated[extension.id.toLowerCase()];
            if (deprecationInfo?.extension?.autoMigrate) {
                const preReleaseExtensionId = deprecationInfo.extension.id;
                this.logService.info(`Checking additional builtin extensions: '${extension.id}' is deprecated, instead using '${preReleaseExtensionId}'`);
                result.push({ id: preReleaseExtensionId, preRelease: !!extension.preRelease });
            }
            else {
                result.push(extension);
            }
        }
        return result;
    }
    async readSystemExtensions() {
        const systemExtensions = await this.builtinExtensionsScannerService.scanBuiltinExtensions();
        const cachedSystemExtensions = await Promise.all((await this.readSystemExtensionsCache()).map(e => this.toScannedExtension(e, true, 0)));
        const result = new Map();
        for (const extension of [...systemExtensions, ...cachedSystemExtensions]) {
            const existing = result.get(extension.identifier.id.toLowerCase());
            if (existing) {
                if (semver.gt(existing.manifest.version, extension.manifest.version)) {
                    continue;
                }
            }
            result.set(extension.identifier.id.toLowerCase(), extension);
        }
        return [...result.values()];
    }
    async readCustomBuiltinExtensions(scanOptions) {
        const [customBuiltinExtensionsFromLocations, customBuiltinExtensionsFromGallery] = await Promise.all([
            this.getCustomBuiltinExtensionsFromLocations(scanOptions),
            this.getCustomBuiltinExtensionsFromGallery(scanOptions),
        ]);
        const customBuiltinExtensions = [...customBuiltinExtensionsFromLocations, ...customBuiltinExtensionsFromGallery];
        await this.migrateExtensionsStorage(customBuiltinExtensions);
        return customBuiltinExtensions;
    }
    async getCustomBuiltinExtensionsFromLocations(scanOptions) {
        const { extensionLocations } = await this.readCustomBuiltinExtensionsInfoFromEnv();
        if (!extensionLocations.length) {
            return [];
        }
        const result = [];
        await Promise.allSettled(extensionLocations.map(async (extensionLocation) => {
            try {
                const webExtension = await this.toWebExtension(extensionLocation);
                const extension = await this.toScannedExtension(webExtension, true);
                if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                    result.push(extension);
                }
                else {
                    this.logService.info(`Skipping invalid additional builtin extension ${webExtension.identifier.id}`);
                }
            }
            catch (error) {
                this.logService.info(`Error while fetching the additional builtin extension ${extensionLocation.toString()}.`, getErrorMessage(error));
            }
        }));
        return result;
    }
    async getCustomBuiltinExtensionsFromGallery(scanOptions) {
        if (!this.galleryService.isEnabled()) {
            this.logService.info('Ignoring fetching additional builtin extensions from gallery as it is disabled.');
            return [];
        }
        const result = [];
        const { extensions, extensionGalleryResources } = await this.readCustomBuiltinExtensionsInfoFromEnv();
        try {
            const cacheValue = JSON.stringify({
                extensions: extensions.sort((a, b) => a.id.localeCompare(b.id)),
                extensionGalleryResources: extensionGalleryResources.map(e => e.toString()).sort()
            });
            const useCache = this.storageService.get('additionalBuiltinExtensions', -1, '{}') === cacheValue;
            const webExtensions = await (useCache ? this.getCustomBuiltinExtensionsFromCache() : this.updateCustomBuiltinExtensionsCache());
            if (webExtensions.length) {
                await Promise.all(webExtensions.map(async (webExtension) => {
                    try {
                        const extension = await this.toScannedExtension(webExtension, true);
                        if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                            result.push(extension);
                        }
                        else {
                            this.logService.info(`Skipping invalid additional builtin gallery extension ${webExtension.identifier.id}`);
                        }
                    }
                    catch (error) {
                        this.logService.info(`Ignoring additional builtin extension ${webExtension.identifier.id} because there is an error while converting it into scanned extension`, getErrorMessage(error));
                    }
                }));
            }
            this.storageService.store('additionalBuiltinExtensions', cacheValue, -1, 1);
        }
        catch (error) {
            this.logService.info('Ignoring following additional builtin extensions as there is an error while fetching them from gallery', extensions.map(({ id }) => id), getErrorMessage(error));
        }
        return result;
    }
    async getCustomBuiltinExtensionsFromCache() {
        const cachedCustomBuiltinExtensions = await this.readCustomBuiltinExtensionsCache();
        const webExtensionsMap = new Map();
        for (const webExtension of cachedCustomBuiltinExtensions) {
            const existing = webExtensionsMap.get(webExtension.identifier.id.toLowerCase());
            if (existing) {
                if (semver.gt(existing.version, webExtension.version)) {
                    continue;
                }
            }
            if (webExtension.metadata?.isPreReleaseVersion && !webExtension.metadata?.preRelease) {
                webExtension.metadata.preRelease = true;
            }
            webExtensionsMap.set(webExtension.identifier.id.toLowerCase(), webExtension);
        }
        return [...webExtensionsMap.values()];
    }
    async migrateExtensionsStorage(customBuiltinExtensions) {
        if (!this._migrateExtensionsStoragePromise) {
            this._migrateExtensionsStoragePromise = (async () => {
                const { extensionsToMigrate } = await this.readCustomBuiltinExtensionsInfoFromEnv();
                if (!extensionsToMigrate.length) {
                    return;
                }
                const fromExtensions = await this.galleryService.getExtensions(extensionsToMigrate.map(([id]) => ({ id })), CancellationToken.None);
                try {
                    await Promise.allSettled(extensionsToMigrate.map(async ([from, to]) => {
                        const toExtension = customBuiltinExtensions.find(extension => areSameExtensions(extension.identifier, { id: to }));
                        if (toExtension) {
                            const fromExtension = fromExtensions.find(extension => areSameExtensions(extension.identifier, { id: from }));
                            const fromExtensionManifest = fromExtension ? await this.galleryService.getManifest(fromExtension, CancellationToken.None) : null;
                            const fromExtensionId = fromExtensionManifest ? getExtensionId(fromExtensionManifest.publisher, fromExtensionManifest.name) : from;
                            const toExtensionId = getExtensionId(toExtension.manifest.publisher, toExtension.manifest.name);
                            this.extensionStorageService.addToMigrationList(fromExtensionId, toExtensionId);
                        }
                        else {
                            this.logService.info(`Skipped migrating extension storage from '${from}' to '${to}', because the '${to}' extension is not found.`);
                        }
                    }));
                }
                catch (error) {
                    this.logService.error(error);
                }
            })();
        }
        return this._migrateExtensionsStoragePromise;
    }
    async updateCaches() {
        await this.updateSystemExtensionsCache();
        await this.updateCustomBuiltinExtensionsCache();
    }
    async updateSystemExtensionsCache() {
        const systemExtensions = await this.builtinExtensionsScannerService.scanBuiltinExtensions();
        const cachedSystemExtensions = (await this.readSystemExtensionsCache())
            .filter(cached => {
            const systemExtension = systemExtensions.find(e => areSameExtensions(e.identifier, cached.identifier));
            return systemExtension && semver.gt(cached.version, systemExtension.manifest.version);
        });
        await this.writeSystemExtensionsCache(() => cachedSystemExtensions);
    }
    async updateCustomBuiltinExtensionsCache() {
        if (!this._updateCustomBuiltinExtensionsCachePromise) {
            this._updateCustomBuiltinExtensionsCachePromise = (async () => {
                this.logService.info('Updating additional builtin extensions cache');
                const { extensions, extensionGalleryResources } = await this.readCustomBuiltinExtensionsInfoFromEnv();
                const [galleryWebExtensions, extensionGalleryResourceWebExtensions] = await Promise.all([
                    this.resolveBuiltinGalleryExtensions(extensions),
                    this.resolveBuiltinExtensionGalleryResources(extensionGalleryResources)
                ]);
                const webExtensionsMap = new Map();
                for (const webExtension of [...galleryWebExtensions, ...extensionGalleryResourceWebExtensions]) {
                    webExtensionsMap.set(webExtension.identifier.id.toLowerCase(), webExtension);
                }
                await this.resolveDependenciesAndPackedExtensions(extensionGalleryResourceWebExtensions, webExtensionsMap);
                const webExtensions = [...webExtensionsMap.values()];
                await this.writeCustomBuiltinExtensionsCache(() => webExtensions);
                return webExtensions;
            })();
        }
        return this._updateCustomBuiltinExtensionsCachePromise;
    }
    async resolveBuiltinExtensionGalleryResources(extensionGalleryResources) {
        if (extensionGalleryResources.length === 0) {
            return [];
        }
        const result = new Map();
        const extensionInfos = [];
        await Promise.all(extensionGalleryResources.map(async (extensionGalleryResource) => {
            try {
                const webExtension = await this.toWebExtensionFromExtensionGalleryResource(extensionGalleryResource);
                result.set(webExtension.identifier.id.toLowerCase(), webExtension);
                extensionInfos.push({ id: webExtension.identifier.id, version: webExtension.version });
            }
            catch (error) {
                this.logService.info(`Ignoring additional builtin extension from gallery resource ${extensionGalleryResource.toString()} because there is an error while converting it into web extension`, getErrorMessage(error));
            }
        }));
        const galleryExtensions = await this.galleryService.getExtensions(extensionInfos, CancellationToken.None);
        for (const galleryExtension of galleryExtensions) {
            const webExtension = result.get(galleryExtension.identifier.id.toLowerCase());
            if (webExtension) {
                result.set(galleryExtension.identifier.id.toLowerCase(), {
                    ...webExtension,
                    identifier: { id: webExtension.identifier.id, uuid: galleryExtension.identifier.uuid },
                    readmeUri: galleryExtension.assets.readme ? URI.parse(galleryExtension.assets.readme.uri) : undefined,
                    changelogUri: galleryExtension.assets.changelog ? URI.parse(galleryExtension.assets.changelog.uri) : undefined,
                    metadata: { isPreReleaseVersion: galleryExtension.properties.isPreReleaseVersion, preRelease: galleryExtension.properties.isPreReleaseVersion, isBuiltin: true, pinned: true }
                });
            }
        }
        return [...result.values()];
    }
    async resolveBuiltinGalleryExtensions(extensions) {
        if (extensions.length === 0) {
            return [];
        }
        const webExtensions = [];
        const galleryExtensionsMap = await this.getExtensionsWithDependenciesAndPackedExtensions(extensions);
        const missingExtensions = extensions.filter(({ id }) => !galleryExtensionsMap.has(id.toLowerCase()));
        if (missingExtensions.length) {
            this.logService.info('Skipping the additional builtin extensions because their compatible versions are not found.', missingExtensions);
        }
        await Promise.all([...galleryExtensionsMap.values()].map(async (gallery) => {
            try {
                const webExtension = await this.toWebExtensionFromGallery(gallery, { isPreReleaseVersion: gallery.properties.isPreReleaseVersion, preRelease: gallery.properties.isPreReleaseVersion, isBuiltin: true });
                webExtensions.push(webExtension);
            }
            catch (error) {
                this.logService.info(`Ignoring additional builtin extension ${gallery.identifier.id} because there is an error while converting it into web extension`, getErrorMessage(error));
            }
        }));
        return webExtensions;
    }
    async resolveDependenciesAndPackedExtensions(webExtensions, result) {
        const extensionInfos = [];
        for (const webExtension of webExtensions) {
            for (const e of [...(webExtension.manifest?.extensionDependencies ?? []), ...(webExtension.manifest?.extensionPack ?? [])]) {
                if (!result.has(e.toLowerCase())) {
                    extensionInfos.push({ id: e, version: webExtension.version });
                }
            }
        }
        if (extensionInfos.length === 0) {
            return;
        }
        const galleryExtensions = await this.getExtensionsWithDependenciesAndPackedExtensions(extensionInfos, new Set([...result.keys()]));
        await Promise.all([...galleryExtensions.values()].map(async (gallery) => {
            try {
                const webExtension = await this.toWebExtensionFromGallery(gallery, { isPreReleaseVersion: gallery.properties.isPreReleaseVersion, preRelease: gallery.properties.isPreReleaseVersion, isBuiltin: true });
                result.set(webExtension.identifier.id.toLowerCase(), webExtension);
            }
            catch (error) {
                this.logService.info(`Ignoring additional builtin extension ${gallery.identifier.id} because there is an error while converting it into web extension`, getErrorMessage(error));
            }
        }));
    }
    async getExtensionsWithDependenciesAndPackedExtensions(toGet, seen = new Set(), result = new Map()) {
        if (toGet.length === 0) {
            return result;
        }
        const extensions = await this.galleryService.getExtensions(toGet, { compatible: true, targetPlatform: "web" }, CancellationToken.None);
        const packsAndDependencies = new Map();
        for (const extension of extensions) {
            result.set(extension.identifier.id.toLowerCase(), extension);
            for (const id of [...(isNonEmptyArray(extension.properties.dependencies) ? extension.properties.dependencies : []), ...(isNonEmptyArray(extension.properties.extensionPack) ? extension.properties.extensionPack : [])]) {
                if (!result.has(id.toLowerCase()) && !packsAndDependencies.has(id.toLowerCase()) && !seen.has(id.toLowerCase())) {
                    const extensionInfo = toGet.find(e => areSameExtensions(e, extension.identifier));
                    packsAndDependencies.set(id.toLowerCase(), { id, preRelease: extensionInfo?.preRelease });
                }
            }
        }
        return this.getExtensionsWithDependenciesAndPackedExtensions([...packsAndDependencies.values()].filter(({ id }) => !result.has(id.toLowerCase())), seen, result);
    }
    async scanSystemExtensions() {
        return this.readSystemExtensions();
    }
    async scanUserExtensions(profileLocation, scanOptions) {
        const extensions = new Map();
        const customBuiltinExtensions = await this.readCustomBuiltinExtensions(scanOptions);
        for (const extension of customBuiltinExtensions) {
            extensions.set(extension.identifier.id.toLowerCase(), extension);
        }
        const installedExtensions = await this.scanInstalledExtensions(profileLocation, scanOptions);
        for (const extension of installedExtensions) {
            extensions.set(extension.identifier.id.toLowerCase(), extension);
        }
        return [...extensions.values()];
    }
    async scanExtensionsUnderDevelopment() {
        const devExtensions = this.environmentService.options?.developmentOptions?.extensions;
        const result = [];
        if (Array.isArray(devExtensions)) {
            await Promise.allSettled(devExtensions.map(async (devExtension) => {
                try {
                    const location = URI.revive(devExtension);
                    if (URI.isUri(location)) {
                        const webExtension = await this.toWebExtension(location);
                        result.push(await this.toScannedExtension(webExtension, false));
                    }
                    else {
                        this.logService.info(`Skipping the extension under development ${devExtension} as it is not URI type.`);
                    }
                }
                catch (error) {
                    this.logService.info(`Error while fetching the extension under development ${devExtension.toString()}.`, getErrorMessage(error));
                }
            }));
        }
        return result;
    }
    async scanExistingExtension(extensionLocation, extensionType, profileLocation) {
        if (extensionType === 0) {
            const systemExtensions = await this.scanSystemExtensions();
            return systemExtensions.find(e => e.location.toString() === extensionLocation.toString()) || null;
        }
        const userExtensions = await this.scanUserExtensions(profileLocation);
        return userExtensions.find(e => e.location.toString() === extensionLocation.toString()) || null;
    }
    async scanExtensionManifest(extensionLocation) {
        try {
            return await this.getExtensionManifest(extensionLocation);
        }
        catch (error) {
            this.logService.warn(`Error while fetching manifest from ${extensionLocation.toString()}`, getErrorMessage(error));
            return null;
        }
    }
    async addExtensionFromGallery(galleryExtension, metadata, profileLocation) {
        const webExtension = await this.toWebExtensionFromGallery(galleryExtension, metadata);
        return this.addWebExtension(webExtension, profileLocation);
    }
    async addExtension(location, metadata, profileLocation) {
        const webExtension = await this.toWebExtension(location, undefined, undefined, undefined, undefined, undefined, undefined, metadata);
        const extension = await this.toScannedExtension(webExtension, false);
        await this.addToInstalledExtensions([webExtension], profileLocation);
        return extension;
    }
    async removeExtension(extension, profileLocation) {
        await this.writeInstalledExtensions(profileLocation, installedExtensions => installedExtensions.filter(installedExtension => !areSameExtensions(installedExtension.identifier, extension.identifier)));
    }
    async updateMetadata(extension, metadata, profileLocation) {
        let updatedExtension = undefined;
        await this.writeInstalledExtensions(profileLocation, installedExtensions => {
            const result = [];
            for (const installedExtension of installedExtensions) {
                if (areSameExtensions(extension.identifier, installedExtension.identifier)) {
                    installedExtension.metadata = { ...installedExtension.metadata, ...metadata };
                    updatedExtension = installedExtension;
                    result.push(installedExtension);
                }
                else {
                    result.push(installedExtension);
                }
            }
            return result;
        });
        if (!updatedExtension) {
            throw new Error('Extension not found');
        }
        return this.toScannedExtension(updatedExtension, extension.isBuiltin);
    }
    async copyExtensions(fromProfileLocation, toProfileLocation, filter) {
        const extensionsToCopy = [];
        const fromWebExtensions = await this.readInstalledExtensions(fromProfileLocation);
        await Promise.all(fromWebExtensions.map(async (webExtension) => {
            const scannedExtension = await this.toScannedExtension(webExtension, false);
            if (filter(scannedExtension)) {
                extensionsToCopy.push(webExtension);
            }
        }));
        if (extensionsToCopy.length) {
            await this.addToInstalledExtensions(extensionsToCopy, toProfileLocation);
        }
    }
    async addWebExtension(webExtension, profileLocation) {
        const isSystem = !!(await this.scanSystemExtensions()).find(e => areSameExtensions(e.identifier, webExtension.identifier));
        const isBuiltin = !!webExtension.metadata?.isBuiltin;
        const extension = await this.toScannedExtension(webExtension, isBuiltin);
        if (isSystem) {
            await this.writeSystemExtensionsCache(systemExtensions => {
                systemExtensions = systemExtensions.filter(extension => !areSameExtensions(extension.identifier, webExtension.identifier));
                systemExtensions.push(webExtension);
                return systemExtensions;
            });
            return extension;
        }
        if (isBuiltin) {
            await this.writeCustomBuiltinExtensionsCache(customBuiltinExtensions => {
                customBuiltinExtensions = customBuiltinExtensions.filter(extension => !areSameExtensions(extension.identifier, webExtension.identifier));
                customBuiltinExtensions.push(webExtension);
                return customBuiltinExtensions;
            });
            const installedExtensions = await this.readInstalledExtensions(profileLocation);
            if (installedExtensions.some(e => areSameExtensions(e.identifier, webExtension.identifier))) {
                await this.addToInstalledExtensions([webExtension], profileLocation);
            }
            return extension;
        }
        await this.addToInstalledExtensions([webExtension], profileLocation);
        return extension;
    }
    async addToInstalledExtensions(webExtensions, profileLocation) {
        await this.writeInstalledExtensions(profileLocation, installedExtensions => {
            installedExtensions = installedExtensions.filter(installedExtension => webExtensions.some(extension => !areSameExtensions(installedExtension.identifier, extension.identifier)));
            installedExtensions.push(...webExtensions);
            return installedExtensions;
        });
    }
    async scanInstalledExtensions(profileLocation, scanOptions) {
        let installedExtensions = await this.readInstalledExtensions(profileLocation);
        if (!this.uriIdentityService.extUri.isEqual(profileLocation, this.userDataProfilesService.defaultProfile.extensionsResource)) {
            installedExtensions = installedExtensions.filter(i => !i.metadata?.isApplicationScoped);
            const defaultProfileExtensions = await this.readInstalledExtensions(this.userDataProfilesService.defaultProfile.extensionsResource);
            installedExtensions.push(...defaultProfileExtensions.filter(i => i.metadata?.isApplicationScoped));
        }
        installedExtensions.sort((a, b) => a.identifier.id < b.identifier.id ? -1 : a.identifier.id > b.identifier.id ? 1 : semver.rcompare(a.version, b.version));
        const result = new Map();
        for (const webExtension of installedExtensions) {
            const existing = result.get(webExtension.identifier.id.toLowerCase());
            if (existing && semver.gt(existing.manifest.version, webExtension.version)) {
                continue;
            }
            const extension = await this.toScannedExtension(webExtension, false);
            if (extension.isValid || !scanOptions?.skipInvalidExtensions) {
                result.set(extension.identifier.id.toLowerCase(), extension);
            }
            else {
                this.logService.info(`Skipping invalid installed extension ${webExtension.identifier.id}`);
            }
        }
        return [...result.values()];
    }
    async toWebExtensionFromGallery(galleryExtension, metadata) {
        const extensionLocation = this.extensionResourceLoaderService.getExtensionGalleryResourceURL({
            publisher: galleryExtension.publisher,
            name: galleryExtension.name,
            version: galleryExtension.version,
            targetPlatform: galleryExtension.properties.targetPlatform === "web" ? "web" : undefined
        }, 'extension');
        if (!extensionLocation) {
            throw new Error('No extension gallery service configured.');
        }
        return this.toWebExtensionFromExtensionGalleryResource(extensionLocation, galleryExtension.identifier, galleryExtension.assets.readme ? URI.parse(galleryExtension.assets.readme.uri) : undefined, galleryExtension.assets.changelog ? URI.parse(galleryExtension.assets.changelog.uri) : undefined, metadata);
    }
    async toWebExtensionFromExtensionGalleryResource(extensionLocation, identifier, readmeUri, changelogUri, metadata) {
        const extensionResources = await this.listExtensionResources(extensionLocation);
        const packageNLSResources = this.getPackageNLSResourceMapFromResources(extensionResources);
        const fallbackPackageNLSResource = extensionResources.find(e => basename(e) === 'package.nls.json');
        return this.toWebExtension(extensionLocation, identifier, undefined, packageNLSResources, fallbackPackageNLSResource ? URI.parse(fallbackPackageNLSResource) : null, readmeUri, changelogUri, metadata);
    }
    getPackageNLSResourceMapFromResources(extensionResources) {
        const packageNLSResources = new Map();
        extensionResources.forEach(e => {
            const regexResult = /package\.nls\.([\w-]+)\.json/.exec(basename(e));
            if (regexResult?.[1]) {
                packageNLSResources.set(regexResult[1], URI.parse(e));
            }
        });
        return packageNLSResources;
    }
    async toWebExtension(extensionLocation, identifier, manifest, packageNLSUris, fallbackPackageNLSUri, readmeUri, changelogUri, metadata) {
        if (!manifest) {
            try {
                manifest = await this.getExtensionManifest(extensionLocation);
            }
            catch (error) {
                throw new Error(`Error while fetching manifest from the location '${extensionLocation.toString()}'. ${getErrorMessage(error)}`);
            }
        }
        if (!this.extensionManifestPropertiesService.canExecuteOnWeb(manifest)) {
            throw new Error(localize('not a web extension', "Cannot add '{0}' because this extension is not a web extension.", manifest.displayName || manifest.name));
        }
        if (fallbackPackageNLSUri === undefined) {
            try {
                fallbackPackageNLSUri = joinPath(extensionLocation, 'package.nls.json');
                await this.extensionResourceLoaderService.readExtensionResource(fallbackPackageNLSUri);
            }
            catch (error) {
                fallbackPackageNLSUri = undefined;
            }
        }
        const defaultManifestTranslations = fallbackPackageNLSUri ? URI.isUri(fallbackPackageNLSUri) ? await this.getTranslations(fallbackPackageNLSUri) : fallbackPackageNLSUri : null;
        return {
            identifier: { id: getGalleryExtensionId(manifest.publisher, manifest.name), uuid: identifier?.uuid },
            version: manifest.version,
            location: extensionLocation,
            manifest,
            readmeUri,
            changelogUri,
            packageNLSUris,
            fallbackPackageNLSUri: URI.isUri(fallbackPackageNLSUri) ? fallbackPackageNLSUri : undefined,
            defaultManifestTranslations,
            metadata,
        };
    }
    async toScannedExtension(webExtension, isBuiltin, type = 1) {
        const validations = [];
        let manifest = webExtension.manifest;
        if (!manifest) {
            try {
                manifest = await this.getExtensionManifest(webExtension.location);
            }
            catch (error) {
                validations.push([Severity.Error, `Error while fetching manifest from the location '${webExtension.location}'. ${getErrorMessage(error)}`]);
            }
        }
        if (!manifest) {
            const [publisher, name] = webExtension.identifier.id.split('.');
            manifest = {
                name,
                publisher,
                version: webExtension.version,
                engines: { vscode: '*' },
            };
        }
        const packageNLSUri = webExtension.packageNLSUris?.get(Language.value().toLowerCase());
        const fallbackPackageNLS = webExtension.defaultManifestTranslations ?? webExtension.fallbackPackageNLSUri;
        if (packageNLSUri) {
            manifest = await this.translateManifest(manifest, packageNLSUri, fallbackPackageNLS);
        }
        else if (fallbackPackageNLS) {
            manifest = await this.translateManifest(manifest, fallbackPackageNLS);
        }
        const uuid = webExtension.metadata?.id;
        const validateApiVersion = this.extensionsEnabledWithApiProposalVersion.includes(webExtension.identifier.id.toLowerCase());
        validations.push(...validateExtensionManifest(this.productService.version, this.productService.date, webExtension.location, manifest, false, validateApiVersion));
        let isValid = true;
        for (const [severity, message] of validations) {
            if (severity === Severity.Error) {
                isValid = false;
                this.logService.error(message);
            }
        }
        if (manifest.enabledApiProposals && validateApiVersion) {
            manifest.enabledApiProposals = parseEnabledApiProposalNames([...manifest.enabledApiProposals]);
        }
        return {
            identifier: { id: webExtension.identifier.id, uuid: webExtension.identifier.uuid || uuid },
            location: webExtension.location,
            manifest,
            type,
            isBuiltin,
            readmeUrl: webExtension.readmeUri,
            changelogUrl: webExtension.changelogUri,
            metadata: webExtension.metadata,
            targetPlatform: "web",
            validations,
            isValid
        };
    }
    async listExtensionResources(extensionLocation) {
        try {
            const result = await this.extensionResourceLoaderService.readExtensionResource(extensionLocation);
            return JSON.parse(result);
        }
        catch (error) {
            this.logService.warn('Error while fetching extension resources list', getErrorMessage(error));
        }
        return [];
    }
    async translateManifest(manifest, nlsURL, fallbackNLS) {
        try {
            const translations = URI.isUri(nlsURL) ? await this.getTranslations(nlsURL) : nlsURL;
            const fallbackTranslations = URI.isUri(fallbackNLS) ? await this.getTranslations(fallbackNLS) : fallbackNLS;
            if (translations) {
                manifest = localizeManifest(this.logService, manifest, translations, fallbackTranslations);
            }
        }
        catch (error) { }
        return manifest;
    }
    async getExtensionManifest(location) {
        const url = joinPath(location, 'package.json');
        const content = await this.extensionResourceLoaderService.readExtensionResource(url);
        return JSON.parse(content);
    }
    async getTranslations(nlsUrl) {
        try {
            const content = await this.extensionResourceLoaderService.readExtensionResource(nlsUrl);
            return JSON.parse(content);
        }
        catch (error) {
            this.logService.error(`Error while fetching translations of an extension`, nlsUrl.toString(), getErrorMessage(error));
        }
        return undefined;
    }
    async readInstalledExtensions(profileLocation) {
        return this.withWebExtensions(profileLocation);
    }
    writeInstalledExtensions(profileLocation, updateFn) {
        return this.withWebExtensions(profileLocation, updateFn);
    }
    readCustomBuiltinExtensionsCache() {
        return this.withWebExtensions(this.customBuiltinExtensionsCacheResource);
    }
    writeCustomBuiltinExtensionsCache(updateFn) {
        return this.withWebExtensions(this.customBuiltinExtensionsCacheResource, updateFn);
    }
    readSystemExtensionsCache() {
        return this.withWebExtensions(this.systemExtensionsCacheResource);
    }
    writeSystemExtensionsCache(updateFn) {
        return this.withWebExtensions(this.systemExtensionsCacheResource, updateFn);
    }
    async withWebExtensions(file, updateFn) {
        if (!file) {
            return [];
        }
        return this.getResourceAccessQueue(file).queue(async () => {
            let webExtensions = [];
            try {
                const content = await this.fileService.readFile(file);
                const storedWebExtensions = JSON.parse(content.value.toString());
                for (const e of storedWebExtensions) {
                    if (!e.location || !e.identifier || !e.version) {
                        this.logService.info('Ignoring invalid extension while scanning', storedWebExtensions);
                        continue;
                    }
                    let packageNLSUris;
                    if (e.packageNLSUris) {
                        packageNLSUris = new Map();
                        Object.entries(e.packageNLSUris).forEach(([key, value]) => packageNLSUris.set(key, URI.revive(value)));
                    }
                    webExtensions.push({
                        identifier: e.identifier,
                        version: e.version,
                        location: URI.revive(e.location),
                        manifest: e.manifest,
                        readmeUri: URI.revive(e.readmeUri),
                        changelogUri: URI.revive(e.changelogUri),
                        packageNLSUris,
                        fallbackPackageNLSUri: URI.revive(e.fallbackPackageNLSUri),
                        defaultManifestTranslations: e.defaultManifestTranslations,
                        packageNLSUri: URI.revive(e.packageNLSUri),
                        metadata: e.metadata,
                    });
                }
                try {
                    webExtensions = await this.migrateWebExtensions(webExtensions, file);
                }
                catch (error) {
                    this.logService.error(`Error while migrating scanned extensions in ${file.toString()}`, getErrorMessage(error));
                }
            }
            catch (error) {
                if (error.fileOperationResult !== 1) {
                    this.logService.error(error);
                }
            }
            if (updateFn) {
                await this.storeWebExtensions(webExtensions = updateFn(webExtensions), file);
            }
            return webExtensions;
        });
    }
    async migrateWebExtensions(webExtensions, file) {
        let update = false;
        webExtensions = await Promise.all(webExtensions.map(async (webExtension) => {
            if (!webExtension.manifest) {
                try {
                    webExtension.manifest = await this.getExtensionManifest(webExtension.location);
                    update = true;
                }
                catch (error) {
                    this.logService.error(`Error while updating manifest of an extension in ${file.toString()}`, webExtension.identifier.id, getErrorMessage(error));
                }
            }
            if (isUndefined(webExtension.defaultManifestTranslations)) {
                if (webExtension.fallbackPackageNLSUri) {
                    try {
                        const content = await this.extensionResourceLoaderService.readExtensionResource(webExtension.fallbackPackageNLSUri);
                        webExtension.defaultManifestTranslations = JSON.parse(content);
                        update = true;
                    }
                    catch (error) {
                        this.logService.error(`Error while fetching default manifest translations of an extension`, webExtension.identifier.id, getErrorMessage(error));
                    }
                }
                else {
                    update = true;
                    webExtension.defaultManifestTranslations = null;
                }
            }
            const migratedLocation = migratePlatformSpecificExtensionGalleryResourceURL(webExtension.location, "web");
            if (migratedLocation) {
                update = true;
                webExtension.location = migratedLocation;
            }
            if (isUndefined(webExtension.metadata?.hasPreReleaseVersion) && webExtension.metadata?.preRelease) {
                update = true;
                webExtension.metadata.hasPreReleaseVersion = true;
            }
            return webExtension;
        }));
        if (update) {
            await this.storeWebExtensions(webExtensions, file);
        }
        return webExtensions;
    }
    async storeWebExtensions(webExtensions, file) {
        function toStringDictionary(dictionary) {
            if (!dictionary) {
                return undefined;
            }
            const result = Object.create(null);
            dictionary.forEach((value, key) => result[key] = value.toJSON());
            return result;
        }
        const storedWebExtensions = webExtensions.map(e => ({
            identifier: e.identifier,
            version: e.version,
            manifest: e.manifest,
            location: e.location.toJSON(),
            readmeUri: e.readmeUri?.toJSON(),
            changelogUri: e.changelogUri?.toJSON(),
            packageNLSUris: toStringDictionary(e.packageNLSUris),
            defaultManifestTranslations: e.defaultManifestTranslations,
            fallbackPackageNLSUri: e.fallbackPackageNLSUri?.toJSON(),
            metadata: e.metadata
        }));
        await this.fileService.writeFile(file, VSBuffer.fromString(JSON.stringify(storedWebExtensions)));
    }
    getResourceAccessQueue(file) {
        let resourceQueue = this.resourcesAccessQueueMap.get(file);
        if (!resourceQueue) {
            this.resourcesAccessQueueMap.set(file, resourceQueue = new Queue());
        }
        return resourceQueue;
    }
};
WebExtensionsScannerService = __decorate([
    __param(0, IBrowserWorkbenchEnvironmentService),
    __param(1, IBuiltinExtensionsScannerService),
    __param(2, IFileService),
    __param(3, ILogService),
    __param(4, IExtensionGalleryService),
    __param(5, IExtensionManifestPropertiesService),
    __param(6, IExtensionResourceLoaderService),
    __param(7, IExtensionStorageService),
    __param(8, IStorageService),
    __param(9, IProductService),
    __param(10, IUserDataProfilesService),
    __param(11, IUriIdentityService),
    __param(12, ILifecycleService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WebExtensionsScannerService);
export { WebExtensionsScannerService };
if (isWeb) {
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id: 'workbench.extensions.action.openInstalledWebExtensionsResource',
                title: localize2('openInstalledWebExtensionsResource', 'Open Installed Web Extensions Resource'),
                category: Categories.Developer,
                f1: true,
                precondition: IsWebContext
            });
        }
        run(serviceAccessor) {
            const editorService = serviceAccessor.get(IEditorService);
            const userDataProfileService = serviceAccessor.get(IUserDataProfileService);
            editorService.openEditor({ resource: userDataProfileService.currentProfile.extensionsResource });
        }
    });
}
registerSingleton(IWebExtensionsScannerService, WebExtensionsScannerService, 1);
