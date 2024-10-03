import { localize } from '../../../../../nls.js';
import product from '../../../../../platform/product/common/product.js';
export const terminalStickyScrollConfiguration = {
    ["terminal.integrated.stickyScroll.enabled"]: {
        markdownDescription: localize('stickyScroll.enabled', "Shows the current command at the top of the terminal."),
        type: 'boolean',
        default: product.quality !== 'stable'
    },
    ["terminal.integrated.stickyScroll.maxLineCount"]: {
        markdownDescription: localize('stickyScroll.maxLineCount', "Defines the maximum number of sticky lines to show. Sticky scroll lines will never exceed 40% of the viewport regardless of this setting."),
        type: 'number',
        default: 5,
        minimum: 1,
        maximum: 10
    },
};
