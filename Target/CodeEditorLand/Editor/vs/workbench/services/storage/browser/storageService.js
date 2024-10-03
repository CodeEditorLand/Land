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
var BrowserStorageService_1;
import { BroadcastDataChannel } from '../../../../base/browser/broadcast.js';
import { isSafari } from '../../../../base/browser/browser.js';
import { getActiveWindow } from '../../../../base/browser/dom.js';
import { IndexedDB } from '../../../../base/browser/indexedDB.js';
import { DeferredPromise, Promises } from '../../../../base/common/async.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { InMemoryStorageDatabase, isStorageItemsChangeEvent, Storage } from '../../../../base/parts/storage/common/storage.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { AbstractStorageService, isProfileUsingDefaultStorage, IS_NEW_KEY } from '../../../../platform/storage/common/storage.js';
import { isUserDataProfile } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
let BrowserStorageService = class BrowserStorageService extends AbstractStorageService {
    static { BrowserStorageService_1 = this; }
    static { this.BROWSER_DEFAULT_FLUSH_INTERVAL = 5 * 1000; }
    get hasPendingUpdate() {
        return Boolean(this.applicationStorageDatabase?.hasPendingUpdate ||
            this.profileStorageDatabase?.hasPendingUpdate ||
            this.workspaceStorageDatabase?.hasPendingUpdate);
    }
    constructor(workspace, userDataProfileService, logService) {
        super({ flushInterval: BrowserStorageService_1.BROWSER_DEFAULT_FLUSH_INTERVAL });
        this.workspace = workspace;
        this.userDataProfileService = userDataProfileService;
        this.logService = logService;
        this.applicationStoragePromise = new DeferredPromise();
        this.profileStorageProfile = this.userDataProfileService.currentProfile;
        this.profileStorageDisposables = this._register(new DisposableStore());
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.userDataProfileService.onDidChangeCurrentProfile(e => e.join(this.switchToProfile(e.profile))));
    }
    async doInitialize() {
        await Promises.settled([
            this.createApplicationStorage(),
            this.createProfileStorage(this.profileStorageProfile),
            this.createWorkspaceStorage()
        ]);
    }
    async createApplicationStorage() {
        const applicationStorageIndexedDB = await IndexedDBStorageDatabase.createApplicationStorage(this.logService);
        this.applicationStorageDatabase = this._register(applicationStorageIndexedDB);
        this.applicationStorage = this._register(new Storage(this.applicationStorageDatabase));
        this._register(this.applicationStorage.onDidChangeStorage(e => this.emitDidChangeValue(-1, e)));
        await this.applicationStorage.init();
        this.updateIsNew(this.applicationStorage);
        this.applicationStoragePromise.complete({ indexedDb: applicationStorageIndexedDB, storage: this.applicationStorage });
    }
    async createProfileStorage(profile) {
        this.profileStorageDisposables.clear();
        this.profileStorageProfile = profile;
        if (isProfileUsingDefaultStorage(this.profileStorageProfile)) {
            const { indexedDb: applicationStorageIndexedDB, storage: applicationStorage } = await this.applicationStoragePromise.p;
            this.profileStorageDatabase = applicationStorageIndexedDB;
            this.profileStorage = applicationStorage;
            this.profileStorageDisposables.add(this.profileStorage.onDidChangeStorage(e => this.emitDidChangeValue(0, e)));
        }
        else {
            const profileStorageIndexedDB = await IndexedDBStorageDatabase.createProfileStorage(this.profileStorageProfile, this.logService);
            this.profileStorageDatabase = this.profileStorageDisposables.add(profileStorageIndexedDB);
            this.profileStorage = this.profileStorageDisposables.add(new Storage(this.profileStorageDatabase));
            this.profileStorageDisposables.add(this.profileStorage.onDidChangeStorage(e => this.emitDidChangeValue(0, e)));
            await this.profileStorage.init();
            this.updateIsNew(this.profileStorage);
        }
    }
    async createWorkspaceStorage() {
        const workspaceStorageIndexedDB = await IndexedDBStorageDatabase.createWorkspaceStorage(this.workspace.id, this.logService);
        this.workspaceStorageDatabase = this._register(workspaceStorageIndexedDB);
        this.workspaceStorage = this._register(new Storage(this.workspaceStorageDatabase));
        this._register(this.workspaceStorage.onDidChangeStorage(e => this.emitDidChangeValue(1, e)));
        await this.workspaceStorage.init();
        this.updateIsNew(this.workspaceStorage);
    }
    updateIsNew(storage) {
        const firstOpen = storage.getBoolean(IS_NEW_KEY);
        if (firstOpen === undefined) {
            storage.set(IS_NEW_KEY, true);
        }
        else if (firstOpen) {
            storage.set(IS_NEW_KEY, false);
        }
    }
    getStorage(scope) {
        switch (scope) {
            case -1:
                return this.applicationStorage;
            case 0:
                return this.profileStorage;
            default:
                return this.workspaceStorage;
        }
    }
    getLogDetails(scope) {
        switch (scope) {
            case -1:
                return this.applicationStorageDatabase?.name;
            case 0:
                return this.profileStorageDatabase?.name;
            default:
                return this.workspaceStorageDatabase?.name;
        }
    }
    async switchToProfile(toProfile) {
        if (!this.canSwitchProfile(this.profileStorageProfile, toProfile)) {
            return;
        }
        const oldProfileStorage = assertIsDefined(this.profileStorage);
        const oldItems = oldProfileStorage.items;
        if (oldProfileStorage !== this.applicationStorage) {
            await oldProfileStorage.close();
        }
        await this.createProfileStorage(toProfile);
        this.switchData(oldItems, assertIsDefined(this.profileStorage), 0);
    }
    async switchToWorkspace(toWorkspace, preserveData) {
        throw new Error('Migrating storage is currently unsupported in Web');
    }
    shouldFlushWhenIdle() {
        return getActiveWindow().document.hasFocus() && !this.hasPendingUpdate;
    }
    close() {
        if (isSafari) {
            this.applicationStorage?.close();
            this.profileStorageDatabase?.close();
            this.workspaceStorageDatabase?.close();
        }
        this.dispose();
    }
    async clear() {
        for (const scope of [-1, 0, 1]) {
            for (const target of [0, 1]) {
                for (const key of this.keys(scope, target)) {
                    this.remove(key, scope);
                }
            }
            await this.getStorage(scope)?.whenFlushed();
        }
        await Promises.settled([
            this.applicationStorageDatabase?.clear() ?? Promise.resolve(),
            this.profileStorageDatabase?.clear() ?? Promise.resolve(),
            this.workspaceStorageDatabase?.clear() ?? Promise.resolve()
        ]);
    }
    hasScope(scope) {
        if (isUserDataProfile(scope)) {
            return this.profileStorageProfile.id === scope.id;
        }
        return this.workspace.id === scope.id;
    }
};
BrowserStorageService = BrowserStorageService_1 = __decorate([
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], BrowserStorageService);
export { BrowserStorageService };
class InMemoryIndexedDBStorageDatabase extends InMemoryStorageDatabase {
    constructor() {
        super(...arguments);
        this.hasPendingUpdate = false;
        this.name = 'in-memory-indexedb-storage';
    }
    async clear() {
        (await this.getItems()).clear();
    }
    dispose() {
    }
}
export class IndexedDBStorageDatabase extends Disposable {
    static async createApplicationStorage(logService) {
        return IndexedDBStorageDatabase.create({ id: 'global', broadcastChanges: true }, logService);
    }
    static async createProfileStorage(profile, logService) {
        return IndexedDBStorageDatabase.create({ id: `global-${profile.id}`, broadcastChanges: true }, logService);
    }
    static async createWorkspaceStorage(workspaceId, logService) {
        return IndexedDBStorageDatabase.create({ id: workspaceId }, logService);
    }
    static async create(options, logService) {
        try {
            const database = new IndexedDBStorageDatabase(options, logService);
            await database.whenConnected;
            return database;
        }
        catch (error) {
            logService.error(`[IndexedDB Storage ${options.id}] create(): ${toErrorMessage(error, true)}`);
            return new InMemoryIndexedDBStorageDatabase();
        }
    }
    static { this.STORAGE_DATABASE_PREFIX = 'vscode-web-state-db-'; }
    static { this.STORAGE_OBJECT_STORE = 'ItemTable'; }
    get hasPendingUpdate() { return !!this.pendingUpdate; }
    constructor(options, logService) {
        super();
        this.logService = logService;
        this._onDidChangeItemsExternal = this._register(new Emitter());
        this.onDidChangeItemsExternal = this._onDidChangeItemsExternal.event;
        this.pendingUpdate = undefined;
        this.name = `${IndexedDBStorageDatabase.STORAGE_DATABASE_PREFIX}${options.id}`;
        this.broadcastChannel = options.broadcastChanges ? this._register(new BroadcastDataChannel(this.name)) : undefined;
        this.whenConnected = this.connect();
        this.registerListeners();
    }
    registerListeners() {
        if (this.broadcastChannel) {
            this._register(this.broadcastChannel.onDidReceiveData(data => {
                if (isStorageItemsChangeEvent(data)) {
                    this._onDidChangeItemsExternal.fire(data);
                }
            }));
        }
    }
    async connect() {
        try {
            return await IndexedDB.create(this.name, undefined, [IndexedDBStorageDatabase.STORAGE_OBJECT_STORE]);
        }
        catch (error) {
            this.logService.error(`[IndexedDB Storage ${this.name}] connect() error: ${toErrorMessage(error)}`);
            throw error;
        }
    }
    async getItems() {
        const db = await this.whenConnected;
        function isValid(value) {
            return typeof value === 'string';
        }
        return db.getKeyValues(IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, isValid);
    }
    async updateItems(request) {
        let didUpdate = false;
        this.pendingUpdate = this.doUpdateItems(request);
        try {
            didUpdate = await this.pendingUpdate;
        }
        finally {
            this.pendingUpdate = undefined;
        }
        if (this.broadcastChannel && didUpdate) {
            const event = {
                changed: request.insert,
                deleted: request.delete
            };
            this.broadcastChannel.postData(event);
        }
    }
    async doUpdateItems(request) {
        const toInsert = request.insert;
        const toDelete = request.delete;
        if ((!toInsert && !toDelete) || (toInsert?.size === 0 && toDelete?.size === 0)) {
            return false;
        }
        const db = await this.whenConnected;
        await db.runInTransaction(IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, 'readwrite', objectStore => {
            const requests = [];
            if (toInsert) {
                for (const [key, value] of toInsert) {
                    requests.push(objectStore.put(value, key));
                }
            }
            if (toDelete) {
                for (const key of toDelete) {
                    requests.push(objectStore.delete(key));
                }
            }
            return requests;
        });
        return true;
    }
    async optimize() {
    }
    async close() {
        const db = await this.whenConnected;
        await this.pendingUpdate;
        return db.close();
    }
    async clear() {
        const db = await this.whenConnected;
        await db.runInTransaction(IndexedDBStorageDatabase.STORAGE_OBJECT_STORE, 'readwrite', objectStore => objectStore.clear());
    }
}
