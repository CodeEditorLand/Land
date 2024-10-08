import { IMouseWheelEvent } from '../../../base/browser/mouseEvent.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { MouseTargetFactory, PointerHandlerLastRenderData } from './mouseTarget.js';
import { IMouseTarget, MouseTargetType } from '../editorBrowser.js';
import { EditorMouseEvent } from '../editorDom.js';
import { ViewController } from '../view/viewController.js';
import { Position } from '../../common/core/position.js';
import { HorizontalPosition } from '../view/renderingContext.js';
import { ViewContext } from '../../common/viewModel/viewContext.js';
import * as viewEvents from '../../common/viewEvents.js';
import { ViewEventHandler } from '../../common/viewEventHandler.js';
export interface IPointerHandlerHelper {
    viewDomNode: HTMLElement;
    linesContentDomNode: HTMLElement;
    viewLinesDomNode: HTMLElement;
    focusTextArea(): void;
    dispatchTextAreaEvent(event: CustomEvent): void;
    /**
     * Get the last rendered information for cursors & textarea.
     */
    getLastRenderData(): PointerHandlerLastRenderData;
    /**
     * Render right now
     */
    renderNow(): void;
    shouldSuppressMouseDownOnViewZone(viewZoneId: string): boolean;
    shouldSuppressMouseDownOnWidget(widgetId: string): boolean;
    /**
     * Decode a position from a rendered dom node
     */
    getPositionFromDOMInfo(spanNode: HTMLElement, offset: number): Position | null;
    visibleRangeForPosition(lineNumber: number, column: number): HorizontalPosition | null;
    getLineWidth(lineNumber: number): number;
}
export declare class MouseHandler extends ViewEventHandler {
    protected _context: ViewContext;
    protected viewController: ViewController;
    protected viewHelper: IPointerHandlerHelper;
    protected mouseTargetFactory: MouseTargetFactory;
    protected readonly _mouseDownOperation: MouseDownOperation;
    private lastMouseLeaveTime;
    private _height;
    private _mouseLeaveMonitor;
    constructor(context: ViewContext, viewController: ViewController, viewHelper: IPointerHandlerHelper);
    private _setupMouseWheelZoomListener;
    dispose(): void;
    onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): boolean;
    onFocusChanged(e: viewEvents.ViewFocusChangedEvent): boolean;
    getTargetAtClientPoint(clientX: number, clientY: number): IMouseTarget | null;
    protected _createMouseTarget(e: EditorMouseEvent, testEventTarget: boolean): IMouseTarget;
    private _getMouseColumn;
    protected _onContextMenu(e: EditorMouseEvent, testEventTarget: boolean): void;
    protected _onMouseMove(e: EditorMouseEvent): void;
    protected _onMouseLeave(e: EditorMouseEvent): void;
    protected _onMouseUp(e: EditorMouseEvent): void;
    protected _onMouseDown(e: EditorMouseEvent, pointerId: number): void;
    protected _onMouseWheel(e: IMouseWheelEvent): void;
}
declare class MouseDownOperation extends Disposable {
    private readonly _context;
    private readonly _viewController;
    private readonly _viewHelper;
    private readonly _mouseTargetFactory;
    private readonly _createMouseTarget;
    private readonly _getMouseColumn;
    private readonly _mouseMoveMonitor;
    private readonly _topBottomDragScrolling;
    private readonly _mouseState;
    private _currentSelection;
    private _isActive;
    private _lastMouseEvent;
    constructor(_context: ViewContext, _viewController: ViewController, _viewHelper: IPointerHandlerHelper, _mouseTargetFactory: MouseTargetFactory, createMouseTarget: (e: EditorMouseEvent, testEventTarget: boolean) => IMouseTarget, getMouseColumn: (e: EditorMouseEvent) => number);
    dispose(): void;
    isActive(): boolean;
    private _onMouseDownThenMove;
    start(targetType: MouseTargetType, e: EditorMouseEvent, pointerId: number): void;
    private _stop;
    onHeightChanged(): void;
    onPointerUp(): void;
    onCursorStateChanged(e: viewEvents.ViewCursorStateChangedEvent): void;
    private _getPositionOutsideEditor;
    private _findMousePosition;
    private _helpPositionJumpOverViewZone;
    private _dispatchMouse;
}
export {};
