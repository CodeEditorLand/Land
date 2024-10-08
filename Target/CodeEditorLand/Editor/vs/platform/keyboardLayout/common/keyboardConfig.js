/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from '../../../nls.js';
import { OS } from '../../../base/common/platform.js';
import { Extensions as ConfigExtensions } from '../../configuration/common/configurationRegistry.js';
import { Registry } from '../../registry/common/platform.js';
export function readKeyboardConfig(configurationService) {
    const keyboard = configurationService.getValue('keyboard');
    const dispatch = (keyboard?.dispatch === 'keyCode' ? 1 /* DispatchConfig.KeyCode */ : 0 /* DispatchConfig.Code */);
    const mapAltGrToCtrlAlt = Boolean(keyboard?.mapAltGrToCtrlAlt);
    return { dispatch, mapAltGrToCtrlAlt };
}
const configurationRegistry = Registry.as(ConfigExtensions.Configuration);
const keyboardConfiguration = {
    'id': 'keyboard',
    'order': 15,
    'type': 'object',
    'title': nls.localize('keyboardConfigurationTitle', "Keyboard"),
    'properties': {
        'keyboard.dispatch': {
            scope: 1 /* ConfigurationScope.APPLICATION */,
            type: 'string',
            enum: ['code', 'keyCode'],
            default: 'code',
            markdownDescription: nls.localize('dispatch', "Controls the dispatching logic for key presses to use either `code` (recommended) or `keyCode`."),
            included: OS === 2 /* OperatingSystem.Macintosh */ || OS === 3 /* OperatingSystem.Linux */
        },
        'keyboard.mapAltGrToCtrlAlt': {
            scope: 1 /* ConfigurationScope.APPLICATION */,
            type: 'boolean',
            default: false,
            markdownDescription: nls.localize('mapAltGrToCtrlAlt', "Controls if the AltGraph+ modifier should be treated as Ctrl+Alt+."),
            included: OS === 1 /* OperatingSystem.Windows */
        }
    }
};
configurationRegistry.registerConfiguration(keyboardConfiguration);
