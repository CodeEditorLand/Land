/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ILoggerService, ILogService, isLogLevel, log, LogLevelToString, parseLogLevel } from '../../../platform/log/common/log.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { URI } from '../../../base/common/uri.js';
import { CommandsRegistry } from '../../../platform/commands/common/commands.js';
import { IEnvironmentService } from '../../../platform/environment/common/environment.js';
let MainThreadLoggerService = class MainThreadLoggerService {
    constructor(extHostContext, loggerService) {
        this.loggerService = loggerService;
        this.disposables = new DisposableStore();
        const proxy = extHostContext.getProxy(ExtHostContext.ExtHostLogLevelServiceShape);
        this.disposables.add(loggerService.onDidChangeLogLevel(arg => {
            if (isLogLevel(arg)) {
                proxy.$setLogLevel(arg);
            }
            else {
                proxy.$setLogLevel(arg[1], arg[0]);
            }
        }));
    }
    $log(file, messages) {
        const logger = this.loggerService.getLogger(URI.revive(file));
        if (!logger) {
            throw new Error('Create the logger before logging');
        }
        for (const [level, message] of messages) {
            log(logger, level, message);
        }
    }
    async $createLogger(file, options) {
        this.loggerService.createLogger(URI.revive(file), options);
    }
    async $registerLogger(logResource) {
        this.loggerService.registerLogger({
            ...logResource,
            resource: URI.revive(logResource.resource)
        });
    }
    async $deregisterLogger(resource) {
        this.loggerService.deregisterLogger(URI.revive(resource));
    }
    async $setVisibility(resource, visible) {
        this.loggerService.setVisibility(URI.revive(resource), visible);
    }
    $flush(file) {
        const logger = this.loggerService.getLogger(URI.revive(file));
        if (!logger) {
            throw new Error('Create the logger before flushing');
        }
        logger.flush();
    }
    dispose() {
        this.disposables.dispose();
    }
};
MainThreadLoggerService = __decorate([
    extHostNamedCustomer(MainContext.MainThreadLogger),
    __param(1, ILoggerService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadLoggerService);
export { MainThreadLoggerService };
// --- Internal commands to improve extension test runs
CommandsRegistry.registerCommand('_extensionTests.setLogLevel', function (accessor, level) {
    const loggerService = accessor.get(ILoggerService);
    const environmentService = accessor.get(IEnvironmentService);
    if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
        const logLevel = parseLogLevel(level);
        if (logLevel !== undefined) {
            loggerService.setLogLevel(logLevel);
        }
    }
});
CommandsRegistry.registerCommand('_extensionTests.getLogLevel', function (accessor) {
    const logService = accessor.get(ILogService);
    return LogLevelToString(logService.getLevel());
});
