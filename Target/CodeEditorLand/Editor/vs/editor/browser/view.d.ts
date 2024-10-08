import { FastDomNode } from '../../base/browser/fastDomNode.js';
import { IMouseWheelEvent } from '../../base/browser/mouseEvent.js';
import { IContentWidget, IContentWidgetPosition, IEditorAriaOptions, IGlyphMarginWidget, IGlyphMarginWidgetPosition, IMouseTarget, IOverlayWidget, IOverlayWidgetPosition, IViewZoneChangeAccessor } from './editorBrowser.js';
import { ICommandDelegate } from './view/viewController.js';
import { ViewUserInputEvents } from './view/viewUserInputEvents.js';
import { OverviewRuler } from './viewParts/overviewRuler/overviewRuler.js';
import { IEditorConfiguration } from '../common/config/editorConfiguration.js';
import { ViewEventHandler } from '../common/viewEventHandler.js';
import * as viewEvents from '../common/viewEvents.js';
import { IViewModel } from '../common/viewModel.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { IColorTheme } from '../../platform/theme/common/themeService.js';
export interface IContentWidgetData {
    widget: IContentWidget;
    position: IContentWidgetPosition | null;
}
export interface IOverlayWidgetData {
    widget: IOverlayWidget;
    position: IOverlayWidgetPosition | null;
}
export interface IGlyphMarginWidgetData {
    widget: IGlyphMarginWidget;
    position: IGlyphMarginWidgetPosition;
}
export declare class View extends ViewEventHandler {
    private readonly _instantiationService;
    private readonly _scrollbar;
    private readonly _context;
    private readonly _viewGpuContext?;
    private _selections;
    private readonly _viewLines;
    private readonly _viewLinesGpu?;
    private readonly _viewZones;
    private readonly _contentWidgets;
    private readonly _overlayWidgets;
    private readonly _glyphMarginWidgets;
    private readonly _viewCursors;
    private readonly _viewParts;
    private readonly _viewController;
    private _experimentalEditContextEnabled;
    private _editContext;
    private readonly _pointerHandler;
    private readonly _linesContent;
    readonly domNode: FastDomNode<HTMLElement>;
    private readonly _overflowGuardContainer;
    private _shouldRecomputeGlyphMarginLanes;
    private _renderAnimationFrame;
    constructor(commandDelegate: ICommandDelegate, configuration: IEditorConfiguration, colorTheme: IColorTheme, model: IViewModel, userInputEvents: ViewUserInputEvents, overflowWidgetsDomNode: HTMLElement | undefined, _instantiationService: IInstantiationService);
    private _instantiateEditContext;
    private _updateEditContext;
    private _computeGlyphMarginLanes;
    private _createPointerHandlerHelper;
    private _createTextAreaHandlerHelper;
    private _applyLayout;
    private _getEditorClassName;
    handleEvents(events: viewEvents.ViewEvent[]): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onDecorationsChanged(e: viewEvents.ViewDecorationsChangedEvent): boolean;
    onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean;
    onThemeChanged(e: viewEvents.ViewThemeChangedEvent): boolean;
    dispose(): void;
    private _scheduleRender;
    private _flushAccumulatedAndRenderNow;
    private _getViewPartsToRender;
    private _createCoordinatedRendering;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    delegateScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    restoreState(scrollPosition: {
        scrollLeft: number;
        scrollTop: number;
    }): void;
    getOffsetForColumn(modelLineNumber: number, modelColumn: number): number;
    getTargetAtClientPoint(clientX: number, clientY: number): IMouseTarget | null;
    createOverviewRuler(cssClassName: string): OverviewRuler;
    change(callback: (changeAccessor: IViewZoneChangeAccessor) => any): void;
    render(now: boolean, everything: boolean): void;
    writeScreenReaderContent(reason: string): void;
    focus(): void;
    isFocused(): boolean;
    refreshFocusState(): void;
    setAriaOptions(options: IEditorAriaOptions): void;
    addContentWidget(widgetData: IContentWidgetData): void;
    layoutContentWidget(widgetData: IContentWidgetData): void;
    removeContentWidget(widgetData: IContentWidgetData): void;
    addOverlayWidget(widgetData: IOverlayWidgetData): void;
    layoutOverlayWidget(widgetData: IOverlayWidgetData): void;
    removeOverlayWidget(widgetData: IOverlayWidgetData): void;
    addGlyphMarginWidget(widgetData: IGlyphMarginWidgetData): void;
    layoutGlyphMarginWidget(widgetData: IGlyphMarginWidgetData): void;
    removeGlyphMarginWidget(widgetData: IGlyphMarginWidgetData): void;
}
