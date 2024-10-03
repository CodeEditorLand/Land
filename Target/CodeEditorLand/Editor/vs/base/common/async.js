import { CancellationTokenSource } from './cancellation.js';
import { BugIndicatingError, CancellationError } from './errors.js';
import { Emitter, Event } from './event.js';
import { Disposable, DisposableMap, MutableDisposable, toDisposable } from './lifecycle.js';
import { extUri as defaultExtUri } from './resources.js';
import { setTimeout0 } from './platform.js';
import { MicrotaskDelay } from './symbols.js';
import { Lazy } from './lazy.js';
export function isThenable(obj) {
    return !!obj && typeof obj.then === 'function';
}
export function createCancelablePromise(callback) {
    const source = new CancellationTokenSource();
    const thenable = callback(source.token);
    const promise = new Promise((resolve, reject) => {
        const subscription = source.token.onCancellationRequested(() => {
            subscription.dispose();
            reject(new CancellationError());
        });
        Promise.resolve(thenable).then(value => {
            subscription.dispose();
            source.dispose();
            resolve(value);
        }, err => {
            subscription.dispose();
            source.dispose();
            reject(err);
        });
    });
    return new class {
        cancel() {
            source.cancel();
            source.dispose();
        }
        then(resolve, reject) {
            return promise.then(resolve, reject);
        }
        catch(reject) {
            return this.then(undefined, reject);
        }
        finally(onfinally) {
            return promise.finally(onfinally);
        }
    };
}
export function raceCancellation(promise, token, defaultValue) {
    return new Promise((resolve, reject) => {
        const ref = token.onCancellationRequested(() => {
            ref.dispose();
            resolve(defaultValue);
        });
        promise.then(resolve, reject).finally(() => ref.dispose());
    });
}
export function raceCancellationError(promise, token) {
    return new Promise((resolve, reject) => {
        const ref = token.onCancellationRequested(() => {
            ref.dispose();
            reject(new CancellationError());
        });
        promise.then(resolve, reject).finally(() => ref.dispose());
    });
}
export async function raceCancellablePromises(cancellablePromises) {
    let resolvedPromiseIndex = -1;
    const promises = cancellablePromises.map((promise, index) => promise.then(result => { resolvedPromiseIndex = index; return result; }));
    try {
        const result = await Promise.race(promises);
        return result;
    }
    finally {
        cancellablePromises.forEach((cancellablePromise, index) => {
            if (index !== resolvedPromiseIndex) {
                cancellablePromise.cancel();
            }
        });
    }
}
export function raceTimeout(promise, timeout, onTimeout) {
    let promiseResolve = undefined;
    const timer = setTimeout(() => {
        promiseResolve?.(undefined);
        onTimeout?.();
    }, timeout);
    return Promise.race([
        promise.finally(() => clearTimeout(timer)),
        new Promise(resolve => promiseResolve = resolve)
    ]);
}
export function asPromise(callback) {
    return new Promise((resolve, reject) => {
        const item = callback();
        if (isThenable(item)) {
            item.then(resolve, reject);
        }
        else {
            resolve(item);
        }
    });
}
export function promiseWithResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve: resolve, reject: reject };
}
export class Throttler {
    constructor() {
        this.isDisposed = false;
        this.activePromise = null;
        this.queuedPromise = null;
        this.queuedPromiseFactory = null;
    }
    queue(promiseFactory) {
        if (this.isDisposed) {
            return Promise.reject(new Error('Throttler is disposed'));
        }
        if (this.activePromise) {
            this.queuedPromiseFactory = promiseFactory;
            if (!this.queuedPromise) {
                const onComplete = () => {
                    this.queuedPromise = null;
                    if (this.isDisposed) {
                        return;
                    }
                    const result = this.queue(this.queuedPromiseFactory);
                    this.queuedPromiseFactory = null;
                    return result;
                };
                this.queuedPromise = new Promise(resolve => {
                    this.activePromise.then(onComplete, onComplete).then(resolve);
                });
            }
            return new Promise((resolve, reject) => {
                this.queuedPromise.then(resolve, reject);
            });
        }
        this.activePromise = promiseFactory();
        return new Promise((resolve, reject) => {
            this.activePromise.then((result) => {
                this.activePromise = null;
                resolve(result);
            }, (err) => {
                this.activePromise = null;
                reject(err);
            });
        });
    }
    dispose() {
        this.isDisposed = true;
    }
}
export class Sequencer {
    constructor() {
        this.current = Promise.resolve(null);
    }
    queue(promiseTask) {
        return this.current = this.current.then(() => promiseTask(), () => promiseTask());
    }
}
export class SequencerByKey {
    constructor() {
        this.promiseMap = new Map();
    }
    queue(key, promiseTask) {
        const runningPromise = this.promiseMap.get(key) ?? Promise.resolve();
        const newPromise = runningPromise
            .catch(() => { })
            .then(promiseTask)
            .finally(() => {
            if (this.promiseMap.get(key) === newPromise) {
                this.promiseMap.delete(key);
            }
        });
        this.promiseMap.set(key, newPromise);
        return newPromise;
    }
}
const timeoutDeferred = (timeout, fn) => {
    let scheduled = true;
    const handle = setTimeout(() => {
        scheduled = false;
        fn();
    }, timeout);
    return {
        isTriggered: () => scheduled,
        dispose: () => {
            clearTimeout(handle);
            scheduled = false;
        },
    };
};
const microtaskDeferred = (fn) => {
    let scheduled = true;
    queueMicrotask(() => {
        if (scheduled) {
            scheduled = false;
            fn();
        }
    });
    return {
        isTriggered: () => scheduled,
        dispose: () => { scheduled = false; },
    };
};
export class Delayer {
    constructor(defaultDelay) {
        this.defaultDelay = defaultDelay;
        this.deferred = null;
        this.completionPromise = null;
        this.doResolve = null;
        this.doReject = null;
        this.task = null;
    }
    trigger(task, delay = this.defaultDelay) {
        this.task = task;
        this.cancelTimeout();
        if (!this.completionPromise) {
            this.completionPromise = new Promise((resolve, reject) => {
                this.doResolve = resolve;
                this.doReject = reject;
            }).then(() => {
                this.completionPromise = null;
                this.doResolve = null;
                if (this.task) {
                    const task = this.task;
                    this.task = null;
                    return task();
                }
                return undefined;
            });
        }
        const fn = () => {
            this.deferred = null;
            this.doResolve?.(null);
        };
        this.deferred = delay === MicrotaskDelay ? microtaskDeferred(fn) : timeoutDeferred(delay, fn);
        return this.completionPromise;
    }
    isTriggered() {
        return !!this.deferred?.isTriggered();
    }
    cancel() {
        this.cancelTimeout();
        if (this.completionPromise) {
            this.doReject?.(new CancellationError());
            this.completionPromise = null;
        }
    }
    cancelTimeout() {
        this.deferred?.dispose();
        this.deferred = null;
    }
    dispose() {
        this.cancel();
    }
}
export class ThrottledDelayer {
    constructor(defaultDelay) {
        this.delayer = new Delayer(defaultDelay);
        this.throttler = new Throttler();
    }
    trigger(promiseFactory, delay) {
        return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay);
    }
    isTriggered() {
        return this.delayer.isTriggered();
    }
    cancel() {
        this.delayer.cancel();
    }
    dispose() {
        this.delayer.dispose();
        this.throttler.dispose();
    }
}
export class Barrier {
    constructor() {
        this._isOpen = false;
        this._promise = new Promise((c, e) => {
            this._completePromise = c;
        });
    }
    isOpen() {
        return this._isOpen;
    }
    open() {
        this._isOpen = true;
        this._completePromise(true);
    }
    wait() {
        return this._promise;
    }
}
export class AutoOpenBarrier extends Barrier {
    constructor(autoOpenTimeMs) {
        super();
        this._timeout = setTimeout(() => this.open(), autoOpenTimeMs);
    }
    open() {
        clearTimeout(this._timeout);
        super.open();
    }
}
export function timeout(millis, token) {
    if (!token) {
        return createCancelablePromise(token => timeout(millis, token));
    }
    return new Promise((resolve, reject) => {
        const handle = setTimeout(() => {
            disposable.dispose();
            resolve();
        }, millis);
        const disposable = token.onCancellationRequested(() => {
            clearTimeout(handle);
            disposable.dispose();
            reject(new CancellationError());
        });
    });
}
export function disposableTimeout(handler, timeout = 0, store) {
    const timer = setTimeout(() => {
        handler();
        if (store) {
            disposable.dispose();
        }
    }, timeout);
    const disposable = toDisposable(() => {
        clearTimeout(timer);
        store?.deleteAndLeak(disposable);
    });
    store?.add(disposable);
    return disposable;
}
export function sequence(promiseFactories) {
    const results = [];
    let index = 0;
    const len = promiseFactories.length;
    function next() {
        return index < len ? promiseFactories[index++]() : null;
    }
    function thenHandler(result) {
        if (result !== undefined && result !== null) {
            results.push(result);
        }
        const n = next();
        if (n) {
            return n.then(thenHandler);
        }
        return Promise.resolve(results);
    }
    return Promise.resolve(null).then(thenHandler);
}
export function first(promiseFactories, shouldStop = t => !!t, defaultValue = null) {
    let index = 0;
    const len = promiseFactories.length;
    const loop = () => {
        if (index >= len) {
            return Promise.resolve(defaultValue);
        }
        const factory = promiseFactories[index++];
        const promise = Promise.resolve(factory());
        return promise.then(result => {
            if (shouldStop(result)) {
                return Promise.resolve(result);
            }
            return loop();
        });
    };
    return loop();
}
export function firstParallel(promiseList, shouldStop = t => !!t, defaultValue = null) {
    if (promiseList.length === 0) {
        return Promise.resolve(defaultValue);
    }
    let todo = promiseList.length;
    const finish = () => {
        todo = -1;
        for (const promise of promiseList) {
            promise.cancel?.();
        }
    };
    return new Promise((resolve, reject) => {
        for (const promise of promiseList) {
            promise.then(result => {
                if (--todo >= 0 && shouldStop(result)) {
                    finish();
                    resolve(result);
                }
                else if (todo === 0) {
                    resolve(defaultValue);
                }
            })
                .catch(err => {
                if (--todo >= 0) {
                    finish();
                    reject(err);
                }
            });
        }
    });
}
export class Limiter {
    constructor(maxDegreeOfParalellism) {
        this._size = 0;
        this._isDisposed = false;
        this.maxDegreeOfParalellism = maxDegreeOfParalellism;
        this.outstandingPromises = [];
        this.runningPromises = 0;
        this._onDrained = new Emitter();
    }
    whenIdle() {
        return this.size > 0
            ? Event.toPromise(this.onDrained)
            : Promise.resolve();
    }
    get onDrained() {
        return this._onDrained.event;
    }
    get size() {
        return this._size;
    }
    queue(factory) {
        if (this._isDisposed) {
            throw new Error('Object has been disposed');
        }
        this._size++;
        return new Promise((c, e) => {
            this.outstandingPromises.push({ factory, c, e });
            this.consume();
        });
    }
    consume() {
        while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
            const iLimitedTask = this.outstandingPromises.shift();
            this.runningPromises++;
            const promise = iLimitedTask.factory();
            promise.then(iLimitedTask.c, iLimitedTask.e);
            promise.then(() => this.consumed(), () => this.consumed());
        }
    }
    consumed() {
        if (this._isDisposed) {
            return;
        }
        this.runningPromises--;
        if (--this._size === 0) {
            this._onDrained.fire();
        }
        if (this.outstandingPromises.length > 0) {
            this.consume();
        }
    }
    clear() {
        if (this._isDisposed) {
            throw new Error('Object has been disposed');
        }
        this.outstandingPromises.length = 0;
        this._size = this.runningPromises;
    }
    dispose() {
        this._isDisposed = true;
        this.outstandingPromises.length = 0;
        this._size = 0;
        this._onDrained.dispose();
    }
}
export class Queue extends Limiter {
    constructor() {
        super(1);
    }
}
export class LimitedQueue {
    constructor() {
        this.sequentializer = new TaskSequentializer();
        this.tasks = 0;
    }
    queue(factory) {
        if (!this.sequentializer.isRunning()) {
            return this.sequentializer.run(this.tasks++, factory());
        }
        return this.sequentializer.queue(() => {
            return this.sequentializer.run(this.tasks++, factory());
        });
    }
}
export class ResourceQueue {
    constructor() {
        this.queues = new Map();
        this.drainers = new Set();
        this.drainListeners = undefined;
        this.drainListenerCount = 0;
    }
    async whenDrained() {
        if (this.isDrained()) {
            return;
        }
        const promise = new DeferredPromise();
        this.drainers.add(promise);
        return promise.p;
    }
    isDrained() {
        for (const [, queue] of this.queues) {
            if (queue.size > 0) {
                return false;
            }
        }
        return true;
    }
    queueSize(resource, extUri = defaultExtUri) {
        const key = extUri.getComparisonKey(resource);
        return this.queues.get(key)?.size ?? 0;
    }
    queueFor(resource, factory, extUri = defaultExtUri) {
        const key = extUri.getComparisonKey(resource);
        let queue = this.queues.get(key);
        if (!queue) {
            queue = new Queue();
            const drainListenerId = this.drainListenerCount++;
            const drainListener = Event.once(queue.onDrained)(() => {
                queue?.dispose();
                this.queues.delete(key);
                this.onDidQueueDrain();
                this.drainListeners?.deleteAndDispose(drainListenerId);
                if (this.drainListeners?.size === 0) {
                    this.drainListeners.dispose();
                    this.drainListeners = undefined;
                }
            });
            if (!this.drainListeners) {
                this.drainListeners = new DisposableMap();
            }
            this.drainListeners.set(drainListenerId, drainListener);
            this.queues.set(key, queue);
        }
        return queue.queue(factory);
    }
    onDidQueueDrain() {
        if (!this.isDrained()) {
            return;
        }
        this.releaseDrainers();
    }
    releaseDrainers() {
        for (const drainer of this.drainers) {
            drainer.complete();
        }
        this.drainers.clear();
    }
    dispose() {
        for (const [, queue] of this.queues) {
            queue.dispose();
        }
        this.queues.clear();
        this.releaseDrainers();
        this.drainListeners?.dispose();
    }
}
export class TimeoutTimer {
    constructor(runner, timeout) {
        this._isDisposed = false;
        this._token = -1;
        if (typeof runner === 'function' && typeof timeout === 'number') {
            this.setIfNotSet(runner, timeout);
        }
    }
    dispose() {
        this.cancel();
        this._isDisposed = true;
    }
    cancel() {
        if (this._token !== -1) {
            clearTimeout(this._token);
            this._token = -1;
        }
    }
    cancelAndSet(runner, timeout) {
        if (this._isDisposed) {
            throw new BugIndicatingError(`Calling 'cancelAndSet' on a disposed TimeoutTimer`);
        }
        this.cancel();
        this._token = setTimeout(() => {
            this._token = -1;
            runner();
        }, timeout);
    }
    setIfNotSet(runner, timeout) {
        if (this._isDisposed) {
            throw new BugIndicatingError(`Calling 'setIfNotSet' on a disposed TimeoutTimer`);
        }
        if (this._token !== -1) {
            return;
        }
        this._token = setTimeout(() => {
            this._token = -1;
            runner();
        }, timeout);
    }
}
export class IntervalTimer {
    constructor() {
        this.disposable = undefined;
        this.isDisposed = false;
    }
    cancel() {
        this.disposable?.dispose();
        this.disposable = undefined;
    }
    cancelAndSet(runner, interval, context = globalThis) {
        if (this.isDisposed) {
            throw new BugIndicatingError(`Calling 'cancelAndSet' on a disposed IntervalTimer`);
        }
        this.cancel();
        const handle = context.setInterval(() => {
            runner();
        }, interval);
        this.disposable = toDisposable(() => {
            context.clearInterval(handle);
            this.disposable = undefined;
        });
    }
    dispose() {
        this.cancel();
        this.isDisposed = true;
    }
}
export class RunOnceScheduler {
    constructor(runner, delay) {
        this.timeoutToken = -1;
        this.runner = runner;
        this.timeout = delay;
        this.timeoutHandler = this.onTimeout.bind(this);
    }
    dispose() {
        this.cancel();
        this.runner = null;
    }
    cancel() {
        if (this.isScheduled()) {
            clearTimeout(this.timeoutToken);
            this.timeoutToken = -1;
        }
    }
    schedule(delay = this.timeout) {
        this.cancel();
        this.timeoutToken = setTimeout(this.timeoutHandler, delay);
    }
    get delay() {
        return this.timeout;
    }
    set delay(value) {
        this.timeout = value;
    }
    isScheduled() {
        return this.timeoutToken !== -1;
    }
    flush() {
        if (this.isScheduled()) {
            this.cancel();
            this.doRun();
        }
    }
    onTimeout() {
        this.timeoutToken = -1;
        if (this.runner) {
            this.doRun();
        }
    }
    doRun() {
        this.runner?.();
    }
}
export class ProcessTimeRunOnceScheduler {
    constructor(runner, delay) {
        if (delay % 1000 !== 0) {
            console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
        }
        this.runner = runner;
        this.timeout = delay;
        this.counter = 0;
        this.intervalToken = -1;
        this.intervalHandler = this.onInterval.bind(this);
    }
    dispose() {
        this.cancel();
        this.runner = null;
    }
    cancel() {
        if (this.isScheduled()) {
            clearInterval(this.intervalToken);
            this.intervalToken = -1;
        }
    }
    schedule(delay = this.timeout) {
        if (delay % 1000 !== 0) {
            console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
        }
        this.cancel();
        this.counter = Math.ceil(delay / 1000);
        this.intervalToken = setInterval(this.intervalHandler, 1000);
    }
    isScheduled() {
        return this.intervalToken !== -1;
    }
    onInterval() {
        this.counter--;
        if (this.counter > 0) {
            return;
        }
        clearInterval(this.intervalToken);
        this.intervalToken = -1;
        this.runner?.();
    }
}
export class RunOnceWorker extends RunOnceScheduler {
    constructor(runner, timeout) {
        super(runner, timeout);
        this.units = [];
    }
    work(unit) {
        this.units.push(unit);
        if (!this.isScheduled()) {
            this.schedule();
        }
    }
    doRun() {
        const units = this.units;
        this.units = [];
        this.runner?.(units);
    }
    dispose() {
        this.units = [];
        super.dispose();
    }
}
export class ThrottledWorker extends Disposable {
    constructor(options, handler) {
        super();
        this.options = options;
        this.handler = handler;
        this.pendingWork = [];
        this.throttler = this._register(new MutableDisposable());
        this.disposed = false;
    }
    get pending() { return this.pendingWork.length; }
    work(units) {
        if (this.disposed) {
            return false;
        }
        if (typeof this.options.maxBufferedWork === 'number') {
            if (this.throttler.value) {
                if (this.pending + units.length > this.options.maxBufferedWork) {
                    return false;
                }
            }
            else {
                if (this.pending + units.length - this.options.maxWorkChunkSize > this.options.maxBufferedWork) {
                    return false;
                }
            }
        }
        for (const unit of units) {
            this.pendingWork.push(unit);
        }
        if (!this.throttler.value) {
            this.doWork();
        }
        return true;
    }
    doWork() {
        this.handler(this.pendingWork.splice(0, this.options.maxWorkChunkSize));
        if (this.pendingWork.length > 0) {
            this.throttler.value = new RunOnceScheduler(() => {
                this.throttler.clear();
                this.doWork();
            }, this.options.throttleDelay);
            this.throttler.value.schedule();
        }
    }
    dispose() {
        super.dispose();
        this.disposed = true;
    }
}
export let runWhenGlobalIdle;
export let _runWhenIdle;
(function () {
    if (typeof globalThis.requestIdleCallback !== 'function' || typeof globalThis.cancelIdleCallback !== 'function') {
        _runWhenIdle = (_targetWindow, runner) => {
            setTimeout0(() => {
                if (disposed) {
                    return;
                }
                const end = Date.now() + 15;
                const deadline = {
                    didTimeout: true,
                    timeRemaining() {
                        return Math.max(0, end - Date.now());
                    }
                };
                runner(Object.freeze(deadline));
            });
            let disposed = false;
            return {
                dispose() {
                    if (disposed) {
                        return;
                    }
                    disposed = true;
                }
            };
        };
    }
    else {
        _runWhenIdle = (targetWindow, runner, timeout) => {
            const handle = targetWindow.requestIdleCallback(runner, typeof timeout === 'number' ? { timeout } : undefined);
            let disposed = false;
            return {
                dispose() {
                    if (disposed) {
                        return;
                    }
                    disposed = true;
                    targetWindow.cancelIdleCallback(handle);
                }
            };
        };
    }
    runWhenGlobalIdle = (runner) => _runWhenIdle(globalThis, runner);
})();
export class AbstractIdleValue {
    constructor(targetWindow, executor) {
        this._didRun = false;
        this._executor = () => {
            try {
                this._value = executor();
            }
            catch (err) {
                this._error = err;
            }
            finally {
                this._didRun = true;
            }
        };
        this._handle = _runWhenIdle(targetWindow, () => this._executor());
    }
    dispose() {
        this._handle.dispose();
    }
    get value() {
        if (!this._didRun) {
            this._handle.dispose();
            this._executor();
        }
        if (this._error) {
            throw this._error;
        }
        return this._value;
    }
    get isInitialized() {
        return this._didRun;
    }
}
export class GlobalIdleValue extends AbstractIdleValue {
    constructor(executor) {
        super(globalThis, executor);
    }
}
export async function retry(task, delay, retries) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await task();
        }
        catch (error) {
            lastError = error;
            await timeout(delay);
        }
    }
    throw lastError;
}
export class TaskSequentializer {
    isRunning(taskId) {
        if (typeof taskId === 'number') {
            return this._running?.taskId === taskId;
        }
        return !!this._running;
    }
    get running() {
        return this._running?.promise;
    }
    cancelRunning() {
        this._running?.cancel();
    }
    run(taskId, promise, onCancel) {
        this._running = { taskId, cancel: () => onCancel?.(), promise };
        promise.then(() => this.doneRunning(taskId), () => this.doneRunning(taskId));
        return promise;
    }
    doneRunning(taskId) {
        if (this._running && taskId === this._running.taskId) {
            this._running = undefined;
            this.runQueued();
        }
    }
    runQueued() {
        if (this._queued) {
            const queued = this._queued;
            this._queued = undefined;
            queued.run().then(queued.promiseResolve, queued.promiseReject);
        }
    }
    queue(run) {
        if (!this._queued) {
            const { promise, resolve: promiseResolve, reject: promiseReject } = promiseWithResolvers();
            this._queued = {
                run,
                promise,
                promiseResolve: promiseResolve,
                promiseReject: promiseReject
            };
        }
        else {
            this._queued.run = run;
        }
        return this._queued.promise;
    }
    hasQueued() {
        return !!this._queued;
    }
    async join() {
        return this._queued?.promise ?? this._running?.promise;
    }
}
export class IntervalCounter {
    constructor(interval, nowFn = () => Date.now()) {
        this.interval = interval;
        this.nowFn = nowFn;
        this.lastIncrementTime = 0;
        this.value = 0;
    }
    increment() {
        const now = this.nowFn();
        if (now - this.lastIncrementTime > this.interval) {
            this.lastIncrementTime = now;
            this.value = 0;
        }
        this.value++;
        return this.value;
    }
}
export class DeferredPromise {
    get isRejected() {
        return this.outcome?.outcome === 1;
    }
    get isResolved() {
        return this.outcome?.outcome === 0;
    }
    get isSettled() {
        return !!this.outcome;
    }
    get value() {
        return this.outcome?.outcome === 0 ? this.outcome?.value : undefined;
    }
    constructor() {
        this.p = new Promise((c, e) => {
            this.completeCallback = c;
            this.errorCallback = e;
        });
    }
    complete(value) {
        return new Promise(resolve => {
            this.completeCallback(value);
            this.outcome = { outcome: 0, value };
            resolve();
        });
    }
    error(err) {
        return new Promise(resolve => {
            this.errorCallback(err);
            this.outcome = { outcome: 1, value: err };
            resolve();
        });
    }
    cancel() {
        return this.error(new CancellationError());
    }
}
export var Promises;
(function (Promises) {
    async function settled(promises) {
        let firstError = undefined;
        const result = await Promise.all(promises.map(promise => promise.then(value => value, error => {
            if (!firstError) {
                firstError = error;
            }
            return undefined;
        })));
        if (typeof firstError !== 'undefined') {
            throw firstError;
        }
        return result;
    }
    Promises.settled = settled;
    function withAsyncBody(bodyFn) {
        return new Promise(async (resolve, reject) => {
            try {
                await bodyFn(resolve, reject);
            }
            catch (error) {
                reject(error);
            }
        });
    }
    Promises.withAsyncBody = withAsyncBody;
})(Promises || (Promises = {}));
export class StatefulPromise {
    get value() { return this._value; }
    get error() { return this._error; }
    get isResolved() { return this._isResolved; }
    constructor(promise) {
        this._value = undefined;
        this._error = undefined;
        this._isResolved = false;
        this.promise = promise.then(value => {
            this._value = value;
            this._isResolved = true;
            return value;
        }, error => {
            this._error = error;
            this._isResolved = true;
            throw error;
        });
    }
    requireValue() {
        if (!this._isResolved) {
            throw new BugIndicatingError('Promise is not resolved yet');
        }
        if (this._error) {
            throw this._error;
        }
        return this._value;
    }
}
export class LazyStatefulPromise {
    constructor(_compute) {
        this._compute = _compute;
        this._promise = new Lazy(() => new StatefulPromise(this._compute()));
    }
    requireValue() {
        return this._promise.value.requireValue();
    }
    getPromise() {
        return this._promise.value.promise;
    }
    get currentValue() {
        return this._promise.rawValue?.value;
    }
}
export class AsyncIterableObject {
    static fromArray(items) {
        return new AsyncIterableObject((writer) => {
            writer.emitMany(items);
        });
    }
    static fromPromise(promise) {
        return new AsyncIterableObject(async (emitter) => {
            emitter.emitMany(await promise);
        });
    }
    static fromPromises(promises) {
        return new AsyncIterableObject(async (emitter) => {
            await Promise.all(promises.map(async (p) => emitter.emitOne(await p)));
        });
    }
    static merge(iterables) {
        return new AsyncIterableObject(async (emitter) => {
            await Promise.all(iterables.map(async (iterable) => {
                for await (const item of iterable) {
                    emitter.emitOne(item);
                }
            }));
        });
    }
    static { this.EMPTY = AsyncIterableObject.fromArray([]); }
    constructor(executor, onReturn) {
        this._state = 0;
        this._results = [];
        this._error = null;
        this._onReturn = onReturn;
        this._onStateChanged = new Emitter();
        queueMicrotask(async () => {
            const writer = {
                emitOne: (item) => this.emitOne(item),
                emitMany: (items) => this.emitMany(items),
                reject: (error) => this.reject(error)
            };
            try {
                await Promise.resolve(executor(writer));
                this.resolve();
            }
            catch (err) {
                this.reject(err);
            }
            finally {
                writer.emitOne = undefined;
                writer.emitMany = undefined;
                writer.reject = undefined;
            }
        });
    }
    [Symbol.asyncIterator]() {
        let i = 0;
        return {
            next: async () => {
                do {
                    if (this._state === 2) {
                        throw this._error;
                    }
                    if (i < this._results.length) {
                        return { done: false, value: this._results[i++] };
                    }
                    if (this._state === 1) {
                        return { done: true, value: undefined };
                    }
                    await Event.toPromise(this._onStateChanged.event);
                } while (true);
            },
            return: async () => {
                this._onReturn?.();
                return { done: true, value: undefined };
            }
        };
    }
    static map(iterable, mapFn) {
        return new AsyncIterableObject(async (emitter) => {
            for await (const item of iterable) {
                emitter.emitOne(mapFn(item));
            }
        });
    }
    map(mapFn) {
        return AsyncIterableObject.map(this, mapFn);
    }
    static filter(iterable, filterFn) {
        return new AsyncIterableObject(async (emitter) => {
            for await (const item of iterable) {
                if (filterFn(item)) {
                    emitter.emitOne(item);
                }
            }
        });
    }
    filter(filterFn) {
        return AsyncIterableObject.filter(this, filterFn);
    }
    static coalesce(iterable) {
        return AsyncIterableObject.filter(iterable, item => !!item);
    }
    coalesce() {
        return AsyncIterableObject.coalesce(this);
    }
    static async toPromise(iterable) {
        const result = [];
        for await (const item of iterable) {
            result.push(item);
        }
        return result;
    }
    toPromise() {
        return AsyncIterableObject.toPromise(this);
    }
    emitOne(value) {
        if (this._state !== 0) {
            return;
        }
        this._results.push(value);
        this._onStateChanged.fire();
    }
    emitMany(values) {
        if (this._state !== 0) {
            return;
        }
        this._results = this._results.concat(values);
        this._onStateChanged.fire();
    }
    resolve() {
        if (this._state !== 0) {
            return;
        }
        this._state = 1;
        this._onStateChanged.fire();
    }
    reject(error) {
        if (this._state !== 0) {
            return;
        }
        this._state = 2;
        this._error = error;
        this._onStateChanged.fire();
    }
}
export class CancelableAsyncIterableObject extends AsyncIterableObject {
    constructor(_source, executor) {
        super(executor);
        this._source = _source;
    }
    cancel() {
        this._source.cancel();
    }
}
export function createCancelableAsyncIterable(callback) {
    const source = new CancellationTokenSource();
    const innerIterable = callback(source.token);
    return new CancelableAsyncIterableObject(source, async (emitter) => {
        const subscription = source.token.onCancellationRequested(() => {
            subscription.dispose();
            source.dispose();
            emitter.reject(new CancellationError());
        });
        try {
            for await (const item of innerIterable) {
                if (source.token.isCancellationRequested) {
                    return;
                }
                emitter.emitOne(item);
            }
            subscription.dispose();
            source.dispose();
        }
        catch (err) {
            subscription.dispose();
            source.dispose();
            emitter.reject(err);
        }
    });
}
export class AsyncIterableSource {
    constructor(onReturn) {
        this._deferred = new DeferredPromise();
        this._asyncIterable = new AsyncIterableObject(emitter => {
            if (earlyError) {
                emitter.reject(earlyError);
                return;
            }
            if (earlyItems) {
                emitter.emitMany(earlyItems);
            }
            this._errorFn = (error) => emitter.reject(error);
            this._emitFn = (item) => emitter.emitOne(item);
            return this._deferred.p;
        }, onReturn);
        let earlyError;
        let earlyItems;
        this._emitFn = (item) => {
            if (!earlyItems) {
                earlyItems = [];
            }
            earlyItems.push(item);
        };
        this._errorFn = (error) => {
            if (!earlyError) {
                earlyError = error;
            }
        };
    }
    get asyncIterable() {
        return this._asyncIterable;
    }
    resolve() {
        this._deferred.complete();
    }
    reject(error) {
        this._errorFn(error);
        this._deferred.complete();
    }
    emitOne(item) {
        this._emitFn(item);
    }
}
