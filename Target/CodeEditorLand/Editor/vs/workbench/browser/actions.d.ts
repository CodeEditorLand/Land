import { IAction } from '../../base/common/actions.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { Event } from '../../base/common/event.js';
import { MenuId, IMenuService, IMenuActionOptions } from '../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../platform/contextkey/common/contextkey.js';
export declare class CompositeMenuActions extends Disposable {
    readonly menuId: MenuId;
    private readonly contextMenuId;
    private readonly options;
    private readonly contextKeyService;
    private readonly menuService;
    private readonly menuActions;
    private _onDidChange;
    readonly onDidChange: Event<void>;
    constructor(menuId: MenuId, contextMenuId: MenuId | undefined, options: IMenuActionOptions | undefined, contextKeyService: IContextKeyService, menuService: IMenuService);
    getPrimaryActions(): IAction[];
    getSecondaryActions(): IAction[];
    getContextMenuActions(): IAction[];
}
