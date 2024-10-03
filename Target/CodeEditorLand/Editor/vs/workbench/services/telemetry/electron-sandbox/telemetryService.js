var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { supportsTelemetry, NullTelemetryService, getPiiPathsFromEnvironment, isInternalTelemetry } from '../../../../platform/telemetry/common/telemetryUtils.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-sandbox/services.js';
import { TelemetryAppenderClient } from '../../../../platform/telemetry/common/telemetryIpc.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { resolveWorkbenchCommonProperties } from '../common/workbenchCommonProperties.js';
import { TelemetryService as BaseTelemetryService } from '../../../../platform/telemetry/common/telemetryService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { process } from '../../../../base/parts/sandbox/electron-sandbox/globals.js';
let TelemetryService = class TelemetryService extends Disposable {
    get sessionId() { return this.impl.sessionId; }
    get machineId() { return this.impl.machineId; }
    get sqmId() { return this.impl.sqmId; }
    get devDeviceId() { return this.impl.devDeviceId; }
    get firstSessionDate() { return this.impl.firstSessionDate; }
    get msftInternal() { return this.impl.msftInternal; }
    constructor(environmentService, productService, sharedProcessService, storageService, configurationService) {
        super();
        if (supportsTelemetry(productService, environmentService)) {
            const isInternal = isInternalTelemetry(productService, configurationService);
            const channel = sharedProcessService.getChannel('telemetryAppender');
            const config = {
                appenders: [new TelemetryAppenderClient(channel)],
                commonProperties: resolveWorkbenchCommonProperties(storageService, environmentService.os.release, environmentService.os.hostname, productService.commit, productService.version, environmentService.machineId, environmentService.sqmId, environmentService.devDeviceId, isInternal, process, environmentService.remoteAuthority),
                piiPaths: getPiiPathsFromEnvironment(environmentService),
                sendErrorTelemetry: true
            };
            this.impl = this._register(new BaseTelemetryService(config, configurationService, productService));
        }
        else {
            this.impl = NullTelemetryService;
        }
        this.sendErrorTelemetry = this.impl.sendErrorTelemetry;
    }
    setExperimentProperty(name, value) {
        return this.impl.setExperimentProperty(name, value);
    }
    get telemetryLevel() {
        return this.impl.telemetryLevel;
    }
    publicLog(eventName, data) {
        this.impl.publicLog(eventName, data);
    }
    publicLog2(eventName, data) {
        this.publicLog(eventName, data);
    }
    publicLogError(errorEventName, data) {
        this.impl.publicLogError(errorEventName, data);
    }
    publicLogError2(eventName, data) {
        this.publicLogError(eventName, data);
    }
};
TelemetryService = __decorate([
    __param(0, INativeWorkbenchEnvironmentService),
    __param(1, IProductService),
    __param(2, ISharedProcessService),
    __param(3, IStorageService),
    __param(4, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TelemetryService);
export { TelemetryService };
registerSingleton(ITelemetryService, TelemetryService, 1);
