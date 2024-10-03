import * as browser from '../../../../base/browser/browser.js';
import { createFastDomNode } from '../../../../base/browser/fastDomNode.js';
import * as platform from '../../../../base/common/platform.js';
import { RangeUtil } from './rangeUtil.js';
import { FloatHorizontalRange, VisibleRanges } from '../../view/renderingContext.js';
import { LineDecoration } from '../../../common/viewLayout/lineDecorations.js';
import { RenderLineInput, renderViewLine, LineRange, DomPosition } from '../../../common/viewLayout/viewLineRenderer.js';
import { isHighContrast } from '../../../../platform/theme/common/theme.js';
import { EditorFontLigatures } from '../../../common/config/editorOptions.js';
import { ViewGpuContext } from '../../gpu/viewGpuContext.js';
const canUseFastRenderedViewLine = (function () {
    if (platform.isNative) {
        return true;
    }
    if (platform.isLinux || browser.isFirefox || browser.isSafari) {
        return false;
    }
    return true;
})();
let monospaceAssumptionsAreValid = true;
export class ViewLine {
    static { this.CLASS_NAME = 'view-line'; }
    constructor(options) {
        this._options = options;
        this._isMaybeInvalid = true;
        this._renderedViewLine = null;
    }
    getDomNode() {
        if (this._renderedViewLine && this._renderedViewLine.domNode) {
            return this._renderedViewLine.domNode.domNode;
        }
        return null;
    }
    setDomNode(domNode) {
        if (this._renderedViewLine) {
            this._renderedViewLine.domNode = createFastDomNode(domNode);
        }
        else {
            throw new Error('I have no rendered view line to set the dom node to...');
        }
    }
    onContentChanged() {
        this._isMaybeInvalid = true;
    }
    onTokensChanged() {
        this._isMaybeInvalid = true;
    }
    onDecorationsChanged() {
        this._isMaybeInvalid = true;
    }
    onOptionsChanged(newOptions) {
        this._isMaybeInvalid = true;
        this._options = newOptions;
    }
    onSelectionChanged() {
        if (isHighContrast(this._options.themeType) || this._options.renderWhitespace === 'selection') {
            this._isMaybeInvalid = true;
            return true;
        }
        return false;
    }
    renderLine(lineNumber, deltaTop, lineHeight, viewportData, sb) {
        if (this._options.useGpu && ViewGpuContext.canRender(this._options, viewportData, lineNumber)) {
            this._renderedViewLine?.domNode?.domNode.remove();
            this._renderedViewLine = null;
            return false;
        }
        if (this._isMaybeInvalid === false) {
            return false;
        }
        this._isMaybeInvalid = false;
        const lineData = viewportData.getViewLineRenderingData(lineNumber);
        const options = this._options;
        const actualInlineDecorations = LineDecoration.filter(lineData.inlineDecorations, lineNumber, lineData.minColumn, lineData.maxColumn);
        let selectionsOnLine = null;
        if (isHighContrast(options.themeType) || this._options.renderWhitespace === 'selection') {
            const selections = viewportData.selections;
            for (const selection of selections) {
                if (selection.endLineNumber < lineNumber || selection.startLineNumber > lineNumber) {
                    continue;
                }
                const startColumn = (selection.startLineNumber === lineNumber ? selection.startColumn : lineData.minColumn);
                const endColumn = (selection.endLineNumber === lineNumber ? selection.endColumn : lineData.maxColumn);
                if (startColumn < endColumn) {
                    if (isHighContrast(options.themeType)) {
                        actualInlineDecorations.push(new LineDecoration(startColumn, endColumn, 'inline-selected-text', 0));
                    }
                    if (this._options.renderWhitespace === 'selection') {
                        if (!selectionsOnLine) {
                            selectionsOnLine = [];
                        }
                        selectionsOnLine.push(new LineRange(startColumn - 1, endColumn - 1));
                    }
                }
            }
        }
        const renderLineInput = new RenderLineInput(options.useMonospaceOptimizations, options.canUseHalfwidthRightwardsArrow, lineData.content, lineData.continuesWithWrappedLine, lineData.isBasicASCII, lineData.containsRTL, lineData.minColumn - 1, lineData.tokens, actualInlineDecorations, lineData.tabSize, lineData.startVisibleColumn, options.spaceWidth, options.middotWidth, options.wsmiddotWidth, options.stopRenderingLineAfter, options.renderWhitespace, options.renderControlCharacters, options.fontLigatures !== EditorFontLigatures.OFF, selectionsOnLine);
        if (this._renderedViewLine && this._renderedViewLine.input.equals(renderLineInput)) {
            return false;
        }
        sb.appendString('<div style="top:');
        sb.appendString(String(deltaTop));
        sb.appendString('px;height:');
        sb.appendString(String(lineHeight));
        sb.appendString('px;" class="');
        sb.appendString(ViewLine.CLASS_NAME);
        sb.appendString('">');
        const output = renderViewLine(renderLineInput, sb);
        sb.appendString('</div>');
        let renderedViewLine = null;
        if (monospaceAssumptionsAreValid && canUseFastRenderedViewLine && lineData.isBasicASCII && options.useMonospaceOptimizations && output.containsForeignElements === 0) {
            renderedViewLine = new FastRenderedViewLine(this._renderedViewLine ? this._renderedViewLine.domNode : null, renderLineInput, output.characterMapping);
        }
        if (!renderedViewLine) {
            renderedViewLine = createRenderedLine(this._renderedViewLine ? this._renderedViewLine.domNode : null, renderLineInput, output.characterMapping, output.containsRTL, output.containsForeignElements);
        }
        this._renderedViewLine = renderedViewLine;
        return true;
    }
    layoutLine(lineNumber, deltaTop, lineHeight) {
        if (this._renderedViewLine && this._renderedViewLine.domNode) {
            this._renderedViewLine.domNode.setTop(deltaTop);
            this._renderedViewLine.domNode.setHeight(lineHeight);
        }
    }
    getWidth(context) {
        if (!this._renderedViewLine) {
            return 0;
        }
        return this._renderedViewLine.getWidth(context);
    }
    getWidthIsFast() {
        if (!this._renderedViewLine) {
            return true;
        }
        return this._renderedViewLine.getWidthIsFast();
    }
    needsMonospaceFontCheck() {
        if (!this._renderedViewLine) {
            return false;
        }
        return (this._renderedViewLine instanceof FastRenderedViewLine);
    }
    monospaceAssumptionsAreValid() {
        if (!this._renderedViewLine) {
            return monospaceAssumptionsAreValid;
        }
        if (this._renderedViewLine instanceof FastRenderedViewLine) {
            return this._renderedViewLine.monospaceAssumptionsAreValid();
        }
        return monospaceAssumptionsAreValid;
    }
    onMonospaceAssumptionsInvalidated() {
        if (this._renderedViewLine && this._renderedViewLine instanceof FastRenderedViewLine) {
            this._renderedViewLine = this._renderedViewLine.toSlowRenderedLine();
        }
    }
    getVisibleRangesForRange(lineNumber, startColumn, endColumn, context) {
        if (!this._renderedViewLine) {
            return null;
        }
        startColumn = Math.min(this._renderedViewLine.input.lineContent.length + 1, Math.max(1, startColumn));
        endColumn = Math.min(this._renderedViewLine.input.lineContent.length + 1, Math.max(1, endColumn));
        const stopRenderingLineAfter = this._renderedViewLine.input.stopRenderingLineAfter;
        if (stopRenderingLineAfter !== -1 && startColumn > stopRenderingLineAfter + 1 && endColumn > stopRenderingLineAfter + 1) {
            return new VisibleRanges(true, [new FloatHorizontalRange(this.getWidth(context), 0)]);
        }
        if (stopRenderingLineAfter !== -1 && startColumn > stopRenderingLineAfter + 1) {
            startColumn = stopRenderingLineAfter + 1;
        }
        if (stopRenderingLineAfter !== -1 && endColumn > stopRenderingLineAfter + 1) {
            endColumn = stopRenderingLineAfter + 1;
        }
        const horizontalRanges = this._renderedViewLine.getVisibleRangesForRange(lineNumber, startColumn, endColumn, context);
        if (horizontalRanges && horizontalRanges.length > 0) {
            return new VisibleRanges(false, horizontalRanges);
        }
        return null;
    }
    getColumnOfNodeOffset(spanNode, offset) {
        if (!this._renderedViewLine) {
            return 1;
        }
        return this._renderedViewLine.getColumnOfNodeOffset(spanNode, offset);
    }
}
class FastRenderedViewLine {
    constructor(domNode, renderLineInput, characterMapping) {
        this._cachedWidth = -1;
        this.domNode = domNode;
        this.input = renderLineInput;
        const keyColumnCount = Math.floor(renderLineInput.lineContent.length / 300);
        if (keyColumnCount > 0) {
            this._keyColumnPixelOffsetCache = new Float32Array(keyColumnCount);
            for (let i = 0; i < keyColumnCount; i++) {
                this._keyColumnPixelOffsetCache[i] = -1;
            }
        }
        else {
            this._keyColumnPixelOffsetCache = null;
        }
        this._characterMapping = characterMapping;
        this._charWidth = renderLineInput.spaceWidth;
    }
    getWidth(context) {
        if (!this.domNode || this.input.lineContent.length < 300) {
            const horizontalOffset = this._characterMapping.getHorizontalOffset(this._characterMapping.length);
            return Math.round(this._charWidth * horizontalOffset);
        }
        if (this._cachedWidth === -1) {
            this._cachedWidth = this._getReadingTarget(this.domNode).offsetWidth;
            context?.markDidDomLayout();
        }
        return this._cachedWidth;
    }
    getWidthIsFast() {
        return (this.input.lineContent.length < 300) || this._cachedWidth !== -1;
    }
    monospaceAssumptionsAreValid() {
        if (!this.domNode) {
            return monospaceAssumptionsAreValid;
        }
        if (this.input.lineContent.length < 300) {
            const expectedWidth = this.getWidth(null);
            const actualWidth = this.domNode.domNode.firstChild.offsetWidth;
            if (Math.abs(expectedWidth - actualWidth) >= 2) {
                console.warn(`monospace assumptions have been violated, therefore disabling monospace optimizations!`);
                monospaceAssumptionsAreValid = false;
            }
        }
        return monospaceAssumptionsAreValid;
    }
    toSlowRenderedLine() {
        return createRenderedLine(this.domNode, this.input, this._characterMapping, false, 0);
    }
    getVisibleRangesForRange(lineNumber, startColumn, endColumn, context) {
        const startPosition = this._getColumnPixelOffset(lineNumber, startColumn, context);
        const endPosition = this._getColumnPixelOffset(lineNumber, endColumn, context);
        return [new FloatHorizontalRange(startPosition, endPosition - startPosition)];
    }
    _getColumnPixelOffset(lineNumber, column, context) {
        if (column <= 300) {
            const horizontalOffset = this._characterMapping.getHorizontalOffset(column);
            return this._charWidth * horizontalOffset;
        }
        const keyColumnOrdinal = Math.floor((column - 1) / 300) - 1;
        const keyColumn = (keyColumnOrdinal + 1) * 300 + 1;
        let keyColumnPixelOffset = -1;
        if (this._keyColumnPixelOffsetCache) {
            keyColumnPixelOffset = this._keyColumnPixelOffsetCache[keyColumnOrdinal];
            if (keyColumnPixelOffset === -1) {
                keyColumnPixelOffset = this._actualReadPixelOffset(lineNumber, keyColumn, context);
                this._keyColumnPixelOffsetCache[keyColumnOrdinal] = keyColumnPixelOffset;
            }
        }
        if (keyColumnPixelOffset === -1) {
            const horizontalOffset = this._characterMapping.getHorizontalOffset(column);
            return this._charWidth * horizontalOffset;
        }
        const keyColumnHorizontalOffset = this._characterMapping.getHorizontalOffset(keyColumn);
        const horizontalOffset = this._characterMapping.getHorizontalOffset(column);
        return keyColumnPixelOffset + this._charWidth * (horizontalOffset - keyColumnHorizontalOffset);
    }
    _getReadingTarget(myDomNode) {
        return myDomNode.domNode.firstChild;
    }
    _actualReadPixelOffset(lineNumber, column, context) {
        if (!this.domNode) {
            return -1;
        }
        const domPosition = this._characterMapping.getDomPosition(column);
        const r = RangeUtil.readHorizontalRanges(this._getReadingTarget(this.domNode), domPosition.partIndex, domPosition.charIndex, domPosition.partIndex, domPosition.charIndex, context);
        if (!r || r.length === 0) {
            return -1;
        }
        return r[0].left;
    }
    getColumnOfNodeOffset(spanNode, offset) {
        return getColumnOfNodeOffset(this._characterMapping, spanNode, offset);
    }
}
class RenderedViewLine {
    constructor(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements) {
        this.domNode = domNode;
        this.input = renderLineInput;
        this._characterMapping = characterMapping;
        this._isWhitespaceOnly = /^\s*$/.test(renderLineInput.lineContent);
        this._containsForeignElements = containsForeignElements;
        this._cachedWidth = -1;
        this._pixelOffsetCache = null;
        if (!containsRTL || this._characterMapping.length === 0) {
            this._pixelOffsetCache = new Float32Array(Math.max(2, this._characterMapping.length + 1));
            for (let column = 0, len = this._characterMapping.length; column <= len; column++) {
                this._pixelOffsetCache[column] = -1;
            }
        }
    }
    _getReadingTarget(myDomNode) {
        return myDomNode.domNode.firstChild;
    }
    getWidth(context) {
        if (!this.domNode) {
            return 0;
        }
        if (this._cachedWidth === -1) {
            this._cachedWidth = this._getReadingTarget(this.domNode).offsetWidth;
            context?.markDidDomLayout();
        }
        return this._cachedWidth;
    }
    getWidthIsFast() {
        if (this._cachedWidth === -1) {
            return false;
        }
        return true;
    }
    getVisibleRangesForRange(lineNumber, startColumn, endColumn, context) {
        if (!this.domNode) {
            return null;
        }
        if (this._pixelOffsetCache !== null) {
            const startOffset = this._readPixelOffset(this.domNode, lineNumber, startColumn, context);
            if (startOffset === -1) {
                return null;
            }
            const endOffset = this._readPixelOffset(this.domNode, lineNumber, endColumn, context);
            if (endOffset === -1) {
                return null;
            }
            return [new FloatHorizontalRange(startOffset, endOffset - startOffset)];
        }
        return this._readVisibleRangesForRange(this.domNode, lineNumber, startColumn, endColumn, context);
    }
    _readVisibleRangesForRange(domNode, lineNumber, startColumn, endColumn, context) {
        if (startColumn === endColumn) {
            const pixelOffset = this._readPixelOffset(domNode, lineNumber, startColumn, context);
            if (pixelOffset === -1) {
                return null;
            }
            else {
                return [new FloatHorizontalRange(pixelOffset, 0)];
            }
        }
        else {
            return this._readRawVisibleRangesForRange(domNode, startColumn, endColumn, context);
        }
    }
    _readPixelOffset(domNode, lineNumber, column, context) {
        if (this._characterMapping.length === 0) {
            if (this._containsForeignElements === 0) {
                return 0;
            }
            if (this._containsForeignElements === 2) {
                return 0;
            }
            if (this._containsForeignElements === 1) {
                return this.getWidth(context);
            }
            const readingTarget = this._getReadingTarget(domNode);
            if (readingTarget.firstChild) {
                context.markDidDomLayout();
                return readingTarget.firstChild.offsetWidth;
            }
            else {
                return 0;
            }
        }
        if (this._pixelOffsetCache !== null) {
            const cachedPixelOffset = this._pixelOffsetCache[column];
            if (cachedPixelOffset !== -1) {
                return cachedPixelOffset;
            }
            const result = this._actualReadPixelOffset(domNode, lineNumber, column, context);
            this._pixelOffsetCache[column] = result;
            return result;
        }
        return this._actualReadPixelOffset(domNode, lineNumber, column, context);
    }
    _actualReadPixelOffset(domNode, lineNumber, column, context) {
        if (this._characterMapping.length === 0) {
            const r = RangeUtil.readHorizontalRanges(this._getReadingTarget(domNode), 0, 0, 0, 0, context);
            if (!r || r.length === 0) {
                return -1;
            }
            return r[0].left;
        }
        if (column === this._characterMapping.length && this._isWhitespaceOnly && this._containsForeignElements === 0) {
            return this.getWidth(context);
        }
        const domPosition = this._characterMapping.getDomPosition(column);
        const r = RangeUtil.readHorizontalRanges(this._getReadingTarget(domNode), domPosition.partIndex, domPosition.charIndex, domPosition.partIndex, domPosition.charIndex, context);
        if (!r || r.length === 0) {
            return -1;
        }
        const result = r[0].left;
        if (this.input.isBasicASCII) {
            const horizontalOffset = this._characterMapping.getHorizontalOffset(column);
            const expectedResult = Math.round(this.input.spaceWidth * horizontalOffset);
            if (Math.abs(expectedResult - result) <= 1) {
                return expectedResult;
            }
        }
        return result;
    }
    _readRawVisibleRangesForRange(domNode, startColumn, endColumn, context) {
        if (startColumn === 1 && endColumn === this._characterMapping.length) {
            return [new FloatHorizontalRange(0, this.getWidth(context))];
        }
        const startDomPosition = this._characterMapping.getDomPosition(startColumn);
        const endDomPosition = this._characterMapping.getDomPosition(endColumn);
        return RangeUtil.readHorizontalRanges(this._getReadingTarget(domNode), startDomPosition.partIndex, startDomPosition.charIndex, endDomPosition.partIndex, endDomPosition.charIndex, context);
    }
    getColumnOfNodeOffset(spanNode, offset) {
        return getColumnOfNodeOffset(this._characterMapping, spanNode, offset);
    }
}
class WebKitRenderedViewLine extends RenderedViewLine {
    _readVisibleRangesForRange(domNode, lineNumber, startColumn, endColumn, context) {
        const output = super._readVisibleRangesForRange(domNode, lineNumber, startColumn, endColumn, context);
        if (!output || output.length === 0 || startColumn === endColumn || (startColumn === 1 && endColumn === this._characterMapping.length)) {
            return output;
        }
        if (!this.input.containsRTL) {
            const endPixelOffset = this._readPixelOffset(domNode, lineNumber, endColumn, context);
            if (endPixelOffset !== -1) {
                const lastRange = output[output.length - 1];
                if (lastRange.left < endPixelOffset) {
                    lastRange.width = endPixelOffset - lastRange.left;
                }
            }
        }
        return output;
    }
}
const createRenderedLine = (function () {
    if (browser.isWebKit) {
        return createWebKitRenderedLine;
    }
    return createNormalRenderedLine;
})();
function createWebKitRenderedLine(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements) {
    return new WebKitRenderedViewLine(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements);
}
function createNormalRenderedLine(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements) {
    return new RenderedViewLine(domNode, renderLineInput, characterMapping, containsRTL, containsForeignElements);
}
export function getColumnOfNodeOffset(characterMapping, spanNode, offset) {
    const spanNodeTextContentLength = spanNode.textContent.length;
    let spanIndex = -1;
    while (spanNode) {
        spanNode = spanNode.previousSibling;
        spanIndex++;
    }
    return characterMapping.getColumn(new DomPosition(spanIndex, offset), spanNodeTextContentLength);
}
