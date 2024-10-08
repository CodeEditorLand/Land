import { CharacterPair, CommentRule, ExplicitLanguageConfiguration, IAutoClosingPair, IAutoClosingPairConditional } from '../../../../editor/common/languages/languageConfiguration.js';
import { ILanguageConfigurationService } from '../../../../editor/common/languages/languageConfigurationRegistry.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IExtensionResourceLoaderService } from '../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
interface IRegExp {
    pattern: string;
    flags?: string;
}
interface IIndentationRules {
    decreaseIndentPattern: string | IRegExp;
    increaseIndentPattern: string | IRegExp;
    indentNextLinePattern?: string | IRegExp;
    unIndentedLinePattern?: string | IRegExp;
}
interface IEnterAction {
    indent: 'none' | 'indent' | 'indentOutdent' | 'outdent';
    appendText?: string;
    removeText?: number;
}
interface IOnEnterRule {
    beforeText: string | IRegExp;
    afterText?: string | IRegExp;
    previousLineText?: string | IRegExp;
    action: IEnterAction;
}
/**
 * Serialized form of a language configuration
 */
export interface ILanguageConfiguration {
    comments?: CommentRule;
    brackets?: CharacterPair[];
    autoClosingPairs?: Array<CharacterPair | IAutoClosingPairConditional>;
    surroundingPairs?: Array<CharacterPair | IAutoClosingPair>;
    colorizedBracketPairs?: Array<CharacterPair>;
    wordPattern?: string | IRegExp;
    indentationRules?: IIndentationRules;
    folding?: {
        offSide?: boolean;
        markers?: {
            start?: string | IRegExp;
            end?: string | IRegExp;
        };
    };
    autoCloseBefore?: string;
    onEnterRules?: IOnEnterRule[];
}
export declare class LanguageConfigurationFileHandler extends Disposable {
    private readonly _languageService;
    private readonly _extensionResourceLoaderService;
    private readonly _extensionService;
    private readonly _languageConfigurationService;
    /**
     * A map from language id to a hash computed from the config files locations.
     */
    private readonly _done;
    constructor(_languageService: ILanguageService, _extensionResourceLoaderService: IExtensionResourceLoaderService, _extensionService: IExtensionService, _languageConfigurationService: ILanguageConfigurationService);
    private _loadConfigurationsForMode;
    private _readConfigFile;
    private static _extractValidCommentRule;
    private static _extractValidBrackets;
    private static _extractValidAutoClosingPairs;
    private static _extractValidSurroundingPairs;
    private static _extractValidColorizedBracketPairs;
    private static _extractValidOnEnterRules;
    static extractValidConfig(languageId: string, configuration: ILanguageConfiguration): ExplicitLanguageConfiguration;
    private _handleConfig;
    private static _parseRegex;
    private static _mapIndentationRules;
}
export {};
