import { StandardMouseEvent } from '../../base/browser/mouseEvent.js';
import { Disposable, IDisposable } from '../../base/common/lifecycle.js';
import { ICodeEditor } from './editorBrowser.js';
import { ThemeColor } from '../../base/common/themables.js';
/**
 * Coordinates relative to the whole document (e.g. mouse event's pageX and pageY)
 */
export declare class PageCoordinates {
    readonly x: number;
    readonly y: number;
    _pageCoordinatesBrand: void;
    constructor(x: number, y: number);
    toClientCoordinates(targetWindow: Window): ClientCoordinates;
}
/**
 * Coordinates within the application's client area (i.e. origin is document's scroll position).
 *
 * For example, clicking in the top-left corner of the client area will
 * always result in a mouse event with a client.x value of 0, regardless
 * of whether the page is scrolled horizontally.
 */
export declare class ClientCoordinates {
    readonly clientX: number;
    readonly clientY: number;
    _clientCoordinatesBrand: void;
    constructor(clientX: number, clientY: number);
    toPageCoordinates(targetWindow: Window): PageCoordinates;
}
/**
 * The position of the editor in the page.
 */
export declare class EditorPagePosition {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    _editorPagePositionBrand: void;
    constructor(x: number, y: number, width: number, height: number);
}
/**
 * Coordinates relative to the the (top;left) of the editor that can be used safely with other internal editor metrics.
 * **NOTE**: This position is obtained by taking page coordinates and transforming them relative to the
 * editor's (top;left) position in a way in which scale transformations are taken into account.
 * **NOTE**: These coordinates could be negative if the mouse position is outside the editor.
 */
export declare class CoordinatesRelativeToEditor {
    readonly x: number;
    readonly y: number;
    _positionRelativeToEditorBrand: void;
    constructor(x: number, y: number);
}
export declare function createEditorPagePosition(editorViewDomNode: HTMLElement): EditorPagePosition;
export declare function createCoordinatesRelativeToEditor(editorViewDomNode: HTMLElement, editorPagePosition: EditorPagePosition, pos: PageCoordinates): CoordinatesRelativeToEditor;
export declare class EditorMouseEvent extends StandardMouseEvent {
    _editorMouseEventBrand: void;
    /**
     * If the event is a result of using `setPointerCapture`, the `event.target`
     * does not necessarily reflect the position in the editor.
     */
    readonly isFromPointerCapture: boolean;
    /**
     * Coordinates relative to the whole document.
     */
    readonly pos: PageCoordinates;
    /**
     * Editor's coordinates relative to the whole document.
     */
    readonly editorPos: EditorPagePosition;
    /**
     * Coordinates relative to the (top;left) of the editor.
     * *NOTE*: These coordinates are preferred because they take into account transformations applied to the editor.
     * *NOTE*: These coordinates could be negative if the mouse position is outside the editor.
     */
    readonly relativePos: CoordinatesRelativeToEditor;
    constructor(e: MouseEvent, isFromPointerCapture: boolean, editorViewDomNode: HTMLElement);
}
export declare class EditorMouseEventFactory {
    private readonly _editorViewDomNode;
    constructor(editorViewDomNode: HTMLElement);
    private _create;
    onContextMenu(target: HTMLElement, callback: (e: EditorMouseEvent) => void): IDisposable;
    onMouseUp(target: HTMLElement, callback: (e: EditorMouseEvent) => void): IDisposable;
    onMouseDown(target: HTMLElement, callback: (e: EditorMouseEvent) => void): IDisposable;
    onPointerDown(target: HTMLElement, callback: (e: EditorMouseEvent, pointerId: number) => void): IDisposable;
    onMouseLeave(target: HTMLElement, callback: (e: EditorMouseEvent) => void): IDisposable;
    onMouseMove(target: HTMLElement, callback: (e: EditorMouseEvent) => void): IDisposable;
}
export declare class EditorPointerEventFactory {
    private readonly _editorViewDomNode;
    constructor(editorViewDomNode: HTMLElement);
    private _create;
    onPointerUp(target: HTMLElement, callback: (e: EditorMouseEvent) => void): IDisposable;
    onPointerDown(target: HTMLElement, callback: (e: EditorMouseEvent, pointerId: number) => void): IDisposable;
    onPointerLeave(target: HTMLElement, callback: (e: EditorMouseEvent) => void): IDisposable;
    onPointerMove(target: HTMLElement, callback: (e: EditorMouseEvent) => void): IDisposable;
}
export declare class GlobalEditorPointerMoveMonitor extends Disposable {
    private readonly _editorViewDomNode;
    private readonly _globalPointerMoveMonitor;
    private _keydownListener;
    constructor(editorViewDomNode: HTMLElement);
    startMonitoring(initialElement: Element, pointerId: number, initialButtons: number, pointerMoveCallback: (e: EditorMouseEvent) => void, onStopCallback: (browserEvent?: PointerEvent | KeyboardEvent) => void): void;
    stopMonitoring(): void;
}
/**
 * A helper to create dynamic css rules, bound to a class name.
 * Rules are reused.
 * Reference counting and delayed garbage collection ensure that no rules leak.
*/
export declare class DynamicCssRules {
    private readonly _editor;
    private static _idPool;
    private readonly _instanceId;
    private _counter;
    private readonly _rules;
    private readonly _garbageCollectionScheduler;
    constructor(_editor: ICodeEditor);
    createClassNameRef(options: CssProperties): ClassNameReference;
    private getOrCreateRule;
    private computeUniqueKey;
    private garbageCollect;
}
export interface ClassNameReference extends IDisposable {
    className: string;
}
export interface CssProperties {
    border?: string;
    borderColor?: string | ThemeColor;
    borderRadius?: string;
    fontStyle?: string;
    fontWeight?: string;
    fontSize?: string;
    fontFamily?: string;
    unicodeBidi?: string;
    textDecoration?: string;
    color?: string | ThemeColor;
    backgroundColor?: string | ThemeColor;
    opacity?: string;
    verticalAlign?: string;
    cursor?: string;
    margin?: string;
    padding?: string;
    width?: string;
    height?: string;
    display?: string;
}
