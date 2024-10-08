import { BaseObservable, IChangeContext, IObservable, IObserver, IReader, ISettableObservable, ITransaction } from './base.js';
import { DebugNameData, DebugOwner, IDebugNameData } from './debugName.js';
import { DisposableStore, EqualityComparer, IDisposable } from './commonFacade/deps.js';
/**
 * Creates an observable that is derived from other observables.
 * The value is only recomputed when absolutely needed.
 *
 * {@link computeFn} should start with a JS Doc using `@description` to name the derived.
 */
export declare function derived<T>(computeFn: (reader: IReader) => T): IObservable<T>;
export declare function derived<T>(owner: DebugOwner, computeFn: (reader: IReader) => T): IObservable<T>;
export declare function derivedWithSetter<T>(owner: DebugOwner | undefined, computeFn: (reader: IReader) => T, setter: (value: T, transaction: ITransaction | undefined) => void): ISettableObservable<T>;
export declare function derivedOpts<T>(options: IDebugNameData & {
    equalsFn?: EqualityComparer<T>;
    onLastObserverRemoved?: (() => void);
}, computeFn: (reader: IReader) => T): IObservable<T>;
/**
 * Represents an observable that is derived from other observables.
 * The value is only recomputed when absolutely needed.
 *
 * {@link computeFn} should start with a JS Doc using `@description` to name the derived.
 *
 * Use `createEmptyChangeSummary` to create a "change summary" that can collect the changes.
 * Use `handleChange` to add a reported change to the change summary.
 * The compute function is given the last change summary.
 * The change summary is discarded after the compute function was called.
 *
 * @see derived
 */
export declare function derivedHandleChanges<T, TChangeSummary>(options: IDebugNameData & {
    createEmptyChangeSummary: () => TChangeSummary;
    handleChange: (context: IChangeContext, changeSummary: TChangeSummary) => boolean;
    equalityComparer?: EqualityComparer<T>;
}, computeFn: (reader: IReader, changeSummary: TChangeSummary) => T): IObservable<T>;
export declare function derivedWithStore<T>(computeFn: (reader: IReader, store: DisposableStore) => T): IObservable<T>;
export declare function derivedWithStore<T>(owner: object, computeFn: (reader: IReader, store: DisposableStore) => T): IObservable<T>;
export declare function derivedDisposable<T extends IDisposable | undefined>(computeFn: (reader: IReader) => T): IObservable<T>;
export declare function derivedDisposable<T extends IDisposable | undefined>(owner: DebugOwner, computeFn: (reader: IReader) => T): IObservable<T>;
export declare class Derived<T, TChangeSummary = any> extends BaseObservable<T, void> implements IReader, IObserver {
    readonly _debugNameData: DebugNameData;
    readonly _computeFn: (reader: IReader, changeSummary: TChangeSummary) => T;
    private readonly createChangeSummary;
    private readonly _handleChange;
    private readonly _handleLastObserverRemoved;
    private readonly _equalityComparator;
    private state;
    private value;
    private updateCount;
    private dependencies;
    private dependenciesToBeRemoved;
    private changeSummary;
    get debugName(): string;
    constructor(_debugNameData: DebugNameData, _computeFn: (reader: IReader, changeSummary: TChangeSummary) => T, createChangeSummary: (() => TChangeSummary) | undefined, _handleChange: ((context: IChangeContext, summary: TChangeSummary) => boolean) | undefined, _handleLastObserverRemoved: (() => void) | undefined, _equalityComparator: EqualityComparer<T>);
    protected onLastObserverRemoved(): void;
    get(): T;
    private _recomputeIfNeeded;
    toString(): string;
    beginUpdate<T>(_observable: IObservable<T>): void;
    endUpdate<T>(_observable: IObservable<T>): void;
    handlePossibleChange<T>(observable: IObservable<T, unknown>): void;
    handleChange<T, TChange>(observable: IObservable<T, TChange>, change: TChange): void;
    readObservable<T>(observable: IObservable<T>): T;
    addObserver(observer: IObserver): void;
    removeObserver(observer: IObserver): void;
}
export declare class DerivedWithSetter<T, TChangeSummary = any> extends Derived<T, TChangeSummary> implements ISettableObservable<T> {
    readonly set: (value: T, tx: ITransaction | undefined) => void;
    constructor(debugNameData: DebugNameData, computeFn: (reader: IReader, changeSummary: TChangeSummary) => T, createChangeSummary: (() => TChangeSummary) | undefined, handleChange: ((context: IChangeContext, summary: TChangeSummary) => boolean) | undefined, handleLastObserverRemoved: (() => void) | undefined, equalityComparator: EqualityComparer<T>, set: (value: T, tx: ITransaction | undefined) => void);
}
