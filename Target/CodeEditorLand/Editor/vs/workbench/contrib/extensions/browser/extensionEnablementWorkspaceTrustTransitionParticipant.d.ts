import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkspaceTrustEnablementService, IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IHostService } from '../../../services/host/browser/host.js';
export declare class ExtensionEnablementWorkspaceTrustTransitionParticipant extends Disposable implements IWorkbenchContribution {
    constructor(extensionService: IExtensionService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService, extensionEnablementService: IWorkbenchExtensionEnablementService, workspaceTrustEnablementService: IWorkspaceTrustEnablementService, workspaceTrustManagementService: IWorkspaceTrustManagementService);
}
