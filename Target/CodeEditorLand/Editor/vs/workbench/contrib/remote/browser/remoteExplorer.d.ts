import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IRemoteExplorerService } from '../../../services/remote/common/remoteExplorerService.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IStatusbarService } from '../../../services/statusbar/browser/statusbar.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { ITerminalService } from '../../terminal/browser/terminal.js';
import { IDebugService } from '../../debug/common/debug.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
import { ITunnelService } from '../../../../platform/tunnel/common/tunnel.js';
import { IActivityService } from '../../../services/activity/common/activity.js';
import { IExternalUriOpenerService } from '../../externalUriOpener/common/externalUriOpenerService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchConfigurationService } from '../../../services/configuration/common/configuration.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare const VIEWLET_ID = "workbench.view.remote";
export declare class ForwardedPortsView extends Disposable implements IWorkbenchContribution {
    private readonly contextKeyService;
    private readonly environmentService;
    private readonly remoteExplorerService;
    private readonly tunnelService;
    private readonly activityService;
    private readonly statusbarService;
    private readonly contextKeyListener;
    private readonly activityBadge;
    private entryAccessor;
    constructor(contextKeyService: IContextKeyService, environmentService: IWorkbenchEnvironmentService, remoteExplorerService: IRemoteExplorerService, tunnelService: ITunnelService, activityService: IActivityService, statusbarService: IStatusbarService);
    private getViewContainer;
    private enableForwardedPortsFeatures;
    private enableBadgeAndStatusBar;
    private updateActivityBadge;
    private updateStatusBar;
    private get entry();
}
export declare class PortRestore implements IWorkbenchContribution {
    private readonly remoteExplorerService;
    private readonly logService;
    constructor(remoteExplorerService: IRemoteExplorerService, logService: ILogService);
    private restore;
}
export declare class AutomaticPortForwarding extends Disposable implements IWorkbenchContribution {
    private readonly terminalService;
    private readonly notificationService;
    private readonly openerService;
    private readonly externalOpenerService;
    private readonly remoteExplorerService;
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly debugService;
    private readonly tunnelService;
    private readonly hostService;
    private readonly logService;
    private readonly storageService;
    private readonly preferencesService;
    private procForwarder;
    private outputForwarder;
    private portListener;
    constructor(terminalService: ITerminalService, notificationService: INotificationService, openerService: IOpenerService, externalOpenerService: IExternalUriOpenerService, remoteExplorerService: IRemoteExplorerService, environmentService: IWorkbenchEnvironmentService, contextKeyService: IContextKeyService, configurationService: IWorkbenchConfigurationService, debugService: IDebugService, remoteAgentService: IRemoteAgentService, tunnelService: ITunnelService, hostService: IHostService, logService: ILogService, storageService: IStorageService, preferencesService: IPreferencesService);
    private getPortAutoFallbackNumber;
    private listenForPorts;
    private setup;
}
