import { Disposable } from '../../../base/common/lifecycle.js';
interface ITaskQueue {
    enqueue(task: () => boolean | void): void;
    flush(): void;
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
export declare class PriorityTaskQueue extends TaskQueue {
    protected _requestCallback(callback: CallbackWithDeadline): number;
    protected _cancelCallback(identifier: number): void;
    private _createDeadline;
}
export declare class IdleTaskQueue extends TaskQueue {
    protected _requestCallback(callback: IdleRequestCallback): number;
    protected _cancelCallback(identifier: number): void;
}
export declare class DebouncedIdleTask {
    private _queue;
    constructor();
    set(task: () => boolean | void): void;
    flush(): void;
}
export {};
