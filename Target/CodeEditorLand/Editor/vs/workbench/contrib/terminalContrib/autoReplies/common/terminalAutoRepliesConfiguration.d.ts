import type { IStringDictionary } from '../../../../../base/common/collections.js';
import type { IConfigurationPropertySchema } from '../../../../../platform/configuration/common/configurationRegistry.js';
export declare const enum TerminalAutoRepliesSettingId {
    AutoReplies = "terminal.integrated.autoReplies"
}
export interface ITerminalAutoRepliesConfiguration {
    autoReplies: {
        [key: string]: string;
    };
}
export declare const terminalAutoRepliesConfiguration: IStringDictionary<IConfigurationPropertySchema>;
