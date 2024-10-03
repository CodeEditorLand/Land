import { TernarySearchTree } from '../../../base/common/ternarySearchTree.js';
import { sep } from '../../../base/common/path.js';
import { startsWithIgnoreCase } from '../../../base/common/strings.js';
import { isNumber } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { localize } from '../../../nls.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { isWeb } from '../../../base/common/platform.js';
import { Schemas } from '../../../base/common/network.js';
import { Lazy } from '../../../base/common/lazy.js';
export const IFileService = createDecorator('fileService');
export function isFileOpenForWriteOptions(options) {
    return options.create === true;
}
export var FileType;
(function (FileType) {
    FileType[FileType["Unknown"] = 0] = "Unknown";
    FileType[FileType["File"] = 1] = "File";
    FileType[FileType["Directory"] = 2] = "Directory";
    FileType[FileType["SymbolicLink"] = 64] = "SymbolicLink";
})(FileType || (FileType = {}));
export var FilePermission;
(function (FilePermission) {
    FilePermission[FilePermission["Readonly"] = 1] = "Readonly";
    FilePermission[FilePermission["Locked"] = 2] = "Locked";
})(FilePermission || (FilePermission = {}));
export function isFileSystemWatcher(thing) {
    const candidate = thing;
    return !!candidate && typeof candidate.onDidChange === 'function';
}
export function hasReadWriteCapability(provider) {
    return !!(provider.capabilities & 2);
}
export function hasFileFolderCopyCapability(provider) {
    return !!(provider.capabilities & 8);
}
export function hasFileCloneCapability(provider) {
    return !!(provider.capabilities & 131072);
}
export function hasOpenReadWriteCloseCapability(provider) {
    return !!(provider.capabilities & 4);
}
export function hasFileReadStreamCapability(provider) {
    return !!(provider.capabilities & 16);
}
export function hasFileAtomicReadCapability(provider) {
    if (!hasReadWriteCapability(provider)) {
        return false;
    }
    return !!(provider.capabilities & 16384);
}
export function hasFileAtomicWriteCapability(provider) {
    if (!hasReadWriteCapability(provider)) {
        return false;
    }
    return !!(provider.capabilities & 32768);
}
export function hasFileAtomicDeleteCapability(provider) {
    return !!(provider.capabilities & 65536);
}
export function hasReadonlyCapability(provider) {
    return !!(provider.capabilities & 2048);
}
export var FileSystemProviderErrorCode;
(function (FileSystemProviderErrorCode) {
    FileSystemProviderErrorCode["FileExists"] = "EntryExists";
    FileSystemProviderErrorCode["FileNotFound"] = "EntryNotFound";
    FileSystemProviderErrorCode["FileNotADirectory"] = "EntryNotADirectory";
    FileSystemProviderErrorCode["FileIsADirectory"] = "EntryIsADirectory";
    FileSystemProviderErrorCode["FileExceedsStorageQuota"] = "EntryExceedsStorageQuota";
    FileSystemProviderErrorCode["FileTooLarge"] = "EntryTooLarge";
    FileSystemProviderErrorCode["FileWriteLocked"] = "EntryWriteLocked";
    FileSystemProviderErrorCode["NoPermissions"] = "NoPermissions";
    FileSystemProviderErrorCode["Unavailable"] = "Unavailable";
    FileSystemProviderErrorCode["Unknown"] = "Unknown";
})(FileSystemProviderErrorCode || (FileSystemProviderErrorCode = {}));
export class FileSystemProviderError extends Error {
    static create(error, code) {
        const providerError = new FileSystemProviderError(error.toString(), code);
        markAsFileSystemProviderError(providerError, code);
        return providerError;
    }
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
export function createFileSystemProviderError(error, code) {
    return FileSystemProviderError.create(error, code);
}
export function ensureFileSystemProviderError(error) {
    if (!error) {
        return createFileSystemProviderError(localize('unknownError', "Unknown Error"), FileSystemProviderErrorCode.Unknown);
    }
    return error;
}
export function markAsFileSystemProviderError(error, code) {
    error.name = code ? `${code} (FileSystemError)` : `FileSystemError`;
    return error;
}
export function toFileSystemProviderErrorCode(error) {
    if (!error) {
        return FileSystemProviderErrorCode.Unknown;
    }
    if (error instanceof FileSystemProviderError) {
        return error.code;
    }
    const match = /^(.+) \(FileSystemError\)$/.exec(error.name);
    if (!match) {
        return FileSystemProviderErrorCode.Unknown;
    }
    switch (match[1]) {
        case FileSystemProviderErrorCode.FileExists: return FileSystemProviderErrorCode.FileExists;
        case FileSystemProviderErrorCode.FileIsADirectory: return FileSystemProviderErrorCode.FileIsADirectory;
        case FileSystemProviderErrorCode.FileNotADirectory: return FileSystemProviderErrorCode.FileNotADirectory;
        case FileSystemProviderErrorCode.FileNotFound: return FileSystemProviderErrorCode.FileNotFound;
        case FileSystemProviderErrorCode.FileTooLarge: return FileSystemProviderErrorCode.FileTooLarge;
        case FileSystemProviderErrorCode.FileWriteLocked: return FileSystemProviderErrorCode.FileWriteLocked;
        case FileSystemProviderErrorCode.NoPermissions: return FileSystemProviderErrorCode.NoPermissions;
        case FileSystemProviderErrorCode.Unavailable: return FileSystemProviderErrorCode.Unavailable;
    }
    return FileSystemProviderErrorCode.Unknown;
}
export function toFileOperationResult(error) {
    if (error instanceof FileOperationError) {
        return error.fileOperationResult;
    }
    switch (toFileSystemProviderErrorCode(error)) {
        case FileSystemProviderErrorCode.FileNotFound:
            return 1;
        case FileSystemProviderErrorCode.FileIsADirectory:
            return 0;
        case FileSystemProviderErrorCode.FileNotADirectory:
            return 9;
        case FileSystemProviderErrorCode.FileWriteLocked:
            return 5;
        case FileSystemProviderErrorCode.NoPermissions:
            return 6;
        case FileSystemProviderErrorCode.FileExists:
            return 4;
        case FileSystemProviderErrorCode.FileTooLarge:
            return 7;
        default:
            return 10;
    }
}
export class FileOperationEvent {
    constructor(resource, operation, target) {
        this.resource = resource;
        this.operation = operation;
        this.target = target;
    }
    isOperation(operation) {
        return this.operation === operation;
    }
}
export class FileChangesEvent {
    static { this.MIXED_CORRELATION = null; }
    constructor(changes, ignorePathCasing) {
        this.ignorePathCasing = ignorePathCasing;
        this.correlationId = undefined;
        this.added = new Lazy(() => {
            const added = TernarySearchTree.forUris(() => this.ignorePathCasing);
            added.fill(this.rawAdded.map(resource => [resource, true]));
            return added;
        });
        this.updated = new Lazy(() => {
            const updated = TernarySearchTree.forUris(() => this.ignorePathCasing);
            updated.fill(this.rawUpdated.map(resource => [resource, true]));
            return updated;
        });
        this.deleted = new Lazy(() => {
            const deleted = TernarySearchTree.forUris(() => this.ignorePathCasing);
            deleted.fill(this.rawDeleted.map(resource => [resource, true]));
            return deleted;
        });
        this.rawAdded = [];
        this.rawUpdated = [];
        this.rawDeleted = [];
        for (const change of changes) {
            switch (change.type) {
                case 1:
                    this.rawAdded.push(change.resource);
                    break;
                case 0:
                    this.rawUpdated.push(change.resource);
                    break;
                case 2:
                    this.rawDeleted.push(change.resource);
                    break;
            }
            if (this.correlationId !== FileChangesEvent.MIXED_CORRELATION) {
                if (typeof change.cId === 'number') {
                    if (this.correlationId === undefined) {
                        this.correlationId = change.cId;
                    }
                    else if (this.correlationId !== change.cId) {
                        this.correlationId = FileChangesEvent.MIXED_CORRELATION;
                    }
                }
                else {
                    if (this.correlationId !== undefined) {
                        this.correlationId = FileChangesEvent.MIXED_CORRELATION;
                    }
                }
            }
        }
    }
    contains(resource, ...types) {
        return this.doContains(resource, { includeChildren: false }, ...types);
    }
    affects(resource, ...types) {
        return this.doContains(resource, { includeChildren: true }, ...types);
    }
    doContains(resource, options, ...types) {
        if (!resource) {
            return false;
        }
        const hasTypesFilter = types.length > 0;
        if (!hasTypesFilter || types.includes(1)) {
            if (this.added.value.get(resource)) {
                return true;
            }
            if (options.includeChildren && this.added.value.findSuperstr(resource)) {
                return true;
            }
        }
        if (!hasTypesFilter || types.includes(0)) {
            if (this.updated.value.get(resource)) {
                return true;
            }
            if (options.includeChildren && this.updated.value.findSuperstr(resource)) {
                return true;
            }
        }
        if (!hasTypesFilter || types.includes(2)) {
            if (this.deleted.value.findSubstr(resource)) {
                return true;
            }
            if (options.includeChildren && this.deleted.value.findSuperstr(resource)) {
                return true;
            }
        }
        return false;
    }
    gotAdded() {
        return this.rawAdded.length > 0;
    }
    gotDeleted() {
        return this.rawDeleted.length > 0;
    }
    gotUpdated() {
        return this.rawUpdated.length > 0;
    }
    correlates(correlationId) {
        return this.correlationId === correlationId;
    }
    hasCorrelation() {
        return typeof this.correlationId === 'number';
    }
}
export function isParent(path, candidate, ignoreCase) {
    if (!path || !candidate || path === candidate) {
        return false;
    }
    if (candidate.length > path.length) {
        return false;
    }
    if (candidate.charAt(candidate.length - 1) !== sep) {
        candidate += sep;
    }
    if (ignoreCase) {
        return startsWithIgnoreCase(path, candidate);
    }
    return path.indexOf(candidate) === 0;
}
export class FileOperationError extends Error {
    constructor(message, fileOperationResult, options) {
        super(message);
        this.fileOperationResult = fileOperationResult;
        this.options = options;
    }
}
export class TooLargeFileOperationError extends FileOperationError {
    constructor(message, fileOperationResult, size, options) {
        super(message, fileOperationResult, options);
        this.fileOperationResult = fileOperationResult;
        this.size = size;
    }
}
export class NotModifiedSinceFileOperationError extends FileOperationError {
    constructor(message, stat, options) {
        super(message, 2, options);
        this.stat = stat;
    }
}
export const AutoSaveConfiguration = {
    OFF: 'off',
    AFTER_DELAY: 'afterDelay',
    ON_FOCUS_CHANGE: 'onFocusChange',
    ON_WINDOW_CHANGE: 'onWindowChange'
};
export const HotExitConfiguration = {
    OFF: 'off',
    ON_EXIT: 'onExit',
    ON_EXIT_AND_WINDOW_CLOSE: 'onExitAndWindowClose'
};
export const FILES_ASSOCIATIONS_CONFIG = 'files.associations';
export const FILES_EXCLUDE_CONFIG = 'files.exclude';
export const FILES_READONLY_INCLUDE_CONFIG = 'files.readonlyInclude';
export const FILES_READONLY_EXCLUDE_CONFIG = 'files.readonlyExclude';
export const FILES_READONLY_FROM_PERMISSIONS_CONFIG = 'files.readonlyFromPermissions';
export var FileKind;
(function (FileKind) {
    FileKind[FileKind["FILE"] = 0] = "FILE";
    FileKind[FileKind["FOLDER"] = 1] = "FOLDER";
    FileKind[FileKind["ROOT_FOLDER"] = 2] = "ROOT_FOLDER";
})(FileKind || (FileKind = {}));
export const ETAG_DISABLED = '';
export function etag(stat) {
    if (typeof stat.size !== 'number' || typeof stat.mtime !== 'number') {
        return undefined;
    }
    return stat.mtime.toString(29) + stat.size.toString(31);
}
export async function whenProviderRegistered(file, fileService) {
    if (fileService.hasProvider(URI.from({ scheme: file.scheme }))) {
        return;
    }
    return new Promise(resolve => {
        const disposable = fileService.onDidChangeFileSystemProviderRegistrations(e => {
            if (e.scheme === file.scheme && e.added) {
                disposable.dispose();
                resolve();
            }
        });
    });
}
export class ByteSize {
    static { this.KB = 1024; }
    static { this.MB = ByteSize.KB * ByteSize.KB; }
    static { this.GB = ByteSize.MB * ByteSize.KB; }
    static { this.TB = ByteSize.GB * ByteSize.KB; }
    static formatSize(size) {
        if (!isNumber(size)) {
            size = 0;
        }
        if (size < ByteSize.KB) {
            return localize('sizeB', "{0}B", size.toFixed(0));
        }
        if (size < ByteSize.MB) {
            return localize('sizeKB', "{0}KB", (size / ByteSize.KB).toFixed(2));
        }
        if (size < ByteSize.GB) {
            return localize('sizeMB', "{0}MB", (size / ByteSize.MB).toFixed(2));
        }
        if (size < ByteSize.TB) {
            return localize('sizeGB', "{0}GB", (size / ByteSize.GB).toFixed(2));
        }
        return localize('sizeTB', "{0}TB", (size / ByteSize.TB).toFixed(2));
    }
}
export function getLargeFileConfirmationLimit(arg) {
    const isRemote = typeof arg === 'string' || arg?.scheme === Schemas.vscodeRemote;
    const isLocal = typeof arg !== 'string' && arg?.scheme === Schemas.file;
    if (isLocal) {
        return 1024 * ByteSize.MB;
    }
    if (isRemote) {
        return 10 * ByteSize.MB;
    }
    if (isWeb) {
        return 50 * ByteSize.MB;
    }
    return 1024 * ByteSize.MB;
}
