import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILoggerService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IRemoteTunnelService } from '../../../../platform/remoteTunnel/common/remoteTunnel.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IAuthenticationService } from '../../../services/authentication/common/authentication.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
export declare const REMOTE_TUNNEL_CATEGORY: import("../../../../nls.js").ILocalizedString;
type CONTEXT_KEY_STATES = 'connected' | 'connecting' | 'disconnected';
export declare const REMOTE_TUNNEL_CONNECTION_STATE_KEY = "remoteTunnelConnection";
export declare const REMOTE_TUNNEL_CONNECTION_STATE: RawContextKey<CONTEXT_KEY_STATES>;
export declare class RemoteTunnelWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    private readonly authenticationService;
    private readonly dialogService;
    private readonly extensionService;
    private readonly contextKeyService;
    private readonly storageService;
    private readonly quickInputService;
    private environmentService;
    private remoteTunnelService;
    private commandService;
    private workspaceContextService;
    private progressService;
    private notificationService;
    private readonly connectionStateContext;
    private readonly serverConfiguration;
    private connectionInfo;
    private readonly logger;
    private expiredSessions;
    constructor(authenticationService: IAuthenticationService, dialogService: IDialogService, extensionService: IExtensionService, contextKeyService: IContextKeyService, productService: IProductService, storageService: IStorageService, loggerService: ILoggerService, quickInputService: IQuickInputService, environmentService: INativeEnvironmentService, remoteTunnelService: IRemoteTunnelService, commandService: ICommandService, workspaceContextService: IWorkspaceContextService, progressService: IProgressService, notificationService: INotificationService);
    private handleTunnelStatusUpdate;
    private recommendRemoteExtensionIfNeeded;
    private initialize;
    private getPreferredTokenFromSession;
    private startTunnel;
    private getAuthenticationSession;
    private createExistingSessionItem;
    private createQuickpickItems;
    /**
     * Returns all authentication sessions available from {@link getAuthenticationProviders}.
     */
    private getAllSessions;
    private getSessionToken;
    /**
     * Returns all authentication providers which can be used to authenticate
     * to the remote storage service, based on product.json configuration
     * and registered authentication providers.
     */
    private getAuthenticationProviders;
    private registerCommands;
    private getLinkToOpen;
    private showManageOptions;
}
export {};
