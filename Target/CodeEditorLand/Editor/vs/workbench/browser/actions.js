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
import { Disposable, DisposableStore } from '../../base/common/lifecycle.js';
import { Emitter } from '../../base/common/event.js';
import { MenuId, IMenuService, SubmenuItemAction } from '../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../platform/contextkey/common/contextkey.js';
import { createAndFillInActionBarActions } from '../../platform/actions/browser/menuEntryActionViewItem.js';
class MenuActions extends Disposable {
    get primaryActions() { return this._primaryActions; }
    get secondaryActions() { return this._secondaryActions; }
    constructor(menuId, options, menuService, contextKeyService) {
        super();
        this.options = options;
        this.menuService = menuService;
        this.contextKeyService = contextKeyService;
        this._primaryActions = [];
        this._secondaryActions = [];
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.disposables = this._register(new DisposableStore());
        this.menu = this._register(menuService.createMenu(menuId, contextKeyService));
        this._register(this.menu.onDidChange(() => this.updateActions()));
        this.updateActions();
    }
    updateActions() {
        this.disposables.clear();
        this._primaryActions = [];
        this._secondaryActions = [];
        createAndFillInActionBarActions(this.menu, this.options, { primary: this._primaryActions, secondary: this._secondaryActions });
        this.disposables.add(this.updateSubmenus([...this._primaryActions, ...this._secondaryActions], {}));
        this._onDidChange.fire();
    }
    updateSubmenus(actions, submenus) {
        const disposables = new DisposableStore();
        for (const action of actions) {
            if (action instanceof SubmenuItemAction && !submenus[action.item.submenu.id]) {
                const menu = submenus[action.item.submenu.id] = disposables.add(this.menuService.createMenu(action.item.submenu, this.contextKeyService));
                disposables.add(menu.onDidChange(() => this.updateActions()));
                disposables.add(this.updateSubmenus(action.actions, submenus));
            }
        }
        return disposables;
    }
}
let CompositeMenuActions = class CompositeMenuActions extends Disposable {
    constructor(menuId, contextMenuId, options, contextKeyService, menuService) {
        super();
        this.menuId = menuId;
        this.contextMenuId = contextMenuId;
        this.options = options;
        this.contextKeyService = contextKeyService;
        this.menuService = menuService;
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this.menuActions = this._register(new MenuActions(menuId, this.options, menuService, contextKeyService));
        this._register(this.menuActions.onDidChange(() => this._onDidChange.fire()));
    }
    getPrimaryActions() {
        return this.menuActions.primaryActions;
    }
    getSecondaryActions() {
        return this.menuActions.secondaryActions;
    }
    getContextMenuActions() {
        const actions = [];
        if (this.contextMenuId) {
            const menu = this.menuService.getMenuActions(this.contextMenuId, this.contextKeyService, this.options);
            createAndFillInActionBarActions(menu, { primary: [], secondary: actions });
        }
        return actions;
    }
};
CompositeMenuActions = __decorate([
    __param(3, IContextKeyService),
    __param(4, IMenuService),
    __metadata("design:paramtypes", [MenuId, Object, Object, Object, Object])
], CompositeMenuActions);
export { CompositeMenuActions };
