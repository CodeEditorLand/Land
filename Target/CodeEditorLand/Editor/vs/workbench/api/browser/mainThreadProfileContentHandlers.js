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
import { Disposable, DisposableMap } from '../../../base/common/lifecycle.js';
import { revive } from '../../../base/common/marshalling.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IUserDataProfileImportExportService } from '../../services/userDataProfile/common/userDataProfile.js';
let MainThreadProfileContentHandlers = class MainThreadProfileContentHandlers extends Disposable {
    constructor(context, userDataProfileImportExportService) {
        super();
        this.userDataProfileImportExportService = userDataProfileImportExportService;
        this.registeredHandlers = this._register(new DisposableMap());
        this.proxy = context.getProxy(ExtHostContext.ExtHostProfileContentHandlers);
    }
    async $registerProfileContentHandler(id, name, description, extensionId) {
        this.registeredHandlers.set(id, this.userDataProfileImportExportService.registerProfileContentHandler(id, {
            name,
            description,
            extensionId,
            saveProfile: async (name, content, token) => {
                const result = await this.proxy.$saveProfile(id, name, content, token);
                return result ? revive(result) : null;
            },
            readProfile: async (uri, token) => {
                return this.proxy.$readProfile(id, uri, token);
            },
        }));
    }
    async $unregisterProfileContentHandler(id) {
        this.registeredHandlers.deleteAndDispose(id);
    }
};
MainThreadProfileContentHandlers = __decorate([
    extHostNamedCustomer(MainContext.MainThreadProfileContentHandlers),
    __param(1, IUserDataProfileImportExportService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadProfileContentHandlers);
export { MainThreadProfileContentHandlers };
