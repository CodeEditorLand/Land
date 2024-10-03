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
import { Disposable, DisposableMap, MutableDisposable, isDisposable, toDisposable } from '../../../base/common/lifecycle.js';
import { Storage } from '../../../base/parts/storage/common/storage.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { AbstractStorageService, IStorageService, isProfileUsingDefaultStorage } from '../../storage/common/storage.js';
import { Emitter } from '../../../base/common/event.js';
import { ApplicationStorageDatabaseClient, ProfileStorageDatabaseClient } from '../../storage/common/storageIpc.js';
import { reviveProfile } from './userDataProfile.js';
export const IUserDataProfileStorageService = createDecorator('IUserDataProfileStorageService');
let AbstractUserDataProfileStorageService = class AbstractUserDataProfileStorageService extends Disposable {
    constructor(persistStorages, storageService) {
        super();
        this.storageService = storageService;
        if (persistStorages) {
            this.storageServicesMap = this._register(new DisposableMap());
        }
    }
    async readStorageData(profile) {
        return this.withProfileScopedStorageService(profile, async (storageService) => this.getItems(storageService));
    }
    async updateStorageData(profile, data, target) {
        return this.withProfileScopedStorageService(profile, async (storageService) => this.writeItems(storageService, data, target));
    }
    async withProfileScopedStorageService(profile, fn) {
        if (this.storageService.hasScope(profile)) {
            return fn(this.storageService);
        }
        let storageService = this.storageServicesMap?.get(profile.id);
        if (!storageService) {
            storageService = new StorageService(this.createStorageDatabase(profile));
            this.storageServicesMap?.set(profile.id, storageService);
            try {
                await storageService.initialize();
            }
            catch (error) {
                if (this.storageServicesMap?.has(profile.id)) {
                    this.storageServicesMap.deleteAndDispose(profile.id);
                }
                else {
                    storageService.dispose();
                }
                throw error;
            }
        }
        try {
            const result = await fn(storageService);
            await storageService.flush();
            return result;
        }
        finally {
            if (!this.storageServicesMap?.has(profile.id)) {
                storageService.dispose();
            }
        }
    }
    getItems(storageService) {
        const result = new Map();
        const populate = (target) => {
            for (const key of storageService.keys(0, target)) {
                result.set(key, { value: storageService.get(key, 0), target });
            }
        };
        populate(0);
        populate(1);
        return result;
    }
    writeItems(storageService, items, target) {
        storageService.storeAll(Array.from(items.entries()).map(([key, value]) => ({ key, value, scope: 0, target })), true);
    }
};
AbstractUserDataProfileStorageService = __decorate([
    __param(1, IStorageService),
    __metadata("design:paramtypes", [Boolean, Object])
], AbstractUserDataProfileStorageService);
export { AbstractUserDataProfileStorageService };
export class RemoteUserDataProfileStorageService extends AbstractUserDataProfileStorageService {
    constructor(persistStorages, remoteService, userDataProfilesService, storageService, logService) {
        super(persistStorages, storageService);
        this.remoteService = remoteService;
        const channel = remoteService.getChannel('profileStorageListener');
        const disposable = this._register(new MutableDisposable());
        this._onDidChange = this._register(new Emitter({
            onWillAddFirstListener: () => {
                disposable.value = channel.listen('onDidChange')(e => {
                    logService.trace('profile storage changes', e);
                    this._onDidChange.fire({
                        targetChanges: e.targetChanges.map(profile => reviveProfile(profile, userDataProfilesService.profilesHome.scheme)),
                        valueChanges: e.valueChanges.map(e => ({ ...e, profile: reviveProfile(e.profile, userDataProfilesService.profilesHome.scheme) }))
                    });
                });
            },
            onDidRemoveLastListener: () => disposable.value = undefined
        }));
        this.onDidChange = this._onDidChange.event;
    }
    async createStorageDatabase(profile) {
        const storageChannel = this.remoteService.getChannel('storage');
        return isProfileUsingDefaultStorage(profile) ? new ApplicationStorageDatabaseClient(storageChannel) : new ProfileStorageDatabaseClient(storageChannel, profile);
    }
}
class StorageService extends AbstractStorageService {
    constructor(profileStorageDatabase) {
        super({ flushInterval: 100 });
        this.profileStorageDatabase = profileStorageDatabase;
    }
    async doInitialize() {
        const profileStorageDatabase = await this.profileStorageDatabase;
        const profileStorage = new Storage(profileStorageDatabase);
        this._register(profileStorage.onDidChangeStorage(e => {
            this.emitDidChangeValue(0, e);
        }));
        this._register(toDisposable(() => {
            profileStorage.close();
            profileStorage.dispose();
            if (isDisposable(profileStorageDatabase)) {
                profileStorageDatabase.dispose();
            }
        }));
        this.profileStorage = profileStorage;
        return this.profileStorage.init();
    }
    getStorage(scope) {
        return scope === 0 ? this.profileStorage : undefined;
    }
    getLogDetails() { return undefined; }
    async switchToProfile() { }
    async switchToWorkspace() { }
    hasScope() { return false; }
}
