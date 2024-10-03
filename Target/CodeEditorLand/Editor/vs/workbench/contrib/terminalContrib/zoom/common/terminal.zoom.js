import { isMacintosh } from '../../../../../base/common/platform.js';
import { localize } from '../../../../../nls.js';
export const terminalZoomConfiguration = {
    ["terminal.integrated.mouseWheelZoom"]: {
        markdownDescription: isMacintosh
            ? localize('terminal.integrated.mouseWheelZoom.mac', "Zoom the font of the terminal when using mouse wheel and holding `Cmd`.")
            : localize('terminal.integrated.mouseWheelZoom', "Zoom the font of the terminal when using mouse wheel and holding `Ctrl`."),
        type: 'boolean',
        default: false
    },
};
