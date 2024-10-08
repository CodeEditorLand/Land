import type { IStringDictionary } from '../../../../../base/common/collections.js';
import type { IConfigurationPropertySchema } from '../../../../../platform/configuration/common/configurationRegistry.js';
export declare const enum TerminalStickyScrollSettingId {
    Enabled = "terminal.integrated.stickyScroll.enabled",
    MaxLineCount = "terminal.integrated.stickyScroll.maxLineCount"
}
export interface ITerminalStickyScrollConfiguration {
    enabled: boolean;
    maxLineCount: number;
}
export declare const terminalStickyScrollConfiguration: IStringDictionary<IConfigurationPropertySchema>;
