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
import { URI } from '../../../base/common/uri.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { AbstractStorageService, isProfileUsingDefaultStorage } from '../common/storage.js';
import { ApplicationStorageMain, ProfileStorageMain, InMemoryStorageMain, WorkspaceStorageMain } from './storageMain.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataProfilesMainService } from '../../userDataProfile/electron-main/userDataProfile.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { Schemas } from '../../../base/common/network.js';
export const IStorageMainService = createDecorator('storageMainService');
let StorageMainService = class StorageMainService extends Disposable {
    constructor(logService, environmentService, userDataProfilesService, lifecycleMainService, fileService, uriIdentityService) {
        super();
        this.logService = logService;
        this.environmentService = environmentService;
        this.userDataProfilesService = userDataProfilesService;
        this.lifecycleMainService = lifecycleMainService;
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
        this.shutdownReason = undefined;
        this._onDidChangeProfileStorage = this._register(new Emitter());
        this.onDidChangeProfileStorage = this._onDidChangeProfileStorage.event;
        this.applicationStorage = this._register(this.createApplicationStorage());
        this.mapProfileToStorage = new Map();
        this.mapWorkspaceToStorage = new Map();
        this.registerListeners();
    }
    getStorageOptions() {
        return {
            useInMemoryStorage: !!this.environmentService.extensionTestsLocationURI
        };
    }
    registerListeners() {
        (async () => {
            await this.lifecycleMainService.when(3);
            this.applicationStorage.init();
        })();
        this._register(this.lifecycleMainService.onWillLoadWindow(e => {
            if (e.window.profile) {
                this.profileStorage(e.window.profile).init();
            }
            if (e.workspace) {
                this.workspaceStorage(e.workspace).init();
            }
        }));
        this._register(this.lifecycleMainService.onWillShutdown(e => {
            this.logService.trace('storageMainService#onWillShutdown()');
            this.shutdownReason = e.reason;
            e.join('applicationStorage', this.applicationStorage.close());
            for (const [, profileStorage] of this.mapProfileToStorage) {
                e.join('profileStorage', profileStorage.close());
            }
            for (const [, workspaceStorage] of this.mapWorkspaceToStorage) {
                e.join('workspaceStorage', workspaceStorage.close());
            }
        }));
        this._register(this.userDataProfilesService.onWillCreateProfile(e => {
            e.join((async () => {
                if (!(await this.fileService.exists(e.profile.globalStorageHome))) {
                    await this.fileService.createFolder(e.profile.globalStorageHome);
                }
            })());
        }));
        this._register(this.userDataProfilesService.onWillRemoveProfile(e => {
            const storage = this.mapProfileToStorage.get(e.profile.id);
            if (storage) {
                e.join(storage.close());
            }
        }));
    }
    createApplicationStorage() {
        this.logService.trace(`StorageMainService: creating application storage`);
        const applicationStorage = new ApplicationStorageMain(this.getStorageOptions(), this.userDataProfilesService, this.logService, this.fileService);
        this._register(Event.once(applicationStorage.onDidCloseStorage)(() => {
            this.logService.trace(`StorageMainService: closed application storage`);
        }));
        return applicationStorage;
    }
    profileStorage(profile) {
        if (isProfileUsingDefaultStorage(profile)) {
            return this.applicationStorage;
        }
        let profileStorage = this.mapProfileToStorage.get(profile.id);
        if (!profileStorage) {
            this.logService.trace(`StorageMainService: creating profile storage (${profile.name})`);
            profileStorage = this._register(this.createProfileStorage(profile));
            this.mapProfileToStorage.set(profile.id, profileStorage);
            const listener = this._register(profileStorage.onDidChangeStorage(e => this._onDidChangeProfileStorage.fire({
                ...e,
                storage: profileStorage,
                profile
            })));
            this._register(Event.once(profileStorage.onDidCloseStorage)(() => {
                this.logService.trace(`StorageMainService: closed profile storage (${profile.name})`);
                this.mapProfileToStorage.delete(profile.id);
                listener.dispose();
            }));
        }
        return profileStorage;
    }
    createProfileStorage(profile) {
        if (this.shutdownReason === 2) {
            return new InMemoryStorageMain(this.logService, this.fileService);
        }
        return new ProfileStorageMain(profile, this.getStorageOptions(), this.logService, this.fileService);
    }
    workspaceStorage(workspace) {
        let workspaceStorage = this.mapWorkspaceToStorage.get(workspace.id);
        if (!workspaceStorage) {
            this.logService.trace(`StorageMainService: creating workspace storage (${workspace.id})`);
            workspaceStorage = this._register(this.createWorkspaceStorage(workspace));
            this.mapWorkspaceToStorage.set(workspace.id, workspaceStorage);
            this._register(Event.once(workspaceStorage.onDidCloseStorage)(() => {
                this.logService.trace(`StorageMainService: closed workspace storage (${workspace.id})`);
                this.mapWorkspaceToStorage.delete(workspace.id);
            }));
        }
        return workspaceStorage;
    }
    createWorkspaceStorage(workspace) {
        if (this.shutdownReason === 2) {
            return new InMemoryStorageMain(this.logService, this.fileService);
        }
        return new WorkspaceStorageMain(workspace, this.getStorageOptions(), this.logService, this.environmentService, this.fileService);
    }
    isUsed(path) {
        const pathUri = URI.file(path);
        for (const storage of [this.applicationStorage, ...this.mapProfileToStorage.values(), ...this.mapWorkspaceToStorage.values()]) {
            if (!storage.path) {
                continue;
            }
            if (this.uriIdentityService.extUri.isEqualOrParent(URI.file(storage.path), pathUri)) {
                return true;
            }
        }
        return false;
    }
};
StorageMainService = __decorate([
    __param(0, ILogService),
    __param(1, IEnvironmentService),
    __param(2, IUserDataProfilesMainService),
    __param(3, ILifecycleMainService),
    __param(4, IFileService),
    __param(5, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], StorageMainService);
export { StorageMainService };
export const IApplicationStorageMainService = createDecorator('applicationStorageMainService');
let ApplicationStorageMainService = class ApplicationStorageMainService extends AbstractStorageService {
    constructor(userDataProfilesService, storageMainService) {
        super();
        this.userDataProfilesService = userDataProfilesService;
        this.storageMainService = storageMainService;
        this.whenReady = this.storageMainService.applicationStorage.whenInit;
    }
    doInitialize() {
        return this.storageMainService.applicationStorage.whenInit;
    }
    getStorage(scope) {
        if (scope === -1) {
            return this.storageMainService.applicationStorage.storage;
        }
        return undefined;
    }
    getLogDetails(scope) {
        if (scope === -1) {
            return this.userDataProfilesService.defaultProfile.globalStorageHome.with({ scheme: Schemas.file }).fsPath;
        }
        return undefined;
    }
    shouldFlushWhenIdle() {
        return false;
    }
    switch() {
        throw new Error('Migrating storage is unsupported from main process');
    }
    switchToProfile() {
        throw new Error('Switching storage profile is unsupported from main process');
    }
    switchToWorkspace() {
        throw new Error('Switching storage workspace is unsupported from main process');
    }
    hasScope() {
        throw new Error('Main process is never profile or workspace scoped');
    }
};
ApplicationStorageMainService = __decorate([
    __param(0, IUserDataProfilesService),
    __param(1, IStorageMainService),
    __metadata("design:paramtypes", [Object, Object])
], ApplicationStorageMainService);
export { ApplicationStorageMainService };
