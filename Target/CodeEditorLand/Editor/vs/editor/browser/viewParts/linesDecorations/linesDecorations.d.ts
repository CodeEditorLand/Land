import './linesDecorations.css';
import { DecorationToRender, DedupOverlay } from '../glyphMargin/glyphMargin.js';
import { RenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
export declare class LinesDecorationsOverlay extends DedupOverlay {
    private readonly _context;
    private _decorationsLeft;
    private _decorationsWidth;
    private _renderResult;
    constructor(context: ViewContext);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    protected _getDecorations(ctx: RenderingContext): DecorationToRender[];
    prepareRender(ctx: RenderingContext): void;
    render(startLineNumber: number, lineNumber: number): string;
}
