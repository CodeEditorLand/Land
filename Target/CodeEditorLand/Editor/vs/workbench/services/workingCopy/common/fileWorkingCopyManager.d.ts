import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileDialogService, IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ISaveOptions } from '../../../common/editor.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IPathService } from '../../path/common/pathService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IStoredFileWorkingCopy, IStoredFileWorkingCopyModel, IStoredFileWorkingCopyModelFactory, IStoredFileWorkingCopyResolveOptions } from './storedFileWorkingCopy.js';
import { IStoredFileWorkingCopyManager, IStoredFileWorkingCopyManagerResolveOptions } from './storedFileWorkingCopyManager.js';
import { IUntitledFileWorkingCopy, IUntitledFileWorkingCopyModel, IUntitledFileWorkingCopyModelFactory } from './untitledFileWorkingCopy.js';
import { INewOrExistingUntitledFileWorkingCopyOptions, INewUntitledFileWorkingCopyOptions, INewUntitledFileWorkingCopyWithAssociatedResourceOptions, IUntitledFileWorkingCopyManager } from './untitledFileWorkingCopyManager.js';
import { IWorkingCopyFileService } from './workingCopyFileService.js';
import { IBaseFileWorkingCopyManager } from './abstractFileWorkingCopyManager.js';
import { IFileWorkingCopy } from './fileWorkingCopy.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IElevatedFileService } from '../../files/common/elevatedFileService.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { IWorkingCopyEditorService } from './workingCopyEditorService.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { IDecorationsService } from '../../decorations/common/decorations.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
export interface IFileWorkingCopyManager<S extends IStoredFileWorkingCopyModel, U extends IUntitledFileWorkingCopyModel> extends IBaseFileWorkingCopyManager<S | U, IFileWorkingCopy<S | U>> {
    /**
     * Provides access to the manager for stored file working copies.
     */
    readonly stored: IStoredFileWorkingCopyManager<S>;
    /**
     * Provides access to the manager for untitled file working copies.
     */
    readonly untitled: IUntitledFileWorkingCopyManager<U>;
    /**
     * Allows to resolve a stored file working copy. If the manager already knows
     * about a stored file working copy with the same `URI`, it will return that
     * existing stored file working copy. There will never be more than one
     * stored file working copy per `URI` until the stored file working copy is
     * disposed.
     *
     * Use the `IStoredFileWorkingCopyResolveOptions.reload` option to control the
     * behaviour for when a stored file working copy was previously already resolved
     * with regards to resolving it again from the underlying file resource
     * or not.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     *
     * @param resource used as unique identifier of the stored file working copy in
     * case one is already known for this `URI`.
     * @param options
     */
    resolve(resource: URI, options?: IStoredFileWorkingCopyManagerResolveOptions): Promise<IStoredFileWorkingCopy<S>>;
    /**
     * Create a new untitled file working copy with optional initial contents.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     */
    resolve(options?: INewUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<U>>;
    /**
     * Create a new untitled file working copy with optional initial contents
     * and associated resource. The associated resource will be used when
     * saving and will not require to ask the user for a file path.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     */
    resolve(options?: INewUntitledFileWorkingCopyWithAssociatedResourceOptions): Promise<IUntitledFileWorkingCopy<U>>;
    /**
     * Creates a new untitled file working copy with optional initial contents
     * with the provided resource or return an existing untitled file working
     * copy otherwise.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     */
    resolve(options?: INewOrExistingUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<U>>;
    /**
     * Implements "Save As" for file based working copies. The API is `URI` based
     * because it works even without resolved file working copies. If a file working
     * copy exists for any given `URI`, the implementation will deal with them properly
     * (e.g. dirty contents of the source will be written to the target and the source
     * will be reverted).
     *
     * Note: it is possible that the returned file working copy has a different `URI`
     * than the `target` that was passed in. Based on URI identity, the file working
     * copy may chose to return an existing file working copy with different casing
     * to respect file systems that are case insensitive.
     *
     * Note: Callers must `dispose` the working copy when no longer needed.
     *
     * Note: Untitled file working copies are being disposed when saved.
     *
     * @param source the source resource to save as
     * @param target the optional target resource to save to. if not defined, the user
     * will be asked for input
     * @returns the target stored working copy that was saved to or `undefined` in case of
     * cancellation
     */
    saveAs(source: URI, target: URI, options?: ISaveOptions): Promise<IStoredFileWorkingCopy<S> | undefined>;
    saveAs(source: URI, target: undefined, options?: IFileWorkingCopySaveAsOptions): Promise<IStoredFileWorkingCopy<S> | undefined>;
}
export interface IFileWorkingCopySaveAsOptions extends ISaveOptions {
    /**
     * Optional target resource to suggest to the user in case
     * no target resource is provided to save to.
     */
    suggestedTarget?: URI;
}
export declare class FileWorkingCopyManager<S extends IStoredFileWorkingCopyModel, U extends IUntitledFileWorkingCopyModel> extends Disposable implements IFileWorkingCopyManager<S, U> {
    private readonly workingCopyTypeId;
    private readonly storedWorkingCopyModelFactory;
    private readonly untitledWorkingCopyModelFactory;
    private readonly fileService;
    private readonly logService;
    private readonly workingCopyFileService;
    private readonly uriIdentityService;
    private readonly fileDialogService;
    private readonly filesConfigurationService;
    private readonly pathService;
    private readonly environmentService;
    private readonly dialogService;
    private readonly decorationsService;
    readonly onDidCreate: Event<IFileWorkingCopy<S | U>>;
    private static readonly FILE_WORKING_COPY_SAVE_CREATE_SOURCE;
    private static readonly FILE_WORKING_COPY_SAVE_REPLACE_SOURCE;
    readonly stored: IStoredFileWorkingCopyManager<S>;
    readonly untitled: IUntitledFileWorkingCopyManager<U>;
    constructor(workingCopyTypeId: string, storedWorkingCopyModelFactory: IStoredFileWorkingCopyModelFactory<S>, untitledWorkingCopyModelFactory: IUntitledFileWorkingCopyModelFactory<U>, fileService: IFileService, lifecycleService: ILifecycleService, labelService: ILabelService, logService: ILogService, workingCopyFileService: IWorkingCopyFileService, workingCopyBackupService: IWorkingCopyBackupService, uriIdentityService: IUriIdentityService, fileDialogService: IFileDialogService, filesConfigurationService: IFilesConfigurationService, workingCopyService: IWorkingCopyService, notificationService: INotificationService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, elevatedFileService: IElevatedFileService, pathService: IPathService, environmentService: IWorkbenchEnvironmentService, dialogService: IDialogService, decorationsService: IDecorationsService, progressService: IProgressService);
    private provideDecorations;
    get workingCopies(): (IUntitledFileWorkingCopy<U> | IStoredFileWorkingCopy<S>)[];
    get(resource: URI): IUntitledFileWorkingCopy<U> | IStoredFileWorkingCopy<S> | undefined;
    resolve(options?: INewUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<U>>;
    resolve(options?: INewUntitledFileWorkingCopyWithAssociatedResourceOptions): Promise<IUntitledFileWorkingCopy<U>>;
    resolve(options?: INewOrExistingUntitledFileWorkingCopyOptions): Promise<IUntitledFileWorkingCopy<U>>;
    resolve(resource: URI, options?: IStoredFileWorkingCopyResolveOptions): Promise<IStoredFileWorkingCopy<S>>;
    saveAs(source: URI, target?: URI, options?: IFileWorkingCopySaveAsOptions): Promise<IStoredFileWorkingCopy<S> | undefined>;
    private doSave;
    private doSaveAs;
    private doResolveSaveTarget;
    private confirmOverwrite;
    private confirmMakeWriteable;
    private suggestSavePath;
    destroy(): Promise<void>;
}
