import * as strings from '../../../base/common/strings.js';
import { LineTokens } from '../tokens/lineTokens.js';
import { TokenizationRegistry } from '../languages.js';
import { NullState, nullTokenizeEncoded } from './nullTokenize.js';
const fallback = {
    getInitialState: () => NullState,
    tokenizeEncoded: (buffer, hasEOL, state) => nullTokenizeEncoded(0, state)
};
export function tokenizeToStringSync(languageService, text, languageId) {
    return _tokenizeToString(text, languageService.languageIdCodec, TokenizationRegistry.get(languageId) || fallback);
}
export async function tokenizeToString(languageService, text, languageId) {
    if (!languageId) {
        return _tokenizeToString(text, languageService.languageIdCodec, fallback);
    }
    const tokenizationSupport = await TokenizationRegistry.getOrCreate(languageId);
    return _tokenizeToString(text, languageService.languageIdCodec, tokenizationSupport || fallback);
}
export function tokenizeLineToHTML(text, viewLineTokens, colorMap, startOffset, endOffset, tabSize, useNbsp) {
    let result = `<div>`;
    let charIndex = startOffset;
    let tabsCharDelta = 0;
    let prevIsSpace = true;
    for (let tokenIndex = 0, tokenCount = viewLineTokens.getCount(); tokenIndex < tokenCount; tokenIndex++) {
        const tokenEndIndex = viewLineTokens.getEndOffset(tokenIndex);
        if (tokenEndIndex <= startOffset) {
            continue;
        }
        let partContent = '';
        for (; charIndex < tokenEndIndex && charIndex < endOffset; charIndex++) {
            const charCode = text.charCodeAt(charIndex);
            switch (charCode) {
                case 9: {
                    let insertSpacesCount = tabSize - (charIndex + tabsCharDelta) % tabSize;
                    tabsCharDelta += insertSpacesCount - 1;
                    while (insertSpacesCount > 0) {
                        if (useNbsp && prevIsSpace) {
                            partContent += '&#160;';
                            prevIsSpace = false;
                        }
                        else {
                            partContent += ' ';
                            prevIsSpace = true;
                        }
                        insertSpacesCount--;
                    }
                    break;
                }
                case 60:
                    partContent += '&lt;';
                    prevIsSpace = false;
                    break;
                case 62:
                    partContent += '&gt;';
                    prevIsSpace = false;
                    break;
                case 38:
                    partContent += '&amp;';
                    prevIsSpace = false;
                    break;
                case 0:
                    partContent += '&#00;';
                    prevIsSpace = false;
                    break;
                case 65279:
                case 8232:
                case 8233:
                case 133:
                    partContent += '\ufffd';
                    prevIsSpace = false;
                    break;
                case 13:
                    partContent += '&#8203';
                    prevIsSpace = false;
                    break;
                case 32:
                    if (useNbsp && prevIsSpace) {
                        partContent += '&#160;';
                        prevIsSpace = false;
                    }
                    else {
                        partContent += ' ';
                        prevIsSpace = true;
                    }
                    break;
                default:
                    partContent += String.fromCharCode(charCode);
                    prevIsSpace = false;
            }
        }
        result += `<span style="${viewLineTokens.getInlineStyle(tokenIndex, colorMap)}">${partContent}</span>`;
        if (tokenEndIndex > endOffset || charIndex >= endOffset) {
            break;
        }
    }
    result += `</div>`;
    return result;
}
export function _tokenizeToString(text, languageIdCodec, tokenizationSupport) {
    let result = `<div class="monaco-tokenized-source">`;
    const lines = strings.splitLines(text);
    let currentState = tokenizationSupport.getInitialState();
    for (let i = 0, len = lines.length; i < len; i++) {
        const line = lines[i];
        if (i > 0) {
            result += `<br/>`;
        }
        const tokenizationResult = tokenizationSupport.tokenizeEncoded(line, true, currentState);
        LineTokens.convertToEndOffset(tokenizationResult.tokens, line.length);
        const lineTokens = new LineTokens(tokenizationResult.tokens, line, languageIdCodec);
        const viewLineTokens = lineTokens.inflate();
        let startOffset = 0;
        for (let j = 0, lenJ = viewLineTokens.getCount(); j < lenJ; j++) {
            const type = viewLineTokens.getClassName(j);
            const endIndex = viewLineTokens.getEndOffset(j);
            result += `<span class="${type}">${strings.escape(line.substring(startOffset, endIndex))}</span>`;
            startOffset = endIndex;
        }
        currentState = tokenizationResult.endState;
    }
    result += `</div>`;
    return result;
}
