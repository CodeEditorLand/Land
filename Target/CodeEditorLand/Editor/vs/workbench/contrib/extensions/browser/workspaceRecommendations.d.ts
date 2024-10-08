import { ExtensionRecommendations, ExtensionRecommendation } from './extensionRecommendations.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkspaceExtensionsConfigService } from '../../../services/extensionRecommendations/common/workspaceExtensionsConfig.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkbenchExtensionManagementService } from '../../../services/extensionManagement/common/extensionManagement.js';
export declare class WorkspaceRecommendations extends ExtensionRecommendations {
    private readonly workspaceExtensionsConfigService;
    private readonly contextService;
    private readonly uriIdentityService;
    private readonly fileService;
    private readonly workbenchExtensionManagementService;
    private readonly notificationService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    private _onDidChangeRecommendations;
    readonly onDidChangeRecommendations: import("../../../workbench.web.main.internal.js").Event<void>;
    private _ignoredRecommendations;
    get ignoredRecommendations(): ReadonlyArray<string>;
    private workspaceExtensions;
    private readonly onDidChangeWorkspaceExtensionsScheduler;
    constructor(workspaceExtensionsConfigService: IWorkspaceExtensionsConfigService, contextService: IWorkspaceContextService, uriIdentityService: IUriIdentityService, fileService: IFileService, workbenchExtensionManagementService: IWorkbenchExtensionManagementService, notificationService: INotificationService);
    protected doActivate(): Promise<void>;
    private onDidChangeWorkspaceExtensionsFolders;
    private fetchWorkspaceExtensions;
    /**
     * Parse all extensions.json files, fetch workspace recommendations, filter out invalid and unwanted ones
     */
    private fetch;
    private validateExtensions;
    private onDidChangeExtensionsConfigs;
}
