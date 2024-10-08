/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from '../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
//#region Actions
registerAction2(class ShowAllSymbolsAction extends Action2 {
    static { this.ID = 'workbench.action.showAllSymbols'; }
    static { this.LABEL = nls.localize('showTriggerActions', "Go to Symbol in Workspace..."); }
    static { this.ALL_SYMBOLS_PREFIX = '#'; }
    constructor() {
        super({
            id: "workbench.action.showAllSymbols" /* Constants.SearchCommandIds.ShowAllSymbolsActionId */,
            title: {
                ...nls.localize2('showTriggerActions', "Go to Symbol in Workspace..."),
                mnemonicTitle: nls.localize({ key: 'miGotoSymbolInWorkspace', comment: ['&& denotes a mnemonic'] }, "Go to Symbol in &&Workspace..."),
            },
            f1: true,
            keybinding: {
                weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                primary: 2048 /* KeyMod.CtrlCmd */ | 50 /* KeyCode.KeyT */
            },
            menu: {
                id: MenuId.MenubarGoMenu,
                group: '3_global_nav',
                order: 2
            }
        });
    }
    async run(accessor) {
        accessor.get(IQuickInputService).quickAccess.show(ShowAllSymbolsAction.ALL_SYMBOLS_PREFIX);
    }
});
//#endregion
