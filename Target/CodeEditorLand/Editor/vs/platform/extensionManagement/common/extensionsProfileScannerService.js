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
import { Queue } from '../../../base/common/async.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Emitter } from '../../../base/common/event.js';
import { ResourceMap } from '../../../base/common/map.js';
import { URI } from '../../../base/common/uri.js';
import { isIExtensionIdentifier } from './extensionManagement.js';
import { areSameExtensions } from './extensionManagementUtil.js';
import { IFileService, toFileOperationResult } from '../../files/common/files.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { isObject, isString, isUndefined } from '../../../base/common/types.js';
import { getErrorMessage } from '../../../base/common/errors.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export class ExtensionsProfileScanningError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
export const IExtensionsProfileScannerService = createDecorator('IExtensionsProfileScannerService');
let AbstractExtensionsProfileScannerService = class AbstractExtensionsProfileScannerService extends Disposable {
    constructor(extensionsLocation, fileService, userDataProfilesService, uriIdentityService, telemetryService, logService) {
        super();
        this.extensionsLocation = extensionsLocation;
        this.fileService = fileService;
        this.userDataProfilesService = userDataProfilesService;
        this.uriIdentityService = uriIdentityService;
        this.telemetryService = telemetryService;
        this.logService = logService;
        this._onAddExtensions = this._register(new Emitter());
        this.onAddExtensions = this._onAddExtensions.event;
        this._onDidAddExtensions = this._register(new Emitter());
        this.onDidAddExtensions = this._onDidAddExtensions.event;
        this._onRemoveExtensions = this._register(new Emitter());
        this.onRemoveExtensions = this._onRemoveExtensions.event;
        this._onDidRemoveExtensions = this._register(new Emitter());
        this.onDidRemoveExtensions = this._onDidRemoveExtensions.event;
        this.resourcesAccessQueueMap = new ResourceMap();
    }
    scanProfileExtensions(profileLocation, options) {
        return this.withProfileExtensions(profileLocation, undefined, options);
    }
    async addExtensionsToProfile(extensions, profileLocation, keepExistingVersions) {
        const extensionsToRemove = [];
        const extensionsToAdd = [];
        try {
            await this.withProfileExtensions(profileLocation, existingExtensions => {
                const result = [];
                if (keepExistingVersions) {
                    result.push(...existingExtensions);
                }
                else {
                    for (const existing of existingExtensions) {
                        if (extensions.some(([e]) => areSameExtensions(e.identifier, existing.identifier) && e.manifest.version !== existing.version)) {
                            extensionsToRemove.push(existing);
                        }
                        else {
                            result.push(existing);
                        }
                    }
                }
                for (const [extension, metadata] of extensions) {
                    const index = result.findIndex(e => areSameExtensions(e.identifier, extension.identifier) && e.version === extension.manifest.version);
                    const extensionToAdd = { identifier: extension.identifier, version: extension.manifest.version, location: extension.location, metadata };
                    if (index === -1) {
                        extensionsToAdd.push(extensionToAdd);
                        result.push(extensionToAdd);
                    }
                    else {
                        result.splice(index, 1, extensionToAdd);
                    }
                }
                if (extensionsToAdd.length) {
                    this._onAddExtensions.fire({ extensions: extensionsToAdd, profileLocation });
                }
                if (extensionsToRemove.length) {
                    this._onRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
                }
                return result;
            });
            if (extensionsToAdd.length) {
                this._onDidAddExtensions.fire({ extensions: extensionsToAdd, profileLocation });
            }
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
            }
            return extensionsToAdd;
        }
        catch (error) {
            if (extensionsToAdd.length) {
                this._onDidAddExtensions.fire({ extensions: extensionsToAdd, error, profileLocation });
            }
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, error, profileLocation });
            }
            throw error;
        }
    }
    async updateMetadata(extensions, profileLocation) {
        const updatedExtensions = [];
        await this.withProfileExtensions(profileLocation, profileExtensions => {
            const result = [];
            for (const profileExtension of profileExtensions) {
                const extension = extensions.find(([e]) => areSameExtensions(e.identifier, profileExtension.identifier) && e.manifest.version === profileExtension.version);
                if (extension) {
                    profileExtension.metadata = { ...profileExtension.metadata, ...extension[1] };
                    updatedExtensions.push(profileExtension);
                    result.push(profileExtension);
                }
                else {
                    result.push(profileExtension);
                }
            }
            return result;
        });
        return updatedExtensions;
    }
    async removeExtensionFromProfile(extension, profileLocation) {
        const extensionsToRemove = [];
        try {
            await this.withProfileExtensions(profileLocation, profileExtensions => {
                const result = [];
                for (const e of profileExtensions) {
                    if (areSameExtensions(e.identifier, extension.identifier)) {
                        extensionsToRemove.push(e);
                    }
                    else {
                        result.push(e);
                    }
                }
                if (extensionsToRemove.length) {
                    this._onRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
                }
                return result;
            });
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, profileLocation });
            }
        }
        catch (error) {
            if (extensionsToRemove.length) {
                this._onDidRemoveExtensions.fire({ extensions: extensionsToRemove, error, profileLocation });
            }
            throw error;
        }
    }
    async withProfileExtensions(file, updateFn, options) {
        return this.getResourceAccessQueue(file).queue(async () => {
            let extensions = [];
            let storedProfileExtensions;
            try {
                const content = await this.fileService.readFile(file);
                storedProfileExtensions = JSON.parse(content.value.toString().trim() || '[]');
            }
            catch (error) {
                if (toFileOperationResult(error) !== 1) {
                    throw error;
                }
                if (this.uriIdentityService.extUri.isEqual(file, this.userDataProfilesService.defaultProfile.extensionsResource)) {
                    storedProfileExtensions = await this.migrateFromOldDefaultProfileExtensionsLocation();
                }
                if (!storedProfileExtensions && options?.bailOutWhenFileNotFound) {
                    throw new ExtensionsProfileScanningError(getErrorMessage(error), "ERROR_PROFILE_NOT_FOUND");
                }
            }
            if (storedProfileExtensions) {
                if (!Array.isArray(storedProfileExtensions)) {
                    this.reportAndThrowInvalidConentError(file);
                }
                let migrate = false;
                for (const e of storedProfileExtensions) {
                    if (!isStoredProfileExtension(e)) {
                        this.reportAndThrowInvalidConentError(file);
                    }
                    let location;
                    if (isString(e.relativeLocation) && e.relativeLocation) {
                        location = this.resolveExtensionLocation(e.relativeLocation);
                    }
                    else if (isString(e.location)) {
                        this.logService.warn(`Extensions profile: Ignoring extension with invalid location: ${e.location}`);
                        continue;
                    }
                    else {
                        location = URI.revive(e.location);
                        const relativePath = this.toRelativePath(location);
                        if (relativePath) {
                            migrate = true;
                            e.relativeLocation = relativePath;
                        }
                    }
                    if (isUndefined(e.metadata?.hasPreReleaseVersion) && e.metadata?.preRelease) {
                        migrate = true;
                        e.metadata.hasPreReleaseVersion = true;
                    }
                    extensions.push({
                        identifier: e.identifier,
                        location,
                        version: e.version,
                        metadata: e.metadata,
                    });
                }
                if (migrate) {
                    await this.fileService.writeFile(file, VSBuffer.fromString(JSON.stringify(storedProfileExtensions)));
                }
            }
            if (updateFn) {
                extensions = updateFn(extensions);
                const storedProfileExtensions = extensions.map(e => ({
                    identifier: e.identifier,
                    version: e.version,
                    location: e.location.toJSON(),
                    relativeLocation: this.toRelativePath(e.location),
                    metadata: e.metadata
                }));
                await this.fileService.writeFile(file, VSBuffer.fromString(JSON.stringify(storedProfileExtensions)));
            }
            return extensions;
        });
    }
    reportAndThrowInvalidConentError(file) {
        const error = new ExtensionsProfileScanningError(`Invalid extensions content in ${file.toString()}`, "ERROR_INVALID_CONTENT");
        this.telemetryService.publicLogError2('extensionsProfileScanningError', { code: error.code });
        throw error;
    }
    toRelativePath(extensionLocation) {
        return this.uriIdentityService.extUri.isEqual(this.uriIdentityService.extUri.dirname(extensionLocation), this.extensionsLocation)
            ? this.uriIdentityService.extUri.basename(extensionLocation)
            : undefined;
    }
    resolveExtensionLocation(path) {
        return this.uriIdentityService.extUri.joinPath(this.extensionsLocation, path);
    }
    async migrateFromOldDefaultProfileExtensionsLocation() {
        if (!this._migrationPromise) {
            this._migrationPromise = (async () => {
                const oldDefaultProfileExtensionsLocation = this.uriIdentityService.extUri.joinPath(this.userDataProfilesService.defaultProfile.location, 'extensions.json');
                const oldDefaultProfileExtensionsInitLocation = this.uriIdentityService.extUri.joinPath(this.extensionsLocation, '.init-default-profile-extensions');
                let content;
                try {
                    content = (await this.fileService.readFile(oldDefaultProfileExtensionsLocation)).value.toString();
                }
                catch (error) {
                    if (toFileOperationResult(error) === 1) {
                        return undefined;
                    }
                    throw error;
                }
                this.logService.info('Migrating extensions from old default profile location', oldDefaultProfileExtensionsLocation.toString());
                let storedProfileExtensions;
                try {
                    const parsedData = JSON.parse(content);
                    if (Array.isArray(parsedData) && parsedData.every(candidate => isStoredProfileExtension(candidate))) {
                        storedProfileExtensions = parsedData;
                    }
                    else {
                        this.logService.warn('Skipping migrating from old default profile locaiton: Found invalid data', parsedData);
                    }
                }
                catch (error) {
                    this.logService.error(error);
                }
                if (storedProfileExtensions) {
                    try {
                        await this.fileService.createFile(this.userDataProfilesService.defaultProfile.extensionsResource, VSBuffer.fromString(JSON.stringify(storedProfileExtensions)), { overwrite: false });
                        this.logService.info('Migrated extensions from old default profile location to new location', oldDefaultProfileExtensionsLocation.toString(), this.userDataProfilesService.defaultProfile.extensionsResource.toString());
                    }
                    catch (error) {
                        if (toFileOperationResult(error) === 3) {
                            this.logService.info('Migration from old default profile location to new location is done by another window', oldDefaultProfileExtensionsLocation.toString(), this.userDataProfilesService.defaultProfile.extensionsResource.toString());
                        }
                        else {
                            throw error;
                        }
                    }
                }
                try {
                    await this.fileService.del(oldDefaultProfileExtensionsLocation);
                }
                catch (error) {
                    if (toFileOperationResult(error) !== 1) {
                        this.logService.error(error);
                    }
                }
                try {
                    await this.fileService.del(oldDefaultProfileExtensionsInitLocation);
                }
                catch (error) {
                    if (toFileOperationResult(error) !== 1) {
                        this.logService.error(error);
                    }
                }
                return storedProfileExtensions;
            })();
        }
        return this._migrationPromise;
    }
    getResourceAccessQueue(file) {
        let resourceQueue = this.resourcesAccessQueueMap.get(file);
        if (!resourceQueue) {
            resourceQueue = new Queue();
            this.resourcesAccessQueueMap.set(file, resourceQueue);
        }
        return resourceQueue;
    }
};
AbstractExtensionsProfileScannerService = __decorate([
    __param(1, IFileService),
    __param(2, IUserDataProfilesService),
    __param(3, IUriIdentityService),
    __param(4, ITelemetryService),
    __param(5, ILogService),
    __metadata("design:paramtypes", [URI, Object, Object, Object, Object, Object])
], AbstractExtensionsProfileScannerService);
export { AbstractExtensionsProfileScannerService };
function isStoredProfileExtension(candidate) {
    return isObject(candidate)
        && isIExtensionIdentifier(candidate.identifier)
        && (isUriComponents(candidate.location) || (isString(candidate.location) && candidate.location))
        && (isUndefined(candidate.relativeLocation) || isString(candidate.relativeLocation))
        && candidate.version && isString(candidate.version);
}
function isUriComponents(thing) {
    if (!thing) {
        return false;
    }
    return isString(thing.path) &&
        isString(thing.scheme);
}
