import { CancellationToken } from './cancellation.js';
import { DisposableStore, IDisposable } from './lifecycle.js';
import { LinkedList } from './linkedList.js';
import { IObservable } from './observable.js';
import { MicrotaskDelay } from './symbols.js';
export interface Event<T> {
    (listener: (e: T) => unknown, thisArgs?: any, disposables?: IDisposable[] | DisposableStore): IDisposable;
}
export declare namespace Event {
    const None: Event<any>;
    function defer(event: Event<unknown>, disposable?: DisposableStore): Event<void>;
    function once<T>(event: Event<T>): Event<T>;
    function onceIf<T>(event: Event<T>, condition: (e: T) => boolean): Event<T>;
    function map<I, O>(event: Event<I>, map: (i: I) => O, disposable?: DisposableStore): Event<O>;
    function forEach<I>(event: Event<I>, each: (i: I) => void, disposable?: DisposableStore): Event<I>;
    function filter<T, U>(event: Event<T | U>, filter: (e: T | U) => e is T, disposable?: DisposableStore): Event<T>;
    function filter<T>(event: Event<T>, filter: (e: T) => boolean, disposable?: DisposableStore): Event<T>;
    function filter<T, R>(event: Event<T | R>, filter: (e: T | R) => e is R, disposable?: DisposableStore): Event<R>;
    function signal<T>(event: Event<T>): Event<void>;
    function any<T>(...events: Event<T>[]): Event<T>;
    function any(...events: Event<any>[]): Event<void>;
    function reduce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, initial?: O, disposable?: DisposableStore): Event<O>;
    function debounce<T>(event: Event<T>, merge: (last: T | undefined, event: T) => T, delay?: number | typeof MicrotaskDelay, leading?: boolean, flushOnListenerRemove?: boolean, leakWarningThreshold?: number, disposable?: DisposableStore): Event<T>;
    function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay?: number | typeof MicrotaskDelay, leading?: boolean, flushOnListenerRemove?: boolean, leakWarningThreshold?: number, disposable?: DisposableStore): Event<O>;
    function accumulate<T>(event: Event<T>, delay?: number, disposable?: DisposableStore): Event<T[]>;
    function latch<T>(event: Event<T>, equals?: (a: T, b: T) => boolean, disposable?: DisposableStore): Event<T>;
    function split<T, U>(event: Event<T | U>, isT: (e: T | U) => e is T, disposable?: DisposableStore): [Event<T>, Event<U>];
    function buffer<T>(event: Event<T>, flushAfterTimeout?: boolean, _buffer?: T[], disposable?: DisposableStore): Event<T>;
    function chain<T, R>(event: Event<T>, sythensize: ($: IChainableSythensis<T>) => IChainableSythensis<R>): Event<R>;
    interface IChainableSythensis<T> {
        map<O>(fn: (i: T) => O): IChainableSythensis<O>;
        forEach(fn: (i: T) => void): IChainableSythensis<T>;
        filter<R extends T>(fn: (e: T) => e is R): IChainableSythensis<R>;
        filter(fn: (e: T) => boolean): IChainableSythensis<T>;
        reduce<R>(merge: (last: R, event: T) => R, initial: R): IChainableSythensis<R>;
        reduce<R>(merge: (last: R | undefined, event: T) => R): IChainableSythensis<R>;
        latch(equals?: (a: T, b: T) => boolean): IChainableSythensis<T>;
    }
    interface NodeEventEmitter {
        on(event: string | symbol, listener: Function): unknown;
        removeListener(event: string | symbol, listener: Function): unknown;
    }
    function fromNodeEventEmitter<T>(emitter: NodeEventEmitter, eventName: string, map?: (...args: any[]) => T): Event<T>;
    interface DOMEventEmitter {
        addEventListener(event: string | symbol, listener: Function): void;
        removeEventListener(event: string | symbol, listener: Function): void;
    }
    function fromDOMEventEmitter<T>(emitter: DOMEventEmitter, eventName: string, map?: (...args: any[]) => T): Event<T>;
    function toPromise<T>(event: Event<T>): Promise<T>;
    function fromPromise<T>(promise: Promise<T>): Event<T | undefined>;
    function forward<T>(from: Event<T>, to: Emitter<T>): IDisposable;
    function runAndSubscribe<T>(event: Event<T>, handler: (e: T) => unknown, initial: T): IDisposable;
    function runAndSubscribe<T>(event: Event<T>, handler: (e: T | undefined) => unknown): IDisposable;
    function fromObservable<T>(obs: IObservable<T, any>, store?: DisposableStore): Event<T>;
    function fromObservableLight(observable: IObservable<any>): Event<void>;
}
export interface EmitterOptions {
    onWillAddFirstListener?: Function;
    onDidAddFirstListener?: Function;
    onDidAddListener?: Function;
    onDidRemoveLastListener?: Function;
    onWillRemoveListener?: Function;
    onListenerError?: (e: any) => void;
    leakWarningThreshold?: number;
    deliveryQueue?: EventDeliveryQueue;
    _profName?: string;
}
export declare class EventProfiling {
    static readonly all: Set<EventProfiling>;
    private static _idPool;
    readonly name: string;
    listenerCount: number;
    invocationCount: number;
    elapsedOverall: number;
    durations: number[];
    private _stopWatch?;
    constructor(name: string);
    start(listenerCount: number): void;
    stop(): void;
}
export declare function setGlobalLeakWarningThreshold(n: number): IDisposable;
declare class Stacktrace {
    readonly value: string;
    static create(): Stacktrace;
    private constructor();
    print(): void;
}
export declare class ListenerLeakError extends Error {
    constructor(message: string, stack: string);
}
export declare class ListenerRefusalError extends Error {
    constructor(message: string, stack: string);
}
declare class UniqueContainer<T> {
    readonly value: T;
    stack?: Stacktrace;
    id: number;
    constructor(value: T);
}
type ListenerContainer<T> = UniqueContainer<(data: T) => void>;
type ListenerOrListeners<T> = (ListenerContainer<T> | undefined)[] | ListenerContainer<T>;
export declare class Emitter<T> {
    private readonly _options?;
    private readonly _leakageMon?;
    private readonly _perfMon?;
    private _disposed?;
    private _event?;
    protected _listeners?: ListenerOrListeners<T>;
    private _deliveryQueue?;
    protected _size: number;
    constructor(options?: EmitterOptions);
    dispose(): void;
    get event(): Event<T>;
    private _removeListener;
    private _deliver;
    private _deliverQueue;
    fire(event: T): void;
    hasListeners(): boolean;
}
export interface EventDeliveryQueue {
    _isEventDeliveryQueue: true;
}
export declare const createEventDeliveryQueue: () => EventDeliveryQueue;
export interface IWaitUntil {
    token: CancellationToken;
    waitUntil(thenable: Promise<unknown>): void;
}
export type IWaitUntilData<T> = Omit<Omit<T, 'waitUntil'>, 'token'>;
export declare class AsyncEmitter<T extends IWaitUntil> extends Emitter<T> {
    private _asyncDeliveryQueue?;
    fireAsync(data: IWaitUntilData<T>, token: CancellationToken, promiseJoin?: (p: Promise<unknown>, listener: Function) => Promise<unknown>): Promise<void>;
}
export declare class PauseableEmitter<T> extends Emitter<T> {
    private _isPaused;
    protected _eventQueue: LinkedList<T>;
    private _mergeFn?;
    get isPaused(): boolean;
    constructor(options?: EmitterOptions & {
        merge?: (input: T[]) => T;
    });
    pause(): void;
    resume(): void;
    fire(event: T): void;
}
export declare class DebounceEmitter<T> extends PauseableEmitter<T> {
    private readonly _delay;
    private _handle;
    constructor(options: EmitterOptions & {
        merge: (input: T[]) => T;
        delay?: number;
    });
    fire(event: T): void;
}
export declare class MicrotaskEmitter<T> extends Emitter<T> {
    private _queuedEvents;
    private _mergeFn?;
    constructor(options?: EmitterOptions & {
        merge?: (input: T[]) => T;
    });
    fire(event: T): void;
}
export declare class EventMultiplexer<T> implements IDisposable {
    private readonly emitter;
    private hasListeners;
    private events;
    constructor();
    get event(): Event<T>;
    add(event: Event<T>): IDisposable;
    private onFirstListenerAdd;
    private onLastListenerRemove;
    private hook;
    private unhook;
    dispose(): void;
}
export interface IDynamicListEventMultiplexer<TEventType> extends IDisposable {
    readonly event: Event<TEventType>;
}
export declare class DynamicListEventMultiplexer<TItem, TEventType> implements IDynamicListEventMultiplexer<TEventType> {
    private readonly _store;
    readonly event: Event<TEventType>;
    constructor(items: TItem[], onAddItem: Event<TItem>, onRemoveItem: Event<TItem>, getEvent: (item: TItem) => Event<TEventType>);
    dispose(): void;
}
export declare class EventBufferer {
    private data;
    wrapEvent<T>(event: Event<T>): Event<T>;
    wrapEvent<T>(event: Event<T>, reduce: (last: T | undefined, event: T) => T): Event<T>;
    wrapEvent<T, O>(event: Event<T>, reduce: (last: O | undefined, event: T) => O, initial: O): Event<O>;
    bufferEvents<R = void>(fn: () => R): R;
}
export declare class Relay<T> implements IDisposable {
    private listening;
    private inputEvent;
    private inputEventListener;
    private readonly emitter;
    readonly event: Event<T>;
    set input(event: Event<T>);
    dispose(): void;
}
export interface IValueWithChangeEvent<T> {
    readonly onDidChange: Event<void>;
    get value(): T;
}
export declare class ValueWithChangeEvent<T> implements IValueWithChangeEvent<T> {
    private _value;
    static const<T>(value: T): IValueWithChangeEvent<T>;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    constructor(_value: T);
    get value(): T;
    set value(value: T);
}
export declare function trackSetChanges<T>(getData: () => ReadonlySet<T>, onDidChangeData: Event<unknown>, handleItem: (d: T) => IDisposable): IDisposable;
export {};
