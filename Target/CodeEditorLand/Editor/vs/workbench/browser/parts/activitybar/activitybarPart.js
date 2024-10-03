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
var ActivitybarPart_1;
import './media/activitybarpart.css';
import './media/activityaction.css';
import { localize, localize2 } from '../../../../nls.js';
import { Part } from '../../part.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { ToggleSidebarPositionAction } from '../../actions/layoutActions.js';
import { IThemeService, registerThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import { ACTIVITY_BAR_BACKGROUND, ACTIVITY_BAR_BORDER, ACTIVITY_BAR_FOREGROUND, ACTIVITY_BAR_ACTIVE_BORDER, ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, ACTIVITY_BAR_INACTIVE_FOREGROUND, ACTIVITY_BAR_ACTIVE_BACKGROUND, ACTIVITY_BAR_DRAG_AND_DROP_BORDER, ACTIVITY_BAR_ACTIVE_FOCUS_BORDER } from '../../../common/theme.js';
import { activeContrastBorder, contrastBorder, focusBorder } from '../../../../platform/theme/common/colorRegistry.js';
import { addDisposableListener, append, EventType, isAncestor, $, clearNode } from '../../../../base/browser/dom.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { CustomMenubarControl } from '../titlebar/menubarControl.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { getMenuBarVisibility } from '../../../../platform/window/common/window.js';
import { Separator, SubmenuAction, toAction } from '../../../../base/common/actions.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { PaneCompositeBar } from '../paneCompositeBar.js';
import { GlobalCompositeBar } from '../globalCompositeBar.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Action2, IMenuService, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IViewDescriptorService, ViewContainerLocationToString } from '../../../common/views.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
let ActivitybarPart = class ActivitybarPart extends Part {
    static { ActivitybarPart_1 = this; }
    static { this.ACTION_HEIGHT = 48; }
    static { this.pinnedViewContainersKey = 'workbench.activity.pinnedViewlets2'; }
    static { this.placeholderViewContainersKey = 'workbench.activity.placeholderViewlets'; }
    static { this.viewContainersWorkspaceStateKey = 'workbench.activity.viewletsWorkspaceState'; }
    constructor(paneCompositePart, instantiationService, layoutService, themeService, storageService) {
        super("workbench.parts.activitybar", { hasTitle: false }, themeService, storageService, layoutService);
        this.paneCompositePart = paneCompositePart;
        this.instantiationService = instantiationService;
        this.minimumWidth = 48;
        this.maximumWidth = 48;
        this.minimumHeight = 0;
        this.maximumHeight = Number.POSITIVE_INFINITY;
        this.compositeBar = this._register(new MutableDisposable());
    }
    createCompositeBar() {
        return this.instantiationService.createInstance(ActivityBarCompositeBar, {
            partContainerClass: 'activitybar',
            pinnedViewContainersKey: ActivitybarPart_1.pinnedViewContainersKey,
            placeholderViewContainersKey: ActivitybarPart_1.placeholderViewContainersKey,
            viewContainersWorkspaceStateKey: ActivitybarPart_1.viewContainersWorkspaceStateKey,
            orientation: 1,
            icon: true,
            iconSize: 24,
            activityHoverOptions: {
                position: () => this.layoutService.getSideBarPosition() === 0 ? 1 : 0,
            },
            preventLoopNavigation: true,
            recomputeSizes: false,
            fillExtraContextMenuActions: (actions, e) => { },
            compositeSize: 52,
            colors: (theme) => ({
                activeForegroundColor: theme.getColor(ACTIVITY_BAR_FOREGROUND),
                inactiveForegroundColor: theme.getColor(ACTIVITY_BAR_INACTIVE_FOREGROUND),
                activeBorderColor: theme.getColor(ACTIVITY_BAR_ACTIVE_BORDER),
                activeBackground: theme.getColor(ACTIVITY_BAR_ACTIVE_BACKGROUND),
                badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
                badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND),
                dragAndDropBorder: theme.getColor(ACTIVITY_BAR_DRAG_AND_DROP_BORDER),
                activeBackgroundColor: undefined, inactiveBackgroundColor: undefined, activeBorderBottomColor: undefined,
            }),
            overflowActionSize: ActivitybarPart_1.ACTION_HEIGHT,
        }, "workbench.parts.activitybar", this.paneCompositePart, true);
    }
    createContentArea(parent) {
        this.element = parent;
        this.content = append(this.element, $('.content'));
        if (this.layoutService.isVisible("workbench.parts.activitybar")) {
            this.show();
        }
        return this.content;
    }
    getPinnedPaneCompositeIds() {
        return this.compositeBar.value?.getPinnedPaneCompositeIds() ?? [];
    }
    getVisiblePaneCompositeIds() {
        return this.compositeBar.value?.getVisiblePaneCompositeIds() ?? [];
    }
    focus() {
        this.compositeBar.value?.focus();
    }
    updateStyles() {
        super.updateStyles();
        const container = assertIsDefined(this.getContainer());
        const background = this.getColor(ACTIVITY_BAR_BACKGROUND) || '';
        container.style.backgroundColor = background;
        const borderColor = this.getColor(ACTIVITY_BAR_BORDER) || this.getColor(contrastBorder) || '';
        container.classList.toggle('bordered', !!borderColor);
        container.style.borderColor = borderColor ? borderColor : '';
    }
    show(focus) {
        if (!this.content) {
            return;
        }
        if (!this.compositeBar.value) {
            this.compositeBar.value = this.createCompositeBar();
            this.compositeBar.value.create(this.content);
            if (this.dimension) {
                this.layout(this.dimension.width, this.dimension.height);
            }
        }
        if (focus) {
            this.focus();
        }
    }
    hide() {
        if (!this.compositeBar.value) {
            return;
        }
        this.compositeBar.clear();
        if (this.content) {
            clearNode(this.content);
        }
    }
    layout(width, height) {
        super.layout(width, height, 0, 0);
        if (!this.compositeBar.value) {
            return;
        }
        const contentAreaSize = super.layoutContents(width, height).contentSize;
        this.compositeBar.value.layout(width, contentAreaSize.height);
    }
    toJSON() {
        return {
            type: "workbench.parts.activitybar"
        };
    }
};
ActivitybarPart = ActivitybarPart_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IWorkbenchLayoutService),
    __param(3, IThemeService),
    __param(4, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ActivitybarPart);
export { ActivitybarPart };
let ActivityBarCompositeBar = class ActivityBarCompositeBar extends PaneCompositeBar {
    constructor(options, part, paneCompositePart, showGlobalActivities, instantiationService, storageService, extensionService, viewDescriptorService, viewService, contextKeyService, environmentService, configurationService, menuService, layoutService) {
        super({
            ...options,
            fillExtraContextMenuActions: (actions, e) => {
                options.fillExtraContextMenuActions(actions, e);
                this.fillContextMenuActions(actions, e);
            }
        }, part, paneCompositePart, instantiationService, storageService, extensionService, viewDescriptorService, viewService, contextKeyService, environmentService, layoutService);
        this.configurationService = configurationService;
        this.menuService = menuService;
        this.keyboardNavigationDisposables = this._register(new DisposableStore());
        if (showGlobalActivities) {
            this.globalCompositeBar = this._register(instantiationService.createInstance(GlobalCompositeBar, () => this.getContextMenuActions(), (theme) => this.options.colors(theme), this.options.activityHoverOptions));
        }
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('window.menuBarVisibility')) {
                if (getMenuBarVisibility(this.configurationService) === 'compact') {
                    this.installMenubar();
                }
                else {
                    this.uninstallMenubar();
                }
            }
        }));
    }
    fillContextMenuActions(actions, e) {
        const menuBarVisibility = getMenuBarVisibility(this.configurationService);
        if (menuBarVisibility === 'compact' || menuBarVisibility === 'hidden' || menuBarVisibility === 'toggle') {
            actions.unshift(...[toAction({ id: 'toggleMenuVisibility', label: localize('menu', "Menu"), checked: menuBarVisibility === 'compact', run: () => this.configurationService.updateValue('window.menuBarVisibility', menuBarVisibility === 'compact' ? 'toggle' : 'compact') }), new Separator()]);
        }
        if (menuBarVisibility === 'compact' && this.menuBarContainer && e?.target) {
            if (isAncestor(e.target, this.menuBarContainer)) {
                actions.unshift(...[toAction({ id: 'hideCompactMenu', label: localize('hideMenu', "Hide Menu"), run: () => this.configurationService.updateValue('window.menuBarVisibility', 'toggle') }), new Separator()]);
            }
        }
        if (this.globalCompositeBar) {
            actions.push(new Separator());
            actions.push(...this.globalCompositeBar.getContextMenuActions());
        }
        actions.push(new Separator());
        actions.push(...this.getActivityBarContextMenuActions());
    }
    uninstallMenubar() {
        if (this.menuBar) {
            this.menuBar.dispose();
            this.menuBar = undefined;
        }
        if (this.menuBarContainer) {
            this.menuBarContainer.remove();
            this.menuBarContainer = undefined;
        }
    }
    installMenubar() {
        if (this.menuBar) {
            return;
        }
        this.menuBarContainer = document.createElement('div');
        this.menuBarContainer.classList.add('menubar');
        const content = assertIsDefined(this.element);
        content.prepend(this.menuBarContainer);
        this.menuBar = this._register(this.instantiationService.createInstance(CustomMenubarControl));
        this.menuBar.create(this.menuBarContainer);
    }
    registerKeyboardNavigationListeners() {
        this.keyboardNavigationDisposables.clear();
        if (this.menuBarContainer) {
            this.keyboardNavigationDisposables.add(addDisposableListener(this.menuBarContainer, EventType.KEY_DOWN, e => {
                const kbEvent = new StandardKeyboardEvent(e);
                if (kbEvent.equals(18) || kbEvent.equals(17)) {
                    this.focus();
                }
            }));
        }
        if (this.compositeBarContainer) {
            this.keyboardNavigationDisposables.add(addDisposableListener(this.compositeBarContainer, EventType.KEY_DOWN, e => {
                const kbEvent = new StandardKeyboardEvent(e);
                if (kbEvent.equals(18) || kbEvent.equals(17)) {
                    this.globalCompositeBar?.focus();
                }
                else if (kbEvent.equals(16) || kbEvent.equals(15)) {
                    this.menuBar?.toggleFocus();
                }
            }));
        }
        if (this.globalCompositeBar) {
            this.keyboardNavigationDisposables.add(addDisposableListener(this.globalCompositeBar.element, EventType.KEY_DOWN, e => {
                const kbEvent = new StandardKeyboardEvent(e);
                if (kbEvent.equals(16) || kbEvent.equals(15)) {
                    this.focus(this.getVisiblePaneCompositeIds().length - 1);
                }
            }));
        }
    }
    create(parent) {
        this.element = parent;
        if (getMenuBarVisibility(this.configurationService) === 'compact') {
            this.installMenubar();
        }
        this.compositeBarContainer = super.create(this.element);
        if (this.globalCompositeBar) {
            this.globalCompositeBar.create(this.element);
        }
        this.registerKeyboardNavigationListeners();
        return this.compositeBarContainer;
    }
    layout(width, height) {
        if (this.menuBarContainer) {
            if (this.options.orientation === 1) {
                height -= this.menuBarContainer.clientHeight;
            }
            else {
                width -= this.menuBarContainer.clientWidth;
            }
        }
        if (this.globalCompositeBar) {
            if (this.options.orientation === 1) {
                height -= (this.globalCompositeBar.size() * ActivitybarPart.ACTION_HEIGHT);
            }
            else {
                width -= this.globalCompositeBar.element.clientWidth;
            }
        }
        super.layout(width, height);
    }
    getActivityBarContextMenuActions() {
        const activityBarPositionMenu = this.menuService.getMenuActions(MenuId.ActivityBarPositionMenu, this.contextKeyService, { shouldForwardArgs: true, renderShortTitle: true });
        const positionActions = [];
        createAndFillInContextMenuActions(activityBarPositionMenu, { primary: [], secondary: positionActions });
        return [
            new SubmenuAction('workbench.action.panel.position', localize('activity bar position', "Activity Bar Position"), positionActions),
            toAction({ id: ToggleSidebarPositionAction.ID, label: ToggleSidebarPositionAction.getLabel(this.layoutService), run: () => this.instantiationService.invokeFunction(accessor => new ToggleSidebarPositionAction().run(accessor)) })
        ];
    }
};
ActivityBarCompositeBar = __decorate([
    __param(4, IInstantiationService),
    __param(5, IStorageService),
    __param(6, IExtensionService),
    __param(7, IViewDescriptorService),
    __param(8, IViewsService),
    __param(9, IContextKeyService),
    __param(10, IWorkbenchEnvironmentService),
    __param(11, IConfigurationService),
    __param(12, IMenuService),
    __param(13, IWorkbenchLayoutService),
    __metadata("design:paramtypes", [Object, String, Object, Boolean, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ActivityBarCompositeBar);
export { ActivityBarCompositeBar };
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.activityBarLocation.default',
            title: {
                ...localize2('positionActivityBarDefault', 'Move Activity Bar to Side'),
                mnemonicTitle: localize({ key: 'miDefaultActivityBar', comment: ['&& denotes a mnemonic'] }, "&&Default"),
            },
            shortTitle: localize('default', "Default"),
            category: Categories.View,
            toggled: ContextKeyExpr.equals(`config.${"workbench.activityBar.location"}`, "default"),
            menu: [{
                    id: MenuId.ActivityBarPositionMenu,
                    order: 1
                }, {
                    id: MenuId.CommandPalette,
                    when: ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location"}`, "default"),
                }]
        });
    }
    run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        configurationService.updateValue("workbench.activityBar.location", "default");
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.activityBarLocation.top',
            title: {
                ...localize2('positionActivityBarTop', 'Move Activity Bar to Top'),
                mnemonicTitle: localize({ key: 'miTopActivityBar', comment: ['&& denotes a mnemonic'] }, "&&Top"),
            },
            shortTitle: localize('top', "Top"),
            category: Categories.View,
            toggled: ContextKeyExpr.equals(`config.${"workbench.activityBar.location"}`, "top"),
            menu: [{
                    id: MenuId.ActivityBarPositionMenu,
                    order: 2
                }, {
                    id: MenuId.CommandPalette,
                    when: ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location"}`, "top"),
                }]
        });
    }
    run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        configurationService.updateValue("workbench.activityBar.location", "top");
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.activityBarLocation.bottom',
            title: {
                ...localize2('positionActivityBarBottom', 'Move Activity Bar to Bottom'),
                mnemonicTitle: localize({ key: 'miBottomActivityBar', comment: ['&& denotes a mnemonic'] }, "&&Bottom"),
            },
            shortTitle: localize('bottom', "Bottom"),
            category: Categories.View,
            toggled: ContextKeyExpr.equals(`config.${"workbench.activityBar.location"}`, "bottom"),
            menu: [{
                    id: MenuId.ActivityBarPositionMenu,
                    order: 3
                }, {
                    id: MenuId.CommandPalette,
                    when: ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location"}`, "bottom"),
                }]
        });
    }
    run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        configurationService.updateValue("workbench.activityBar.location", "bottom");
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.activityBarLocation.hide',
            title: {
                ...localize2('hideActivityBar', 'Hide Activity Bar'),
                mnemonicTitle: localize({ key: 'miHideActivityBar', comment: ['&& denotes a mnemonic'] }, "&&Hidden"),
            },
            shortTitle: localize('hide', "Hidden"),
            category: Categories.View,
            toggled: ContextKeyExpr.equals(`config.${"workbench.activityBar.location"}`, "hidden"),
            menu: [{
                    id: MenuId.ActivityBarPositionMenu,
                    order: 4
                }, {
                    id: MenuId.CommandPalette,
                    when: ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location"}`, "hidden"),
                }]
        });
    }
    run(accessor) {
        const configurationService = accessor.get(IConfigurationService);
        configurationService.updateValue("workbench.activityBar.location", "hidden");
    }
});
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
    submenu: MenuId.ActivityBarPositionMenu,
    title: localize('positionActivituBar', "Activity Bar Position"),
    group: '3_workbench_layout_move',
    order: 2
});
MenuRegistry.appendMenuItem(MenuId.ViewContainerTitleContext, {
    submenu: MenuId.ActivityBarPositionMenu,
    title: localize('positionActivituBar', "Activity Bar Position"),
    when: ContextKeyExpr.equals('viewContainerLocation', ViewContainerLocationToString(0)),
    group: '3_workbench_layout_move',
    order: 1
});
MenuRegistry.appendMenuItem(MenuId.ViewTitleContext, {
    submenu: MenuId.ActivityBarPositionMenu,
    title: localize('positionActivituBar', "Activity Bar Position"),
    when: ContextKeyExpr.equals('viewLocation', ViewContainerLocationToString(0)),
    group: '3_workbench_layout_move',
    order: 1
});
class SwitchSideBarViewAction extends Action2 {
    constructor(desc, offset) {
        super(desc);
        this.offset = offset;
    }
    async run(accessor) {
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        const visibleViewletIds = paneCompositeService.getVisiblePaneCompositeIds(0);
        const activeViewlet = paneCompositeService.getActivePaneComposite(0);
        if (!activeViewlet) {
            return;
        }
        let targetViewletId;
        for (let i = 0; i < visibleViewletIds.length; i++) {
            if (visibleViewletIds[i] === activeViewlet.getId()) {
                targetViewletId = visibleViewletIds[(i + visibleViewletIds.length + this.offset) % visibleViewletIds.length];
                break;
            }
        }
        await paneCompositeService.openPaneComposite(targetViewletId, 0, true);
    }
}
registerAction2(class PreviousSideBarViewAction extends SwitchSideBarViewAction {
    constructor() {
        super({
            id: 'workbench.action.previousSideBarView',
            title: localize2('previousSideBarView', 'Previous Primary Side Bar View'),
            category: Categories.View,
            f1: true
        }, -1);
    }
});
registerAction2(class NextSideBarViewAction extends SwitchSideBarViewAction {
    constructor() {
        super({
            id: 'workbench.action.nextSideBarView',
            title: localize2('nextSideBarView', 'Next Primary Side Bar View'),
            category: Categories.View,
            f1: true
        }, 1);
    }
});
registerAction2(class FocusActivityBarAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.focusActivityBar',
            title: localize2('focusActivityBar', 'Focus Activity Bar'),
            category: Categories.View,
            f1: true
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        layoutService.focusPart("workbench.parts.activitybar");
    }
});
registerThemingParticipant((theme, collector) => {
    const activityBarActiveBorderColor = theme.getColor(ACTIVITY_BAR_ACTIVE_BORDER);
    if (activityBarActiveBorderColor) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator:before {
				border-left-color: ${activityBarActiveBorderColor};
			}
		`);
    }
    const activityBarActiveFocusBorderColor = theme.getColor(ACTIVITY_BAR_ACTIVE_FOCUS_BORDER);
    if (activityBarActiveFocusBorderColor) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus::before {
				visibility: hidden;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:focus .active-item-indicator:before {
				visibility: visible;
				border-left-color: ${activityBarActiveFocusBorderColor};
			}
		`);
    }
    const activityBarActiveBackgroundColor = theme.getColor(ACTIVITY_BAR_ACTIVE_BACKGROUND);
    if (activityBarActiveBackgroundColor) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .active-item-indicator {
				z-index: 0;
				background-color: ${activityBarActiveBackgroundColor};
			}
		`);
    }
    const outline = theme.getColor(activeContrastBorder);
    if (outline) {
        collector.addRule(`
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item .action-label::before{
				padding: 6px;
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.active:hover .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked .action-label::before,
			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item.checked:hover .action-label::before {
				outline: 1px solid ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:hover .action-label::before {
				outline: 1px dashed ${outline};
			}

			.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator:before {
				border-left-color: ${outline};
			}
		`);
    }
    else {
        const focusBorderColor = theme.getColor(focusBorder);
        if (focusBorderColor) {
            collector.addRule(`
				.monaco-workbench .activitybar > .content :not(.monaco-menu) > .monaco-action-bar .action-item:focus .active-item-indicator::before {
						border-left-color: ${focusBorderColor};
					}
				`);
        }
    }
});
