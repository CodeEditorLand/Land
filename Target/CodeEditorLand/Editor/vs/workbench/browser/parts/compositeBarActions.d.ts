import { Action, IAction } from '../../../base/common/actions.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IThemeService, IColorTheme } from '../../../platform/theme/common/themeService.js';
import { IBadge, IActivity } from '../../services/activity/common/activity.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { Event } from '../../../base/common/event.js';
import { ICompositeDragAndDrop } from '../dnd.js';
import { Color } from '../../../base/common/color.js';
import { BaseActionViewItem, IActionViewItemOptions } from '../../../base/browser/ui/actionbar/actionViewItems.js';
import { IHoverService } from '../../../platform/hover/browser/hover.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { HoverPosition } from '../../../base/browser/ui/hover/hoverWidget.js';
import { URI } from '../../../base/common/uri.js';
export interface ICompositeBar {
    unpin(compositeId: string): void;
    pin(compositeId: string): void;
    isPinned(compositeId: string): boolean;
    getPinnedCompositeIds(): string[];
    areBadgesEnabled(compositeId: string): boolean;
    toggleBadgeEnablement(compositeId: string): void;
    move(compositeId: string, tocompositeId: string): void;
}
export interface ICompositeBarActionItem {
    id: string;
    name: string;
    keybindingId?: string;
    classNames?: string[];
    iconUrl?: URI;
}
export declare class CompositeBarAction extends Action {
    private item;
    private readonly _onDidChangeCompositeBarActionItem;
    readonly onDidChangeCompositeBarActionItem: Event<CompositeBarAction>;
    private readonly _onDidChangeActivity;
    readonly onDidChangeActivity: Event<IActivity | undefined>;
    private _activity;
    constructor(item: ICompositeBarActionItem);
    get compositeBarActionItem(): ICompositeBarActionItem;
    set compositeBarActionItem(item: ICompositeBarActionItem);
    get activity(): IActivity | undefined;
    set activity(activity: IActivity | undefined);
    activate(): void;
    deactivate(): void;
}
export interface ICompositeBarColors {
    readonly activeBackgroundColor?: Color;
    readonly inactiveBackgroundColor?: Color;
    readonly activeBorderColor?: Color;
    readonly activeBackground?: Color;
    readonly activeBorderBottomColor?: Color;
    readonly activeForegroundColor?: Color;
    readonly inactiveForegroundColor?: Color;
    readonly badgeBackground?: Color;
    readonly badgeForeground?: Color;
    readonly dragAndDropBorder?: Color;
}
export interface IActivityHoverOptions {
    readonly position: () => HoverPosition;
}
export interface ICompositeBarActionViewItemOptions extends IActionViewItemOptions {
    readonly icon?: boolean;
    readonly colors: (theme: IColorTheme) => ICompositeBarColors;
    readonly hoverOptions: IActivityHoverOptions;
    readonly hasPopup?: boolean;
    readonly compact?: boolean;
}
export declare class CompositeBarActionViewItem extends BaseActionViewItem {
    private readonly badgesEnabled;
    protected readonly themeService: IThemeService;
    private readonly hoverService;
    protected readonly configurationService: IConfigurationService;
    protected readonly keybindingService: IKeybindingService;
    private static hoverLeaveTime;
    protected container: HTMLElement;
    protected label: HTMLElement;
    protected badge: HTMLElement;
    protected readonly options: ICompositeBarActionViewItemOptions;
    private badgeContent;
    private readonly badgeDisposable;
    private mouseUpTimeout;
    private keybindingLabel;
    private readonly hoverDisposables;
    private lastHover;
    private readonly showHoverScheduler;
    constructor(action: CompositeBarAction, options: ICompositeBarActionViewItemOptions, badgesEnabled: (compositeId: string) => boolean, themeService: IThemeService, hoverService: IHoverService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    protected get compositeBarActionItem(): ICompositeBarActionItem;
    protected updateStyles(): void;
    render(container: HTMLElement): void;
    private onThemeChange;
    protected update(): void;
    private getActivity;
    protected updateActivity(): void;
    protected updateLabel(): void;
    private updateTitle;
    protected computeTitle(): string;
    private computeKeybindingLabel;
    private updateHover;
    showHover(skipFadeInAnimation?: boolean): void;
    dispose(): void;
}
export declare class CompositeOverflowActivityAction extends CompositeBarAction {
    private showMenu;
    constructor(showMenu: () => void);
    run(): Promise<void>;
}
export declare class CompositeOverflowActivityActionViewItem extends CompositeBarActionViewItem {
    private getOverflowingComposites;
    private getActiveCompositeId;
    private getBadge;
    private getCompositeOpenAction;
    private readonly contextMenuService;
    constructor(action: CompositeBarAction, getOverflowingComposites: () => {
        id: string;
        name?: string;
    }[], getActiveCompositeId: () => string | undefined, getBadge: (compositeId: string) => IBadge, getCompositeOpenAction: (compositeId: string) => IAction, colors: (theme: IColorTheme) => ICompositeBarColors, hoverOptions: IActivityHoverOptions, contextMenuService: IContextMenuService, themeService: IThemeService, hoverService: IHoverService, configurationService: IConfigurationService, keybindingService: IKeybindingService);
    showMenu(): void;
    private getActions;
}
export declare class CompositeActionViewItem extends CompositeBarActionViewItem {
    private readonly compositeActivityAction;
    private readonly toggleCompositePinnedAction;
    private readonly toggleCompositeBadgeAction;
    private readonly compositeContextMenuActionsProvider;
    private readonly contextMenuActionsProvider;
    private readonly dndHandler;
    private readonly compositeBar;
    private readonly contextMenuService;
    private static manageExtensionAction;
    constructor(options: ICompositeBarActionViewItemOptions, compositeActivityAction: CompositeBarAction, toggleCompositePinnedAction: IAction, toggleCompositeBadgeAction: IAction, compositeContextMenuActionsProvider: (compositeId: string) => IAction[], contextMenuActionsProvider: () => IAction[], dndHandler: ICompositeDragAndDrop, compositeBar: ICompositeBar, contextMenuService: IContextMenuService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, themeService: IThemeService, hoverService: IHoverService, configurationService: IConfigurationService);
    render(container: HTMLElement): void;
    private updateFromDragging;
    private showContextMenu;
    protected updateChecked(): void;
    protected updateEnabled(): void;
    dispose(): void;
}
export declare class ToggleCompositePinnedAction extends Action {
    private activity;
    private compositeBar;
    constructor(activity: ICompositeBarActionItem | undefined, compositeBar: ICompositeBar);
    run(context: string): Promise<void>;
}
export declare class ToggleCompositeBadgeAction extends Action {
    private compositeBarActionItem;
    private compositeBar;
    constructor(compositeBarActionItem: ICompositeBarActionItem | undefined, compositeBar: ICompositeBar);
    run(context: string): Promise<void>;
}
