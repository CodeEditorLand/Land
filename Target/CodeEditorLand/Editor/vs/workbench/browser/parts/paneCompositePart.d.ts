import './media/paneCompositePart.css';
import { Event } from '../../../base/common/event.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IProgressIndicator } from '../../../platform/progress/common/progress.js';
import { PaneComposite, PaneCompositeDescriptor } from '../panecomposite.js';
import { IPaneComposite } from '../../common/panecomposite.js';
import { IViewDescriptorService } from '../../common/views.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { IView } from '../../../base/browser/ui/grid/grid.js';
import { IWorkbenchLayoutService, Parts } from '../../services/layout/browser/layoutService.js';
import { CompositePart, ICompositeTitleLabel } from './compositePart.js';
import { IPaneCompositeBarOptions, PaneCompositeBar } from './paneCompositeBar.js';
import { Dimension } from '../../../base/browser/dom.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../platform/storage/common/storage.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { IContextKey, IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
import { IPartOptions } from '../part.js';
import { IMenuService } from '../../../platform/actions/common/actions.js';
import { SubmenuAction } from '../../../base/common/actions.js';
import { Composite } from '../composite.js';
import { IHoverService } from '../../../platform/hover/browser/hover.js';
export declare enum CompositeBarPosition {
    TOP = 0,
    TITLE = 1,
    BOTTOM = 2
}
export interface IPaneCompositePart extends IView {
    readonly partId: Parts.PANEL_PART | Parts.AUXILIARYBAR_PART | Parts.SIDEBAR_PART;
    readonly onDidPaneCompositeOpen: Event<IPaneComposite>;
    readonly onDidPaneCompositeClose: Event<IPaneComposite>;
    /**
     * Opens a viewlet with the given identifier and pass keyboard focus to it if specified.
     */
    openPaneComposite(id: string | undefined, focus?: boolean): Promise<IPaneComposite | undefined>;
    /**
     * Returns the current active viewlet if any.
     */
    getActivePaneComposite(): IPaneComposite | undefined;
    /**
     * Returns the viewlet by id.
     */
    getPaneComposite(id: string): PaneCompositeDescriptor | undefined;
    /**
     * Returns all enabled viewlets
     */
    getPaneComposites(): PaneCompositeDescriptor[];
    /**
     * Returns the progress indicator for the side bar.
     */
    getProgressIndicator(id: string): IProgressIndicator | undefined;
    /**
     * Hide the active viewlet.
     */
    hideActivePaneComposite(): void;
    /**
     * Return the last active viewlet id.
     */
    getLastActivePaneCompositeId(): string;
    /**
     * Returns id of pinned view containers following the visual order.
     */
    getPinnedPaneCompositeIds(): string[];
    /**
     * Returns id of visible view containers following the visual order.
     */
    getVisiblePaneCompositeIds(): string[];
}
export declare abstract class AbstractPaneCompositePart extends CompositePart<PaneComposite> implements IPaneCompositePart {
    readonly partId: Parts.PANEL_PART | Parts.AUXILIARYBAR_PART | Parts.SIDEBAR_PART;
    private readonly activePaneContextKey;
    private paneFocusContextKey;
    private readonly viewDescriptorService;
    protected readonly contextKeyService: IContextKeyService;
    private readonly extensionService;
    protected readonly menuService: IMenuService;
    private static readonly MIN_COMPOSITE_BAR_WIDTH;
    get snap(): boolean;
    get onDidPaneCompositeOpen(): Event<IPaneComposite>;
    readonly onDidPaneCompositeClose: Event<IPaneComposite>;
    private readonly location;
    private titleContainer;
    private headerFooterCompositeBarContainer;
    protected readonly headerFooterCompositeBarDispoables: DisposableStore;
    private paneCompositeBarContainer;
    private readonly paneCompositeBar;
    private compositeBarPosition;
    private emptyPaneMessageElement;
    private globalToolBar;
    private readonly globalActions;
    private blockOpening;
    protected contentDimension: Dimension | undefined;
    constructor(partId: Parts.PANEL_PART | Parts.AUXILIARYBAR_PART | Parts.SIDEBAR_PART, partOptions: IPartOptions, activePaneCompositeSettingsKey: string, activePaneContextKey: IContextKey<string>, paneFocusContextKey: IContextKey<boolean>, nameForTelemetry: string, compositeCSSClass: string, titleForegroundColor: string | undefined, notificationService: INotificationService, storageService: IStorageService, contextMenuService: IContextMenuService, layoutService: IWorkbenchLayoutService, keybindingService: IKeybindingService, hoverService: IHoverService, instantiationService: IInstantiationService, themeService: IThemeService, viewDescriptorService: IViewDescriptorService, contextKeyService: IContextKeyService, extensionService: IExtensionService, menuService: IMenuService);
    private registerListeners;
    private onDidOpen;
    private onDidClose;
    protected showComposite(composite: Composite): void;
    protected hideActiveComposite(): Composite | undefined;
    create(parent: HTMLElement): void;
    private createEmptyPaneMessage;
    protected createTitleArea(parent: HTMLElement): HTMLElement;
    protected createTitleLabel(parent: HTMLElement): ICompositeTitleLabel;
    protected updateCompositeBar(updateCompositeBarOption?: boolean): void;
    protected createHeaderArea(): HTMLElement;
    protected createFooterArea(): HTMLElement;
    protected createHeaderFooterCompositeBarArea(area: HTMLElement): HTMLElement;
    private removeFooterHeaderArea;
    protected createCompositeBar(): PaneCompositeBar;
    protected onTitleAreaUpdate(compositeId: string): void;
    openPaneComposite(id?: string, focus?: boolean): Promise<PaneComposite | undefined>;
    private doOpenPaneComposite;
    getPaneComposite(id: string): PaneCompositeDescriptor | undefined;
    getPaneComposites(): PaneCompositeDescriptor[];
    getPinnedPaneCompositeIds(): string[];
    getVisiblePaneCompositeIds(): string[];
    getActivePaneComposite(): IPaneComposite | undefined;
    getLastActivePaneCompositeId(): string;
    hideActivePaneComposite(): void;
    protected focusCompositeBar(): void;
    layout(width: number, height: number, top: number, left: number): void;
    private layoutCompositeBar;
    private layoutEmptyMessage;
    private updateGlobalToolbarActions;
    protected getToolbarWidth(): number;
    private onTitleAreaContextMenu;
    private onCompositeBarAreaContextMenu;
    private onCompositeBarContextMenu;
    protected getViewsSubmenuAction(): SubmenuAction | undefined;
    protected abstract shouldShowCompositeBar(): boolean;
    protected abstract getCompositeBarOptions(): IPaneCompositeBarOptions;
    protected abstract getCompositeBarPosition(): CompositeBarPosition;
}
