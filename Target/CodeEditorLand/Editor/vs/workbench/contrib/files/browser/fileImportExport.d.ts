import { IConfirmation, IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IExplorerService } from './files.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ExplorerItem } from '../common/explorerModel.js';
import { URI } from '../../../../base/common/uri.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceEditingService } from '../../../services/workspaces/common/workspaceEditing.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class BrowserFileUpload {
    private readonly progressService;
    private readonly dialogService;
    private readonly explorerService;
    private readonly editorService;
    private readonly fileService;
    private static readonly MAX_PARALLEL_UPLOADS;
    constructor(progressService: IProgressService, dialogService: IDialogService, explorerService: IExplorerService, editorService: IEditorService, fileService: IFileService);
    upload(target: ExplorerItem, source: DragEvent | FileList): Promise<void>;
    private toTransfer;
    private doUpload;
    private doUploadEntry;
    private doUploadFileBuffered;
    private doUploadFileUnbuffered;
}
export declare class ExternalFileImport {
    private readonly fileService;
    private readonly hostService;
    private readonly contextService;
    private readonly configurationService;
    private readonly dialogService;
    private readonly workspaceEditingService;
    private readonly explorerService;
    private readonly editorService;
    private readonly progressService;
    private readonly notificationService;
    private readonly instantiationService;
    constructor(fileService: IFileService, hostService: IHostService, contextService: IWorkspaceContextService, configurationService: IConfigurationService, dialogService: IDialogService, workspaceEditingService: IWorkspaceEditingService, explorerService: IExplorerService, editorService: IEditorService, progressService: IProgressService, notificationService: INotificationService, instantiationService: IInstantiationService);
    import(target: ExplorerItem, source: DragEvent, targetWindow: Window): Promise<void>;
    private doImport;
    private importResources;
}
export declare class FileDownload {
    private readonly fileService;
    private readonly explorerService;
    private readonly progressService;
    private readonly logService;
    private readonly fileDialogService;
    private readonly storageService;
    private static readonly LAST_USED_DOWNLOAD_PATH_STORAGE_KEY;
    constructor(fileService: IFileService, explorerService: IExplorerService, progressService: IProgressService, logService: ILogService, fileDialogService: IFileDialogService, storageService: IStorageService);
    download(source: ExplorerItem[]): Promise<void>;
    private doDownload;
    private doDownloadBrowser;
    private downloadFileBufferedBrowser;
    private downloadFileUnbufferedBrowser;
    private downloadFileBrowser;
    private downloadFolderBrowser;
    private reportProgress;
    private doDownloadNative;
}
export declare function getFileOverwriteConfirm(name: string): IConfirmation;
export declare function getMultipleFilesOverwriteConfirm(files: URI[]): IConfirmation;
