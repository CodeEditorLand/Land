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
import * as nls from '../../../../nls.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { SetLogLevelAction } from './logsActions.js';
import { Extensions as WorkbenchExtensions } from '../../../common/contributions.js';
import { IFileService, whenProviderRegistered } from '../../../../platform/files/common/files.js';
import { IOutputService, Extensions } from '../../../services/output/common/output.js';
import { Disposable, DisposableMap, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { CONTEXT_LOG_LEVEL, ILogService, ILoggerService, LogLevelToString, isLogLevel } from '../../../../platform/log/common/log.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';
import { windowLogId, showWindowLogActionId } from '../../../services/log/common/logConstants.js';
import { createCancelablePromise, timeout } from '../../../../base/common/async.js';
import { CancellationError, getErrorMessage, isCancellationError } from '../../../../base/common/errors.js';
import { IDefaultLogLevelsService } from './defaultLogLevels.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { CounterSet } from '../../../../base/common/map.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { Schemas } from '../../../../base/common/network.js';
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: SetLogLevelAction.ID,
            title: SetLogLevelAction.TITLE,
            category: Categories.Developer,
            f1: true
        });
    }
    run(servicesAccessor) {
        return servicesAccessor.get(IInstantiationService).createInstance(SetLogLevelAction, SetLogLevelAction.ID, SetLogLevelAction.TITLE.value).run();
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.setDefaultLogLevel',
            title: nls.localize2('setDefaultLogLevel', "Set Default Log Level"),
            category: Categories.Developer,
        });
    }
    run(servicesAccessor, logLevel, extensionId) {
        return servicesAccessor.get(IDefaultLogLevelsService).setDefaultLogLevel(logLevel, extensionId);
    }
});
let LogOutputChannels = class LogOutputChannels extends Disposable {
    constructor(logService, loggerService, contextKeyService, fileService, uriIdentityService) {
        super();
        this.logService = logService;
        this.loggerService = loggerService;
        this.contextKeyService = contextKeyService;
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
        this.contextKeys = new CounterSet();
        this.outputChannelRegistry = Registry.as(Extensions.OutputChannels);
        this.loggerDisposables = this._register(new DisposableMap());
        const contextKey = CONTEXT_LOG_LEVEL.bindTo(contextKeyService);
        contextKey.set(LogLevelToString(loggerService.getLogLevel()));
        this._register(loggerService.onDidChangeLogLevel(e => {
            if (isLogLevel(e)) {
                contextKey.set(LogLevelToString(loggerService.getLogLevel()));
            }
        }));
        this.onDidAddLoggers(loggerService.getRegisteredLoggers());
        this._register(loggerService.onDidChangeLoggers(({ added, removed }) => {
            this.onDidAddLoggers(added);
            this.onDidRemoveLoggers(removed);
        }));
        this._register(loggerService.onDidChangeVisibility(([resource, visibility]) => {
            const logger = loggerService.getRegisteredLogger(resource);
            if (logger) {
                if (visibility) {
                    this.registerLogChannel(logger);
                }
                else {
                    this.deregisterLogChannel(logger);
                }
            }
        }));
        this.registerShowWindowLogAction();
        this._register(Event.filter(contextKeyService.onDidChangeContext, e => e.affectsSome(this.contextKeys))(() => this.onDidChangeContext()));
    }
    onDidAddLoggers(loggers) {
        for (const logger of loggers) {
            if (logger.when) {
                const contextKeyExpr = ContextKeyExpr.deserialize(logger.when);
                if (contextKeyExpr) {
                    for (const key of contextKeyExpr.keys()) {
                        this.contextKeys.add(key);
                    }
                    if (!this.contextKeyService.contextMatchesRules(contextKeyExpr)) {
                        continue;
                    }
                }
            }
            if (logger.hidden) {
                continue;
            }
            this.registerLogChannel(logger);
        }
    }
    onDidChangeContext() {
        for (const logger of this.loggerService.getRegisteredLoggers()) {
            if (logger.when) {
                if (this.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(logger.when))) {
                    this.registerLogChannel(logger);
                }
                else {
                    this.deregisterLogChannel(logger);
                }
            }
        }
    }
    onDidRemoveLoggers(loggers) {
        for (const logger of loggers) {
            if (logger.when) {
                const contextKeyExpr = ContextKeyExpr.deserialize(logger.when);
                if (contextKeyExpr) {
                    for (const key of contextKeyExpr.keys()) {
                        this.contextKeys.delete(key);
                    }
                }
            }
            this.deregisterLogChannel(logger);
        }
    }
    registerLogChannel(logger) {
        const channel = this.outputChannelRegistry.getChannel(logger.id);
        if (channel && this.uriIdentityService.extUri.isEqual(channel.file, logger.resource)) {
            return;
        }
        const disposables = new DisposableStore();
        const promise = createCancelablePromise(async (token) => {
            await whenProviderRegistered(logger.resource, this.fileService);
            try {
                await this.whenFileExists(logger.resource, 1, token);
                const existingChannel = this.outputChannelRegistry.getChannel(logger.id);
                const remoteLogger = existingChannel?.file?.scheme === Schemas.vscodeRemote ? this.loggerService.getRegisteredLogger(existingChannel.file) : undefined;
                if (remoteLogger) {
                    this.deregisterLogChannel(remoteLogger);
                }
                const hasToAppendRemote = existingChannel && logger.resource.scheme === Schemas.vscodeRemote;
                const id = hasToAppendRemote ? `${logger.id}.remote` : logger.id;
                const label = hasToAppendRemote ? nls.localize('remote name', "{0} (Remote)", logger.name ?? logger.id) : logger.name ?? logger.id;
                this.outputChannelRegistry.registerChannel({ id, label, file: logger.resource, log: true, extensionId: logger.extensionId });
                disposables.add(toDisposable(() => this.outputChannelRegistry.removeChannel(id)));
                if (remoteLogger) {
                    this.registerLogChannel(remoteLogger);
                }
            }
            catch (error) {
                if (!isCancellationError(error)) {
                    this.logService.error('Error while registering log channel', logger.resource.toString(), getErrorMessage(error));
                }
            }
        });
        disposables.add(toDisposable(() => promise.cancel()));
        this.loggerDisposables.set(logger.resource.toString(), disposables);
    }
    deregisterLogChannel(logger) {
        this.loggerDisposables.deleteAndDispose(logger.resource.toString());
    }
    async whenFileExists(file, trial, token) {
        const exists = await this.fileService.exists(file);
        if (exists) {
            return;
        }
        if (token.isCancellationRequested) {
            throw new CancellationError();
        }
        if (trial > 10) {
            throw new Error(`Timed out while waiting for file to be created`);
        }
        this.logService.debug(`[Registering Log Channel] File does not exist. Waiting for 1s to retry.`, file.toString());
        await timeout(1000, token);
        await this.whenFileExists(file, trial + 1, token);
    }
    registerShowWindowLogAction() {
        this._register(registerAction2(class ShowWindowLogAction extends Action2 {
            constructor() {
                super({
                    id: showWindowLogActionId,
                    title: nls.localize2('show window log', "Show Window Log"),
                    category: Categories.Developer,
                    f1: true
                });
            }
            async run(servicesAccessor) {
                const outputService = servicesAccessor.get(IOutputService);
                outputService.showChannel(windowLogId);
            }
        }));
    }
};
LogOutputChannels = __decorate([
    __param(0, ILogService),
    __param(1, ILoggerService),
    __param(2, IContextKeyService),
    __param(3, IFileService),
    __param(4, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], LogOutputChannels);
let LogLevelMigration = class LogLevelMigration {
    constructor(defaultLogLevelsService) {
        defaultLogLevelsService.migrateLogLevels();
    }
};
LogLevelMigration = __decorate([
    __param(0, IDefaultLogLevelsService),
    __metadata("design:paramtypes", [Object])
], LogLevelMigration);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(LogOutputChannels, 3 /* LifecyclePhase.Restored */);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(LogLevelMigration, 4 /* LifecyclePhase.Eventually */);
