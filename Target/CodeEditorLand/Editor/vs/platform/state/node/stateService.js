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
import { ThrottledDelayer } from '../../../base/common/async.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { isUndefined, isUndefinedOrNull } from '../../../base/common/types.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
export class FileStorage extends Disposable {
    constructor(storagePath, saveStrategy, logService, fileService) {
        super();
        this.storagePath = storagePath;
        this.saveStrategy = saveStrategy;
        this.logService = logService;
        this.fileService = fileService;
        this.storage = Object.create(null);
        this.lastSavedStorageContents = '';
        this.flushDelayer = this._register(new ThrottledDelayer(this.saveStrategy === 0 ? 0 : 100));
        this.initializing = undefined;
        this.closing = undefined;
    }
    init() {
        if (!this.initializing) {
            this.initializing = this.doInit();
        }
        return this.initializing;
    }
    async doInit() {
        try {
            this.lastSavedStorageContents = (await this.fileService.readFile(this.storagePath)).value.toString();
            this.storage = JSON.parse(this.lastSavedStorageContents);
        }
        catch (error) {
            if (error.fileOperationResult !== 1) {
                this.logService.error(error);
            }
        }
    }
    getItem(key, defaultValue) {
        const res = this.storage[key];
        if (isUndefinedOrNull(res)) {
            return defaultValue;
        }
        return res;
    }
    setItem(key, data) {
        this.setItems([{ key, data }]);
    }
    setItems(items) {
        let save = false;
        for (const { key, data } of items) {
            if (this.storage[key] === data) {
                continue;
            }
            if (isUndefinedOrNull(data)) {
                if (!isUndefined(this.storage[key])) {
                    this.storage[key] = undefined;
                    save = true;
                }
            }
            else {
                this.storage[key] = data;
                save = true;
            }
        }
        if (save) {
            this.save();
        }
    }
    removeItem(key) {
        if (!isUndefined(this.storage[key])) {
            this.storage[key] = undefined;
            this.save();
        }
    }
    async save() {
        if (this.closing) {
            return;
        }
        return this.flushDelayer.trigger(() => this.doSave());
    }
    async doSave() {
        if (!this.initializing) {
            return;
        }
        await this.initializing;
        const serializedDatabase = JSON.stringify(this.storage, null, 4);
        if (serializedDatabase === this.lastSavedStorageContents) {
            return;
        }
        try {
            await this.fileService.writeFile(this.storagePath, VSBuffer.fromString(serializedDatabase), { atomic: { postfix: '.vsctmp' } });
            this.lastSavedStorageContents = serializedDatabase;
        }
        catch (error) {
            this.logService.error(error);
        }
    }
    async close() {
        if (!this.closing) {
            this.closing = this.flushDelayer.trigger(() => this.doSave(), 0);
        }
        return this.closing;
    }
}
let StateReadonlyService = class StateReadonlyService extends Disposable {
    constructor(saveStrategy, environmentService, logService, fileService) {
        super();
        this.fileStorage = this._register(new FileStorage(environmentService.stateResource, saveStrategy, logService, fileService));
    }
    async init() {
        await this.fileStorage.init();
    }
    getItem(key, defaultValue) {
        return this.fileStorage.getItem(key, defaultValue);
    }
};
StateReadonlyService = __decorate([
    __param(1, IEnvironmentService),
    __param(2, ILogService),
    __param(3, IFileService),
    __metadata("design:paramtypes", [Number, Object, Object, Object])
], StateReadonlyService);
export { StateReadonlyService };
export class StateService extends StateReadonlyService {
    setItem(key, data) {
        this.fileStorage.setItem(key, data);
    }
    setItems(items) {
        this.fileStorage.setItems(items);
    }
    removeItem(key) {
        this.fileStorage.removeItem(key);
    }
    close() {
        return this.fileStorage.close();
    }
}
