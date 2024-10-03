import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class WorkspacesFinderContribution extends Disposable implements IWorkbenchContribution {
    private readonly contextService;
    private readonly notificationService;
    private readonly fileService;
    private readonly quickInputService;
    private readonly hostService;
    private readonly storageService;
    constructor(contextService: IWorkspaceContextService, notificationService: INotificationService, fileService: IFileService, quickInputService: IQuickInputService, hostService: IHostService, storageService: IStorageService);
    private findWorkspaces;
    private doHandleWorkspaceFiles;
}
