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
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IProductService } from '../../product/common/productService.js';
import { IStorageService } from '../../storage/common/storage.js';
import { AbstractUserDataSyncStoreManagementService } from './userDataSyncStoreService.js';
export class UserDataSyncAccountServiceChannel {
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        switch (event) {
            case 'onDidChangeAccount': return this.service.onDidChangeAccount;
            case 'onTokenFailed': return this.service.onTokenFailed;
        }
        throw new Error(`[UserDataSyncAccountServiceChannel] Event not found: ${event}`);
    }
    call(context, command, args) {
        switch (command) {
            case '_getInitialData': return Promise.resolve(this.service.account);
            case 'updateAccount': return this.service.updateAccount(args);
        }
        throw new Error('Invalid call');
    }
}
export class UserDataSyncAccountServiceChannelClient extends Disposable {
    get account() { return this._account; }
    get onTokenFailed() { return this.channel.listen('onTokenFailed'); }
    constructor(channel) {
        super();
        this.channel = channel;
        this._onDidChangeAccount = this._register(new Emitter());
        this.onDidChangeAccount = this._onDidChangeAccount.event;
        this.channel.call('_getInitialData').then(account => {
            this._account = account;
            this._register(this.channel.listen('onDidChangeAccount')(account => {
                this._account = account;
                this._onDidChangeAccount.fire(account);
            }));
        });
    }
    updateAccount(account) {
        return this.channel.call('updateAccount', account);
    }
}
export class UserDataSyncStoreManagementServiceChannel {
    constructor(service) {
        this.service = service;
    }
    listen(_, event) {
        switch (event) {
            case 'onDidChangeUserDataSyncStore': return this.service.onDidChangeUserDataSyncStore;
        }
        throw new Error(`[UserDataSyncStoreManagementServiceChannel] Event not found: ${event}`);
    }
    call(context, command, args) {
        switch (command) {
            case 'switch': return this.service.switch(args[0]);
            case 'getPreviousUserDataSyncStore': return this.service.getPreviousUserDataSyncStore();
        }
        throw new Error('Invalid call');
    }
}
let UserDataSyncStoreManagementServiceChannelClient = class UserDataSyncStoreManagementServiceChannelClient extends AbstractUserDataSyncStoreManagementService {
    constructor(channel, productService, configurationService, storageService) {
        super(productService, configurationService, storageService);
        this.channel = channel;
        this._register(this.channel.listen('onDidChangeUserDataSyncStore')(() => this.updateUserDataSyncStore()));
    }
    async switch(type) {
        return this.channel.call('switch', [type]);
    }
    async getPreviousUserDataSyncStore() {
        const userDataSyncStore = await this.channel.call('getPreviousUserDataSyncStore');
        return this.revive(userDataSyncStore);
    }
    revive(userDataSyncStore) {
        return {
            url: URI.revive(userDataSyncStore.url),
            type: userDataSyncStore.type,
            defaultUrl: URI.revive(userDataSyncStore.defaultUrl),
            insidersUrl: URI.revive(userDataSyncStore.insidersUrl),
            stableUrl: URI.revive(userDataSyncStore.stableUrl),
            canSwitch: userDataSyncStore.canSwitch,
            authenticationProviders: userDataSyncStore.authenticationProviders,
        };
    }
};
UserDataSyncStoreManagementServiceChannelClient = __decorate([
    __param(1, IProductService),
    __param(2, IConfigurationService),
    __param(3, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], UserDataSyncStoreManagementServiceChannelClient);
export { UserDataSyncStoreManagementServiceChannelClient };
