import { CancellationToken, CancellationTokenSource } from './cancellation.js';
import { Event } from './event.js';
import { Disposable, DisposableStore, IDisposable } from './lifecycle.js';
import { IExtUri } from './resources.js';
import { URI } from './uri.js';
import { MicrotaskDelay } from './symbols.js';
export declare function isThenable<T>(obj: unknown): obj is Promise<T>;
export interface CancelablePromise<T> extends Promise<T> {
    cancel(): void;
}
export declare function createCancelablePromise<T>(callback: (token: CancellationToken) => Promise<T>): CancelablePromise<T>;
export declare function raceCancellation<T>(promise: Promise<T>, token: CancellationToken): Promise<T | undefined>;
export declare function raceCancellation<T>(promise: Promise<T>, token: CancellationToken, defaultValue: T): Promise<T>;
export declare function raceCancellationError<T>(promise: Promise<T>, token: CancellationToken): Promise<T>;
export declare function raceCancellablePromises<T>(cancellablePromises: CancelablePromise<T>[]): Promise<T>;
export declare function raceTimeout<T>(promise: Promise<T>, timeout: number, onTimeout?: () => void): Promise<T | undefined>;
export declare function asPromise<T>(callback: () => T | Thenable<T>): Promise<T>;
export declare function promiseWithResolvers<T>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (err?: any) => void;
};
export interface ITask<T> {
    (): T;
}
export declare class Throttler implements IDisposable {
    private activePromise;
    private queuedPromise;
    private queuedPromiseFactory;
    private isDisposed;
    constructor();
    queue<T>(promiseFactory: ITask<Promise<T>>): Promise<T>;
    dispose(): void;
}
export declare class Sequencer {
    private current;
    queue<T>(promiseTask: ITask<Promise<T>>): Promise<T>;
}
export declare class SequencerByKey<TKey> {
    private promiseMap;
    queue<T>(key: TKey, promiseTask: ITask<Promise<T>>): Promise<T>;
}
export declare class Delayer<T> implements IDisposable {
    defaultDelay: number | typeof MicrotaskDelay;
    private deferred;
    private completionPromise;
    private doResolve;
    private doReject;
    private task;
    constructor(defaultDelay: number | typeof MicrotaskDelay);
    trigger(task: ITask<T | Promise<T>>, delay?: number | typeof MicrotaskDelay): Promise<T>;
    isTriggered(): boolean;
    cancel(): void;
    private cancelTimeout;
    dispose(): void;
}
export declare class ThrottledDelayer<T> {
    private delayer;
    private throttler;
    constructor(defaultDelay: number);
    trigger(promiseFactory: ITask<Promise<T>>, delay?: number): Promise<T>;
    isTriggered(): boolean;
    cancel(): void;
    dispose(): void;
}
export declare class Barrier {
    private _isOpen;
    private _promise;
    private _completePromise;
    constructor();
    isOpen(): boolean;
    open(): void;
    wait(): Promise<boolean>;
}
export declare class AutoOpenBarrier extends Barrier {
    private readonly _timeout;
    constructor(autoOpenTimeMs: number);
    open(): void;
}
export declare function timeout(millis: number): CancelablePromise<void>;
export declare function timeout(millis: number, token: CancellationToken): Promise<void>;
export declare function disposableTimeout(handler: () => void, timeout?: number, store?: DisposableStore): IDisposable;
export declare function sequence<T>(promiseFactories: ITask<Promise<T>>[]): Promise<T[]>;
export declare function first<T>(promiseFactories: ITask<Promise<T>>[], shouldStop?: (t: T) => boolean, defaultValue?: T | null): Promise<T | null>;
export declare function firstParallel<T>(promiseList: Promise<T>[], shouldStop?: (t: T) => boolean, defaultValue?: T | null): Promise<T | null>;
export declare function firstParallel<T, R extends T>(promiseList: Promise<T>[], shouldStop: (t: T) => t is R, defaultValue?: R | null): Promise<R | null>;
export interface ILimiter<T> {
    readonly size: number;
    queue(factory: ITask<Promise<T>>): Promise<T>;
    clear(): void;
}
export declare class Limiter<T> implements ILimiter<T> {
    private _size;
    private _isDisposed;
    private runningPromises;
    private readonly maxDegreeOfParalellism;
    private readonly outstandingPromises;
    private readonly _onDrained;
    constructor(maxDegreeOfParalellism: number);
    whenIdle(): Promise<void>;
    get onDrained(): Event<void>;
    get size(): number;
    queue(factory: ITask<Promise<T>>): Promise<T>;
    private consume;
    private consumed;
    clear(): void;
    dispose(): void;
}
export declare class Queue<T> extends Limiter<T> {
    constructor();
}
export declare class LimitedQueue {
    private readonly sequentializer;
    private tasks;
    queue(factory: ITask<Promise<void>>): Promise<void>;
}
export declare class ResourceQueue implements IDisposable {
    private readonly queues;
    private readonly drainers;
    private drainListeners;
    private drainListenerCount;
    whenDrained(): Promise<void>;
    private isDrained;
    queueSize(resource: URI, extUri?: IExtUri): number;
    queueFor(resource: URI, factory: ITask<Promise<void>>, extUri?: IExtUri): Promise<void>;
    private onDidQueueDrain;
    private releaseDrainers;
    dispose(): void;
}
export declare class TimeoutTimer implements IDisposable {
    private _token;
    private _isDisposed;
    constructor();
    constructor(runner: () => void, timeout: number);
    dispose(): void;
    cancel(): void;
    cancelAndSet(runner: () => void, timeout: number): void;
    setIfNotSet(runner: () => void, timeout: number): void;
}
export declare class IntervalTimer implements IDisposable {
    private disposable;
    private isDisposed;
    cancel(): void;
    cancelAndSet(runner: () => void, interval: number, context?: typeof globalThis): void;
    dispose(): void;
}
export declare class RunOnceScheduler implements IDisposable {
    protected runner: ((...args: unknown[]) => void) | null;
    private timeoutToken;
    private timeout;
    private timeoutHandler;
    constructor(runner: (...args: any[]) => void, delay: number);
    dispose(): void;
    cancel(): void;
    schedule(delay?: number): void;
    get delay(): number;
    set delay(value: number);
    isScheduled(): boolean;
    flush(): void;
    private onTimeout;
    protected doRun(): void;
}
export declare class ProcessTimeRunOnceScheduler {
    private runner;
    private timeout;
    private counter;
    private intervalToken;
    private intervalHandler;
    constructor(runner: () => void, delay: number);
    dispose(): void;
    cancel(): void;
    schedule(delay?: number): void;
    isScheduled(): boolean;
    private onInterval;
}
export declare class RunOnceWorker<T> extends RunOnceScheduler {
    private units;
    constructor(runner: (units: T[]) => void, timeout: number);
    work(unit: T): void;
    protected doRun(): void;
    dispose(): void;
}
export interface IThrottledWorkerOptions {
    maxWorkChunkSize: number;
    maxBufferedWork: number | undefined;
    throttleDelay: number;
}
export declare class ThrottledWorker<T> extends Disposable {
    private options;
    private readonly handler;
    private readonly pendingWork;
    private readonly throttler;
    private disposed;
    constructor(options: IThrottledWorkerOptions, handler: (units: T[]) => void);
    get pending(): number;
    work(units: readonly T[]): boolean;
    private doWork;
    dispose(): void;
}
export interface IdleDeadline {
    readonly didTimeout: boolean;
    timeRemaining(): number;
}
type IdleApi = Pick<typeof globalThis, 'requestIdleCallback' | 'cancelIdleCallback'>;
export declare let runWhenGlobalIdle: (callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable;
export declare let _runWhenIdle: (targetWindow: IdleApi, callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable;
export declare abstract class AbstractIdleValue<T> {
    private readonly _executor;
    private readonly _handle;
    private _didRun;
    private _value?;
    private _error;
    constructor(targetWindow: IdleApi, executor: () => T);
    dispose(): void;
    get value(): T;
    get isInitialized(): boolean;
}
export declare class GlobalIdleValue<T> extends AbstractIdleValue<T> {
    constructor(executor: () => T);
}
export declare function retry<T>(task: ITask<Promise<T>>, delay: number, retries: number): Promise<T>;
interface IQueuedTask {
    readonly promise: Promise<void>;
    readonly promiseResolve: () => void;
    readonly promiseReject: (error: Error) => void;
    run: ITask<Promise<void>>;
}
export interface ITaskSequentializerWithRunningTask {
    readonly running: Promise<void>;
}
export interface ITaskSequentializerWithQueuedTask {
    readonly queued: IQueuedTask;
}
export declare class TaskSequentializer {
    private _running?;
    private _queued?;
    isRunning(taskId?: number): this is ITaskSequentializerWithRunningTask;
    get running(): Promise<void> | undefined;
    cancelRunning(): void;
    run(taskId: number, promise: Promise<void>, onCancel?: () => void): Promise<void>;
    private doneRunning;
    private runQueued;
    queue(run: ITask<Promise<void>>): Promise<void>;
    hasQueued(): this is ITaskSequentializerWithQueuedTask;
    join(): Promise<void>;
}
export declare class IntervalCounter {
    private readonly interval;
    private readonly nowFn;
    private lastIncrementTime;
    private value;
    constructor(interval: number, nowFn?: () => number);
    increment(): number;
}
export type ValueCallback<T = unknown> = (value: T | Promise<T>) => void;
export declare class DeferredPromise<T> {
    private completeCallback;
    private errorCallback;
    private outcome?;
    get isRejected(): boolean;
    get isResolved(): boolean;
    get isSettled(): boolean;
    get value(): T | undefined;
    readonly p: Promise<T>;
    constructor();
    complete(value: T): Promise<void>;
    error(err: unknown): Promise<void>;
    cancel(): Promise<void>;
}
export declare namespace Promises {
    function settled<T>(promises: Promise<T>[]): Promise<T[]>;
    function withAsyncBody<T, E = Error>(bodyFn: (resolve: (value: T) => unknown, reject: (error: E) => unknown) => Promise<unknown>): Promise<T>;
}
export declare class StatefulPromise<T> {
    private _value;
    get value(): T | undefined;
    private _error;
    get error(): unknown;
    private _isResolved;
    get isResolved(): boolean;
    readonly promise: Promise<T>;
    constructor(promise: Promise<T>);
    requireValue(): T;
}
export declare class LazyStatefulPromise<T> {
    private readonly _compute;
    private readonly _promise;
    constructor(_compute: () => Promise<T>);
    requireValue(): T;
    getPromise(): Promise<T>;
    get currentValue(): T | undefined;
}
export interface AsyncIterableEmitter<T> {
    emitOne(value: T): void;
    emitMany(values: T[]): void;
    reject(error: Error): void;
}
export interface AsyncIterableExecutor<T> {
    (emitter: AsyncIterableEmitter<T>): void | Promise<void>;
}
export declare class AsyncIterableObject<T> implements AsyncIterable<T> {
    static fromArray<T>(items: T[]): AsyncIterableObject<T>;
    static fromPromise<T>(promise: Promise<T[]>): AsyncIterableObject<T>;
    static fromPromises<T>(promises: Promise<T>[]): AsyncIterableObject<T>;
    static merge<T>(iterables: AsyncIterable<T>[]): AsyncIterableObject<T>;
    static EMPTY: AsyncIterableObject<any>;
    private _state;
    private _results;
    private _error;
    private readonly _onReturn?;
    private readonly _onStateChanged;
    constructor(executor: AsyncIterableExecutor<T>, onReturn?: () => void | Promise<void>);
    [Symbol.asyncIterator](): AsyncIterator<T, undefined, undefined>;
    static map<T, R>(iterable: AsyncIterable<T>, mapFn: (item: T) => R): AsyncIterableObject<R>;
    map<R>(mapFn: (item: T) => R): AsyncIterableObject<R>;
    static filter<T>(iterable: AsyncIterable<T>, filterFn: (item: T) => boolean): AsyncIterableObject<T>;
    filter(filterFn: (item: T) => boolean): AsyncIterableObject<T>;
    static coalesce<T>(iterable: AsyncIterable<T | undefined | null>): AsyncIterableObject<T>;
    coalesce(): AsyncIterableObject<NonNullable<T>>;
    static toPromise<T>(iterable: AsyncIterable<T>): Promise<T[]>;
    toPromise(): Promise<T[]>;
    private emitOne;
    private emitMany;
    private resolve;
    private reject;
}
export declare class CancelableAsyncIterableObject<T> extends AsyncIterableObject<T> {
    private readonly _source;
    constructor(_source: CancellationTokenSource, executor: AsyncIterableExecutor<T>);
    cancel(): void;
}
export declare function createCancelableAsyncIterable<T>(callback: (token: CancellationToken) => AsyncIterable<T>): CancelableAsyncIterableObject<T>;
export declare class AsyncIterableSource<T> {
    private readonly _deferred;
    private readonly _asyncIterable;
    private _errorFn;
    private _emitFn;
    constructor(onReturn?: () => Promise<void> | void);
    get asyncIterable(): AsyncIterableObject<T>;
    resolve(): void;
    reject(error: Error): void;
    emitOne(item: T): void;
}
export {};
