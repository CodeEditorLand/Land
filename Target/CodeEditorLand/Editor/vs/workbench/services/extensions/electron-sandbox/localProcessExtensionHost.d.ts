import { Event } from '../../../../base/common/event.js';
import { IMessagePassingProtocol } from '../../../../base/parts/ipc/common/ipc.js';
import { IExtensionHostDebugService } from '../../../../platform/debug/common/extensionHostDebug.js';
import { IExtensionHostProcessOptions, IExtensionHostStarter } from '../../../../platform/extensions/common/extensionHostStarter.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService, ILoggerService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IShellEnvironmentService } from '../../environment/electron-sandbox/shellEnvironmentService.js';
import { LocalProcessRunningLocation } from '../common/extensionRunningLocation.js';
import { ExtensionHostExtensions, ExtensionHostStartup, IExtensionHost } from '../common/extensions.js';
import { IHostService } from '../../host/browser/host.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
export interface ILocalProcessExtensionHostInitData {
    readonly extensions: ExtensionHostExtensions;
}
export interface ILocalProcessExtensionHostDataProvider {
    getInitData(): Promise<ILocalProcessExtensionHostInitData>;
}
export declare class ExtensionHostProcess {
    private readonly _extensionHostStarter;
    private readonly _id;
    get onStdout(): Event<string>;
    get onStderr(): Event<string>;
    get onMessage(): Event<any>;
    get onExit(): Event<{
        code: number;
        signal: string;
    }>;
    constructor(id: string, _extensionHostStarter: IExtensionHostStarter);
    start(opts: IExtensionHostProcessOptions): Promise<{
        pid: number | undefined;
    }>;
    enableInspectPort(): Promise<boolean>;
    kill(): Promise<void>;
}
export declare class NativeLocalProcessExtensionHost implements IExtensionHost {
    readonly runningLocation: LocalProcessRunningLocation;
    readonly startup: ExtensionHostStartup.EagerAutoStart | ExtensionHostStartup.EagerManualStart;
    private readonly _initDataProvider;
    private readonly _contextService;
    private readonly _notificationService;
    private readonly _nativeHostService;
    private readonly _lifecycleService;
    private readonly _environmentService;
    private readonly _userDataProfilesService;
    private readonly _telemetryService;
    private readonly _logService;
    private readonly _loggerService;
    private readonly _labelService;
    private readonly _extensionHostDebugService;
    private readonly _hostService;
    private readonly _productService;
    private readonly _shellEnvironmentService;
    private readonly _extensionHostStarter;
    pid: number | null;
    readonly remoteAuthority: null;
    extensions: ExtensionHostExtensions | null;
    private readonly _onExit;
    readonly onExit: Event<[number, string]>;
    private readonly _onDidSetInspectPort;
    private readonly _toDispose;
    private readonly _isExtensionDevHost;
    private readonly _isExtensionDevDebug;
    private readonly _isExtensionDevDebugBrk;
    private readonly _isExtensionDevTestFromCli;
    private _terminating;
    private _inspectListener;
    private _extensionHostProcess;
    private _messageProtocol;
    constructor(runningLocation: LocalProcessRunningLocation, startup: ExtensionHostStartup.EagerAutoStart | ExtensionHostStartup.EagerManualStart, _initDataProvider: ILocalProcessExtensionHostDataProvider, _contextService: IWorkspaceContextService, _notificationService: INotificationService, _nativeHostService: INativeHostService, _lifecycleService: ILifecycleService, _environmentService: INativeWorkbenchEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _telemetryService: ITelemetryService, _logService: ILogService, _loggerService: ILoggerService, _labelService: ILabelService, _extensionHostDebugService: IExtensionHostDebugService, _hostService: IHostService, _productService: IProductService, _shellEnvironmentService: IShellEnvironmentService, _extensionHostStarter: IExtensionHostStarter);
    dispose(): void;
    start(): Promise<IMessagePassingProtocol>;
    private _start;
    private _tryFindDebugPort;
    private _establishProtocol;
    private _performHandshake;
    private _createExtHostInitData;
    private _onExtHostProcessExit;
    private _handleProcessOutputStream;
    enableInspectPort(): Promise<boolean>;
    getInspectPort(): {
        port: number;
        host: string;
    } | undefined;
    private _onWillShutdown;
}
