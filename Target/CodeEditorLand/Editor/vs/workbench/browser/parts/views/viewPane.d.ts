import './media/paneviewlet.css';
import { Event, Emitter } from '../../../../base/common/event.js';
import { Action, IAction, IActionRunner } from '../../../../base/common/actions.js';
import { IActionViewItem } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { IPaneOptions, Pane, IPaneStyles } from '../../../../base/browser/ui/splitview/paneview.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IView, IViewDescriptorService, ViewContainerLocation } from '../../../common/views.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { PartialExcept } from '../../../../base/common/types.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { MenuId, Action2, IAction2Options } from '../../../../platform/actions/common/actions.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProgressIndicator } from '../../../../platform/progress/common/progress.js';
import { CompositeMenuActions } from '../../actions.js';
import { IDropdownMenuActionViewItemOptions } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { FilterWidget, IFilterWidgetOptions } from './viewFilter.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IListStyles } from '../../../../base/browser/ui/list/listWidget.js';
import { IAccessibleViewInformationService } from '../../../services/accessibility/common/accessibleViewInformationService.js';
export declare enum ViewPaneShowActions {
    Default = 0,
    WhenExpanded = 1,
    Always = 2
}
export interface IViewPaneOptions extends IPaneOptions {
    readonly id: string;
    readonly showActions?: ViewPaneShowActions;
    readonly titleMenuId?: MenuId;
    readonly donotForwardArgs?: boolean;
    readonly singleViewPaneContainerTitle?: string;
}
export interface IFilterViewPaneOptions extends IViewPaneOptions {
    filterOptions: IFilterWidgetOptions;
}
export declare const VIEWPANE_FILTER_ACTION: Action;
export declare abstract class ViewPane extends Pane implements IView {
    protected keybindingService: IKeybindingService;
    protected contextMenuService: IContextMenuService;
    protected readonly configurationService: IConfigurationService;
    protected contextKeyService: IContextKeyService;
    protected viewDescriptorService: IViewDescriptorService;
    protected instantiationService: IInstantiationService;
    protected openerService: IOpenerService;
    protected themeService: IThemeService;
    protected telemetryService: ITelemetryService;
    protected readonly hoverService: IHoverService;
    protected readonly accessibleViewInformationService?: IAccessibleViewInformationService | undefined;
    private static readonly AlwaysShowActionsConfig;
    private _onDidFocus;
    readonly onDidFocus: Event<void>;
    private _onDidBlur;
    readonly onDidBlur: Event<void>;
    private _onDidChangeBodyVisibility;
    readonly onDidChangeBodyVisibility: Event<boolean>;
    protected _onDidChangeTitleArea: Emitter<void>;
    readonly onDidChangeTitleArea: Event<void>;
    protected _onDidChangeViewWelcomeState: Emitter<void>;
    readonly onDidChangeViewWelcomeState: Event<void>;
    private _isVisible;
    readonly id: string;
    private _title;
    get title(): string;
    private _titleDescription;
    get titleDescription(): string | undefined;
    private _singleViewPaneContainerTitle;
    get singleViewPaneContainerTitle(): string | undefined;
    readonly menuActions: CompositeMenuActions;
    private progressBar;
    private progressIndicator;
    private toolbar?;
    private readonly showActions;
    private headerContainer?;
    private titleContainer?;
    private titleContainerHover?;
    private titleDescriptionContainer?;
    private titleDescriptionContainerHover?;
    private iconContainer?;
    private iconContainerHover?;
    protected twistiesContainer?: HTMLElement;
    private viewWelcomeController;
    protected readonly scopedContextKeyService: IContextKeyService;
    constructor(options: IViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, accessibleViewInformationService?: IAccessibleViewInformationService | undefined);
    get headerVisible(): boolean;
    set headerVisible(visible: boolean);
    setVisible(visible: boolean): void;
    isVisible(): boolean;
    isBodyVisible(): boolean;
    setExpanded(expanded: boolean): boolean;
    render(): void;
    protected renderHeader(container: HTMLElement): void;
    protected updateHeader(): void;
    private updateTwistyIcon;
    protected getTwistyIcon(expanded: boolean): ThemeIcon;
    style(styles: IPaneStyles): void;
    private getIcon;
    protected renderHeaderTitle(container: HTMLElement, title: string): void;
    private _getAriaLabel;
    protected updateTitle(title: string): void;
    private setTitleDescription;
    protected updateTitleDescription(description?: string | undefined): void;
    private calculateTitle;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    onDidScrollRoot(): void;
    getProgressIndicator(): IProgressIndicator;
    protected getProgressLocation(): string;
    protected getLocationBasedColors(): IViewPaneLocationColors;
    focus(): void;
    private setActions;
    private updateActionsVisibility;
    protected updateActions(): void;
    getActionViewItem(action: IAction, options?: IDropdownMenuActionViewItemOptions): IActionViewItem | undefined;
    getActionsContext(): unknown;
    getActionRunner(): IActionRunner | undefined;
    getOptimalWidth(): number;
    saveState(): void;
    shouldShowWelcome(): boolean;
    getFilterWidget(): FilterWidget | undefined;
    shouldShowFilterInHeader(): boolean;
}
export declare abstract class FilterViewPane extends ViewPane {
    readonly filterWidget: FilterWidget;
    private dimension;
    private filterContainer;
    constructor(options: IFilterViewPaneOptions, keybindingService: IKeybindingService, contextMenuService: IContextMenuService, configurationService: IConfigurationService, contextKeyService: IContextKeyService, viewDescriptorService: IViewDescriptorService, instantiationService: IInstantiationService, openerService: IOpenerService, themeService: IThemeService, telemetryService: ITelemetryService, hoverService: IHoverService, accessibleViewService?: IAccessibleViewInformationService);
    getFilterWidget(): FilterWidget;
    protected renderBody(container: HTMLElement): void;
    protected layoutBody(height: number, width: number): void;
    shouldShowFilterInHeader(): boolean;
    protected abstract layoutBodyContent(height: number, width: number): void;
}
export interface IViewPaneLocationColors {
    background: string;
    overlayBackground: string;
    listOverrideStyles: PartialExcept<IListStyles, 'listBackground' | 'treeStickyScrollBackground'>;
}
export declare function getLocationBasedViewColors(location: ViewContainerLocation | null): IViewPaneLocationColors;
export declare abstract class ViewAction<T extends IView> extends Action2 {
    readonly desc: Readonly<IAction2Options> & {
        viewId: string;
    };
    constructor(desc: Readonly<IAction2Options> & {
        viewId: string;
    });
    run(accessor: ServicesAccessor, ...args: any[]): unknown;
    abstract runInView(accessor: ServicesAccessor, view: T, ...args: any[]): unknown;
}
