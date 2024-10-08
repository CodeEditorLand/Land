import { FastDomNode } from '../../../../base/browser/fastDomNode.js';
import { IViewZoneChangeAccessor } from '../../editorBrowser.js';
import { ViewPart } from '../../view/viewPart.js';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
/**
 * A view zone is a rectangle that is a section that is inserted into the editor
 * lines that can be used for various purposes such as showing a diffs, peeking
 * an implementation, etc.
 */
export declare class ViewZones extends ViewPart {
    private _zones;
    private _lineHeight;
    private _contentWidth;
    private _contentLeft;
    domNode: FastDomNode<HTMLElement>;
    marginDomNode: FastDomNode<HTMLElement>;
    constructor(context: ViewContext);
    dispose(): void;
    private _recomputeWhitespacesProps;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onLineMappingChanged(e: viewEvents.ViewLineMappingChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    private _getZoneOrdinal;
    private _computeWhitespaceProps;
    changeViewZones(callback: (changeAccessor: IViewZoneChangeAccessor) => any): boolean;
    private _addZone;
    private _removeZone;
    private _layoutZone;
    shouldSuppressMouseDownOnViewZone(id: string): boolean;
    private _heightInPixels;
    private _minWidthInPixels;
    private _safeCallOnComputedHeight;
    private _safeCallOnDomNodeTop;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}
