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
import { ILabelService } from '../../../platform/label/common/label.js';
import { MainContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
let MainThreadLabelService = class MainThreadLabelService extends Disposable {
    constructor(_, _labelService) {
        super();
        this._labelService = _labelService;
        this._resourceLabelFormatters = this._register(new DisposableMap());
    }
    $registerResourceLabelFormatter(handle, formatter) {
        formatter.priority = true;
        const disposable = this._labelService.registerCachedFormatter(formatter);
        this._resourceLabelFormatters.set(handle, disposable);
    }
    $unregisterResourceLabelFormatter(handle) {
        this._resourceLabelFormatters.deleteAndDispose(handle);
    }
};
MainThreadLabelService = __decorate([
    extHostNamedCustomer(MainContext.MainThreadLabelService),
    __param(1, ILabelService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadLabelService);
export { MainThreadLabelService };
