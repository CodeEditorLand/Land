/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../../nls.js';
import product from '../../../../../platform/product/common/product.js';
export const terminalStickyScrollConfiguration = {
    ["terminal.integrated.stickyScroll.enabled" /* TerminalStickyScrollSettingId.Enabled */]: {
        markdownDescription: localize('stickyScroll.enabled', "Shows the current command at the top of the terminal."),
        type: 'boolean',
        default: product.quality !== 'stable'
    },
    ["terminal.integrated.stickyScroll.maxLineCount" /* TerminalStickyScrollSettingId.MaxLineCount */]: {
        markdownDescription: localize('stickyScroll.maxLineCount', "Defines the maximum number of sticky lines to show. Sticky scroll lines will never exceed 40% of the viewport regardless of this setting."),
        type: 'number',
        default: 5,
        minimum: 1,
        maximum: 10
    },
};
