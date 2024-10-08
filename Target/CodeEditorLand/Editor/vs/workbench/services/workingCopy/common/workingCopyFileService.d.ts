import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Event, IWaitUntil } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { IFileService, FileOperation, IFileStatWithMetadata } from '../../../../platform/files/common/files.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { IWorkingCopy } from './workingCopy.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { SaveReason } from '../../../common/editor.js';
import { IProgress, IProgressStep } from '../../../../platform/progress/common/progress.js';
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel } from './storedFileWorkingCopy.js';
export declare const IWorkingCopyFileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkingCopyFileService>;
export interface SourceTargetPair {
    /**
     * The source resource that is defined for move operations.
     */
    readonly source?: URI;
    /**
     * The target resource the event is about.
     */
    readonly target: URI;
}
export interface IFileOperationUndoRedoInfo {
    /**
     * Id of the undo group that the file operation belongs to.
     */
    undoRedoGroupId?: number;
    /**
     * Flag indicates if the operation is an undo.
     */
    isUndoing?: boolean;
}
export interface WorkingCopyFileEvent extends IWaitUntil {
    /**
     * An identifier to correlate the operation through the
     * different event types (before, after, error).
     */
    readonly correlationId: number;
    /**
     * The file operation that is taking place.
     */
    readonly operation: FileOperation;
    /**
     * The array of source/target pair of files involved in given operation.
     */
    readonly files: readonly SourceTargetPair[];
}
export interface IWorkingCopyFileOperationParticipant {
    /**
     * Participate in a file operation of working copies. Allows to
     * change the working copies before they are being saved to disk.
     */
    participate(files: SourceTargetPair[], operation: FileOperation, undoInfo: IFileOperationUndoRedoInfo | undefined, timeout: number, token: CancellationToken): Promise<void>;
}
export interface IStoredFileWorkingCopySaveParticipantContext {
    /**
     * The reason why the save was triggered.
     */
    readonly reason: SaveReason;
    /**
     * Only applies to when a text file was saved as, for
     * example when starting with untitled and saving. This
     * provides access to the initial resource the text
     * file had before.
     */
    readonly savedFrom?: URI;
}
export interface IStoredFileWorkingCopySaveParticipant {
    /**
     * Participate in a save operation of file stored working copies.
     * Allows to make changes before content is being saved to disk.
     */
    participate(workingCopy: IStoredFileWorkingCopy<IStoredFileWorkingCopyModel>, context: IStoredFileWorkingCopySaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
}
export interface ICreateOperation {
    resource: URI;
    overwrite?: boolean;
}
export interface ICreateFileOperation extends ICreateOperation {
    contents?: VSBuffer | VSBufferReadable | VSBufferReadableStream;
}
export interface IDeleteOperation {
    resource: URI;
    useTrash?: boolean;
    recursive?: boolean;
}
export interface IMoveOperation {
    file: Required<SourceTargetPair>;
    overwrite?: boolean;
}
export interface ICopyOperation extends IMoveOperation {
}
/**
 * Returns the working copies for a given resource.
 */
type WorkingCopyProvider = (resourceOrFolder: URI) => IWorkingCopy[];
/**
 * A service that allows to perform file operations with working copy support.
 * Any operation that would leave a stale dirty working copy behind will make
 * sure to revert the working copy first.
 *
 * On top of that events are provided to participate in each state of the
 * operation to perform additional work.
 */
export interface IWorkingCopyFileService {
    readonly _serviceBrand: undefined;
    /**
     * An event that is fired when a certain working copy IO operation is about to run.
     *
     * Participants can join this event with a long running operation to keep some state
     * before the operation is started, but working copies should not be changed at this
     * point in time. For that purpose, use the `IWorkingCopyFileOperationParticipant` API.
     */
    readonly onWillRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    /**
     * An event that is fired after a working copy IO operation has failed.
     *
     * Participants can join this event with a long running operation to clean up as needed.
     */
    readonly onDidFailWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    /**
     * An event that is fired after a working copy IO operation has been performed.
     *
     * Participants can join this event with a long running operation to make changes
     * after the operation has finished.
     */
    readonly onDidRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    /**
     * Adds a participant for file operations on working copies.
     */
    addFileOperationParticipant(participant: IWorkingCopyFileOperationParticipant): IDisposable;
    /**
     * Whether save participants are present for stored file working copies.
     */
    get hasSaveParticipants(): boolean;
    /**
     * Adds a participant for save operations on stored file working copies.
     */
    addSaveParticipant(participant: IStoredFileWorkingCopySaveParticipant): IDisposable;
    /**
     * Runs all available save participants for stored file working copies.
     */
    runSaveParticipants(workingCopy: IStoredFileWorkingCopy<IStoredFileWorkingCopyModel>, context: IStoredFileWorkingCopySaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    /**
     * Will create a resource with the provided optional contents, optionally overwriting any target.
     *
     * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
     * `onDidRunWorkingCopyFileOperation` events to participate.
     */
    create(operations: ICreateFileOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    /**
     * Will create a folder and any parent folder that needs to be created.
     *
     * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
     * `onDidRunWorkingCopyFileOperation` events to participate.
     *
     * Note: events will only be emitted for the provided resource, but not any
     * parent folders that are being created as part of the operation.
     */
    createFolder(operations: ICreateOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    /**
     * Will move working copies matching the provided resources and corresponding children
     * to the target resources using the associated file service for those resources.
     *
     * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
     * `onDidRunWorkingCopyFileOperation` events to participate.
     */
    move(operations: IMoveOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    /**
     * Will copy working copies matching the provided resources and corresponding children
     * to the target resources using the associated file service for those resources.
     *
     * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
     * `onDidRunWorkingCopyFileOperation` events to participate.
     */
    copy(operations: ICopyOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    /**
     * Will delete working copies matching the provided resources and children
     * using the associated file service for those resources.
     *
     * Working copy owners can listen to the `onWillRunWorkingCopyFileOperation` and
     * `onDidRunWorkingCopyFileOperation` events to participate.
     */
    delete(operations: IDeleteOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<void>;
    /**
     * Register a new provider for working copies based on a resource.
     *
     * @return a disposable that unregisters the provider.
     */
    registerWorkingCopyProvider(provider: WorkingCopyProvider): IDisposable;
    /**
     * Will return all working copies that are dirty matching the provided resource.
     * If the resource is a folder and the scheme supports file operations, a working
     * copy that is dirty and is a child of that folder will also be returned.
     */
    getDirty(resource: URI): readonly IWorkingCopy[];
}
export declare class WorkingCopyFileService extends Disposable implements IWorkingCopyFileService {
    private readonly fileService;
    private readonly workingCopyService;
    private readonly instantiationService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private readonly _onWillRunWorkingCopyFileOperation;
    readonly onWillRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    private readonly _onDidFailWorkingCopyFileOperation;
    readonly onDidFailWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    private readonly _onDidRunWorkingCopyFileOperation;
    readonly onDidRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    private correlationIds;
    constructor(fileService: IFileService, workingCopyService: IWorkingCopyService, instantiationService: IInstantiationService, uriIdentityService: IUriIdentityService);
    create(operations: ICreateFileOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<IFileStatWithMetadata[]>;
    createFolder(operations: ICreateOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<IFileStatWithMetadata[]>;
    doCreateFileOrFolder(operations: (ICreateFileOperation | ICreateOperation)[], isFile: boolean, token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<IFileStatWithMetadata[]>;
    move(operations: IMoveOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<IFileStatWithMetadata[]>;
    copy(operations: ICopyOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<IFileStatWithMetadata[]>;
    private doMoveOrCopy;
    delete(operations: IDeleteOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<void>;
    private readonly fileOperationParticipants;
    addFileOperationParticipant(participant: IWorkingCopyFileOperationParticipant): IDisposable;
    private runFileOperationParticipants;
    private readonly saveParticipants;
    get hasSaveParticipants(): boolean;
    addSaveParticipant(participant: IStoredFileWorkingCopySaveParticipant): IDisposable;
    runSaveParticipants(workingCopy: IStoredFileWorkingCopy<IStoredFileWorkingCopyModel>, context: IStoredFileWorkingCopySaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    private readonly workingCopyProviders;
    registerWorkingCopyProvider(provider: WorkingCopyProvider): IDisposable;
    getDirty(resource: URI): IWorkingCopy[];
}
export {};
