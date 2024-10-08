import { FastDomNode } from '../../../../base/browser/fastDomNode.js';
import './viewLines.css';
import { HorizontalPosition, IViewLines, LineVisibleRanges } from '../../view/renderingContext.js';
import { ViewPart } from '../../view/viewPart.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import * as viewEvents from '../../../common/viewEvents.js';
import { ViewportData } from '../../../common/viewLayout/viewLinesViewportData.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
/**
 * The view lines part is responsible for rendering the actual content of a
 * file.
 */
export declare class ViewLines extends ViewPart implements IViewLines {
    /**
     * Adds this amount of pixels to the right of lines (no-one wants to type near the edge of the viewport)
     */
    private static readonly HORIZONTAL_EXTRA_PX;
    private readonly _linesContent;
    private readonly _textRangeRestingSpot;
    private readonly _visibleLines;
    private readonly domNode;
    private _lineHeight;
    private _typicalHalfwidthCharacterWidth;
    private _isViewportWrapping;
    private _revealHorizontalRightPadding;
    private _cursorSurroundingLines;
    private _cursorSurroundingLinesStyle;
    private _canUseLayerHinting;
    private _viewLineOptions;
    private _maxLineWidth;
    private readonly _asyncUpdateLineWidths;
    private readonly _asyncCheckMonospaceFontAssumptions;
    private _horizontalRevealRequest;
    private readonly _lastRenderedData;
    private _stickyScrollEnabled;
    private _maxNumberStickyLines;
    constructor(context: ViewContext, linesContent: FastDomNode<HTMLElement>);
    dispose(): void;
    getDomNode(): FastDomNode<HTMLElement>;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    private _onOptionsMaybeChanged;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onRevealRangeRequest(e: viewEvents.ViewRevealRangeRequestEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    getPositionFromDOMInfo(spanNode: HTMLElement, offset: number): Position | null;
    private _getViewLineDomNode;
    /**
     * @returns the line number of this view line dom node.
     */
    private _getLineNumberFor;
    getLineWidth(lineNumber: number): number;
    linesVisibleRangesForRange(_range: Range, includeNewLines: boolean): LineVisibleRanges[] | null;
    private _visibleRangesForLineRange;
    visibleRangeForPosition(position: Position): HorizontalPosition | null;
    updateLineWidths(): void;
    /**
     * Updates the max line width if it is fast to compute.
     * Returns true if all lines were taken into account.
     * Returns false if some lines need to be reevaluated (in a slow fashion).
     */
    private _updateLineWidthsFast;
    private _updateLineWidthsSlow;
    /**
     * Update the line widths using DOM layout information after someone else
     * has caused a synchronous layout.
     */
    private _updateLineWidthsSlowIfDomDidLayout;
    private _updateLineWidths;
    private _checkMonospaceFontAssumptions;
    prepareRender(): void;
    render(): void;
    renderText(viewportData: ViewportData): void;
    private _ensureMaxLineWidth;
    private _computeScrollTopToRevealRange;
    private _computeScrollLeftToReveal;
    private _computeMinimumScrolling;
}
