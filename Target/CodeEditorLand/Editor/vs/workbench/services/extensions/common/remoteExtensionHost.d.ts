import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IMessagePassingProtocol } from '../../../../base/parts/ipc/common/ipc.js';
import { IExtensionHostDebugService } from '../../../../platform/debug/common/extensionHostDebug.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService, ILoggerService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IRemoteAuthorityResolverService, IRemoteConnectionData } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IRemoteSocketFactoryService } from '../../../../platform/remote/common/remoteSocketFactoryService.js';
import { ISignService } from '../../../../platform/sign/common/sign.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { RemoteRunningLocation } from './extensionRunningLocation.js';
import { ExtensionHostExtensions, ExtensionHostStartup, IExtensionHost } from './extensions.js';
export interface IRemoteExtensionHostInitData {
    readonly connectionData: IRemoteConnectionData | null;
    readonly pid: number;
    readonly appRoot: URI;
    readonly extensionHostLogsPath: URI;
    readonly globalStorageHome: URI;
    readonly workspaceStorageHome: URI;
    readonly extensions: ExtensionHostExtensions;
}
export interface IRemoteExtensionHostDataProvider {
    readonly remoteAuthority: string;
    getInitData(): Promise<IRemoteExtensionHostInitData>;
}
export declare class RemoteExtensionHost extends Disposable implements IExtensionHost {
    readonly runningLocation: RemoteRunningLocation;
    private readonly _initDataProvider;
    private readonly remoteSocketFactoryService;
    private readonly _contextService;
    private readonly _environmentService;
    private readonly _telemetryService;
    private readonly _logService;
    protected readonly _loggerService: ILoggerService;
    private readonly _labelService;
    private readonly remoteAuthorityResolverService;
    private readonly _extensionHostDebugService;
    private readonly _productService;
    private readonly _signService;
    readonly pid: null;
    readonly remoteAuthority: string;
    readonly startup = ExtensionHostStartup.EagerAutoStart;
    extensions: ExtensionHostExtensions | null;
    private _onExit;
    readonly onExit: Event<[number, string | null]>;
    private _protocol;
    private _hasLostConnection;
    private _terminating;
    private _hasDisconnected;
    private readonly _isExtensionDevHost;
    constructor(runningLocation: RemoteRunningLocation, _initDataProvider: IRemoteExtensionHostDataProvider, remoteSocketFactoryService: IRemoteSocketFactoryService, _contextService: IWorkspaceContextService, _environmentService: IWorkbenchEnvironmentService, _telemetryService: ITelemetryService, _logService: ILogService, _loggerService: ILoggerService, _labelService: ILabelService, remoteAuthorityResolverService: IRemoteAuthorityResolverService, _extensionHostDebugService: IExtensionHostDebugService, _productService: IProductService, _signService: ISignService);
    start(): Promise<IMessagePassingProtocol>;
    private _onExtHostConnectionLost;
    private _createExtHostInitData;
    getInspectPort(): undefined;
    enableInspectPort(): Promise<boolean>;
    disconnect(): Promise<void>;
    dispose(): void;
}
