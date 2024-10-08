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
import { disposableTimeout, RunOnceScheduler, runWhenGlobalIdle } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService, createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { userActivityRegistry } from './userActivityRegistry.js';
const MARK_INACTIVE_DEBOUNCE = 10_000;
export const IUserActivityService = createDecorator('IUserActivityService');
let UserActivityService = class UserActivityService extends Disposable {
    constructor(instantiationService) {
        super();
        this.markInactive = this._register(new RunOnceScheduler(() => {
            this.isActive = false;
            this.changeEmitter.fire(false);
        }, MARK_INACTIVE_DEBOUNCE));
        this.changeEmitter = this._register(new Emitter);
        this.active = 0;
        /**
         * @inheritdoc
         *
         * Note: initialized to true, since the user just did something to open the
         * window. The bundled DomActivityTracker will initially assume activity
         * as well in order to unset this if the window gets abandoned.
         */
        this.isActive = true;
        /** @inheritdoc */
        this.onDidChangeIsActive = this.changeEmitter.event;
        this._register(runWhenGlobalIdle(() => userActivityRegistry.take(this, instantiationService)));
    }
    /** @inheritdoc */
    markActive(opts) {
        if (opts?.whenHeldFor) {
            const store = new DisposableStore();
            store.add(disposableTimeout(() => store.add(this.markActive()), opts.whenHeldFor));
            return store;
        }
        if (++this.active === 1) {
            this.isActive = true;
            this.changeEmitter.fire(true);
            this.markInactive.cancel();
        }
        return toDisposable(() => {
            if (--this.active === 0) {
                this.markInactive.schedule();
            }
        });
    }
};
UserActivityService = __decorate([
    __param(0, IInstantiationService),
    __metadata("design:paramtypes", [Object])
], UserActivityService);
export { UserActivityService };
registerSingleton(IUserActivityService, UserActivityService, 1 /* InstantiationType.Delayed */);
