import * as strings from '../../../base/common/strings.js';
import { IndentAction } from './languageConfiguration.js';
import { IndentationContextProcessor, isLanguageDifferentFromLineStart, ProcessedIndentRulesSupport } from './supports/indentationLineProcessor.js';
function getPrecedingValidLine(model, lineNumber, processedIndentRulesSupport) {
    const languageId = model.tokenization.getLanguageIdAtPosition(lineNumber, 0);
    if (lineNumber > 1) {
        let lastLineNumber;
        let resultLineNumber = -1;
        for (lastLineNumber = lineNumber - 1; lastLineNumber >= 1; lastLineNumber--) {
            if (model.tokenization.getLanguageIdAtPosition(lastLineNumber, 0) !== languageId) {
                return resultLineNumber;
            }
            const text = model.getLineContent(lastLineNumber);
            if (processedIndentRulesSupport.shouldIgnore(lastLineNumber) || /^\s+$/.test(text) || text === '') {
                resultLineNumber = lastLineNumber;
                continue;
            }
            return lastLineNumber;
        }
    }
    return -1;
}
export function getInheritIndentForLine(autoIndent, model, lineNumber, honorIntentialIndent = true, languageConfigurationService) {
    if (autoIndent < 4) {
        return null;
    }
    const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(model.tokenization.getLanguageId()).indentRulesSupport;
    if (!indentRulesSupport) {
        return null;
    }
    const processedIndentRulesSupport = new ProcessedIndentRulesSupport(model, indentRulesSupport, languageConfigurationService);
    if (lineNumber <= 1) {
        return {
            indentation: '',
            action: null
        };
    }
    for (let priorLineNumber = lineNumber - 1; priorLineNumber > 0; priorLineNumber--) {
        if (model.getLineContent(priorLineNumber) !== '') {
            break;
        }
        if (priorLineNumber === 1) {
            return {
                indentation: '',
                action: null
            };
        }
    }
    const precedingUnIgnoredLine = getPrecedingValidLine(model, lineNumber, processedIndentRulesSupport);
    if (precedingUnIgnoredLine < 0) {
        return null;
    }
    else if (precedingUnIgnoredLine < 1) {
        return {
            indentation: '',
            action: null
        };
    }
    if (processedIndentRulesSupport.shouldIncrease(precedingUnIgnoredLine) || processedIndentRulesSupport.shouldIndentNextLine(precedingUnIgnoredLine)) {
        const precedingUnIgnoredLineContent = model.getLineContent(precedingUnIgnoredLine);
        return {
            indentation: strings.getLeadingWhitespace(precedingUnIgnoredLineContent),
            action: IndentAction.Indent,
            line: precedingUnIgnoredLine
        };
    }
    else if (processedIndentRulesSupport.shouldDecrease(precedingUnIgnoredLine)) {
        const precedingUnIgnoredLineContent = model.getLineContent(precedingUnIgnoredLine);
        return {
            indentation: strings.getLeadingWhitespace(precedingUnIgnoredLineContent),
            action: null,
            line: precedingUnIgnoredLine
        };
    }
    else {
        if (precedingUnIgnoredLine === 1) {
            return {
                indentation: strings.getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
                action: null,
                line: precedingUnIgnoredLine
            };
        }
        const previousLine = precedingUnIgnoredLine - 1;
        const previousLineIndentMetadata = indentRulesSupport.getIndentMetadata(model.getLineContent(previousLine));
        if (!(previousLineIndentMetadata & (1 | 2)) &&
            (previousLineIndentMetadata & 4)) {
            let stopLine = 0;
            for (let i = previousLine - 1; i > 0; i--) {
                if (processedIndentRulesSupport.shouldIndentNextLine(i)) {
                    continue;
                }
                stopLine = i;
                break;
            }
            return {
                indentation: strings.getLeadingWhitespace(model.getLineContent(stopLine + 1)),
                action: null,
                line: stopLine + 1
            };
        }
        if (honorIntentialIndent) {
            return {
                indentation: strings.getLeadingWhitespace(model.getLineContent(precedingUnIgnoredLine)),
                action: null,
                line: precedingUnIgnoredLine
            };
        }
        else {
            for (let i = precedingUnIgnoredLine; i > 0; i--) {
                if (processedIndentRulesSupport.shouldIncrease(i)) {
                    return {
                        indentation: strings.getLeadingWhitespace(model.getLineContent(i)),
                        action: IndentAction.Indent,
                        line: i
                    };
                }
                else if (processedIndentRulesSupport.shouldIndentNextLine(i)) {
                    let stopLine = 0;
                    for (let j = i - 1; j > 0; j--) {
                        if (processedIndentRulesSupport.shouldIndentNextLine(i)) {
                            continue;
                        }
                        stopLine = j;
                        break;
                    }
                    return {
                        indentation: strings.getLeadingWhitespace(model.getLineContent(stopLine + 1)),
                        action: null,
                        line: stopLine + 1
                    };
                }
                else if (processedIndentRulesSupport.shouldDecrease(i)) {
                    return {
                        indentation: strings.getLeadingWhitespace(model.getLineContent(i)),
                        action: null,
                        line: i
                    };
                }
            }
            return {
                indentation: strings.getLeadingWhitespace(model.getLineContent(1)),
                action: null,
                line: 1
            };
        }
    }
}
export function getGoodIndentForLine(autoIndent, virtualModel, languageId, lineNumber, indentConverter, languageConfigurationService) {
    if (autoIndent < 4) {
        return null;
    }
    const richEditSupport = languageConfigurationService.getLanguageConfiguration(languageId);
    if (!richEditSupport) {
        return null;
    }
    const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(languageId).indentRulesSupport;
    if (!indentRulesSupport) {
        return null;
    }
    const processedIndentRulesSupport = new ProcessedIndentRulesSupport(virtualModel, indentRulesSupport, languageConfigurationService);
    const indent = getInheritIndentForLine(autoIndent, virtualModel, lineNumber, undefined, languageConfigurationService);
    if (indent) {
        const inheritLine = indent.line;
        if (inheritLine !== undefined) {
            let shouldApplyEnterRules = true;
            for (let inBetweenLine = inheritLine; inBetweenLine < lineNumber - 1; inBetweenLine++) {
                if (!/^\s*$/.test(virtualModel.getLineContent(inBetweenLine))) {
                    shouldApplyEnterRules = false;
                    break;
                }
            }
            if (shouldApplyEnterRules) {
                const enterResult = richEditSupport.onEnter(autoIndent, '', virtualModel.getLineContent(inheritLine), '');
                if (enterResult) {
                    let indentation = strings.getLeadingWhitespace(virtualModel.getLineContent(inheritLine));
                    if (enterResult.removeText) {
                        indentation = indentation.substring(0, indentation.length - enterResult.removeText);
                    }
                    if ((enterResult.indentAction === IndentAction.Indent) ||
                        (enterResult.indentAction === IndentAction.IndentOutdent)) {
                        indentation = indentConverter.shiftIndent(indentation);
                    }
                    else if (enterResult.indentAction === IndentAction.Outdent) {
                        indentation = indentConverter.unshiftIndent(indentation);
                    }
                    if (processedIndentRulesSupport.shouldDecrease(lineNumber)) {
                        indentation = indentConverter.unshiftIndent(indentation);
                    }
                    if (enterResult.appendText) {
                        indentation += enterResult.appendText;
                    }
                    return strings.getLeadingWhitespace(indentation);
                }
            }
        }
        if (processedIndentRulesSupport.shouldDecrease(lineNumber)) {
            if (indent.action === IndentAction.Indent) {
                return indent.indentation;
            }
            else {
                return indentConverter.unshiftIndent(indent.indentation);
            }
        }
        else {
            if (indent.action === IndentAction.Indent) {
                return indentConverter.shiftIndent(indent.indentation);
            }
            else {
                return indent.indentation;
            }
        }
    }
    return null;
}
export function getIndentForEnter(autoIndent, model, range, indentConverter, languageConfigurationService) {
    if (autoIndent < 4) {
        return null;
    }
    const languageId = model.getLanguageIdAtPosition(range.startLineNumber, range.startColumn);
    const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(languageId).indentRulesSupport;
    if (!indentRulesSupport) {
        return null;
    }
    model.tokenization.forceTokenization(range.startLineNumber);
    const indentationContextProcessor = new IndentationContextProcessor(model, languageConfigurationService);
    const processedContextTokens = indentationContextProcessor.getProcessedTokenContextAroundRange(range);
    const afterEnterProcessedTokens = processedContextTokens.afterRangeProcessedTokens;
    const beforeEnterProcessedTokens = processedContextTokens.beforeRangeProcessedTokens;
    const beforeEnterIndent = strings.getLeadingWhitespace(beforeEnterProcessedTokens.getLineContent());
    const virtualModel = createVirtualModelWithModifiedTokensAtLine(model, range.startLineNumber, beforeEnterProcessedTokens);
    const languageIsDifferentFromLineStart = isLanguageDifferentFromLineStart(model, range.getStartPosition());
    const currentLine = model.getLineContent(range.startLineNumber);
    const currentLineIndent = strings.getLeadingWhitespace(currentLine);
    const afterEnterAction = getInheritIndentForLine(autoIndent, virtualModel, range.startLineNumber + 1, undefined, languageConfigurationService);
    if (!afterEnterAction) {
        const beforeEnter = languageIsDifferentFromLineStart ? currentLineIndent : beforeEnterIndent;
        return {
            beforeEnter: beforeEnter,
            afterEnter: beforeEnter
        };
    }
    let afterEnterIndent = languageIsDifferentFromLineStart ? currentLineIndent : afterEnterAction.indentation;
    if (afterEnterAction.action === IndentAction.Indent) {
        afterEnterIndent = indentConverter.shiftIndent(afterEnterIndent);
    }
    if (indentRulesSupport.shouldDecrease(afterEnterProcessedTokens.getLineContent())) {
        afterEnterIndent = indentConverter.unshiftIndent(afterEnterIndent);
    }
    return {
        beforeEnter: languageIsDifferentFromLineStart ? currentLineIndent : beforeEnterIndent,
        afterEnter: afterEnterIndent
    };
}
export function getIndentActionForType(cursorConfig, model, range, ch, indentConverter, languageConfigurationService) {
    const autoIndent = cursorConfig.autoIndent;
    if (autoIndent < 4) {
        return null;
    }
    const languageIsDifferentFromLineStart = isLanguageDifferentFromLineStart(model, range.getStartPosition());
    if (languageIsDifferentFromLineStart) {
        return null;
    }
    const languageId = model.getLanguageIdAtPosition(range.startLineNumber, range.startColumn);
    const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(languageId).indentRulesSupport;
    if (!indentRulesSupport) {
        return null;
    }
    const indentationContextProcessor = new IndentationContextProcessor(model, languageConfigurationService);
    const processedContextTokens = indentationContextProcessor.getProcessedTokenContextAroundRange(range);
    const beforeRangeText = processedContextTokens.beforeRangeProcessedTokens.getLineContent();
    const afterRangeText = processedContextTokens.afterRangeProcessedTokens.getLineContent();
    const textAroundRange = beforeRangeText + afterRangeText;
    const textAroundRangeWithCharacter = beforeRangeText + ch + afterRangeText;
    if (!indentRulesSupport.shouldDecrease(textAroundRange) && indentRulesSupport.shouldDecrease(textAroundRangeWithCharacter)) {
        const r = getInheritIndentForLine(autoIndent, model, range.startLineNumber, false, languageConfigurationService);
        if (!r) {
            return null;
        }
        let indentation = r.indentation;
        if (r.action !== IndentAction.Indent) {
            indentation = indentConverter.unshiftIndent(indentation);
        }
        return indentation;
    }
    const previousLineNumber = range.startLineNumber - 1;
    if (previousLineNumber > 0) {
        const previousLine = model.getLineContent(previousLineNumber);
        if (indentRulesSupport.shouldIndentNextLine(previousLine) && indentRulesSupport.shouldIncrease(textAroundRangeWithCharacter)) {
            const inheritedIndentationData = getInheritIndentForLine(autoIndent, model, range.startLineNumber, false, languageConfigurationService);
            const inheritedIndentation = inheritedIndentationData?.indentation;
            if (inheritedIndentation !== undefined) {
                const currentLine = model.getLineContent(range.startLineNumber);
                const actualCurrentIndentation = strings.getLeadingWhitespace(currentLine);
                const inferredCurrentIndentation = indentConverter.shiftIndent(inheritedIndentation);
                const inferredIndentationEqualsActual = inferredCurrentIndentation === actualCurrentIndentation;
                const textAroundRangeContainsOnlyWhitespace = /^\s*$/.test(textAroundRange);
                const autoClosingPairs = cursorConfig.autoClosingPairs.autoClosingPairsOpenByEnd.get(ch);
                const autoClosingPairExists = autoClosingPairs && autoClosingPairs.length > 0;
                const isChFirstNonWhitespaceCharacterAndInAutoClosingPair = autoClosingPairExists && textAroundRangeContainsOnlyWhitespace;
                if (inferredIndentationEqualsActual && isChFirstNonWhitespaceCharacterAndInAutoClosingPair) {
                    return inheritedIndentation;
                }
            }
        }
    }
    return null;
}
export function getIndentMetadata(model, lineNumber, languageConfigurationService) {
    const indentRulesSupport = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).indentRulesSupport;
    if (!indentRulesSupport) {
        return null;
    }
    if (lineNumber < 1 || lineNumber > model.getLineCount()) {
        return null;
    }
    return indentRulesSupport.getIndentMetadata(model.getLineContent(lineNumber));
}
function createVirtualModelWithModifiedTokensAtLine(model, modifiedLineNumber, modifiedTokens) {
    const virtualModel = {
        tokenization: {
            getLineTokens: (lineNumber) => {
                if (lineNumber === modifiedLineNumber) {
                    return modifiedTokens;
                }
                else {
                    return model.tokenization.getLineTokens(lineNumber);
                }
            },
            getLanguageId: () => {
                return model.getLanguageId();
            },
            getLanguageIdAtPosition: (lineNumber, column) => {
                return model.getLanguageIdAtPosition(lineNumber, column);
            },
        },
        getLineContent: (lineNumber) => {
            if (lineNumber === modifiedLineNumber) {
                return modifiedTokens.getLineContent();
            }
            else {
                return model.getLineContent(lineNumber);
            }
        }
    };
    return virtualModel;
}
