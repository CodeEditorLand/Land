import { URI } from '../../../../base/common/uri.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ISaveOptions, IRevertOptions, SaveReason } from '../../../common/editor.js';
import { ReadableStream } from '../../../../base/common/stream.js';
import { IBaseFileStatWithMetadata, IFileStatWithMetadata, IWriteFileOptions, FileOperationError, IReadFileStreamOptions, IFileReadLimits } from '../../../../platform/files/common/files.js';
import { ITextEditorModel } from '../../../../editor/common/services/resolverService.js';
import { ITextBufferFactory, ITextModel, ITextSnapshot } from '../../../../editor/common/model.js';
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { IWorkingCopy, IWorkingCopySaveEvent } from '../../workingCopy/common/workingCopy.js';
import { IUntitledTextEditorModelManager } from '../../untitled/common/untitledTextEditorService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IProgress, IProgressStep } from '../../../../platform/progress/common/progress.js';
import { IFileOperationUndoRedoInfo } from '../../workingCopy/common/workingCopyFileService.js';
export declare const ITextFileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextFileService>;
export interface ITextFileService extends IDisposable {
    readonly _serviceBrand: undefined;
    readonly files: ITextFileEditorModelManager;
    readonly untitled: IUntitledTextEditorModelManager;
    readonly encoding: IResourceEncodings;
    isDirty(resource: URI): boolean;
    save(resource: URI, options?: ITextFileSaveOptions): Promise<URI | undefined>;
    saveAs(resource: URI, targetResource?: URI, options?: ITextFileSaveAsOptions): Promise<URI | undefined>;
    revert(resource: URI, options?: IRevertOptions): Promise<void>;
    read(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileContent>;
    readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent>;
    write(resource: URI, value: string | ITextSnapshot, options?: IWriteTextFileOptions): Promise<IFileStatWithMetadata>;
    create(operations: {
        resource: URI;
        value?: string | ITextSnapshot;
        options?: {
            overwrite?: boolean;
        };
    }[], undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    getEncodedReadable(resource: URI, value: ITextSnapshot, options?: IWriteTextFileOptions): Promise<VSBufferReadable>;
    getEncodedReadable(resource: URI, value: string, options?: IWriteTextFileOptions): Promise<VSBuffer>;
    getEncodedReadable(resource: URI, value?: ITextSnapshot, options?: IWriteTextFileOptions): Promise<VSBufferReadable | undefined>;
    getEncodedReadable(resource: URI, value?: string, options?: IWriteTextFileOptions): Promise<VSBuffer | undefined>;
    getEncodedReadable(resource: URI, value?: string | ITextSnapshot, options?: IWriteTextFileOptions): Promise<VSBuffer | VSBufferReadable | undefined>;
    getDecodedStream(resource: URI, value: VSBufferReadableStream, options?: IReadTextFileEncodingOptions): Promise<ReadableStream<string>>;
}
export interface IReadTextFileEncodingOptions {
    readonly encoding?: string;
    readonly autoGuessEncoding?: boolean;
    readonly candidateGuessEncodings?: string[];
    readonly acceptTextOnly?: boolean;
}
export interface IReadTextFileOptions extends IReadTextFileEncodingOptions, IReadFileStreamOptions {
}
export interface IWriteTextFileOptions extends IWriteFileOptions {
    readonly encoding?: string;
    readonly writeElevated?: boolean;
}
export declare const enum TextFileOperationResult {
    FILE_IS_BINARY = 0
}
export declare class TextFileOperationError extends FileOperationError {
    textFileOperationResult: TextFileOperationResult;
    static isTextFileOperationError(obj: unknown): obj is TextFileOperationError;
    readonly options?: IReadTextFileOptions & IWriteTextFileOptions;
    constructor(message: string, textFileOperationResult: TextFileOperationResult, options?: IReadTextFileOptions & IWriteTextFileOptions);
}
export interface IResourceEncodings {
    getPreferredReadEncoding(resource: URI): Promise<IResourceEncoding>;
    getPreferredWriteEncoding(resource: URI, preferredEncoding?: string): Promise<IResourceEncoding>;
}
export interface IResourceEncoding {
    readonly encoding: string;
    readonly hasBOM: boolean;
}
export interface ISaveErrorHandler {
    onSaveError(error: Error, model: ITextFileEditorModel, options: ITextFileSaveAsOptions): void;
}
export declare const enum TextFileEditorModelState {
    SAVED = 0,
    DIRTY = 1,
    PENDING_SAVE = 2,
    CONFLICT = 3,
    ORPHAN = 4,
    ERROR = 5
}
export declare const enum TextFileResolveReason {
    EDITOR = 1,
    REFERENCE = 2,
    OTHER = 3
}
interface IBaseTextFileContent extends IBaseFileStatWithMetadata {
    readonly encoding: string;
}
export interface ITextFileContent extends IBaseTextFileContent {
    readonly value: string;
}
export interface ITextFileStreamContent extends IBaseTextFileContent {
    readonly value: ITextBufferFactory;
}
export interface ITextFileEditorModelResolveOrCreateOptions extends ITextFileResolveOptions {
    readonly languageId?: string;
    readonly encoding?: string;
    readonly reload?: {
        readonly async: boolean;
    };
}
export interface ITextFileSaveEvent extends ITextFileEditorModelSaveEvent {
    readonly model: ITextFileEditorModel;
}
export interface ITextFileResolveEvent {
    readonly model: ITextFileEditorModel;
    readonly reason: TextFileResolveReason;
}
export interface ITextFileSaveParticipantContext {
    readonly reason: SaveReason;
    readonly savedFrom?: URI;
}
export interface ITextFileSaveParticipant {
    participate(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
}
export interface ITextFileEditorModelManager {
    readonly onDidCreate: Event<ITextFileEditorModel>;
    readonly onDidResolve: Event<ITextFileResolveEvent>;
    readonly onDidChangeDirty: Event<ITextFileEditorModel>;
    readonly onDidChangeReadonly: Event<ITextFileEditorModel>;
    readonly onDidRemove: Event<URI>;
    readonly onDidChangeOrphaned: Event<ITextFileEditorModel>;
    readonly onDidChangeEncoding: Event<ITextFileEditorModel>;
    readonly onDidSaveError: Event<ITextFileEditorModel>;
    readonly onDidSave: Event<ITextFileSaveEvent>;
    readonly onDidRevert: Event<ITextFileEditorModel>;
    readonly models: ITextFileEditorModel[];
    saveErrorHandler: ISaveErrorHandler;
    get(resource: URI): ITextFileEditorModel | undefined;
    resolve(resource: URI, options?: ITextFileEditorModelResolveOrCreateOptions): Promise<ITextFileEditorModel>;
    addSaveParticipant(participant: ITextFileSaveParticipant): IDisposable;
    runSaveParticipants(model: ITextFileEditorModel, context: ITextFileSaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    canDispose(model: ITextFileEditorModel): true | Promise<true>;
}
export interface ITextFileSaveOptions extends ISaveOptions {
    readonly writeUnlock?: boolean;
    readonly writeElevated?: boolean;
    readonly ignoreModifiedSince?: boolean;
    readonly ignoreErrorHandler?: boolean;
}
export interface ITextFileSaveAsOptions extends ITextFileSaveOptions {
    readonly from?: URI;
    readonly suggestedTarget?: URI;
}
export interface ITextFileResolveOptions {
    readonly contents?: ITextBufferFactory;
    readonly forceReadFromFile?: boolean;
    readonly allowBinary?: boolean;
    readonly reason?: TextFileResolveReason;
    readonly limits?: IFileReadLimits;
}
export declare const enum EncodingMode {
    Encode = 0,
    Decode = 1
}
export interface IEncodingSupport {
    getEncoding(): string | undefined;
    setEncoding(encoding: string, mode: EncodingMode): Promise<void>;
}
export interface ILanguageSupport {
    setLanguageId(languageId: string, source?: string): void;
}
export interface ITextFileEditorModelSaveEvent extends IWorkingCopySaveEvent {
    readonly stat: IFileStatWithMetadata;
}
export interface ITextFileEditorModel extends ITextEditorModel, IEncodingSupport, ILanguageSupport, IWorkingCopy {
    readonly onDidSave: Event<ITextFileEditorModelSaveEvent>;
    readonly onDidSaveError: Event<void>;
    readonly onDidChangeOrphaned: Event<void>;
    readonly onDidChangeReadonly: Event<void>;
    readonly onDidChangeEncoding: Event<void>;
    hasState(state: TextFileEditorModelState): boolean;
    joinState(state: TextFileEditorModelState.PENDING_SAVE): Promise<void>;
    updatePreferredEncoding(encoding: string | undefined): void;
    save(options?: ITextFileSaveAsOptions): Promise<boolean>;
    revert(options?: IRevertOptions): Promise<void>;
    resolve(options?: ITextFileResolveOptions): Promise<void>;
    isDirty(): this is IResolvedTextFileEditorModel;
    getLanguageId(): string | undefined;
    isResolved(): this is IResolvedTextFileEditorModel;
}
export declare function isTextFileEditorModel(model: ITextEditorModel): model is ITextFileEditorModel;
export interface IResolvedTextFileEditorModel extends ITextFileEditorModel {
    readonly textEditorModel: ITextModel;
    createSnapshot(): ITextSnapshot;
}
export declare function snapshotToString(snapshot: ITextSnapshot): string;
export declare function stringToSnapshot(value: string): ITextSnapshot;
export declare function toBufferOrReadable(value: string): VSBuffer;
export declare function toBufferOrReadable(value: ITextSnapshot): VSBufferReadable;
export declare function toBufferOrReadable(value: string | ITextSnapshot): VSBuffer | VSBufferReadable;
export declare function toBufferOrReadable(value: string | ITextSnapshot | undefined): VSBuffer | VSBufferReadable | undefined;
export {};
