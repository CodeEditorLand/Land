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
import { Event } from '../../../base/common/event.js';
import { INativeHostService } from '../../native/common/native.js';
import { IProductService } from '../../product/common/productService.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { UserDataAutoSyncService as BaseUserDataAutoSyncService } from '../common/userDataAutoSyncService.js';
import { IUserDataSyncEnablementService, IUserDataSyncLogService, IUserDataSyncService, IUserDataSyncStoreManagementService, IUserDataSyncStoreService } from '../common/userDataSync.js';
import { IUserDataSyncAccountService } from '../common/userDataSyncAccount.js';
import { IUserDataSyncMachinesService } from '../common/userDataSyncMachines.js';
let UserDataAutoSyncService = class UserDataAutoSyncService extends BaseUserDataAutoSyncService {
    constructor(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, nativeHostService, logService, authTokenService, telemetryService, userDataSyncMachinesService, storageService) {
        super(productService, userDataSyncStoreManagementService, userDataSyncStoreService, userDataSyncEnablementService, userDataSyncService, logService, authTokenService, telemetryService, userDataSyncMachinesService, storageService);
        this._register(Event.debounce(Event.any(Event.map(nativeHostService.onDidFocusMainWindow, () => 'windowFocus'), Event.map(nativeHostService.onDidOpenMainWindow, () => 'windowOpen')), (last, source) => last ? [...last, source] : [source], 1000)(sources => this.triggerSync(sources, true, false)));
    }
};
UserDataAutoSyncService = __decorate([
    __param(0, IProductService),
    __param(1, IUserDataSyncStoreManagementService),
    __param(2, IUserDataSyncStoreService),
    __param(3, IUserDataSyncEnablementService),
    __param(4, IUserDataSyncService),
    __param(5, INativeHostService),
    __param(6, IUserDataSyncLogService),
    __param(7, IUserDataSyncAccountService),
    __param(8, ITelemetryService),
    __param(9, IUserDataSyncMachinesService),
    __param(10, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserDataAutoSyncService);
export { UserDataAutoSyncService };
