import { GestureEvent } from './touch.js';
import { Event as BaseEvent } from '../common/event.js';
import { IDisposable } from '../common/lifecycle.js';
export type EventHandler = HTMLElement | HTMLDocument | Window;
export interface IDomEvent {
    <K extends keyof HTMLElementEventMap>(element: EventHandler, type: K, useCapture?: boolean): BaseEvent<HTMLElementEventMap[K]>;
    (element: EventHandler, type: string, useCapture?: boolean): BaseEvent<unknown>;
}
export interface DOMEventMap extends HTMLElementEventMap, DocumentEventMap, WindowEventMap {
    '-monaco-gesturetap': GestureEvent;
    '-monaco-gesturechange': GestureEvent;
    '-monaco-gesturestart': GestureEvent;
    '-monaco-gesturesend': GestureEvent;
    '-monaco-gesturecontextmenu': GestureEvent;
    'compositionstart': CompositionEvent;
    'compositionupdate': CompositionEvent;
    'compositionend': CompositionEvent;
}
export declare class DomEmitter<K extends keyof DOMEventMap> implements IDisposable {
    private emitter;
    get event(): BaseEvent<DOMEventMap[K]>;
    constructor(element: Window & typeof globalThis, type: WindowEventMap, useCapture?: boolean);
    constructor(element: Document, type: DocumentEventMap, useCapture?: boolean);
    constructor(element: EventHandler, type: K, useCapture?: boolean);
    dispose(): void;
}
