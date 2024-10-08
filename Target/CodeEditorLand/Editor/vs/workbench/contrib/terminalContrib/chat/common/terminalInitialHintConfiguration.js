/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../../nls.js';
export const terminalInitialHintConfiguration = {
    ["terminal.integrated.initialHint" /* TerminalInitialHintSettingId.Enabled */]: {
        restricted: true,
        markdownDescription: localize('terminal.integrated.initialHint', "Controls if the first terminal without input will show a hint about available actions when it is focused."),
        type: 'boolean',
        default: true
    }
};
