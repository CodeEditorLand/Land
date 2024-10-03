import { FastDomNode } from '../../../base/browser/fastDomNode.js';
import { DynamicViewOverlay } from './dynamicViewOverlay.js';
import { IVisibleLine } from './viewLayer.js';
import { ViewPart } from './viewPart.js';
import { StringBuilder } from '../../common/core/stringBuilder.js';
import { RenderingContext, RestrictedRenderingContext } from './renderingContext.js';
import { ViewContext } from '../../common/viewModel/viewContext.js';
import * as viewEvents from '../../common/viewEvents.js';
import { ViewportData } from '../../common/viewLayout/viewLinesViewportData.js';
export declare class ViewOverlays extends ViewPart {
    private readonly _visibleLines;
    protected readonly domNode: FastDomNode<HTMLElement>;
    private _dynamicOverlays;
    private _isFocused;
    constructor(context: ViewContext);
    shouldRender(): boolean;
    dispose(): void;
    getDomNode(): FastDomNode<HTMLElement>;
    addDynamicOverlay(overlay: DynamicViewOverlay): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onTokensChanged(e: viewEvents.ViewTokensChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
    _viewOverlaysRender(ctx: RestrictedRenderingContext): void;
}
export declare class ViewOverlayLine implements IVisibleLine {
    private readonly _dynamicOverlays;
    private _domNode;
    private _renderedContent;
    constructor(dynamicOverlays: DynamicViewOverlay[]);
    getDomNode(): HTMLElement | null;
    setDomNode(domNode: HTMLElement): void;
    onContentChanged(): void;
    onTokensChanged(): void;
    renderLine(lineNumber: number, deltaTop: number, lineHeight: number, viewportData: ViewportData, sb: StringBuilder): boolean;
    layoutLine(lineNumber: number, deltaTop: number, lineHeight: number): void;
}
export declare class ContentViewOverlays extends ViewOverlays {
    private _contentWidth;
    constructor(context: ViewContext);
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    _viewOverlaysRender(ctx: RestrictedRenderingContext): void;
}
export declare class MarginViewOverlays extends ViewOverlays {
    private _contentLeft;
    constructor(context: ViewContext);
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    _viewOverlaysRender(ctx: RestrictedRenderingContext): void;
}
