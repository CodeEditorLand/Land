import { ITunnelService } from '../../../../platform/tunnel/common/tunnel.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IRemoteExplorerService } from '../../../services/remote/common/remoteExplorerService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
export declare class TunnelFactoryContribution extends Disposable implements IWorkbenchContribution {
    private openerService;
    static readonly ID = "workbench.contrib.tunnelFactory";
    constructor(tunnelService: ITunnelService, environmentService: IBrowserWorkbenchEnvironmentService, openerService: IOpenerService, remoteExplorerService: IRemoteExplorerService, logService: ILogService, contextKeyService: IContextKeyService);
    private resolveExternalUri;
}
