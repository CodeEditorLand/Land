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
import { mainWindow } from '../../../../base/browser/window.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { BrowserWindowDriver } from '../browser/driver.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
let NativeWindowDriver = class NativeWindowDriver extends BrowserWindowDriver {
    constructor(helper, fileService, environmentService, lifecycleService, logService) {
        super(fileService, environmentService, lifecycleService, logService);
        this.helper = helper;
    }
    exitApplication() {
        return this.helper.exitApplication();
    }
};
NativeWindowDriver = __decorate([
    __param(1, IFileService),
    __param(2, IEnvironmentService),
    __param(3, ILifecycleService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], NativeWindowDriver);
export function registerWindowDriver(instantiationService, helper) {
    Object.assign(mainWindow, { driver: instantiationService.createInstance(NativeWindowDriver, helper) });
}
