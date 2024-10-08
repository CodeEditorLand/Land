import { FastDomNode } from '../../../../base/browser/fastDomNode.js';
import { ContentWidgetPositionPreference, IContentWidget } from '../../editorBrowser.js';
import { ViewPart } from '../../view/viewPart.js';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
import { ViewportData } from '../../../common/viewLayout/viewLinesViewportData.js';
import { PositionAffinity } from '../../../common/model.js';
import { IPosition } from '../../../common/core/position.js';
/**
 * This view part is responsible for rendering the content widgets, which are
 * used for rendering elements that are associated to an editor position,
 * such as suggestions or the parameter hints.
 */
export declare class ViewContentWidgets extends ViewPart {
    private readonly _viewDomNode;
    private _widgets;
    domNode: FastDomNode<HTMLElement>;
    overflowingContentWidgetsDomNode: FastDomNode<HTMLElement>;
    constructor(context: ViewContext, viewDomNode: FastDomNode<HTMLElement>);
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onLineMappingChanged(e: viewEvents.ViewLineMappingChangedEvent): boolean;
    onLinesChanged(e: viewEvents.ViewLinesChangedEvent): boolean;
    onLinesDeleted(e: viewEvents.ViewLinesDeletedEvent): boolean;
    onLinesInserted(e: viewEvents.ViewLinesInsertedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    private _updateAnchorsViewPositions;
    addWidget(_widget: IContentWidget): void;
    setWidgetPosition(widget: IContentWidget, primaryAnchor: IPosition | null, secondaryAnchor: IPosition | null, preference: ContentWidgetPositionPreference[] | null, affinity: PositionAffinity | null): void;
    removeWidget(widget: IContentWidget): void;
    shouldSuppressMouseDownOnWidget(widgetId: string): boolean;
    onBeforeRender(viewportData: ViewportData): void;
    prepareRender(ctx: RenderingContext): void;
    render(ctx: RestrictedRenderingContext): void;
}
