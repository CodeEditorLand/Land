import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { INativeHostMainService } from '../../native/electron-main/nativeHostMainService.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { AvailableForDownload } from '../common/update.js';
import { AbstractUpdateService } from './abstractUpdateService.js';
export declare class LinuxUpdateService extends AbstractUpdateService {
    private readonly telemetryService;
    private readonly nativeHostMainService;
    constructor(lifecycleMainService: ILifecycleMainService, configurationService: IConfigurationService, telemetryService: ITelemetryService, environmentMainService: IEnvironmentMainService, requestService: IRequestService, logService: ILogService, nativeHostMainService: INativeHostMainService, productService: IProductService);
    protected buildUpdateFeedUrl(quality: string): string;
    protected doCheckForUpdates(context: any): void;
    protected doDownloadUpdate(state: AvailableForDownload): Promise<void>;
}
