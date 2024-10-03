import { IKeyboardEvent } from './keyboardEvent.js';
import { IMouseEvent } from './mouseEvent.js';
import { AbstractIdleValue, IntervalTimer, IdleDeadline } from '../common/async.js';
import * as event from '../common/event.js';
import * as dompurify from './dompurify/dompurify.js';
import { Disposable, DisposableStore, IDisposable } from '../common/lifecycle.js';
import { URI } from '../common/uri.js';
import { CodeWindow } from './window.js';
export interface IRegisteredCodeWindow {
    readonly window: CodeWindow;
    readonly disposables: DisposableStore;
}
export declare const registerWindow: (window: CodeWindow) => IDisposable, getWindow: (e: Node | UIEvent | undefined | null) => CodeWindow, getDocument: (e: Node | UIEvent | undefined | null) => Document, getWindows: () => Iterable<IRegisteredCodeWindow>, getWindowsCount: () => number, getWindowId: (targetWindow: Window) => number, getWindowById: {
    (windowId: number): IRegisteredCodeWindow | undefined;
    (windowId: number | undefined, fallbackToMain: true): IRegisteredCodeWindow;
}, hasWindow: (windowId: number) => boolean, onDidRegisterWindow: event.Event<IRegisteredCodeWindow>, onWillUnregisterWindow: event.Event<CodeWindow>, onDidUnregisterWindow: event.Event<CodeWindow>;
export declare function clearNode(node: HTMLElement): void;
export declare function addDisposableListener<K extends keyof GlobalEventHandlersEventMap>(node: EventTarget, type: K, handler: (event: GlobalEventHandlersEventMap[K]) => void, useCapture?: boolean): IDisposable;
export declare function addDisposableListener(node: EventTarget, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable;
export declare function addDisposableListener(node: EventTarget, type: string, handler: (event: any) => void, options: AddEventListenerOptions): IDisposable;
export interface IAddStandardDisposableListenerSignature {
    (node: HTMLElement, type: 'click', handler: (event: IMouseEvent) => void, useCapture?: boolean): IDisposable;
    (node: HTMLElement, type: 'mousedown', handler: (event: IMouseEvent) => void, useCapture?: boolean): IDisposable;
    (node: HTMLElement, type: 'keydown', handler: (event: IKeyboardEvent) => void, useCapture?: boolean): IDisposable;
    (node: HTMLElement, type: 'keypress', handler: (event: IKeyboardEvent) => void, useCapture?: boolean): IDisposable;
    (node: HTMLElement, type: 'keyup', handler: (event: IKeyboardEvent) => void, useCapture?: boolean): IDisposable;
    (node: HTMLElement, type: 'pointerdown', handler: (event: PointerEvent) => void, useCapture?: boolean): IDisposable;
    (node: HTMLElement, type: 'pointermove', handler: (event: PointerEvent) => void, useCapture?: boolean): IDisposable;
    (node: HTMLElement, type: 'pointerup', handler: (event: PointerEvent) => void, useCapture?: boolean): IDisposable;
    (node: HTMLElement, type: string, handler: (event: any) => void, useCapture?: boolean): IDisposable;
}
export declare const addStandardDisposableListener: IAddStandardDisposableListenerSignature;
export declare const addStandardDisposableGenericMouseDownListener: (node: HTMLElement, handler: (event: any) => void, useCapture?: boolean) => IDisposable;
export declare const addStandardDisposableGenericMouseUpListener: (node: HTMLElement, handler: (event: any) => void, useCapture?: boolean) => IDisposable;
export declare function addDisposableGenericMouseDownListener(node: EventTarget, handler: (event: any) => void, useCapture?: boolean): IDisposable;
export declare function addDisposableGenericMouseMoveListener(node: EventTarget, handler: (event: any) => void, useCapture?: boolean): IDisposable;
export declare function addDisposableGenericMouseUpListener(node: EventTarget, handler: (event: any) => void, useCapture?: boolean): IDisposable;
export declare function runWhenWindowIdle(targetWindow: Window | typeof globalThis, callback: (idle: IdleDeadline) => void, timeout?: number): IDisposable;
export declare class WindowIdleValue<T> extends AbstractIdleValue<T> {
    constructor(targetWindow: Window | typeof globalThis, executor: () => T);
}
export declare let runAtThisOrScheduleAtNextAnimationFrame: (targetWindow: Window, runner: () => void, priority?: number) => IDisposable;
export declare let scheduleAtNextAnimationFrame: (targetWindow: Window, runner: () => void, priority?: number) => IDisposable;
export declare function disposableWindowInterval(targetWindow: Window, handler: () => void | boolean | Promise<unknown>, interval: number, iterations?: number): IDisposable;
export declare class WindowIntervalTimer extends IntervalTimer {
    private readonly defaultTarget?;
    constructor(node?: Node);
    cancelAndSet(runner: () => void, interval: number, targetWindow?: Window & typeof globalThis): void;
}
export declare function measure(targetWindow: Window, callback: () => void): IDisposable;
export declare function modify(targetWindow: Window, callback: () => void): IDisposable;
export interface IEventMerger<R, E> {
    (lastEvent: R | null, currentEvent: E): R;
}
export declare function addDisposableThrottledListener<R, E extends Event = Event>(node: any, type: string, handler: (event: R) => void, eventMerger?: IEventMerger<R, E>, minimumTimeMs?: number): IDisposable;
export declare function getComputedStyle(el: HTMLElement): CSSStyleDeclaration;
export declare function getClientArea(element: HTMLElement, fallback?: HTMLElement): Dimension;
export interface IDimension {
    readonly width: number;
    readonly height: number;
}
export declare class Dimension implements IDimension {
    readonly width: number;
    readonly height: number;
    static readonly None: Dimension;
    constructor(width: number, height: number);
    with(width?: number, height?: number): Dimension;
    static is(obj: unknown): obj is IDimension;
    static lift(obj: IDimension): Dimension;
    static equals(a: Dimension | undefined, b: Dimension | undefined): boolean;
}
export interface IDomPosition {
    readonly left: number;
    readonly top: number;
}
export declare function getTopLeftOffset(element: HTMLElement): IDomPosition;
export interface IDomNodePagePosition {
    left: number;
    top: number;
    width: number;
    height: number;
}
export declare function size(element: HTMLElement, width: number | null, height: number | null): void;
export declare function position(element: HTMLElement, top: number, right?: number, bottom?: number, left?: number, position?: string): void;
export declare function getDomNodePagePosition(domNode: HTMLElement): IDomNodePagePosition;
export declare function getDomNodeZoomLevel(domNode: HTMLElement): number;
export declare function getTotalWidth(element: HTMLElement): number;
export declare function getContentWidth(element: HTMLElement): number;
export declare function getTotalScrollWidth(element: HTMLElement): number;
export declare function getContentHeight(element: HTMLElement): number;
export declare function getTotalHeight(element: HTMLElement): number;
export declare function getLargestChildWidth(parent: HTMLElement, children: HTMLElement[]): number;
export declare function isAncestor(testChild: Node | null, testAncestor: Node | null): boolean;
export declare function setParentFlowTo(fromChildElement: HTMLElement, toParentElement: Element): void;
export declare function isAncestorUsingFlowTo(testChild: Node, testAncestor: Node): boolean;
export declare function findParentWithClass(node: HTMLElement, clazz: string, stopAtClazzOrNode?: string | HTMLElement): HTMLElement | null;
export declare function hasParentWithClass(node: HTMLElement, clazz: string, stopAtClazzOrNode?: string | HTMLElement): boolean;
export declare function isShadowRoot(node: Node): node is ShadowRoot;
export declare function isInShadowDOM(domNode: Node): boolean;
export declare function getShadowRoot(domNode: Node): ShadowRoot | null;
export declare function getActiveElement(): Element | null;
export declare function isActiveElement(element: Element): boolean;
export declare function isAncestorOfActiveElement(ancestor: Element): boolean;
export declare function isActiveDocument(element: Element): boolean;
export declare function getActiveDocument(): Document;
export declare function getActiveWindow(): CodeWindow;
export declare function isGlobalStylesheet(node: Node): boolean;
export declare function createStyleSheet2(): WrappedStyleElement;
declare class WrappedStyleElement {
    private _currentCssStyle;
    private _styleSheet;
    setStyle(cssStyle: string): void;
    dispose(): void;
}
export declare function createStyleSheet(container?: HTMLElement, beforeAppend?: (style: HTMLStyleElement) => void, disposableStore?: DisposableStore): HTMLStyleElement;
export declare function cloneGlobalStylesheets(targetWindow: Window): IDisposable;
interface IMutationObserver {
    users: number;
    readonly observer: MutationObserver;
    readonly onDidMutate: event.Event<MutationRecord[]>;
}
export declare const sharedMutationObserver: {
    readonly mutationObservers: Map<Node, Map<number, IMutationObserver>>;
    observe(target: Node, disposables: DisposableStore, options?: MutationObserverInit): event.Event<MutationRecord[]>;
};
export declare function createMetaElement(container?: HTMLElement): HTMLMetaElement;
export declare function createLinkElement(container?: HTMLElement): HTMLLinkElement;
export declare function createCSSRule(selector: string, cssText: string, style?: HTMLStyleElement): void;
export declare function removeCSSRulesContainingSelector(ruleName: string, style?: HTMLStyleElement): void;
export declare function isHTMLElement(e: unknown): e is HTMLElement;
export declare function isHTMLAnchorElement(e: unknown): e is HTMLAnchorElement;
export declare function isHTMLSpanElement(e: unknown): e is HTMLSpanElement;
export declare function isHTMLTextAreaElement(e: unknown): e is HTMLTextAreaElement;
export declare function isHTMLInputElement(e: unknown): e is HTMLInputElement;
export declare function isHTMLButtonElement(e: unknown): e is HTMLButtonElement;
export declare function isHTMLDivElement(e: unknown): e is HTMLDivElement;
export declare function isSVGElement(e: unknown): e is SVGElement;
export declare function isMouseEvent(e: unknown): e is MouseEvent;
export declare function isKeyboardEvent(e: unknown): e is KeyboardEvent;
export declare function isPointerEvent(e: unknown): e is PointerEvent;
export declare function isDragEvent(e: unknown): e is DragEvent;
export declare const EventType: {
    readonly CLICK: "click";
    readonly AUXCLICK: "auxclick";
    readonly DBLCLICK: "dblclick";
    readonly MOUSE_UP: "mouseup";
    readonly MOUSE_DOWN: "mousedown";
    readonly MOUSE_OVER: "mouseover";
    readonly MOUSE_MOVE: "mousemove";
    readonly MOUSE_OUT: "mouseout";
    readonly MOUSE_ENTER: "mouseenter";
    readonly MOUSE_LEAVE: "mouseleave";
    readonly MOUSE_WHEEL: "wheel";
    readonly POINTER_UP: "pointerup";
    readonly POINTER_DOWN: "pointerdown";
    readonly POINTER_MOVE: "pointermove";
    readonly POINTER_LEAVE: "pointerleave";
    readonly CONTEXT_MENU: "contextmenu";
    readonly WHEEL: "wheel";
    readonly KEY_DOWN: "keydown";
    readonly KEY_PRESS: "keypress";
    readonly KEY_UP: "keyup";
    readonly LOAD: "load";
    readonly BEFORE_UNLOAD: "beforeunload";
    readonly UNLOAD: "unload";
    readonly PAGE_SHOW: "pageshow";
    readonly PAGE_HIDE: "pagehide";
    readonly PASTE: "paste";
    readonly ABORT: "abort";
    readonly ERROR: "error";
    readonly RESIZE: "resize";
    readonly SCROLL: "scroll";
    readonly FULLSCREEN_CHANGE: "fullscreenchange";
    readonly WK_FULLSCREEN_CHANGE: "webkitfullscreenchange";
    readonly SELECT: "select";
    readonly CHANGE: "change";
    readonly SUBMIT: "submit";
    readonly RESET: "reset";
    readonly FOCUS: "focus";
    readonly FOCUS_IN: "focusin";
    readonly FOCUS_OUT: "focusout";
    readonly BLUR: "blur";
    readonly INPUT: "input";
    readonly STORAGE: "storage";
    readonly DRAG_START: "dragstart";
    readonly DRAG: "drag";
    readonly DRAG_ENTER: "dragenter";
    readonly DRAG_LEAVE: "dragleave";
    readonly DRAG_OVER: "dragover";
    readonly DROP: "drop";
    readonly DRAG_END: "dragend";
    readonly ANIMATION_START: "animationstart" | "webkitAnimationStart";
    readonly ANIMATION_END: "animationend" | "webkitAnimationEnd";
    readonly ANIMATION_ITERATION: "animationiteration" | "webkitAnimationIteration";
};
export interface EventLike {
    preventDefault(): void;
    stopPropagation(): void;
}
export declare function isEventLike(obj: unknown): obj is EventLike;
export declare const EventHelper: {
    stop: <T extends EventLike>(e: T, cancelBubble?: boolean) => T;
};
export interface IFocusTracker extends Disposable {
    readonly onDidFocus: event.Event<void>;
    readonly onDidBlur: event.Event<void>;
    refreshState(): void;
}
export declare function saveParentsScrollTop(node: Element): number[];
export declare function restoreParentsScrollTop(node: Element, state: number[]): void;
export declare function trackFocus(element: HTMLElement | Window): IFocusTracker;
export declare function after<T extends Node>(sibling: HTMLElement, child: T): T;
export declare function append<T extends Node>(parent: HTMLElement, child: T): T;
export declare function append<T extends Node>(parent: HTMLElement, ...children: (T | string)[]): void;
export declare function prepend<T extends Node>(parent: HTMLElement, child: T): T;
export declare function reset(parent: HTMLElement, ...children: Array<Node | string>): void;
export declare enum Namespace {
    HTML = "http://www.w3.org/1999/xhtml",
    SVG = "http://www.w3.org/2000/svg"
}
export declare function $<T extends HTMLElement>(description: string, attrs?: {
    [key: string]: any;
}, ...children: Array<Node | string>): T;
export declare namespace $ {
    var SVG: <T extends SVGElement>(description: string, attrs?: {
        [key: string]: any;
    }, ...children: Array<Node | string>) => T;
}
export declare function join(nodes: Node[], separator: Node | string): Node[];
export declare function setVisibility(visible: boolean, ...elements: HTMLElement[]): void;
export declare function show(...elements: HTMLElement[]): void;
export declare function hide(...elements: HTMLElement[]): void;
export declare function removeTabIndexAndUpdateFocus(node: HTMLElement): void;
export declare function finalHandler<T extends Event>(fn: (event: T) => unknown): (event: T) => unknown;
export declare function domContentLoaded(targetWindow: Window): Promise<void>;
export declare function computeScreenAwareSize(window: Window, cssPx: number): number;
export declare function windowOpenNoOpener(url: string): void;
export declare function windowOpenPopup(url: string): void;
export declare function windowOpenWithSuccess(url: string, noOpener?: boolean): boolean;
export declare function animate(targetWindow: Window, fn: () => void): IDisposable;
export declare function asCSSUrl(uri: URI | null | undefined): string;
export declare function asCSSPropertyValue(value: string): string;
export declare function asCssValueWithDefault(cssPropertyValue: string | undefined, dflt: string): string;
export declare function triggerDownload(dataOrUri: Uint8Array | URI, name: string): void;
export declare function triggerUpload(): Promise<FileList | undefined>;
export declare enum DetectedFullscreenMode {
    DOCUMENT = 1,
    BROWSER = 2
}
export interface IDetectedFullscreen {
    mode: DetectedFullscreenMode;
    guess: boolean;
}
export declare function detectFullscreen(targetWindow: Window): IDetectedFullscreen | null;
export declare function hookDomPurifyHrefAndSrcSanitizer(allowedProtocols: readonly string[], allowDataImages?: boolean): IDisposable;
export declare const basicMarkupHtmlTags: readonly string[];
export declare function safeInnerHtml(node: HTMLElement, value: string, extraDomPurifyConfig?: dompurify.Config): void;
export declare function multibyteAwareBtoa(str: string): string;
type ModifierKey = 'alt' | 'ctrl' | 'shift' | 'meta';
export interface IModifierKeyStatus {
    altKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    lastKeyPressed?: ModifierKey;
    lastKeyReleased?: ModifierKey;
    event?: KeyboardEvent;
}
export declare class ModifierKeyEmitter extends event.Emitter<IModifierKeyStatus> {
    private readonly _subscriptions;
    private _keyStatus;
    private static instance;
    private constructor();
    private registerListeners;
    get keyStatus(): IModifierKeyStatus;
    get isModifierPressed(): boolean;
    resetKeyStatus(): void;
    private doResetKeyStatus;
    static getInstance(): ModifierKeyEmitter;
    dispose(): void;
}
export declare function getCookieValue(name: string): string | undefined;
export interface IDragAndDropObserverCallbacks {
    readonly onDragEnter?: (e: DragEvent) => void;
    readonly onDragLeave?: (e: DragEvent) => void;
    readonly onDrop?: (e: DragEvent) => void;
    readonly onDragEnd?: (e: DragEvent) => void;
    readonly onDragStart?: (e: DragEvent) => void;
    readonly onDrag?: (e: DragEvent) => void;
    readonly onDragOver?: (e: DragEvent, dragDuration: number) => void;
}
export declare class DragAndDropObserver extends Disposable {
    private readonly element;
    private readonly callbacks;
    private counter;
    private dragStartTime;
    constructor(element: HTMLElement, callbacks: IDragAndDropObserverCallbacks);
    private registerListeners;
}
type HTMLElementAttributeKeys<T> = Partial<{
    [K in keyof T]: T[K] extends Function ? never : T[K] extends object ? HTMLElementAttributeKeys<T[K]> : T[K];
}>;
type ElementAttributes<T> = HTMLElementAttributeKeys<T> & Record<string, any>;
type RemoveHTMLElement<T> = T extends HTMLElement ? never : T;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type ArrayToObj<T extends readonly any[]> = UnionToIntersection<RemoveHTMLElement<T[number]>>;
type HHTMLElementTagNameMap = HTMLElementTagNameMap & {
    '': HTMLDivElement;
};
type TagToElement<T> = T extends `${infer TStart}#${string}` ? TStart extends keyof HHTMLElementTagNameMap ? HHTMLElementTagNameMap[TStart] : HTMLElement : T extends `${infer TStart}.${string}` ? TStart extends keyof HHTMLElementTagNameMap ? HHTMLElementTagNameMap[TStart] : HTMLElement : T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : HTMLElement;
type TagToElementAndId<TTag> = TTag extends `${infer TTag}@${infer TId}` ? {
    element: TagToElement<TTag>;
    id: TId;
} : {
    element: TagToElement<TTag>;
    id: 'root';
};
type TagToRecord<TTag> = TagToElementAndId<TTag> extends {
    element: infer TElement;
    id: infer TId;
} ? Record<(TId extends string ? TId : never) | 'root', TElement> : never;
type Child = HTMLElement | string | Record<string, HTMLElement>;
export declare function h<TTag extends string>(tag: TTag): TagToRecord<TTag> extends infer Y ? {
    [TKey in keyof Y]: Y[TKey];
} : never;
export declare function h<TTag extends string, T extends Child[]>(tag: TTag, children: [...T]): (ArrayToObj<T> & TagToRecord<TTag>) extends infer Y ? {
    [TKey in keyof Y]: Y[TKey];
} : never;
export declare function h<TTag extends string>(tag: TTag, attributes: Partial<ElementAttributes<TagToElement<TTag>>>): TagToRecord<TTag> extends infer Y ? {
    [TKey in keyof Y]: Y[TKey];
} : never;
export declare function h<TTag extends string, T extends Child[]>(tag: TTag, attributes: Partial<ElementAttributes<TagToElement<TTag>>>, children: [...T]): (ArrayToObj<T> & TagToRecord<TTag>) extends infer Y ? {
    [TKey in keyof Y]: Y[TKey];
} : never;
export declare function svgElem<TTag extends string>(tag: TTag): TagToRecord<TTag> extends infer Y ? {
    [TKey in keyof Y]: Y[TKey];
} : never;
export declare function svgElem<TTag extends string, T extends Child[]>(tag: TTag, children: [...T]): (ArrayToObj<T> & TagToRecord<TTag>) extends infer Y ? {
    [TKey in keyof Y]: Y[TKey];
} : never;
export declare function svgElem<TTag extends string>(tag: TTag, attributes: Partial<ElementAttributes<TagToElement<TTag>>>): TagToRecord<TTag> extends infer Y ? {
    [TKey in keyof Y]: Y[TKey];
} : never;
export declare function svgElem<TTag extends string, T extends Child[]>(tag: TTag, attributes: Partial<ElementAttributes<TagToElement<TTag>>>, children: [...T]): (ArrayToObj<T> & TagToRecord<TTag>) extends infer Y ? {
    [TKey in keyof Y]: Y[TKey];
} : never;
export declare function copyAttributes(from: Element, to: Element, filter?: string[]): void;
export declare function trackAttributes(from: Element, to: Element, filter?: string[]): IDisposable;
export declare function isEditableElement(element: Element): boolean;
export declare class SafeTriangle {
    private readonly originX;
    private readonly originY;
    private points;
    constructor(originX: number, originY: number, target: HTMLElement);
    contains(x: number, y: number): boolean;
}
export {};
