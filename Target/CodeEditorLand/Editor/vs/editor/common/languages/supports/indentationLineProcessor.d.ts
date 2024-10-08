import { Range } from '../../core/range.js';
import { ITextModel } from '../../model.js';
import { ILanguageConfigurationService } from '../languageConfigurationRegistry.js';
import { IVirtualModel } from '../autoIndent.js';
import { IViewLineTokens } from '../../tokens/lineTokens.js';
import { IndentRulesSupport } from './indentRules.js';
import { Position } from '../../core/position.js';
/**
 * This class is a wrapper class around {@link IndentRulesSupport}.
 * It processes the lines by removing the language configuration brackets from the regex, string and comment tokens.
 * It then calls into the {@link IndentRulesSupport} to validate the indentation conditions.
 */
export declare class ProcessedIndentRulesSupport {
    private readonly _indentRulesSupport;
    private readonly _indentationLineProcessor;
    constructor(model: IVirtualModel, indentRulesSupport: IndentRulesSupport, languageConfigurationService: ILanguageConfigurationService);
    /**
     * Apply the new indentation and return whether the indentation level should be increased after the given line number
     */
    shouldIncrease(lineNumber: number, newIndentation?: string): boolean;
    /**
     * Apply the new indentation and return whether the indentation level should be decreased after the given line number
     */
    shouldDecrease(lineNumber: number, newIndentation?: string): boolean;
    /**
     * Apply the new indentation and return whether the indentation level should remain unchanged at the given line number
     */
    shouldIgnore(lineNumber: number, newIndentation?: string): boolean;
    /**
     * Apply the new indentation and return whether the indentation level should increase on the line after the given line number
     */
    shouldIndentNextLine(lineNumber: number, newIndentation?: string): boolean;
}
/**
 * This class fetches the processed text around a range which can be used for indentation evaluation.
 * It returns:
 * - The processed text before the given range and on the same start line
 * - The processed text after the given range and on the same end line
 * - The processed text on the previous line
 */
export declare class IndentationContextProcessor {
    private readonly model;
    private readonly indentationLineProcessor;
    constructor(model: ITextModel, languageConfigurationService: ILanguageConfigurationService);
    /**
     * Returns the processed text, stripped from the language configuration brackets within the string, comment and regex tokens, around the given range
     */
    getProcessedTokenContextAroundRange(range: Range): {
        beforeRangeProcessedTokens: IViewLineTokens;
        afterRangeProcessedTokens: IViewLineTokens;
        previousLineProcessedTokens: IViewLineTokens;
    };
    private _getProcessedTokensBeforeRange;
    private _getProcessedTokensAfterRange;
    private _getProcessedPreviousLineTokens;
}
export declare function isLanguageDifferentFromLineStart(model: ITextModel, position: Position): boolean;
