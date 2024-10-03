import { Range } from '../../core/range.js';
import { ITextModel } from '../../model.js';
import { ILanguageConfigurationService } from '../languageConfigurationRegistry.js';
import { IVirtualModel } from '../autoIndent.js';
import { IViewLineTokens } from '../../tokens/lineTokens.js';
import { IndentRulesSupport } from './indentRules.js';
import { Position } from '../../core/position.js';
export declare class ProcessedIndentRulesSupport {
    private readonly _indentRulesSupport;
    private readonly _indentationLineProcessor;
    constructor(model: IVirtualModel, indentRulesSupport: IndentRulesSupport, languageConfigurationService: ILanguageConfigurationService);
    shouldIncrease(lineNumber: number, newIndentation?: string): boolean;
    shouldDecrease(lineNumber: number, newIndentation?: string): boolean;
    shouldIgnore(lineNumber: number, newIndentation?: string): boolean;
    shouldIndentNextLine(lineNumber: number, newIndentation?: string): boolean;
}
export declare class IndentationContextProcessor {
    private readonly model;
    private readonly indentationLineProcessor;
    constructor(model: ITextModel, languageConfigurationService: ILanguageConfigurationService);
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
