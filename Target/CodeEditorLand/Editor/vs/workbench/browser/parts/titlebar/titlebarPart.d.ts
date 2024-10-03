import './media/titlebarpart.css';
import { MultiWindowParts, Part } from '../../part.js';
import { ITitleService } from '../../../services/title/browser/titleService.js';
import { MenuBarVisibility } from '../../../../platform/window/common/window.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IConfigurationService, IConfigurationChangeEvent } from '../../../../platform/configuration/common/configuration.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { CustomMenubarControl } from './menubarControl.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IEditorGroupsContainer, IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { CodeWindow } from '../../../../base/browser/window.js';
import { IView } from '../../../../base/browser/ui/grid/grid.js';
export interface ITitleVariable {
    readonly name: string;
    readonly contextKey: string;
}
export interface ITitleProperties {
    isPure?: boolean;
    isAdmin?: boolean;
    prefix?: string;
}
export interface ITitlebarPart extends IDisposable {
    readonly onMenubarVisibilityChange: Event<boolean>;
    updateProperties(properties: ITitleProperties): void;
    registerVariables(variables: ITitleVariable[]): void;
}
export declare class BrowserTitleService extends MultiWindowParts<BrowserTitlebarPart> implements ITitleService {
    protected readonly instantiationService: IInstantiationService;
    _serviceBrand: undefined;
    readonly mainPart: BrowserTitlebarPart;
    constructor(instantiationService: IInstantiationService, storageService: IStorageService, themeService: IThemeService);
    protected createMainTitlebarPart(): BrowserTitlebarPart;
    private registerActions;
    private registerAPICommands;
    createAuxiliaryTitlebarPart(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer): IAuxiliaryTitlebarPart;
    protected doCreateAuxiliaryTitlebarPart(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer): BrowserTitlebarPart & IAuxiliaryTitlebarPart;
    readonly onMenubarVisibilityChange: Event<boolean>;
    private properties;
    updateProperties(properties: ITitleProperties): void;
    private readonly variables;
    registerVariables(variables: ITitleVariable[]): void;
}
export declare class BrowserTitlebarPart extends Part implements ITitlebarPart {
    private readonly contextMenuService;
    protected readonly configurationService: IConfigurationService;
    protected readonly environmentService: IBrowserWorkbenchEnvironmentService;
    protected readonly instantiationService: IInstantiationService;
    private readonly storageService;
    private readonly contextKeyService;
    private readonly hostService;
    private readonly editorGroupService;
    private readonly menuService;
    private readonly keybindingService;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    get minimumHeight(): number;
    get maximumHeight(): number;
    private _onMenubarVisibilityChange;
    readonly onMenubarVisibilityChange: Event<boolean>;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    protected rootContainer: HTMLElement;
    protected windowControlsContainer: HTMLElement | undefined;
    protected dragRegion: HTMLElement | undefined;
    private title;
    private leftContent;
    private centerContent;
    private rightContent;
    protected customMenubar: CustomMenubarControl | undefined;
    protected appIcon: HTMLElement | undefined;
    private appIconBadge;
    protected menubar?: HTMLElement;
    private lastLayoutDimensions;
    private actionToolBar;
    private readonly actionToolBarDisposable;
    private readonly editorActionsChangeDisposable;
    private actionToolBarElement;
    private layoutToolbarMenu;
    private readonly editorToolbarMenuDisposables;
    private readonly layoutToolbarMenuDisposables;
    private readonly activityToolbarDisposables;
    private readonly hoverDelegate;
    private readonly titleDisposables;
    private titleBarStyle;
    private isInactive;
    private readonly isAuxiliary;
    private readonly windowTitle;
    private readonly editorService;
    private readonly editorGroupsContainer;
    constructor(id: string, targetWindow: CodeWindow, editorGroupsContainer: IEditorGroupsContainer | 'main', contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: IBrowserWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
    private registerListeners;
    private onBlur;
    private onFocus;
    private onEditorPartConfigurationChange;
    protected onConfigurationChanged(event: IConfigurationChangeEvent): void;
    protected installMenubar(): void;
    private uninstallMenubar;
    protected onMenubarVisibilityChanged(visible: boolean): void;
    updateProperties(properties: ITitleProperties): void;
    registerVariables(variables: ITitleVariable[]): void;
    protected createContentArea(parent: HTMLElement): HTMLElement;
    private createTitle;
    private actionViewItemProvider;
    private getKeybinding;
    private createActionToolBar;
    private createActionToolBarMenus;
    updateStyles(): void;
    protected onContextMenu(e: MouseEvent, menuId: MenuId): void;
    protected get currentMenubarVisibility(): MenuBarVisibility;
    private get layoutControlEnabled();
    protected get isCommandCenterVisible(): boolean;
    private get editorActionsEnabled();
    private get activityActionsEnabled();
    get hasZoomableElements(): boolean;
    get preventZoom(): boolean;
    layout(width: number, height: number): void;
    private updateLayout;
    focus(): void;
    toJSON(): object;
    dispose(): void;
}
export declare class MainBrowserTitlebarPart extends BrowserTitlebarPart {
    constructor(contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: IBrowserWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
}
export interface IAuxiliaryTitlebarPart extends ITitlebarPart, IView {
    readonly container: HTMLElement;
    readonly height: number;
}
export declare class AuxiliaryBrowserTitlebarPart extends BrowserTitlebarPart implements IAuxiliaryTitlebarPart {
    readonly container: HTMLElement;
    private readonly mainTitlebar;
    private static COUNTER;
    get height(): number;
    constructor(container: HTMLElement, editorGroupsContainer: IEditorGroupsContainer, mainTitlebar: BrowserTitlebarPart, contextMenuService: IContextMenuService, configurationService: IConfigurationService, environmentService: IBrowserWorkbenchEnvironmentService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, layoutService: IWorkbenchLayoutService, contextKeyService: IContextKeyService, hostService: IHostService, editorGroupService: IEditorGroupsService, editorService: IEditorService, menuService: IMenuService, keybindingService: IKeybindingService);
    get preventZoom(): boolean;
}
