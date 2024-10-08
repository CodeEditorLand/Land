import './media/workspaceTrustEditor.css';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IBannerService } from '../../../services/banner/browser/bannerService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
export declare class WorkspaceTrustContextKeys extends Disposable implements IWorkbenchContribution {
    private readonly _ctxWorkspaceTrustEnabled;
    private readonly _ctxWorkspaceTrustState;
    constructor(contextKeyService: IContextKeyService, workspaceTrustEnablementService: IWorkspaceTrustEnablementService, workspaceTrustManagementService: IWorkspaceTrustManagementService);
}
export declare class WorkspaceTrustRequestHandler extends Disposable implements IWorkbenchContribution {
    private readonly dialogService;
    private readonly commandService;
    private readonly workspaceContextService;
    private readonly workspaceTrustManagementService;
    private readonly workspaceTrustRequestService;
    static readonly ID = "workbench.contrib.workspaceTrustRequestHandler";
    constructor(dialogService: IDialogService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, workspaceTrustManagementService: IWorkspaceTrustManagementService, workspaceTrustRequestService: IWorkspaceTrustRequestService);
    private get useWorkspaceLanguage();
    private registerListeners;
}
export declare class WorkspaceTrustUXHandler extends Disposable implements IWorkbenchContribution {
    private readonly dialogService;
    private readonly workspaceContextService;
    private readonly workspaceTrustEnablementService;
    private readonly workspaceTrustManagementService;
    private readonly configurationService;
    private readonly statusbarService;
    private readonly storageService;
    private readonly workspaceTrustRequestService;
    private readonly bannerService;
    private readonly labelService;
    private readonly hostService;
    private readonly productService;
    private readonly remoteAgentService;
    private readonly environmentService;
    private readonly fileService;
    private readonly entryId;
    private readonly statusbarEntryAccessor;
    constructor(dialogService: IDialogService, workspaceContextService: IWorkspaceContextService, workspaceTrustEnablementService: IWorkspaceTrustEnablementService, workspaceTrustManagementService: IWorkspaceTrustManagementService, configurationService: IConfigurationService, statusbarService: IStatusbarService, storageService: IStorageService, workspaceTrustRequestService: IWorkspaceTrustRequestService, bannerService: IBannerService, labelService: ILabelService, hostService: IHostService, productService: IProductService, remoteAgentService: IRemoteAgentService, environmentService: IEnvironmentService, fileService: IFileService);
    private registerListeners;
    private updateWorkbenchIndicators;
    private doShowModal;
    private showModalOnStart;
    private get startupPromptSetting();
    private get useWorkspaceLanguage();
    private isAiGeneratedWorkspace;
    private getBannerItem;
    private getBannerItemAriaLabels;
    private getBannerItemMessages;
    private get bannerSetting();
    private getRestrictedModeStatusbarEntry;
    private updateStatusbarEntry;
}
