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
import { Disposable } from '../../../base/common/lifecycle.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { SequencerByKey } from '../../../base/common/async.js';
import { ISecretStorageService } from '../../../platform/secrets/common/secrets.js';
import { IBrowserWorkbenchEnvironmentService } from '../../services/environment/browser/environmentService.js';
let MainThreadSecretState = class MainThreadSecretState extends Disposable {
    constructor(extHostContext, secretStorageService, logService, environmentService) {
        super();
        this.secretStorageService = secretStorageService;
        this.logService = logService;
        this._sequencer = new SequencerByKey();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostSecretState);
        this._register(this.secretStorageService.onDidChangeSecret((e) => {
            try {
                const { extensionId, key } = this.parseKey(e);
                if (extensionId && key) {
                    this._proxy.$onDidChangePassword({ extensionId, key });
                }
            }
            catch (e) {
            }
        }));
    }
    $getPassword(extensionId, key) {
        this.logService.trace(`[mainThreadSecretState] Getting password for ${extensionId} extension: `, key);
        return this._sequencer.queue(extensionId, () => this.doGetPassword(extensionId, key));
    }
    async doGetPassword(extensionId, key) {
        const fullKey = this.getKey(extensionId, key);
        const password = await this.secretStorageService.get(fullKey);
        this.logService.trace(`[mainThreadSecretState] ${password ? 'P' : 'No p'}assword found for: `, extensionId, key);
        return password;
    }
    $setPassword(extensionId, key, value) {
        this.logService.trace(`[mainThreadSecretState] Setting password for ${extensionId} extension: `, key);
        return this._sequencer.queue(extensionId, () => this.doSetPassword(extensionId, key, value));
    }
    async doSetPassword(extensionId, key, value) {
        const fullKey = this.getKey(extensionId, key);
        await this.secretStorageService.set(fullKey, value);
        this.logService.trace('[mainThreadSecretState] Password set for: ', extensionId, key);
    }
    $deletePassword(extensionId, key) {
        this.logService.trace(`[mainThreadSecretState] Deleting password for ${extensionId} extension: `, key);
        return this._sequencer.queue(extensionId, () => this.doDeletePassword(extensionId, key));
    }
    async doDeletePassword(extensionId, key) {
        const fullKey = this.getKey(extensionId, key);
        await this.secretStorageService.delete(fullKey);
        this.logService.trace('[mainThreadSecretState] Password deleted for: ', extensionId, key);
    }
    getKey(extensionId, key) {
        return JSON.stringify({ extensionId, key });
    }
    parseKey(key) {
        return JSON.parse(key);
    }
};
MainThreadSecretState = __decorate([
    extHostNamedCustomer(MainContext.MainThreadSecretState),
    __param(1, ISecretStorageService),
    __param(2, ILogService),
    __param(3, IBrowserWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], MainThreadSecretState);
export { MainThreadSecretState };
