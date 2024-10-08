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
var NativeLifecycleService_1;
import { handleVetos } from '../../../../platform/lifecycle/common/lifecycle.js';
import { ILifecycleService, WillShutdownJoinerOrder } from '../common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ipcRenderer } from '../../../../base/parts/sandbox/electron-sandbox/globals.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { AbstractLifecycleService } from '../common/lifecycleService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { Promises, disposableTimeout, raceCancellation } from '../../../../base/common/async.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
let NativeLifecycleService = class NativeLifecycleService extends AbstractLifecycleService {
    static { NativeLifecycleService_1 = this; }
    static { this.BEFORE_SHUTDOWN_WARNING_DELAY = 5000; }
    static { this.WILL_SHUTDOWN_WARNING_DELAY = 800; }
    constructor(nativeHostService, storageService, logService) {
        super(logService, storageService);
        this.nativeHostService = nativeHostService;
        this.registerListeners();
    }
    registerListeners() {
        const windowId = this.nativeHostService.windowId;
        // Main side indicates that window is about to unload, check for vetos
        ipcRenderer.on('vscode:onBeforeUnload', async (event, reply) => {
            this.logService.trace(`[lifecycle] onBeforeUnload (reason: ${reply.reason})`);
            // trigger onBeforeShutdown events and veto collecting
            const veto = await this.handleBeforeShutdown(reply.reason);
            // veto: cancel unload
            if (veto) {
                this.logService.trace('[lifecycle] onBeforeUnload prevented via veto');
                // Indicate as event
                this._onShutdownVeto.fire();
                ipcRenderer.send(reply.cancelChannel, windowId);
            }
            // no veto: allow unload
            else {
                this.logService.trace('[lifecycle] onBeforeUnload continues without veto');
                this.shutdownReason = reply.reason;
                ipcRenderer.send(reply.okChannel, windowId);
            }
        });
        // Main side indicates that we will indeed shutdown
        ipcRenderer.on('vscode:onWillUnload', async (event, reply) => {
            this.logService.trace(`[lifecycle] onWillUnload (reason: ${reply.reason})`);
            // trigger onWillShutdown events and joining
            await this.handleWillShutdown(reply.reason);
            // trigger onDidShutdown event now that we know we will quit
            this._onDidShutdown.fire();
            // acknowledge to main side
            ipcRenderer.send(reply.replyChannel, windowId);
        });
    }
    async handleBeforeShutdown(reason) {
        const logService = this.logService;
        const vetos = [];
        const pendingVetos = new Set();
        let finalVeto = undefined;
        let finalVetoId = undefined;
        // before-shutdown event with veto support
        this._onBeforeShutdown.fire({
            reason,
            veto(value, id) {
                vetos.push(value);
                // Log any veto instantly
                if (value === true) {
                    logService.info(`[lifecycle]: Shutdown was prevented (id: ${id})`);
                }
                // Track promise completion
                else if (value instanceof Promise) {
                    pendingVetos.add(id);
                    value.then(veto => {
                        if (veto === true) {
                            logService.info(`[lifecycle]: Shutdown was prevented (id: ${id})`);
                        }
                    }).finally(() => pendingVetos.delete(id));
                }
            },
            finalVeto(value, id) {
                if (!finalVeto) {
                    finalVeto = value;
                    finalVetoId = id;
                }
                else {
                    throw new Error(`[lifecycle]: Final veto is already defined (id: ${id})`);
                }
            }
        });
        const longRunningBeforeShutdownWarning = disposableTimeout(() => {
            logService.warn(`[lifecycle] onBeforeShutdown is taking a long time, pending operations: ${Array.from(pendingVetos).join(', ')}`);
        }, NativeLifecycleService_1.BEFORE_SHUTDOWN_WARNING_DELAY);
        try {
            // First: run list of vetos in parallel
            let veto = await handleVetos(vetos, error => this.handleBeforeShutdownError(error, reason));
            if (veto) {
                return veto;
            }
            // Second: run the final veto if defined
            if (finalVeto) {
                try {
                    pendingVetos.add(finalVetoId);
                    veto = await finalVeto();
                    if (veto) {
                        logService.info(`[lifecycle]: Shutdown was prevented by final veto (id: ${finalVetoId})`);
                    }
                }
                catch (error) {
                    veto = true; // treat error as veto
                    this.handleBeforeShutdownError(error, reason);
                }
            }
            return veto;
        }
        finally {
            longRunningBeforeShutdownWarning.dispose();
        }
    }
    handleBeforeShutdownError(error, reason) {
        this.logService.error(`[lifecycle]: Error during before-shutdown phase (error: ${toErrorMessage(error)})`);
        this._onBeforeShutdownError.fire({ reason, error });
    }
    async handleWillShutdown(reason) {
        const joiners = [];
        const lastJoiners = [];
        const pendingJoiners = new Set();
        const cts = new CancellationTokenSource();
        this._onWillShutdown.fire({
            reason,
            token: cts.token,
            joiners: () => Array.from(pendingJoiners.values()),
            join(promiseOrPromiseFn, joiner) {
                pendingJoiners.add(joiner);
                if (joiner.order === WillShutdownJoinerOrder.Last) {
                    const promiseFn = typeof promiseOrPromiseFn === 'function' ? promiseOrPromiseFn : () => promiseOrPromiseFn;
                    lastJoiners.push(() => promiseFn().finally(() => pendingJoiners.delete(joiner)));
                }
                else {
                    const promise = typeof promiseOrPromiseFn === 'function' ? promiseOrPromiseFn() : promiseOrPromiseFn;
                    promise.finally(() => pendingJoiners.delete(joiner));
                    joiners.push(promise);
                }
            },
            force: () => {
                cts.dispose(true);
            }
        });
        const longRunningWillShutdownWarning = disposableTimeout(() => {
            this.logService.warn(`[lifecycle] onWillShutdown is taking a long time, pending operations: ${Array.from(pendingJoiners).map(joiner => joiner.id).join(', ')}`);
        }, NativeLifecycleService_1.WILL_SHUTDOWN_WARNING_DELAY);
        try {
            await raceCancellation(Promises.settled(joiners), cts.token);
        }
        catch (error) {
            this.logService.error(`[lifecycle]: Error during will-shutdown phase in default joiners (error: ${toErrorMessage(error)})`);
        }
        try {
            await raceCancellation(Promises.settled(lastJoiners.map(lastJoiner => lastJoiner())), cts.token);
        }
        catch (error) {
            this.logService.error(`[lifecycle]: Error during will-shutdown phase in last joiners (error: ${toErrorMessage(error)})`);
        }
        longRunningWillShutdownWarning.dispose();
    }
    shutdown() {
        return this.nativeHostService.closeWindow();
    }
};
NativeLifecycleService = NativeLifecycleService_1 = __decorate([
    __param(0, INativeHostService),
    __param(1, IStorageService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NativeLifecycleService);
export { NativeLifecycleService };
registerSingleton(ILifecycleService, NativeLifecycleService, 0 /* InstantiationType.Eager */);
