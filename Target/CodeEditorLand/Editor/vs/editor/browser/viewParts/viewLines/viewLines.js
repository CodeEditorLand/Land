import { MOUSE_CURSOR_TEXT_CSS_CLASS_NAME } from '../../../../base/browser/ui/mouseCursor/mouseCursor.js';
import { RunOnceScheduler } from '../../../../base/common/async.js';
import * as platform from '../../../../base/common/platform.js';
import './viewLines.css';
import { applyFontInfo } from '../../config/domFontInfo.js';
import { HorizontalPosition, HorizontalRange, LineVisibleRanges } from '../../view/renderingContext.js';
import { VisibleLinesCollection } from '../../view/viewLayer.js';
import { PartFingerprints, ViewPart } from '../../view/viewPart.js';
import { DomReadingContext } from './domReadingContext.js';
import { ViewLine } from './viewLine.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { ViewLineOptions } from './viewLineOptions.js';
class LastRenderedData {
    constructor() {
        this._currentVisibleRange = new Range(1, 1, 1, 1);
    }
    getCurrentVisibleRange() {
        return this._currentVisibleRange;
    }
    setCurrentVisibleRange(currentVisibleRange) {
        this._currentVisibleRange = currentVisibleRange;
    }
}
class HorizontalRevealRangeRequest {
    constructor(minimalReveal, lineNumber, startColumn, endColumn, startScrollTop, stopScrollTop, scrollType) {
        this.minimalReveal = minimalReveal;
        this.lineNumber = lineNumber;
        this.startColumn = startColumn;
        this.endColumn = endColumn;
        this.startScrollTop = startScrollTop;
        this.stopScrollTop = stopScrollTop;
        this.scrollType = scrollType;
        this.type = 'range';
        this.minLineNumber = lineNumber;
        this.maxLineNumber = lineNumber;
    }
}
class HorizontalRevealSelectionsRequest {
    constructor(minimalReveal, selections, startScrollTop, stopScrollTop, scrollType) {
        this.minimalReveal = minimalReveal;
        this.selections = selections;
        this.startScrollTop = startScrollTop;
        this.stopScrollTop = stopScrollTop;
        this.scrollType = scrollType;
        this.type = 'selections';
        let minLineNumber = selections[0].startLineNumber;
        let maxLineNumber = selections[0].endLineNumber;
        for (let i = 1, len = selections.length; i < len; i++) {
            const selection = selections[i];
            minLineNumber = Math.min(minLineNumber, selection.startLineNumber);
            maxLineNumber = Math.max(maxLineNumber, selection.endLineNumber);
        }
        this.minLineNumber = minLineNumber;
        this.maxLineNumber = maxLineNumber;
    }
}
export class ViewLines extends ViewPart {
    static { this.HORIZONTAL_EXTRA_PX = 30; }
    constructor(context, linesContent) {
        super(context);
        const conf = this._context.configuration;
        const options = this._context.configuration.options;
        const fontInfo = options.get(52);
        const wrappingInfo = options.get(149);
        this._lineHeight = options.get(69);
        this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
        this._isViewportWrapping = wrappingInfo.isViewportWrapping;
        this._revealHorizontalRightPadding = options.get(103);
        this._cursorSurroundingLines = options.get(29);
        this._cursorSurroundingLinesStyle = options.get(30);
        this._canUseLayerHinting = !options.get(32);
        this._viewLineOptions = new ViewLineOptions(conf, this._context.theme.type);
        this._linesContent = linesContent;
        this._textRangeRestingSpot = document.createElement('div');
        this._visibleLines = new VisibleLinesCollection({
            createLine: () => new ViewLine(this._viewLineOptions),
        });
        this.domNode = this._visibleLines.domNode;
        PartFingerprints.write(this.domNode, 8);
        this.domNode.setClassName(`view-lines ${MOUSE_CURSOR_TEXT_CSS_CLASS_NAME}`);
        applyFontInfo(this.domNode, fontInfo);
        this._maxLineWidth = 0;
        this._asyncUpdateLineWidths = new RunOnceScheduler(() => {
            this._updateLineWidthsSlow();
        }, 200);
        this._asyncCheckMonospaceFontAssumptions = new RunOnceScheduler(() => {
            this._checkMonospaceFontAssumptions();
        }, 2000);
        this._lastRenderedData = new LastRenderedData();
        this._horizontalRevealRequest = null;
        this._stickyScrollEnabled = options.get(118).enabled;
        this._maxNumberStickyLines = options.get(118).maxLineCount;
    }
    dispose() {
        this._asyncUpdateLineWidths.dispose();
        this._asyncCheckMonospaceFontAssumptions.dispose();
        super.dispose();
    }
    getDomNode() {
        return this.domNode;
    }
    onConfigurationChanged(e) {
        this._visibleLines.onConfigurationChanged(e);
        if (e.hasChanged(149)) {
            this._maxLineWidth = 0;
        }
        const options = this._context.configuration.options;
        const fontInfo = options.get(52);
        const wrappingInfo = options.get(149);
        this._lineHeight = options.get(69);
        this._typicalHalfwidthCharacterWidth = fontInfo.typicalHalfwidthCharacterWidth;
        this._isViewportWrapping = wrappingInfo.isViewportWrapping;
        this._revealHorizontalRightPadding = options.get(103);
        this._cursorSurroundingLines = options.get(29);
        this._cursorSurroundingLinesStyle = options.get(30);
        this._canUseLayerHinting = !options.get(32);
        this._stickyScrollEnabled = options.get(118).enabled;
        this._maxNumberStickyLines = options.get(118).maxLineCount;
        applyFontInfo(this.domNode, fontInfo);
        this._onOptionsMaybeChanged();
        if (e.hasChanged(148)) {
            this._maxLineWidth = 0;
        }
        return true;
    }
    _onOptionsMaybeChanged() {
        const conf = this._context.configuration;
        const newViewLineOptions = new ViewLineOptions(conf, this._context.theme.type);
        if (!this._viewLineOptions.equals(newViewLineOptions)) {
            this._viewLineOptions = newViewLineOptions;
            const startLineNumber = this._visibleLines.getStartLineNumber();
            const endLineNumber = this._visibleLines.getEndLineNumber();
            for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
                const line = this._visibleLines.getVisibleLine(lineNumber);
                line.onOptionsChanged(this._viewLineOptions);
            }
            return true;
        }
        return false;
    }
    onCursorStateChanged(e) {
        const rendStartLineNumber = this._visibleLines.getStartLineNumber();
        const rendEndLineNumber = this._visibleLines.getEndLineNumber();
        let r = false;
        for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
            r = this._visibleLines.getVisibleLine(lineNumber).onSelectionChanged() || r;
        }
        return r;
    }
    onDecorationsChanged(e) {
        if (true) {
            const rendStartLineNumber = this._visibleLines.getStartLineNumber();
            const rendEndLineNumber = this._visibleLines.getEndLineNumber();
            for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                this._visibleLines.getVisibleLine(lineNumber).onDecorationsChanged();
            }
        }
        return true;
    }
    onFlushed(e) {
        const shouldRender = this._visibleLines.onFlushed(e);
        this._maxLineWidth = 0;
        return shouldRender;
    }
    onLinesChanged(e) {
        return this._visibleLines.onLinesChanged(e);
    }
    onLinesDeleted(e) {
        return this._visibleLines.onLinesDeleted(e);
    }
    onLinesInserted(e) {
        return this._visibleLines.onLinesInserted(e);
    }
    onRevealRangeRequest(e) {
        const desiredScrollTop = this._computeScrollTopToRevealRange(this._context.viewLayout.getFutureViewport(), e.source, e.minimalReveal, e.range, e.selections, e.verticalType);
        if (desiredScrollTop === -1) {
            return false;
        }
        let newScrollPosition = this._context.viewLayout.validateScrollPosition({ scrollTop: desiredScrollTop });
        if (e.revealHorizontal) {
            if (e.range && e.range.startLineNumber !== e.range.endLineNumber) {
                newScrollPosition = {
                    scrollTop: newScrollPosition.scrollTop,
                    scrollLeft: 0
                };
            }
            else if (e.range) {
                this._horizontalRevealRequest = new HorizontalRevealRangeRequest(e.minimalReveal, e.range.startLineNumber, e.range.startColumn, e.range.endColumn, this._context.viewLayout.getCurrentScrollTop(), newScrollPosition.scrollTop, e.scrollType);
            }
            else if (e.selections && e.selections.length > 0) {
                this._horizontalRevealRequest = new HorizontalRevealSelectionsRequest(e.minimalReveal, e.selections, this._context.viewLayout.getCurrentScrollTop(), newScrollPosition.scrollTop, e.scrollType);
            }
        }
        else {
            this._horizontalRevealRequest = null;
        }
        const scrollTopDelta = Math.abs(this._context.viewLayout.getCurrentScrollTop() - newScrollPosition.scrollTop);
        const scrollType = (scrollTopDelta <= this._lineHeight ? 1 : e.scrollType);
        this._context.viewModel.viewLayout.setScrollPosition(newScrollPosition, scrollType);
        return true;
    }
    onScrollChanged(e) {
        if (this._horizontalRevealRequest && e.scrollLeftChanged) {
            this._horizontalRevealRequest = null;
        }
        if (this._horizontalRevealRequest && e.scrollTopChanged) {
            const min = Math.min(this._horizontalRevealRequest.startScrollTop, this._horizontalRevealRequest.stopScrollTop);
            const max = Math.max(this._horizontalRevealRequest.startScrollTop, this._horizontalRevealRequest.stopScrollTop);
            if (e.scrollTop < min || e.scrollTop > max) {
                this._horizontalRevealRequest = null;
            }
        }
        this.domNode.setWidth(e.scrollWidth);
        return this._visibleLines.onScrollChanged(e) || true;
    }
    onTokensChanged(e) {
        return this._visibleLines.onTokensChanged(e);
    }
    onZonesChanged(e) {
        this._context.viewModel.viewLayout.setMaxLineWidth(this._maxLineWidth);
        return this._visibleLines.onZonesChanged(e);
    }
    onThemeChanged(e) {
        return this._onOptionsMaybeChanged();
    }
    getPositionFromDOMInfo(spanNode, offset) {
        const viewLineDomNode = this._getViewLineDomNode(spanNode);
        if (viewLineDomNode === null) {
            return null;
        }
        const lineNumber = this._getLineNumberFor(viewLineDomNode);
        if (lineNumber === -1) {
            return null;
        }
        if (lineNumber < 1 || lineNumber > this._context.viewModel.getLineCount()) {
            return null;
        }
        if (this._context.viewModel.getLineMaxColumn(lineNumber) === 1) {
            return new Position(lineNumber, 1);
        }
        const rendStartLineNumber = this._visibleLines.getStartLineNumber();
        const rendEndLineNumber = this._visibleLines.getEndLineNumber();
        if (lineNumber < rendStartLineNumber || lineNumber > rendEndLineNumber) {
            return null;
        }
        let column = this._visibleLines.getVisibleLine(lineNumber).getColumnOfNodeOffset(spanNode, offset);
        const minColumn = this._context.viewModel.getLineMinColumn(lineNumber);
        if (column < minColumn) {
            column = minColumn;
        }
        return new Position(lineNumber, column);
    }
    _getViewLineDomNode(node) {
        while (node && node.nodeType === 1) {
            if (node.className === ViewLine.CLASS_NAME) {
                return node;
            }
            node = node.parentElement;
        }
        return null;
    }
    _getLineNumberFor(domNode) {
        const startLineNumber = this._visibleLines.getStartLineNumber();
        const endLineNumber = this._visibleLines.getEndLineNumber();
        for (let lineNumber = startLineNumber; lineNumber <= endLineNumber; lineNumber++) {
            const line = this._visibleLines.getVisibleLine(lineNumber);
            if (domNode === line.getDomNode()) {
                return lineNumber;
            }
        }
        return -1;
    }
    getLineWidth(lineNumber) {
        const rendStartLineNumber = this._visibleLines.getStartLineNumber();
        const rendEndLineNumber = this._visibleLines.getEndLineNumber();
        if (lineNumber < rendStartLineNumber || lineNumber > rendEndLineNumber) {
            return -1;
        }
        const context = new DomReadingContext(this.domNode.domNode, this._textRangeRestingSpot);
        const result = this._visibleLines.getVisibleLine(lineNumber).getWidth(context);
        this._updateLineWidthsSlowIfDomDidLayout(context);
        return result;
    }
    linesVisibleRangesForRange(_range, includeNewLines) {
        if (this.shouldRender()) {
            return null;
        }
        const originalEndLineNumber = _range.endLineNumber;
        const range = Range.intersectRanges(_range, this._lastRenderedData.getCurrentVisibleRange());
        if (!range) {
            return null;
        }
        const visibleRanges = [];
        let visibleRangesLen = 0;
        const domReadingContext = new DomReadingContext(this.domNode.domNode, this._textRangeRestingSpot);
        let nextLineModelLineNumber = 0;
        if (includeNewLines) {
            nextLineModelLineNumber = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(range.startLineNumber, 1)).lineNumber;
        }
        const rendStartLineNumber = this._visibleLines.getStartLineNumber();
        const rendEndLineNumber = this._visibleLines.getEndLineNumber();
        for (let lineNumber = range.startLineNumber; lineNumber <= range.endLineNumber; lineNumber++) {
            if (lineNumber < rendStartLineNumber || lineNumber > rendEndLineNumber) {
                continue;
            }
            const startColumn = lineNumber === range.startLineNumber ? range.startColumn : 1;
            const continuesInNextLine = lineNumber !== range.endLineNumber;
            const endColumn = continuesInNextLine ? this._context.viewModel.getLineMaxColumn(lineNumber) : range.endColumn;
            const visibleRangesForLine = this._visibleLines.getVisibleLine(lineNumber).getVisibleRangesForRange(lineNumber, startColumn, endColumn, domReadingContext);
            if (!visibleRangesForLine) {
                continue;
            }
            if (includeNewLines && lineNumber < originalEndLineNumber) {
                const currentLineModelLineNumber = nextLineModelLineNumber;
                nextLineModelLineNumber = this._context.viewModel.coordinatesConverter.convertViewPositionToModelPosition(new Position(lineNumber + 1, 1)).lineNumber;
                if (currentLineModelLineNumber !== nextLineModelLineNumber) {
                    visibleRangesForLine.ranges[visibleRangesForLine.ranges.length - 1].width += this._typicalHalfwidthCharacterWidth;
                }
            }
            visibleRanges[visibleRangesLen++] = new LineVisibleRanges(visibleRangesForLine.outsideRenderedLine, lineNumber, HorizontalRange.from(visibleRangesForLine.ranges), continuesInNextLine);
        }
        this._updateLineWidthsSlowIfDomDidLayout(domReadingContext);
        if (visibleRangesLen === 0) {
            return null;
        }
        return visibleRanges;
    }
    _visibleRangesForLineRange(lineNumber, startColumn, endColumn) {
        if (this.shouldRender()) {
            return null;
        }
        if (lineNumber < this._visibleLines.getStartLineNumber() || lineNumber > this._visibleLines.getEndLineNumber()) {
            return null;
        }
        const domReadingContext = new DomReadingContext(this.domNode.domNode, this._textRangeRestingSpot);
        const result = this._visibleLines.getVisibleLine(lineNumber).getVisibleRangesForRange(lineNumber, startColumn, endColumn, domReadingContext);
        this._updateLineWidthsSlowIfDomDidLayout(domReadingContext);
        return result;
    }
    visibleRangeForPosition(position) {
        const visibleRanges = this._visibleRangesForLineRange(position.lineNumber, position.column, position.column);
        if (!visibleRanges) {
            return null;
        }
        return new HorizontalPosition(visibleRanges.outsideRenderedLine, visibleRanges.ranges[0].left);
    }
    updateLineWidths() {
        this._updateLineWidths(false);
    }
    _updateLineWidthsFast() {
        return this._updateLineWidths(true);
    }
    _updateLineWidthsSlow() {
        this._updateLineWidths(false);
    }
    _updateLineWidthsSlowIfDomDidLayout(domReadingContext) {
        if (!domReadingContext.didDomLayout) {
            return;
        }
        if (this._asyncUpdateLineWidths.isScheduled()) {
            return;
        }
        this._asyncUpdateLineWidths.cancel();
        this._updateLineWidthsSlow();
    }
    _updateLineWidths(fast) {
        const rendStartLineNumber = this._visibleLines.getStartLineNumber();
        const rendEndLineNumber = this._visibleLines.getEndLineNumber();
        let localMaxLineWidth = 1;
        let allWidthsComputed = true;
        for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
            const visibleLine = this._visibleLines.getVisibleLine(lineNumber);
            if (fast && !visibleLine.getWidthIsFast()) {
                allWidthsComputed = false;
                continue;
            }
            localMaxLineWidth = Math.max(localMaxLineWidth, visibleLine.getWidth(null));
        }
        if (allWidthsComputed && rendStartLineNumber === 1 && rendEndLineNumber === this._context.viewModel.getLineCount()) {
            this._maxLineWidth = 0;
        }
        this._ensureMaxLineWidth(localMaxLineWidth);
        return allWidthsComputed;
    }
    _checkMonospaceFontAssumptions() {
        let longestLineNumber = -1;
        let longestWidth = -1;
        const rendStartLineNumber = this._visibleLines.getStartLineNumber();
        const rendEndLineNumber = this._visibleLines.getEndLineNumber();
        for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
            const visibleLine = this._visibleLines.getVisibleLine(lineNumber);
            if (visibleLine.needsMonospaceFontCheck()) {
                const lineWidth = visibleLine.getWidth(null);
                if (lineWidth > longestWidth) {
                    longestWidth = lineWidth;
                    longestLineNumber = lineNumber;
                }
            }
        }
        if (longestLineNumber === -1) {
            return;
        }
        if (!this._visibleLines.getVisibleLine(longestLineNumber).monospaceAssumptionsAreValid()) {
            for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                const visibleLine = this._visibleLines.getVisibleLine(lineNumber);
                visibleLine.onMonospaceAssumptionsInvalidated();
            }
        }
    }
    prepareRender() {
        throw new Error('Not supported');
    }
    render() {
        throw new Error('Not supported');
    }
    renderText(viewportData) {
        this._visibleLines.renderLines(viewportData);
        this._lastRenderedData.setCurrentVisibleRange(viewportData.visibleRange);
        this.domNode.setWidth(this._context.viewLayout.getScrollWidth());
        this.domNode.setHeight(Math.min(this._context.viewLayout.getScrollHeight(), 1000000));
        if (this._horizontalRevealRequest) {
            const horizontalRevealRequest = this._horizontalRevealRequest;
            if (viewportData.startLineNumber <= horizontalRevealRequest.minLineNumber && horizontalRevealRequest.maxLineNumber <= viewportData.endLineNumber) {
                this._horizontalRevealRequest = null;
                this.onDidRender();
                const newScrollLeft = this._computeScrollLeftToReveal(horizontalRevealRequest);
                if (newScrollLeft) {
                    if (!this._isViewportWrapping) {
                        this._ensureMaxLineWidth(newScrollLeft.maxHorizontalOffset);
                    }
                    this._context.viewModel.viewLayout.setScrollPosition({
                        scrollLeft: newScrollLeft.scrollLeft
                    }, horizontalRevealRequest.scrollType);
                }
            }
        }
        if (!this._updateLineWidthsFast()) {
            this._asyncUpdateLineWidths.schedule();
        }
        else {
            this._asyncUpdateLineWidths.cancel();
        }
        if (platform.isLinux && !this._asyncCheckMonospaceFontAssumptions.isScheduled()) {
            const rendStartLineNumber = this._visibleLines.getStartLineNumber();
            const rendEndLineNumber = this._visibleLines.getEndLineNumber();
            for (let lineNumber = rendStartLineNumber; lineNumber <= rendEndLineNumber; lineNumber++) {
                const visibleLine = this._visibleLines.getVisibleLine(lineNumber);
                if (visibleLine.needsMonospaceFontCheck()) {
                    this._asyncCheckMonospaceFontAssumptions.schedule();
                    break;
                }
            }
        }
        this._linesContent.setLayerHinting(this._canUseLayerHinting);
        this._linesContent.setContain('strict');
        const adjustedScrollTop = this._context.viewLayout.getCurrentScrollTop() - viewportData.bigNumbersDelta;
        this._linesContent.setTop(-adjustedScrollTop);
        this._linesContent.setLeft(-this._context.viewLayout.getCurrentScrollLeft());
    }
    _ensureMaxLineWidth(lineWidth) {
        const iLineWidth = Math.ceil(lineWidth);
        if (this._maxLineWidth < iLineWidth) {
            this._maxLineWidth = iLineWidth;
            this._context.viewModel.viewLayout.setMaxLineWidth(this._maxLineWidth);
        }
    }
    _computeScrollTopToRevealRange(viewport, source, minimalReveal, range, selections, verticalType) {
        const viewportStartY = viewport.top;
        const viewportHeight = viewport.height;
        const viewportEndY = viewportStartY + viewportHeight;
        let boxIsSingleRange;
        let boxStartY;
        let boxEndY;
        if (selections && selections.length > 0) {
            let minLineNumber = selections[0].startLineNumber;
            let maxLineNumber = selections[0].endLineNumber;
            for (let i = 1, len = selections.length; i < len; i++) {
                const selection = selections[i];
                minLineNumber = Math.min(minLineNumber, selection.startLineNumber);
                maxLineNumber = Math.max(maxLineNumber, selection.endLineNumber);
            }
            boxIsSingleRange = false;
            boxStartY = this._context.viewLayout.getVerticalOffsetForLineNumber(minLineNumber);
            boxEndY = this._context.viewLayout.getVerticalOffsetForLineNumber(maxLineNumber) + this._lineHeight;
        }
        else if (range) {
            boxIsSingleRange = true;
            boxStartY = this._context.viewLayout.getVerticalOffsetForLineNumber(range.startLineNumber);
            boxEndY = this._context.viewLayout.getVerticalOffsetForLineNumber(range.endLineNumber) + this._lineHeight;
        }
        else {
            return -1;
        }
        const shouldIgnoreScrollOff = (source === 'mouse' || minimalReveal) && this._cursorSurroundingLinesStyle === 'default';
        let paddingTop = 0;
        let paddingBottom = 0;
        if (!shouldIgnoreScrollOff) {
            const maxLinesInViewport = (viewportHeight / this._lineHeight);
            const surroundingLines = Math.max(this._cursorSurroundingLines, this._stickyScrollEnabled ? this._maxNumberStickyLines : 0);
            const context = Math.min(maxLinesInViewport / 2, surroundingLines);
            paddingTop = context * this._lineHeight;
            paddingBottom = Math.max(0, (context - 1)) * this._lineHeight;
        }
        else {
            if (!minimalReveal) {
                paddingTop = this._lineHeight;
            }
        }
        if (!minimalReveal) {
            if (verticalType === 0 || verticalType === 4) {
                paddingBottom += this._lineHeight;
            }
        }
        boxStartY -= paddingTop;
        boxEndY += paddingBottom;
        let newScrollTop;
        if (boxEndY - boxStartY > viewportHeight) {
            if (!boxIsSingleRange) {
                return -1;
            }
            newScrollTop = boxStartY;
        }
        else if (verticalType === 5 || verticalType === 6) {
            if (verticalType === 6 && viewportStartY <= boxStartY && boxEndY <= viewportEndY) {
                newScrollTop = viewportStartY;
            }
            else {
                const desiredGapAbove = Math.max(5 * this._lineHeight, viewportHeight * 0.2);
                const desiredScrollTop = boxStartY - desiredGapAbove;
                const minScrollTop = boxEndY - viewportHeight;
                newScrollTop = Math.max(minScrollTop, desiredScrollTop);
            }
        }
        else if (verticalType === 1 || verticalType === 2) {
            if (verticalType === 2 && viewportStartY <= boxStartY && boxEndY <= viewportEndY) {
                newScrollTop = viewportStartY;
            }
            else {
                const boxMiddleY = (boxStartY + boxEndY) / 2;
                newScrollTop = Math.max(0, boxMiddleY - viewportHeight / 2);
            }
        }
        else {
            newScrollTop = this._computeMinimumScrolling(viewportStartY, viewportEndY, boxStartY, boxEndY, verticalType === 3, verticalType === 4);
        }
        return newScrollTop;
    }
    _computeScrollLeftToReveal(horizontalRevealRequest) {
        const viewport = this._context.viewLayout.getCurrentViewport();
        const layoutInfo = this._context.configuration.options.get(148);
        const viewportStartX = viewport.left;
        const viewportEndX = viewportStartX + viewport.width - layoutInfo.verticalScrollbarWidth;
        let boxStartX = 1073741824;
        let boxEndX = 0;
        if (horizontalRevealRequest.type === 'range') {
            const visibleRanges = this._visibleRangesForLineRange(horizontalRevealRequest.lineNumber, horizontalRevealRequest.startColumn, horizontalRevealRequest.endColumn);
            if (!visibleRanges) {
                return null;
            }
            for (const visibleRange of visibleRanges.ranges) {
                boxStartX = Math.min(boxStartX, Math.round(visibleRange.left));
                boxEndX = Math.max(boxEndX, Math.round(visibleRange.left + visibleRange.width));
            }
        }
        else {
            for (const selection of horizontalRevealRequest.selections) {
                if (selection.startLineNumber !== selection.endLineNumber) {
                    return null;
                }
                const visibleRanges = this._visibleRangesForLineRange(selection.startLineNumber, selection.startColumn, selection.endColumn);
                if (!visibleRanges) {
                    return null;
                }
                for (const visibleRange of visibleRanges.ranges) {
                    boxStartX = Math.min(boxStartX, Math.round(visibleRange.left));
                    boxEndX = Math.max(boxEndX, Math.round(visibleRange.left + visibleRange.width));
                }
            }
        }
        if (!horizontalRevealRequest.minimalReveal) {
            boxStartX = Math.max(0, boxStartX - ViewLines.HORIZONTAL_EXTRA_PX);
            boxEndX += this._revealHorizontalRightPadding;
        }
        if (horizontalRevealRequest.type === 'selections' && boxEndX - boxStartX > viewport.width) {
            return null;
        }
        const newScrollLeft = this._computeMinimumScrolling(viewportStartX, viewportEndX, boxStartX, boxEndX);
        return {
            scrollLeft: newScrollLeft,
            maxHorizontalOffset: boxEndX
        };
    }
    _computeMinimumScrolling(viewportStart, viewportEnd, boxStart, boxEnd, revealAtStart, revealAtEnd) {
        viewportStart = viewportStart | 0;
        viewportEnd = viewportEnd | 0;
        boxStart = boxStart | 0;
        boxEnd = boxEnd | 0;
        revealAtStart = !!revealAtStart;
        revealAtEnd = !!revealAtEnd;
        const viewportLength = viewportEnd - viewportStart;
        const boxLength = boxEnd - boxStart;
        if (boxLength < viewportLength) {
            if (revealAtStart) {
                return boxStart;
            }
            if (revealAtEnd) {
                return Math.max(0, boxEnd - viewportLength);
            }
            if (boxStart < viewportStart) {
                return boxStart;
            }
            else if (boxEnd > viewportEnd) {
                return Math.max(0, boxEnd - viewportLength);
            }
        }
        else {
            return boxStart;
        }
        return viewportStart;
    }
}
