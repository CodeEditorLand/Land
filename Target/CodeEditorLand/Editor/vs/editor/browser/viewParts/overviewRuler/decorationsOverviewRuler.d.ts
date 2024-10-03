import { ViewPart } from '../../view/viewPart.js';
import { RenderingContext, RestrictedRenderingContext } from '../../view/renderingContext.js';
import { ViewContext } from '../../../common/viewModel/viewContext.js';
import * as viewEvents from '../../../common/viewEvents.js';
export declare class DecorationsOverviewRuler extends ViewPart {
    private _actualShouldRender;
    private readonly _tokensColorTrackerListener;
    private readonly _domNode;
    private _settings;
    private _cursorPositions;
    private _renderedDecorations;
    private _renderedCursorPositions;
    constructor(context: ViewContext);
    dispose(): void;
    private _updateSettings;
    private _markRenderingIsNeeded;
    private _markRenderingIsMaybeNeeded;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFlushed(e: viewEvents.ViewFlushedEvent): boolean;
    onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean;
    onZonesChanged(e: viewEvents.ViewZonesChangedEvent): boolean;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    getDomNode(): HTMLElement;
    prepareRender(ctx: RenderingContext): void;
    render(editorCtx: RestrictedRenderingContext): void;
    private _render;
}
