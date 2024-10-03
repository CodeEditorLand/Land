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
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ListResizeColumnAction } from './listResizeColumnAction.js';
let ListContext = class ListContext {
    static { this.ID = 'workbench.contrib.listContext'; }
    constructor(contextKeyService) {
        contextKeyService.createKey('listSupportsTypeNavigation', true);
        contextKeyService.createKey('listSupportsKeyboardNavigation', true);
    }
};
ListContext = __decorate([
    __param(0, IContextKeyService),
    __metadata("design:paramtypes", [Object])
], ListContext);
export { ListContext };
registerWorkbenchContribution2(ListContext.ID, ListContext, 1);
registerAction2(ListResizeColumnAction);
