/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                when: null,
                primary: 2048 /* KeyMod.CtrlCmd */ | 21 /* KeyCode.Digit0 */
            }
        });
    }
    async run(accessor) {
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const paneCompositeService = accessor.get(IPaneCompositePartService);
        // Show side bar
        if (!layoutService.isVisible("workbench.parts.sidebar" /* Parts.SIDEBAR_PART */)) {
            layoutService.setPartHidden(false, "workbench.parts.sidebar" /* Parts.SIDEBAR_PART */);
        }
        // Focus into active viewlet
        const viewlet = paneCompositeService.getActivePaneComposite(0 /* ViewContainerLocation.Sidebar */);
        viewlet?.focus();
    }
}
registerAction2(FocusSideBarAction);
