import { Disposable } from '../../base/common/lifecycle.js';
import { IProcessEnvironment } from '../../base/common/platform.js';
import { Server as NodeIPCServer } from '../../base/parts/ipc/node/ipc.net.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../platform/environment/electron-main/environmentMainService.js';
import { IFileService } from '../../platform/files/common/files.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { ILifecycleMainService } from '../../platform/lifecycle/electron-main/lifecycleMainService.js';
import { ILoggerService, ILogService } from '../../platform/log/common/log.js';
import { IProductService } from '../../platform/product/common/productService.js';
import { IStateService } from '../../platform/state/node/state.js';
import { IUserDataProfilesMainService } from '../../platform/userDataProfile/electron-main/userDataProfile.js';
/**
 * The main VS Code application. There will only ever be one instance,
 * even if the user starts many instances (e.g. from the command line).
 */
export declare class CodeApplication extends Disposable {
    private readonly mainProcessNodeIpcServer;
    private readonly userEnv;
    private readonly mainInstantiationService;
    private readonly logService;
    private readonly loggerService;
    private readonly environmentMainService;
    private readonly lifecycleMainService;
    private readonly configurationService;
    private readonly stateService;
    private readonly fileService;
    private readonly productService;
    private readonly userDataProfilesMainService;
    private static readonly SECURITY_PROTOCOL_HANDLING_CONFIRMATION_SETTING_KEY;
    private windowsMainService;
    private auxiliaryWindowsMainService;
    private nativeHostMainService;
    constructor(mainProcessNodeIpcServer: NodeIPCServer, userEnv: IProcessEnvironment, mainInstantiationService: IInstantiationService, logService: ILogService, loggerService: ILoggerService, environmentMainService: IEnvironmentMainService, lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, stateService: IStateService, fileService: IFileService, productService: IProductService, userDataProfilesMainService: IUserDataProfilesMainService);
    private configureSession;
    private registerListeners;
    private onUnexpectedError;
    startup(): Promise<void>;
    private setupProtocolUrlHandlers;
    private setupManagedRemoteResourceUrlHandler;
    private resolveInitialProtocolUrls;
    private shouldBlockOpenable;
    private getWindowOpenableFromProtocolUrl;
    private handleProtocolUrl;
    private setupSharedProcess;
    private initServices;
    private initChannels;
    private openFirstWindow;
    private afterWindowOpen;
    private installMutex;
    private resolveShellEnvironment;
    private updateCrashReporterEnablement;
}
