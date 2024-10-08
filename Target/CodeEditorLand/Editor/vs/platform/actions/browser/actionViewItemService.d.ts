import { IActionViewItemProvider } from '../../../base/browser/ui/actionbar/actionbar.js';
import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { MenuId } from '../common/actions.js';
export declare const IActionViewItemService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IActionViewItemService>;
export interface IActionViewItemService {
    _serviceBrand: undefined;
    onDidChange: Event<MenuId>;
    register(menu: MenuId, submenu: MenuId, provider: IActionViewItemProvider, event?: Event<unknown>): IDisposable;
    register(menu: MenuId, commandId: string, provider: IActionViewItemProvider, event?: Event<unknown>): IDisposable;
    lookUp(menu: MenuId, submenu: MenuId): IActionViewItemProvider | undefined;
    lookUp(menu: MenuId, commandId: string): IActionViewItemProvider | undefined;
}
export declare class NullActionViewItemService implements IActionViewItemService {
    _serviceBrand: undefined;
    onDidChange: Event<MenuId>;
    register(menu: MenuId, commandId: string | MenuId, provider: IActionViewItemProvider, event?: Event<unknown>): IDisposable;
    lookUp(menu: MenuId, commandId: string | MenuId): IActionViewItemProvider | undefined;
}
