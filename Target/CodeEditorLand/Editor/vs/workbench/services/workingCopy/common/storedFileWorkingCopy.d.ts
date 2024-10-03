import { URI } from '../../../../base/common/uri.js';
import { Event } from '../../../../base/common/event.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IFileReadLimits, IFileService, IFileStatWithMetadata, IWriteFileOptions } from '../../../../platform/files/common/files.js';
import { ISaveOptions, IRevertOptions } from '../../../common/editor.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { IWorkingCopyBackup, IWorkingCopySaveEvent, WorkingCopyCapabilities } from './workingCopy.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkingCopyFileService } from './workingCopyFileService.js';
import { VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkingCopyEditorService } from './workingCopyEditorService.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IElevatedFileService } from '../../files/common/elevatedFileService.js';
import { IResourceWorkingCopy, ResourceWorkingCopy } from './resourceWorkingCopy.js';
import { IFileWorkingCopy, IFileWorkingCopyModel, IFileWorkingCopyModelFactory } from './fileWorkingCopy.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
export interface IStoredFileWorkingCopyModelFactory<M extends IStoredFileWorkingCopyModel> extends IFileWorkingCopyModelFactory<M> {
}
export interface IStoredFileWorkingCopyModel extends IFileWorkingCopyModel {
    readonly onDidChangeContent: Event<IStoredFileWorkingCopyModelContentChangedEvent>;
    readonly versionId: unknown;
    pushStackElement(): void;
    save?(options: IWriteFileOptions, token: CancellationToken): Promise<IFileStatWithMetadata>;
}
export interface IStoredFileWorkingCopyModelContentChangedEvent {
    readonly isUndoing: boolean;
    readonly isRedoing: boolean;
}
export interface IStoredFileWorkingCopy<M extends IStoredFileWorkingCopyModel> extends IResourceWorkingCopy, IFileWorkingCopy<M> {
    readonly onDidResolve: Event<void>;
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent>;
    readonly onDidSaveError: Event<void>;
    readonly onDidChangeReadonly: Event<void>;
    resolve(options?: IStoredFileWorkingCopyResolveOptions): Promise<void>;
    markModified(): void;
    hasState(state: StoredFileWorkingCopyState): boolean;
    joinState(state: StoredFileWorkingCopyState.PENDING_SAVE): Promise<void>;
    isResolved(): this is IResolvedStoredFileWorkingCopy<M>;
    isReadonly(): boolean | IMarkdownString;
    save(options?: IStoredFileWorkingCopySaveAsOptions): Promise<boolean>;
}
export interface IResolvedStoredFileWorkingCopy<M extends IStoredFileWorkingCopyModel> extends IStoredFileWorkingCopy<M> {
    readonly model: M;
}
export declare const enum StoredFileWorkingCopyState {
    SAVED = 0,
    DIRTY = 1,
    PENDING_SAVE = 2,
    CONFLICT = 3,
    ORPHAN = 4,
    ERROR = 5
}
export interface IStoredFileWorkingCopySaveOptions extends ISaveOptions {
    readonly writeUnlock?: boolean;
    readonly writeElevated?: boolean;
    readonly ignoreModifiedSince?: boolean;
    readonly ignoreErrorHandler?: boolean;
}
export interface IStoredFileWorkingCopySaveAsOptions extends IStoredFileWorkingCopySaveOptions {
    readonly from?: URI;
}
export interface IStoredFileWorkingCopyResolver {
    (options?: IStoredFileWorkingCopyResolveOptions): Promise<void>;
}
export interface IStoredFileWorkingCopyResolveOptions {
    readonly contents?: VSBufferReadableStream;
    readonly forceReadFromFile?: boolean;
    readonly limits?: IFileReadLimits;
}
export interface IStoredFileWorkingCopySaveEvent extends IWorkingCopySaveEvent {
    readonly stat: IFileStatWithMetadata;
}
export declare function isStoredFileWorkingCopySaveEvent(e: IWorkingCopySaveEvent): e is IStoredFileWorkingCopySaveEvent;
export declare class StoredFileWorkingCopy<M extends IStoredFileWorkingCopyModel> extends ResourceWorkingCopy implements IStoredFileWorkingCopy<M> {
    readonly typeId: string;
    readonly name: string;
    private readonly modelFactory;
    private readonly externalResolver;
    private readonly logService;
    private readonly workingCopyFileService;
    private readonly filesConfigurationService;
    private readonly workingCopyBackupService;
    private readonly notificationService;
    private readonly workingCopyEditorService;
    private readonly editorService;
    private readonly elevatedFileService;
    private readonly progressService;
    readonly capabilities: WorkingCopyCapabilities;
    private _model;
    get model(): M | undefined;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    private readonly _onDidResolve;
    readonly onDidResolve: Event<void>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<void>;
    private readonly _onDidSaveError;
    readonly onDidSaveError: Event<void>;
    private readonly _onDidSave;
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent>;
    private readonly _onDidRevert;
    readonly onDidRevert: Event<void>;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeReadonly: Event<void>;
    constructor(typeId: string, resource: URI, name: string, modelFactory: IStoredFileWorkingCopyModelFactory<M>, externalResolver: IStoredFileWorkingCopyResolver, fileService: IFileService, logService: ILogService, workingCopyFileService: IWorkingCopyFileService, filesConfigurationService: IFilesConfigurationService, workingCopyBackupService: IWorkingCopyBackupService, workingCopyService: IWorkingCopyService, notificationService: INotificationService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, elevatedFileService: IElevatedFileService, progressService: IProgressService);
    private registerListeners;
    private dirty;
    private savedVersionId;
    isDirty(): this is IResolvedStoredFileWorkingCopy<M>;
    markModified(): void;
    private setDirty;
    private doSetDirty;
    lastResolvedFileStat: IFileStatWithMetadata | undefined;
    isResolved(): this is IResolvedStoredFileWorkingCopy<M>;
    resolve(options?: IStoredFileWorkingCopyResolveOptions): Promise<void>;
    private doResolve;
    private resolveFromBuffer;
    private resolveFromBackup;
    private doResolveFromBackup;
    private resolveFromFile;
    private resolveFromContent;
    private doCreateModel;
    private ignoreDirtyOnModelContentChange;
    private doUpdateModel;
    private installModelListeners;
    private onModelContentChanged;
    private forceResolveFromFile;
    get backupDelay(): number | undefined;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    private versionId;
    private static readonly UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD;
    private lastContentChangeFromUndoRedo;
    private readonly saveSequentializer;
    private ignoreSaveFromSaveParticipants;
    save(options?: IStoredFileWorkingCopySaveAsOptions): Promise<boolean>;
    private doSave;
    private doSaveSequential;
    private handleSaveSuccess;
    private handleSaveError;
    private doHandleSaveError;
    private updateLastResolvedFileStat;
    revert(options?: IRevertOptions): Promise<void>;
    private inConflictMode;
    private inErrorMode;
    hasState(state: StoredFileWorkingCopyState): boolean;
    joinState(state: StoredFileWorkingCopyState.PENDING_SAVE): Promise<void>;
    isReadonly(): boolean | IMarkdownString;
    private trace;
    dispose(): void;
}
