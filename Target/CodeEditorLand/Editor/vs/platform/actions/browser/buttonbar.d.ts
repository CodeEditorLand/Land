import { ButtonBar } from '../../../base/browser/ui/button/button.js';
import { IAction } from '../../../base/common/actions.js';
import { Event } from '../../../base/common/event.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { IToolBarRenderOptions } from './toolbar.js';
import { MenuId, IMenuService, IMenuActionOptions } from '../common/actions.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.js';
import { IContextMenuService } from '../../contextview/browser/contextView.js';
import { IHoverService } from '../../hover/browser/hover.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export type IButtonConfigProvider = (action: IAction, index: number) => {
    showIcon?: boolean;
    showLabel?: boolean;
    isSecondary?: boolean;
} | undefined;
export interface IWorkbenchButtonBarOptions {
    telemetrySource?: string;
    buttonConfigProvider?: IButtonConfigProvider;
}
export declare class WorkbenchButtonBar extends ButtonBar {
    private readonly _options;
    private readonly _contextMenuService;
    private readonly _keybindingService;
    private readonly _hoverService;
    protected readonly _store: DisposableStore;
    protected readonly _updateStore: DisposableStore;
    private readonly _actionRunner;
    private readonly _onDidChange;
    readonly onDidChange: Event<this>;
    constructor(container: HTMLElement, _options: IWorkbenchButtonBarOptions | undefined, _contextMenuService: IContextMenuService, _keybindingService: IKeybindingService, telemetryService: ITelemetryService, _hoverService: IHoverService);
    dispose(): void;
    update(actions: IAction[], secondary: IAction[]): void;
}
export interface IMenuWorkbenchButtonBarOptions extends IWorkbenchButtonBarOptions {
    menuOptions?: IMenuActionOptions;
    toolbarOptions?: IToolBarRenderOptions;
}
export declare class MenuWorkbenchButtonBar extends WorkbenchButtonBar {
    constructor(container: HTMLElement, menuId: MenuId, options: IMenuWorkbenchButtonBarOptions | undefined, menuService: IMenuService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, telemetryService: ITelemetryService, hoverService: IHoverService);
    dispose(): void;
    update(_actions: IAction[]): void;
}
