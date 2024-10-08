import './currentLineHighlight.css';
import { DynamicViewOverlay } from '../../view/dynamicViewOverlay.js';
import { RenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
export declare abstract class AbstractLineHighlightOverlay extends DynamicViewOverlay {
    private readonly _context;
    protected _renderLineHighlight: 'none' | 'gutter' | 'line' | 'all';
    protected _wordWrap: boolean;
    protected _contentLeft: number;
    protected _contentWidth: number;
    protected _selectionIsEmpty: boolean;
    protected _renderLineHighlightOnlyWhenFocus: boolean;
    protected _focused: boolean;
    /**
     * Unique sorted list of view line numbers which have cursors sitting on them.
     */
    private _cursorLineNumbers;
    private _selections;
    private _renderData;
    constructor(context: ViewContext);
    dispose(): void;
    private _readFromSelections;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(startLineNumber: number, lineNumber: number): string;
    protected _shouldRenderInMargin(): boolean;
    protected _shouldRenderInContent(): boolean;
    protected abstract _shouldRenderThis(): boolean;
    protected abstract _shouldRenderOther(): boolean;
    protected abstract _renderOne(ctx: RenderingContext, exact: boolean): string;
}
/**
 * Emphasizes the current line by drawing a border around it.
 */
export declare class CurrentLineHighlightOverlay extends AbstractLineHighlightOverlay {
    protected _renderOne(ctx: RenderingContext, exact: boolean): string;
    protected _shouldRenderThis(): boolean;
    protected _shouldRenderOther(): boolean;
}
/**
 * Emphasizes the current line margin/gutter by drawing a border around it.
 */
export declare class CurrentLineMarginHighlightOverlay extends AbstractLineHighlightOverlay {
    protected _renderOne(ctx: RenderingContext, exact: boolean): string;
    protected _shouldRenderThis(): boolean;
    protected _shouldRenderOther(): boolean;
}
