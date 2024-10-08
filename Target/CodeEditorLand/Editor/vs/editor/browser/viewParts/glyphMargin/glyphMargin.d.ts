import { FastDomNode } from '../../../../base/browser/fastDomNode.js';
import './glyphMargin.css';
import { IGlyphMarginWidget, IGlyphMarginWidgetPosition } from '../../editorBrowser.js';
import { DynamicViewOverlay } from '../../view/dynamicViewOverlay.js';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewPart } from '../../view/viewPart.js';
import * as viewEvents from '../../../common/viewEvents.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
/**
 * Represents a decoration that should be shown along the lines from `startLineNumber` to `endLineNumber`.
 * This can end up producing multiple `LineDecorationToRender`.
 */
export declare class DecorationToRender {
    readonly startLineNumber: number;
    readonly endLineNumber: number;
    readonly className: string;
    readonly tooltip: string | null;
    readonly _decorationToRenderBrand: void;
    readonly zIndex: number;
    constructor(startLineNumber: number, endLineNumber: number, className: string, tooltip: string | null, zIndex: number | undefined);
}
/**
 * A decoration that should be shown along a line.
 */
export declare class LineDecorationToRender {
    readonly className: string;
    readonly zIndex: number;
    readonly tooltip: string | null;
    constructor(className: string, zIndex: number, tooltip: string | null);
}
/**
 * Decorations to render on a visible line.
 */
export declare class VisibleLineDecorationsToRender {
    private readonly decorations;
    add(decoration: LineDecorationToRender): void;
    getDecorations(): LineDecorationToRender[];
}
export declare abstract class DedupOverlay extends DynamicViewOverlay {
    /**
     * Returns an array with an element for each visible line number.
     */
    protected _render(visibleStartLineNumber: number, visibleEndLineNumber: number, decorations: DecorationToRender[]): VisibleLineDecorationsToRender[];
}
export declare class GlyphMarginWidgets extends ViewPart {
    domNode: FastDomNode<HTMLElement>;
    private _lineHeight;
    private _glyphMargin;
    private _glyphMarginLeft;
    private _glyphMarginWidth;
    private _glyphMarginDecorationLaneCount;
    private _managedDomNodes;
    private _decorationGlyphsToRender;
    private _widgets;
    constructor(context: ViewContext);
    dispose(): void;
    getWidgets(): IWidgetData[];
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    addWidget(widget: IGlyphMarginWidget): void;
    setWidgetPosition(widget: IGlyphMarginWidget, preference: IGlyphMarginWidgetPosition): boolean;
    removeWidget(widget: IGlyphMarginWidget): void;
    private _collectDecorationBasedGlyphRenderRequest;
    private _collectWidgetBasedGlyphRenderRequest;
    private _collectSortedGlyphRenderRequests;
    /**
     * Will store render information in each widget's renderInfo and in `_decorationGlyphsToRender`.
     */
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}
export interface IWidgetData {
    widget: IGlyphMarginWidget;
    preference: IGlyphMarginWidgetPosition;
    domNode: FastDomNode<HTMLElement>;
    /**
     * it will contain the location where to render the widget
     * or null if the widget is not visible
     */
    renderInfo: IRenderInfo | null;
}
export interface IRenderInfo {
    lineNumber: number;
    laneIndex: number;
}
