/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { VSBuffer } from '../../../../base/common/buffer.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { clamp } from '../../../../base/common/numbers.js';
import { assertNever } from '../../../../base/common/assert.js';
import { FilePermission, FileSystemProviderErrorCode, FileType, createFileSystemProviderError } from '../../../../platform/files/common/files.js';
import { DEBUG_MEMORY_SCHEME } from '../common/debug.js';
const rangeRe = /range=([0-9]+):([0-9]+)/;
export class DebugMemoryFileSystemProvider {
    constructor(debugService) {
        this.debugService = debugService;
        this.memoryFdCounter = 0;
        this.fdMemory = new Map();
        this.changeEmitter = new Emitter();
        /** @inheritdoc */
        this.onDidChangeCapabilities = Event.None;
        /** @inheritdoc */
        this.onDidChangeFile = this.changeEmitter.event;
        /** @inheritdoc */
        this.capabilities = 0
            | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */
            | 4 /* FileSystemProviderCapabilities.FileOpenReadWriteClose */;
        debugService.onDidEndSession(({ session }) => {
            for (const [fd, memory] of this.fdMemory) {
                if (memory.session === session) {
                    this.close(fd);
                }
            }
        });
    }
    watch(resource, opts) {
        if (opts.recursive) {
            return toDisposable(() => { });
        }
        const { session, memoryReference, offset } = this.parseUri(resource);
        const disposable = new DisposableStore();
        disposable.add(session.onDidChangeState(() => {
            if (session.state === 3 /* State.Running */ || session.state === 0 /* State.Inactive */) {
                this.changeEmitter.fire([{ type: 2 /* FileChangeType.DELETED */, resource }]);
            }
        }));
        disposable.add(session.onDidInvalidateMemory(e => {
            if (e.body.memoryReference !== memoryReference) {
                return;
            }
            if (offset && (e.body.offset >= offset.toOffset || e.body.offset + e.body.count < offset.fromOffset)) {
                return;
            }
            this.changeEmitter.fire([{ resource, type: 0 /* FileChangeType.UPDATED */ }]);
        }));
        return disposable;
    }
    /** @inheritdoc */
    stat(file) {
        const { readOnly } = this.parseUri(file);
        return Promise.resolve({
            type: FileType.File,
            mtime: 0,
            ctime: 0,
            size: 0,
            permissions: readOnly ? FilePermission.Readonly : undefined,
        });
    }
    /** @inheritdoc */
    mkdir() {
        throw createFileSystemProviderError(`Not allowed`, FileSystemProviderErrorCode.NoPermissions);
    }
    /** @inheritdoc */
    readdir() {
        throw createFileSystemProviderError(`Not allowed`, FileSystemProviderErrorCode.NoPermissions);
    }
    /** @inheritdoc */
    delete() {
        throw createFileSystemProviderError(`Not allowed`, FileSystemProviderErrorCode.NoPermissions);
    }
    /** @inheritdoc */
    rename() {
        throw createFileSystemProviderError(`Not allowed`, FileSystemProviderErrorCode.NoPermissions);
    }
    /** @inheritdoc */
    open(resource, _opts) {
        const { session, memoryReference, offset } = this.parseUri(resource);
        const fd = this.memoryFdCounter++;
        let region = session.getMemory(memoryReference);
        if (offset) {
            region = new MemoryRegionView(region, offset);
        }
        this.fdMemory.set(fd, { session, region });
        return Promise.resolve(fd);
    }
    /** @inheritdoc */
    close(fd) {
        this.fdMemory.get(fd)?.region.dispose();
        this.fdMemory.delete(fd);
        return Promise.resolve();
    }
    /** @inheritdoc */
    async writeFile(resource, content) {
        const { offset } = this.parseUri(resource);
        if (!offset) {
            throw createFileSystemProviderError(`Range must be present to read a file`, FileSystemProviderErrorCode.FileNotFound);
        }
        const fd = await this.open(resource, { create: false });
        try {
            await this.write(fd, offset.fromOffset, content, 0, content.length);
        }
        finally {
            this.close(fd);
        }
    }
    /** @inheritdoc */
    async readFile(resource) {
        const { offset } = this.parseUri(resource);
        if (!offset) {
            throw createFileSystemProviderError(`Range must be present to read a file`, FileSystemProviderErrorCode.FileNotFound);
        }
        const data = new Uint8Array(offset.toOffset - offset.fromOffset);
        const fd = await this.open(resource, { create: false });
        try {
            await this.read(fd, offset.fromOffset, data, 0, data.length);
            return data;
        }
        finally {
            this.close(fd);
        }
    }
    /** @inheritdoc */
    async read(fd, pos, data, offset, length) {
        const memory = this.fdMemory.get(fd);
        if (!memory) {
            throw createFileSystemProviderError(`No file with that descriptor open`, FileSystemProviderErrorCode.Unavailable);
        }
        const ranges = await memory.region.read(pos, length);
        let readSoFar = 0;
        for (const range of ranges) {
            switch (range.type) {
                case 1 /* MemoryRangeType.Unreadable */:
                    return readSoFar;
                case 2 /* MemoryRangeType.Error */:
                    if (readSoFar > 0) {
                        return readSoFar;
                    }
                    else {
                        throw createFileSystemProviderError(range.error, FileSystemProviderErrorCode.Unknown);
                    }
                case 0 /* MemoryRangeType.Valid */: {
                    const start = Math.max(0, pos - range.offset);
                    const toWrite = range.data.slice(start, Math.min(range.data.byteLength, start + (length - readSoFar)));
                    data.set(toWrite.buffer, offset + readSoFar);
                    readSoFar += toWrite.byteLength;
                    break;
                }
                default:
                    assertNever(range);
            }
        }
        return readSoFar;
    }
    /** @inheritdoc */
    write(fd, pos, data, offset, length) {
        const memory = this.fdMemory.get(fd);
        if (!memory) {
            throw createFileSystemProviderError(`No file with that descriptor open`, FileSystemProviderErrorCode.Unavailable);
        }
        return memory.region.write(pos, VSBuffer.wrap(data).slice(offset, offset + length));
    }
    parseUri(uri) {
        if (uri.scheme !== DEBUG_MEMORY_SCHEME) {
            throw createFileSystemProviderError(`Cannot open file with scheme ${uri.scheme}`, FileSystemProviderErrorCode.FileNotFound);
        }
        const session = this.debugService.getModel().getSession(uri.authority);
        if (!session) {
            throw createFileSystemProviderError(`Debug session not found`, FileSystemProviderErrorCode.FileNotFound);
        }
        let offset;
        const rangeMatch = rangeRe.exec(uri.query);
        if (rangeMatch) {
            offset = { fromOffset: Number(rangeMatch[1]), toOffset: Number(rangeMatch[2]) };
        }
        const [, memoryReference] = uri.path.split('/');
        return {
            session,
            offset,
            readOnly: !session.capabilities.supportsWriteMemoryRequest,
            sessionId: uri.authority,
            memoryReference: decodeURIComponent(memoryReference),
        };
    }
}
/** A wrapper for a MemoryRegion that references a subset of data in another region. */
class MemoryRegionView extends Disposable {
    constructor(parent, range) {
        super();
        this.parent = parent;
        this.range = range;
        this.invalidateEmitter = new Emitter();
        this.onDidInvalidate = this.invalidateEmitter.event;
        this.width = this.range.toOffset - this.range.fromOffset;
        this.writable = parent.writable;
        this._register(parent);
        this._register(parent.onDidInvalidate(e => {
            const fromOffset = clamp(e.fromOffset - range.fromOffset, 0, this.width);
            const toOffset = clamp(e.toOffset - range.fromOffset, 0, this.width);
            if (toOffset > fromOffset) {
                this.invalidateEmitter.fire({ fromOffset, toOffset });
            }
        }));
    }
    read(fromOffset, toOffset) {
        if (fromOffset < 0) {
            throw new RangeError(`Invalid fromOffset: ${fromOffset}`);
        }
        return this.parent.read(this.range.fromOffset + fromOffset, this.range.fromOffset + Math.min(toOffset, this.width));
    }
    write(offset, data) {
        return this.parent.write(this.range.fromOffset + offset, data);
    }
}
