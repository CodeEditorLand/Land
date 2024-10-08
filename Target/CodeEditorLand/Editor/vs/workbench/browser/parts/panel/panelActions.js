/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './media/panelpart.css';
import { localize, localize2 } from '../../../../nls.js';
import { MenuId, MenuRegistry, registerAction2, Action2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { isHorizontal, IWorkbenchLayoutService, positionToString } from '../../../services/layout/browser/layoutService.js';
import { AuxiliaryBarVisibleContext, PanelAlignmentContext, PanelMaximizedContext, PanelPositionContext, PanelVisibleContext } from '../../../common/contextkeys.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
import { ViewContainerLocationToString, IViewDescriptorService } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
const maximizeIcon = registerIcon('panel-maximize', Codicon.chevronUp, localize('maximizeIcon', 'Icon to maximize a panel.'));
const restoreIcon = registerIcon('panel-restore', Codicon.chevronDown, localize('restoreIcon', 'Icon to restore a panel.'));
const closeIcon = registerIcon('panel-close', Codicon.close, localize('closeIcon', 'Icon to close a panel.'));
const panelIcon = registerIcon('panel-layout-icon', Codicon.layoutPanel, localize('togglePanelOffIcon', 'Icon to toggle the panel off when it is on.'));
const panelOffIcon = registerIcon('panel-layout-icon-off', Codicon.layoutPanelOff, localize('togglePanelOnIcon', 'Icon to toggle the panel on when it is off.'));
export class TogglePanelAction extends Action2 {
    static { this.ID = 'workbench.action.togglePanel'; }
    static { this.LABEL = localize2('togglePanelVisibility', "Toggle Panel Visibility"); }
    constructor() {
        super({
            id: TogglePanelAction.ID,
            title: TogglePanelAction.LABEL,
            toggled: {
                condition: PanelVisibleContext,
                title: localize('toggle panel', "Panel"),
                mnemonicTitle: localize({ key: 'toggle panel mnemonic', comment: ['&& denotes a mnemonic'] }, "&&Panel"),
            },
            f1: true,
            category: Categories.View,
            keybinding: { primary: 2048 /* KeyMod.CtrlCmd */ | 40 /* KeyCode.KeyJ */, weight: 200 /* KeybindingWeight.WorkbenchContrib */ },
            menu: [
                {
                    id: MenuId.MenubarAppearanceMenu,
                    group: '2_workbench_layout',
                    order: 5
                }, {
                    id: MenuId.LayoutControlMenuSubmenu,
                    group: '0_workbench_layout',
                    order: 4
                },
            ]
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        layoutService.setPartHidden(layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */), "workbench.parts.panel" /* Parts.PANEL_PART */);
    }
}
registerAction2(TogglePanelAction);
registerAction2(class extends Action2 {
    static { this.ID = 'workbench.action.focusPanel'; }
    static { this.LABEL = localize('focusPanel', "Focus into Panel"); }
    constructor() {
        super({
            id: 'workbench.action.focusPanel',
            title: localize2('focusPanel', "Focus into Panel"),
            category: Categories.View,
            f1: true,
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        // Show panel
        if (!layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
            layoutService.setPartHidden(false, "workbench.parts.panel" /* Parts.PANEL_PART */);
        }
        // Focus into active panel
        const panel = paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
        panel?.focus();
    }
});
const PositionPanelActionId = {
    LEFT: 'workbench.action.positionPanelLeft',
    RIGHT: 'workbench.action.positionPanelRight',
    BOTTOM: 'workbench.action.positionPanelBottom',
    TOP: 'workbench.action.positionPanelTop'
};
const AlignPanelActionId = {
    LEFT: 'workbench.action.alignPanelLeft',
    RIGHT: 'workbench.action.alignPanelRight',
    CENTER: 'workbench.action.alignPanelCenter',
    JUSTIFY: 'workbench.action.alignPanelJustify',
};
function createPanelActionConfig(id, title, shortLabel, value, when) {
    return {
        id,
        title,
        shortLabel,
        value,
        when,
    };
}
function createPositionPanelActionConfig(id, title, shortLabel, position) {
    return createPanelActionConfig(id, title, shortLabel, position, PanelPositionContext.notEqualsTo(positionToString(position)));
}
function createAlignmentPanelActionConfig(id, title, shortLabel, alignment) {
    return createPanelActionConfig(id, title, shortLabel, alignment, PanelAlignmentContext.notEqualsTo(alignment));
}
const PositionPanelActionConfigs = [
    createPositionPanelActionConfig(PositionPanelActionId.TOP, localize2('positionPanelTop', "Move Panel To Top"), localize('positionPanelTopShort', "Top"), 3 /* Position.TOP */),
    createPositionPanelActionConfig(PositionPanelActionId.LEFT, localize2('positionPanelLeft', "Move Panel Left"), localize('positionPanelLeftShort', "Left"), 0 /* Position.LEFT */),
    createPositionPanelActionConfig(PositionPanelActionId.RIGHT, localize2('positionPanelRight', "Move Panel Right"), localize('positionPanelRightShort', "Right"), 1 /* Position.RIGHT */),
    createPositionPanelActionConfig(PositionPanelActionId.BOTTOM, localize2('positionPanelBottom', "Move Panel To Bottom"), localize('positionPanelBottomShort', "Bottom"), 2 /* Position.BOTTOM */),
];
const AlignPanelActionConfigs = [
    createAlignmentPanelActionConfig(AlignPanelActionId.LEFT, localize2('alignPanelLeft', "Set Panel Alignment to Left"), localize('alignPanelLeftShort', "Left"), 'left'),
    createAlignmentPanelActionConfig(AlignPanelActionId.RIGHT, localize2('alignPanelRight', "Set Panel Alignment to Right"), localize('alignPanelRightShort', "Right"), 'right'),
    createAlignmentPanelActionConfig(AlignPanelActionId.CENTER, localize2('alignPanelCenter', "Set Panel Alignment to Center"), localize('alignPanelCenterShort', "Center"), 'center'),
    createAlignmentPanelActionConfig(AlignPanelActionId.JUSTIFY, localize2('alignPanelJustify', "Set Panel Alignment to Justify"), localize('alignPanelJustifyShort', "Justify"), 'justify'),
];
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
    submenu: MenuId.PanelPositionMenu,
    title: localize('positionPanel', "Panel Position"),
    group: '3_workbench_layout_move',
    order: 4
});
PositionPanelActionConfigs.forEach((positionPanelAction, index) => {
    const { id, title, shortLabel, value, when } = positionPanelAction;
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id,
                title,
                category: Categories.View,
                f1: true
            });
        }
        run(accessor) {
            const layoutService = accessor.get(IWorkbenchLayoutService);
            layoutService.setPanelPosition(value === undefined ? 2 /* Position.BOTTOM */ : value);
        }
    });
    MenuRegistry.appendMenuItem(MenuId.PanelPositionMenu, {
        command: {
            id,
            title: shortLabel,
            toggled: when.negate()
        },
        order: 5 + index
    });
});
MenuRegistry.appendMenuItem(MenuId.MenubarAppearanceMenu, {
    submenu: MenuId.PanelAlignmentMenu,
    title: localize('alignPanel', "Align Panel"),
    group: '3_workbench_layout_move',
    order: 5
});
AlignPanelActionConfigs.forEach(alignPanelAction => {
    const { id, title, shortLabel, value, when } = alignPanelAction;
    registerAction2(class extends Action2 {
        constructor() {
            super({
                id,
                title,
                category: Categories.View,
                toggled: when.negate(),
                f1: true
            });
        }
        run(accessor) {
            const layoutService = accessor.get(IWorkbenchLayoutService);
            layoutService.setPanelAlignment(value === undefined ? 'center' : value);
        }
    });
    MenuRegistry.appendMenuItem(MenuId.PanelAlignmentMenu, {
        command: {
            id,
            title: shortLabel,
            toggled: when.negate()
        },
        order: 5
    });
});
class SwitchPanelViewAction extends Action2 {
    constructor(id, title) {
        super({
            id,
            title,
            category: Categories.View,
            f1: true,
        });
    }
    async run(accessor, offset) {
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        const pinnedPanels = paneCompositeService.getVisiblePaneCompositeIds(1 /* ViewContainerLocation.Panel */);
        const activePanel = paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
        if (!activePanel) {
            return;
        }
        let targetPanelId;
        for (let i = 0; i < pinnedPanels.length; i++) {
            if (pinnedPanels[i] === activePanel.getId()) {
                targetPanelId = pinnedPanels[(i + pinnedPanels.length + offset) % pinnedPanels.length];
                break;
            }
        }
        if (typeof targetPanelId === 'string') {
            await paneCompositeService.openPaneComposite(targetPanelId, 1 /* ViewContainerLocation.Panel */, true);
        }
    }
}
registerAction2(class extends SwitchPanelViewAction {
    constructor() {
        super('workbench.action.previousPanelView', localize2('previousPanelView', "Previous Panel View"));
    }
    run(accessor) {
        return super.run(accessor, -1);
    }
});
registerAction2(class extends SwitchPanelViewAction {
    constructor() {
        super('workbench.action.nextPanelView', localize2('nextPanelView', "Next Panel View"));
    }
    run(accessor) {
        return super.run(accessor, 1);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.toggleMaximizedPanel',
            title: localize2('toggleMaximizedPanel', 'Toggle Maximized Panel'),
            tooltip: localize('maximizePanel', "Maximize Panel Size"),
            category: Categories.View,
            f1: true,
            icon: maximizeIcon, // This is being rotated in CSS depending on the panel position
            // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
            precondition: ContextKeyExpr.or(PanelAlignmentContext.isEqualTo('center'), ContextKeyExpr.and(PanelPositionContext.notEqualsTo('bottom'), PanelPositionContext.notEqualsTo('top'))),
            toggled: { condition: PanelMaximizedContext, icon: restoreIcon, tooltip: localize('minimizePanel', "Restore Panel Size") },
            menu: [{
                    id: MenuId.PanelTitle,
                    group: 'navigation',
                    order: 1,
                    // the workbench grid currently prevents us from supporting panel maximization with non-center panel alignment
                    when: ContextKeyExpr.or(PanelAlignmentContext.isEqualTo('center'), ContextKeyExpr.and(PanelPositionContext.notEqualsTo('bottom'), PanelPositionContext.notEqualsTo('top')))
                }]
        });
    }
    run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const notificationService = accessor.get(INotificationService);
        if (layoutService.getPanelAlignment() !== 'center' && isHorizontal(layoutService.getPanelPosition())) {
            notificationService.warn(localize('panelMaxNotSupported', "Maximizing the panel is only supported when it is center aligned."));
            return;
        }
        if (!layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
            layoutService.setPartHidden(false, "workbench.parts.panel" /* Parts.PANEL_PART */);
            // If the panel is not already maximized, maximize it
            if (!layoutService.isPanelMaximized()) {
                layoutService.toggleMaximizedPanel();
            }
        }
        else {
            layoutService.toggleMaximizedPanel();
        }
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.closePanel',
            title: localize2('closePanel', 'Hide Panel'),
            category: Categories.View,
            icon: closeIcon,
            menu: [{
                    id: MenuId.CommandPalette,
                    when: PanelVisibleContext,
                }, {
                    id: MenuId.PanelTitle,
                    group: 'navigation',
                    order: 2
                }]
        });
    }
    run(accessor) {
        accessor.get(IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.panel" /* Parts.PANEL_PART */);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.closeAuxiliaryBar',
            title: localize2('closeSecondarySideBar', 'Hide Secondary Side Bar'),
            category: Categories.View,
            icon: closeIcon,
            menu: [{
                    id: MenuId.CommandPalette,
                    when: AuxiliaryBarVisibleContext,
                }, {
                    id: MenuId.AuxiliaryBarTitle,
                    group: 'navigation',
                    order: 2,
                    when: ContextKeyExpr.notEquals(`config.${"workbench.activityBar.location" /* LayoutSettings.ACTIVITY_BAR_LOCATION */}`, "top" /* ActivityBarPosition.TOP */)
                }]
        });
    }
    run(accessor) {
        accessor.get(IWorkbenchLayoutService).setPartHidden(true, "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
    }
});
MenuRegistry.appendMenuItems([
    {
        id: MenuId.LayoutControlMenu,
        item: {
            group: '0_workbench_toggles',
            command: {
                id: TogglePanelAction.ID,
                title: localize('togglePanel', "Toggle Panel"),
                icon: panelOffIcon,
                toggled: { condition: PanelVisibleContext, icon: panelIcon }
            },
            when: ContextKeyExpr.or(ContextKeyExpr.equals('config.workbench.layoutControl.type', 'toggles'), ContextKeyExpr.equals('config.workbench.layoutControl.type', 'both')),
            order: 1
        }
    }, {
        id: MenuId.ViewTitleContext,
        item: {
            group: '3_workbench_layout_move',
            command: {
                id: TogglePanelAction.ID,
                title: localize2('hidePanel', 'Hide Panel'),
            },
            when: ContextKeyExpr.and(PanelVisibleContext, ContextKeyExpr.equals('viewLocation', ViewContainerLocationToString(1 /* ViewContainerLocation.Panel */))),
            order: 2
        }
    }
]);
class MoveViewsBetweenPanelsAction extends Action2 {
    constructor(source, destination, desc) {
        super(desc);
        this.source = source;
        this.destination = destination;
    }
    run(accessor, ...args) {
        const viewDescriptorService = accessor.get(IViewDescriptorService);
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const viewsService = accessor.get(IViewsService);
        const srcContainers = viewDescriptorService.getViewContainersByLocation(this.source);
        const destContainers = viewDescriptorService.getViewContainersByLocation(this.destination);
        if (srcContainers.length) {
            const activeViewContainer = viewsService.getVisibleViewContainer(this.source);
            srcContainers.forEach(viewContainer => viewDescriptorService.moveViewContainerToLocation(viewContainer, this.destination, undefined, this.desc.id));
            layoutService.setPartHidden(false, this.destination === 1 /* ViewContainerLocation.Panel */ ? "workbench.parts.panel" /* Parts.PANEL_PART */ : "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
            if (activeViewContainer && destContainers.length === 0) {
                viewsService.openViewContainer(activeViewContainer.id, true);
            }
        }
    }
}
// --- Move Panel Views To Secondary Side Bar
class MovePanelToSidePanelAction extends MoveViewsBetweenPanelsAction {
    static { this.ID = 'workbench.action.movePanelToSidePanel'; }
    constructor() {
        super(1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */, {
            id: MovePanelToSidePanelAction.ID,
            title: localize2('movePanelToSecondarySideBar', "Move Panel Views To Secondary Side Bar"),
            category: Categories.View,
            f1: false
        });
    }
}
export class MovePanelToSecondarySideBarAction extends MoveViewsBetweenPanelsAction {
    static { this.ID = 'workbench.action.movePanelToSecondarySideBar'; }
    constructor() {
        super(1 /* ViewContainerLocation.Panel */, 2 /* ViewContainerLocation.AuxiliaryBar */, {
            id: MovePanelToSecondarySideBarAction.ID,
            title: localize2('movePanelToSecondarySideBar', "Move Panel Views To Secondary Side Bar"),
            category: Categories.View,
            f1: true
        });
    }
}
registerAction2(MovePanelToSidePanelAction);
registerAction2(MovePanelToSecondarySideBarAction);
// --- Move Secondary Side Bar Views To Panel
class MoveSidePanelToPanelAction extends MoveViewsBetweenPanelsAction {
    static { this.ID = 'workbench.action.moveSidePanelToPanel'; }
    constructor() {
        super(2 /* ViewContainerLocation.AuxiliaryBar */, 1 /* ViewContainerLocation.Panel */, {
            id: MoveSidePanelToPanelAction.ID,
            title: localize2('moveSidePanelToPanel', "Move Secondary Side Bar Views To Panel"),
            category: Categories.View,
            f1: false
        });
    }
}
export class MoveSecondarySideBarToPanelAction extends MoveViewsBetweenPanelsAction {
    static { this.ID = 'workbench.action.moveSecondarySideBarToPanel'; }
    constructor() {
        super(2 /* ViewContainerLocation.AuxiliaryBar */, 1 /* ViewContainerLocation.Panel */, {
            id: MoveSecondarySideBarToPanelAction.ID,
            title: localize2('moveSidePanelToPanel', "Move Secondary Side Bar Views To Panel"),
            category: Categories.View,
            f1: true
        });
    }
}
registerAction2(MoveSidePanelToPanelAction);
registerAction2(MoveSecondarySideBarToPanelAction);
