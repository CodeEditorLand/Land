import { createScanner } from './json.js';
export function format(documentText, range, options) {
    let initialIndentLevel;
    let formatText;
    let formatTextStart;
    let rangeStart;
    let rangeEnd;
    if (range) {
        rangeStart = range.offset;
        rangeEnd = rangeStart + range.length;
        formatTextStart = rangeStart;
        while (formatTextStart > 0 && !isEOL(documentText, formatTextStart - 1)) {
            formatTextStart--;
        }
        let endOffset = rangeEnd;
        while (endOffset < documentText.length && !isEOL(documentText, endOffset)) {
            endOffset++;
        }
        formatText = documentText.substring(formatTextStart, endOffset);
        initialIndentLevel = computeIndentLevel(formatText, options);
    }
    else {
        formatText = documentText;
        initialIndentLevel = 0;
        formatTextStart = 0;
        rangeStart = 0;
        rangeEnd = documentText.length;
    }
    const eol = getEOL(options, documentText);
    let lineBreak = false;
    let indentLevel = 0;
    let indentValue;
    if (options.insertSpaces) {
        indentValue = repeat(' ', options.tabSize || 4);
    }
    else {
        indentValue = '\t';
    }
    const scanner = createScanner(formatText, false);
    let hasError = false;
    function newLineAndIndent() {
        return eol + repeat(indentValue, initialIndentLevel + indentLevel);
    }
    function scanNext() {
        let token = scanner.scan();
        lineBreak = false;
        while (token === 15 || token === 14) {
            lineBreak = lineBreak || (token === 14);
            token = scanner.scan();
        }
        hasError = token === 16 || scanner.getTokenError() !== 0;
        return token;
    }
    const editOperations = [];
    function addEdit(text, startOffset, endOffset) {
        if (!hasError && startOffset < rangeEnd && endOffset > rangeStart && documentText.substring(startOffset, endOffset) !== text) {
            editOperations.push({ offset: startOffset, length: endOffset - startOffset, content: text });
        }
    }
    let firstToken = scanNext();
    if (firstToken !== 17) {
        const firstTokenStart = scanner.getTokenOffset() + formatTextStart;
        const initialIndent = repeat(indentValue, initialIndentLevel);
        addEdit(initialIndent, formatTextStart, firstTokenStart);
    }
    while (firstToken !== 17) {
        let firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
        let secondToken = scanNext();
        let replaceContent = '';
        while (!lineBreak && (secondToken === 12 || secondToken === 13)) {
            const commentTokenStart = scanner.getTokenOffset() + formatTextStart;
            addEdit(' ', firstTokenEnd, commentTokenStart);
            firstTokenEnd = scanner.getTokenOffset() + scanner.getTokenLength() + formatTextStart;
            replaceContent = secondToken === 12 ? newLineAndIndent() : '';
            secondToken = scanNext();
        }
        if (secondToken === 2) {
            if (firstToken !== 1) {
                indentLevel--;
                replaceContent = newLineAndIndent();
            }
        }
        else if (secondToken === 4) {
            if (firstToken !== 3) {
                indentLevel--;
                replaceContent = newLineAndIndent();
            }
        }
        else {
            switch (firstToken) {
                case 3:
                case 1:
                    indentLevel++;
                    replaceContent = newLineAndIndent();
                    break;
                case 5:
                case 12:
                    replaceContent = newLineAndIndent();
                    break;
                case 13:
                    if (lineBreak) {
                        replaceContent = newLineAndIndent();
                    }
                    else {
                        replaceContent = ' ';
                    }
                    break;
                case 6:
                    replaceContent = ' ';
                    break;
                case 10:
                    if (secondToken === 6) {
                        replaceContent = '';
                        break;
                    }
                case 7:
                case 8:
                case 9:
                case 11:
                case 2:
                case 4:
                    if (secondToken === 12 || secondToken === 13) {
                        replaceContent = ' ';
                    }
                    else if (secondToken !== 5 && secondToken !== 17) {
                        hasError = true;
                    }
                    break;
                case 16:
                    hasError = true;
                    break;
            }
            if (lineBreak && (secondToken === 12 || secondToken === 13)) {
                replaceContent = newLineAndIndent();
            }
        }
        const secondTokenStart = scanner.getTokenOffset() + formatTextStart;
        addEdit(replaceContent, firstTokenEnd, secondTokenStart);
        firstToken = secondToken;
    }
    return editOperations;
}
export function toFormattedString(obj, options) {
    const content = JSON.stringify(obj, undefined, options.insertSpaces ? options.tabSize || 4 : '\t');
    if (options.eol !== undefined) {
        return content.replace(/\r\n|\r|\n/g, options.eol);
    }
    return content;
}
function repeat(s, count) {
    let result = '';
    for (let i = 0; i < count; i++) {
        result += s;
    }
    return result;
}
function computeIndentLevel(content, options) {
    let i = 0;
    let nChars = 0;
    const tabSize = options.tabSize || 4;
    while (i < content.length) {
        const ch = content.charAt(i);
        if (ch === ' ') {
            nChars++;
        }
        else if (ch === '\t') {
            nChars += tabSize;
        }
        else {
            break;
        }
        i++;
    }
    return Math.floor(nChars / tabSize);
}
export function getEOL(options, text) {
    for (let i = 0; i < text.length; i++) {
        const ch = text.charAt(i);
        if (ch === '\r') {
            if (i + 1 < text.length && text.charAt(i + 1) === '\n') {
                return '\r\n';
            }
            return '\r';
        }
        else if (ch === '\n') {
            return '\n';
        }
    }
    return (options && options.eol) || '\n';
}
export function isEOL(text, offset) {
    return '\r\n'.indexOf(text.charAt(offset)) !== -1;
}
