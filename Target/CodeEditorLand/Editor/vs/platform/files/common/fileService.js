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
var FileService_1;
import { coalesce } from '../../../base/common/arrays.js';
import { Promises, ResourceQueue } from '../../../base/common/async.js';
import { bufferedStreamToBuffer, bufferToReadable, newWriteableBufferStream, readableToBuffer, streamToBuffer, VSBuffer } from '../../../base/common/buffer.js';
import { CancellationToken, CancellationTokenSource } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { hash } from '../../../base/common/hash.js';
import { Iterable } from '../../../base/common/iterator.js';
import { Disposable, DisposableStore, dispose, toDisposable } from '../../../base/common/lifecycle.js';
import { TernarySearchTree } from '../../../base/common/ternarySearchTree.js';
import { Schemas } from '../../../base/common/network.js';
import { mark } from '../../../base/common/performance.js';
import { extUri, extUriIgnorePathCase, isAbsolutePath } from '../../../base/common/resources.js';
import { consumeStream, isReadableBufferedStream, isReadableStream, listenStream, newWriteableStream, peekReadable, peekStream, transform } from '../../../base/common/stream.js';
import { localize } from '../../../nls.js';
import { ensureFileSystemProviderError, etag, ETAG_DISABLED, FileChangesEvent, FileOperationError, FileOperationEvent, FilePermission, FileSystemProviderErrorCode, FileType, hasFileAtomicReadCapability, hasFileFolderCopyCapability, hasFileReadStreamCapability, hasOpenReadWriteCloseCapability, hasReadWriteCapability, NotModifiedSinceFileOperationError, toFileOperationResult, toFileSystemProviderErrorCode, hasFileCloneCapability, TooLargeFileOperationError, hasFileAtomicDeleteCapability, hasFileAtomicWriteCapability } from './files.js';
import { readFileIntoStream } from './io.js';
import { ILogService } from '../../log/common/log.js';
import { ErrorNoTelemetry } from '../../../base/common/errors.js';
let FileService = class FileService extends Disposable {
    static { FileService_1 = this; }
    constructor(logService) {
        super();
        this.logService = logService;
        // Choose a buffer size that is a balance between memory needs and
        // manageable IPC overhead. The larger the buffer size, the less
        // roundtrips we have to do for reading/writing data.
        this.BUFFER_SIZE = 256 * 1024;
        //#region File System Provider
        this._onDidChangeFileSystemProviderRegistrations = this._register(new Emitter());
        this.onDidChangeFileSystemProviderRegistrations = this._onDidChangeFileSystemProviderRegistrations.event;
        this._onWillActivateFileSystemProvider = this._register(new Emitter());
        this.onWillActivateFileSystemProvider = this._onWillActivateFileSystemProvider.event;
        this._onDidChangeFileSystemProviderCapabilities = this._register(new Emitter());
        this.onDidChangeFileSystemProviderCapabilities = this._onDidChangeFileSystemProviderCapabilities.event;
        this.provider = new Map();
        //#endregion
        //#region Operation events
        this._onDidRunOperation = this._register(new Emitter());
        this.onDidRunOperation = this._onDidRunOperation.event;
        //#endregion
        //#region File Watching
        this.internalOnDidFilesChange = this._register(new Emitter());
        this._onDidUncorrelatedFilesChange = this._register(new Emitter());
        this.onDidFilesChange = this._onDidUncorrelatedFilesChange.event; // global `onDidFilesChange` skips correlated events
        this._onDidWatchError = this._register(new Emitter());
        this.onDidWatchError = this._onDidWatchError.event;
        this.activeWatchers = new Map();
        //#endregion
        //#region Helpers
        this.writeQueue = this._register(new ResourceQueue());
    }
    registerProvider(scheme, provider) {
        if (this.provider.has(scheme)) {
            throw new Error(`A filesystem provider for the scheme '${scheme}' is already registered.`);
        }
        mark(`code/registerFilesystem/${scheme}`);
        const providerDisposables = new DisposableStore();
        // Add provider with event
        this.provider.set(scheme, provider);
        this._onDidChangeFileSystemProviderRegistrations.fire({ added: true, scheme, provider });
        // Forward events from provider
        providerDisposables.add(provider.onDidChangeFile(changes => {
            const event = new FileChangesEvent(changes, !this.isPathCaseSensitive(provider));
            // Always emit any event internally
            this.internalOnDidFilesChange.fire(event);
            // Only emit uncorrelated events in the global `onDidFilesChange` event
            if (!event.hasCorrelation()) {
                this._onDidUncorrelatedFilesChange.fire(event);
            }
        }));
        if (typeof provider.onDidWatchError === 'function') {
            providerDisposables.add(provider.onDidWatchError(error => this._onDidWatchError.fire(new Error(error))));
        }
        providerDisposables.add(provider.onDidChangeCapabilities(() => this._onDidChangeFileSystemProviderCapabilities.fire({ provider, scheme })));
        return toDisposable(() => {
            this._onDidChangeFileSystemProviderRegistrations.fire({ added: false, scheme, provider });
            this.provider.delete(scheme);
            dispose(providerDisposables);
        });
    }
    getProvider(scheme) {
        return this.provider.get(scheme);
    }
    async activateProvider(scheme) {
        // Emit an event that we are about to activate a provider with the given scheme.
        // Listeners can participate in the activation by registering a provider for it.
        const joiners = [];
        this._onWillActivateFileSystemProvider.fire({
            scheme,
            join(promise) {
                joiners.push(promise);
            },
        });
        if (this.provider.has(scheme)) {
            return; // provider is already here so we can return directly
        }
        // If the provider is not yet there, make sure to join on the listeners assuming
        // that it takes a bit longer to register the file system provider.
        await Promises.settled(joiners);
    }
    async canHandleResource(resource) {
        // Await activation of potentially extension contributed providers
        await this.activateProvider(resource.scheme);
        return this.hasProvider(resource);
    }
    hasProvider(resource) {
        return this.provider.has(resource.scheme);
    }
    hasCapability(resource, capability) {
        const provider = this.provider.get(resource.scheme);
        return !!(provider && (provider.capabilities & capability));
    }
    listCapabilities() {
        return Iterable.map(this.provider, ([scheme, provider]) => ({ scheme, capabilities: provider.capabilities }));
    }
    async withProvider(resource) {
        // Assert path is absolute
        if (!isAbsolutePath(resource)) {
            throw new FileOperationError(localize('invalidPath', "Unable to resolve filesystem provider with relative file path '{0}'", this.resourceForError(resource)), 8 /* FileOperationResult.FILE_INVALID_PATH */);
        }
        // Activate provider
        await this.activateProvider(resource.scheme);
        // Assert provider
        const provider = this.provider.get(resource.scheme);
        if (!provider) {
            const error = new ErrorNoTelemetry();
            error.message = localize('noProviderFound', "ENOPRO: No file system provider found for resource '{0}'", resource.toString());
            throw error;
        }
        return provider;
    }
    async withReadProvider(resource) {
        const provider = await this.withProvider(resource);
        if (hasOpenReadWriteCloseCapability(provider) || hasReadWriteCapability(provider) || hasFileReadStreamCapability(provider)) {
            return provider;
        }
        throw new Error(`Filesystem provider for scheme '${resource.scheme}' neither has FileReadWrite, FileReadStream nor FileOpenReadWriteClose capability which is needed for the read operation.`);
    }
    async withWriteProvider(resource) {
        const provider = await this.withProvider(resource);
        if (hasOpenReadWriteCloseCapability(provider) || hasReadWriteCapability(provider)) {
            return provider;
        }
        throw new Error(`Filesystem provider for scheme '${resource.scheme}' neither has FileReadWrite nor FileOpenReadWriteClose capability which is needed for the write operation.`);
    }
    async resolve(resource, options) {
        try {
            return await this.doResolveFile(resource, options);
        }
        catch (error) {
            // Specially handle file not found case as file operation result
            if (toFileSystemProviderErrorCode(error) === FileSystemProviderErrorCode.FileNotFound) {
                throw new FileOperationError(localize('fileNotFoundError', "Unable to resolve nonexistent file '{0}'", this.resourceForError(resource)), 1 /* FileOperationResult.FILE_NOT_FOUND */);
            }
            // Bubble up any other error as is
            throw ensureFileSystemProviderError(error);
        }
    }
    async doResolveFile(resource, options) {
        const provider = await this.withProvider(resource);
        const isPathCaseSensitive = this.isPathCaseSensitive(provider);
        const resolveTo = options?.resolveTo;
        const resolveSingleChildDescendants = options?.resolveSingleChildDescendants;
        const resolveMetadata = options?.resolveMetadata;
        const stat = await provider.stat(resource);
        let trie;
        return this.toFileStat(provider, resource, stat, undefined, !!resolveMetadata, (stat, siblings) => {
            // lazy trie to check for recursive resolving
            if (!trie) {
                trie = TernarySearchTree.forUris(() => !isPathCaseSensitive);
                trie.set(resource, true);
                if (resolveTo) {
                    trie.fill(true, resolveTo);
                }
            }
            // check for recursive resolving
            if (trie.get(stat.resource) || trie.findSuperstr(stat.resource.with({ query: null, fragment: null } /* required for https://github.com/microsoft/vscode/issues/128151 */))) {
                return true;
            }
            // check for resolving single child folders
            if (stat.isDirectory && resolveSingleChildDescendants) {
                return siblings === 1;
            }
            return false;
        });
    }
    async toFileStat(provider, resource, stat, siblings, resolveMetadata, recurse) {
        const { providerExtUri } = this.getExtUri(provider);
        // convert to file stat
        const fileStat = {
            resource,
            name: providerExtUri.basename(resource),
            isFile: (stat.type & FileType.File) !== 0,
            isDirectory: (stat.type & FileType.Directory) !== 0,
            isSymbolicLink: (stat.type & FileType.SymbolicLink) !== 0,
            mtime: stat.mtime,
            ctime: stat.ctime,
            size: stat.size,
            readonly: Boolean((stat.permissions ?? 0) & FilePermission.Readonly) || Boolean(provider.capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */),
            locked: Boolean((stat.permissions ?? 0) & FilePermission.Locked),
            etag: etag({ mtime: stat.mtime, size: stat.size }),
            children: undefined
        };
        // check to recurse for directories
        if (fileStat.isDirectory && recurse(fileStat, siblings)) {
            try {
                const entries = await provider.readdir(resource);
                const resolvedEntries = await Promises.settled(entries.map(async ([name, type]) => {
                    try {
                        const childResource = providerExtUri.joinPath(resource, name);
                        const childStat = resolveMetadata ? await provider.stat(childResource) : { type };
                        return await this.toFileStat(provider, childResource, childStat, entries.length, resolveMetadata, recurse);
                    }
                    catch (error) {
                        this.logService.trace(error);
                        return null; // can happen e.g. due to permission errors
                    }
                }));
                // make sure to get rid of null values that signal a failure to resolve a particular entry
                fileStat.children = coalesce(resolvedEntries);
            }
            catch (error) {
                this.logService.trace(error);
                fileStat.children = []; // gracefully handle errors, we may not have permissions to read
            }
            return fileStat;
        }
        return fileStat;
    }
    async resolveAll(toResolve) {
        return Promises.settled(toResolve.map(async (entry) => {
            try {
                return { stat: await this.doResolveFile(entry.resource, entry.options), success: true };
            }
            catch (error) {
                this.logService.trace(error);
                return { stat: undefined, success: false };
            }
        }));
    }
    async stat(resource) {
        const provider = await this.withProvider(resource);
        const stat = await provider.stat(resource);
        return this.toFileStat(provider, resource, stat, undefined, true, () => false /* Do not resolve any children */);
    }
    async exists(resource) {
        const provider = await this.withProvider(resource);
        try {
            const stat = await provider.stat(resource);
            return !!stat;
        }
        catch (error) {
            return false;
        }
    }
    //#endregion
    //#region File Reading/Writing
    async canCreateFile(resource, options) {
        try {
            await this.doValidateCreateFile(resource, options);
        }
        catch (error) {
            return error;
        }
        return true;
    }
    async doValidateCreateFile(resource, options) {
        // validate overwrite
        if (!options?.overwrite && await this.exists(resource)) {
            throw new FileOperationError(localize('fileExists', "Unable to create file '{0}' that already exists when overwrite flag is not set", this.resourceForError(resource)), 3 /* FileOperationResult.FILE_MODIFIED_SINCE */, options);
        }
    }
    async createFile(resource, bufferOrReadableOrStream = VSBuffer.fromString(''), options) {
        // validate
        await this.doValidateCreateFile(resource, options);
        // do write into file (this will create it too)
        const fileStat = await this.writeFile(resource, bufferOrReadableOrStream);
        // events
        this._onDidRunOperation.fire(new FileOperationEvent(resource, 0 /* FileOperation.CREATE */, fileStat));
        return fileStat;
    }
    async writeFile(resource, bufferOrReadableOrStream, options) {
        const provider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(resource), resource);
        const { providerExtUri } = this.getExtUri(provider);
        let writeFileOptions = options;
        if (hasFileAtomicWriteCapability(provider) && !writeFileOptions?.atomic) {
            const enforcedAtomicWrite = provider.enforceAtomicWriteFile?.(resource);
            if (enforcedAtomicWrite) {
                writeFileOptions = { ...options, atomic: enforcedAtomicWrite };
            }
        }
        try {
            // validate write
            const stat = await this.validateWriteFile(provider, resource, writeFileOptions);
            // mkdir recursively as needed
            if (!stat) {
                await this.mkdirp(provider, providerExtUri.dirname(resource));
            }
            // optimization: if the provider has unbuffered write capability and the data
            // to write is not a buffer, we consume up to 3 chunks and try to write the data
            // unbuffered to reduce the overhead. If the stream or readable has more data
            // to provide we continue to write buffered.
            let bufferOrReadableOrStreamOrBufferedStream;
            if (hasReadWriteCapability(provider) && !(bufferOrReadableOrStream instanceof VSBuffer)) {
                if (isReadableStream(bufferOrReadableOrStream)) {
                    const bufferedStream = await peekStream(bufferOrReadableOrStream, 3);
                    if (bufferedStream.ended) {
                        bufferOrReadableOrStreamOrBufferedStream = VSBuffer.concat(bufferedStream.buffer);
                    }
                    else {
                        bufferOrReadableOrStreamOrBufferedStream = bufferedStream;
                    }
                }
                else {
                    bufferOrReadableOrStreamOrBufferedStream = peekReadable(bufferOrReadableOrStream, data => VSBuffer.concat(data), 3);
                }
            }
            else {
                bufferOrReadableOrStreamOrBufferedStream = bufferOrReadableOrStream;
            }
            // write file: unbuffered
            if (!hasOpenReadWriteCloseCapability(provider) || // buffered writing is unsupported
                (hasReadWriteCapability(provider) && bufferOrReadableOrStreamOrBufferedStream instanceof VSBuffer) || // data is a full buffer already
                (hasReadWriteCapability(provider) && hasFileAtomicWriteCapability(provider) && writeFileOptions?.atomic) // atomic write forces unbuffered write if the provider supports it
            ) {
                await this.doWriteUnbuffered(provider, resource, writeFileOptions, bufferOrReadableOrStreamOrBufferedStream);
            }
            // write file: buffered
            else {
                await this.doWriteBuffered(provider, resource, writeFileOptions, bufferOrReadableOrStreamOrBufferedStream instanceof VSBuffer ? bufferToReadable(bufferOrReadableOrStreamOrBufferedStream) : bufferOrReadableOrStreamOrBufferedStream);
            }
            // events
            this._onDidRunOperation.fire(new FileOperationEvent(resource, 4 /* FileOperation.WRITE */));
        }
        catch (error) {
            throw new FileOperationError(localize('err.write', "Unable to write file '{0}' ({1})", this.resourceForError(resource), ensureFileSystemProviderError(error).toString()), toFileOperationResult(error), writeFileOptions);
        }
        return this.resolve(resource, { resolveMetadata: true });
    }
    async validateWriteFile(provider, resource, options) {
        // Validate unlock support
        const unlock = !!options?.unlock;
        if (unlock && !(provider.capabilities & 8192 /* FileSystemProviderCapabilities.FileWriteUnlock */)) {
            throw new Error(localize('writeFailedUnlockUnsupported', "Unable to unlock file '{0}' because provider does not support it.", this.resourceForError(resource)));
        }
        // Validate atomic support
        const atomic = !!options?.atomic;
        if (atomic) {
            if (!(provider.capabilities & 32768 /* FileSystemProviderCapabilities.FileAtomicWrite */)) {
                throw new Error(localize('writeFailedAtomicUnsupported1', "Unable to atomically write file '{0}' because provider does not support it.", this.resourceForError(resource)));
            }
            if (!(provider.capabilities & 2 /* FileSystemProviderCapabilities.FileReadWrite */)) {
                throw new Error(localize('writeFailedAtomicUnsupported2', "Unable to atomically write file '{0}' because provider does not support unbuffered writes.", this.resourceForError(resource)));
            }
            if (unlock) {
                throw new Error(localize('writeFailedAtomicUnlock', "Unable to unlock file '{0}' because atomic write is enabled.", this.resourceForError(resource)));
            }
        }
        // Validate via file stat meta data
        let stat = undefined;
        try {
            stat = await provider.stat(resource);
        }
        catch (error) {
            return undefined; // file might not exist
        }
        // File cannot be directory
        if ((stat.type & FileType.Directory) !== 0) {
            throw new FileOperationError(localize('fileIsDirectoryWriteError', "Unable to write file '{0}' that is actually a directory", this.resourceForError(resource)), 0 /* FileOperationResult.FILE_IS_DIRECTORY */, options);
        }
        // File cannot be readonly
        this.throwIfFileIsReadonly(resource, stat);
        // Dirty write prevention: if the file on disk has been changed and does not match our expected
        // mtime and etag, we bail out to prevent dirty writing.
        //
        // First, we check for a mtime that is in the future before we do more checks. The assumption is
        // that only the mtime is an indicator for a file that has changed on disk.
        //
        // Second, if the mtime has advanced, we compare the size of the file on disk with our previous
        // one using the etag() function. Relying only on the mtime check has prooven to produce false
        // positives due to file system weirdness (especially around remote file systems). As such, the
        // check for size is a weaker check because it can return a false negative if the file has changed
        // but to the same length. This is a compromise we take to avoid having to produce checksums of
        // the file content for comparison which would be much slower to compute.
        if (typeof options?.mtime === 'number' && typeof options.etag === 'string' && options.etag !== ETAG_DISABLED &&
            typeof stat.mtime === 'number' && typeof stat.size === 'number' &&
            options.mtime < stat.mtime && options.etag !== etag({ mtime: options.mtime /* not using stat.mtime for a reason, see above */, size: stat.size })) {
            throw new FileOperationError(localize('fileModifiedError', "File Modified Since"), 3 /* FileOperationResult.FILE_MODIFIED_SINCE */, options);
        }
        return stat;
    }
    async readFile(resource, options, token) {
        const provider = await this.withReadProvider(resource);
        if (options?.atomic) {
            return this.doReadFileAtomic(provider, resource, options, token);
        }
        return this.doReadFile(provider, resource, options, token);
    }
    async doReadFileAtomic(provider, resource, options, token) {
        return new Promise((resolve, reject) => {
            this.writeQueue.queueFor(resource, async () => {
                try {
                    const content = await this.doReadFile(provider, resource, options, token);
                    resolve(content);
                }
                catch (error) {
                    reject(error);
                }
            }, this.getExtUri(provider).providerExtUri);
        });
    }
    async doReadFile(provider, resource, options, token) {
        const stream = await this.doReadFileStream(provider, resource, {
            ...options,
            // optimization: since we know that the caller does not
            // care about buffering, we indicate this to the reader.
            // this reduces all the overhead the buffered reading
            // has (open, read, close) if the provider supports
            // unbuffered reading.
            preferUnbuffered: true
        }, token);
        return {
            ...stream,
            value: await streamToBuffer(stream.value)
        };
    }
    async readFileStream(resource, options, token) {
        const provider = await this.withReadProvider(resource);
        return this.doReadFileStream(provider, resource, options, token);
    }
    async doReadFileStream(provider, resource, options, token) {
        // install a cancellation token that gets cancelled
        // when any error occurs. this allows us to resolve
        // the content of the file while resolving metadata
        // but still cancel the operation in certain cases.
        //
        // in addition, we pass the optional token in that
        // we got from the outside to even allow for external
        // cancellation of the read operation.
        const cancellableSource = new CancellationTokenSource(token);
        let readFileOptions = options;
        if (hasFileAtomicReadCapability(provider) && provider.enforceAtomicReadFile?.(resource)) {
            readFileOptions = { ...options, atomic: true };
        }
        // validate read operation
        const statPromise = this.validateReadFile(resource, readFileOptions).then(stat => stat, error => {
            cancellableSource.dispose(true);
            throw error;
        });
        let fileStream = undefined;
        try {
            // if the etag is provided, we await the result of the validation
            // due to the likelihood of hitting a NOT_MODIFIED_SINCE result.
            // otherwise, we let it run in parallel to the file reading for
            // optimal startup performance.
            if (typeof readFileOptions?.etag === 'string' && readFileOptions.etag !== ETAG_DISABLED) {
                await statPromise;
            }
            // read unbuffered
            if ((readFileOptions?.atomic && hasFileAtomicReadCapability(provider)) || // atomic reads are always unbuffered
                !(hasOpenReadWriteCloseCapability(provider) || hasFileReadStreamCapability(provider)) || // provider has no buffered capability
                (hasReadWriteCapability(provider) && readFileOptions?.preferUnbuffered) // unbuffered read is preferred
            ) {
                fileStream = this.readFileUnbuffered(provider, resource, readFileOptions);
            }
            // read streamed (always prefer over primitive buffered read)
            else if (hasFileReadStreamCapability(provider)) {
                fileStream = this.readFileStreamed(provider, resource, cancellableSource.token, readFileOptions);
            }
            // read buffered
            else {
                fileStream = this.readFileBuffered(provider, resource, cancellableSource.token, readFileOptions);
            }
            fileStream.on('end', () => cancellableSource.dispose());
            fileStream.on('error', () => cancellableSource.dispose());
            const fileStat = await statPromise;
            return {
                ...fileStat,
                value: fileStream
            };
        }
        catch (error) {
            // Await the stream to finish so that we exit this method
            // in a consistent state with file handles closed
            // (https://github.com/microsoft/vscode/issues/114024)
            if (fileStream) {
                await consumeStream(fileStream);
            }
            // Re-throw errors as file operation errors but preserve
            // specific errors (such as not modified since)
            throw this.restoreReadError(error, resource, readFileOptions);
        }
    }
    restoreReadError(error, resource, options) {
        const message = localize('err.read', "Unable to read file '{0}' ({1})", this.resourceForError(resource), ensureFileSystemProviderError(error).toString());
        if (error instanceof NotModifiedSinceFileOperationError) {
            return new NotModifiedSinceFileOperationError(message, error.stat, options);
        }
        if (error instanceof TooLargeFileOperationError) {
            return new TooLargeFileOperationError(message, error.fileOperationResult, error.size, error.options);
        }
        return new FileOperationError(message, toFileOperationResult(error), options);
    }
    readFileStreamed(provider, resource, token, options = Object.create(null)) {
        const fileStream = provider.readFileStream(resource, options, token);
        return transform(fileStream, {
            data: data => data instanceof VSBuffer ? data : VSBuffer.wrap(data),
            error: error => this.restoreReadError(error, resource, options)
        }, data => VSBuffer.concat(data));
    }
    readFileBuffered(provider, resource, token, options = Object.create(null)) {
        const stream = newWriteableBufferStream();
        readFileIntoStream(provider, resource, stream, data => data, {
            ...options,
            bufferSize: this.BUFFER_SIZE,
            errorTransformer: error => this.restoreReadError(error, resource, options)
        }, token);
        return stream;
    }
    readFileUnbuffered(provider, resource, options) {
        const stream = newWriteableStream(data => VSBuffer.concat(data));
        // Read the file into the stream async but do not wait for
        // this to complete because streams work via events
        (async () => {
            try {
                let buffer;
                if (options?.atomic && hasFileAtomicReadCapability(provider)) {
                    buffer = await provider.readFile(resource, { atomic: true });
                }
                else {
                    buffer = await provider.readFile(resource);
                }
                // respect position option
                if (typeof options?.position === 'number') {
                    buffer = buffer.slice(options.position);
                }
                // respect length option
                if (typeof options?.length === 'number') {
                    buffer = buffer.slice(0, options.length);
                }
                // Throw if file is too large to load
                this.validateReadFileLimits(resource, buffer.byteLength, options);
                // End stream with data
                stream.end(VSBuffer.wrap(buffer));
            }
            catch (err) {
                stream.error(err);
                stream.end();
            }
        })();
        return stream;
    }
    async validateReadFile(resource, options) {
        const stat = await this.resolve(resource, { resolveMetadata: true });
        // Throw if resource is a directory
        if (stat.isDirectory) {
            throw new FileOperationError(localize('fileIsDirectoryReadError', "Unable to read file '{0}' that is actually a directory", this.resourceForError(resource)), 0 /* FileOperationResult.FILE_IS_DIRECTORY */, options);
        }
        // Throw if file not modified since (unless disabled)
        if (typeof options?.etag === 'string' && options.etag !== ETAG_DISABLED && options.etag === stat.etag) {
            throw new NotModifiedSinceFileOperationError(localize('fileNotModifiedError', "File not modified since"), stat, options);
        }
        // Throw if file is too large to load
        this.validateReadFileLimits(resource, stat.size, options);
        return stat;
    }
    validateReadFileLimits(resource, size, options) {
        if (typeof options?.limits?.size === 'number' && size > options.limits.size) {
            throw new TooLargeFileOperationError(localize('fileTooLargeError', "Unable to read file '{0}' that is too large to open", this.resourceForError(resource)), 7 /* FileOperationResult.FILE_TOO_LARGE */, size, options);
        }
    }
    //#endregion
    //#region Move/Copy/Delete/Create Folder
    async canMove(source, target, overwrite) {
        return this.doCanMoveCopy(source, target, 'move', overwrite);
    }
    async canCopy(source, target, overwrite) {
        return this.doCanMoveCopy(source, target, 'copy', overwrite);
    }
    async doCanMoveCopy(source, target, mode, overwrite) {
        if (source.toString() !== target.toString()) {
            try {
                const sourceProvider = mode === 'move' ? this.throwIfFileSystemIsReadonly(await this.withWriteProvider(source), source) : await this.withReadProvider(source);
                const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
                await this.doValidateMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite);
            }
            catch (error) {
                return error;
            }
        }
        return true;
    }
    async move(source, target, overwrite) {
        const sourceProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(source), source);
        const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
        // move
        const mode = await this.doMoveCopy(sourceProvider, source, targetProvider, target, 'move', !!overwrite);
        // resolve and send events
        const fileStat = await this.resolve(target, { resolveMetadata: true });
        this._onDidRunOperation.fire(new FileOperationEvent(source, mode === 'move' ? 2 /* FileOperation.MOVE */ : 3 /* FileOperation.COPY */, fileStat));
        return fileStat;
    }
    async copy(source, target, overwrite) {
        const sourceProvider = await this.withReadProvider(source);
        const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
        // copy
        const mode = await this.doMoveCopy(sourceProvider, source, targetProvider, target, 'copy', !!overwrite);
        // resolve and send events
        const fileStat = await this.resolve(target, { resolveMetadata: true });
        this._onDidRunOperation.fire(new FileOperationEvent(source, mode === 'copy' ? 3 /* FileOperation.COPY */ : 2 /* FileOperation.MOVE */, fileStat));
        return fileStat;
    }
    async doMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite) {
        if (source.toString() === target.toString()) {
            return mode; // simulate node.js behaviour here and do a no-op if paths match
        }
        // validation
        const { exists, isSameResourceWithDifferentPathCase } = await this.doValidateMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite);
        // delete as needed (unless target is same resurce with different path case)
        if (exists && !isSameResourceWithDifferentPathCase && overwrite) {
            await this.del(target, { recursive: true });
        }
        // create parent folders
        await this.mkdirp(targetProvider, this.getExtUri(targetProvider).providerExtUri.dirname(target));
        // copy source => target
        if (mode === 'copy') {
            // same provider with fast copy: leverage copy() functionality
            if (sourceProvider === targetProvider && hasFileFolderCopyCapability(sourceProvider)) {
                await sourceProvider.copy(source, target, { overwrite });
            }
            // when copying via buffer/unbuffered, we have to manually
            // traverse the source if it is a folder and not a file
            else {
                const sourceFile = await this.resolve(source);
                if (sourceFile.isDirectory) {
                    await this.doCopyFolder(sourceProvider, sourceFile, targetProvider, target);
                }
                else {
                    await this.doCopyFile(sourceProvider, source, targetProvider, target);
                }
            }
            return mode;
        }
        // move source => target
        else {
            // same provider: leverage rename() functionality
            if (sourceProvider === targetProvider) {
                await sourceProvider.rename(source, target, { overwrite });
                return mode;
            }
            // across providers: copy to target & delete at source
            else {
                await this.doMoveCopy(sourceProvider, source, targetProvider, target, 'copy', overwrite);
                await this.del(source, { recursive: true });
                return 'copy';
            }
        }
    }
    async doCopyFile(sourceProvider, source, targetProvider, target) {
        // copy: source (buffered) => target (buffered)
        if (hasOpenReadWriteCloseCapability(sourceProvider) && hasOpenReadWriteCloseCapability(targetProvider)) {
            return this.doPipeBuffered(sourceProvider, source, targetProvider, target);
        }
        // copy: source (buffered) => target (unbuffered)
        if (hasOpenReadWriteCloseCapability(sourceProvider) && hasReadWriteCapability(targetProvider)) {
            return this.doPipeBufferedToUnbuffered(sourceProvider, source, targetProvider, target);
        }
        // copy: source (unbuffered) => target (buffered)
        if (hasReadWriteCapability(sourceProvider) && hasOpenReadWriteCloseCapability(targetProvider)) {
            return this.doPipeUnbufferedToBuffered(sourceProvider, source, targetProvider, target);
        }
        // copy: source (unbuffered) => target (unbuffered)
        if (hasReadWriteCapability(sourceProvider) && hasReadWriteCapability(targetProvider)) {
            return this.doPipeUnbuffered(sourceProvider, source, targetProvider, target);
        }
    }
    async doCopyFolder(sourceProvider, sourceFolder, targetProvider, targetFolder) {
        // create folder in target
        await targetProvider.mkdir(targetFolder);
        // create children in target
        if (Array.isArray(sourceFolder.children)) {
            await Promises.settled(sourceFolder.children.map(async (sourceChild) => {
                const targetChild = this.getExtUri(targetProvider).providerExtUri.joinPath(targetFolder, sourceChild.name);
                if (sourceChild.isDirectory) {
                    return this.doCopyFolder(sourceProvider, await this.resolve(sourceChild.resource), targetProvider, targetChild);
                }
                else {
                    return this.doCopyFile(sourceProvider, sourceChild.resource, targetProvider, targetChild);
                }
            }));
        }
    }
    async doValidateMoveCopy(sourceProvider, source, targetProvider, target, mode, overwrite) {
        let isSameResourceWithDifferentPathCase = false;
        // Check if source is equal or parent to target (requires providers to be the same)
        if (sourceProvider === targetProvider) {
            const { providerExtUri, isPathCaseSensitive } = this.getExtUri(sourceProvider);
            if (!isPathCaseSensitive) {
                isSameResourceWithDifferentPathCase = providerExtUri.isEqual(source, target);
            }
            if (isSameResourceWithDifferentPathCase && mode === 'copy') {
                throw new Error(localize('unableToMoveCopyError1', "Unable to copy when source '{0}' is same as target '{1}' with different path case on a case insensitive file system", this.resourceForError(source), this.resourceForError(target)));
            }
            if (!isSameResourceWithDifferentPathCase && providerExtUri.isEqualOrParent(target, source)) {
                throw new Error(localize('unableToMoveCopyError2', "Unable to move/copy when source '{0}' is parent of target '{1}'.", this.resourceForError(source), this.resourceForError(target)));
            }
        }
        // Extra checks if target exists and this is not a rename
        const exists = await this.exists(target);
        if (exists && !isSameResourceWithDifferentPathCase) {
            // Bail out if target exists and we are not about to overwrite
            if (!overwrite) {
                throw new FileOperationError(localize('unableToMoveCopyError3', "Unable to move/copy '{0}' because target '{1}' already exists at destination.", this.resourceForError(source), this.resourceForError(target)), 4 /* FileOperationResult.FILE_MOVE_CONFLICT */);
            }
            // Special case: if the target is a parent of the source, we cannot delete
            // it as it would delete the source as well. In this case we have to throw
            if (sourceProvider === targetProvider) {
                const { providerExtUri } = this.getExtUri(sourceProvider);
                if (providerExtUri.isEqualOrParent(source, target)) {
                    throw new Error(localize('unableToMoveCopyError4', "Unable to move/copy '{0}' into '{1}' since a file would replace the folder it is contained in.", this.resourceForError(source), this.resourceForError(target)));
                }
            }
        }
        return { exists, isSameResourceWithDifferentPathCase };
    }
    getExtUri(provider) {
        const isPathCaseSensitive = this.isPathCaseSensitive(provider);
        return {
            providerExtUri: isPathCaseSensitive ? extUri : extUriIgnorePathCase,
            isPathCaseSensitive
        };
    }
    isPathCaseSensitive(provider) {
        return !!(provider.capabilities & 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
    }
    async createFolder(resource) {
        const provider = this.throwIfFileSystemIsReadonly(await this.withProvider(resource), resource);
        // mkdir recursively
        await this.mkdirp(provider, resource);
        // events
        const fileStat = await this.resolve(resource, { resolveMetadata: true });
        this._onDidRunOperation.fire(new FileOperationEvent(resource, 0 /* FileOperation.CREATE */, fileStat));
        return fileStat;
    }
    async mkdirp(provider, directory) {
        const directoriesToCreate = [];
        // mkdir until we reach root
        const { providerExtUri } = this.getExtUri(provider);
        while (!providerExtUri.isEqual(directory, providerExtUri.dirname(directory))) {
            try {
                const stat = await provider.stat(directory);
                if ((stat.type & FileType.Directory) === 0) {
                    throw new Error(localize('mkdirExistsError', "Unable to create folder '{0}' that already exists but is not a directory", this.resourceForError(directory)));
                }
                break; // we have hit a directory that exists -> good
            }
            catch (error) {
                // Bubble up any other error that is not file not found
                if (toFileSystemProviderErrorCode(error) !== FileSystemProviderErrorCode.FileNotFound) {
                    throw error;
                }
                // Upon error, remember directories that need to be created
                directoriesToCreate.push(providerExtUri.basename(directory));
                // Continue up
                directory = providerExtUri.dirname(directory);
            }
        }
        // Create directories as needed
        for (let i = directoriesToCreate.length - 1; i >= 0; i--) {
            directory = providerExtUri.joinPath(directory, directoriesToCreate[i]);
            try {
                await provider.mkdir(directory);
            }
            catch (error) {
                if (toFileSystemProviderErrorCode(error) !== FileSystemProviderErrorCode.FileExists) {
                    // For mkdirp() we tolerate that the mkdir() call fails
                    // in case the folder already exists. This follows node.js
                    // own implementation of fs.mkdir({ recursive: true }) and
                    // reduces the chances of race conditions leading to errors
                    // if multiple calls try to create the same folders
                    // As such, we only throw an error here if it is other than
                    // the fact that the file already exists.
                    // (see also https://github.com/microsoft/vscode/issues/89834)
                    throw error;
                }
            }
        }
    }
    async canDelete(resource, options) {
        try {
            await this.doValidateDelete(resource, options);
        }
        catch (error) {
            return error;
        }
        return true;
    }
    async doValidateDelete(resource, options) {
        const provider = this.throwIfFileSystemIsReadonly(await this.withProvider(resource), resource);
        // Validate trash support
        const useTrash = !!options?.useTrash;
        if (useTrash && !(provider.capabilities & 4096 /* FileSystemProviderCapabilities.Trash */)) {
            throw new Error(localize('deleteFailedTrashUnsupported', "Unable to delete file '{0}' via trash because provider does not support it.", this.resourceForError(resource)));
        }
        // Validate atomic support
        const atomic = options?.atomic;
        if (atomic && !(provider.capabilities & 65536 /* FileSystemProviderCapabilities.FileAtomicDelete */)) {
            throw new Error(localize('deleteFailedAtomicUnsupported', "Unable to delete file '{0}' atomically because provider does not support it.", this.resourceForError(resource)));
        }
        if (useTrash && atomic) {
            throw new Error(localize('deleteFailedTrashAndAtomicUnsupported', "Unable to atomically delete file '{0}' because using trash is enabled.", this.resourceForError(resource)));
        }
        // Validate delete
        let stat = undefined;
        try {
            stat = await provider.stat(resource);
        }
        catch (error) {
            // Handled later
        }
        if (stat) {
            this.throwIfFileIsReadonly(resource, stat);
        }
        else {
            throw new FileOperationError(localize('deleteFailedNotFound', "Unable to delete nonexistent file '{0}'", this.resourceForError(resource)), 1 /* FileOperationResult.FILE_NOT_FOUND */);
        }
        // Validate recursive
        const recursive = !!options?.recursive;
        if (!recursive) {
            const stat = await this.resolve(resource);
            if (stat.isDirectory && Array.isArray(stat.children) && stat.children.length > 0) {
                throw new Error(localize('deleteFailedNonEmptyFolder', "Unable to delete non-empty folder '{0}'.", this.resourceForError(resource)));
            }
        }
        return provider;
    }
    async del(resource, options) {
        const provider = await this.doValidateDelete(resource, options);
        let deleteFileOptions = options;
        if (hasFileAtomicDeleteCapability(provider) && !deleteFileOptions?.atomic) {
            const enforcedAtomicDelete = provider.enforceAtomicDelete?.(resource);
            if (enforcedAtomicDelete) {
                deleteFileOptions = { ...options, atomic: enforcedAtomicDelete };
            }
        }
        const useTrash = !!deleteFileOptions?.useTrash;
        const recursive = !!deleteFileOptions?.recursive;
        const atomic = deleteFileOptions?.atomic ?? false;
        // Delete through provider
        await provider.delete(resource, { recursive, useTrash, atomic });
        // Events
        this._onDidRunOperation.fire(new FileOperationEvent(resource, 1 /* FileOperation.DELETE */));
    }
    //#endregion
    //#region Clone File
    async cloneFile(source, target) {
        const sourceProvider = await this.withProvider(source);
        const targetProvider = this.throwIfFileSystemIsReadonly(await this.withWriteProvider(target), target);
        if (sourceProvider === targetProvider && this.getExtUri(sourceProvider).providerExtUri.isEqual(source, target)) {
            return; // return early if paths are equal
        }
        // same provider, use `cloneFile` when native support is provided
        if (sourceProvider === targetProvider && hasFileCloneCapability(sourceProvider)) {
            return sourceProvider.cloneFile(source, target);
        }
        // otherwise, either providers are different or there is no native
        // `cloneFile` support, then we fallback to emulate a clone as best
        // as we can with the other primitives
        // create parent folders
        await this.mkdirp(targetProvider, this.getExtUri(targetProvider).providerExtUri.dirname(target));
        // leverage `copy` method if provided and providers are identical
        // queue on the source to ensure atomic read
        if (sourceProvider === targetProvider && hasFileFolderCopyCapability(sourceProvider)) {
            return this.writeQueue.queueFor(source, () => sourceProvider.copy(source, target, { overwrite: true }), this.getExtUri(sourceProvider).providerExtUri);
        }
        // otherwise copy via buffer/unbuffered and use a write queue
        // on the source to ensure atomic operation as much as possible
        return this.writeQueue.queueFor(source, () => this.doCopyFile(sourceProvider, source, targetProvider, target), this.getExtUri(sourceProvider).providerExtUri);
    }
    static { this.WATCHER_CORRELATION_IDS = 0; }
    createWatcher(resource, options) {
        return this.watch(resource, {
            ...options,
            // Explicitly set a correlation id so that file events that originate
            // from requests from extensions are exclusively routed back to the
            // extension host and not into the workbench.
            correlationId: FileService_1.WATCHER_CORRELATION_IDS++
        });
    }
    watch(resource, options = { recursive: false, excludes: [] }) {
        const disposables = new DisposableStore();
        // Forward watch request to provider and wire in disposables
        let watchDisposed = false;
        let disposeWatch = () => { watchDisposed = true; };
        disposables.add(toDisposable(() => disposeWatch()));
        // Watch and wire in disposable which is async but
        // check if we got disposed meanwhile and forward
        (async () => {
            try {
                const disposable = await this.doWatch(resource, options);
                if (watchDisposed) {
                    dispose(disposable);
                }
                else {
                    disposeWatch = () => dispose(disposable);
                }
            }
            catch (error) {
                this.logService.error(error);
            }
        })();
        // When a correlation identifier is set, return a specific
        // watcher that only emits events matching that correalation.
        const correlationId = options.correlationId;
        if (typeof correlationId === 'number') {
            const fileChangeEmitter = disposables.add(new Emitter());
            disposables.add(this.internalOnDidFilesChange.event(e => {
                if (e.correlates(correlationId)) {
                    fileChangeEmitter.fire(e);
                }
            }));
            const watcher = {
                onDidChange: fileChangeEmitter.event,
                dispose: () => disposables.dispose()
            };
            return watcher;
        }
        return disposables;
    }
    async doWatch(resource, options) {
        const provider = await this.withProvider(resource);
        // Deduplicate identical watch requests
        const watchHash = hash([this.getExtUri(provider).providerExtUri.getComparisonKey(resource), options]);
        let watcher = this.activeWatchers.get(watchHash);
        if (!watcher) {
            watcher = {
                count: 0,
                disposable: provider.watch(resource, options)
            };
            this.activeWatchers.set(watchHash, watcher);
        }
        // Increment usage counter
        watcher.count += 1;
        return toDisposable(() => {
            if (watcher) {
                // Unref
                watcher.count--;
                // Dispose only when last user is reached
                if (watcher.count === 0) {
                    dispose(watcher.disposable);
                    this.activeWatchers.delete(watchHash);
                }
            }
        });
    }
    dispose() {
        super.dispose();
        for (const [, watcher] of this.activeWatchers) {
            dispose(watcher.disposable);
        }
        this.activeWatchers.clear();
    }
    async doWriteBuffered(provider, resource, options, readableOrStreamOrBufferedStream) {
        return this.writeQueue.queueFor(resource, async () => {
            // open handle
            const handle = await provider.open(resource, { create: true, unlock: options?.unlock ?? false });
            // write into handle until all bytes from buffer have been written
            try {
                if (isReadableStream(readableOrStreamOrBufferedStream) || isReadableBufferedStream(readableOrStreamOrBufferedStream)) {
                    await this.doWriteStreamBufferedQueued(provider, handle, readableOrStreamOrBufferedStream);
                }
                else {
                    await this.doWriteReadableBufferedQueued(provider, handle, readableOrStreamOrBufferedStream);
                }
            }
            catch (error) {
                throw ensureFileSystemProviderError(error);
            }
            finally {
                // close handle always
                await provider.close(handle);
            }
        }, this.getExtUri(provider).providerExtUri);
    }
    async doWriteStreamBufferedQueued(provider, handle, streamOrBufferedStream) {
        let posInFile = 0;
        let stream;
        // Buffered stream: consume the buffer first by writing
        // it to the target before reading from the stream.
        if (isReadableBufferedStream(streamOrBufferedStream)) {
            if (streamOrBufferedStream.buffer.length > 0) {
                const chunk = VSBuffer.concat(streamOrBufferedStream.buffer);
                await this.doWriteBuffer(provider, handle, chunk, chunk.byteLength, posInFile, 0);
                posInFile += chunk.byteLength;
            }
            // If the stream has been consumed, return early
            if (streamOrBufferedStream.ended) {
                return;
            }
            stream = streamOrBufferedStream.stream;
        }
        // Unbuffered stream - just take as is
        else {
            stream = streamOrBufferedStream;
        }
        return new Promise((resolve, reject) => {
            listenStream(stream, {
                onData: async (chunk) => {
                    // pause stream to perform async write operation
                    stream.pause();
                    try {
                        await this.doWriteBuffer(provider, handle, chunk, chunk.byteLength, posInFile, 0);
                    }
                    catch (error) {
                        return reject(error);
                    }
                    posInFile += chunk.byteLength;
                    // resume stream now that we have successfully written
                    // run this on the next tick to prevent increasing the
                    // execution stack because resume() may call the event
                    // handler again before finishing.
                    setTimeout(() => stream.resume());
                },
                onError: error => reject(error),
                onEnd: () => resolve()
            });
        });
    }
    async doWriteReadableBufferedQueued(provider, handle, readable) {
        let posInFile = 0;
        let chunk;
        while ((chunk = readable.read()) !== null) {
            await this.doWriteBuffer(provider, handle, chunk, chunk.byteLength, posInFile, 0);
            posInFile += chunk.byteLength;
        }
    }
    async doWriteBuffer(provider, handle, buffer, length, posInFile, posInBuffer) {
        let totalBytesWritten = 0;
        while (totalBytesWritten < length) {
            // Write through the provider
            const bytesWritten = await provider.write(handle, posInFile + totalBytesWritten, buffer.buffer, posInBuffer + totalBytesWritten, length - totalBytesWritten);
            totalBytesWritten += bytesWritten;
        }
    }
    async doWriteUnbuffered(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream) {
        return this.writeQueue.queueFor(resource, () => this.doWriteUnbufferedQueued(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream), this.getExtUri(provider).providerExtUri);
    }
    async doWriteUnbufferedQueued(provider, resource, options, bufferOrReadableOrStreamOrBufferedStream) {
        let buffer;
        if (bufferOrReadableOrStreamOrBufferedStream instanceof VSBuffer) {
            buffer = bufferOrReadableOrStreamOrBufferedStream;
        }
        else if (isReadableStream(bufferOrReadableOrStreamOrBufferedStream)) {
            buffer = await streamToBuffer(bufferOrReadableOrStreamOrBufferedStream);
        }
        else if (isReadableBufferedStream(bufferOrReadableOrStreamOrBufferedStream)) {
            buffer = await bufferedStreamToBuffer(bufferOrReadableOrStreamOrBufferedStream);
        }
        else {
            buffer = readableToBuffer(bufferOrReadableOrStreamOrBufferedStream);
        }
        // Write through the provider
        await provider.writeFile(resource, buffer.buffer, { create: true, overwrite: true, unlock: options?.unlock ?? false, atomic: options?.atomic ?? false });
    }
    async doPipeBuffered(sourceProvider, source, targetProvider, target) {
        return this.writeQueue.queueFor(target, () => this.doPipeBufferedQueued(sourceProvider, source, targetProvider, target), this.getExtUri(targetProvider).providerExtUri);
    }
    async doPipeBufferedQueued(sourceProvider, source, targetProvider, target) {
        let sourceHandle = undefined;
        let targetHandle = undefined;
        try {
            // Open handles
            sourceHandle = await sourceProvider.open(source, { create: false });
            targetHandle = await targetProvider.open(target, { create: true, unlock: false });
            const buffer = VSBuffer.alloc(this.BUFFER_SIZE);
            let posInFile = 0;
            let posInBuffer = 0;
            let bytesRead = 0;
            do {
                // read from source (sourceHandle) at current position (posInFile) into buffer (buffer) at
                // buffer position (posInBuffer) up to the size of the buffer (buffer.byteLength).
                bytesRead = await sourceProvider.read(sourceHandle, posInFile, buffer.buffer, posInBuffer, buffer.byteLength - posInBuffer);
                // write into target (targetHandle) at current position (posInFile) from buffer (buffer) at
                // buffer position (posInBuffer) all bytes we read (bytesRead).
                await this.doWriteBuffer(targetProvider, targetHandle, buffer, bytesRead, posInFile, posInBuffer);
                posInFile += bytesRead;
                posInBuffer += bytesRead;
                // when buffer full, fill it again from the beginning
                if (posInBuffer === buffer.byteLength) {
                    posInBuffer = 0;
                }
            } while (bytesRead > 0);
        }
        catch (error) {
            throw ensureFileSystemProviderError(error);
        }
        finally {
            await Promises.settled([
                typeof sourceHandle === 'number' ? sourceProvider.close(sourceHandle) : Promise.resolve(),
                typeof targetHandle === 'number' ? targetProvider.close(targetHandle) : Promise.resolve(),
            ]);
        }
    }
    async doPipeUnbuffered(sourceProvider, source, targetProvider, target) {
        return this.writeQueue.queueFor(target, () => this.doPipeUnbufferedQueued(sourceProvider, source, targetProvider, target), this.getExtUri(targetProvider).providerExtUri);
    }
    async doPipeUnbufferedQueued(sourceProvider, source, targetProvider, target) {
        return targetProvider.writeFile(target, await sourceProvider.readFile(source), { create: true, overwrite: true, unlock: false, atomic: false });
    }
    async doPipeUnbufferedToBuffered(sourceProvider, source, targetProvider, target) {
        return this.writeQueue.queueFor(target, () => this.doPipeUnbufferedToBufferedQueued(sourceProvider, source, targetProvider, target), this.getExtUri(targetProvider).providerExtUri);
    }
    async doPipeUnbufferedToBufferedQueued(sourceProvider, source, targetProvider, target) {
        // Open handle
        const targetHandle = await targetProvider.open(target, { create: true, unlock: false });
        // Read entire buffer from source and write buffered
        try {
            const buffer = await sourceProvider.readFile(source);
            await this.doWriteBuffer(targetProvider, targetHandle, VSBuffer.wrap(buffer), buffer.byteLength, 0, 0);
        }
        catch (error) {
            throw ensureFileSystemProviderError(error);
        }
        finally {
            await targetProvider.close(targetHandle);
        }
    }
    async doPipeBufferedToUnbuffered(sourceProvider, source, targetProvider, target) {
        // Read buffer via stream buffered
        const buffer = await streamToBuffer(this.readFileBuffered(sourceProvider, source, CancellationToken.None));
        // Write buffer into target at once
        await this.doWriteUnbuffered(targetProvider, target, undefined, buffer);
    }
    throwIfFileSystemIsReadonly(provider, resource) {
        if (provider.capabilities & 2048 /* FileSystemProviderCapabilities.Readonly */) {
            throw new FileOperationError(localize('err.readonly', "Unable to modify read-only file '{0}'", this.resourceForError(resource)), 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
        }
        return provider;
    }
    throwIfFileIsReadonly(resource, stat) {
        if ((stat.permissions ?? 0) & FilePermission.Readonly) {
            throw new FileOperationError(localize('err.readonly', "Unable to modify read-only file '{0}'", this.resourceForError(resource)), 6 /* FileOperationResult.FILE_PERMISSION_DENIED */);
        }
    }
    resourceForError(resource) {
        if (resource.scheme === Schemas.file) {
            return resource.fsPath;
        }
        return resource.toString(true);
    }
};
FileService = FileService_1 = __decorate([
    __param(0, ILogService),
    __metadata("design:paramtypes", [Object])
], FileService);
export { FileService };
