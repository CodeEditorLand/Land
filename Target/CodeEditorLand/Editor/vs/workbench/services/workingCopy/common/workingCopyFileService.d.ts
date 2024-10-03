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
    readonly source?: URI;
    readonly target: URI;
}
export interface IFileOperationUndoRedoInfo {
    undoRedoGroupId?: number;
    isUndoing?: boolean;
}
export interface WorkingCopyFileEvent extends IWaitUntil {
    readonly correlationId: number;
    readonly operation: FileOperation;
    readonly files: readonly SourceTargetPair[];
}
export interface IWorkingCopyFileOperationParticipant {
    participate(files: SourceTargetPair[], operation: FileOperation, undoInfo: IFileOperationUndoRedoInfo | undefined, timeout: number, token: CancellationToken): Promise<void>;
}
export interface IStoredFileWorkingCopySaveParticipantContext {
    readonly reason: SaveReason;
    readonly savedFrom?: URI;
}
export interface IStoredFileWorkingCopySaveParticipant {
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
type WorkingCopyProvider = (resourceOrFolder: URI) => IWorkingCopy[];
export interface IWorkingCopyFileService {
    readonly _serviceBrand: undefined;
    readonly onWillRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    readonly onDidFailWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    readonly onDidRunWorkingCopyFileOperation: Event<WorkingCopyFileEvent>;
    addFileOperationParticipant(participant: IWorkingCopyFileOperationParticipant): IDisposable;
    get hasSaveParticipants(): boolean;
    addSaveParticipant(participant: IStoredFileWorkingCopySaveParticipant): IDisposable;
    runSaveParticipants(workingCopy: IStoredFileWorkingCopy<IStoredFileWorkingCopyModel>, context: IStoredFileWorkingCopySaveParticipantContext, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    create(operations: ICreateFileOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    createFolder(operations: ICreateOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    move(operations: IMoveOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    copy(operations: ICopyOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<readonly IFileStatWithMetadata[]>;
    delete(operations: IDeleteOperation[], token: CancellationToken, undoInfo?: IFileOperationUndoRedoInfo): Promise<void>;
    registerWorkingCopyProvider(provider: WorkingCopyProvider): IDisposable;
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
