import './accessibility.css';
import * as nls from '../../../../../nls.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { accessibilityHelpIsShown } from '../../../accessibility/browser/accessibilityConfiguration.js';
import { alert } from '../../../../../base/browser/ui/aria/aria.js';
import { AccessibilityHelpNLS } from '../../../../../editor/common/standaloneStrings.js';
class ToggleScreenReaderMode extends Action2 {
    constructor() {
        super({
            id: 'editor.action.toggleScreenReaderAccessibilityMode',
            title: nls.localize2('toggleScreenReaderMode', "Toggle Screen Reader Accessibility Mode"),
            metadata: {
                description: nls.localize2('toggleScreenReaderModeDescription', "Toggles an optimized mode for usage with screen readers, braille devices, and other assistive technologies."),
            },
            f1: true,
            keybinding: [{
                    primary: 2048 | 35,
                    weight: 200 + 10,
                    when: accessibilityHelpIsShown
                },
                {
                    primary: 512 | 59 | 1024,
                    linux: { primary: 512 | 62 | 1024 },
                    weight: 200 + 10,
                }]
        });
    }
    async run(accessor) {
        const accessibiiltyService = accessor.get(IAccessibilityService);
        const configurationService = accessor.get(IConfigurationService);
        const isScreenReaderOptimized = accessibiiltyService.isScreenReaderOptimized();
        configurationService.updateValue('editor.accessibilitySupport', isScreenReaderOptimized ? 'off' : 'on', 2);
        alert(isScreenReaderOptimized ? AccessibilityHelpNLS.screenReaderModeDisabled : AccessibilityHelpNLS.screenReaderModeEnabled);
    }
}
registerAction2(ToggleScreenReaderMode);
