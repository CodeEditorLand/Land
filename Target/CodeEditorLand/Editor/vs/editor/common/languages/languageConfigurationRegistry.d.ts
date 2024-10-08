import { Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { ITextModel } from '../model.js';
import { EnterAction, FoldingRules, IAutoClosingPair, IndentationRule, LanguageConfiguration, AutoClosingPairs } from './languageConfiguration.js';
import { CharacterPairSupport } from './supports/characterPair.js';
import { BracketElectricCharacterSupport } from './supports/electricCharacter.js';
import { IndentRulesSupport } from './supports/indentRules.js';
import { RichEditBrackets } from './supports/richEditBrackets.js';
import { EditorAutoIndentStrategy } from '../config/editorOptions.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { ILanguageService } from './language.js';
import { LanguageBracketsConfiguration } from './supports/languageBracketsConfiguration.js';
/**
 * Interface used to support insertion of mode specific comments.
 */
export interface ICommentsConfiguration {
    lineCommentToken?: string;
    blockCommentStartToken?: string;
    blockCommentEndToken?: string;
}
export interface ILanguageConfigurationService {
    readonly _serviceBrand: undefined;
    onDidChange: Event<LanguageConfigurationServiceChangeEvent>;
    /**
     * @param priority Use a higher number for higher priority
     */
    register(languageId: string, configuration: LanguageConfiguration, priority?: number): IDisposable;
    getLanguageConfiguration(languageId: string): ResolvedLanguageConfiguration;
}
export declare class LanguageConfigurationServiceChangeEvent {
    readonly languageId: string | undefined;
    constructor(languageId: string | undefined);
    affects(languageId: string): boolean;
}
export declare const ILanguageConfigurationService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageConfigurationService>;
export declare class LanguageConfigurationService extends Disposable implements ILanguageConfigurationService {
    private readonly configurationService;
    private readonly languageService;
    _serviceBrand: undefined;
    private readonly _registry;
    private readonly onDidChangeEmitter;
    readonly onDidChange: Event<LanguageConfigurationServiceChangeEvent>;
    private readonly configurations;
    constructor(configurationService: IConfigurationService, languageService: ILanguageService);
    register(languageId: string, configuration: LanguageConfiguration, priority?: number): IDisposable;
    getLanguageConfiguration(languageId: string): ResolvedLanguageConfiguration;
}
export declare function getIndentationAtPosition(model: ITextModel, lineNumber: number, column: number): string;
export declare class LanguageConfigurationChangeEvent {
    readonly languageId: string;
    constructor(languageId: string);
}
export declare class LanguageConfigurationRegistry extends Disposable {
    private readonly _entries;
    private readonly _onDidChange;
    readonly onDidChange: Event<LanguageConfigurationChangeEvent>;
    constructor();
    /**
     * @param priority Use a higher number for higher priority
     */
    register(languageId: string, configuration: LanguageConfiguration, priority?: number): IDisposable;
    getLanguageConfiguration(languageId: string): ResolvedLanguageConfiguration | null;
}
/**
 * Immutable.
*/
export declare class ResolvedLanguageConfiguration {
    readonly languageId: string;
    readonly underlyingConfig: LanguageConfiguration;
    private _brackets;
    private _electricCharacter;
    private readonly _onEnterSupport;
    readonly comments: ICommentsConfiguration | null;
    readonly characterPair: CharacterPairSupport;
    readonly wordDefinition: RegExp;
    readonly indentRulesSupport: IndentRulesSupport | null;
    readonly indentationRules: IndentationRule | undefined;
    readonly foldingRules: FoldingRules;
    readonly bracketsNew: LanguageBracketsConfiguration;
    constructor(languageId: string, underlyingConfig: LanguageConfiguration);
    getWordDefinition(): RegExp;
    get brackets(): RichEditBrackets | null;
    get electricCharacter(): BracketElectricCharacterSupport | null;
    onEnter(autoIndent: EditorAutoIndentStrategy, previousLineText: string, beforeEnterText: string, afterEnterText: string): EnterAction | null;
    getAutoClosingPairs(): AutoClosingPairs;
    getAutoCloseBeforeSet(forQuotes: boolean): string;
    getSurroundingPairs(): IAutoClosingPair[];
    private static _handleComments;
}
