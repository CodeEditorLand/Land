import type { IStringDictionary } from '../../../../../base/common/collections.js';
import type { IConfigurationPropertySchema } from '../../../../../platform/configuration/common/configurationRegistry.js';
export declare const DEFAULT_LOCAL_ECHO_EXCLUDE: ReadonlyArray<string>;
export declare const enum TerminalTypeAheadSettingId {
    LocalEchoLatencyThreshold = "terminal.integrated.localEchoLatencyThreshold",
    LocalEchoEnabled = "terminal.integrated.localEchoEnabled",
    LocalEchoExcludePrograms = "terminal.integrated.localEchoExcludePrograms",
    LocalEchoStyle = "terminal.integrated.localEchoStyle"
}
export interface ITerminalTypeAheadConfiguration {
    localEchoLatencyThreshold: number;
    localEchoExcludePrograms: ReadonlyArray<string>;
    localEchoEnabled: 'auto' | 'on' | 'off';
    localEchoStyle: 'bold' | 'dim' | 'italic' | 'underlined' | 'inverted' | string;
}
export declare const terminalTypeAheadConfiguration: IStringDictionary<IConfigurationPropertySchema>;
