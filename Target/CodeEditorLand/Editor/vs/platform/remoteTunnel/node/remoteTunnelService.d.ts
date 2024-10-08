import { IRemoteTunnelSession, IRemoteTunnelService, TunnelStatus, TunnelMode, ActiveTunnelMode } from '../common/remoteTunnel.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILoggerService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { ISharedProcessLifecycleService } from '../../lifecycle/node/sharedProcessLifecycleService.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IStorageService } from '../../storage/common/storage.js';
/**
 * This service runs on the shared service. It is running the `code-tunnel` command
 * to make the current machine available for remote access.
 */
export declare class RemoteTunnelService extends Disposable implements IRemoteTunnelService {
    private readonly telemetryService;
    private readonly productService;
    private readonly environmentService;
    private readonly configurationService;
    private readonly storageService;
    readonly _serviceBrand: undefined;
    private readonly _onDidTokenFailedEmitter;
    readonly onDidTokenFailed: import("../../../workbench/workbench.web.main.internal.js").Event<IRemoteTunnelSession | undefined>;
    private readonly _onDidChangeTunnelStatusEmitter;
    readonly onDidChangeTunnelStatus: import("../../../workbench/workbench.web.main.internal.js").Event<TunnelStatus>;
    private readonly _onDidChangeModeEmitter;
    readonly onDidChangeMode: import("../../../workbench/workbench.web.main.internal.js").Event<TunnelMode>;
    private readonly _logger;
    /**
     * "Mode" in the terminal state we want to get to -- started, stopped, and
     * the attributes associated with each.
     *
     * At any given time, work may be ongoing to get `_tunnelStatus` into a
     * state that reflects the desired `mode`.
     */
    private _mode;
    private _tunnelProcess;
    private _tunnelStatus;
    private _startTunnelProcessDelayer;
    private _tunnelCommand;
    private _initialized;
    constructor(telemetryService: ITelemetryService, productService: IProductService, environmentService: INativeEnvironmentService, loggerService: ILoggerService, sharedProcessLifecycleService: ISharedProcessLifecycleService, configurationService: IConfigurationService, storageService: IStorageService);
    getTunnelStatus(): Promise<TunnelStatus>;
    private setTunnelStatus;
    private setMode;
    getMode(): Promise<TunnelMode>;
    initialize(mode: TunnelMode): Promise<TunnelStatus>;
    private readonly defaultOnOutput;
    private getTunnelCommandLocation;
    startTunnel(mode: ActiveTunnelMode): Promise<TunnelStatus>;
    stopTunnel(): Promise<void>;
    private updateTunnelProcess;
    private installTunnelService;
    private serverOrAttachTunnel;
    private runCodeTunnelCommand;
    getTunnelName(): Promise<string | undefined>;
    private _preventSleep;
    private _getTunnelName;
    private _restoreMode;
    private _storeMode;
}
