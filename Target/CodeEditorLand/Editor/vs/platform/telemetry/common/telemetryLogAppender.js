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
import { Disposable } from '../../../base/common/lifecycle.js';
import { localize } from '../../../nls.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { ILogService, ILoggerService, LogLevel } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { isLoggingOnly, supportsTelemetry, telemetryLogId, validateTelemetryData } from './telemetryUtils.js';
let TelemetryLogAppender = class TelemetryLogAppender extends Disposable {
    constructor(logService, loggerService, environmentService, productService, prefix = '') {
        super();
        this.prefix = prefix;
        const logger = loggerService.getLogger(telemetryLogId);
        if (logger) {
            this.logger = this._register(logger);
        }
        else {
            const justLoggingAndNotSending = isLoggingOnly(productService, environmentService);
            const logSuffix = justLoggingAndNotSending ? ' (Not Sent)' : '';
            const isVisible = () => supportsTelemetry(productService, environmentService) && logService.getLevel() === LogLevel.Trace;
            this.logger = this._register(loggerService.createLogger(telemetryLogId, { name: localize('telemetryLog', "Telemetry{0}", logSuffix), hidden: !isVisible() }));
            this._register(logService.onDidChangeLogLevel(() => loggerService.setVisibility(telemetryLogId, isVisible())));
            this.logger.info('Below are logs for every telemetry event sent from VS Code once the log level is set to trace.');
            this.logger.info('===========================================================');
        }
    }
    flush() {
        return Promise.resolve();
    }
    log(eventName, data) {
        this.logger.trace(`${this.prefix}telemetry/${eventName}`, validateTelemetryData(data));
    }
};
TelemetryLogAppender = __decorate([
    __param(0, ILogService),
    __param(1, ILoggerService),
    __param(2, IEnvironmentService),
    __param(3, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, String])
], TelemetryLogAppender);
export { TelemetryLogAppender };
