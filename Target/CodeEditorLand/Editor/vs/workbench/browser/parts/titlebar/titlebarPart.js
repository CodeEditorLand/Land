/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
var AuxiliaryBrowserTitlebarPart_1;
import './media/titlebarpart.css';
import { localize, localize2 } from '../../../../nls.js';
import { MultiWindowParts, Part } from '../../part.js';
import { getWCOTitlebarAreaRect, getZoomFactor, isWCOEnabled } from '../../../../base/browser/browser.js';
import { getTitleBarStyle, getMenuBarVisibility, hasCustomTitlebar, hasNativeTitlebar, DEFAULT_CUSTOM_TITLEBAR_HEIGHT } from '../../../../platform/window/common/window.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { TITLE_BAR_ACTIVE_BACKGROUND, TITLE_BAR_ACTIVE_FOREGROUND, TITLE_BAR_INACTIVE_FOREGROUND, TITLE_BAR_INACTIVE_BACKGROUND, TITLE_BAR_BORDER, WORKBENCH_BACKGROUND } from '../../../common/theme.js';
import { isMacintosh, isWindows, isLinux, isWeb, isNative, platformLocale } from '../../../../base/common/platform.js';
import { Color } from '../../../../base/common/color.js';
import { EventType, EventHelper, Dimension, append, $, addDisposableListener, prepend, reset, getWindow, getWindowId, isAncestor, getActiveDocument, isHTMLElement } from '../../../../base/browser/dom.js';
import { CustomMenubarControl } from './menubarControl.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { createActionViewItem, createAndFillInActionBarActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { Action2, IMenuService, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { getIconRegistry } from '../../../../platform/theme/common/iconRegistry.js';
import { WindowTitle } from './windowTitle.js';
import { CommandCenterControl } from './commandCenterControl.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { WorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID } from '../../../common/activity.js';
import { AccountsActivityActionViewItem, isAccountsActionVisible, SimpleAccountActivityActionViewItem, SimpleGlobalActivityActionViewItem } from '../globalCompositeBar.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { ActionRunner } from '../../../../base/common/actions.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { prepareActions } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { EDITOR_CORE_NAVIGATION_COMMANDS } from '../editor/editorCommands.js';
import { EditorPane } from '../editor/editorPane.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { EditorCommandsContextActionRunner } from '../editor/editorTabsControl.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { ACCOUNTS_ACTIVITY_TILE_ACTION, GLOBAL_ACTIVITY_TITLE_ACTION } from './titlebarActions.js';
import { createInstantHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
let BrowserTitleService = class BrowserTitleService extends MultiWindowParts {
    constructor(instantiationService, storageService, themeService) {
        super('workbench.titleService', themeService, storageService);
        this.instantiationService = instantiationService;
        this.mainPart = this._register(this.createMainTitlebarPart());
        //#endregion
        //#region Service Implementation
        this.onMenubarVisibilityChange = this.mainPart.onMenubarVisibilityChange;
        this.properties = undefined;
        this.variables = new Map();
        this._register(this.registerPart(this.mainPart));
        this.registerActions();
        this.registerAPICommands();
    }
    createMainTitlebarPart() {
        return this.instantiationService.createInstance(MainBrowserTitlebarPart);
    }
    registerActions() {
        // Focus action
        const that = this;
        this._register(registerAction2(class FocusTitleBar extends Action2 {
            constructor() {
                super({
                    id: `workbench.action.focusTitleBar`,
                    title: localize2('focusTitleBar', 'Focus Title Bar'),
                    category: Categories.View,
                    f1: true,
                });
            }
            run() {
                that.getPartByDocument(getActiveDocument()).focus();
            }
        }));
    }
    registerAPICommands() {
        this._register(CommandsRegistry.registerCommand({
            id: 'registerWindowTitleVariable',
            handler: (accessor, name, contextKey) => {
                this.registerVariables([{ name, contextKey }]);
            },
            metadata: {
                description: 'Registers a new title variable',
                args: [
                    { name: 'name', schema: { type: 'string' }, description: 'The name of the variable to register' },
                    { name: 'contextKey', schema: { type: 'string' }, description: 'The context key to use for the value of the variable' }
                ]
            }
        }));
    }
    //#region Auxiliary Titlebar Parts
    createAuxiliaryTitlebarPart(container, editorGroupsContainer) {
        const titlebarPartContainer = document.createElement('div');
        titlebarPartContainer.classList.add('part', 'titlebar');
        titlebarPartContainer.setAttribute('role', 'none');
        titlebarPartContainer.style.position = 'relative';
        container.insertBefore(titlebarPartContainer, container.firstChild); // ensure we are first element
        const disposables = new DisposableStore();
        const titlebarPart = this.doCreateAuxiliaryTitlebarPart(titlebarPartContainer, editorGroupsContainer);
        disposables.add(this.registerPart(titlebarPart));
        disposables.add(Event.runAndSubscribe(titlebarPart.onDidChange, () => titlebarPartContainer.style.height = `${titlebarPart.height}px`));
        titlebarPart.create(titlebarPartContainer);
        if (this.properties) {
            titlebarPart.updateProperties(this.properties);
        }
        if (this.variables.size) {
            titlebarPart.registerVariables(Array.from(this.variables.values()));
        }
        Event.once(titlebarPart.onWillDispose)(() => disposables.dispose());
        return titlebarPart;
    }
    doCreateAuxiliaryTitlebarPart(container, editorGroupsContainer) {
        return this.instantiationService.createInstance(AuxiliaryBrowserTitlebarPart, container, editorGroupsContainer, this.mainPart);
    }
    updateProperties(properties) {
        this.properties = properties;
        for (const part of this.parts) {
            part.updateProperties(properties);
        }
    }
    registerVariables(variables) {
        const newVariables = [];
        for (const variable of variables) {
            if (!this.variables.has(variable.name)) {
                this.variables.set(variable.name, variable);
                newVariables.push(variable);
            }
        }
        for (const part of this.parts) {
            part.registerVariables(newVariables);
        }
    }
};
BrowserTitleService = __decorate([
    __param(0, IInstantiationService),
    __param(1, IStorageService),
    __param(2, IThemeService),
    __metadata("design:paramtypes", [Object, Object, Object])
], BrowserTitleService);
export { BrowserTitleService };
let BrowserTitlebarPart = class BrowserTitlebarPart extends Part {
    get minimumHeight() {
        const wcoEnabled = isWeb && isWCOEnabled();
        let value = this.isCommandCenterVisible || wcoEnabled ? DEFAULT_CUSTOM_TITLEBAR_HEIGHT : 30;
        if (wcoEnabled) {
            value = Math.max(value, getWCOTitlebarAreaRect(getWindow(this.element))?.height ?? 0);
        }
        return value / (this.preventZoom ? getZoomFactor(getWindow(this.element)) : 1);
    }
    get maximumHeight() { return this.minimumHeight; }
    constructor(id, targetWindow, editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService) {
        super(id, { hasTitle: false }, themeService, storageService, layoutService);
        this.contextMenuService = contextMenuService;
        this.configurationService = configurationService;
        this.environmentService = environmentService;
        this.instantiationService = instantiationService;
        this.storageService = storageService;
        this.contextKeyService = contextKeyService;
        this.hostService = hostService;
        this.editorGroupService = editorGroupService;
        this.menuService = menuService;
        this.keybindingService = keybindingService;
        //#region IView
        this.minimumWidth = 0;
        this.maximumWidth = Number.POSITIVE_INFINITY;
        //#endregion
        //#region Events
        this._onMenubarVisibilityChange = this._register(new Emitter());
        this.onMenubarVisibilityChange = this._onMenubarVisibilityChange.event;
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        this.actionToolBarDisposable = this._register(new DisposableStore());
        this.editorActionsChangeDisposable = this._register(new DisposableStore());
        this.editorToolbarMenuDisposables = this._register(new DisposableStore());
        this.layoutToolbarMenuDisposables = this._register(new DisposableStore());
        this.activityToolbarDisposables = this._register(new DisposableStore());
        this.titleDisposables = this._register(new DisposableStore());
        this.titleBarStyle = getTitleBarStyle(this.configurationService);
        this.isInactive = false;
        this.isAuxiliary = editorGroupsContainer !== 'main';
        this.editorService = editorService.createScoped(editorGroupsContainer, this._store);
        this.editorGroupsContainer = editorGroupsContainer === 'main' ? editorGroupService.mainPart : editorGroupsContainer;
        this.windowTitle = this._register(instantiationService.createInstance(WindowTitle, targetWindow, editorGroupsContainer));
        this.hoverDelegate = this._register(createInstantHoverDelegate());
        this.registerListeners(getWindowId(targetWindow));
    }
    registerListeners(targetWindowId) {
        this._register(this.hostService.onDidChangeFocus(focused => focused ? this.onFocus() : this.onBlur()));
        this._register(this.hostService.onDidChangeActiveWindow(windowId => windowId === targetWindowId ? this.onFocus() : this.onBlur()));
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationChanged(e)));
        this._register(this.editorGroupService.onDidChangeEditorPartOptions(e => this.onEditorPartConfigurationChange(e)));
    }
    onBlur() {
        this.isInactive = true;
        this.updateStyles();
    }
    onFocus() {
        this.isInactive = false;
        this.updateStyles();
    }
    onEditorPartConfigurationChange({ oldPartOptions, newPartOptions }) {
        if (oldPartOptions.editorActionsLocation !== newPartOptions.editorActionsLocation ||
            oldPartOptions.showTabs !== newPartOptions.showTabs) {
            if (hasCustomTitlebar(this.configurationService, this.titleBarStyle) && this.actionToolBar) {
                this.createActionToolBar();
                this.createActionToolBarMenus({ editorActions: true });
                this._onDidChange.fire(undefined);
            }
        }
    }
    onConfigurationChanged(event) {
        // Custom menu bar (disabled if auxiliary)
        if (!this.isAuxiliary && !hasNativeTitlebar(this.configurationService, this.titleBarStyle) && (!isMacintosh || isWeb)) {
            if (event.affectsConfiguration('window.menuBarVisibility')) {
                if (this.currentMenubarVisibility === 'compact') {
                    this.uninstallMenubar();
                }
                else {
                    this.installMenubar();
                }
            }
        }
        // Actions
        if (hasCustomTitlebar(this.configurationService, this.titleBarStyle) && this.actionToolBar) {
            const affectsLayoutControl = event.affectsConfiguration("workbench.layoutControl.enabled" /* LayoutSettings.LAYOUT_ACTIONS */);
            const affectsActivityControl = event.affectsConfiguration("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */);
            if (affectsLayoutControl || affectsActivityControl) {
                this.createActionToolBarMenus({ layoutActions: affectsLayoutControl, activityActions: affectsActivityControl });
                this._onDidChange.fire(undefined);
            }
        }
        // Command Center
        if (event.affectsConfiguration("window.commandCenter" /* LayoutSettings.COMMAND_CENTER */)) {
            this.createTitle();
            this._onDidChange.fire(undefined);
        }
    }
    installMenubar() {
        if (this.menubar) {
            return; // If the menubar is already installed, skip
        }
        this.customMenubar = this._register(this.instantiationService.createInstance(CustomMenubarControl));
        this.menubar = append(this.leftContent, $('div.menubar'));
        this.menubar.setAttribute('role', 'menubar');
        this._register(this.customMenubar.onVisibilityChange(e => this.onMenubarVisibilityChanged(e)));
        this.customMenubar.create(this.menubar);
    }
    uninstallMenubar() {
        this.customMenubar?.dispose();
        this.customMenubar = undefined;
        this.menubar?.remove();
        this.menubar = undefined;
        this.onMenubarVisibilityChanged(false);
    }
    onMenubarVisibilityChanged(visible) {
        if (isWeb || isWindows || isLinux) {
            if (this.lastLayoutDimensions) {
                this.layout(this.lastLayoutDimensions.width, this.lastLayoutDimensions.height);
            }
            this._onMenubarVisibilityChange.fire(visible);
        }
    }
    updateProperties(properties) {
        this.windowTitle.updateProperties(properties);
    }
    registerVariables(variables) {
        this.windowTitle.registerVariables(variables);
    }
    createContentArea(parent) {
        this.element = parent;
        this.rootContainer = append(parent, $('.titlebar-container'));
        this.leftContent = append(this.rootContainer, $('.titlebar-left'));
        this.centerContent = append(this.rootContainer, $('.titlebar-center'));
        this.rightContent = append(this.rootContainer, $('.titlebar-right'));
        // App Icon (Native Windows/Linux and Web)
        if (!isMacintosh && !isWeb && !hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
            this.appIcon = prepend(this.leftContent, $('a.window-appicon'));
            // Web-only home indicator and menu (not for auxiliary windows)
            if (!this.isAuxiliary && isWeb) {
                const homeIndicator = this.environmentService.options?.homeIndicator;
                if (homeIndicator) {
                    const icon = getIconRegistry().getIcon(homeIndicator.icon) ? { id: homeIndicator.icon } : Codicon.code;
                    this.appIcon.setAttribute('href', homeIndicator.href);
                    this.appIcon.classList.add(...ThemeIcon.asClassNameArray(icon));
                    this.appIconBadge = document.createElement('div');
                    this.appIconBadge.classList.add('home-bar-icon-badge');
                    this.appIcon.appendChild(this.appIconBadge);
                }
            }
        }
        // Draggable region that we can manipulate for #52522
        this.dragRegion = prepend(this.rootContainer, $('div.titlebar-drag-region'));
        // Menubar: install a custom menu bar depending on configuration
        if (!this.isAuxiliary &&
            !hasNativeTitlebar(this.configurationService, this.titleBarStyle) &&
            (!isMacintosh || isWeb) &&
            this.currentMenubarVisibility !== 'compact') {
            this.installMenubar();
        }
        // Title
        this.title = append(this.centerContent, $('div.window-title'));
        this.createTitle();
        // Create Toolbar Actions
        if (hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
            this.actionToolBarElement = append(this.rightContent, $('div.action-toolbar-container'));
            this.createActionToolBar();
            this.createActionToolBarMenus();
        }
        // Window Controls Container
        if (!hasNativeTitlebar(this.configurationService, this.titleBarStyle)) {
            let primaryWindowControlsLocation = isMacintosh ? 'left' : 'right';
            if (isMacintosh && isNative) {
                // Check if the locale is RTL, macOS will move traffic lights in RTL locales
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale/textInfo
                const localeInfo = new Intl.Locale(platformLocale);
                if (localeInfo?.textInfo?.direction === 'rtl') {
                    primaryWindowControlsLocation = 'right';
                }
            }
            if (isMacintosh && isNative && primaryWindowControlsLocation === 'left') {
                // macOS native: controls are on the left and the container is not needed to make room
                // for something, except for web where a custom menu being supported). not putting the
                // container helps with allowing to move the window when clicking very close to the
                // window control buttons.
            }
            else {
                this.windowControlsContainer = append(primaryWindowControlsLocation === 'left' ? this.leftContent : this.rightContent, $('div.window-controls-container'));
                if (isWeb) {
                    // Web: its possible to have control overlays on both sides, for example on macOS
                    // with window controls on the left and PWA controls on the right.
                    append(primaryWindowControlsLocation === 'left' ? this.rightContent : this.leftContent, $('div.window-controls-container'));
                }
                if (isWCOEnabled()) {
                    this.windowControlsContainer.classList.add('wco-enabled');
                }
            }
        }
        // Context menu over title bar: depending on the OS and the location of the click this will either be
        // the overall context menu for the entire title bar or a specific title context menu.
        // Windows / Linux: we only support the overall context menu on the title bar
        // macOS: we support both the overall context menu and the title context menu.
        //        in addition, we allow Cmd+click to bring up the title context menu.
        {
            this._register(addDisposableListener(this.rootContainer, EventType.CONTEXT_MENU, e => {
                EventHelper.stop(e);
                let targetMenu;
                if (isMacintosh && isHTMLElement(e.target) && isAncestor(e.target, this.title)) {
                    targetMenu = MenuId.TitleBarTitleContext;
                }
                else {
                    targetMenu = MenuId.TitleBarContext;
                }
                this.onContextMenu(e, targetMenu);
            }));
            if (isMacintosh) {
                this._register(addDisposableListener(this.title, EventType.MOUSE_DOWN, e => {
                    if (e.metaKey) {
                        EventHelper.stop(e, true /* stop bubbling to prevent command center from opening */);
                        this.onContextMenu(e, MenuId.TitleBarTitleContext);
                    }
                }, true /* capture phase to prevent command center from opening */));
            }
        }
        this.updateStyles();
        return this.element;
    }
    createTitle() {
        this.titleDisposables.clear();
        // Text Title
        if (!this.isCommandCenterVisible) {
            this.title.innerText = this.windowTitle.value;
            this.titleDisposables.add(this.windowTitle.onDidChange(() => {
                this.title.innerText = this.windowTitle.value;
            }));
        }
        // Menu Title
        else {
            const commandCenter = this.instantiationService.createInstance(CommandCenterControl, this.windowTitle, this.hoverDelegate);
            reset(this.title, commandCenter.element);
            this.titleDisposables.add(commandCenter);
        }
    }
    actionViewItemProvider(action, options) {
        // --- Activity Actions
        if (!this.isAuxiliary) {
            if (action.id === GLOBAL_ACTIVITY_ID) {
                return this.instantiationService.createInstance(SimpleGlobalActivityActionViewItem, { position: () => 2 /* HoverPosition.BELOW */ }, options);
            }
            if (action.id === ACCOUNTS_ACTIVITY_ID) {
                return this.instantiationService.createInstance(SimpleAccountActivityActionViewItem, { position: () => 2 /* HoverPosition.BELOW */ }, options);
            }
        }
        // --- Editor Actions
        const activeEditorPane = this.editorGroupsContainer.activeGroup?.activeEditorPane;
        if (activeEditorPane && activeEditorPane instanceof EditorPane) {
            const result = activeEditorPane.getActionViewItem(action, options);
            if (result) {
                return result;
            }
        }
        // Check extensions
        return createActionViewItem(this.instantiationService, action, { ...options, menuAsChild: false });
    }
    getKeybinding(action) {
        const editorPaneAwareContextKeyService = this.editorGroupsContainer.activeGroup?.activeEditorPane?.scopedContextKeyService ?? this.contextKeyService;
        return this.keybindingService.lookupKeybinding(action.id, editorPaneAwareContextKeyService);
    }
    createActionToolBar() {
        // Creates the action tool bar. Depends on the configuration of the title bar menus
        // Requires to be recreated whenever editor actions enablement changes
        this.actionToolBarDisposable.clear();
        this.actionToolBar = this.actionToolBarDisposable.add(this.instantiationService.createInstance(WorkbenchToolBar, this.actionToolBarElement, {
            contextMenu: MenuId.TitleBarContext,
            orientation: 0 /* ActionsOrientation.HORIZONTAL */,
            ariaLabel: localize('ariaLabelTitleActions', "Title actions"),
            getKeyBinding: action => this.getKeybinding(action),
            overflowBehavior: { maxItems: 9, exempted: [ACCOUNTS_ACTIVITY_ID, GLOBAL_ACTIVITY_ID, ...EDITOR_CORE_NAVIGATION_COMMANDS] },
            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
            telemetrySource: 'titlePart',
            highlightToggledItems: this.editorActionsEnabled, // Only show toggled state for editor actions (Layout actions are not shown as toggled)
            actionViewItemProvider: (action, options) => this.actionViewItemProvider(action, options),
            hoverDelegate: this.hoverDelegate
        }));
        if (this.editorActionsEnabled) {
            this.actionToolBarDisposable.add(this.editorGroupsContainer.onDidChangeActiveGroup(() => this.createActionToolBarMenus({ editorActions: true })));
        }
    }
    createActionToolBarMenus(update = true) {
        if (update === true) {
            update = { editorActions: true, layoutActions: true, activityActions: true };
        }
        const updateToolBarActions = () => {
            const actions = { primary: [], secondary: [] };
            // --- Editor Actions
            if (this.editorActionsEnabled) {
                this.editorActionsChangeDisposable.clear();
                const activeGroup = this.editorGroupsContainer.activeGroup;
                if (activeGroup) {
                    const editorActions = activeGroup.createEditorActions(this.editorActionsChangeDisposable);
                    actions.primary.push(...editorActions.actions.primary);
                    actions.secondary.push(...editorActions.actions.secondary);
                    this.editorActionsChangeDisposable.add(editorActions.onDidChange(() => updateToolBarActions()));
                }
            }
            // --- Layout Actions
            if (this.layoutToolbarMenu) {
                createAndFillInActionBarActions(this.layoutToolbarMenu, {}, actions, () => !this.editorActionsEnabled // Layout Actions in overflow menu when editor actions enabled in title bar
                );
            }
            // --- Activity Actions
            if (this.activityActionsEnabled) {
                if (isAccountsActionVisible(this.storageService)) {
                    actions.primary.push(ACCOUNTS_ACTIVITY_TILE_ACTION);
                }
                actions.primary.push(GLOBAL_ACTIVITY_TITLE_ACTION);
            }
            this.actionToolBar.setActions(prepareActions(actions.primary), prepareActions(actions.secondary));
        };
        // Create/Update the menus which should be in the title tool bar
        if (update.editorActions) {
            this.editorToolbarMenuDisposables.clear();
            // The editor toolbar menu is handled by the editor group so we do not need to manage it here.
            // However, depending on the active editor, we need to update the context and action runner of the toolbar menu.
            if (this.editorActionsEnabled && this.editorService.activeEditor !== undefined) {
                const context = { groupId: this.editorGroupsContainer.activeGroup.id };
                this.actionToolBar.actionRunner = new EditorCommandsContextActionRunner(context);
                this.actionToolBar.context = context;
                this.editorToolbarMenuDisposables.add(this.actionToolBar.actionRunner);
            }
            else {
                this.actionToolBar.actionRunner = new ActionRunner();
                this.actionToolBar.context = undefined;
                this.editorToolbarMenuDisposables.add(this.actionToolBar.actionRunner);
            }
        }
        if (update.layoutActions) {
            this.layoutToolbarMenuDisposables.clear();
            if (this.layoutControlEnabled) {
                this.layoutToolbarMenu = this.menuService.createMenu(MenuId.LayoutControlMenu, this.contextKeyService);
                this.layoutToolbarMenuDisposables.add(this.layoutToolbarMenu);
                this.layoutToolbarMenuDisposables.add(this.layoutToolbarMenu.onDidChange(() => updateToolBarActions()));
            }
            else {
                this.layoutToolbarMenu = undefined;
            }
        }
        if (update.activityActions) {
            this.activityToolbarDisposables.clear();
            if (this.activityActionsEnabled) {
                this.activityToolbarDisposables.add(this.storageService.onDidChangeValue(0 /* StorageScope.PROFILE */, AccountsActivityActionViewItem.ACCOUNTS_VISIBILITY_PREFERENCE_KEY, this._store)(() => updateToolBarActions()));
            }
        }
        updateToolBarActions();
    }
    updateStyles() {
        super.updateStyles();
        // Part container
        if (this.element) {
            if (this.isInactive) {
                this.element.classList.add('inactive');
            }
            else {
                this.element.classList.remove('inactive');
            }
            const titleBackground = this.getColor(this.isInactive ? TITLE_BAR_INACTIVE_BACKGROUND : TITLE_BAR_ACTIVE_BACKGROUND, (color, theme) => {
                // LCD Rendering Support: the title bar part is a defining its own GPU layer.
                // To benefit from LCD font rendering, we must ensure that we always set an
                // opaque background color. As such, we compute an opaque color given we know
                // the background color is the workbench background.
                return color.isOpaque() ? color : color.makeOpaque(WORKBENCH_BACKGROUND(theme));
            }) || '';
            this.element.style.backgroundColor = titleBackground;
            if (this.appIconBadge) {
                this.appIconBadge.style.backgroundColor = titleBackground;
            }
            if (titleBackground && Color.fromHex(titleBackground).isLighter()) {
                this.element.classList.add('light');
            }
            else {
                this.element.classList.remove('light');
            }
            const titleForeground = this.getColor(this.isInactive ? TITLE_BAR_INACTIVE_FOREGROUND : TITLE_BAR_ACTIVE_FOREGROUND);
            this.element.style.color = titleForeground || '';
            const titleBorder = this.getColor(TITLE_BAR_BORDER);
            this.element.style.borderBottom = titleBorder ? `1px solid ${titleBorder}` : '';
        }
    }
    onContextMenu(e, menuId) {
        const event = new StandardMouseEvent(getWindow(this.element), e);
        // Show it
        this.contextMenuService.showContextMenu({
            getAnchor: () => event,
            menuId,
            contextKeyService: this.contextKeyService,
            domForShadowRoot: isMacintosh && isNative ? event.target : undefined
        });
    }
    get currentMenubarVisibility() {
        if (this.isAuxiliary) {
            return 'hidden';
        }
        return getMenuBarVisibility(this.configurationService);
    }
    get layoutControlEnabled() {
        return !this.isAuxiliary && this.configurationService.getValue("workbench.layoutControl.enabled" /* LayoutSettings.LAYOUT_ACTIONS */) !== false;
    }
    get isCommandCenterVisible() {
        return this.configurationService.getValue("window.commandCenter" /* LayoutSettings.COMMAND_CENTER */) !== false;
    }
    get editorActionsEnabled() {
        return this.editorGroupService.partOptions.editorActionsLocation === "titleBar" /* EditorActionsLocation.TITLEBAR */ ||
            (this.editorGroupService.partOptions.editorActionsLocation === "default" /* EditorActionsLocation.DEFAULT */ &&
                this.editorGroupService.partOptions.showTabs === "none" /* EditorTabsMode.NONE */);
    }
    get activityActionsEnabled() {
        const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */);
        return !this.isAuxiliary && (activityBarPosition === "top" /* ActivityBarPosition.TOP */ || activityBarPosition === "bottom" /* ActivityBarPosition.BOTTOM */);
    }
    get hasZoomableElements() {
        const hasMenubar = !(this.currentMenubarVisibility === 'hidden' || this.currentMenubarVisibility === 'compact' || (!isWeb && isMacintosh));
        const hasCommandCenter = this.isCommandCenterVisible;
        const hasToolBarActions = this.layoutControlEnabled || this.editorActionsEnabled || this.activityActionsEnabled;
        return hasMenubar || hasCommandCenter || hasToolBarActions;
    }
    get preventZoom() {
        // Prevent zooming behavior if any of the following conditions are met:
        // 1. Shrinking below the window control size (zoom < 1)
        // 2. No custom items are present in the title bar
        return getZoomFactor(getWindow(this.element)) < 1 || !this.hasZoomableElements;
    }
    layout(width, height) {
        this.updateLayout(new Dimension(width, height));
        super.layoutContents(width, height);
    }
    updateLayout(dimension) {
        this.lastLayoutDimensions = dimension;
        if (hasCustomTitlebar(this.configurationService, this.titleBarStyle)) {
            const zoomFactor = getZoomFactor(getWindow(this.element));
            this.element.style.setProperty('--zoom-factor', zoomFactor.toString());
            this.rootContainer.classList.toggle('counter-zoom', this.preventZoom);
            if (this.customMenubar) {
                const menubarDimension = new Dimension(0, dimension.height);
                this.customMenubar.layout(menubarDimension);
            }
        }
    }
    focus() {
        if (this.customMenubar) {
            this.customMenubar.toggleFocus();
        }
        else {
            this.element.querySelector('[tabindex]:not([tabindex="-1"])').focus();
        }
    }
    toJSON() {
        return {
            type: "workbench.parts.titlebar" /* Parts.TITLEBAR_PART */
        };
    }
    dispose() {
        this._onWillDispose.fire();
        super.dispose();
    }
};
BrowserTitlebarPart = __decorate([
    __param(3, IContextMenuService),
    __param(4, IConfigurationService),
    __param(5, IBrowserWorkbenchEnvironmentService),
    __param(6, IInstantiationService),
    __param(7, IThemeService),
    __param(8, IStorageService),
    __param(9, IWorkbenchLayoutService),
    __param(10, IContextKeyService),
    __param(11, IHostService),
    __param(12, IEditorGroupsService),
    __param(13, IEditorService),
    __param(14, IMenuService),
    __param(15, IKeybindingService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], BrowserTitlebarPart);
export { BrowserTitlebarPart };
let MainBrowserTitlebarPart = class MainBrowserTitlebarPart extends BrowserTitlebarPart {
    constructor(contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService) {
        super("workbench.parts.titlebar" /* Parts.TITLEBAR_PART */, mainWindow, 'main', contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService);
    }
};
MainBrowserTitlebarPart = __decorate([
    __param(0, IContextMenuService),
    __param(1, IConfigurationService),
    __param(2, IBrowserWorkbenchEnvironmentService),
    __param(3, IInstantiationService),
    __param(4, IThemeService),
    __param(5, IStorageService),
    __param(6, IWorkbenchLayoutService),
    __param(7, IContextKeyService),
    __param(8, IHostService),
    __param(9, IEditorGroupsService),
    __param(10, IEditorService),
    __param(11, IMenuService),
    __param(12, IKeybindingService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], MainBrowserTitlebarPart);
export { MainBrowserTitlebarPart };
let AuxiliaryBrowserTitlebarPart = class AuxiliaryBrowserTitlebarPart extends BrowserTitlebarPart {
    static { AuxiliaryBrowserTitlebarPart_1 = this; }
    static { this.COUNTER = 1; }
    get height() { return this.minimumHeight; }
    constructor(container, editorGroupsContainer, mainTitlebar, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService) {
        const id = AuxiliaryBrowserTitlebarPart_1.COUNTER++;
        super(`workbench.parts.auxiliaryTitle.${id}`, getWindow(container), editorGroupsContainer, contextMenuService, configurationService, environmentService, instantiationService, themeService, storageService, layoutService, contextKeyService, hostService, editorGroupService, editorService, menuService, keybindingService);
        this.container = container;
        this.mainTitlebar = mainTitlebar;
    }
    get preventZoom() {
        // Prevent zooming behavior if any of the following conditions are met:
        // 1. Shrinking below the window control size (zoom < 1)
        // 2. No custom items are present in the main title bar
        // The auxiliary title bar never contains any zoomable items itself,
        // but we want to match the behavior of the main title bar.
        return getZoomFactor(getWindow(this.element)) < 1 || !this.mainTitlebar.hasZoomableElements;
    }
};
AuxiliaryBrowserTitlebarPart = AuxiliaryBrowserTitlebarPart_1 = __decorate([
    __param(3, IContextMenuService),
    __param(4, IConfigurationService),
    __param(5, IBrowserWorkbenchEnvironmentService),
    __param(6, IInstantiationService),
    __param(7, IThemeService),
    __param(8, IStorageService),
    __param(9, IWorkbenchLayoutService),
    __param(10, IContextKeyService),
    __param(11, IHostService),
    __param(12, IEditorGroupsService),
    __param(13, IEditorService),
    __param(14, IMenuService),
    __param(15, IKeybindingService),
    __metadata("design:paramtypes", [HTMLElement, Object, BrowserTitlebarPart, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AuxiliaryBrowserTitlebarPart);
export { AuxiliaryBrowserTitlebarPart };
