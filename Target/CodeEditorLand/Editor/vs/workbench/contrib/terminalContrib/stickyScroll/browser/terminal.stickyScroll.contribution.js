/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './media/stickyScroll.css';
import { localize, localize2 } from '../../../../../nls.js';
import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { registerTerminalAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalStickyScrollContribution } from './terminalStickyScrollContribution.js';
// #region Terminal Contributions
registerTerminalContribution(TerminalStickyScrollContribution.ID, TerminalStickyScrollContribution);
registerTerminalAction({
    id: "workbench.action.terminal.toggleStickyScroll" /* TerminalStickyScrollCommandId.ToggleStickyScroll */,
    title: localize2('workbench.action.terminal.toggleStickyScroll', 'Toggle Sticky Scroll'),
    toggled: {
        condition: ContextKeyExpr.equals(`config.${"terminal.integrated.stickyScroll.enabled" /* TerminalStickyScrollSettingId.Enabled */}`, true),
        title: localize('stickyScroll', "Sticky Scroll"),
        mnemonicTitle: localize({ key: 'miStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Sticky Scroll"),
    },
    run: (c, accessor) => {
        const configurationService = accessor.get(IConfigurationService);
        const newValue = !configurationService.getValue("terminal.integrated.stickyScroll.enabled" /* TerminalStickyScrollSettingId.Enabled */);
        return configurationService.updateValue("terminal.integrated.stickyScroll.enabled" /* TerminalStickyScrollSettingId.Enabled */, newValue);
    },
    menu: [
        { id: MenuId.TerminalStickyScrollContext }
    ]
});
// #endregion
// #region Colors
import './terminalStickyScrollColorRegistry.js';
// #endregion
