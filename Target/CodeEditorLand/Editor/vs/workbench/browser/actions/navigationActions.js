/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize2 } from '../../../nls.js';
import { IEditorGroupsService } from '../../services/editor/common/editorGroupsService.js';
import { IWorkbenchLayoutService } from '../../services/layout/browser/layoutService.js';
import { Action2, registerAction2 } from '../../../platform/actions/common/actions.js';
import { Categories } from '../../../platform/action/common/actionCommonCategories.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import { IPaneCompositePartService } from '../../services/panecomposite/browser/panecomposite.js';
import { getActiveWindow } from '../../../base/browser/dom.js';
import { isAuxiliaryWindow } from '../../../base/browser/window.js';
class BaseNavigationAction extends Action2 {
    constructor(options, direction) {
        super(options);
        this.direction = direction;
    }
    run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const editorGroupService = accessor.get(IEditorGroupsService);
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        const isEditorFocus = layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */);
        const isPanelFocus = layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */);
        const isSidebarFocus = layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        const isAuxiliaryBarFocus = layoutService.hasFocus("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */);
        let neighborPart;
        if (isEditorFocus) {
            const didNavigate = this.navigateAcrossEditorGroup(this.toGroupDirection(this.direction), editorGroupService);
            if (didNavigate) {
                return;
            }
            neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.editor" /* Parts.EDITOR_PART */, this.direction);
        }
        if (isPanelFocus) {
            neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.panel" /* Parts.PANEL_PART */, this.direction);
        }
        if (isSidebarFocus) {
            neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */, this.direction);
        }
        if (isAuxiliaryBarFocus) {
            neighborPart = neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */, this.direction);
        }
        if (neighborPart === "workbench.parts.editor" /* Parts.EDITOR_PART */) {
            if (!this.navigateBackToEditorGroup(this.toGroupDirection(this.direction), editorGroupService)) {
                this.navigateToEditorGroup(this.direction === 3 /* Direction.Right */ ? 0 /* GroupLocation.FIRST */ : 1 /* GroupLocation.LAST */, editorGroupService);
            }
        }
        else if (neighborPart === "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */) {
            this.navigateToSidebar(layoutService, paneCompositeService);
        }
        else if (neighborPart === "workbench.parts.panel" /* Parts.PANEL_PART */) {
            this.navigateToPanel(layoutService, paneCompositeService);
        }
        else if (neighborPart === "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */) {
            this.navigateToAuxiliaryBar(layoutService, paneCompositeService);
        }
    }
    async navigateToPanel(layoutService, paneCompositeService) {
        if (!layoutService.isVisible("workbench.parts.panel" /* Parts.PANEL_PART */)) {
            return false;
        }
        const activePanel = paneCompositeService.getActivePaneComposite(1 /* ViewContainerLocation.Panel */);
        if (!activePanel) {
            return false;
        }
        const activePanelId = activePanel.getId();
        const res = await paneCompositeService.openPaneComposite(activePanelId, 1 /* ViewContainerLocation.Panel */, true);
        if (!res) {
            return false;
        }
        return res;
    }
    async navigateToSidebar(layoutService, paneCompositeService) {
        if (!layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
            return false;
        }
        const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
        if (!activeViewlet) {
            return false;
        }
        const activeViewletId = activeViewlet.getId();
        const viewlet = await paneCompositeService.openPaneComposite(activeViewletId, 0 /* ViewContainerLocation.Sidebar */, true);
        return !!viewlet;
    }
    async navigateToAuxiliaryBar(layoutService, paneCompositeService) {
        if (!layoutService.isVisible("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
            return false;
        }
        const activePanel = paneCompositeService.getActivePaneComposite(2 /* ViewContainerLocation.AuxiliaryBar */);
        if (!activePanel) {
            return false;
        }
        const activePanelId = activePanel.getId();
        const res = await paneCompositeService.openPaneComposite(activePanelId, 2 /* ViewContainerLocation.AuxiliaryBar */, true);
        if (!res) {
            return false;
        }
        return res;
    }
    navigateAcrossEditorGroup(direction, editorGroupService) {
        return this.doNavigateToEditorGroup({ direction }, editorGroupService);
    }
    navigateToEditorGroup(location, editorGroupService) {
        return this.doNavigateToEditorGroup({ location }, editorGroupService);
    }
    navigateBackToEditorGroup(direction, editorGroupService) {
        if (!editorGroupService.activeGroup) {
            return false;
        }
        const oppositeDirection = this.toOppositeDirection(direction);
        // Check to see if there is a group in between the last
        // active group and the direction of movement
        const groupInBetween = editorGroupService.findGroup({ direction: oppositeDirection }, editorGroupService.activeGroup);
        if (!groupInBetween) {
            // No group in between means we can return
            // focus to the last active editor group
            editorGroupService.activeGroup.focus();
            return true;
        }
        return false;
    }
    toGroupDirection(direction) {
        switch (direction) {
            case 1 /* Direction.Down */: return 1 /* GroupDirection.DOWN */;
            case 2 /* Direction.Left */: return 2 /* GroupDirection.LEFT */;
            case 3 /* Direction.Right */: return 3 /* GroupDirection.RIGHT */;
            case 0 /* Direction.Up */: return 0 /* GroupDirection.UP */;
        }
    }
    toOppositeDirection(direction) {
        switch (direction) {
            case 0 /* GroupDirection.UP */: return 1 /* GroupDirection.DOWN */;
            case 3 /* GroupDirection.RIGHT */: return 2 /* GroupDirection.LEFT */;
            case 2 /* GroupDirection.LEFT */: return 3 /* GroupDirection.RIGHT */;
            case 1 /* GroupDirection.DOWN */: return 0 /* GroupDirection.UP */;
        }
    }
    doNavigateToEditorGroup(scope, editorGroupService) {
        const targetGroup = editorGroupService.findGroup(scope, editorGroupService.activeGroup);
        if (targetGroup) {
            targetGroup.focus();
            return true;
        }
        return false;
    }
}
registerAction2(class extends BaseNavigationAction {
    constructor() {
        super({
            id: 'workbench.action.navigateLeft',
            title: localize2('navigateLeft', 'Navigate to the View on the Left'),
            category: Categories.View,
            f1: true
        }, 2 /* Direction.Left */);
    }
});
registerAction2(class extends BaseNavigationAction {
    constructor() {
        super({
            id: 'workbench.action.navigateRight',
            title: localize2('navigateRight', 'Navigate to the View on the Right'),
            category: Categories.View,
            f1: true
        }, 3 /* Direction.Right */);
    }
});
registerAction2(class extends BaseNavigationAction {
    constructor() {
        super({
            id: 'workbench.action.navigateUp',
            title: localize2('navigateUp', 'Navigate to the View Above'),
            category: Categories.View,
            f1: true
        }, 0 /* Direction.Up */);
    }
});
registerAction2(class extends BaseNavigationAction {
    constructor() {
        super({
            id: 'workbench.action.navigateDown',
            title: localize2('navigateDown', 'Navigate to the View Below'),
            category: Categories.View,
            f1: true
        }, 1 /* Direction.Down */);
    }
});
class BaseFocusAction extends Action2 {
    constructor(options, focusNext) {
        super(options);
        this.focusNext = focusNext;
    }
    run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const editorService = accessor.get(IEditorService);
        this.focusNextOrPreviousPart(layoutService, editorService, this.focusNext);
    }
    findVisibleNeighbour(layoutService, part, next) {
        const activeWindow = getActiveWindow();
        const windowIsAuxiliary = isAuxiliaryWindow(activeWindow);
        let neighbour;
        if (windowIsAuxiliary) {
            switch (part) {
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    neighbour = "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */;
                    break;
                default:
                    neighbour = "workbench.parts.editor" /* Parts.EDITOR_PART */;
            }
        }
        else {
            switch (part) {
                case "workbench.parts.editor" /* Parts.EDITOR_PART */:
                    neighbour = next ? "workbench.parts.panel" /* Parts.PANEL_PART */ : "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */;
                    break;
                case "workbench.parts.panel" /* Parts.PANEL_PART */:
                    neighbour = next ? "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */ : "workbench.parts.editor" /* Parts.EDITOR_PART */;
                    break;
                case "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */:
                    neighbour = next ? "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */ : "workbench.parts.panel" /* Parts.PANEL_PART */;
                    break;
                case "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */:
                    neighbour = next ? "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */ : "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */;
                    break;
                case "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */:
                    neighbour = next ? "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */ : "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */;
                    break;
                case "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */:
                    neighbour = next ? "workbench.parts.editor" /* Parts.EDITOR_PART */ : "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */;
                    break;
                default:
                    neighbour = "workbench.parts.editor" /* Parts.EDITOR_PART */;
            }
        }
        if (layoutService.isVisible(neighbour, activeWindow) || neighbour === "workbench.parts.editor" /* Parts.EDITOR_PART */) {
            return neighbour;
        }
        return this.findVisibleNeighbour(layoutService, neighbour, next);
    }
    focusNextOrPreviousPart(layoutService, editorService, next) {
        let currentlyFocusedPart;
        if (editorService.activeEditorPane?.hasFocus() || layoutService.hasFocus("workbench.parts.editor" /* Parts.EDITOR_PART */)) {
            currentlyFocusedPart = "workbench.parts.editor" /* Parts.EDITOR_PART */;
        }
        else if (layoutService.hasFocus("workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */)) {
            currentlyFocusedPart = "workbench.parts.activitybar" /* Parts.ACTIVITYBAR_PART */;
        }
        else if (layoutService.hasFocus("workbench.parts.statusbar" /* Parts.STATUSBAR_PART */)) {
            currentlyFocusedPart = "workbench.parts.statusbar" /* Parts.STATUSBAR_PART */;
        }
        else if (layoutService.hasFocus("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
            currentlyFocusedPart = "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */;
        }
        else if (layoutService.hasFocus("workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */)) {
            currentlyFocusedPart = "workbench.parts.auxiliarybar" /* Parts.AUXILIARYBAR_PART */;
        }
        else if (layoutService.hasFocus("workbench.parts.panel" /* Parts.PANEL_PART */)) {
            currentlyFocusedPart = "workbench.parts.panel" /* Parts.PANEL_PART */;
        }
        layoutService.focusPart(currentlyFocusedPart ? this.findVisibleNeighbour(layoutService, currentlyFocusedPart, next) : "workbench.parts.editor" /* Parts.EDITOR_PART */, getActiveWindow());
    }
}
registerAction2(class extends BaseFocusAction {
    constructor() {
        super({
            id: 'workbench.action.focusNextPart',
            title: localize2('focusNextPart', 'Focus Next Part'),
            category: Categories.View,
            f1: true,
            keybinding: {
                primary: 64 /* KeyCode.F6 */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            }
        }, true);
    }
});
registerAction2(class extends BaseFocusAction {
    constructor() {
        super({
            id: 'workbench.action.focusPreviousPart',
            title: localize2('focusPreviousPart', 'Focus Previous Part'),
            category: Categories.View,
            f1: true,
            keybinding: {
                primary: 1024 /* KeyMod.Shift */ | 64 /* KeyCode.F6 */,
                weight: 200 /* KeybindingWeight.WorkbenchContrib */
            }
        }, false);
    }
});
