import './selections.css';
import { DynamicViewOverlay } from '../../view/dynamicViewOverlay.js';
import { RenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
/**
 * This view part displays selected text to the user. Every line has its own selection overlay.
 */
export declare class SelectionsOverlay extends DynamicViewOverlay {
    private static readonly SELECTION_CLASS_NAME;
    private static readonly SELECTION_TOP_LEFT;
    private static readonly SELECTION_BOTTOM_LEFT;
    private static readonly SELECTION_TOP_RIGHT;
    private static readonly SELECTION_BOTTOM_RIGHT;
    private static readonly EDITOR_BACKGROUND_CLASS_NAME;
    private static readonly ROUNDED_PIECE_WIDTH;
    private readonly _context;
    private _roundedSelection;
    private _typicalHalfwidthCharacterWidth;
    private _selections;
    private _renderResult;
    constructor(context: ViewContext);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    private _visibleRangesHaveGaps;
    private _enrichVisibleRangesWithStyle;
    private _getVisibleRangesWithStyle;
    private _createSelectionPiece;
    private _actualRenderOneSelection;
    private _previousFrameVisibleRangesWithStyle;
    prepareRender(ctx: RenderingContext): void;
    render(startLineNumber: number, lineNumber: number): string;
}
