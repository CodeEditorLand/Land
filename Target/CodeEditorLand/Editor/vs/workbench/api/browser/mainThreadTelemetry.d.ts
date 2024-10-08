import { Disposable } from '../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { IEnvironmentService } from '../../../platform/environment/common/environment.js';
import { IProductService } from '../../../platform/product/common/productService.js';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from '../../../platform/telemetry/common/gdprTypings.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadTelemetryShape } from '../common/extHost.protocol.js';
export declare class MainThreadTelemetry extends Disposable implements MainThreadTelemetryShape {
    private readonly _telemetryService;
    private readonly _configurationService;
    private readonly _environmentService;
    private readonly _productService;
    private readonly _proxy;
    private static readonly _name;
    constructor(extHostContext: IExtHostContext, _telemetryService: ITelemetryService, _configurationService: IConfigurationService, _environmentService: IEnvironmentService, _productService: IProductService);
    private get telemetryLevel();
    $publicLog(eventName: string, data?: any): void;
    $publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
}
