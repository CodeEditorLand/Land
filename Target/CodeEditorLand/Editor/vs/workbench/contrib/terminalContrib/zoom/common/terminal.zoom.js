/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { isMacintosh } from '../../../../../base/common/platform.js';
import { localize } from '../../../../../nls.js';
export const terminalZoomConfiguration = {
    ["terminal.integrated.mouseWheelZoom" /* TerminalZoomSettingId.MouseWheelZoom */]: {
        markdownDescription: isMacintosh
            ? localize('terminal.integrated.mouseWheelZoom.mac', "Zoom the font of the terminal when using mouse wheel and holding `Cmd`.")
            : localize('terminal.integrated.mouseWheelZoom', "Zoom the font of the terminal when using mouse wheel and holding `Ctrl`."),
        type: 'boolean',
        default: false
    },
};
