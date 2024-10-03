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
var SidebarPart_1;
import './media/sidebarpart.css';
import './sidebarActions.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { SidebarFocusContext, ActiveViewletContext } from '../../../common/contextkeys.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { contrastBorder } from '../../../../platform/theme/common/colorRegistry.js';
import { SIDE_BAR_TITLE_FOREGROUND, SIDE_BAR_BACKGROUND, SIDE_BAR_FOREGROUND, SIDE_BAR_BORDER, SIDE_BAR_DRAG_AND_DROP_BACKGROUND, ACTIVITY_BAR_BADGE_BACKGROUND, ACTIVITY_BAR_BADGE_FOREGROUND, ACTIVITY_BAR_TOP_FOREGROUND, ACTIVITY_BAR_TOP_ACTIVE_BORDER, ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND, ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER } from '../../../common/theme.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { AbstractPaneCompositePart, CompositeBarPosition } from '../paneCompositePart.js';
import { ActivityBarCompositeBar, ActivitybarPart } from '../activitybar/activitybarPart.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Action2, IMenuService, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Separator } from '../../../../base/common/actions.js';
import { ToggleActivityBarVisibilityActionId } from '../../actions/layoutActions.js';
import { localize2 } from '../../../../nls.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
let SidebarPart = class SidebarPart extends AbstractPaneCompositePart {
    static { SidebarPart_1 = this; }
    static { this.activeViewletSettingsKey = 'workbench.sidebar.activeviewletid'; }
    get snap() { return true; }
    get preferredWidth() {
        const viewlet = this.getActivePaneComposite();
        if (!viewlet) {
            return;
        }
        const width = viewlet.getOptimalWidth();
        if (typeof width !== 'number') {
            return;
        }
        return Math.max(width, 300);
    }
    constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, configurationService, menuService) {
        super("workbench.parts.sidebar", { hasTitle: true, borderWidth: () => (this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder)) ? 1 : 0 }, SidebarPart_1.activeViewletSettingsKey, ActiveViewletContext.bindTo(contextKeyService), SidebarFocusContext.bindTo(contextKeyService), 'sideBar', 'viewlet', SIDE_BAR_TITLE_FOREGROUND, notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService);
        this.configurationService = configurationService;
        this.minimumWidth = 170;
        this.maximumWidth = Number.POSITIVE_INFINITY;
        this.minimumHeight = 0;
        this.maximumHeight = Number.POSITIVE_INFINITY;
        this.priority = 1;
        this.activityBarPart = this._register(this.instantiationService.createInstance(ActivitybarPart, this));
        this.rememberActivityBarVisiblePosition();
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("workbench.activityBar.location")) {
                this.onDidChangeActivityBarLocation();
            }
        }));
        this.registerActions();
    }
    onDidChangeActivityBarLocation() {
        this.activityBarPart.hide();
        this.updateCompositeBar();
        const id = this.getActiveComposite()?.getId();
        if (id) {
            this.onTitleAreaUpdate(id);
        }
        if (this.shouldShowActivityBar()) {
            this.activityBarPart.show();
        }
        this.rememberActivityBarVisiblePosition();
    }
    updateStyles() {
        super.updateStyles();
        const container = assertIsDefined(this.getContainer());
        container.style.backgroundColor = this.getColor(SIDE_BAR_BACKGROUND) || '';
        container.style.color = this.getColor(SIDE_BAR_FOREGROUND) || '';
        const borderColor = this.getColor(SIDE_BAR_BORDER) || this.getColor(contrastBorder);
        const isPositionLeft = this.layoutService.getSideBarPosition() === 0;
        container.style.borderRightWidth = borderColor && isPositionLeft ? '1px' : '';
        container.style.borderRightStyle = borderColor && isPositionLeft ? 'solid' : '';
        container.style.borderRightColor = isPositionLeft ? borderColor || '' : '';
        container.style.borderLeftWidth = borderColor && !isPositionLeft ? '1px' : '';
        container.style.borderLeftStyle = borderColor && !isPositionLeft ? 'solid' : '';
        container.style.borderLeftColor = !isPositionLeft ? borderColor || '' : '';
        container.style.outlineColor = this.getColor(SIDE_BAR_DRAG_AND_DROP_BACKGROUND) ?? '';
    }
    layout(width, height, top, left) {
        if (!this.layoutService.isVisible("workbench.parts.sidebar")) {
            return;
        }
        super.layout(width, height, top, left);
    }
    getTitleAreaDropDownAnchorAlignment() {
        return this.layoutService.getSideBarPosition() === 0 ? 0 : 1;
    }
    createCompositeBar() {
        return this.instantiationService.createInstance(ActivityBarCompositeBar, this.getCompositeBarOptions(), this.partId, this, false);
    }
    getCompositeBarOptions() {
        return {
            partContainerClass: 'sidebar',
            pinnedViewContainersKey: ActivitybarPart.pinnedViewContainersKey,
            placeholderViewContainersKey: ActivitybarPart.placeholderViewContainersKey,
            viewContainersWorkspaceStateKey: ActivitybarPart.viewContainersWorkspaceStateKey,
            icon: true,
            orientation: 0,
            recomputeSizes: true,
            activityHoverOptions: {
                position: () => this.getCompositeBarPosition() === CompositeBarPosition.BOTTOM ? 3 : 2,
            },
            fillExtraContextMenuActions: actions => {
                const viewsSubmenuAction = this.getViewsSubmenuAction();
                if (viewsSubmenuAction) {
                    actions.push(new Separator());
                    actions.push(viewsSubmenuAction);
                }
            },
            compositeSize: 0,
            iconSize: 16,
            overflowActionSize: 30,
            colors: theme => ({
                activeBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
                inactiveBackgroundColor: theme.getColor(SIDE_BAR_BACKGROUND),
                activeBorderBottomColor: theme.getColor(ACTIVITY_BAR_TOP_ACTIVE_BORDER),
                activeForegroundColor: theme.getColor(ACTIVITY_BAR_TOP_FOREGROUND),
                inactiveForegroundColor: theme.getColor(ACTIVITY_BAR_TOP_INACTIVE_FOREGROUND),
                badgeBackground: theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND),
                badgeForeground: theme.getColor(ACTIVITY_BAR_BADGE_FOREGROUND),
                dragAndDropBorder: theme.getColor(ACTIVITY_BAR_TOP_DRAG_AND_DROP_BORDER)
            }),
            compact: true
        };
    }
    shouldShowCompositeBar() {
        const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location");
        return activityBarPosition === "top" || activityBarPosition === "bottom";
    }
    shouldShowActivityBar() {
        if (this.shouldShowCompositeBar()) {
            return false;
        }
        return this.configurationService.getValue("workbench.activityBar.location") !== "hidden";
    }
    getCompositeBarPosition() {
        const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location");
        switch (activityBarPosition) {
            case "top": return CompositeBarPosition.TOP;
            case "bottom": return CompositeBarPosition.BOTTOM;
            case "hidden":
            case "default":
            default: return CompositeBarPosition.TITLE;
        }
    }
    rememberActivityBarVisiblePosition() {
        const activityBarPosition = this.configurationService.getValue("workbench.activityBar.location");
        if (activityBarPosition !== "hidden") {
            this.storageService.store("workbench.activityBar.location", activityBarPosition, 0, 0);
        }
    }
    getRememberedActivityBarVisiblePosition() {
        const activityBarPosition = this.storageService.get("workbench.activityBar.location", 0);
        switch (activityBarPosition) {
            case "top": return "top";
            case "bottom": return "bottom";
            default: return "default";
        }
    }
    getPinnedPaneCompositeIds() {
        return this.shouldShowCompositeBar() ? super.getPinnedPaneCompositeIds() : this.activityBarPart.getPinnedPaneCompositeIds();
    }
    getVisiblePaneCompositeIds() {
        return this.shouldShowCompositeBar() ? super.getVisiblePaneCompositeIds() : this.activityBarPart.getVisiblePaneCompositeIds();
    }
    async focusActivityBar() {
        if (this.configurationService.getValue("workbench.activityBar.location") === "hidden") {
            await this.configurationService.updateValue("workbench.activityBar.location", this.getRememberedActivityBarVisiblePosition());
            this.onDidChangeActivityBarLocation();
        }
        if (this.shouldShowCompositeBar()) {
            this.focusCompositeBar();
        }
        else {
            if (!this.layoutService.isVisible("workbench.parts.activitybar")) {
                this.layoutService.setPartHidden(false, "workbench.parts.activitybar");
            }
            this.activityBarPart.show(true);
        }
    }
    registerActions() {
        const that = this;
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: ToggleActivityBarVisibilityActionId,
                    title: localize2('toggleActivityBar', "Toggle Activity Bar Visibility"),
                });
            }
            run() {
                const value = that.configurationService.getValue("workbench.activityBar.location") === "hidden" ? that.getRememberedActivityBarVisiblePosition() : "hidden";
                return that.configurationService.updateValue("workbench.activityBar.location", value);
            }
        }));
    }
    toJSON() {
        return {
            type: "workbench.parts.sidebar"
        };
    }
};
SidebarPart = SidebarPart_1 = __decorate([
    __param(0, INotificationService),
    __param(1, IStorageService),
    __param(2, IContextMenuService),
    __param(3, IWorkbenchLayoutService),
    __param(4, IKeybindingService),
    __param(5, IHoverService),
    __param(6, IInstantiationService),
    __param(7, IThemeService),
    __param(8, IViewDescriptorService),
    __param(9, IContextKeyService),
    __param(10, IExtensionService),
    __param(11, IConfigurationService),
    __param(12, IMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], SidebarPart);
export { SidebarPart };
