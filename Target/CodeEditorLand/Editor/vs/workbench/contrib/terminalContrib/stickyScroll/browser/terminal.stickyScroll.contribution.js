import './media/stickyScroll.css';
import { localize, localize2 } from '../../../../../nls.js';
import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { registerTerminalAction } from '../../../terminal/browser/terminalActions.js';
import { registerTerminalContribution } from '../../../terminal/browser/terminalExtensions.js';
import { TerminalStickyScrollContribution } from './terminalStickyScrollContribution.js';
registerTerminalContribution(TerminalStickyScrollContribution.ID, TerminalStickyScrollContribution, true);
registerTerminalAction({
    id: "workbench.action.terminal.toggleStickyScroll",
    title: localize2('workbench.action.terminal.toggleStickyScroll', 'Toggle Sticky Scroll'),
    toggled: {
        condition: ContextKeyExpr.equals(`config.${"terminal.integrated.stickyScroll.enabled"}`, true),
        title: localize('stickyScroll', "Sticky Scroll"),
        mnemonicTitle: localize({ key: 'miStickyScroll', comment: ['&& denotes a mnemonic'] }, "&&Sticky Scroll"),
    },
    run: (c, accessor) => {
        const configurationService = accessor.get(IConfigurationService);
        const newValue = !configurationService.getValue("terminal.integrated.stickyScroll.enabled");
        return configurationService.updateValue("terminal.integrated.stickyScroll.enabled", newValue);
    },
    menu: [
        { id: MenuId.TerminalStickyScrollContext }
    ]
});
import './terminalStickyScrollColorRegistry.js';
