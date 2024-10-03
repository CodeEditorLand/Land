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
import { createDecorator, IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { Menubar } from './menubar.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export const IMenubarMainService = createDecorator('menubarMainService');
let MenubarMainService = class MenubarMainService extends Disposable {
    constructor(instantiationService, lifecycleMainService, logService) {
        super();
        this.instantiationService = instantiationService;
        this.lifecycleMainService = lifecycleMainService;
        this.logService = logService;
        this.menubar = this.installMenuBarAfterWindowOpen();
    }
    async installMenuBarAfterWindowOpen() {
        await this.lifecycleMainService.when(3);
        return this._register(this.instantiationService.createInstance(Menubar));
    }
    async updateMenubar(windowId, menus) {
        this.logService.trace('menubarService#updateMenubar', windowId);
        const menubar = await this.menubar;
        menubar.updateMenu(menus, windowId);
    }
};
MenubarMainService = __decorate([
    __param(0, IInstantiationService),
    __param(1, ILifecycleMainService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MenubarMainService);
export { MenubarMainService };
