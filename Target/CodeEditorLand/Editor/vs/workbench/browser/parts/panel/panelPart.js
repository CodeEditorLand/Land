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
var PanelPart_1;
import './media/panelpart.css';
import { localize } from '../../../../nls.js';
import { Separator, SubmenuAction, toAction } from '../../../../base/common/actions.js';
import { ActivePanelContext, PanelFocusContext } from '../../../common/contextkeys.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { TogglePanelAction } from './panelActions.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { PANEL_BACKGROUND, PANEL_BORDER, PANEL_ACTIVE_TITLE_FOREGROUND, PANEL_INACTIVE_TITLE_FOREGROUND, PANEL_ACTIVE_TITLE_BORDER, PANEL_DRAG_AND_DROP_BORDER } from '../../../common/theme.js';
import { contrastBorder, badgeBackground, badgeForeground } from '../../../../platform/theme/common/colorRegistry.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IMenuService, MenuId } from '../../../../platform/actions/common/actions.js';
import { AbstractPaneCompositePart, CompositeBarPosition } from '../paneCompositePart.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
let PanelPart = class PanelPart extends AbstractPaneCompositePart {
    static { PanelPart_1 = this; }
    get preferredHeight() {
        // Don't worry about titlebar or statusbar visibility
        // The difference is minimal and keeps this function clean
        return this.layoutService.mainContainerDimension.height * 0.4;
    }
    get preferredWidth() {
        const activeComposite = this.getActivePaneComposite();
        if (!activeComposite) {
            return;
        }
        const width = activeComposite.getOptimalWidth();
        if (typeof width !== 'number') {
            return;
        }
        return Math.max(width, 300);
    }
    //#endregion
    static { this.activePanelSettingsKey = 'workbench.panelpart.activepanelid'; }
    constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, commandService, menuService, configurationService) {
        super("workbench.parts.panel" /* Parts.PANEL_PART */, { hasTitle: true }, PanelPart_1.activePanelSettingsKey, ActivePanelContext.bindTo(contextKeyService), PanelFocusContext.bindTo(contextKeyService), 'panel', 'panel', undefined, notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, viewDescriptorService, contextKeyService, extensionService, menuService);
        this.commandService = commandService;
        this.configurationService = configurationService;
        //#region IView
        this.minimumWidth = 300;
        this.maximumWidth = Number.POSITIVE_INFINITY;
        this.minimumHeight = 77;
        this.maximumHeight = Number.POSITIVE_INFINITY;
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('workbench.panel.showLabel')) {
                this.updateCompositeBar(true);
            }
        }));
    }
    updateStyles() {
        super.updateStyles();
        const container = assertIsDefined(this.getContainer());
        container.style.backgroundColor = this.getColor(PANEL_BACKGROUND) || '';
        const borderColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || '';
        container.style.borderLeftColor = borderColor;
        container.style.borderRightColor = borderColor;
        container.style.borderBottomColor = borderColor;
        const title = this.getTitleArea();
        if (title) {
            title.style.borderTopColor = this.getColor(PANEL_BORDER) || this.getColor(contrastBorder) || '';
        }
    }
    getCompositeBarOptions() {
        return {
            partContainerClass: 'panel',
            pinnedViewContainersKey: 'workbench.panel.pinnedPanels',
            placeholderViewContainersKey: 'workbench.panel.placeholderPanels',
            viewContainersWorkspaceStateKey: 'workbench.panel.viewContainersWorkspaceState',
            icon: this.configurationService.getValue('workbench.panel.showLabel') === false,
            orientation: 0 /* ActionsOrientation.HORIZONTAL */,
            recomputeSizes: true,
            activityHoverOptions: {
                position: () => this.layoutService.getPanelPosition() === 2 /* Position.BOTTOM */ && !this.layoutService.isPanelMaximized() ? 3 /* HoverPosition.ABOVE */ : 2 /* HoverPosition.BELOW */,
            },
            fillExtraContextMenuActions: actions => this.fillExtraContextMenuActions(actions),
            compositeSize: 0,
            iconSize: 16,
            overflowActionSize: 44,
            colors: theme => ({
                activeBackgroundColor: theme.getColor(PANEL_BACKGROUND), // Background color for overflow action
                inactiveBackgroundColor: theme.getColor(PANEL_BACKGROUND), // Background color for overflow action
                activeBorderBottomColor: theme.getColor(PANEL_ACTIVE_TITLE_BORDER),
                activeForegroundColor: theme.getColor(PANEL_ACTIVE_TITLE_FOREGROUND),
                inactiveForegroundColor: theme.getColor(PANEL_INACTIVE_TITLE_FOREGROUND),
                badgeBackground: theme.getColor(badgeBackground),
                badgeForeground: theme.getColor(badgeForeground),
                dragAndDropBorder: theme.getColor(PANEL_DRAG_AND_DROP_BORDER)
            })
        };
    }
    fillExtraContextMenuActions(actions) {
        const panelPositionMenu = this.menuService.getMenuActions(MenuId.PanelPositionMenu, this.contextKeyService, { shouldForwardArgs: true });
        const panelAlignMenu = this.menuService.getMenuActions(MenuId.PanelAlignmentMenu, this.contextKeyService, { shouldForwardArgs: true });
        const positionActions = [];
        const alignActions = [];
        createAndFillInContextMenuActions(panelPositionMenu, { primary: [], secondary: positionActions });
        createAndFillInContextMenuActions(panelAlignMenu, { primary: [], secondary: alignActions });
        actions.push(...[
            new Separator(),
            new SubmenuAction('workbench.action.panel.position', localize('panel position', "Panel Position"), positionActions),
            new SubmenuAction('workbench.action.panel.align', localize('align panel', "Align Panel"), alignActions),
            toAction({ id: TogglePanelAction.ID, label: localize('hidePanel', "Hide Panel"), run: () => this.commandService.executeCommand(TogglePanelAction.ID) })
        ]);
    }
    layout(width, height, top, left) {
        let dimensions;
        switch (this.layoutService.getPanelPosition()) {
            case 1 /* Position.RIGHT */:
                dimensions = new Dimension(width - 1, height); // Take into account the 1px border when layouting
                break;
            case 3 /* Position.TOP */:
                dimensions = new Dimension(width, height - 1); // Take into account the 1px border when layouting
                break;
            default:
                dimensions = new Dimension(width, height);
                break;
        }
        // Layout contents
        super.layout(dimensions.width, dimensions.height, top, left);
    }
    shouldShowCompositeBar() {
        return true;
    }
    getCompositeBarPosition() {
        return CompositeBarPosition.TITLE;
    }
    toJSON() {
        return {
            type: "workbench.parts.panel" /* Parts.PANEL_PART */
        };
    }
};
PanelPart = PanelPart_1 = __decorate([
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
    __param(11, ICommandService),
    __param(12, IMenuService),
    __param(13, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], PanelPart);
export { PanelPart };
