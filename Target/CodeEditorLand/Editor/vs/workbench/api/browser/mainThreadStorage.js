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
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { MainContext, ExtHostContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { isWeb } from '../../../base/common/platform.js';
import { IExtensionStorageService } from '../../../platform/extensionManagement/common/extensionStorage.js';
import { migrateExtensionStorage } from '../../services/extensions/common/extensionStorageMigration.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../platform/log/common/log.js';
let MainThreadStorage = class MainThreadStorage {
    constructor(extHostContext, _extensionStorageService, _storageService, _instantiationService, _logService) {
        this._extensionStorageService = _extensionStorageService;
        this._storageService = _storageService;
        this._instantiationService = _instantiationService;
        this._logService = _logService;
        this._storageListener = new DisposableStore();
        this._sharedStorageKeysToWatch = new Map();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostStorage);
        this._storageListener.add(this._storageService.onDidChangeValue(0, undefined, this._storageListener)(e => {
            if (this._sharedStorageKeysToWatch.has(e.key)) {
                const rawState = this._extensionStorageService.getExtensionStateRaw(e.key, true);
                if (typeof rawState === 'string') {
                    this._proxy.$acceptValue(true, e.key, rawState);
                }
            }
        }));
    }
    dispose() {
        this._storageListener.dispose();
    }
    async $initializeExtensionStorage(shared, extensionId) {
        await this.checkAndMigrateExtensionStorage(extensionId, shared);
        if (shared) {
            this._sharedStorageKeysToWatch.set(extensionId, true);
        }
        return this._extensionStorageService.getExtensionStateRaw(extensionId, shared);
    }
    async $setValue(shared, key, value) {
        this._extensionStorageService.setExtensionState(key, value, shared);
    }
    $registerExtensionStorageKeysToSync(extension, keys) {
        this._extensionStorageService.setKeysForSync(extension, keys);
    }
    async checkAndMigrateExtensionStorage(extensionId, shared) {
        try {
            let sourceExtensionId = this._extensionStorageService.getSourceExtensionToMigrate(extensionId);
            if (!sourceExtensionId && isWeb && extensionId !== extensionId.toLowerCase()) {
                sourceExtensionId = extensionId.toLowerCase();
            }
            if (sourceExtensionId) {
                if (isWeb && sourceExtensionId !== sourceExtensionId.toLowerCase() && this._extensionStorageService.getExtensionState(sourceExtensionId.toLowerCase(), shared) && !this._extensionStorageService.getExtensionState(sourceExtensionId, shared)) {
                    sourceExtensionId = sourceExtensionId.toLowerCase();
                }
                await migrateExtensionStorage(sourceExtensionId, extensionId, shared, this._instantiationService);
            }
        }
        catch (error) {
            this._logService.error(error);
        }
    }
};
MainThreadStorage = __decorate([
    extHostNamedCustomer(MainContext.MainThreadStorage),
    __param(1, IExtensionStorageService),
    __param(2, IStorageService),
    __param(3, IInstantiationService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], MainThreadStorage);
export { MainThreadStorage };
