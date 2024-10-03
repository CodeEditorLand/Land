import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from '../../../base/common/buffer.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { IExpression, IRelativePattern } from '../../../base/common/glob.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { ReadableStreamEvents } from '../../../base/common/stream.js';
import { URI } from '../../../base/common/uri.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
export declare const IFileService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IFileService>;
export interface IFileService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeFileSystemProviderRegistrations: Event<IFileSystemProviderRegistrationEvent>;
    readonly onDidChangeFileSystemProviderCapabilities: Event<IFileSystemProviderCapabilitiesChangeEvent>;
    readonly onWillActivateFileSystemProvider: Event<IFileSystemProviderActivationEvent>;
    registerProvider(scheme: string, provider: IFileSystemProvider): IDisposable;
    getProvider(scheme: string): IFileSystemProvider | undefined;
    activateProvider(scheme: string): Promise<void>;
    canHandleResource(resource: URI): Promise<boolean>;
    hasProvider(resource: URI): boolean;
    hasCapability(resource: URI, capability: FileSystemProviderCapabilities): boolean;
    listCapabilities(): Iterable<{
        scheme: string;
        capabilities: FileSystemProviderCapabilities;
    }>;
    readonly onDidFilesChange: Event<FileChangesEvent>;
    readonly onDidRunOperation: Event<FileOperationEvent>;
    resolve(resource: URI, options: IResolveMetadataFileOptions): Promise<IFileStatWithMetadata>;
    resolve(resource: URI, options?: IResolveFileOptions): Promise<IFileStat>;
    resolveAll(toResolve: {
        resource: URI;
        options: IResolveMetadataFileOptions;
    }[]): Promise<IFileStatResult[]>;
    resolveAll(toResolve: {
        resource: URI;
        options?: IResolveFileOptions;
    }[]): Promise<IFileStatResult[]>;
    stat(resource: URI): Promise<IFileStatWithPartialMetadata>;
    exists(resource: URI): Promise<boolean>;
    readFile(resource: URI, options?: IReadFileOptions, token?: CancellationToken): Promise<IFileContent>;
    readFileStream(resource: URI, options?: IReadFileStreamOptions, token?: CancellationToken): Promise<IFileStreamContent>;
    writeFile(resource: URI, bufferOrReadableOrStream: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
    move(source: URI, target: URI, overwrite?: boolean): Promise<IFileStatWithMetadata>;
    canMove(source: URI, target: URI, overwrite?: boolean): Promise<Error | true>;
    copy(source: URI, target: URI, overwrite?: boolean): Promise<IFileStatWithMetadata>;
    canCopy(source: URI, target: URI, overwrite?: boolean): Promise<Error | true>;
    cloneFile(source: URI, target: URI): Promise<void>;
    createFile(resource: URI, bufferOrReadableOrStream?: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: ICreateFileOptions): Promise<IFileStatWithMetadata>;
    canCreateFile(resource: URI, options?: ICreateFileOptions): Promise<Error | true>;
    createFolder(resource: URI): Promise<IFileStatWithMetadata>;
    del(resource: URI, options?: Partial<IFileDeleteOptions>): Promise<void>;
    canDelete(resource: URI, options?: Partial<IFileDeleteOptions>): Promise<Error | true>;
    readonly onDidWatchError: Event<Error>;
    createWatcher(resource: URI, options: IWatchOptionsWithoutCorrelation): IFileSystemWatcher;
    watch(resource: URI, options?: IWatchOptionsWithoutCorrelation): IDisposable;
    dispose(): void;
}
export interface IFileOverwriteOptions {
    readonly overwrite: boolean;
}
export interface IFileUnlockOptions {
    readonly unlock: boolean;
}
export interface IFileAtomicReadOptions {
    readonly atomic: boolean;
}
export interface IFileAtomicOptions {
    readonly postfix: string;
}
export interface IFileAtomicWriteOptions {
    readonly atomic: IFileAtomicOptions | false;
}
export interface IFileAtomicDeleteOptions {
    readonly atomic: IFileAtomicOptions | false;
}
export interface IFileReadLimits {
    size?: number;
}
export interface IFileReadStreamOptions {
    readonly position?: number;
    readonly length?: number;
    readonly limits?: IFileReadLimits;
}
export interface IFileWriteOptions extends IFileOverwriteOptions, IFileUnlockOptions, IFileAtomicWriteOptions {
    readonly create: boolean;
}
export type IFileOpenOptions = IFileOpenForReadOptions | IFileOpenForWriteOptions;
export declare function isFileOpenForWriteOptions(options: IFileOpenOptions): options is IFileOpenForWriteOptions;
export interface IFileOpenForReadOptions {
    readonly create: false;
}
export interface IFileOpenForWriteOptions extends IFileUnlockOptions {
    readonly create: true;
}
export interface IFileDeleteOptions {
    readonly recursive: boolean;
    readonly useTrash: boolean;
    readonly atomic: IFileAtomicOptions | false;
}
export declare enum FileType {
    Unknown = 0,
    File = 1,
    Directory = 2,
    SymbolicLink = 64
}
export declare enum FilePermission {
    Readonly = 1,
    Locked = 2
}
export interface IStat {
    readonly type: FileType;
    readonly mtime: number;
    readonly ctime: number;
    readonly size: number;
    readonly permissions?: FilePermission;
}
export interface IWatchOptionsWithoutCorrelation {
    recursive: boolean;
    excludes: string[];
    includes?: Array<string | IRelativePattern>;
    filter?: FileChangeFilter;
}
export interface IWatchOptions extends IWatchOptionsWithoutCorrelation {
    readonly correlationId?: number;
}
export declare const enum FileChangeFilter {
    UPDATED = 2,
    ADDED = 4,
    DELETED = 8
}
export interface IWatchOptionsWithCorrelation extends IWatchOptions {
    readonly correlationId: number;
}
export interface IFileSystemWatcher extends IDisposable {
    readonly onDidChange: Event<FileChangesEvent>;
}
export declare function isFileSystemWatcher(thing: unknown): thing is IFileSystemWatcher;
export declare const enum FileSystemProviderCapabilities {
    None = 0,
    FileReadWrite = 2,
    FileOpenReadWriteClose = 4,
    FileReadStream = 16,
    FileFolderCopy = 8,
    PathCaseSensitive = 1024,
    Readonly = 2048,
    Trash = 4096,
    FileWriteUnlock = 8192,
    FileAtomicRead = 16384,
    FileAtomicWrite = 32768,
    FileAtomicDelete = 65536,
    FileClone = 131072
}
export interface IFileSystemProvider {
    readonly capabilities: FileSystemProviderCapabilities;
    readonly onDidChangeCapabilities: Event<void>;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    readonly onDidWatchError?: Event<string>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    stat(resource: URI): Promise<IStat>;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    copy?(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    readFile?(resource: URI): Promise<Uint8Array>;
    writeFile?(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    readFileStream?(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
    open?(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close?(fd: number): Promise<void>;
    read?(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write?(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    cloneFile?(from: URI, to: URI): Promise<void>;
}
export interface IFileSystemProviderWithFileReadWriteCapability extends IFileSystemProvider {
    readFile(resource: URI): Promise<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
}
export declare function hasReadWriteCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileReadWriteCapability;
export interface IFileSystemProviderWithFileFolderCopyCapability extends IFileSystemProvider {
    copy(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
}
export declare function hasFileFolderCopyCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileFolderCopyCapability;
export interface IFileSystemProviderWithFileCloneCapability extends IFileSystemProvider {
    cloneFile(from: URI, to: URI): Promise<void>;
}
export declare function hasFileCloneCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileCloneCapability;
export interface IFileSystemProviderWithOpenReadWriteCloseCapability extends IFileSystemProvider {
    open(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
}
export declare function hasOpenReadWriteCloseCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithOpenReadWriteCloseCapability;
export interface IFileSystemProviderWithFileReadStreamCapability extends IFileSystemProvider {
    readFileStream(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
}
export declare function hasFileReadStreamCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileReadStreamCapability;
export interface IFileSystemProviderWithFileAtomicReadCapability extends IFileSystemProvider {
    readFile(resource: URI, opts?: IFileAtomicReadOptions): Promise<Uint8Array>;
    enforceAtomicReadFile?(resource: URI): boolean;
}
export declare function hasFileAtomicReadCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileAtomicReadCapability;
export interface IFileSystemProviderWithFileAtomicWriteCapability extends IFileSystemProvider {
    writeFile(resource: URI, contents: Uint8Array, opts?: IFileAtomicWriteOptions): Promise<void>;
    enforceAtomicWriteFile?(resource: URI): IFileAtomicOptions | false;
}
export declare function hasFileAtomicWriteCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileAtomicWriteCapability;
export interface IFileSystemProviderWithFileAtomicDeleteCapability extends IFileSystemProvider {
    delete(resource: URI, opts: IFileAtomicDeleteOptions): Promise<void>;
    enforceAtomicDelete?(resource: URI): IFileAtomicOptions | false;
}
export declare function hasFileAtomicDeleteCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithFileAtomicDeleteCapability;
export interface IFileSystemProviderWithReadonlyCapability extends IFileSystemProvider {
    readonly capabilities: FileSystemProviderCapabilities.Readonly & FileSystemProviderCapabilities;
    readonly readOnlyMessage?: IMarkdownString;
}
export declare function hasReadonlyCapability(provider: IFileSystemProvider): provider is IFileSystemProviderWithReadonlyCapability;
export declare enum FileSystemProviderErrorCode {
    FileExists = "EntryExists",
    FileNotFound = "EntryNotFound",
    FileNotADirectory = "EntryNotADirectory",
    FileIsADirectory = "EntryIsADirectory",
    FileExceedsStorageQuota = "EntryExceedsStorageQuota",
    FileTooLarge = "EntryTooLarge",
    FileWriteLocked = "EntryWriteLocked",
    NoPermissions = "NoPermissions",
    Unavailable = "Unavailable",
    Unknown = "Unknown"
}
export interface IFileSystemProviderError extends Error {
    readonly name: string;
    readonly code: FileSystemProviderErrorCode;
}
export declare class FileSystemProviderError extends Error implements IFileSystemProviderError {
    readonly code: FileSystemProviderErrorCode;
    static create(error: Error | string, code: FileSystemProviderErrorCode): FileSystemProviderError;
    private constructor();
}
export declare function createFileSystemProviderError(error: Error | string, code: FileSystemProviderErrorCode): FileSystemProviderError;
export declare function ensureFileSystemProviderError(error?: Error): Error;
export declare function markAsFileSystemProviderError(error: Error, code: FileSystemProviderErrorCode): Error;
export declare function toFileSystemProviderErrorCode(error: Error | undefined | null): FileSystemProviderErrorCode;
export declare function toFileOperationResult(error: Error): FileOperationResult;
export interface IFileSystemProviderRegistrationEvent {
    readonly added: boolean;
    readonly scheme: string;
    readonly provider?: IFileSystemProvider;
}
export interface IFileSystemProviderCapabilitiesChangeEvent {
    readonly provider: IFileSystemProvider;
    readonly scheme: string;
}
export interface IFileSystemProviderActivationEvent {
    readonly scheme: string;
    join(promise: Promise<void>): void;
}
export declare const enum FileOperation {
    CREATE = 0,
    DELETE = 1,
    MOVE = 2,
    COPY = 3,
    WRITE = 4
}
export interface IFileOperationEvent {
    readonly resource: URI;
    readonly operation: FileOperation;
    isOperation(operation: FileOperation.DELETE | FileOperation.WRITE): boolean;
    isOperation(operation: FileOperation.CREATE | FileOperation.MOVE | FileOperation.COPY): this is IFileOperationEventWithMetadata;
}
export interface IFileOperationEventWithMetadata extends IFileOperationEvent {
    readonly target: IFileStatWithMetadata;
}
export declare class FileOperationEvent implements IFileOperationEvent {
    readonly resource: URI;
    readonly operation: FileOperation;
    readonly target?: IFileStatWithMetadata | undefined;
    constructor(resource: URI, operation: FileOperation.DELETE | FileOperation.WRITE);
    constructor(resource: URI, operation: FileOperation.CREATE | FileOperation.MOVE | FileOperation.COPY, target: IFileStatWithMetadata);
    isOperation(operation: FileOperation.DELETE | FileOperation.WRITE): boolean;
    isOperation(operation: FileOperation.CREATE | FileOperation.MOVE | FileOperation.COPY): this is IFileOperationEventWithMetadata;
}
export declare const enum FileChangeType {
    UPDATED = 0,
    ADDED = 1,
    DELETED = 2
}
export interface IFileChange {
    type: FileChangeType;
    readonly resource: URI;
    readonly cId?: number;
}
export declare class FileChangesEvent {
    private readonly ignorePathCasing;
    private static readonly MIXED_CORRELATION;
    private readonly correlationId;
    constructor(changes: readonly IFileChange[], ignorePathCasing: boolean);
    private readonly added;
    private readonly updated;
    private readonly deleted;
    contains(resource: URI, ...types: FileChangeType[]): boolean;
    affects(resource: URI, ...types: FileChangeType[]): boolean;
    private doContains;
    gotAdded(): boolean;
    gotDeleted(): boolean;
    gotUpdated(): boolean;
    correlates(correlationId: number): boolean;
    hasCorrelation(): boolean;
    readonly rawAdded: URI[];
    readonly rawUpdated: URI[];
    readonly rawDeleted: URI[];
}
export declare function isParent(path: string, candidate: string, ignoreCase?: boolean): boolean;
export interface IBaseFileStat {
    readonly resource: URI;
    readonly name: string;
    readonly size?: number;
    readonly mtime?: number;
    readonly ctime?: number;
    readonly etag?: string;
    readonly readonly?: boolean;
    readonly locked?: boolean;
}
export interface IBaseFileStatWithMetadata extends Required<IBaseFileStat> {
}
export interface IFileStat extends IBaseFileStat {
    readonly isFile: boolean;
    readonly isDirectory: boolean;
    readonly isSymbolicLink: boolean;
    children: IFileStat[] | undefined;
}
export interface IFileStatWithMetadata extends IFileStat, IBaseFileStatWithMetadata {
    readonly mtime: number;
    readonly ctime: number;
    readonly etag: string;
    readonly size: number;
    readonly readonly: boolean;
    readonly locked: boolean;
    readonly children: IFileStatWithMetadata[] | undefined;
}
export interface IFileStatResult {
    readonly stat?: IFileStat;
    readonly success: boolean;
}
export interface IFileStatResultWithMetadata extends IFileStatResult {
    readonly stat?: IFileStatWithMetadata;
}
export interface IFileStatWithPartialMetadata extends Omit<IFileStatWithMetadata, 'children'> {
}
export interface IFileContent extends IBaseFileStatWithMetadata {
    readonly value: VSBuffer;
}
export interface IFileStreamContent extends IBaseFileStatWithMetadata {
    readonly value: VSBufferReadableStream;
}
export interface IBaseReadFileOptions extends IFileReadStreamOptions {
    readonly etag?: string;
}
export interface IReadFileStreamOptions extends IBaseReadFileOptions {
}
export interface IReadFileOptions extends IBaseReadFileOptions {
    readonly atomic?: boolean;
}
export interface IWriteFileOptions {
    readonly mtime?: number;
    readonly etag?: string;
    readonly unlock?: boolean;
    readonly atomic?: IFileAtomicOptions | false;
}
export interface IResolveFileOptions {
    readonly resolveTo?: readonly URI[];
    readonly resolveSingleChildDescendants?: boolean;
    readonly resolveMetadata?: boolean;
}
export interface IResolveMetadataFileOptions extends IResolveFileOptions {
    readonly resolveMetadata: true;
}
export interface ICreateFileOptions {
    readonly overwrite?: boolean;
}
export declare class FileOperationError extends Error {
    readonly fileOperationResult: FileOperationResult;
    readonly options?: (IReadFileOptions | IWriteFileOptions | ICreateFileOptions) | undefined;
    constructor(message: string, fileOperationResult: FileOperationResult, options?: (IReadFileOptions | IWriteFileOptions | ICreateFileOptions) | undefined);
}
export declare class TooLargeFileOperationError extends FileOperationError {
    readonly fileOperationResult: FileOperationResult.FILE_TOO_LARGE;
    readonly size: number;
    constructor(message: string, fileOperationResult: FileOperationResult.FILE_TOO_LARGE, size: number, options?: IReadFileOptions);
}
export declare class NotModifiedSinceFileOperationError extends FileOperationError {
    readonly stat: IFileStatWithMetadata;
    constructor(message: string, stat: IFileStatWithMetadata, options?: IReadFileOptions);
}
export declare const enum FileOperationResult {
    FILE_IS_DIRECTORY = 0,
    FILE_NOT_FOUND = 1,
    FILE_NOT_MODIFIED_SINCE = 2,
    FILE_MODIFIED_SINCE = 3,
    FILE_MOVE_CONFLICT = 4,
    FILE_WRITE_LOCKED = 5,
    FILE_PERMISSION_DENIED = 6,
    FILE_TOO_LARGE = 7,
    FILE_INVALID_PATH = 8,
    FILE_NOT_DIRECTORY = 9,
    FILE_OTHER_ERROR = 10
}
export declare const AutoSaveConfiguration: {
    OFF: string;
    AFTER_DELAY: string;
    ON_FOCUS_CHANGE: string;
    ON_WINDOW_CHANGE: string;
};
export declare const HotExitConfiguration: {
    OFF: string;
    ON_EXIT: string;
    ON_EXIT_AND_WINDOW_CLOSE: string;
};
export declare const FILES_ASSOCIATIONS_CONFIG = "files.associations";
export declare const FILES_EXCLUDE_CONFIG = "files.exclude";
export declare const FILES_READONLY_INCLUDE_CONFIG = "files.readonlyInclude";
export declare const FILES_READONLY_EXCLUDE_CONFIG = "files.readonlyExclude";
export declare const FILES_READONLY_FROM_PERMISSIONS_CONFIG = "files.readonlyFromPermissions";
export interface IGlobPatterns {
    [filepattern: string]: boolean;
}
export interface IFilesConfiguration {
    files?: IFilesConfigurationNode;
}
export interface IFilesConfigurationNode {
    associations: {
        [filepattern: string]: string;
    };
    exclude: IExpression;
    watcherExclude: IGlobPatterns;
    watcherInclude: string[];
    encoding: string;
    autoGuessEncoding: boolean;
    candidateGuessEncodings: string[];
    defaultLanguage: string;
    trimTrailingWhitespace: boolean;
    autoSave: string;
    autoSaveDelay: number;
    autoSaveWorkspaceFilesOnly: boolean;
    autoSaveWhenNoErrors: boolean;
    eol: string;
    enableTrash: boolean;
    hotExit: string;
    saveConflictResolution: 'askUser' | 'overwriteFileOnDisk';
    readonlyInclude: IGlobPatterns;
    readonlyExclude: IGlobPatterns;
    readonlyFromPermissions: boolean;
}
export declare enum FileKind {
    FILE = 0,
    FOLDER = 1,
    ROOT_FOLDER = 2
}
export declare const ETAG_DISABLED = "";
export declare function etag(stat: {
    mtime: number;
    size: number;
}): string;
export declare function etag(stat: {
    mtime: number | undefined;
    size: number | undefined;
}): string | undefined;
export declare function whenProviderRegistered(file: URI, fileService: IFileService): Promise<void>;
export declare class ByteSize {
    static readonly KB = 1024;
    static readonly MB: number;
    static readonly GB: number;
    static readonly TB: number;
    static formatSize(size: number): string;
}
export declare function getLargeFileConfirmationLimit(remoteAuthority?: string): number;
export declare function getLargeFileConfirmationLimit(uri?: URI): number;
