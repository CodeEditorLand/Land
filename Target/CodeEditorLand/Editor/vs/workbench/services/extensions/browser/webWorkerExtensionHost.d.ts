import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IMessagePassingProtocol } from '../../../../base/parts/ipc/common/ipc.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { ILogService, ILoggerService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { LocalWebWorkerRunningLocation } from '../common/extensionRunningLocation.js';
import { ExtensionHostExtensions, ExtensionHostStartup, IExtensionHost } from '../common/extensions.js';
export interface IWebWorkerExtensionHostInitData {
    readonly extensions: ExtensionHostExtensions;
}
export interface IWebWorkerExtensionHostDataProvider {
    getInitData(): Promise<IWebWorkerExtensionHostInitData>;
}
export declare class WebWorkerExtensionHost extends Disposable implements IExtensionHost {
    readonly runningLocation: LocalWebWorkerRunningLocation;
    readonly startup: ExtensionHostStartup;
    private readonly _initDataProvider;
    private readonly _telemetryService;
    private readonly _contextService;
    private readonly _labelService;
    private readonly _logService;
    private readonly _loggerService;
    private readonly _environmentService;
    private readonly _userDataProfilesService;
    private readonly _productService;
    private readonly _layoutService;
    private readonly _storageService;
    readonly pid: null;
    readonly remoteAuthority: null;
    extensions: ExtensionHostExtensions | null;
    private readonly _onDidExit;
    readonly onExit: Event<[number, string | null]>;
    private _isTerminating;
    private _protocolPromise;
    private _protocol;
    private readonly _extensionHostLogsLocation;
    constructor(runningLocation: LocalWebWorkerRunningLocation, startup: ExtensionHostStartup, _initDataProvider: IWebWorkerExtensionHostDataProvider, _telemetryService: ITelemetryService, _contextService: IWorkspaceContextService, _labelService: ILabelService, _logService: ILogService, _loggerService: ILoggerService, _environmentService: IBrowserWorkbenchEnvironmentService, _userDataProfilesService: IUserDataProfilesService, _productService: IProductService, _layoutService: ILayoutService, _storageService: IStorageService);
    private _getWebWorkerExtensionHostIframeSrc;
    start(): Promise<IMessagePassingProtocol>;
    private _startInsideIframe;
    private _performHandshake;
    dispose(): void;
    getInspectPort(): undefined;
    enableInspectPort(): Promise<boolean>;
    private _createExtHostInitData;
}
