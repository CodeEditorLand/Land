import { IChangeContext, IObservable, IObserver, IReader } from './base.js';
import { DebugNameData, IDebugNameData } from './debugName.js';
import { DisposableStore, IDisposable } from './commonFacade/deps.js';
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 */
export declare function autorun(fn: (reader: IReader) => void): IDisposable;
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 */
export declare function autorunOpts(options: IDebugNameData & {}, fn: (reader: IReader) => void): IDisposable;
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 *
 * Use `createEmptyChangeSummary` to create a "change summary" that can collect the changes.
 * Use `handleChange` to add a reported change to the change summary.
 * The run function is given the last change summary.
 * The change summary is discarded after the run function was called.
 *
 * @see autorun
 */
export declare function autorunHandleChanges<TChangeSummary>(options: IDebugNameData & {
    createEmptyChangeSummary?: () => TChangeSummary;
    handleChange: (context: IChangeContext, changeSummary: TChangeSummary) => boolean;
}, fn: (reader: IReader, changeSummary: TChangeSummary) => void): IDisposable;
/**
 * @see autorunHandleChanges (but with a disposable store that is cleared before the next run or on dispose)
 */
export declare function autorunWithStoreHandleChanges<TChangeSummary>(options: IDebugNameData & {
    createEmptyChangeSummary?: () => TChangeSummary;
    handleChange: (context: IChangeContext, changeSummary: TChangeSummary) => boolean;
}, fn: (reader: IReader, changeSummary: TChangeSummary, store: DisposableStore) => void): IDisposable;
/**
 * @see autorun (but with a disposable store that is cleared before the next run or on dispose)
 */
export declare function autorunWithStore(fn: (reader: IReader, store: DisposableStore) => void): IDisposable;
export declare function autorunDelta<T>(observable: IObservable<T>, handler: (args: {
    lastValue: T | undefined;
    newValue: T;
}) => void): IDisposable;
export declare class AutorunObserver<TChangeSummary = any> implements IObserver, IReader, IDisposable {
    readonly _debugNameData: DebugNameData;
    readonly _runFn: (reader: IReader, changeSummary: TChangeSummary) => void;
    private readonly createChangeSummary;
    private readonly _handleChange;
    private state;
    private updateCount;
    private disposed;
    private dependencies;
    private dependenciesToBeRemoved;
    private changeSummary;
    get debugName(): string;
    constructor(_debugNameData: DebugNameData, _runFn: (reader: IReader, changeSummary: TChangeSummary) => void, createChangeSummary: (() => TChangeSummary) | undefined, _handleChange: ((context: IChangeContext, summary: TChangeSummary) => boolean) | undefined);
    dispose(): void;
    private _runIfNeeded;
    toString(): string;
    beginUpdate(): void;
    endUpdate(): void;
    handlePossibleChange(observable: IObservable<any>): void;
    handleChange<T, TChange>(observable: IObservable<T, TChange>, change: TChange): void;
    readObservable<T>(observable: IObservable<T>): T;
}
export declare namespace autorun {
    const Observer: typeof AutorunObserver;
}
