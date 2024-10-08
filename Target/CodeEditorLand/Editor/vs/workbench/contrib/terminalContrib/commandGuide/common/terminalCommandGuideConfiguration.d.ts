import type { IStringDictionary } from '../../../../../base/common/collections.js';
import type { IConfigurationPropertySchema } from '../../../../../platform/configuration/common/configurationRegistry.js';
export declare const enum TerminalCommandGuideSettingId {
    ShowCommandGuide = "terminal.integrated.shellIntegration.showCommandGuide"
}
export declare const terminalCommandGuideConfigSection = "terminal.integrated.shellIntegration";
export interface ITerminalCommandGuideConfiguration {
    showCommandGuide: boolean;
}
export declare const terminalCommandGuideConfiguration: IStringDictionary<IConfigurationPropertySchema>;
