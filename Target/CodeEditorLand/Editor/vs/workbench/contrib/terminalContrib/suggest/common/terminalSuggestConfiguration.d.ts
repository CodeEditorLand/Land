import type { IStringDictionary } from '../../../../../base/common/collections.js';
import type { IConfigurationPropertySchema } from '../../../../../platform/configuration/common/configurationRegistry.js';
export declare const enum TerminalSuggestSettingId {
    Enabled = "terminal.integrated.suggest.enabled",
    QuickSuggestions = "terminal.integrated.suggest.quickSuggestions",
    SuggestOnTriggerCharacters = "terminal.integrated.suggest.suggestOnTriggerCharacters",
    RunOnEnter = "terminal.integrated.suggest.runOnEnter",
    BuiltinCompletions = "terminal.integrated.suggest.builtinCompletions"
}
export declare const terminalSuggestConfigSection = "terminal.integrated.suggest";
export interface ITerminalSuggestConfiguration {
    enabled: boolean;
    quickSuggestions: boolean;
    suggestOnTriggerCharacters: boolean;
    runOnEnter: 'never' | 'exactMatch' | 'exactMatchIgnoreExtension' | 'always';
    builtinCompletions: {
        'pwshCode': boolean;
        'pwshGit': boolean;
    };
}
export declare const terminalSuggestConfiguration: IStringDictionary<IConfigurationPropertySchema>;
