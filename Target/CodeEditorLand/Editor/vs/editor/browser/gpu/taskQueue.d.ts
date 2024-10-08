import { Disposable } from '../../../base/common/lifecycle.js';
/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
interface ITaskQueue {
    /**
     * Adds a task to the queue which will run in a future idle callback.
     * To avoid perceivable stalls on the mainthread, tasks with heavy workload
     * should split their work into smaller pieces and return `true` to get
     * called again until the work is done (on falsy return value).
     */
    enqueue(task: () => boolean | void): void;
    /**
     * Flushes the queue, running all remaining tasks synchronously.
     */
    flush(): void;
    /**
     * Clears any remaining tasks from the queue, these will not be run.
     */
    clear(): void;
}
interface ITaskDeadline {
    timeRemaining(): number;
}
type CallbackWithDeadline = (deadline: ITaskDeadline) => void;
declare abstract class TaskQueue extends Disposable implements ITaskQueue {
    private _tasks;
    private _idleCallback?;
    private _i;
    constructor();
    protected abstract _requestCallback(callback: CallbackWithDeadline): number;
    protected abstract _cancelCallback(identifier: number): void;
    enqueue(task: () => boolean | void): void;
    flush(): void;
    clear(): void;
    private _start;
    private _process;
}
/**
 * A queue of that runs tasks over several tasks via setTimeout, trying to maintain above 60 frames
 * per second. The tasks will run in the order they are enqueued, but they will run some time later,
 * and care should be taken to ensure they're non-urgent and will not introduce race conditions.
 */
export declare class PriorityTaskQueue extends TaskQueue {
    protected _requestCallback(callback: CallbackWithDeadline): number;
    protected _cancelCallback(identifier: number): void;
    private _createDeadline;
}
/**
 * A queue of that runs tasks over several idle callbacks, trying to respect the idle callback's
 * deadline given by the environment. The tasks will run in the order they are enqueued, but they
 * will run some time later, and care should be taken to ensure they're non-urgent and will not
 * introduce race conditions.
 */
export declare class IdleTaskQueue extends TaskQueue {
    protected _requestCallback(callback: IdleRequestCallback): number;
    protected _cancelCallback(identifier: number): void;
}
/**
 * An object that tracks a single debounced task that will run on the next idle frame. When called
 * multiple times, only the last set task will run.
 */
export declare class DebouncedIdleTask {
    private _queue;
    constructor();
    set(task: () => boolean | void): void;
    flush(): void;
}
export {};
