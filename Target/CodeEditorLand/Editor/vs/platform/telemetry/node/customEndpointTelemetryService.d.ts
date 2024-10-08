import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { ILogService, ILoggerService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { ICustomEndpointTelemetryService, ITelemetryData, ITelemetryEndpoint, ITelemetryService } from '../common/telemetry.js';
export declare class CustomEndpointTelemetryService implements ICustomEndpointTelemetryService {
    private readonly configurationService;
    private readonly telemetryService;
    private readonly logService;
    private readonly loggerService;
    private readonly environmentService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    private customTelemetryServices;
    constructor(configurationService: IConfigurationService, telemetryService: ITelemetryService, logService: ILogService, loggerService: ILoggerService, environmentService: IEnvironmentService, productService: IProductService);
    private getCustomTelemetryService;
    publicLog(telemetryEndpoint: ITelemetryEndpoint, eventName: string, data?: ITelemetryData): void;
    publicLogError(telemetryEndpoint: ITelemetryEndpoint, errorEventName: string, data?: ITelemetryData): void;
}
