import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService, IRelaunchHandler, IRelaunchOptions } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { AbstractUpdateService } from './abstractUpdateService.js';
export declare class DarwinUpdateService extends AbstractUpdateService implements IRelaunchHandler {
    private readonly telemetryService;
    private readonly disposables;
    private get onRawError();
    private get onRawUpdateNotAvailable();
    private get onRawUpdateAvailable();
    private get onRawUpdateDownloaded();
    constructor(lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, telemetryService: ITelemetryService, environmentMainService: IEnvironmentMainService, requestService: IRequestService, logService: ILogService, productService: IProductService);
    handleRelaunch(options?: IRelaunchOptions): boolean;
    protected initialize(): Promise<void>;
    private onError;
    protected buildUpdateFeedUrl(quality: string): string | undefined;
    protected doCheckForUpdates(context: any): void;
    private onUpdateAvailable;
    private onUpdateDownloaded;
    private onUpdateNotAvailable;
    protected doQuitAndInstall(): void;
    dispose(): void;
}
