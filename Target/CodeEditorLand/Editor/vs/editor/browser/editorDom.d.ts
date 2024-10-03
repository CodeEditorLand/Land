import { StandardMouseEvent } from '../../base/browser/mouseEvent.js';
import { Disposable, IDisposable } from '../../base/common/lifecycle.js';
import { ICodeEditor } from './editorBrowser.js';
import { ThemeColor } from '../../base/common/themables.js';
export declare class PageCoordinates {
    readonly x: number;
    readonly y: number;
    _pageCoordinatesBrand: void;
    constructor(x: number, y: number);
    toClientCoordinates(targetWindow: Window): ClientCoordinates;
}
export declare class ClientCoordinates {
    readonly clientX: number;
    readonly clientY: number;
    _clientCoordinatesBrand: void;
    constructor(clientX: number, clientY: number);
    toPageCoordinates(targetWindow: Window): PageCoordinates;
}
export declare class EditorPagePosition {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
    _editorPagePositionBrand: void;
    constructor(x: number, y: number, width: number, height: number);
}
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
    readonly isFromPointerCapture: boolean;
    readonly pos: PageCoordinates;
    readonly editorPos: EditorPagePosition;
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
