import { createTrustedTypesPolicy } from '../../../base/browser/trustedTypes.js';
import * as strings from '../../../base/common/strings.js';
import { assertIsDefined } from '../../../base/common/types.js';
import { applyFontInfo } from '../config/domFontInfo.js';
import { StringBuilder } from '../../common/core/stringBuilder.js';
import { ModelLineProjectionData } from '../../common/modelLineProjectionData.js';
import { LineInjectedText } from '../../common/textModelEvents.js';
const ttPolicy = createTrustedTypesPolicy('domLineBreaksComputer', { createHTML: value => value });
export class DOMLineBreaksComputerFactory {
    static create(targetWindow) {
        return new DOMLineBreaksComputerFactory(new WeakRef(targetWindow));
    }
    constructor(targetWindow) {
        this.targetWindow = targetWindow;
    }
    createLineBreaksComputer(fontInfo, tabSize, wrappingColumn, wrappingIndent, wordBreak) {
        const requests = [];
        const injectedTexts = [];
        return {
            addRequest: (lineText, injectedText, previousLineBreakData) => {
                requests.push(lineText);
                injectedTexts.push(injectedText);
            },
            finalize: () => {
                return createLineBreaks(assertIsDefined(this.targetWindow.deref()), requests, fontInfo, tabSize, wrappingColumn, wrappingIndent, wordBreak, injectedTexts);
            }
        };
    }
}
function createLineBreaks(targetWindow, requests, fontInfo, tabSize, firstLineBreakColumn, wrappingIndent, wordBreak, injectedTextsPerLine) {
    function createEmptyLineBreakWithPossiblyInjectedText(requestIdx) {
        const injectedTexts = injectedTextsPerLine[requestIdx];
        if (injectedTexts) {
            const lineText = LineInjectedText.applyInjectedText(requests[requestIdx], injectedTexts);
            const injectionOptions = injectedTexts.map(t => t.options);
            const injectionOffsets = injectedTexts.map(text => text.column - 1);
            return new ModelLineProjectionData(injectionOffsets, injectionOptions, [lineText.length], [], 0);
        }
        else {
            return null;
        }
    }
    if (firstLineBreakColumn === -1) {
        const result = [];
        for (let i = 0, len = requests.length; i < len; i++) {
            result[i] = createEmptyLineBreakWithPossiblyInjectedText(i);
        }
        return result;
    }
    const overallWidth = Math.round(firstLineBreakColumn * fontInfo.typicalHalfwidthCharacterWidth);
    const additionalIndent = (wrappingIndent === 3 ? 2 : wrappingIndent === 2 ? 1 : 0);
    const additionalIndentSize = Math.round(tabSize * additionalIndent);
    const additionalIndentLength = Math.ceil(fontInfo.spaceWidth * additionalIndentSize);
    const containerDomNode = document.createElement('div');
    applyFontInfo(containerDomNode, fontInfo);
    const sb = new StringBuilder(10000);
    const firstNonWhitespaceIndices = [];
    const wrappedTextIndentLengths = [];
    const renderLineContents = [];
    const allCharOffsets = [];
    const allVisibleColumns = [];
    for (let i = 0; i < requests.length; i++) {
        const lineContent = LineInjectedText.applyInjectedText(requests[i], injectedTextsPerLine[i]);
        let firstNonWhitespaceIndex = 0;
        let wrappedTextIndentLength = 0;
        let width = overallWidth;
        if (wrappingIndent !== 0) {
            firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
            if (firstNonWhitespaceIndex === -1) {
                firstNonWhitespaceIndex = 0;
            }
            else {
                for (let i = 0; i < firstNonWhitespaceIndex; i++) {
                    const charWidth = (lineContent.charCodeAt(i) === 9
                        ? (tabSize - (wrappedTextIndentLength % tabSize))
                        : 1);
                    wrappedTextIndentLength += charWidth;
                }
                const indentWidth = Math.ceil(fontInfo.spaceWidth * wrappedTextIndentLength);
                if (indentWidth + fontInfo.typicalFullwidthCharacterWidth > overallWidth) {
                    firstNonWhitespaceIndex = 0;
                    wrappedTextIndentLength = 0;
                }
                else {
                    width = overallWidth - indentWidth;
                }
            }
        }
        const renderLineContent = lineContent.substr(firstNonWhitespaceIndex);
        const tmp = renderLine(renderLineContent, wrappedTextIndentLength, tabSize, width, sb, additionalIndentLength);
        firstNonWhitespaceIndices[i] = firstNonWhitespaceIndex;
        wrappedTextIndentLengths[i] = wrappedTextIndentLength;
        renderLineContents[i] = renderLineContent;
        allCharOffsets[i] = tmp[0];
        allVisibleColumns[i] = tmp[1];
    }
    const html = sb.build();
    const trustedhtml = ttPolicy?.createHTML(html) ?? html;
    containerDomNode.innerHTML = trustedhtml;
    containerDomNode.style.position = 'absolute';
    containerDomNode.style.top = '10000';
    if (wordBreak === 'keepAll') {
        containerDomNode.style.wordBreak = 'keep-all';
        containerDomNode.style.overflowWrap = 'anywhere';
    }
    else {
        containerDomNode.style.wordBreak = 'inherit';
        containerDomNode.style.overflowWrap = 'break-word';
    }
    targetWindow.document.body.appendChild(containerDomNode);
    const range = document.createRange();
    const lineDomNodes = Array.prototype.slice.call(containerDomNode.children, 0);
    const result = [];
    for (let i = 0; i < requests.length; i++) {
        const lineDomNode = lineDomNodes[i];
        const breakOffsets = readLineBreaks(range, lineDomNode, renderLineContents[i], allCharOffsets[i]);
        if (breakOffsets === null) {
            result[i] = createEmptyLineBreakWithPossiblyInjectedText(i);
            continue;
        }
        const firstNonWhitespaceIndex = firstNonWhitespaceIndices[i];
        const wrappedTextIndentLength = wrappedTextIndentLengths[i] + additionalIndentSize;
        const visibleColumns = allVisibleColumns[i];
        const breakOffsetsVisibleColumn = [];
        for (let j = 0, len = breakOffsets.length; j < len; j++) {
            breakOffsetsVisibleColumn[j] = visibleColumns[breakOffsets[j]];
        }
        if (firstNonWhitespaceIndex !== 0) {
            for (let j = 0, len = breakOffsets.length; j < len; j++) {
                breakOffsets[j] += firstNonWhitespaceIndex;
            }
        }
        let injectionOptions;
        let injectionOffsets;
        const curInjectedTexts = injectedTextsPerLine[i];
        if (curInjectedTexts) {
            injectionOptions = curInjectedTexts.map(t => t.options);
            injectionOffsets = curInjectedTexts.map(text => text.column - 1);
        }
        else {
            injectionOptions = null;
            injectionOffsets = null;
        }
        result[i] = new ModelLineProjectionData(injectionOffsets, injectionOptions, breakOffsets, breakOffsetsVisibleColumn, wrappedTextIndentLength);
    }
    containerDomNode.remove();
    return result;
}
function renderLine(lineContent, initialVisibleColumn, tabSize, width, sb, wrappingIndentLength) {
    if (wrappingIndentLength !== 0) {
        const hangingOffset = String(wrappingIndentLength);
        sb.appendString('<div style="text-indent: -');
        sb.appendString(hangingOffset);
        sb.appendString('px; padding-left: ');
        sb.appendString(hangingOffset);
        sb.appendString('px; box-sizing: border-box; width:');
    }
    else {
        sb.appendString('<div style="width:');
    }
    sb.appendString(String(width));
    sb.appendString('px;">');
    const len = lineContent.length;
    let visibleColumn = initialVisibleColumn;
    let charOffset = 0;
    const charOffsets = [];
    const visibleColumns = [];
    let nextCharCode = (0 < len ? lineContent.charCodeAt(0) : 0);
    sb.appendString('<span>');
    for (let charIndex = 0; charIndex < len; charIndex++) {
        if (charIndex !== 0 && charIndex % 16384 === 0) {
            sb.appendString('</span><span>');
        }
        charOffsets[charIndex] = charOffset;
        visibleColumns[charIndex] = visibleColumn;
        const charCode = nextCharCode;
        nextCharCode = (charIndex + 1 < len ? lineContent.charCodeAt(charIndex + 1) : 0);
        let producedCharacters = 1;
        let charWidth = 1;
        switch (charCode) {
            case 9:
                producedCharacters = (tabSize - (visibleColumn % tabSize));
                charWidth = producedCharacters;
                for (let space = 1; space <= producedCharacters; space++) {
                    if (space < producedCharacters) {
                        sb.appendCharCode(0xA0);
                    }
                    else {
                        sb.appendASCIICharCode(32);
                    }
                }
                break;
            case 32:
                if (nextCharCode === 32) {
                    sb.appendCharCode(0xA0);
                }
                else {
                    sb.appendASCIICharCode(32);
                }
                break;
            case 60:
                sb.appendString('&lt;');
                break;
            case 62:
                sb.appendString('&gt;');
                break;
            case 38:
                sb.appendString('&amp;');
                break;
            case 0:
                sb.appendString('&#00;');
                break;
            case 65279:
            case 8232:
            case 8233:
            case 133:
                sb.appendCharCode(0xFFFD);
                break;
            default:
                if (strings.isFullWidthCharacter(charCode)) {
                    charWidth++;
                }
                if (charCode < 32) {
                    sb.appendCharCode(9216 + charCode);
                }
                else {
                    sb.appendCharCode(charCode);
                }
        }
        charOffset += producedCharacters;
        visibleColumn += charWidth;
    }
    sb.appendString('</span>');
    charOffsets[lineContent.length] = charOffset;
    visibleColumns[lineContent.length] = visibleColumn;
    sb.appendString('</div>');
    return [charOffsets, visibleColumns];
}
function readLineBreaks(range, lineDomNode, lineContent, charOffsets) {
    if (lineContent.length <= 1) {
        return null;
    }
    const spans = Array.prototype.slice.call(lineDomNode.children, 0);
    const breakOffsets = [];
    try {
        discoverBreaks(range, spans, charOffsets, 0, null, lineContent.length - 1, null, breakOffsets);
    }
    catch (err) {
        console.log(err);
        return null;
    }
    if (breakOffsets.length === 0) {
        return null;
    }
    breakOffsets.push(lineContent.length);
    return breakOffsets;
}
function discoverBreaks(range, spans, charOffsets, low, lowRects, high, highRects, result) {
    if (low === high) {
        return;
    }
    lowRects = lowRects || readClientRect(range, spans, charOffsets[low], charOffsets[low + 1]);
    highRects = highRects || readClientRect(range, spans, charOffsets[high], charOffsets[high + 1]);
    if (Math.abs(lowRects[0].top - highRects[0].top) <= 0.1) {
        return;
    }
    if (low + 1 === high) {
        result.push(high);
        return;
    }
    const mid = low + ((high - low) / 2) | 0;
    const midRects = readClientRect(range, spans, charOffsets[mid], charOffsets[mid + 1]);
    discoverBreaks(range, spans, charOffsets, low, lowRects, mid, midRects, result);
    discoverBreaks(range, spans, charOffsets, mid, midRects, high, highRects, result);
}
function readClientRect(range, spans, startOffset, endOffset) {
    range.setStart(spans[(startOffset / 16384) | 0].firstChild, startOffset % 16384);
    range.setEnd(spans[(endOffset / 16384) | 0].firstChild, endOffset % 16384);
    return range.getClientRects();
}
