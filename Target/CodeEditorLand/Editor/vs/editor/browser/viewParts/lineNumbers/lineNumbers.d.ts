import './lineNumbers.css';
import { DynamicViewOverlay } from '../../view/dynamicViewOverlay.js';
import { RenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
/**
 * Renders line numbers to the left of the main view lines content.
 */
export declare class LineNumbersOverlay extends DynamicViewOverlay {
    static readonly CLASS_NAME = "line-numbers";
    private readonly _context;
    private _lineHeight;
    private _renderLineNumbers;
    private _renderCustomLineNumbers;
    private _renderFinalNewline;
    private _lineNumbersLeft;
    private _lineNumbersWidth;
    private _lastCursorModelPosition;
    private _renderResult;
    private _activeLineNumber;
    constructor(context: ViewContext);
    private _readConfig;
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    private _getLineRenderLineNumber;
    prepareRender(ctx: RenderingContext): void;
    render(startLineNumber: number, lineNumber: number): string;
}
