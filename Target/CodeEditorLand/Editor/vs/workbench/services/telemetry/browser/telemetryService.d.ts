import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILogService, ILoggerService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from '../../../../platform/telemetry/common/gdprTypings.js';
import { ITelemetryData, ITelemetryService, TelemetryLevel } from '../../../../platform/telemetry/common/telemetry.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
export declare class TelemetryService extends Disposable implements ITelemetryService {
    readonly _serviceBrand: undefined;
    private impl;
    readonly sendErrorTelemetry = true;
    get sessionId(): string;
    get machineId(): string;
    get sqmId(): string;
    get devDeviceId(): string;
    get firstSessionDate(): string;
    get msftInternal(): boolean | undefined;
    constructor(environmentService: IBrowserWorkbenchEnvironmentService, logService: ILogService, loggerService: ILoggerService, configurationService: IConfigurationService, storageService: IStorageService, productService: IProductService, remoteAgentService: IRemoteAgentService);
    private initializeService;
    setExperimentProperty(name: string, value: string): void;
    get telemetryLevel(): TelemetryLevel;
    publicLog(eventName: string, data?: ITelemetryData): void;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
    publicLogError(errorEventName: string, data?: ITelemetryData): void;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
}
