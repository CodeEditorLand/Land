import { IToolBarOptions, ToolBar } from '../../../base/browser/ui/toolbar/toolbar.js';
import { IAction, SubmenuAction } from '../../../base/common/actions.js';
import { Event } from '../../../base/common/event.js';
import { IMenuActionOptions, IMenuService, MenuId } from '../common/actions.js';
import { ICommandService } from '../../commands/common/commands.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.js';
import { IContextMenuService } from '../../contextview/browser/contextView.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IActionViewItemService } from './actionViewItemService.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
export declare const enum HiddenItemStrategy {
    NoHide = -1,
    Ignore = 0,
    RenderInSecondaryGroup = 1
}
export type IWorkbenchToolBarOptions = IToolBarOptions & {
    hiddenItemStrategy?: HiddenItemStrategy;
    resetMenu?: MenuId;
    contextMenu?: MenuId;
    menuOptions?: IMenuActionOptions;
    telemetrySource?: string;
    allowContextMenu?: never;
    overflowBehavior?: {
        maxItems: number;
        exempted?: string[];
    };
};
export declare class WorkbenchToolBar extends ToolBar {
    private _options;
    private readonly _menuService;
    private readonly _contextKeyService;
    private readonly _contextMenuService;
    private readonly _keybindingService;
    private readonly _commandService;
    private readonly _sessionDisposables;
    constructor(container: HTMLElement, _options: IWorkbenchToolBarOptions | undefined, _menuService: IMenuService, _contextKeyService: IContextKeyService, _contextMenuService: IContextMenuService, _keybindingService: IKeybindingService, _commandService: ICommandService, telemetryService: ITelemetryService);
    setActions(_primary: readonly IAction[], _secondary?: readonly IAction[], menuIds?: readonly MenuId[]): void;
}
export interface IToolBarRenderOptions {
    primaryGroup?: string | ((actionGroup: string) => boolean);
    shouldInlineSubmenu?: (action: SubmenuAction, group: string, groupSize: number) => boolean;
    useSeparatorsInPrimaryActions?: boolean;
}
export interface IMenuWorkbenchToolBarOptions extends IWorkbenchToolBarOptions {
    toolbarOptions?: IToolBarRenderOptions;
    resetMenu?: undefined;
    eventDebounceDelay?: number;
}
export declare class MenuWorkbenchToolBar extends WorkbenchToolBar {
    private readonly _onDidChangeMenuItems;
    readonly onDidChangeMenuItems: Event<this>;
    constructor(container: HTMLElement, menuId: MenuId, options: IMenuWorkbenchToolBarOptions | undefined, menuService: IMenuService, contextKeyService: IContextKeyService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, commandService: ICommandService, telemetryService: ITelemetryService, actionViewService: IActionViewItemService, instaService: IInstantiationService);
    setActions(): void;
}
