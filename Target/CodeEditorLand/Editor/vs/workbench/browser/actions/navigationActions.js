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
        const isEditorFocus = layoutService.hasFocus("workbench.parts.editor");
        const isPanelFocus = layoutService.hasFocus("workbench.parts.panel");
        const isSidebarFocus = layoutService.hasFocus("workbench.parts.sidebar");
        const isAuxiliaryBarFocus = layoutService.hasFocus("workbench.parts.auxiliarybar");
        let neighborPart;
        if (isEditorFocus) {
            const didNavigate = this.navigateAcrossEditorGroup(this.toGroupDirection(this.direction), editorGroupService);
            if (didNavigate) {
                return;
            }
            neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.editor", this.direction);
        }
        if (isPanelFocus) {
            neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.panel", this.direction);
        }
        if (isSidebarFocus) {
            neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.sidebar", this.direction);
        }
        if (isAuxiliaryBarFocus) {
            neighborPart = neighborPart = layoutService.getVisibleNeighborPart("workbench.parts.auxiliarybar", this.direction);
        }
        if (neighborPart === "workbench.parts.editor") {
            if (!this.navigateBackToEditorGroup(this.toGroupDirection(this.direction), editorGroupService)) {
                this.navigateToEditorGroup(this.direction === 3 ? 0 : 1, editorGroupService);
            }
        }
        else if (neighborPart === "workbench.parts.sidebar") {
            this.navigateToSidebar(layoutService, paneCompositeService);
        }
        else if (neighborPart === "workbench.parts.panel") {
            this.navigateToPanel(layoutService, paneCompositeService);
        }
        else if (neighborPart === "workbench.parts.auxiliarybar") {
            this.navigateToAuxiliaryBar(layoutService, paneCompositeService);
        }
    }
    async navigateToPanel(layoutService, paneCompositeService) {
        if (!layoutService.isVisible("workbench.parts.panel")) {
            return false;
        }
        const activePanel = paneCompositeService.getActivePaneComposite(1);
        if (!activePanel) {
            return false;
        }
        const activePanelId = activePanel.getId();
        const res = await paneCompositeService.openPaneComposite(activePanelId, 1, true);
        if (!res) {
            return false;
        }
        return res;
    }
    async navigateToSidebar(layoutService, paneCompositeService) {
        if (!layoutService.isVisible("workbench.parts.sidebar")) {
            return false;
        }
        const activeViewlet = paneCompositeService.getActivePaneComposite(0);
        if (!activeViewlet) {
            return false;
        }
        const activeViewletId = activeViewlet.getId();
        const viewlet = await paneCompositeService.openPaneComposite(activeViewletId, 0, true);
        return !!viewlet;
    }
    async navigateToAuxiliaryBar(layoutService, paneCompositeService) {
        if (!layoutService.isVisible("workbench.parts.auxiliarybar")) {
            return false;
        }
        const activePanel = paneCompositeService.getActivePaneComposite(2);
        if (!activePanel) {
            return false;
        }
        const activePanelId = activePanel.getId();
        const res = await paneCompositeService.openPaneComposite(activePanelId, 2, true);
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
        const groupInBetween = editorGroupService.findGroup({ direction: oppositeDirection }, editorGroupService.activeGroup);
        if (!groupInBetween) {
            editorGroupService.activeGroup.focus();
            return true;
        }
        return false;
    }
    toGroupDirection(direction) {
        switch (direction) {
            case 1: return 1;
            case 2: return 2;
            case 3: return 3;
            case 0: return 0;
        }
    }
    toOppositeDirection(direction) {
        switch (direction) {
            case 0: return 1;
            case 3: return 2;
            case 2: return 3;
            case 1: return 0;
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
        }, 2);
    }
});
registerAction2(class extends BaseNavigationAction {
    constructor() {
        super({
            id: 'workbench.action.navigateRight',
            title: localize2('navigateRight', 'Navigate to the View on the Right'),
            category: Categories.View,
            f1: true
        }, 3);
    }
});
registerAction2(class extends BaseNavigationAction {
    constructor() {
        super({
            id: 'workbench.action.navigateUp',
            title: localize2('navigateUp', 'Navigate to the View Above'),
            category: Categories.View,
            f1: true
        }, 0);
    }
});
registerAction2(class extends BaseNavigationAction {
    constructor() {
        super({
            id: 'workbench.action.navigateDown',
            title: localize2('navigateDown', 'Navigate to the View Below'),
            category: Categories.View,
            f1: true
        }, 1);
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
                case "workbench.parts.editor":
                    neighbour = "workbench.parts.statusbar";
                    break;
                default:
                    neighbour = "workbench.parts.editor";
            }
        }
        else {
            switch (part) {
                case "workbench.parts.editor":
                    neighbour = next ? "workbench.parts.panel" : "workbench.parts.sidebar";
                    break;
                case "workbench.parts.panel":
                    neighbour = next ? "workbench.parts.auxiliarybar" : "workbench.parts.editor";
                    break;
                case "workbench.parts.auxiliarybar":
                    neighbour = next ? "workbench.parts.statusbar" : "workbench.parts.panel";
                    break;
                case "workbench.parts.statusbar":
                    neighbour = next ? "workbench.parts.activitybar" : "workbench.parts.auxiliarybar";
                    break;
                case "workbench.parts.activitybar":
                    neighbour = next ? "workbench.parts.sidebar" : "workbench.parts.statusbar";
                    break;
                case "workbench.parts.sidebar":
                    neighbour = next ? "workbench.parts.editor" : "workbench.parts.activitybar";
                    break;
                default:
                    neighbour = "workbench.parts.editor";
            }
        }
        if (layoutService.isVisible(neighbour, activeWindow) || neighbour === "workbench.parts.editor") {
            return neighbour;
        }
        return this.findVisibleNeighbour(layoutService, neighbour, next);
    }
    focusNextOrPreviousPart(layoutService, editorService, next) {
        let currentlyFocusedPart;
        if (editorService.activeEditorPane?.hasFocus() || layoutService.hasFocus("workbench.parts.editor")) {
            currentlyFocusedPart = "workbench.parts.editor";
        }
        else if (layoutService.hasFocus("workbench.parts.activitybar")) {
            currentlyFocusedPart = "workbench.parts.activitybar";
        }
        else if (layoutService.hasFocus("workbench.parts.statusbar")) {
            currentlyFocusedPart = "workbench.parts.statusbar";
        }
        else if (layoutService.hasFocus("workbench.parts.sidebar")) {
            currentlyFocusedPart = "workbench.parts.sidebar";
        }
        else if (layoutService.hasFocus("workbench.parts.auxiliarybar")) {
            currentlyFocusedPart = "workbench.parts.auxiliarybar";
        }
        else if (layoutService.hasFocus("workbench.parts.panel")) {
            currentlyFocusedPart = "workbench.parts.panel";
        }
        layoutService.focusPart(currentlyFocusedPart ? this.findVisibleNeighbour(layoutService, currentlyFocusedPart, next) : "workbench.parts.editor", getActiveWindow());
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
                primary: 64,
                weight: 200
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
                primary: 1024 | 64,
                weight: 200
            }
        }, false);
    }
});
