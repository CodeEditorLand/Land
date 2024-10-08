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
import { ILogService, ILoggerService, LogLevelToString, getLogLevel, parseLogLevel } from '../../../../platform/log/common/log.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IFileService, toFileOperationResult } from '../../../../platform/files/common/files.js';
import { IJSONEditingService } from '../../../services/configuration/common/jsonEditing.js';
import { isString, isUndefined } from '../../../../base/common/types.js';
import { EXTENSION_IDENTIFIER_WITH_LOG_REGEX } from '../../../../platform/environment/common/environmentService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { parse } from '../../../../base/common/json.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../base/common/event.js';
export const IDefaultLogLevelsService = createDecorator('IDefaultLogLevelsService');
let DefaultLogLevelsService = class DefaultLogLevelsService extends Disposable {
    constructor(environmentService, fileService, jsonEditingService, logService, loggerService) {
        super();
        this.environmentService = environmentService;
        this.fileService = fileService;
        this.jsonEditingService = jsonEditingService;
        this.logService = logService;
        this.loggerService = loggerService;
        this._onDidChangeDefaultLogLevels = this._register(new Emitter);
        this.onDidChangeDefaultLogLevels = this._onDidChangeDefaultLogLevels.event;
    }
    async getDefaultLogLevels() {
        const argvLogLevel = await this._parseLogLevelsFromArgv();
        return {
            default: argvLogLevel?.default ?? this._getDefaultLogLevelFromEnv(),
            extensions: argvLogLevel?.extensions ?? this._getExtensionsDefaultLogLevelsFromEnv()
        };
    }
    async getDefaultLogLevel(extensionId) {
        const argvLogLevel = await this._parseLogLevelsFromArgv() ?? {};
        if (extensionId) {
            extensionId = extensionId.toLowerCase();
            return this._getDefaultLogLevel(argvLogLevel, extensionId);
        }
        else {
            return this._getDefaultLogLevel(argvLogLevel);
        }
    }
    async setDefaultLogLevel(defaultLogLevel, extensionId) {
        const argvLogLevel = await this._parseLogLevelsFromArgv() ?? {};
        if (extensionId) {
            extensionId = extensionId.toLowerCase();
            const currentDefaultLogLevel = this._getDefaultLogLevel(argvLogLevel, extensionId);
            argvLogLevel.extensions = argvLogLevel.extensions ?? [];
            const extension = argvLogLevel.extensions.find(([extension]) => extension === extensionId);
            if (extension) {
                extension[1] = defaultLogLevel;
            }
            else {
                argvLogLevel.extensions.push([extensionId, defaultLogLevel]);
            }
            await this._writeLogLevelsToArgv(argvLogLevel);
            const extensionLoggers = [...this.loggerService.getRegisteredLoggers()].filter(logger => logger.extensionId && logger.extensionId.toLowerCase() === extensionId);
            for (const { resource } of extensionLoggers) {
                if (this.loggerService.getLogLevel(resource) === currentDefaultLogLevel) {
                    this.loggerService.setLogLevel(resource, defaultLogLevel);
                }
            }
        }
        else {
            const currentLogLevel = this._getDefaultLogLevel(argvLogLevel);
            argvLogLevel.default = defaultLogLevel;
            await this._writeLogLevelsToArgv(argvLogLevel);
            if (this.loggerService.getLogLevel() === currentLogLevel) {
                this.loggerService.setLogLevel(defaultLogLevel);
            }
        }
        this._onDidChangeDefaultLogLevels.fire();
    }
    _getDefaultLogLevel(argvLogLevels, extension) {
        if (extension) {
            const extensionLogLevel = argvLogLevels.extensions?.find(([extensionId]) => extensionId === extension);
            if (extensionLogLevel) {
                return extensionLogLevel[1];
            }
        }
        return argvLogLevels.default ?? getLogLevel(this.environmentService);
    }
    async _writeLogLevelsToArgv(logLevels) {
        const logLevelsValue = [];
        if (!isUndefined(logLevels.default)) {
            logLevelsValue.push(LogLevelToString(logLevels.default));
        }
        for (const [extension, logLevel] of logLevels.extensions ?? []) {
            logLevelsValue.push(`${extension}=${LogLevelToString(logLevel)}`);
        }
        await this.jsonEditingService.write(this.environmentService.argvResource, [{ path: ['log-level'], value: logLevelsValue.length ? logLevelsValue : undefined }], true);
    }
    async _parseLogLevelsFromArgv() {
        const result = { extensions: [] };
        const logLevels = await this._readLogLevelsFromArgv();
        for (const extensionLogLevel of logLevels) {
            const matches = EXTENSION_IDENTIFIER_WITH_LOG_REGEX.exec(extensionLogLevel);
            if (matches && matches[1] && matches[2]) {
                const logLevel = parseLogLevel(matches[2]);
                if (!isUndefined(logLevel)) {
                    result.extensions?.push([matches[1].toLowerCase(), logLevel]);
                }
            }
            else {
                const logLevel = parseLogLevel(extensionLogLevel);
                if (!isUndefined(logLevel)) {
                    result.default = logLevel;
                }
            }
        }
        return !isUndefined(result.default) || result.extensions?.length ? result : undefined;
    }
    async migrateLogLevels() {
        const logLevels = await this._readLogLevelsFromArgv();
        const regex = /^([^.]+\..+):(.+)$/;
        if (logLevels.some(extensionLogLevel => regex.test(extensionLogLevel))) {
            const argvLogLevel = await this._parseLogLevelsFromArgv();
            if (argvLogLevel) {
                await this._writeLogLevelsToArgv(argvLogLevel);
            }
        }
    }
    async _readLogLevelsFromArgv() {
        try {
            const content = await this.fileService.readFile(this.environmentService.argvResource);
            const argv = parse(content.value.toString());
            return isString(argv['log-level']) ? [argv['log-level']] : Array.isArray(argv['log-level']) ? argv['log-level'] : [];
        }
        catch (error) {
            if (toFileOperationResult(error) !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                this.logService.error(error);
            }
        }
        return [];
    }
    _getDefaultLogLevelFromEnv() {
        return getLogLevel(this.environmentService);
    }
    _getExtensionsDefaultLogLevelsFromEnv() {
        const result = [];
        for (const [extension, logLevelValue] of this.environmentService.extensionLogLevel ?? []) {
            const logLevel = parseLogLevel(logLevelValue);
            if (!isUndefined(logLevel)) {
                result.push([extension, logLevel]);
            }
        }
        return result;
    }
};
DefaultLogLevelsService = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, IFileService),
    __param(2, IJSONEditingService),
    __param(3, ILogService),
    __param(4, ILoggerService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], DefaultLogLevelsService);
registerSingleton(IDefaultLogLevelsService, DefaultLogLevelsService, 1 /* InstantiationType.Delayed */);
