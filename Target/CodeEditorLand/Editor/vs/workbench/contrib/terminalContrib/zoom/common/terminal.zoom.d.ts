import type { IStringDictionary } from '../../../../../base/common/collections.js';
import type { IConfigurationPropertySchema } from '../../../../../platform/configuration/common/configurationRegistry.js';
export declare const enum TerminalZoomCommandId {
    FontZoomIn = "workbench.action.terminal.fontZoomIn",
    FontZoomOut = "workbench.action.terminal.fontZoomOut",
    FontZoomReset = "workbench.action.terminal.fontZoomReset"
}
export declare const enum TerminalZoomSettingId {
    MouseWheelZoom = "terminal.integrated.mouseWheelZoom"
}
export declare const terminalZoomConfiguration: IStringDictionary<IConfigurationPropertySchema>;
