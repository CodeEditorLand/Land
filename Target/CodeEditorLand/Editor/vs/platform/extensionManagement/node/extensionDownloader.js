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
var ExtensionsDownloader_1;
import { Promises } from '../../../base/common/async.js';
import { getErrorMessage } from '../../../base/common/errors.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Schemas } from '../../../base/common/network.js';
import { joinPath } from '../../../base/common/resources.js';
import * as semver from '../../../base/common/semver/semver.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { Promises as FSPromises } from '../../../base/node/pfs.js';
import { buffer, CorruptZipMessage } from '../../../base/node/zip.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { toExtensionManagementError } from '../common/abstractExtensionManagementService.js';
import { ExtensionManagementError, ExtensionSignatureVerificationCode, IExtensionGalleryService } from '../common/extensionManagement.js';
import { ExtensionKey, groupByExtension } from '../common/extensionManagementUtil.js';
import { fromExtractError } from './extensionManagementUtil.js';
import { IExtensionSignatureVerificationService } from './extensionSignatureVerificationService.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
let ExtensionsDownloader = class ExtensionsDownloader extends Disposable {
    static { ExtensionsDownloader_1 = this; }
    static { this.SignatureArchiveExtension = '.sigzip'; }
    constructor(environmentService, fileService, extensionGalleryService, extensionSignatureVerificationService, telemetryService, logService) {
        super();
        this.fileService = fileService;
        this.extensionGalleryService = extensionGalleryService;
        this.extensionSignatureVerificationService = extensionSignatureVerificationService;
        this.telemetryService = telemetryService;
        this.logService = logService;
        this.extensionsDownloadDir = environmentService.extensionsDownloadLocation;
        this.cache = 20;
        this.cleanUpPromise = this.cleanUp();
    }
    async download(extension, operation, verifySignature, clientTargetPlatform) {
        await this.cleanUpPromise;
        const location = await this.downloadVSIX(extension, operation);
        if (!verifySignature || !extension.isSigned) {
            return { location, verificationStatus: undefined };
        }
        let signatureArchiveLocation;
        try {
            signatureArchiveLocation = await this.downloadSignatureArchive(extension);
            const verificationStatus = (await this.extensionSignatureVerificationService.verify(extension.identifier.id, extension.version, location.fsPath, signatureArchiveLocation.fsPath, clientTargetPlatform))?.code;
            if (verificationStatus === ExtensionSignatureVerificationCode.PackageIsInvalidZip || verificationStatus === ExtensionSignatureVerificationCode.SignatureArchiveIsInvalidZip) {
                try {
                    await this.delete(location);
                }
                catch (error) {
                    this.logService.error(error);
                }
                throw new ExtensionManagementError(CorruptZipMessage, "CorruptZip");
            }
            return { location, verificationStatus };
        }
        catch (error) {
            try {
                await this.delete(location);
            }
            catch (error) {
                this.logService.error(error);
            }
            throw error;
        }
        finally {
            if (signatureArchiveLocation) {
                try {
                    await this.delete(signatureArchiveLocation);
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
        }
    }
    async downloadVSIX(extension, operation) {
        try {
            const location = joinPath(this.extensionsDownloadDir, this.getName(extension));
            const attempts = await this.doDownload(extension, 'vsix', async () => {
                await this.downloadFile(extension, location, location => this.extensionGalleryService.download(extension, location, operation));
                try {
                    await this.validate(location.fsPath, 'extension/package.json');
                }
                catch (error) {
                    try {
                        await this.fileService.del(location);
                    }
                    catch (e) {
                        this.logService.warn(`Error while deleting: ${location.path}`, getErrorMessage(e));
                    }
                    throw error;
                }
            }, 2);
            if (attempts > 1) {
                this.telemetryService.publicLog2('extensiongallery:downloadvsix:retry', {
                    extensionId: extension.identifier.id,
                    attempts
                });
            }
            return location;
        }
        catch (e) {
            throw toExtensionManagementError(e, "Download");
        }
    }
    async downloadSignatureArchive(extension) {
        try {
            const location = joinPath(this.extensionsDownloadDir, `.${generateUuid()}`);
            const attempts = await this.doDownload(extension, 'sigzip', async () => {
                await this.extensionGalleryService.downloadSignatureArchive(extension, location);
                try {
                    await this.validate(location.fsPath, '.signature.p7s');
                }
                catch (error) {
                    try {
                        await this.fileService.del(location);
                    }
                    catch (e) {
                        this.logService.warn(`Error while deleting: ${location.path}`, getErrorMessage(e));
                    }
                    throw error;
                }
            }, 2);
            if (attempts > 1) {
                this.telemetryService.publicLog2('extensiongallery:downloadsigzip:retry', {
                    extensionId: extension.identifier.id,
                    attempts
                });
            }
            return location;
        }
        catch (e) {
            throw toExtensionManagementError(e, "DownloadSignature");
        }
    }
    async downloadFile(extension, location, downloadFn) {
        if (await this.fileService.exists(location)) {
            return;
        }
        if (location.scheme !== Schemas.file) {
            await downloadFn(location);
            return;
        }
        const tempLocation = joinPath(this.extensionsDownloadDir, `.${generateUuid()}`);
        try {
            await downloadFn(tempLocation);
        }
        catch (error) {
            try {
                await this.fileService.del(tempLocation);
            }
            catch (e) { }
            throw error;
        }
        try {
            await FSPromises.rename(tempLocation.fsPath, location.fsPath, 2 * 60 * 1000);
        }
        catch (error) {
            try {
                await this.fileService.del(tempLocation);
            }
            catch (e) { }
            let exists = false;
            try {
                exists = await this.fileService.exists(location);
            }
            catch (e) { }
            if (exists) {
                this.logService.info(`Rename failed because the file was downloaded by another source. So ignoring renaming.`, extension.identifier.id, location.path);
            }
            else {
                this.logService.info(`Rename failed because of ${getErrorMessage(error)}. Deleted the file from downloaded location`, tempLocation.path);
                throw error;
            }
        }
    }
    async doDownload(extension, name, downloadFn, retries) {
        let attempts = 1;
        while (true) {
            try {
                await downloadFn();
                return attempts;
            }
            catch (e) {
                if (attempts++ > retries) {
                    throw e;
                }
                this.logService.warn(`Failed downloading ${name}. ${getErrorMessage(e)}. Retry again...`, extension.identifier.id);
            }
        }
    }
    async validate(zipPath, filePath) {
        try {
            await buffer(zipPath, filePath);
        }
        catch (e) {
            throw fromExtractError(e);
        }
    }
    async delete(location) {
        await this.cleanUpPromise;
        await this.fileService.del(location);
    }
    async cleanUp() {
        try {
            if (!(await this.fileService.exists(this.extensionsDownloadDir))) {
                this.logService.trace('Extension VSIX downloads cache dir does not exist');
                return;
            }
            const folderStat = await this.fileService.resolve(this.extensionsDownloadDir, { resolveMetadata: true });
            if (folderStat.children) {
                const toDelete = [];
                const vsixs = [];
                const signatureArchives = [];
                for (const stat of folderStat.children) {
                    if (stat.name.endsWith(ExtensionsDownloader_1.SignatureArchiveExtension)) {
                        signatureArchives.push(stat.resource);
                    }
                    else {
                        const extension = ExtensionKey.parse(stat.name);
                        if (extension) {
                            vsixs.push([extension, stat]);
                        }
                    }
                }
                const byExtension = groupByExtension(vsixs, ([extension]) => extension);
                const distinct = [];
                for (const p of byExtension) {
                    p.sort((a, b) => semver.rcompare(a[0].version, b[0].version));
                    toDelete.push(...p.slice(1).map(e => e[1].resource));
                    distinct.push(p[0][1]);
                }
                distinct.sort((a, b) => a.mtime - b.mtime);
                toDelete.push(...distinct.slice(0, Math.max(0, distinct.length - this.cache)).map(s => s.resource));
                toDelete.push(...signatureArchives);
                await Promises.settled(toDelete.map(resource => {
                    this.logService.trace('Deleting from cache', resource.path);
                    return this.fileService.del(resource);
                }));
            }
        }
        catch (e) {
            this.logService.error(e);
        }
    }
    getName(extension) {
        return this.cache ? ExtensionKey.create(extension).toString().toLowerCase() : generateUuid();
    }
};
ExtensionsDownloader = ExtensionsDownloader_1 = __decorate([
    __param(0, INativeEnvironmentService),
    __param(1, IFileService),
    __param(2, IExtensionGalleryService),
    __param(3, IExtensionSignatureVerificationService),
    __param(4, ITelemetryService),
    __param(5, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ExtensionsDownloader);
export { ExtensionsDownloader };
