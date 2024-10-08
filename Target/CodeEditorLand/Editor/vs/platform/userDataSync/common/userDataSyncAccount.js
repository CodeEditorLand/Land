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
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { IUserDataSyncLogService, IUserDataSyncStoreService } from './userDataSync.js';
export const IUserDataSyncAccountService = createDecorator('IUserDataSyncAccountService');
let UserDataSyncAccountService = class UserDataSyncAccountService extends Disposable {
    get account() { return this._account; }
    constructor(userDataSyncStoreService, logService) {
        super();
        this.userDataSyncStoreService = userDataSyncStoreService;
        this.logService = logService;
        this._onDidChangeAccount = this._register(new Emitter());
        this.onDidChangeAccount = this._onDidChangeAccount.event;
        this._onTokenFailed = this._register(new Emitter());
        this.onTokenFailed = this._onTokenFailed.event;
        this.wasTokenFailed = false;
        this._register(userDataSyncStoreService.onTokenFailed(code => {
            this.logService.info('Settings Sync auth token failed', this.account?.authenticationProviderId, this.wasTokenFailed, code);
            this.updateAccount(undefined);
            if (code === "Forbidden" /* UserDataSyncErrorCode.Forbidden */) {
                this._onTokenFailed.fire(true /*bail out immediately*/);
            }
            else {
                this._onTokenFailed.fire(this.wasTokenFailed /* bail out if token failed before */);
            }
            this.wasTokenFailed = true;
        }));
        this._register(userDataSyncStoreService.onTokenSucceed(() => this.wasTokenFailed = false));
    }
    async updateAccount(account) {
        if (account && this._account ? account.token !== this._account.token || account.authenticationProviderId !== this._account.authenticationProviderId : account !== this._account) {
            this._account = account;
            if (this._account) {
                this.userDataSyncStoreService.setAuthToken(this._account.token, this._account.authenticationProviderId);
            }
            this._onDidChangeAccount.fire(account);
        }
    }
};
UserDataSyncAccountService = __decorate([
    __param(0, IUserDataSyncStoreService),
    __param(1, IUserDataSyncLogService),
    __metadata("design:paramtypes", [Object, Object])
], UserDataSyncAccountService);
export { UserDataSyncAccountService };
