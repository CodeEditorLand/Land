import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IProductService } from '../../product/common/productService.js';
import { ICustomEndpointTelemetryService, ITelemetryData, ITelemetryEndpoint, ITelemetryService, TelemetryLevel } from './telemetry.js';
export declare class TelemetryTrustedValue<T> {
    readonly value: T;
    readonly isTrustedTelemetryValue = true;
    constructor(value: T);
}
export declare class NullTelemetryServiceShape implements ITelemetryService {
    readonly _serviceBrand: undefined;
    readonly telemetryLevel = TelemetryLevel.NONE;
    readonly sessionId = "someValue.sessionId";
    readonly machineId = "someValue.machineId";
    readonly sqmId = "someValue.sqmId";
    readonly devDeviceId = "someValue.devDeviceId";
    readonly firstSessionDate = "someValue.firstSessionDate";
    readonly sendErrorTelemetry = false;
    publicLog(): void;
    publicLog2(): void;
    publicLogError(): void;
    publicLogError2(): void;
    setExperimentProperty(): void;
}
export declare const NullTelemetryService: NullTelemetryServiceShape;
export declare class NullEndpointTelemetryService implements ICustomEndpointTelemetryService {
    _serviceBrand: undefined;
    publicLog(_endpoint: ITelemetryEndpoint, _eventName: string, _data?: ITelemetryData): Promise<void>;
    publicLogError(_endpoint: ITelemetryEndpoint, _errorEventName: string, _data?: ITelemetryData): Promise<void>;
}
export declare const telemetryLogId = "telemetry";
export declare const extensionTelemetryLogChannelId = "extensionTelemetryLog";
export interface ITelemetryAppender {
    log(eventName: string, data: any): void;
    flush(): Promise<void>;
}
export declare const NullAppender: ITelemetryAppender;
export interface URIDescriptor {
    mimeType?: string;
    scheme?: string;
    ext?: string;
    path?: string;
}
export declare function supportsTelemetry(productService: IProductService, environmentService: IEnvironmentService): boolean;
export declare function isLoggingOnly(productService: IProductService, environmentService: IEnvironmentService): boolean;
export declare function getTelemetryLevel(configurationService: IConfigurationService): TelemetryLevel;
export interface Properties {
    [key: string]: string;
}
export interface Measurements {
    [key: string]: number;
}
export declare function validateTelemetryData(data?: any): {
    properties: Properties;
    measurements: Measurements;
};
export declare function cleanRemoteAuthority(remoteAuthority?: string): string;
export declare function isInternalTelemetry(productService: IProductService, configService: IConfigurationService): boolean;
interface IPathEnvironment {
    appRoot: string;
    extensionsPath: string;
    userDataPath: string;
    userHome: URI;
    tmpDir: URI;
}
export declare function getPiiPathsFromEnvironment(paths: IPathEnvironment): string[];
export declare function cleanData(data: Record<string, any>, cleanUpPatterns: RegExp[]): Record<string, any>;
export {};
