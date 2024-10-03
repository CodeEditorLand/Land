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
var WorkingCopyBackupServiceImpl_1;
import { joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { equals, deepClone } from '../../../../base/common/objects.js';
import { Promises, ResourceQueue } from '../../../../base/common/async.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { isReadableStream, peekStream } from '../../../../base/common/stream.js';
import { bufferToStream, prefixedBufferReadable, prefixedBufferStream, readableToBuffer, streamToBuffer, VSBuffer } from '../../../../base/common/buffer.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Schemas } from '../../../../base/common/network.js';
import { hash } from '../../../../base/common/hash.js';
import { isEmptyObject } from '../../../../base/common/types.js';
import { NO_TYPE_ID } from './workingCopy.js';
export class WorkingCopyBackupsModel {
    static async create(backupRoot, fileService) {
        const model = new WorkingCopyBackupsModel(backupRoot, fileService);
        await model.resolve();
        return model;
    }
    constructor(backupRoot, fileService) {
        this.backupRoot = backupRoot;
        this.fileService = fileService;
        this.cache = new ResourceMap();
    }
    async resolve() {
        try {
            const backupRootStat = await this.fileService.resolve(this.backupRoot);
            if (backupRootStat.children) {
                await Promises.settled(backupRootStat.children
                    .filter(child => child.isDirectory)
                    .map(async (backupSchemaFolder) => {
                    const backupSchemaFolderStat = await this.fileService.resolve(backupSchemaFolder.resource);
                    if (backupSchemaFolderStat.children) {
                        for (const backupForSchema of backupSchemaFolderStat.children) {
                            if (!backupForSchema.isDirectory) {
                                this.add(backupForSchema.resource);
                            }
                        }
                    }
                }));
            }
        }
        catch (error) {
        }
    }
    add(resource, versionId = 0, meta) {
        this.cache.set(resource, {
            versionId,
            meta: deepClone(meta)
        });
    }
    update(resource, meta) {
        const entry = this.cache.get(resource);
        if (entry) {
            entry.meta = deepClone(meta);
        }
    }
    count() {
        return this.cache.size;
    }
    has(resource, versionId, meta) {
        const entry = this.cache.get(resource);
        if (!entry) {
            return false;
        }
        if (typeof versionId === 'number' && versionId !== entry.versionId) {
            return false;
        }
        if (meta && !equals(meta, entry.meta)) {
            return false;
        }
        return true;
    }
    get() {
        return Array.from(this.cache.keys());
    }
    remove(resource) {
        this.cache.delete(resource);
    }
    clear() {
        this.cache.clear();
    }
}
let WorkingCopyBackupService = class WorkingCopyBackupService extends Disposable {
    constructor(backupWorkspaceHome, fileService, logService) {
        super();
        this.fileService = fileService;
        this.logService = logService;
        this.impl = this._register(this.initialize(backupWorkspaceHome));
    }
    initialize(backupWorkspaceHome) {
        if (backupWorkspaceHome) {
            return new WorkingCopyBackupServiceImpl(backupWorkspaceHome, this.fileService, this.logService);
        }
        return new InMemoryWorkingCopyBackupService();
    }
    reinitialize(backupWorkspaceHome) {
        if (this.impl instanceof WorkingCopyBackupServiceImpl) {
            if (backupWorkspaceHome) {
                this.impl.initialize(backupWorkspaceHome);
            }
            else {
                this.impl = new InMemoryWorkingCopyBackupService();
            }
        }
    }
    hasBackups() {
        return this.impl.hasBackups();
    }
    hasBackupSync(identifier, versionId, meta) {
        return this.impl.hasBackupSync(identifier, versionId, meta);
    }
    backup(identifier, content, versionId, meta, token) {
        return this.impl.backup(identifier, content, versionId, meta, token);
    }
    discardBackup(identifier, token) {
        return this.impl.discardBackup(identifier, token);
    }
    discardBackups(filter) {
        return this.impl.discardBackups(filter);
    }
    getBackups() {
        return this.impl.getBackups();
    }
    resolve(identifier) {
        return this.impl.resolve(identifier);
    }
    toBackupResource(identifier) {
        return this.impl.toBackupResource(identifier);
    }
    joinBackups() {
        return this.impl.joinBackups();
    }
};
WorkingCopyBackupService = __decorate([
    __param(1, IFileService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], WorkingCopyBackupService);
export { WorkingCopyBackupService };
let WorkingCopyBackupServiceImpl = class WorkingCopyBackupServiceImpl extends Disposable {
    static { WorkingCopyBackupServiceImpl_1 = this; }
    static { this.PREAMBLE_END_MARKER = '\n'; }
    static { this.PREAMBLE_END_MARKER_CHARCODE = '\n'.charCodeAt(0); }
    static { this.PREAMBLE_META_SEPARATOR = ' '; }
    static { this.PREAMBLE_MAX_LENGTH = 10000; }
    constructor(backupWorkspaceHome, fileService, logService) {
        super();
        this.backupWorkspaceHome = backupWorkspaceHome;
        this.fileService = fileService;
        this.logService = logService;
        this.ioOperationQueues = this._register(new ResourceQueue());
        this.model = undefined;
        this.initialize(backupWorkspaceHome);
    }
    initialize(backupWorkspaceResource) {
        this.backupWorkspaceHome = backupWorkspaceResource;
        this.ready = this.doInitialize();
    }
    async doInitialize() {
        this.model = await WorkingCopyBackupsModel.create(this.backupWorkspaceHome, this.fileService);
        return this.model;
    }
    async hasBackups() {
        const model = await this.ready;
        await this.joinBackups();
        return model.count() > 0;
    }
    hasBackupSync(identifier, versionId, meta) {
        if (!this.model) {
            return false;
        }
        const backupResource = this.toBackupResource(identifier);
        return this.model.has(backupResource, versionId, meta);
    }
    async backup(identifier, content, versionId, meta, token) {
        const model = await this.ready;
        if (token?.isCancellationRequested) {
            return;
        }
        const backupResource = this.toBackupResource(identifier);
        if (model.has(backupResource, versionId, meta)) {
            return;
        }
        return this.ioOperationQueues.queueFor(backupResource, async () => {
            if (token?.isCancellationRequested) {
                return;
            }
            if (model.has(backupResource, versionId, meta)) {
                return;
            }
            let preamble = this.createPreamble(identifier, meta);
            if (preamble.length >= WorkingCopyBackupServiceImpl_1.PREAMBLE_MAX_LENGTH) {
                preamble = this.createPreamble(identifier);
            }
            const preambleBuffer = VSBuffer.fromString(preamble);
            let backupBuffer;
            if (isReadableStream(content)) {
                backupBuffer = prefixedBufferStream(preambleBuffer, content);
            }
            else if (content) {
                backupBuffer = prefixedBufferReadable(preambleBuffer, content);
            }
            else {
                backupBuffer = VSBuffer.concat([preambleBuffer, VSBuffer.fromString('')]);
            }
            await this.fileService.writeFile(backupResource, backupBuffer);
            model.add(backupResource, versionId, meta);
        });
    }
    createPreamble(identifier, meta) {
        return `${identifier.resource.toString()}${WorkingCopyBackupServiceImpl_1.PREAMBLE_META_SEPARATOR}${JSON.stringify({ ...meta, typeId: identifier.typeId })}${WorkingCopyBackupServiceImpl_1.PREAMBLE_END_MARKER}`;
    }
    async discardBackups(filter) {
        const model = await this.ready;
        const except = filter?.except;
        if (Array.isArray(except) && except.length > 0) {
            const exceptMap = new ResourceMap();
            for (const exceptWorkingCopy of except) {
                exceptMap.set(this.toBackupResource(exceptWorkingCopy), true);
            }
            await Promises.settled(model.get().map(async (backupResource) => {
                if (!exceptMap.has(backupResource)) {
                    await this.doDiscardBackup(backupResource);
                }
            }));
        }
        else {
            await this.deleteIgnoreFileNotFound(this.backupWorkspaceHome);
            model.clear();
        }
    }
    discardBackup(identifier, token) {
        const backupResource = this.toBackupResource(identifier);
        return this.doDiscardBackup(backupResource, token);
    }
    async doDiscardBackup(backupResource, token) {
        const model = await this.ready;
        if (token?.isCancellationRequested) {
            return;
        }
        return this.ioOperationQueues.queueFor(backupResource, async () => {
            if (token?.isCancellationRequested) {
                return;
            }
            await this.deleteIgnoreFileNotFound(backupResource);
            model.remove(backupResource);
        });
    }
    async deleteIgnoreFileNotFound(backupResource) {
        try {
            await this.fileService.del(backupResource, { recursive: true });
        }
        catch (error) {
            if (error.fileOperationResult !== 1) {
                throw error;
            }
        }
    }
    async getBackups() {
        const model = await this.ready;
        await this.joinBackups();
        const backups = await Promise.all(model.get().map(backupResource => this.resolveIdentifier(backupResource, model)));
        return coalesce(backups);
    }
    async resolveIdentifier(backupResource, model) {
        let res = undefined;
        await this.ioOperationQueues.queueFor(backupResource, async () => {
            if (!model.has(backupResource)) {
                return;
            }
            const backupPreamble = await this.readToMatchingString(backupResource, WorkingCopyBackupServiceImpl_1.PREAMBLE_END_MARKER, WorkingCopyBackupServiceImpl_1.PREAMBLE_MAX_LENGTH);
            if (!backupPreamble) {
                return;
            }
            const metaStartIndex = backupPreamble.indexOf(WorkingCopyBackupServiceImpl_1.PREAMBLE_META_SEPARATOR);
            let resourcePreamble;
            let metaPreamble;
            if (metaStartIndex > 0) {
                resourcePreamble = backupPreamble.substring(0, metaStartIndex);
                metaPreamble = backupPreamble.substr(metaStartIndex + 1);
            }
            else {
                resourcePreamble = backupPreamble;
                metaPreamble = undefined;
            }
            const { typeId, meta } = this.parsePreambleMeta(metaPreamble);
            model.update(backupResource, meta);
            res = {
                typeId: typeId ?? NO_TYPE_ID,
                resource: URI.parse(resourcePreamble)
            };
        });
        return res;
    }
    async readToMatchingString(backupResource, matchingString, maximumBytesToRead) {
        const contents = (await this.fileService.readFile(backupResource, { length: maximumBytesToRead })).value.toString();
        const matchingStringIndex = contents.indexOf(matchingString);
        if (matchingStringIndex >= 0) {
            return contents.substr(0, matchingStringIndex);
        }
        return undefined;
    }
    async resolve(identifier) {
        const backupResource = this.toBackupResource(identifier);
        const model = await this.ready;
        let res = undefined;
        await this.ioOperationQueues.queueFor(backupResource, async () => {
            if (!model.has(backupResource)) {
                return;
            }
            const backupStream = await this.fileService.readFileStream(backupResource);
            const peekedBackupStream = await peekStream(backupStream.value, 1);
            const firstBackupChunk = VSBuffer.concat(peekedBackupStream.buffer);
            const preambleEndIndex = firstBackupChunk.buffer.indexOf(WorkingCopyBackupServiceImpl_1.PREAMBLE_END_MARKER_CHARCODE);
            if (preambleEndIndex === -1) {
                this.logService.trace(`Backup: Could not find meta end marker in ${backupResource}. The file is probably corrupt (filesize: ${backupStream.size}).`);
                return undefined;
            }
            const preambelRaw = firstBackupChunk.slice(0, preambleEndIndex).toString();
            let meta;
            const metaStartIndex = preambelRaw.indexOf(WorkingCopyBackupServiceImpl_1.PREAMBLE_META_SEPARATOR);
            if (metaStartIndex !== -1) {
                meta = this.parsePreambleMeta(preambelRaw.substr(metaStartIndex + 1)).meta;
            }
            model.update(backupResource, meta);
            const firstBackupChunkWithoutPreamble = firstBackupChunk.slice(preambleEndIndex + 1);
            let value;
            if (peekedBackupStream.ended) {
                value = bufferToStream(firstBackupChunkWithoutPreamble);
            }
            else {
                value = prefixedBufferStream(firstBackupChunkWithoutPreamble, peekedBackupStream.stream);
            }
            res = { value, meta };
        });
        return res;
    }
    parsePreambleMeta(preambleMetaRaw) {
        let typeId = undefined;
        let meta = undefined;
        if (preambleMetaRaw) {
            try {
                meta = JSON.parse(preambleMetaRaw);
                typeId = meta?.typeId;
                if (typeof meta?.typeId === 'string') {
                    delete meta.typeId;
                    if (isEmptyObject(meta)) {
                        meta = undefined;
                    }
                }
            }
            catch (error) {
            }
        }
        return { typeId, meta };
    }
    toBackupResource(identifier) {
        return joinPath(this.backupWorkspaceHome, identifier.resource.scheme, hashIdentifier(identifier));
    }
    joinBackups() {
        return this.ioOperationQueues.whenDrained();
    }
};
WorkingCopyBackupServiceImpl = WorkingCopyBackupServiceImpl_1 = __decorate([
    __param(1, IFileService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [URI, Object, Object])
], WorkingCopyBackupServiceImpl);
export class InMemoryWorkingCopyBackupService extends Disposable {
    constructor() {
        super();
        this.backups = new ResourceMap();
    }
    async hasBackups() {
        return this.backups.size > 0;
    }
    hasBackupSync(identifier, versionId) {
        const backupResource = this.toBackupResource(identifier);
        return this.backups.has(backupResource);
    }
    async backup(identifier, content, versionId, meta, token) {
        const backupResource = this.toBackupResource(identifier);
        this.backups.set(backupResource, {
            typeId: identifier.typeId,
            content: content instanceof VSBuffer ? content : content ? isReadableStream(content) ? await streamToBuffer(content) : readableToBuffer(content) : VSBuffer.fromString(''),
            meta
        });
    }
    async resolve(identifier) {
        const backupResource = this.toBackupResource(identifier);
        const backup = this.backups.get(backupResource);
        if (backup) {
            return { value: bufferToStream(backup.content), meta: backup.meta };
        }
        return undefined;
    }
    async getBackups() {
        return Array.from(this.backups.entries()).map(([resource, backup]) => ({ typeId: backup.typeId, resource }));
    }
    async discardBackup(identifier) {
        this.backups.delete(this.toBackupResource(identifier));
    }
    async discardBackups(filter) {
        const except = filter?.except;
        if (Array.isArray(except) && except.length > 0) {
            const exceptMap = new ResourceMap();
            for (const exceptWorkingCopy of except) {
                exceptMap.set(this.toBackupResource(exceptWorkingCopy), true);
            }
            for (const backup of await this.getBackups()) {
                if (!exceptMap.has(this.toBackupResource(backup))) {
                    await this.discardBackup(backup);
                }
            }
        }
        else {
            this.backups.clear();
        }
    }
    toBackupResource(identifier) {
        return URI.from({ scheme: Schemas.inMemory, path: hashIdentifier(identifier) });
    }
    async joinBackups() {
        return;
    }
}
export function hashIdentifier(identifier) {
    let resource;
    if (identifier.typeId.length > 0) {
        const typeIdHash = hashString(identifier.typeId);
        if (identifier.resource.path) {
            resource = joinPath(identifier.resource, typeIdHash);
        }
        else {
            resource = identifier.resource.with({ path: typeIdHash });
        }
    }
    else {
        resource = identifier.resource;
    }
    return hashPath(resource);
}
function hashPath(resource) {
    const str = resource.scheme === Schemas.file || resource.scheme === Schemas.untitled ? resource.fsPath : resource.toString();
    return hashString(str);
}
function hashString(str) {
    return hash(str).toString(16);
}
