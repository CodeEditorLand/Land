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
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { isWeb } from '../../../base/common/platform.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { ALL_SYNC_RESOURCES, getEnablementKey, IUserDataSyncStoreManagementService } from './userDataSync.js';
const enablementKey = 'sync.enable';
let UserDataSyncEnablementService = class UserDataSyncEnablementService extends Disposable {
    constructor(storageService, telemetryService, environmentService, userDataSyncStoreManagementService) {
        super();
        this.storageService = storageService;
        this.telemetryService = telemetryService;
        this.environmentService = environmentService;
        this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
        this._onDidChangeEnablement = new Emitter();
        this.onDidChangeEnablement = this._onDidChangeEnablement.event;
        this._onDidChangeResourceEnablement = new Emitter();
        this.onDidChangeResourceEnablement = this._onDidChangeResourceEnablement.event;
        this._register(storageService.onDidChangeValue(-1, undefined, this._register(new DisposableStore()))(e => this.onDidStorageChange(e)));
    }
    isEnabled() {
        switch (this.environmentService.sync) {
            case 'on':
                return true;
            case 'off':
                return false;
        }
        return this.storageService.getBoolean(enablementKey, -1, false);
    }
    canToggleEnablement() {
        return this.userDataSyncStoreManagementService.userDataSyncStore !== undefined && this.environmentService.sync === undefined;
    }
    setEnablement(enabled) {
        if (enabled && !this.canToggleEnablement()) {
            return;
        }
        this.telemetryService.publicLog2(enablementKey, { enabled });
        this.storageService.store(enablementKey, enabled, -1, 1);
    }
    isResourceEnabled(resource) {
        return this.storageService.getBoolean(getEnablementKey(resource), -1, true);
    }
    setResourceEnablement(resource, enabled) {
        if (this.isResourceEnabled(resource) !== enabled) {
            const resourceEnablementKey = getEnablementKey(resource);
            this.storeResourceEnablement(resourceEnablementKey, enabled);
        }
    }
    getResourceSyncStateVersion(resource) {
        return undefined;
    }
    storeResourceEnablement(resourceEnablementKey, enabled) {
        this.storageService.store(resourceEnablementKey, enabled, -1, isWeb ? 0 : 1);
    }
    onDidStorageChange(storageChangeEvent) {
        if (enablementKey === storageChangeEvent.key) {
            this._onDidChangeEnablement.fire(this.isEnabled());
            return;
        }
        const resourceKey = ALL_SYNC_RESOURCES.filter(resourceKey => getEnablementKey(resourceKey) === storageChangeEvent.key)[0];
        if (resourceKey) {
            this._onDidChangeResourceEnablement.fire([resourceKey, this.isResourceEnabled(resourceKey)]);
            return;
        }
    }
};
UserDataSyncEnablementService = __decorate([
    __param(0, IStorageService),
    __param(1, ITelemetryService),
    __param(2, IEnvironmentService),
    __param(3, IUserDataSyncStoreManagementService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], UserDataSyncEnablementService);
export { UserDataSyncEnablementService };
