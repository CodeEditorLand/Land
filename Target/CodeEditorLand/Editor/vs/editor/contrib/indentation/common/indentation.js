import * as strings from '../../../../base/common/strings.js';
import { ShiftCommand } from '../../../common/commands/shiftCommand.js';
import { EditOperation } from '../../../common/core/editOperation.js';
import { normalizeIndentation } from '../../../common/core/indentation.js';
import { Selection } from '../../../common/core/selection.js';
import { ProcessedIndentRulesSupport } from '../../../common/languages/supports/indentationLineProcessor.js';
export function getReindentEditOperations(model, languageConfigurationService, startLineNumber, endLineNumber) {
    if (model.getLineCount() === 1 && model.getLineMaxColumn(1) === 1) {
        return [];
    }
    const indentationRulesSupport = languageConfigurationService.getLanguageConfiguration(model.getLanguageId()).indentRulesSupport;
    if (!indentationRulesSupport) {
        return [];
    }
    const processedIndentRulesSupport = new ProcessedIndentRulesSupport(model, indentationRulesSupport, languageConfigurationService);
    endLineNumber = Math.min(endLineNumber, model.getLineCount());
    while (startLineNumber <= endLineNumber) {
        if (!processedIndentRulesSupport.shouldIgnore(startLineNumber)) {
            break;
        }
        startLineNumber++;
    }
    if (startLineNumber > endLineNumber - 1) {
        return [];
    }
    const { tabSize, indentSize, insertSpaces } = model.getOptions();
    const shiftIndent = (indentation, count) => {
        count = count || 1;
        return ShiftCommand.shiftIndent(indentation, indentation.length + count, tabSize, indentSize, insertSpaces);
    };
    const unshiftIndent = (indentation, count) => {
        count = count || 1;
        return ShiftCommand.unshiftIndent(indentation, indentation.length + count, tabSize, indentSize, insertSpaces);
    };
    const indentEdits = [];
    const currentLineText = model.getLineContent(startLineNumber);
    let globalIndent = strings.getLeadingWhitespace(currentLineText);
    let idealIndentForNextLine = globalIndent;
    if (processedIndentRulesSupport.shouldIncrease(startLineNumber)) {
        idealIndentForNextLine = shiftIndent(idealIndentForNextLine);
        globalIndent = shiftIndent(globalIndent);
    }
    else if (processedIndentRulesSupport.shouldIndentNextLine(startLineNumber)) {
        idealIndentForNextLine = shiftIndent(idealIndentForNextLine);
    }
    startLineNumber++;
    for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
        if (doesLineStartWithString(model, lineNumber)) {
            continue;
        }
        const text = model.getLineContent(lineNumber);
        const oldIndentation = strings.getLeadingWhitespace(text);
        const currentIdealIndent = idealIndentForNextLine;
        if (processedIndentRulesSupport.shouldDecrease(lineNumber, currentIdealIndent)) {
            idealIndentForNextLine = unshiftIndent(idealIndentForNextLine);
            globalIndent = unshiftIndent(globalIndent);
        }
        if (oldIndentation !== idealIndentForNextLine) {
            indentEdits.push(EditOperation.replaceMove(new Selection(lineNumber, 1, lineNumber, oldIndentation.length + 1), normalizeIndentation(idealIndentForNextLine, indentSize, insertSpaces)));
        }
        if (processedIndentRulesSupport.shouldIgnore(lineNumber)) {
            continue;
        }
        else if (processedIndentRulesSupport.shouldIncrease(lineNumber, currentIdealIndent)) {
            globalIndent = shiftIndent(globalIndent);
            idealIndentForNextLine = globalIndent;
        }
        else if (processedIndentRulesSupport.shouldIndentNextLine(lineNumber, currentIdealIndent)) {
            idealIndentForNextLine = shiftIndent(idealIndentForNextLine);
        }
        else {
            idealIndentForNextLine = globalIndent;
        }
    }
    return indentEdits;
}
function doesLineStartWithString(model, lineNumber) {
    if (!model.tokenization.isCheapToTokenize(lineNumber)) {
        return false;
    }
    const lineTokens = model.tokenization.getLineTokens(lineNumber);
    return lineTokens.getStandardTokenType(0) === 2;
}
