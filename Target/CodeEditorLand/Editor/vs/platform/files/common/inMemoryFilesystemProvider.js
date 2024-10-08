/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { VSBuffer } from '../../../base/common/buffer.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import * as resources from '../../../base/common/resources.js';
import { newWriteableStream } from '../../../base/common/stream.js';
import { FileSystemProviderErrorCode, FileType, createFileSystemProviderError } from './files.js';
class File {
    constructor(name) {
        this.type = FileType.File;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
    }
}
class Directory {
    constructor(name) {
        this.type = FileType.Directory;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
        this.entries = new Map();
    }
}
export class InMemoryFileSystemProvider extends Disposable {
    constructor() {
        super(...arguments);
        this.memoryFdCounter = 0;
        this.fdMemory = new Map();
        this._onDidChangeCapabilities = this._register(new Emitter());
        this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
        this._capabilities = 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
        this.root = new Directory('');
        // --- manage file events
        this._onDidChangeFile = this._register(new Emitter());
        this.onDidChangeFile = this._onDidChangeFile.event;
        this._bufferedChanges = [];
    }
    get capabilities() { return this._capabilities; }
    setReadOnly(readonly) {
        const isReadonly = !!(this._capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */);
        if (readonly !== isReadonly) {
            this._capabilities = readonly ? 2048 /* FileSystemProviderCapabilities.Readonly */ | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */ | 2 /* FileSystemProviderCapabilities.FileReadWrite */
                : 2 /* FileSystemProviderCapabilities.FileReadWrite */ | 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */;
            this._onDidChangeCapabilities.fire();
        }
    }
    // --- manage file metadata
    async stat(resource) {
        return this._lookup(resource, false);
    }
    async readdir(resource) {
        const entry = this._lookupAsDirectory(resource, false);
        const result = [];
        entry.entries.forEach((child, name) => result.push([name, child.type]));
        return result;
    }
    // --- manage file contents
    async readFile(resource) {
        const data = this._lookupAsFile(resource, false).data;
        if (data) {
            return data;
        }
        throw createFileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
    }
    readFileStream(resource) {
        const data = this._lookupAsFile(resource, false).data;
        const stream = newWriteableStream(data => VSBuffer.concat(data.map(data => VSBuffer.wrap(data))).buffer);
        stream.end(data);
        return stream;
    }
    async writeFile(resource, content, opts) {
        const basename = resources.basename(resource);
        const parent = this._lookupParentDirectory(resource);
        let entry = parent.entries.get(basename);
        if (entry instanceof Directory) {
            throw createFileSystemProviderError('file is directory', FileSystemProviderErrorCode.FileIsADirectory);
        }
        if (!entry && !opts.create) {
            throw createFileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
        }
        if (entry && opts.create && !opts.overwrite) {
            throw createFileSystemProviderError('file exists already', FileSystemProviderErrorCode.FileExists);
        }
        if (!entry) {
            entry = new File(basename);
            parent.entries.set(basename, entry);
            this._fireSoon({ type: 1 /* FileChangeType.ADDED */, resource });
        }
        entry.mtime = Date.now();
        entry.size = content.byteLength;
        entry.data = content;
        this._fireSoon({ type: 0 /* FileChangeType.UPDATED */, resource });
    }
    // file open/read/write/close
    open(resource, opts) {
        const data = this._lookupAsFile(resource, false).data;
        if (data) {
            const fd = this.memoryFdCounter++;
            this.fdMemory.set(fd, data);
            return Promise.resolve(fd);
        }
        throw createFileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
    }
    close(fd) {
        this.fdMemory.delete(fd);
        return Promise.resolve();
    }
    read(fd, pos, data, offset, length) {
        const memory = this.fdMemory.get(fd);
        if (!memory) {
            throw createFileSystemProviderError(`No file with that descriptor open`, FileSystemProviderErrorCode.Unavailable);
        }
        const toWrite = VSBuffer.wrap(memory).slice(pos, pos + length);
        data.set(toWrite.buffer, offset);
        return Promise.resolve(toWrite.byteLength);
    }
    write(fd, pos, data, offset, length) {
        const memory = this.fdMemory.get(fd);
        if (!memory) {
            throw createFileSystemProviderError(`No file with that descriptor open`, FileSystemProviderErrorCode.Unavailable);
        }
        const toWrite = VSBuffer.wrap(data).slice(offset, offset + length);
        memory.set(toWrite.buffer, pos);
        return Promise.resolve(toWrite.byteLength);
    }
    // --- manage files/folders
    async rename(from, to, opts) {
        if (!opts.overwrite && this._lookup(to, true)) {
            throw createFileSystemProviderError('file exists already', FileSystemProviderErrorCode.FileExists);
        }
        const entry = this._lookup(from, false);
        const oldParent = this._lookupParentDirectory(from);
        const newParent = this._lookupParentDirectory(to);
        const newName = resources.basename(to);
        oldParent.entries.delete(entry.name);
        entry.name = newName;
        newParent.entries.set(newName, entry);
        this._fireSoon({ type: 2 /* FileChangeType.DELETED */, resource: from }, { type: 1 /* FileChangeType.ADDED */, resource: to });
    }
    async delete(resource, opts) {
        const dirname = resources.dirname(resource);
        const basename = resources.basename(resource);
        const parent = this._lookupAsDirectory(dirname, false);
        if (parent.entries.has(basename)) {
            parent.entries.delete(basename);
            parent.mtime = Date.now();
            parent.size -= 1;
            this._fireSoon({ type: 0 /* FileChangeType.UPDATED */, resource: dirname }, { resource, type: 2 /* FileChangeType.DELETED */ });
        }
    }
    async mkdir(resource) {
        if (this._lookup(resource, true)) {
            throw createFileSystemProviderError('file exists already', FileSystemProviderErrorCode.FileExists);
        }
        const basename = resources.basename(resource);
        const dirname = resources.dirname(resource);
        const parent = this._lookupAsDirectory(dirname, false);
        const entry = new Directory(basename);
        parent.entries.set(entry.name, entry);
        parent.mtime = Date.now();
        parent.size += 1;
        this._fireSoon({ type: 0 /* FileChangeType.UPDATED */, resource: dirname }, { type: 1 /* FileChangeType.ADDED */, resource });
    }
    _lookup(uri, silent) {
        const parts = uri.path.split('/');
        let entry = this.root;
        for (const part of parts) {
            if (!part) {
                continue;
            }
            let child;
            if (entry instanceof Directory) {
                child = entry.entries.get(part);
            }
            if (!child) {
                if (!silent) {
                    throw createFileSystemProviderError('file not found', FileSystemProviderErrorCode.FileNotFound);
                }
                else {
                    return undefined;
                }
            }
            entry = child;
        }
        return entry;
    }
    _lookupAsDirectory(uri, silent) {
        const entry = this._lookup(uri, silent);
        if (entry instanceof Directory) {
            return entry;
        }
        throw createFileSystemProviderError('file not a directory', FileSystemProviderErrorCode.FileNotADirectory);
    }
    _lookupAsFile(uri, silent) {
        const entry = this._lookup(uri, silent);
        if (entry instanceof File) {
            return entry;
        }
        throw createFileSystemProviderError('file is a directory', FileSystemProviderErrorCode.FileIsADirectory);
    }
    _lookupParentDirectory(uri) {
        const dirname = resources.dirname(uri);
        return this._lookupAsDirectory(dirname, false);
    }
    watch(resource, opts) {
        // ignore, fires for all changes...
        return Disposable.None;
    }
    _fireSoon(...changes) {
        this._bufferedChanges.push(...changes);
        if (this._fireSoonHandle) {
            clearTimeout(this._fireSoonHandle);
        }
        this._fireSoonHandle = setTimeout(() => {
            this._onDidChangeFile.fire(this._bufferedChanges);
            this._bufferedChanges.length = 0;
        }, 5);
    }
    dispose() {
        super.dispose();
        this.fdMemory.clear();
    }
}
