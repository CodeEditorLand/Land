import { createDecorator } from '../../instantiation/common/instantiation.js';
export var WorkspaceTrustScope;
(function (WorkspaceTrustScope) {
    WorkspaceTrustScope[WorkspaceTrustScope["Local"] = 0] = "Local";
    WorkspaceTrustScope[WorkspaceTrustScope["Remote"] = 1] = "Remote";
})(WorkspaceTrustScope || (WorkspaceTrustScope = {}));
export const IWorkspaceTrustEnablementService = createDecorator('workspaceTrustEnablementService');
export const IWorkspaceTrustManagementService = createDecorator('workspaceTrustManagementService');
export const IWorkspaceTrustRequestService = createDecorator('workspaceTrustRequestService');
