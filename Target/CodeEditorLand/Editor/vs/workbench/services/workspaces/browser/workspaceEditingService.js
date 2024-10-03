var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
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
import { IWorkspaceEditingService } from '../common/workspaceEditing.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IWorkbenchConfigurationService } from '../../configuration/common/configuration.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
let BrowserWorkspaceEditingService = class BrowserWorkspaceEditingService extends AbstractWorkspaceEditingService {
    constructor(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService) {
        super(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService, uriIdentityService, workspaceTrustManagementService, userDataProfilesService, userDataProfileService);
    }
    async enterWorkspace(workspaceUri) {
        const result = await this.doEnterWorkspace(workspaceUri);
        if (result) {
            await this.hostService.openWindow([{ workspaceUri }], { forceReuseWindow: true });
        }
    }
};
BrowserWorkspaceEditingService = __decorate([
    __param(0, IJSONEditingService),
    __param(1, IWorkspaceContextService),
    __param(2, IWorkbenchConfigurationService),
    __param(3, INotificationService),
    __param(4, ICommandService),
    __param(5, IFileService),
    __param(6, ITextFileService),
    __param(7, IWorkspacesService),
    __param(8, IWorkbenchEnvironmentService),
    __param(9, IFileDialogService),
    __param(10, IDialogService),
    __param(11, IHostService),
    __param(12, IUriIdentityService),
    __param(13, IWorkspaceTrustManagementService),
    __param(14, IUserDataProfilesService),
    __param(15, IUserDataProfileService),
    __metadata("design:paramtypes", [Object, WorkspaceService, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], BrowserWorkspaceEditingService);
export { BrowserWorkspaceEditingService };
registerSingleton(IWorkspaceEditingService, BrowserWorkspaceEditingService, 1);
