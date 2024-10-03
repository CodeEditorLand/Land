import { defaultTerminalAccessibilityCommandsToSkipShell } from '../terminalContrib/accessibility/common/terminal.accessibility.js';
import { terminalAccessibilityConfiguration } from '../terminalContrib/accessibility/common/terminalAccessibilityConfiguration.js';
import { terminalAutoRepliesConfiguration } from '../terminalContrib/autoReplies/common/terminalAutoRepliesConfiguration.js';
import { terminalInitialHintConfiguration } from '../terminalContrib/chat/common/terminalInitialHintConfiguration.js';
import { terminalCommandGuideConfiguration } from '../terminalContrib/commandGuide/common/terminalCommandGuideConfiguration.js';
import { defaultTerminalFindCommandToSkipShell } from '../terminalContrib/find/common/terminal.find.js';
import { terminalStickyScrollConfiguration } from '../terminalContrib/stickyScroll/common/terminalStickyScrollConfiguration.js';
import { defaultTerminalSuggestCommandsToSkipShell } from '../terminalContrib/suggest/common/terminal.suggest.js';
import { terminalSuggestConfiguration } from '../terminalContrib/suggest/common/terminalSuggestConfiguration.js';
import { terminalTypeAheadConfiguration } from '../terminalContrib/typeAhead/common/terminalTypeAheadConfiguration.js';
import { terminalZoomConfiguration } from '../terminalContrib/zoom/common/terminal.zoom.js';
export const terminalContribConfiguration = {
    ...terminalAccessibilityConfiguration,
    ...terminalAutoRepliesConfiguration,
    ...terminalInitialHintConfiguration,
    ...terminalCommandGuideConfiguration,
    ...terminalStickyScrollConfiguration,
    ...terminalSuggestConfiguration,
    ...terminalTypeAheadConfiguration,
    ...terminalZoomConfiguration,
};
export const defaultTerminalContribCommandsToSkipShell = [
    ...defaultTerminalAccessibilityCommandsToSkipShell,
    ...defaultTerminalFindCommandToSkipShell,
    ...defaultTerminalSuggestCommandsToSkipShell,
];
