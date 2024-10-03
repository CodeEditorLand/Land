import * as strings from '../../../../base/common/strings.js';
import { createScopedLineTokens } from '../supports.js';
import { LineTokens } from '../../tokens/lineTokens.js';
export class ProcessedIndentRulesSupport {
    constructor(model, indentRulesSupport, languageConfigurationService) {
        this._indentRulesSupport = indentRulesSupport;
        this._indentationLineProcessor = new IndentationLineProcessor(model, languageConfigurationService);
    }
    shouldIncrease(lineNumber, newIndentation) {
        const processedLine = this._indentationLineProcessor.getProcessedLine(lineNumber, newIndentation);
        return this._indentRulesSupport.shouldIncrease(processedLine);
    }
    shouldDecrease(lineNumber, newIndentation) {
        const processedLine = this._indentationLineProcessor.getProcessedLine(lineNumber, newIndentation);
        return this._indentRulesSupport.shouldDecrease(processedLine);
    }
    shouldIgnore(lineNumber, newIndentation) {
        const processedLine = this._indentationLineProcessor.getProcessedLine(lineNumber, newIndentation);
        return this._indentRulesSupport.shouldIgnore(processedLine);
    }
    shouldIndentNextLine(lineNumber, newIndentation) {
        const processedLine = this._indentationLineProcessor.getProcessedLine(lineNumber, newIndentation);
        return this._indentRulesSupport.shouldIndentNextLine(processedLine);
    }
}
export class IndentationContextProcessor {
    constructor(model, languageConfigurationService) {
        this.model = model;
        this.indentationLineProcessor = new IndentationLineProcessor(model, languageConfigurationService);
    }
    getProcessedTokenContextAroundRange(range) {
        const beforeRangeProcessedTokens = this._getProcessedTokensBeforeRange(range);
        const afterRangeProcessedTokens = this._getProcessedTokensAfterRange(range);
        const previousLineProcessedTokens = this._getProcessedPreviousLineTokens(range);
        return { beforeRangeProcessedTokens, afterRangeProcessedTokens, previousLineProcessedTokens };
    }
    _getProcessedTokensBeforeRange(range) {
        this.model.tokenization.forceTokenization(range.startLineNumber);
        const lineTokens = this.model.tokenization.getLineTokens(range.startLineNumber);
        const scopedLineTokens = createScopedLineTokens(lineTokens, range.startColumn - 1);
        let slicedTokens;
        if (isLanguageDifferentFromLineStart(this.model, range.getStartPosition())) {
            const columnIndexWithinScope = (range.startColumn - 1) - scopedLineTokens.firstCharOffset;
            const firstCharacterOffset = scopedLineTokens.firstCharOffset;
            const lastCharacterOffset = firstCharacterOffset + columnIndexWithinScope;
            slicedTokens = lineTokens.sliceAndInflate(firstCharacterOffset, lastCharacterOffset, 0);
        }
        else {
            const columnWithinLine = range.startColumn - 1;
            slicedTokens = lineTokens.sliceAndInflate(0, columnWithinLine, 0);
        }
        const processedTokens = this.indentationLineProcessor.getProcessedTokens(slicedTokens);
        return processedTokens;
    }
    _getProcessedTokensAfterRange(range) {
        const position = range.isEmpty() ? range.getStartPosition() : range.getEndPosition();
        this.model.tokenization.forceTokenization(position.lineNumber);
        const lineTokens = this.model.tokenization.getLineTokens(position.lineNumber);
        const scopedLineTokens = createScopedLineTokens(lineTokens, position.column - 1);
        const columnIndexWithinScope = position.column - 1 - scopedLineTokens.firstCharOffset;
        const firstCharacterOffset = scopedLineTokens.firstCharOffset + columnIndexWithinScope;
        const lastCharacterOffset = scopedLineTokens.firstCharOffset + scopedLineTokens.getLineLength();
        const slicedTokens = lineTokens.sliceAndInflate(firstCharacterOffset, lastCharacterOffset, 0);
        const processedTokens = this.indentationLineProcessor.getProcessedTokens(slicedTokens);
        return processedTokens;
    }
    _getProcessedPreviousLineTokens(range) {
        const getScopedLineTokensAtEndColumnOfLine = (lineNumber) => {
            this.model.tokenization.forceTokenization(lineNumber);
            const lineTokens = this.model.tokenization.getLineTokens(lineNumber);
            const endColumnOfLine = this.model.getLineMaxColumn(lineNumber) - 1;
            const scopedLineTokensAtEndColumn = createScopedLineTokens(lineTokens, endColumnOfLine);
            return scopedLineTokensAtEndColumn;
        };
        this.model.tokenization.forceTokenization(range.startLineNumber);
        const lineTokens = this.model.tokenization.getLineTokens(range.startLineNumber);
        const scopedLineTokens = createScopedLineTokens(lineTokens, range.startColumn - 1);
        const emptyTokens = LineTokens.createEmpty('', scopedLineTokens.languageIdCodec);
        const previousLineNumber = range.startLineNumber - 1;
        const isFirstLine = previousLineNumber === 0;
        if (isFirstLine) {
            return emptyTokens;
        }
        const canScopeExtendOnPreviousLine = scopedLineTokens.firstCharOffset === 0;
        if (!canScopeExtendOnPreviousLine) {
            return emptyTokens;
        }
        const scopedLineTokensAtEndColumnOfPreviousLine = getScopedLineTokensAtEndColumnOfLine(previousLineNumber);
        const doesLanguageContinueOnPreviousLine = scopedLineTokens.languageId === scopedLineTokensAtEndColumnOfPreviousLine.languageId;
        if (!doesLanguageContinueOnPreviousLine) {
            return emptyTokens;
        }
        const previousSlicedLineTokens = scopedLineTokensAtEndColumnOfPreviousLine.toIViewLineTokens();
        const processedTokens = this.indentationLineProcessor.getProcessedTokens(previousSlicedLineTokens);
        return processedTokens;
    }
}
class IndentationLineProcessor {
    constructor(model, languageConfigurationService) {
        this.model = model;
        this.languageConfigurationService = languageConfigurationService;
    }
    getProcessedLine(lineNumber, newIndentation) {
        const replaceIndentation = (line, newIndentation) => {
            const currentIndentation = strings.getLeadingWhitespace(line);
            const adjustedLine = newIndentation + line.substring(currentIndentation.length);
            return adjustedLine;
        };
        this.model.tokenization.forceTokenization?.(lineNumber);
        const tokens = this.model.tokenization.getLineTokens(lineNumber);
        let processedLine = this.getProcessedTokens(tokens).getLineContent();
        if (newIndentation !== undefined) {
            processedLine = replaceIndentation(processedLine, newIndentation);
        }
        return processedLine;
    }
    getProcessedTokens(tokens) {
        const shouldRemoveBracketsFromTokenType = (tokenType) => {
            return tokenType === 2
                || tokenType === 3
                || tokenType === 1;
        };
        const languageId = tokens.getLanguageId(0);
        const bracketsConfiguration = this.languageConfigurationService.getLanguageConfiguration(languageId).bracketsNew;
        const bracketsRegExp = bracketsConfiguration.getBracketRegExp({ global: true });
        const textAndMetadata = [];
        tokens.forEach((tokenIndex) => {
            const tokenType = tokens.getStandardTokenType(tokenIndex);
            let text = tokens.getTokenText(tokenIndex);
            if (shouldRemoveBracketsFromTokenType(tokenType)) {
                text = text.replace(bracketsRegExp, '');
            }
            const metadata = tokens.getMetadata(tokenIndex);
            textAndMetadata.push({ text, metadata });
        });
        const processedLineTokens = LineTokens.createFromTextAndMetadata(textAndMetadata, tokens.languageIdCodec);
        return processedLineTokens;
    }
}
export function isLanguageDifferentFromLineStart(model, position) {
    model.tokenization.forceTokenization(position.lineNumber);
    const lineTokens = model.tokenization.getLineTokens(position.lineNumber);
    const scopedLineTokens = createScopedLineTokens(lineTokens, position.column - 1);
    const doesScopeStartAtOffsetZero = scopedLineTokens.firstCharOffset === 0;
    const isScopedLanguageEqualToFirstLanguageOnLine = lineTokens.getLanguageId(0) === scopedLineTokens.languageId;
    const languageIsDifferentFromLineStart = !doesScopeStartAtOffsetZero && !isScopedLanguageEqualToFirstLanguageOnLine;
    return languageIsDifferentFromLineStart;
}
