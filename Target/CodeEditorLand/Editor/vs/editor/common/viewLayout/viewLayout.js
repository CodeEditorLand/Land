import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Scrollable } from '../../../base/common/scrollable.js';
import { LinesLayout } from './linesLayout.js';
import { Viewport } from '../viewModel.js';
import { ContentSizeChangedEvent } from '../viewModelEventDispatcher.js';
const SMOOTH_SCROLLING_TIME = 125;
class EditorScrollDimensions {
    constructor(width, contentWidth, height, contentHeight) {
        width = width | 0;
        contentWidth = contentWidth | 0;
        height = height | 0;
        contentHeight = contentHeight | 0;
        if (width < 0) {
            width = 0;
        }
        if (contentWidth < 0) {
            contentWidth = 0;
        }
        if (height < 0) {
            height = 0;
        }
        if (contentHeight < 0) {
            contentHeight = 0;
        }
        this.width = width;
        this.contentWidth = contentWidth;
        this.scrollWidth = Math.max(width, contentWidth);
        this.height = height;
        this.contentHeight = contentHeight;
        this.scrollHeight = Math.max(height, contentHeight);
    }
    equals(other) {
        return (this.width === other.width
            && this.contentWidth === other.contentWidth
            && this.height === other.height
            && this.contentHeight === other.contentHeight);
    }
}
class EditorScrollable extends Disposable {
    constructor(smoothScrollDuration, scheduleAtNextAnimationFrame) {
        super();
        this._onDidContentSizeChange = this._register(new Emitter());
        this.onDidContentSizeChange = this._onDidContentSizeChange.event;
        this._dimensions = new EditorScrollDimensions(0, 0, 0, 0);
        this._scrollable = this._register(new Scrollable({
            forceIntegerValues: true,
            smoothScrollDuration,
            scheduleAtNextAnimationFrame
        }));
        this.onDidScroll = this._scrollable.onScroll;
    }
    getScrollable() {
        return this._scrollable;
    }
    setSmoothScrollDuration(smoothScrollDuration) {
        this._scrollable.setSmoothScrollDuration(smoothScrollDuration);
    }
    validateScrollPosition(scrollPosition) {
        return this._scrollable.validateScrollPosition(scrollPosition);
    }
    getScrollDimensions() {
        return this._dimensions;
    }
    setScrollDimensions(dimensions) {
        if (this._dimensions.equals(dimensions)) {
            return;
        }
        const oldDimensions = this._dimensions;
        this._dimensions = dimensions;
        this._scrollable.setScrollDimensions({
            width: dimensions.width,
            scrollWidth: dimensions.scrollWidth,
            height: dimensions.height,
            scrollHeight: dimensions.scrollHeight
        }, true);
        const contentWidthChanged = (oldDimensions.contentWidth !== dimensions.contentWidth);
        const contentHeightChanged = (oldDimensions.contentHeight !== dimensions.contentHeight);
        if (contentWidthChanged || contentHeightChanged) {
            this._onDidContentSizeChange.fire(new ContentSizeChangedEvent(oldDimensions.contentWidth, oldDimensions.contentHeight, dimensions.contentWidth, dimensions.contentHeight));
        }
    }
    getFutureScrollPosition() {
        return this._scrollable.getFutureScrollPosition();
    }
    getCurrentScrollPosition() {
        return this._scrollable.getCurrentScrollPosition();
    }
    setScrollPositionNow(update) {
        this._scrollable.setScrollPositionNow(update);
    }
    setScrollPositionSmooth(update) {
        this._scrollable.setScrollPositionSmooth(update);
    }
    hasPendingScrollAnimation() {
        return this._scrollable.hasPendingScrollAnimation();
    }
}
export class ViewLayout extends Disposable {
    constructor(configuration, lineCount, scheduleAtNextAnimationFrame) {
        super();
        this._configuration = configuration;
        const options = this._configuration.options;
        const layoutInfo = options.get(148);
        const padding = options.get(86);
        this._linesLayout = new LinesLayout(lineCount, options.get(69), padding.top, padding.bottom);
        this._maxLineWidth = 0;
        this._overlayWidgetsMinWidth = 0;
        this._scrollable = this._register(new EditorScrollable(0, scheduleAtNextAnimationFrame));
        this._configureSmoothScrollDuration();
        this._scrollable.setScrollDimensions(new EditorScrollDimensions(layoutInfo.contentWidth, 0, layoutInfo.height, 0));
        this.onDidScroll = this._scrollable.onDidScroll;
        this.onDidContentSizeChange = this._scrollable.onDidContentSizeChange;
        this._updateHeight();
    }
    dispose() {
        super.dispose();
    }
    getScrollable() {
        return this._scrollable.getScrollable();
    }
    onHeightMaybeChanged() {
        this._updateHeight();
    }
    _configureSmoothScrollDuration() {
        this._scrollable.setSmoothScrollDuration(this._configuration.options.get(117) ? SMOOTH_SCROLLING_TIME : 0);
    }
    onConfigurationChanged(e) {
        const options = this._configuration.options;
        if (e.hasChanged(69)) {
            this._linesLayout.setLineHeight(options.get(69));
        }
        if (e.hasChanged(86)) {
            const padding = options.get(86);
            this._linesLayout.setPadding(padding.top, padding.bottom);
        }
        if (e.hasChanged(148)) {
            const layoutInfo = options.get(148);
            const width = layoutInfo.contentWidth;
            const height = layoutInfo.height;
            const scrollDimensions = this._scrollable.getScrollDimensions();
            const contentWidth = scrollDimensions.contentWidth;
            this._scrollable.setScrollDimensions(new EditorScrollDimensions(width, scrollDimensions.contentWidth, height, this._getContentHeight(width, height, contentWidth)));
        }
        else {
            this._updateHeight();
        }
        if (e.hasChanged(117)) {
            this._configureSmoothScrollDuration();
        }
    }
    onFlushed(lineCount) {
        this._linesLayout.onFlushed(lineCount);
    }
    onLinesDeleted(fromLineNumber, toLineNumber) {
        this._linesLayout.onLinesDeleted(fromLineNumber, toLineNumber);
    }
    onLinesInserted(fromLineNumber, toLineNumber) {
        this._linesLayout.onLinesInserted(fromLineNumber, toLineNumber);
    }
    _getHorizontalScrollbarHeight(width, scrollWidth) {
        const options = this._configuration.options;
        const scrollbar = options.get(106);
        if (scrollbar.horizontal === 2) {
            return 0;
        }
        if (width >= scrollWidth) {
            return 0;
        }
        return scrollbar.horizontalScrollbarSize;
    }
    _getContentHeight(width, height, contentWidth) {
        const options = this._configuration.options;
        let result = this._linesLayout.getLinesTotalHeight();
        if (options.get(108)) {
            result += Math.max(0, height - options.get(69) - options.get(86).bottom);
        }
        else if (!options.get(106).ignoreHorizontalScrollbarInContentHeight) {
            result += this._getHorizontalScrollbarHeight(width, contentWidth);
        }
        return result;
    }
    _updateHeight() {
        const scrollDimensions = this._scrollable.getScrollDimensions();
        const width = scrollDimensions.width;
        const height = scrollDimensions.height;
        const contentWidth = scrollDimensions.contentWidth;
        this._scrollable.setScrollDimensions(new EditorScrollDimensions(width, scrollDimensions.contentWidth, height, this._getContentHeight(width, height, contentWidth)));
    }
    getCurrentViewport() {
        const scrollDimensions = this._scrollable.getScrollDimensions();
        const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
        return new Viewport(currentScrollPosition.scrollTop, currentScrollPosition.scrollLeft, scrollDimensions.width, scrollDimensions.height);
    }
    getFutureViewport() {
        const scrollDimensions = this._scrollable.getScrollDimensions();
        const currentScrollPosition = this._scrollable.getFutureScrollPosition();
        return new Viewport(currentScrollPosition.scrollTop, currentScrollPosition.scrollLeft, scrollDimensions.width, scrollDimensions.height);
    }
    _computeContentWidth() {
        const options = this._configuration.options;
        const maxLineWidth = this._maxLineWidth;
        const wrappingInfo = options.get(149);
        const fontInfo = options.get(52);
        const layoutInfo = options.get(148);
        if (wrappingInfo.isViewportWrapping) {
            const minimap = options.get(75);
            if (maxLineWidth > layoutInfo.contentWidth + fontInfo.typicalHalfwidthCharacterWidth) {
                if (minimap.enabled && minimap.side === 'right') {
                    return maxLineWidth + layoutInfo.verticalScrollbarWidth;
                }
            }
            return maxLineWidth;
        }
        else {
            const extraHorizontalSpace = options.get(107) * fontInfo.typicalHalfwidthCharacterWidth;
            const whitespaceMinWidth = this._linesLayout.getWhitespaceMinWidth();
            return Math.max(maxLineWidth + extraHorizontalSpace + layoutInfo.verticalScrollbarWidth, whitespaceMinWidth, this._overlayWidgetsMinWidth);
        }
    }
    setMaxLineWidth(maxLineWidth) {
        this._maxLineWidth = maxLineWidth;
        this._updateContentWidth();
    }
    setOverlayWidgetsMinWidth(maxMinWidth) {
        this._overlayWidgetsMinWidth = maxMinWidth;
        this._updateContentWidth();
    }
    _updateContentWidth() {
        const scrollDimensions = this._scrollable.getScrollDimensions();
        this._scrollable.setScrollDimensions(new EditorScrollDimensions(scrollDimensions.width, this._computeContentWidth(), scrollDimensions.height, scrollDimensions.contentHeight));
        this._updateHeight();
    }
    saveState() {
        const currentScrollPosition = this._scrollable.getFutureScrollPosition();
        const scrollTop = currentScrollPosition.scrollTop;
        const firstLineNumberInViewport = this._linesLayout.getLineNumberAtOrAfterVerticalOffset(scrollTop);
        const whitespaceAboveFirstLine = this._linesLayout.getWhitespaceAccumulatedHeightBeforeLineNumber(firstLineNumberInViewport);
        return {
            scrollTop: scrollTop,
            scrollTopWithoutViewZones: scrollTop - whitespaceAboveFirstLine,
            scrollLeft: currentScrollPosition.scrollLeft
        };
    }
    changeWhitespace(callback) {
        const hadAChange = this._linesLayout.changeWhitespace(callback);
        if (hadAChange) {
            this.onHeightMaybeChanged();
        }
        return hadAChange;
    }
    getVerticalOffsetForLineNumber(lineNumber, includeViewZones = false) {
        return this._linesLayout.getVerticalOffsetForLineNumber(lineNumber, includeViewZones);
    }
    getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones = false) {
        return this._linesLayout.getVerticalOffsetAfterLineNumber(lineNumber, includeViewZones);
    }
    isAfterLines(verticalOffset) {
        return this._linesLayout.isAfterLines(verticalOffset);
    }
    isInTopPadding(verticalOffset) {
        return this._linesLayout.isInTopPadding(verticalOffset);
    }
    isInBottomPadding(verticalOffset) {
        return this._linesLayout.isInBottomPadding(verticalOffset);
    }
    getLineNumberAtVerticalOffset(verticalOffset) {
        return this._linesLayout.getLineNumberAtOrAfterVerticalOffset(verticalOffset);
    }
    getWhitespaceAtVerticalOffset(verticalOffset) {
        return this._linesLayout.getWhitespaceAtVerticalOffset(verticalOffset);
    }
    getLinesViewportData() {
        const visibleBox = this.getCurrentViewport();
        return this._linesLayout.getLinesViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
    }
    getLinesViewportDataAtScrollTop(scrollTop) {
        const scrollDimensions = this._scrollable.getScrollDimensions();
        if (scrollTop + scrollDimensions.height > scrollDimensions.scrollHeight) {
            scrollTop = scrollDimensions.scrollHeight - scrollDimensions.height;
        }
        if (scrollTop < 0) {
            scrollTop = 0;
        }
        return this._linesLayout.getLinesViewportData(scrollTop, scrollTop + scrollDimensions.height);
    }
    getWhitespaceViewportData() {
        const visibleBox = this.getCurrentViewport();
        return this._linesLayout.getWhitespaceViewportData(visibleBox.top, visibleBox.top + visibleBox.height);
    }
    getWhitespaces() {
        return this._linesLayout.getWhitespaces();
    }
    getContentWidth() {
        const scrollDimensions = this._scrollable.getScrollDimensions();
        return scrollDimensions.contentWidth;
    }
    getScrollWidth() {
        const scrollDimensions = this._scrollable.getScrollDimensions();
        return scrollDimensions.scrollWidth;
    }
    getContentHeight() {
        const scrollDimensions = this._scrollable.getScrollDimensions();
        return scrollDimensions.contentHeight;
    }
    getScrollHeight() {
        const scrollDimensions = this._scrollable.getScrollDimensions();
        return scrollDimensions.scrollHeight;
    }
    getCurrentScrollLeft() {
        const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
        return currentScrollPosition.scrollLeft;
    }
    getCurrentScrollTop() {
        const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
        return currentScrollPosition.scrollTop;
    }
    validateScrollPosition(scrollPosition) {
        return this._scrollable.validateScrollPosition(scrollPosition);
    }
    setScrollPosition(position, type) {
        if (type === 1) {
            this._scrollable.setScrollPositionNow(position);
        }
        else {
            this._scrollable.setScrollPositionSmooth(position);
        }
    }
    hasPendingScrollAnimation() {
        return this._scrollable.hasPendingScrollAnimation();
    }
    deltaScrollNow(deltaScrollLeft, deltaScrollTop) {
        const currentScrollPosition = this._scrollable.getCurrentScrollPosition();
        this._scrollable.setScrollPositionNow({
            scrollLeft: currentScrollPosition.scrollLeft + deltaScrollLeft,
            scrollTop: currentScrollPosition.scrollTop + deltaScrollTop
        });
    }
}
