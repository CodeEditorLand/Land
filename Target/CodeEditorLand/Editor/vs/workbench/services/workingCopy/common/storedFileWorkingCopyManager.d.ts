import { Event } from '../../../../base/common/event.js';
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel, IStoredFileWorkingCopyModelFactory, IStoredFileWorkingCopyResolveOptions, IStoredFileWorkingCopySaveEvent as IBaseStoredFileWorkingCopySaveEvent } from './storedFileWorkingCopy.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkingCopyFileService } from './workingCopyFileService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { BaseFileWorkingCopyManager, IBaseFileWorkingCopyManager } from './abstractFileWorkingCopyManager.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IElevatedFileService } from '../../files/common/elevatedFileService.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { IWorkingCopyEditorService } from './workingCopyEditorService.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
export interface IStoredFileWorkingCopyManager<M extends IStoredFileWorkingCopyModel> extends IBaseFileWorkingCopyManager<M, IStoredFileWorkingCopy<M>> {
    readonly onDidResolve: Event<IStoredFileWorkingCopy<M>>;
    readonly onDidChangeDirty: Event<IStoredFileWorkingCopy<M>>;
    readonly onDidChangeReadonly: Event<IStoredFileWorkingCopy<M>>;
    readonly onDidChangeOrphaned: Event<IStoredFileWorkingCopy<M>>;
    readonly onDidSaveError: Event<IStoredFileWorkingCopy<M>>;
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent<M>>;
    readonly onDidRevert: Event<IStoredFileWorkingCopy<M>>;
    readonly onDidRemove: Event<URI>;
    resolve(resource: URI, options?: IStoredFileWorkingCopyManagerResolveOptions): Promise<IStoredFileWorkingCopy<M>>;
    canDispose(workingCopy: IStoredFileWorkingCopy<M>): true | Promise<true>;
}
export interface IStoredFileWorkingCopySaveEvent<M extends IStoredFileWorkingCopyModel> extends IBaseStoredFileWorkingCopySaveEvent {
    readonly workingCopy: IStoredFileWorkingCopy<M>;
}
export interface IStoredFileWorkingCopyManagerResolveOptions extends IStoredFileWorkingCopyResolveOptions {
    readonly reload?: {
        readonly async: boolean;
        readonly force?: boolean;
    };
}
export declare class StoredFileWorkingCopyManager<M extends IStoredFileWorkingCopyModel> extends BaseFileWorkingCopyManager<M, IStoredFileWorkingCopy<M>> implements IStoredFileWorkingCopyManager<M> {
    private readonly workingCopyTypeId;
    private readonly modelFactory;
    private readonly lifecycleService;
    private readonly labelService;
    private readonly workingCopyFileService;
    private readonly uriIdentityService;
    private readonly filesConfigurationService;
    private readonly workingCopyService;
    private readonly notificationService;
    private readonly workingCopyEditorService;
    private readonly editorService;
    private readonly elevatedFileService;
    private readonly progressService;
    private readonly _onDidResolve;
    readonly onDidResolve: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeReadonly: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidChangeOrphaned;
    readonly onDidChangeOrphaned: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidSaveError;
    readonly onDidSaveError: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidSave;
    readonly onDidSave: Event<IStoredFileWorkingCopySaveEvent<M>>;
    private readonly _onDidRevert;
    readonly onDidRevert: Event<IStoredFileWorkingCopy<M>>;
    private readonly _onDidRemove;
    readonly onDidRemove: Event<URI>;
    private readonly mapResourceToWorkingCopyListeners;
    private readonly mapResourceToPendingWorkingCopyResolve;
    private readonly workingCopyResolveQueue;
    constructor(workingCopyTypeId: string, modelFactory: IStoredFileWorkingCopyModelFactory<M>, fileService: IFileService, lifecycleService: ILifecycleService, labelService: ILabelService, logService: ILogService, workingCopyFileService: IWorkingCopyFileService, workingCopyBackupService: IWorkingCopyBackupService, uriIdentityService: IUriIdentityService, filesConfigurationService: IFilesConfigurationService, workingCopyService: IWorkingCopyService, notificationService: INotificationService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, elevatedFileService: IElevatedFileService, progressService: IProgressService);
    private registerListeners;
    private onBeforeShutdownWeb;
    private onWillShutdownDesktop;
    private onDidChangeFileSystemProviderCapabilities;
    private onDidChangeFileSystemProviderRegistrations;
    private onDidFilesChange;
    private queueWorkingCopyReloads;
    private queueWorkingCopyReload;
    private readonly mapCorrelationIdToWorkingCopiesToRestore;
    private onWillRunWorkingCopyFileOperation;
    private onDidFailWorkingCopyFileOperation;
    private onDidRunWorkingCopyFileOperation;
    private reload;
    resolve(resource: URI, options?: IStoredFileWorkingCopyManagerResolveOptions): Promise<IStoredFileWorkingCopy<M>>;
    private doResolve;
    private joinPendingResolves;
    private doJoinPendingResolves;
    private registerWorkingCopy;
    protected remove(resource: URI): boolean;
    canDispose(workingCopy: IStoredFileWorkingCopy<M>): true | Promise<true>;
    private doCanDispose;
    dispose(): void;
}
