import { localize } from '../../../nls.js';
import { URI } from '../../../base/common/uri.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Schemas } from '../../../base/common/network.js';
import { basename, extname, normalize } from '../../../base/common/path.js';
import { isLinux } from '../../../base/common/platform.js';
import { extUri, extUriIgnorePathCase } from '../../../base/common/resources.js';
import { newWriteableStream } from '../../../base/common/stream.js';
import { createFileSystemProviderError, FileSystemProviderError, FileSystemProviderErrorCode, FileType } from '../common/files.js';
import { WebFileSystemAccess } from './webFileSystemAccess.js';
export class HTMLFileSystemProvider {
    get capabilities() {
        if (!this._capabilities) {
            this._capabilities =
                2 |
                    16;
            if (isLinux) {
                this._capabilities |= 1024;
            }
        }
        return this._capabilities;
    }
    constructor(indexedDB, store, logService) {
        this.indexedDB = indexedDB;
        this.store = store;
        this.logService = logService;
        this.onDidChangeCapabilities = Event.None;
        this.onDidChangeFile = Event.None;
        this.extUri = isLinux ? extUri : extUriIgnorePathCase;
        this._files = new Map();
        this._directories = new Map();
    }
    async stat(resource) {
        try {
            const handle = await this.getHandle(resource);
            if (!handle) {
                throw this.createFileSystemProviderError(resource, 'No such file or directory, stat', FileSystemProviderErrorCode.FileNotFound);
            }
            if (WebFileSystemAccess.isFileSystemFileHandle(handle)) {
                const file = await handle.getFile();
                return {
                    type: FileType.File,
                    mtime: file.lastModified,
                    ctime: 0,
                    size: file.size
                };
            }
            return {
                type: FileType.Directory,
                mtime: 0,
                ctime: 0,
                size: 0
            };
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    async readdir(resource) {
        try {
            const handle = await this.getDirectoryHandle(resource);
            if (!handle) {
                throw this.createFileSystemProviderError(resource, 'No such file or directory, readdir', FileSystemProviderErrorCode.FileNotFound);
            }
            const result = [];
            for await (const [name, child] of handle) {
                result.push([name, WebFileSystemAccess.isFileSystemFileHandle(child) ? FileType.File : FileType.Directory]);
            }
            return result;
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    readFileStream(resource, opts, token) {
        const stream = newWriteableStream(data => VSBuffer.concat(data.map(data => VSBuffer.wrap(data))).buffer, {
            highWaterMark: 10
        });
        (async () => {
            try {
                const handle = await this.getFileHandle(resource);
                if (!handle) {
                    throw this.createFileSystemProviderError(resource, 'No such file or directory, readFile', FileSystemProviderErrorCode.FileNotFound);
                }
                const file = await handle.getFile();
                if (typeof opts.length === 'number' || typeof opts.position === 'number') {
                    let buffer = new Uint8Array(await file.arrayBuffer());
                    if (typeof opts?.position === 'number') {
                        buffer = buffer.slice(opts.position);
                    }
                    if (typeof opts?.length === 'number') {
                        buffer = buffer.slice(0, opts.length);
                    }
                    stream.end(buffer);
                }
                else {
                    const reader = file.stream().getReader();
                    let res = await reader.read();
                    while (!res.done) {
                        if (token.isCancellationRequested) {
                            break;
                        }
                        await stream.write(res.value);
                        if (token.isCancellationRequested) {
                            break;
                        }
                        res = await reader.read();
                    }
                    stream.end(undefined);
                }
            }
            catch (error) {
                stream.error(this.toFileSystemProviderError(error));
                stream.end();
            }
        })();
        return stream;
    }
    async readFile(resource) {
        try {
            const handle = await this.getFileHandle(resource);
            if (!handle) {
                throw this.createFileSystemProviderError(resource, 'No such file or directory, readFile', FileSystemProviderErrorCode.FileNotFound);
            }
            const file = await handle.getFile();
            return new Uint8Array(await file.arrayBuffer());
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    async writeFile(resource, content, opts) {
        try {
            let handle = await this.getFileHandle(resource);
            if (!opts.create || !opts.overwrite) {
                if (handle) {
                    if (!opts.overwrite) {
                        throw this.createFileSystemProviderError(resource, 'File already exists, writeFile', FileSystemProviderErrorCode.FileExists);
                    }
                }
                else {
                    if (!opts.create) {
                        throw this.createFileSystemProviderError(resource, 'No such file, writeFile', FileSystemProviderErrorCode.FileNotFound);
                    }
                }
            }
            if (!handle) {
                const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
                if (!parent) {
                    throw this.createFileSystemProviderError(resource, 'No such parent directory, writeFile', FileSystemProviderErrorCode.FileNotFound);
                }
                handle = await parent.getFileHandle(this.extUri.basename(resource), { create: true });
                if (!handle) {
                    throw this.createFileSystemProviderError(resource, 'Unable to create file , writeFile', FileSystemProviderErrorCode.Unknown);
                }
            }
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    async mkdir(resource) {
        try {
            const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
            if (!parent) {
                throw this.createFileSystemProviderError(resource, 'No such parent directory, mkdir', FileSystemProviderErrorCode.FileNotFound);
            }
            await parent.getDirectoryHandle(this.extUri.basename(resource), { create: true });
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    async delete(resource, opts) {
        try {
            const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
            if (!parent) {
                throw this.createFileSystemProviderError(resource, 'No such parent directory, delete', FileSystemProviderErrorCode.FileNotFound);
            }
            return parent.removeEntry(this.extUri.basename(resource), { recursive: opts.recursive });
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    async rename(from, to, opts) {
        try {
            if (this.extUri.isEqual(from, to)) {
                return;
            }
            const fileHandle = await this.getFileHandle(from);
            if (fileHandle) {
                const file = await fileHandle.getFile();
                const contents = new Uint8Array(await file.arrayBuffer());
                await this.writeFile(to, contents, { create: true, overwrite: opts.overwrite, unlock: false, atomic: false });
                await this.delete(from, { recursive: false, useTrash: false, atomic: false });
            }
            else {
                throw this.createFileSystemProviderError(from, localize('fileSystemRenameError', "Rename is only supported for files."), FileSystemProviderErrorCode.Unavailable);
            }
        }
        catch (error) {
            throw this.toFileSystemProviderError(error);
        }
    }
    watch(resource, opts) {
        return Disposable.None;
    }
    registerFileHandle(handle) {
        return this.registerHandle(handle, this._files);
    }
    registerDirectoryHandle(handle) {
        return this.registerHandle(handle, this._directories);
    }
    get directories() {
        return this._directories.values();
    }
    async registerHandle(handle, map) {
        let handleId = `/${handle.name}`;
        if (map.has(handleId) && !await map.get(handleId)?.isSameEntry(handle)) {
            const fileExt = extname(handle.name);
            const fileName = basename(handle.name, fileExt);
            let handleIdCounter = 1;
            do {
                handleId = `/${fileName}-${handleIdCounter++}${fileExt}`;
            } while (map.has(handleId) && !await map.get(handleId)?.isSameEntry(handle));
        }
        map.set(handleId, handle);
        try {
            await this.indexedDB?.runInTransaction(this.store, 'readwrite', objectStore => objectStore.put(handle, handleId));
        }
        catch (error) {
            this.logService.error(error);
        }
        return URI.from({ scheme: Schemas.file, path: handleId });
    }
    async getHandle(resource) {
        let handle = await this.doGetHandle(resource);
        if (!handle) {
            const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
            if (parent) {
                const name = extUri.basename(resource);
                try {
                    handle = await parent.getFileHandle(name);
                }
                catch (error) {
                    try {
                        handle = await parent.getDirectoryHandle(name);
                    }
                    catch (error) {
                    }
                }
            }
        }
        return handle;
    }
    async getFileHandle(resource) {
        const handle = await this.doGetHandle(resource);
        if (handle instanceof FileSystemFileHandle) {
            return handle;
        }
        const parent = await this.getDirectoryHandle(this.extUri.dirname(resource));
        try {
            return await parent?.getFileHandle(extUri.basename(resource));
        }
        catch (error) {
            return undefined;
        }
    }
    async getDirectoryHandle(resource) {
        const handle = await this.doGetHandle(resource);
        if (handle instanceof FileSystemDirectoryHandle) {
            return handle;
        }
        const parentUri = this.extUri.dirname(resource);
        if (this.extUri.isEqual(parentUri, resource)) {
            return undefined;
        }
        const parent = await this.getDirectoryHandle(parentUri);
        try {
            return await parent?.getDirectoryHandle(extUri.basename(resource));
        }
        catch (error) {
            return undefined;
        }
    }
    async doGetHandle(resource) {
        if (this.extUri.dirname(resource).path !== '/') {
            return undefined;
        }
        const handleId = resource.path.replace(/\/$/, '');
        const inMemoryHandle = this._files.get(handleId) ?? this._directories.get(handleId);
        if (inMemoryHandle) {
            return inMemoryHandle;
        }
        const persistedHandle = await this.indexedDB?.runInTransaction(this.store, 'readonly', store => store.get(handleId));
        if (WebFileSystemAccess.isFileSystemHandle(persistedHandle)) {
            let hasPermissions = await persistedHandle.queryPermission() === 'granted';
            try {
                if (!hasPermissions) {
                    hasPermissions = await persistedHandle.requestPermission() === 'granted';
                }
            }
            catch (error) {
                this.logService.error(error);
            }
            if (hasPermissions) {
                if (WebFileSystemAccess.isFileSystemFileHandle(persistedHandle)) {
                    this._files.set(handleId, persistedHandle);
                }
                else if (WebFileSystemAccess.isFileSystemDirectoryHandle(persistedHandle)) {
                    this._directories.set(handleId, persistedHandle);
                }
                return persistedHandle;
            }
        }
        throw this.createFileSystemProviderError(resource, 'No file system handle registered', FileSystemProviderErrorCode.Unavailable);
    }
    toFileSystemProviderError(error) {
        if (error instanceof FileSystemProviderError) {
            return error;
        }
        let code = FileSystemProviderErrorCode.Unknown;
        if (error.name === 'NotAllowedError') {
            error = new Error(localize('fileSystemNotAllowedError', "Insufficient permissions. Please retry and allow the operation."));
            code = FileSystemProviderErrorCode.Unavailable;
        }
        return createFileSystemProviderError(error, code);
    }
    createFileSystemProviderError(resource, msg, code) {
        return createFileSystemProviderError(new Error(`${msg} (${normalize(resource.path)})`), code);
    }
}
