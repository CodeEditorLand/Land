import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IProductService } from '../../product/common/productService.js';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from './gdprTypings.js';
import { ITelemetryData, ITelemetryService, TelemetryLevel } from './telemetry.js';
import { ITelemetryServiceConfig, TelemetryService } from './telemetryService.js';
export interface IServerTelemetryService extends ITelemetryService {
    updateInjectedTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
}
export declare class ServerTelemetryService extends TelemetryService implements IServerTelemetryService {
    private _injectedTelemetryLevel;
    constructor(config: ITelemetryServiceConfig, injectedTelemetryLevel: TelemetryLevel, _configurationService: IConfigurationService, _productService: IProductService);
    publicLog(eventName: string, data?: ITelemetryData): void;
    publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
    publicLogError(errorEventName: string, data?: ITelemetryData): void | Promise<undefined>;
    publicLogError2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void | Promise<undefined>;
    updateInjectedTelemetryLevel(telemetryLevel: TelemetryLevel): Promise<void>;
}
export declare const ServerNullTelemetryService: {
    updateInjectedTelemetryLevel(): Promise<void>;
    readonly _serviceBrand: undefined;
    readonly telemetryLevel: TelemetryLevel.NONE;
    readonly sessionId: "someValue.sessionId";
    readonly machineId: "someValue.machineId";
    readonly sqmId: "someValue.sqmId";
    readonly devDeviceId: "someValue.devDeviceId";
    readonly firstSessionDate: "someValue.firstSessionDate";
    readonly sendErrorTelemetry: false;
    publicLog(): void;
    publicLog2(): void;
    publicLogError(): void;
    publicLogError2(): void;
    setExperimentProperty(): void;
};
export declare const IServerTelemetryService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IServerTelemetryService>;
