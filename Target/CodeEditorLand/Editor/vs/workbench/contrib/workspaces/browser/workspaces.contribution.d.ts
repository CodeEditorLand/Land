import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
/**
 * A workbench contribution that will look for `.code-workspace` files in the root of the
 * workspace folder and open a notification to suggest to open one of the workspaces.
 */
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
