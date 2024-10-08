import { IJSONEditingService } from '../../configuration/common/jsonEditing.js';
import { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.js';
import { WorkspaceService } from '../../configuration/browser/configurationService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IFileDialogService, IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { IHostService } from '../../host/browser/host.js';
import { AbstractWorkspaceEditingService } from './abstractWorkspaceEditingService.js';
import { URI } from '../../../../base/common/uri.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IWorkbenchConfigurationService } from '../../configuration/common/configuration.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
export declare class BrowserWorkspaceEditingService extends AbstractWorkspaceEditingService {
    constructor(jsonEditingService: IJSONEditingService, contextService: WorkspaceService, configurationService: IWorkbenchConfigurationService, notificationService: INotificationService, commandService: ICommandService, fileService: IFileService, textFileService: ITextFileService, workspacesService: IWorkspacesService, environmentService: IWorkbenchEnvironmentService, fileDialogService: IFileDialogService, dialogService: IDialogService, hostService: IHostService, uriIdentityService: IUriIdentityService, workspaceTrustManagementService: IWorkspaceTrustManagementService, userDataProfilesService: IUserDataProfilesService, userDataProfileService: IUserDataProfileService);
    enterWorkspace(workspaceUri: URI): Promise<void>;
}
