import './media/sidebarpart.css';
import { localize2 } from '../../../../nls.js';
import { Action2, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IWorkbenchLayoutService } from '../../../services/layout/browser/layoutService.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
export class FocusSideBarAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.focusSideBar',
            title: localize2('focusSideBar', 'Focus into Primary Side Bar'),
            category: Categories.View,
            f1: true,
            keybinding: {
                weight: 200,
                when: null,
                primary: 2048 | 21
            }
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        if (!layoutService.isVisible("workbench.parts.sidebar")) {
            layoutService.setPartHidden(false, "workbench.parts.sidebar");
        }
        const viewlet = paneCompositeService.getActivePaneComposite(0);
        viewlet?.focus();
    }
}
registerAction2(FocusSideBarAction);
