import * as dom from '../../../base/browser/dom.js';
import { StandardWheelEvent } from '../../../base/browser/mouseEvent.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import * as platform from '../../../base/common/platform.js';
import { HitTestContext, MouseTarget, MouseTargetFactory } from './mouseTarget.js';
import { ClientCoordinates, EditorMouseEvent, EditorMouseEventFactory, GlobalEditorPointerMoveMonitor, createEditorPagePosition, createCoordinatesRelativeToEditor, PageCoordinates } from '../editorDom.js';
import { EditorZoom } from '../../common/config/editorZoom.js';
import { Position } from '../../common/core/position.js';
import { Selection } from '../../common/core/selection.js';
import { ViewEventHandler } from '../../common/viewEventHandler.js';
import { MouseWheelClassifier } from '../../../base/browser/ui/scrollbar/scrollableElement.js';
export class MouseHandler extends ViewEventHandler {
    constructor(context, viewController, viewHelper) {
        super();
        this._mouseLeaveMonitor = null;
        this._context = context;
        this.viewController = viewController;
        this.viewHelper = viewHelper;
        this.mouseTargetFactory = new MouseTargetFactory(this._context, viewHelper);
        this._mouseDownOperation = this._register(new MouseDownOperation(this._context, this.viewController, this.viewHelper, this.mouseTargetFactory, (e, testEventTarget) => this._createMouseTarget(e, testEventTarget), (e) => this._getMouseColumn(e)));
        this.lastMouseLeaveTime = -1;
        this._height = this._context.configuration.options.get(148).height;
        const mouseEvents = new EditorMouseEventFactory(this.viewHelper.viewDomNode);
        this._register(mouseEvents.onContextMenu(this.viewHelper.viewDomNode, (e) => this._onContextMenu(e, true)));
        this._register(mouseEvents.onMouseMove(this.viewHelper.viewDomNode, (e) => {
            this._onMouseMove(e);
            if (!this._mouseLeaveMonitor) {
                this._mouseLeaveMonitor = dom.addDisposableListener(this.viewHelper.viewDomNode.ownerDocument, 'mousemove', (e) => {
                    if (!this.viewHelper.viewDomNode.contains(e.target)) {
                        this._onMouseLeave(new EditorMouseEvent(e, false, this.viewHelper.viewDomNode));
                    }
                });
            }
        }));
        this._register(mouseEvents.onMouseUp(this.viewHelper.viewDomNode, (e) => this._onMouseUp(e)));
        this._register(mouseEvents.onMouseLeave(this.viewHelper.viewDomNode, (e) => this._onMouseLeave(e)));
        let capturePointerId = 0;
        this._register(mouseEvents.onPointerDown(this.viewHelper.viewDomNode, (e, pointerId) => {
            capturePointerId = pointerId;
        }));
        this._register(dom.addDisposableListener(this.viewHelper.viewDomNode, dom.EventType.POINTER_UP, (e) => {
            this._mouseDownOperation.onPointerUp();
        }));
        this._register(mouseEvents.onMouseDown(this.viewHelper.viewDomNode, (e) => this._onMouseDown(e, capturePointerId)));
        this._setupMouseWheelZoomListener();
        this._context.addEventHandler(this);
    }
    _setupMouseWheelZoomListener() {
        const classifier = MouseWheelClassifier.INSTANCE;
        let prevMouseWheelTime = 0;
        let gestureStartZoomLevel = EditorZoom.getZoomLevel();
        let gestureHasZoomModifiers = false;
        let gestureAccumulatedDelta = 0;
        const onMouseWheel = (browserEvent) => {
            this.viewController.emitMouseWheel(browserEvent);
            if (!this._context.configuration.options.get(78)) {
                return;
            }
            const e = new StandardWheelEvent(browserEvent);
            classifier.acceptStandardWheelEvent(e);
            if (classifier.isPhysicalMouseWheel()) {
                if (hasMouseWheelZoomModifiers(browserEvent)) {
                    const zoomLevel = EditorZoom.getZoomLevel();
                    const delta = e.deltaY > 0 ? 1 : -1;
                    EditorZoom.setZoomLevel(zoomLevel + delta);
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
            else {
                if (Date.now() - prevMouseWheelTime > 50) {
                    gestureStartZoomLevel = EditorZoom.getZoomLevel();
                    gestureHasZoomModifiers = hasMouseWheelZoomModifiers(browserEvent);
                    gestureAccumulatedDelta = 0;
                }
                prevMouseWheelTime = Date.now();
                gestureAccumulatedDelta += e.deltaY;
                if (gestureHasZoomModifiers) {
                    EditorZoom.setZoomLevel(gestureStartZoomLevel + gestureAccumulatedDelta / 5);
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        };
        this._register(dom.addDisposableListener(this.viewHelper.viewDomNode, dom.EventType.MOUSE_WHEEL, onMouseWheel, { capture: true, passive: false }));
        function hasMouseWheelZoomModifiers(browserEvent) {
            return (platform.isMacintosh
                ? ((browserEvent.metaKey || browserEvent.ctrlKey) && !browserEvent.shiftKey && !browserEvent.altKey)
                : (browserEvent.ctrlKey && !browserEvent.metaKey && !browserEvent.shiftKey && !browserEvent.altKey));
        }
    }
    dispose() {
        this._context.removeEventHandler(this);
        if (this._mouseLeaveMonitor) {
            this._mouseLeaveMonitor.dispose();
            this._mouseLeaveMonitor = null;
        }
        super.dispose();
    }
    onConfigurationChanged(e) {
        if (e.hasChanged(148)) {
            const height = this._context.configuration.options.get(148).height;
            if (this._height !== height) {
                this._height = height;
                this._mouseDownOperation.onHeightChanged();
            }
        }
        return false;
    }
    onCursorStateChanged(e) {
        this._mouseDownOperation.onCursorStateChanged(e);
        return false;
    }
    onFocusChanged(e) {
        return false;
    }
    getTargetAtClientPoint(clientX, clientY) {
        const clientPos = new ClientCoordinates(clientX, clientY);
        const pos = clientPos.toPageCoordinates(dom.getWindow(this.viewHelper.viewDomNode));
        const editorPos = createEditorPagePosition(this.viewHelper.viewDomNode);
        if (pos.y < editorPos.y || pos.y > editorPos.y + editorPos.height || pos.x < editorPos.x || pos.x > editorPos.x + editorPos.width) {
            return null;
        }
        const relativePos = createCoordinatesRelativeToEditor(this.viewHelper.viewDomNode, editorPos, pos);
        return this.mouseTargetFactory.createMouseTarget(this.viewHelper.getLastRenderData(), editorPos, pos, relativePos, null);
    }
    _createMouseTarget(e, testEventTarget) {
        let target = e.target;
        if (!this.viewHelper.viewDomNode.contains(target)) {
            const shadowRoot = dom.getShadowRoot(this.viewHelper.viewDomNode);
            if (shadowRoot) {
                target = shadowRoot.elementsFromPoint(e.posx, e.posy).find((el) => this.viewHelper.viewDomNode.contains(el));
            }
        }
        return this.mouseTargetFactory.createMouseTarget(this.viewHelper.getLastRenderData(), e.editorPos, e.pos, e.relativePos, testEventTarget ? target : null);
    }
    _getMouseColumn(e) {
        return this.mouseTargetFactory.getMouseColumn(e.relativePos);
    }
    _onContextMenu(e, testEventTarget) {
        this.viewController.emitContextMenu({
            event: e,
            target: this._createMouseTarget(e, testEventTarget)
        });
    }
    _onMouseMove(e) {
        const targetIsWidget = this.mouseTargetFactory.mouseTargetIsWidget(e);
        if (!targetIsWidget) {
            e.preventDefault();
        }
        if (this._mouseDownOperation.isActive()) {
            return;
        }
        const actualMouseMoveTime = e.timestamp;
        if (actualMouseMoveTime < this.lastMouseLeaveTime) {
            return;
        }
        this.viewController.emitMouseMove({
            event: e,
            target: this._createMouseTarget(e, true)
        });
    }
    _onMouseLeave(e) {
        if (this._mouseLeaveMonitor) {
            this._mouseLeaveMonitor.dispose();
            this._mouseLeaveMonitor = null;
        }
        this.lastMouseLeaveTime = (new Date()).getTime();
        this.viewController.emitMouseLeave({
            event: e,
            target: null
        });
    }
    _onMouseUp(e) {
        this.viewController.emitMouseUp({
            event: e,
            target: this._createMouseTarget(e, true)
        });
    }
    _onMouseDown(e, pointerId) {
        const t = this._createMouseTarget(e, true);
        const targetIsContent = (t.type === 6 || t.type === 7);
        const targetIsGutter = (t.type === 2 || t.type === 3 || t.type === 4);
        const targetIsLineNumbers = (t.type === 3);
        const selectOnLineNumbers = this._context.configuration.options.get(112);
        const targetIsViewZone = (t.type === 8 || t.type === 5);
        const targetIsWidget = (t.type === 9);
        let shouldHandle = e.leftButton || e.middleButton;
        if (platform.isMacintosh && e.leftButton && e.ctrlKey) {
            shouldHandle = false;
        }
        const focus = () => {
            e.preventDefault();
            this.viewHelper.focusTextArea();
        };
        if (shouldHandle && (targetIsContent || (targetIsLineNumbers && selectOnLineNumbers))) {
            focus();
            this._mouseDownOperation.start(t.type, e, pointerId);
        }
        else if (targetIsGutter) {
            e.preventDefault();
        }
        else if (targetIsViewZone) {
            const viewZoneData = t.detail;
            if (shouldHandle && this.viewHelper.shouldSuppressMouseDownOnViewZone(viewZoneData.viewZoneId)) {
                focus();
                this._mouseDownOperation.start(t.type, e, pointerId);
                e.preventDefault();
            }
        }
        else if (targetIsWidget && this.viewHelper.shouldSuppressMouseDownOnWidget(t.detail)) {
            focus();
            e.preventDefault();
        }
        this.viewController.emitMouseDown({
            event: e,
            target: t
        });
    }
    _onMouseWheel(e) {
        this.viewController.emitMouseWheel(e);
    }
}
class MouseDownOperation extends Disposable {
    constructor(_context, _viewController, _viewHelper, _mouseTargetFactory, createMouseTarget, getMouseColumn) {
        super();
        this._context = _context;
        this._viewController = _viewController;
        this._viewHelper = _viewHelper;
        this._mouseTargetFactory = _mouseTargetFactory;
        this._createMouseTarget = createMouseTarget;
        this._getMouseColumn = getMouseColumn;
        this._mouseMoveMonitor = this._register(new GlobalEditorPointerMoveMonitor(this._viewHelper.viewDomNode));
        this._topBottomDragScrolling = this._register(new TopBottomDragScrolling(this._context, this._viewHelper, this._mouseTargetFactory, (position, inSelectionMode, revealType) => this._dispatchMouse(position, inSelectionMode, revealType)));
        this._mouseState = new MouseDownState();
        this._currentSelection = new Selection(1, 1, 1, 1);
        this._isActive = false;
        this._lastMouseEvent = null;
    }
    dispose() {
        super.dispose();
    }
    isActive() {
        return this._isActive;
    }
    _onMouseDownThenMove(e) {
        this._lastMouseEvent = e;
        this._mouseState.setModifiers(e);
        const position = this._findMousePosition(e, false);
        if (!position) {
            return;
        }
        if (this._mouseState.isDragAndDrop) {
            this._viewController.emitMouseDrag({
                event: e,
                target: position
            });
        }
        else {
            if (position.type === 13 && (position.outsidePosition === 'above' || position.outsidePosition === 'below')) {
                this._topBottomDragScrolling.start(position, e);
            }
            else {
                this._topBottomDragScrolling.stop();
                this._dispatchMouse(position, true, 1);
            }
        }
    }
    start(targetType, e, pointerId) {
        this._lastMouseEvent = e;
        this._mouseState.setStartedOnLineNumbers(targetType === 3);
        this._mouseState.setStartButtons(e);
        this._mouseState.setModifiers(e);
        const position = this._findMousePosition(e, true);
        if (!position || !position.position) {
            return;
        }
        this._mouseState.trySetCount(e.detail, position.position);
        e.detail = this._mouseState.count;
        const options = this._context.configuration.options;
        if (!options.get(94)
            && options.get(35)
            && !options.get(22)
            && !this._mouseState.altKey
            && e.detail < 2
            && !this._isActive
            && !this._currentSelection.isEmpty()
            && (position.type === 6)
            && position.position && this._currentSelection.containsPosition(position.position)) {
            this._mouseState.isDragAndDrop = true;
            this._isActive = true;
            this._mouseMoveMonitor.startMonitoring(this._viewHelper.viewLinesDomNode, pointerId, e.buttons, (e) => this._onMouseDownThenMove(e), (browserEvent) => {
                const position = this._findMousePosition(this._lastMouseEvent, false);
                if (dom.isKeyboardEvent(browserEvent)) {
                    this._viewController.emitMouseDropCanceled();
                }
                else {
                    this._viewController.emitMouseDrop({
                        event: this._lastMouseEvent,
                        target: (position ? this._createMouseTarget(this._lastMouseEvent, true) : null)
                    });
                }
                this._stop();
            });
            return;
        }
        this._mouseState.isDragAndDrop = false;
        this._dispatchMouse(position, e.shiftKey, 1);
        if (!this._isActive) {
            this._isActive = true;
            this._mouseMoveMonitor.startMonitoring(this._viewHelper.viewLinesDomNode, pointerId, e.buttons, (e) => this._onMouseDownThenMove(e), () => this._stop());
        }
    }
    _stop() {
        this._isActive = false;
        this._topBottomDragScrolling.stop();
    }
    onHeightChanged() {
        this._mouseMoveMonitor.stopMonitoring();
    }
    onPointerUp() {
        this._mouseMoveMonitor.stopMonitoring();
    }
    onCursorStateChanged(e) {
        this._currentSelection = e.selections[0];
    }
    _getPositionOutsideEditor(e) {
        const editorContent = e.editorPos;
        const model = this._context.viewModel;
        const viewLayout = this._context.viewLayout;
        const mouseColumn = this._getMouseColumn(e);
        if (e.posy < editorContent.y) {
            const outsideDistance = editorContent.y - e.posy;
            const verticalOffset = Math.max(viewLayout.getCurrentScrollTop() - outsideDistance, 0);
            const viewZoneData = HitTestContext.getZoneAtCoord(this._context, verticalOffset);
            if (viewZoneData) {
                const newPosition = this._helpPositionJumpOverViewZone(viewZoneData);
                if (newPosition) {
                    return MouseTarget.createOutsideEditor(mouseColumn, newPosition, 'above', outsideDistance);
                }
            }
            const aboveLineNumber = viewLayout.getLineNumberAtVerticalOffset(verticalOffset);
            return MouseTarget.createOutsideEditor(mouseColumn, new Position(aboveLineNumber, 1), 'above', outsideDistance);
        }
        if (e.posy > editorContent.y + editorContent.height) {
            const outsideDistance = e.posy - editorContent.y - editorContent.height;
            const verticalOffset = viewLayout.getCurrentScrollTop() + e.relativePos.y;
            const viewZoneData = HitTestContext.getZoneAtCoord(this._context, verticalOffset);
            if (viewZoneData) {
                const newPosition = this._helpPositionJumpOverViewZone(viewZoneData);
                if (newPosition) {
                    return MouseTarget.createOutsideEditor(mouseColumn, newPosition, 'below', outsideDistance);
                }
            }
            const belowLineNumber = viewLayout.getLineNumberAtVerticalOffset(verticalOffset);
            return MouseTarget.createOutsideEditor(mouseColumn, new Position(belowLineNumber, model.getLineMaxColumn(belowLineNumber)), 'below', outsideDistance);
        }
        const possibleLineNumber = viewLayout.getLineNumberAtVerticalOffset(viewLayout.getCurrentScrollTop() + e.relativePos.y);
        if (e.posx < editorContent.x) {
            const outsideDistance = editorContent.x - e.posx;
            return MouseTarget.createOutsideEditor(mouseColumn, new Position(possibleLineNumber, 1), 'left', outsideDistance);
        }
        if (e.posx > editorContent.x + editorContent.width) {
            const outsideDistance = e.posx - editorContent.x - editorContent.width;
            return MouseTarget.createOutsideEditor(mouseColumn, new Position(possibleLineNumber, model.getLineMaxColumn(possibleLineNumber)), 'right', outsideDistance);
        }
        return null;
    }
    _findMousePosition(e, testEventTarget) {
        const positionOutsideEditor = this._getPositionOutsideEditor(e);
        if (positionOutsideEditor) {
            return positionOutsideEditor;
        }
        const t = this._createMouseTarget(e, testEventTarget);
        const hintedPosition = t.position;
        if (!hintedPosition) {
            return null;
        }
        if (t.type === 8 || t.type === 5) {
            const newPosition = this._helpPositionJumpOverViewZone(t.detail);
            if (newPosition) {
                return MouseTarget.createViewZone(t.type, t.element, t.mouseColumn, newPosition, t.detail);
            }
        }
        return t;
    }
    _helpPositionJumpOverViewZone(viewZoneData) {
        const selectionStart = new Position(this._currentSelection.selectionStartLineNumber, this._currentSelection.selectionStartColumn);
        const positionBefore = viewZoneData.positionBefore;
        const positionAfter = viewZoneData.positionAfter;
        if (positionBefore && positionAfter) {
            if (positionBefore.isBefore(selectionStart)) {
                return positionBefore;
            }
            else {
                return positionAfter;
            }
        }
        return null;
    }
    _dispatchMouse(position, inSelectionMode, revealType) {
        if (!position.position) {
            return;
        }
        this._viewController.dispatchMouse({
            position: position.position,
            mouseColumn: position.mouseColumn,
            startedOnLineNumbers: this._mouseState.startedOnLineNumbers,
            revealType,
            inSelectionMode: inSelectionMode,
            mouseDownCount: this._mouseState.count,
            altKey: this._mouseState.altKey,
            ctrlKey: this._mouseState.ctrlKey,
            metaKey: this._mouseState.metaKey,
            shiftKey: this._mouseState.shiftKey,
            leftButton: this._mouseState.leftButton,
            middleButton: this._mouseState.middleButton,
            onInjectedText: position.type === 6 && position.detail.injectedText !== null
        });
    }
}
class TopBottomDragScrolling extends Disposable {
    constructor(_context, _viewHelper, _mouseTargetFactory, _dispatchMouse) {
        super();
        this._context = _context;
        this._viewHelper = _viewHelper;
        this._mouseTargetFactory = _mouseTargetFactory;
        this._dispatchMouse = _dispatchMouse;
        this._operation = null;
    }
    dispose() {
        super.dispose();
        this.stop();
    }
    start(position, mouseEvent) {
        if (this._operation) {
            this._operation.setPosition(position, mouseEvent);
        }
        else {
            this._operation = new TopBottomDragScrollingOperation(this._context, this._viewHelper, this._mouseTargetFactory, this._dispatchMouse, position, mouseEvent);
        }
    }
    stop() {
        if (this._operation) {
            this._operation.dispose();
            this._operation = null;
        }
    }
}
class TopBottomDragScrollingOperation extends Disposable {
    constructor(_context, _viewHelper, _mouseTargetFactory, _dispatchMouse, position, mouseEvent) {
        super();
        this._context = _context;
        this._viewHelper = _viewHelper;
        this._mouseTargetFactory = _mouseTargetFactory;
        this._dispatchMouse = _dispatchMouse;
        this._position = position;
        this._mouseEvent = mouseEvent;
        this._lastTime = Date.now();
        this._animationFrameDisposable = dom.scheduleAtNextAnimationFrame(dom.getWindow(mouseEvent.browserEvent), () => this._execute());
    }
    dispose() {
        this._animationFrameDisposable.dispose();
        super.dispose();
    }
    setPosition(position, mouseEvent) {
        this._position = position;
        this._mouseEvent = mouseEvent;
    }
    _tick() {
        const now = Date.now();
        const elapsed = now - this._lastTime;
        this._lastTime = now;
        return elapsed;
    }
    _getScrollSpeed() {
        const lineHeight = this._context.configuration.options.get(69);
        const viewportInLines = this._context.configuration.options.get(148).height / lineHeight;
        const outsideDistanceInLines = this._position.outsideDistance / lineHeight;
        if (outsideDistanceInLines <= 1.5) {
            return Math.max(30, viewportInLines * (1 + outsideDistanceInLines));
        }
        if (outsideDistanceInLines <= 3) {
            return Math.max(60, viewportInLines * (2 + outsideDistanceInLines));
        }
        return Math.max(200, viewportInLines * (7 + outsideDistanceInLines));
    }
    _execute() {
        const lineHeight = this._context.configuration.options.get(69);
        const scrollSpeedInLines = this._getScrollSpeed();
        const elapsed = this._tick();
        const scrollInPixels = scrollSpeedInLines * (elapsed / 1000) * lineHeight;
        const scrollValue = (this._position.outsidePosition === 'above' ? -scrollInPixels : scrollInPixels);
        this._context.viewModel.viewLayout.deltaScrollNow(0, scrollValue);
        this._viewHelper.renderNow();
        const viewportData = this._context.viewLayout.getLinesViewportData();
        const edgeLineNumber = (this._position.outsidePosition === 'above' ? viewportData.startLineNumber : viewportData.endLineNumber);
        let mouseTarget;
        {
            const editorPos = createEditorPagePosition(this._viewHelper.viewDomNode);
            const horizontalScrollbarHeight = this._context.configuration.options.get(148).horizontalScrollbarHeight;
            const pos = new PageCoordinates(this._mouseEvent.pos.x, editorPos.y + editorPos.height - horizontalScrollbarHeight - 0.1);
            const relativePos = createCoordinatesRelativeToEditor(this._viewHelper.viewDomNode, editorPos, pos);
            mouseTarget = this._mouseTargetFactory.createMouseTarget(this._viewHelper.getLastRenderData(), editorPos, pos, relativePos, null);
        }
        if (!mouseTarget.position || mouseTarget.position.lineNumber !== edgeLineNumber) {
            if (this._position.outsidePosition === 'above') {
                mouseTarget = MouseTarget.createOutsideEditor(this._position.mouseColumn, new Position(edgeLineNumber, 1), 'above', this._position.outsideDistance);
            }
            else {
                mouseTarget = MouseTarget.createOutsideEditor(this._position.mouseColumn, new Position(edgeLineNumber, this._context.viewModel.getLineMaxColumn(edgeLineNumber)), 'below', this._position.outsideDistance);
            }
        }
        this._dispatchMouse(mouseTarget, true, 2);
        this._animationFrameDisposable = dom.scheduleAtNextAnimationFrame(dom.getWindow(mouseTarget.element), () => this._execute());
    }
}
class MouseDownState {
    static { this.CLEAR_MOUSE_DOWN_COUNT_TIME = 400; }
    get altKey() { return this._altKey; }
    get ctrlKey() { return this._ctrlKey; }
    get metaKey() { return this._metaKey; }
    get shiftKey() { return this._shiftKey; }
    get leftButton() { return this._leftButton; }
    get middleButton() { return this._middleButton; }
    get startedOnLineNumbers() { return this._startedOnLineNumbers; }
    constructor() {
        this._altKey = false;
        this._ctrlKey = false;
        this._metaKey = false;
        this._shiftKey = false;
        this._leftButton = false;
        this._middleButton = false;
        this._startedOnLineNumbers = false;
        this._lastMouseDownPosition = null;
        this._lastMouseDownPositionEqualCount = 0;
        this._lastMouseDownCount = 0;
        this._lastSetMouseDownCountTime = 0;
        this.isDragAndDrop = false;
    }
    get count() {
        return this._lastMouseDownCount;
    }
    setModifiers(source) {
        this._altKey = source.altKey;
        this._ctrlKey = source.ctrlKey;
        this._metaKey = source.metaKey;
        this._shiftKey = source.shiftKey;
    }
    setStartButtons(source) {
        this._leftButton = source.leftButton;
        this._middleButton = source.middleButton;
    }
    setStartedOnLineNumbers(startedOnLineNumbers) {
        this._startedOnLineNumbers = startedOnLineNumbers;
    }
    trySetCount(setMouseDownCount, newMouseDownPosition) {
        const currentTime = (new Date()).getTime();
        if (currentTime - this._lastSetMouseDownCountTime > MouseDownState.CLEAR_MOUSE_DOWN_COUNT_TIME) {
            setMouseDownCount = 1;
        }
        this._lastSetMouseDownCountTime = currentTime;
        if (setMouseDownCount > this._lastMouseDownCount + 1) {
            setMouseDownCount = this._lastMouseDownCount + 1;
        }
        if (this._lastMouseDownPosition && this._lastMouseDownPosition.equals(newMouseDownPosition)) {
            this._lastMouseDownPositionEqualCount++;
        }
        else {
            this._lastMouseDownPositionEqualCount = 1;
        }
        this._lastMouseDownPosition = newMouseDownPosition;
        this._lastMouseDownCount = Math.min(setMouseDownCount, this._lastMouseDownPositionEqualCount);
    }
}
