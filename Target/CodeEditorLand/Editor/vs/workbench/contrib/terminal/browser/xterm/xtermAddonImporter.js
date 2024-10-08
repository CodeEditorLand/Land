/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { importAMDNodeModule } from '../../../../../amdX.js';
const importedAddons = new Map();
/**
 * Exposes a simple interface to consumers, encapsulating the messy import xterm
 * addon import and caching logic.
 */
export class XtermAddonImporter {
    async importAddon(name) {
        let addon = importedAddons.get(name);
        if (!addon) {
            switch (name) {
                case 'clipboard':
                    addon = (await importAMDNodeModule('@xterm/addon-clipboard', 'lib/addon-clipboard.js')).ClipboardAddon;
                    break;
                case 'image':
                    addon = (await importAMDNodeModule('@xterm/addon-image', 'lib/addon-image.js')).ImageAddon;
                    break;
                case 'search':
                    addon = (await importAMDNodeModule('@xterm/addon-search', 'lib/addon-search.js')).SearchAddon;
                    break;
                case 'serialize':
                    addon = (await importAMDNodeModule('@xterm/addon-serialize', 'lib/addon-serialize.js')).SerializeAddon;
                    break;
                case 'unicode11':
                    addon = (await importAMDNodeModule('@xterm/addon-unicode11', 'lib/addon-unicode11.js')).Unicode11Addon;
                    break;
                case 'webgl':
                    addon = (await importAMDNodeModule('@xterm/addon-webgl', 'lib/addon-webgl.js')).WebglAddon;
                    break;
            }
            if (!addon) {
                throw new Error(`Could not load addon ${name}`);
            }
            importedAddons.set(name, addon);
        }
        return addon;
    }
}
