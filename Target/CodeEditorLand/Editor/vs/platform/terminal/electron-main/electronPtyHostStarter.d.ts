import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IReconnectConstants } from '../common/terminal.js';
import { IPtyHostConnection, IPtyHostStarter } from '../node/ptyHost.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
export declare class ElectronPtyHostStarter extends Disposable implements IPtyHostStarter {
    private readonly _reconnectConstants;
    private readonly _configurationService;
    private readonly _environmentMainService;
    private readonly _lifecycleMainService;
    private readonly _logService;
    private utilityProcess;
    private readonly _onRequestConnection;
    readonly onRequestConnection: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    private readonly _onWillShutdown;
    readonly onWillShutdown: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    constructor(_reconnectConstants: IReconnectConstants, _configurationService: IConfigurationService, _environmentMainService: IEnvironmentMainService, _lifecycleMainService: ILifecycleMainService, _logService: ILogService);
    start(): IPtyHostConnection;
    private _createPtyHostConfiguration;
    private _onWindowConnection;
}
