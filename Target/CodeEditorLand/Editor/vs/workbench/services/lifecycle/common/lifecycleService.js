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
var AbstractLifecycleService_1;
import { Emitter } from '../../../../base/common/event.js';
import { Barrier } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { LifecyclePhaseToString } from './lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { mark } from '../../../../base/common/performance.js';
import { IStorageService, WillSaveStateReason } from '../../../../platform/storage/common/storage.js';
let AbstractLifecycleService = class AbstractLifecycleService extends Disposable {
    static { AbstractLifecycleService_1 = this; }
    static { this.LAST_SHUTDOWN_REASON_KEY = 'lifecyle.lastShutdownReason'; }
    get startupKind() { return this._startupKind; }
    get phase() { return this._phase; }
    constructor(logService, storageService) {
        super();
        this.logService = logService;
        this.storageService = storageService;
        this._onBeforeShutdown = this._register(new Emitter());
        this.onBeforeShutdown = this._onBeforeShutdown.event;
        this._onWillShutdown = this._register(new Emitter());
        this.onWillShutdown = this._onWillShutdown.event;
        this._onDidShutdown = this._register(new Emitter());
        this.onDidShutdown = this._onDidShutdown.event;
        this._onBeforeShutdownError = this._register(new Emitter());
        this.onBeforeShutdownError = this._onBeforeShutdownError.event;
        this._onShutdownVeto = this._register(new Emitter());
        this.onShutdownVeto = this._onShutdownVeto.event;
        this._phase = 1 /* LifecyclePhase.Starting */;
        this.phaseWhen = new Map();
        // Resolve startup kind
        this._startupKind = this.resolveStartupKind();
        // Save shutdown reason to retrieve on next startup
        this._register(this.storageService.onWillSaveState(e => {
            if (e.reason === WillSaveStateReason.SHUTDOWN) {
                this.storageService.store(AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY, this.shutdownReason, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }));
    }
    resolveStartupKind() {
        const startupKind = this.doResolveStartupKind() ?? 1 /* StartupKind.NewWindow */;
        this.logService.trace(`[lifecycle] starting up (startup kind: ${startupKind})`);
        return startupKind;
    }
    doResolveStartupKind() {
        // Retrieve and reset last shutdown reason
        const lastShutdownReason = this.storageService.getNumber(AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY, 1 /* StorageScope.WORKSPACE */);
        this.storageService.remove(AbstractLifecycleService_1.LAST_SHUTDOWN_REASON_KEY, 1 /* StorageScope.WORKSPACE */);
        // Convert into startup kind
        let startupKind = undefined;
        switch (lastShutdownReason) {
            case 3 /* ShutdownReason.RELOAD */:
                startupKind = 3 /* StartupKind.ReloadedWindow */;
                break;
            case 4 /* ShutdownReason.LOAD */:
                startupKind = 4 /* StartupKind.ReopenedWindow */;
                break;
        }
        return startupKind;
    }
    set phase(value) {
        if (value < this.phase) {
            throw new Error('Lifecycle cannot go backwards');
        }
        if (this._phase === value) {
            return;
        }
        this.logService.trace(`lifecycle: phase changed (value: ${value})`);
        this._phase = value;
        mark(`code/LifecyclePhase/${LifecyclePhaseToString(value)}`);
        const barrier = this.phaseWhen.get(this._phase);
        if (barrier) {
            barrier.open();
            this.phaseWhen.delete(this._phase);
        }
    }
    async when(phase) {
        if (phase <= this._phase) {
            return;
        }
        let barrier = this.phaseWhen.get(phase);
        if (!barrier) {
            barrier = new Barrier();
            this.phaseWhen.set(phase, barrier);
        }
        await barrier.wait();
    }
};
AbstractLifecycleService = AbstractLifecycleService_1 = __decorate([
    __param(0, ILogService),
    __param(1, IStorageService),
    __metadata("design:paramtypes", [Object, Object])
], AbstractLifecycleService);
export { AbstractLifecycleService };
