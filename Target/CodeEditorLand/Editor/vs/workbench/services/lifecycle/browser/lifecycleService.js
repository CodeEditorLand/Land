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
import { ILifecycleService } from '../common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { AbstractLifecycleService } from '../common/lifecycleService.js';
import { localize } from '../../../../nls.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { addDisposableListener, EventType } from '../../../../base/browser/dom.js';
import { IStorageService, WillSaveStateReason } from '../../../../platform/storage/common/storage.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { mainWindow } from '../../../../base/browser/window.js';
let BrowserLifecycleService = class BrowserLifecycleService extends AbstractLifecycleService {
    constructor(logService, storageService) {
        super(logService, storageService);
        this.beforeUnloadListener = undefined;
        this.unloadListener = undefined;
        this.ignoreBeforeUnload = false;
        this.didUnload = false;
        this.registerListeners();
    }
    registerListeners() {
        this.beforeUnloadListener = addDisposableListener(mainWindow, EventType.BEFORE_UNLOAD, (e) => this.onBeforeUnload(e));
        this.unloadListener = addDisposableListener(mainWindow, EventType.PAGE_HIDE, () => this.onUnload());
    }
    onBeforeUnload(event) {
        if (this.ignoreBeforeUnload) {
            this.logService.info('[lifecycle] onBeforeUnload triggered but ignored once');
            this.ignoreBeforeUnload = false;
        }
        else {
            this.logService.info('[lifecycle] onBeforeUnload triggered and handled with veto support');
            this.doShutdown(() => this.vetoBeforeUnload(event));
        }
    }
    vetoBeforeUnload(event) {
        event.preventDefault();
        event.returnValue = localize('lifecycleVeto', "Changes that you made may not be saved. Please check press 'Cancel' and try again.");
    }
    withExpectedShutdown(reason, callback) {
        if (typeof reason === 'number') {
            this.shutdownReason = reason;
            return this.storageService.flush(WillSaveStateReason.SHUTDOWN);
        }
        else {
            this.ignoreBeforeUnload = true;
            try {
                callback?.();
            }
            finally {
                this.ignoreBeforeUnload = false;
            }
        }
    }
    async shutdown() {
        this.logService.info('[lifecycle] shutdown triggered');
        this.beforeUnloadListener?.dispose();
        this.unloadListener?.dispose();
        await this.storageService.flush(WillSaveStateReason.SHUTDOWN);
        this.doShutdown();
    }
    doShutdown(vetoShutdown) {
        const logService = this.logService;
        this.storageService.flush(WillSaveStateReason.SHUTDOWN);
        let veto = false;
        function handleVeto(vetoResult, id) {
            if (typeof vetoShutdown !== 'function') {
                return;
            }
            if (vetoResult instanceof Promise) {
                logService.error(`[lifecycle] Long running operations before shutdown are unsupported in the web (id: ${id})`);
                veto = true;
            }
            if (vetoResult === true) {
                logService.info(`[lifecycle]: Unload was prevented (id: ${id})`);
                veto = true;
            }
        }
        this._onBeforeShutdown.fire({
            reason: 2,
            veto(value, id) {
                handleVeto(value, id);
            },
            finalVeto(valueFn, id) {
                handleVeto(valueFn(), id);
            }
        });
        if (veto && typeof vetoShutdown === 'function') {
            return vetoShutdown();
        }
        return this.onUnload();
    }
    onUnload() {
        if (this.didUnload) {
            return;
        }
        this.didUnload = true;
        this._register(addDisposableListener(mainWindow, EventType.PAGE_SHOW, (e) => this.onLoadAfterUnload(e)));
        const logService = this.logService;
        this._onWillShutdown.fire({
            reason: 2,
            joiners: () => [],
            token: CancellationToken.None,
            join(promise, joiner) {
                logService.error(`[lifecycle] Long running operations during shutdown are unsupported in the web (id: ${joiner.id})`);
            },
            force: () => { },
        });
        this._onDidShutdown.fire();
    }
    onLoadAfterUnload(event) {
        const wasRestoredFromCache = event.persisted;
        if (!wasRestoredFromCache) {
            return;
        }
        this.withExpectedShutdown({ disableShutdownHandling: true }, () => mainWindow.location.reload());
    }
    doResolveStartupKind() {
        let startupKind = super.doResolveStartupKind();
        if (typeof startupKind !== 'number') {
            const timing = performance.getEntriesByType('navigation').at(0);
            if (timing?.type === 'reload') {
                startupKind = 3;
            }
        }
        return startupKind;
    }
};
BrowserLifecycleService = __decorate([
    __param(0, ILogService),
    __param(1, IStorageService),
    __metadata("design:paramtypes", [Object, Object])
], BrowserLifecycleService);
export { BrowserLifecycleService };
registerSingleton(ILifecycleService, BrowserLifecycleService, 0);
