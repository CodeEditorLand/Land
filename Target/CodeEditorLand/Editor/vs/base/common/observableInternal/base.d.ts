import { DebugNameData, DebugOwner } from './debugName.js';
import { DisposableStore, EqualityComparer, IDisposable } from './commonFacade/deps.js';
import type { derivedOpts } from './derived.js';
import { keepObserved, recomputeInitiallyAndOnChange } from './utils.js';
/**
 * Represents an observable value.
 *
 * @template T The type of the values the observable can hold.
 * @template TChange The type used to describe value changes
 * (usually `void` and only used in advanced scenarios).
 * While observers can miss temporary values of an observable,
 * they will receive all change values (as long as they are subscribed)!
 */
export interface IObservable<T, TChange = unknown> {
    /**
     * Returns the current value.
     *
     * Calls {@link IObserver.handleChange} if the observable notices that the value changed.
     * Must not be called from {@link IObserver.handleChange}!
     */
    get(): T;
    /**
     * Forces the observable to check for changes and report them.
     *
     * Has the same effect as calling {@link IObservable.get}, but does not force the observable
     * to actually construct the value, e.g. if change deltas are used.
     * Calls {@link IObserver.handleChange} if the observable notices that the value changed.
     * Must not be called from {@link IObserver.handleChange}!
     */
    reportChanges(): void;
    /**
     * Adds the observer to the set of subscribed observers.
     * This method is idempotent.
     */
    addObserver(observer: IObserver): void;
    /**
     * Removes the observer from the set of subscribed observers.
     * This method is idempotent.
     */
    removeObserver(observer: IObserver): void;
    /**
     * Reads the current value and subscribes the reader to this observable.
     *
     * Calls {@link IReader.readObservable} if a reader is given, otherwise {@link IObservable.get}
     * (see {@link ConvenientObservable.read} for the implementation).
     */
    read(reader: IReader | undefined): T;
    /**
     * Creates a derived observable that depends on this observable.
     * Use the reader to read other observables
     * (see {@link ConvenientObservable.map} for the implementation).
     */
    map<TNew>(fn: (value: T, reader: IReader) => TNew): IObservable<TNew>;
    map<TNew>(owner: object, fn: (value: T, reader: IReader) => TNew): IObservable<TNew>;
    flatten<TNew>(this: IObservable<IObservable<TNew>>): IObservable<TNew>;
    /**
     * Makes sure this value is computed eagerly.
     */
    recomputeInitiallyAndOnChange(store: DisposableStore, handleValue?: (value: T) => void): IObservable<T>;
    /**
     * Makes sure this value is cached.
     */
    keepObserved(store: DisposableStore): IObservable<T>;
    /**
     * A human-readable name for debugging purposes.
     */
    readonly debugName: string;
    /**
     * This property captures the type of the change object. Do not use it at runtime!
     */
    readonly TChange: TChange;
}
export interface IReader {
    /**
     * Reads the value of an observable and subscribes to it.
     */
    readObservable<T>(observable: IObservable<T, any>): T;
}
/**
 * Represents an observer that can be subscribed to an observable.
 *
 * If an observer is subscribed to an observable and that observable didn't signal
 * a change through one of the observer methods, the observer can assume that the
 * observable didn't change.
 * If an observable reported a possible change, {@link IObservable.reportChanges} forces
 * the observable to report an actual change if there was one.
 */
export interface IObserver {
    /**
     * Signals that the given observable might have changed and a transaction potentially modifying that observable started.
     * Before the given observable can call this method again, is must call {@link IObserver.endUpdate}.
     *
     * Implementations must not get/read the value of other observables, as they might not have received this event yet!
     * The method {@link IObservable.reportChanges} can be used to force the observable to report the changes.
     */
    beginUpdate<T>(observable: IObservable<T>): void;
    /**
     * Signals that the transaction that potentially modified the given observable ended.
     * This is a good place to react to (potential) changes.
     */
    endUpdate<T>(observable: IObservable<T>): void;
    /**
     * Signals that the given observable might have changed.
     * The method {@link IObservable.reportChanges} can be used to force the observable to report the changes.
     *
     * Implementations must not get/read the value of other observables, as they might not have received this event yet!
     * The change should be processed lazily or in {@link IObserver.endUpdate}.
     */
    handlePossibleChange<T>(observable: IObservable<T>): void;
    /**
     * Signals that the given {@link observable} changed.
     *
     * Implementations must not get/read the value of other observables, as they might not have received this event yet!
     * The change should be processed lazily or in {@link IObserver.endUpdate}.
     *
     * @param change Indicates how or why the value changed.
     */
    handleChange<T, TChange>(observable: IObservable<T, TChange>, change: TChange): void;
}
export interface ISettable<T, TChange = void> {
    /**
     * Sets the value of the observable.
     * Use a transaction to batch multiple changes (with a transaction, observers only react at the end of the transaction).
     *
     * @param transaction When given, value changes are handled on demand or when the transaction ends.
     * @param change Describes how or why the value changed.
     */
    set(value: T, transaction: ITransaction | undefined, change: TChange): void;
}
export interface ITransaction {
    /**
     * Calls {@link Observer.beginUpdate} immediately
     * and {@link Observer.endUpdate} when the transaction ends.
     */
    updateObserver(observer: IObserver, observable: IObservable<any, any>): void;
}
declare let _recomputeInitiallyAndOnChange: typeof recomputeInitiallyAndOnChange;
export declare function _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange: typeof _recomputeInitiallyAndOnChange): void;
declare let _keepObserved: typeof keepObserved;
export declare function _setKeepObserved(keepObserved: typeof _keepObserved): void;
declare let _derived: typeof derivedOpts;
/**
 * @internal
 * This is to allow splitting files.
*/
export declare function _setDerivedOpts(derived: typeof _derived): void;
export declare abstract class ConvenientObservable<T, TChange> implements IObservable<T, TChange> {
    get TChange(): TChange;
    abstract get(): T;
    reportChanges(): void;
    abstract addObserver(observer: IObserver): void;
    abstract removeObserver(observer: IObserver): void;
    /** @sealed */
    read(reader: IReader | undefined): T;
    /** @sealed */
    map<TNew>(fn: (value: T, reader: IReader) => TNew): IObservable<TNew>;
    map<TNew>(owner: DebugOwner, fn: (value: T, reader: IReader) => TNew): IObservable<TNew>;
    /**
     * @sealed
     * Converts an observable of an observable value into a direct observable of the value.
    */
    flatten<TNew>(this: IObservable<IObservable<TNew, any>>): IObservable<TNew, unknown>;
    recomputeInitiallyAndOnChange(store: DisposableStore, handleValue?: (value: T) => void): IObservable<T>;
    /**
     * Ensures that this observable is observed. This keeps the cache alive.
     * However, in case of deriveds, it does not force eager evaluation (only when the value is read/get).
     * Use `recomputeInitiallyAndOnChange` for eager evaluation.
     */
    keepObserved(store: DisposableStore): IObservable<T>;
    abstract get debugName(): string;
    protected get debugValue(): T;
}
export declare abstract class BaseObservable<T, TChange = void> extends ConvenientObservable<T, TChange> {
    protected readonly observers: Set<IObserver>;
    addObserver(observer: IObserver): void;
    removeObserver(observer: IObserver): void;
    protected onFirstObserverAdded(): void;
    protected onLastObserverRemoved(): void;
}
/**
 * Starts a transaction in which many observables can be changed at once.
 * {@link fn} should start with a JS Doc using `@description` to give the transaction a debug name.
 * Reaction run on demand or when the transaction ends.
 */
export declare function transaction(fn: (tx: ITransaction) => void, getDebugName?: () => string): void;
export declare function globalTransaction(fn: (tx: ITransaction) => void): void;
export declare function asyncTransaction(fn: (tx: ITransaction) => Promise<void>, getDebugName?: () => string): Promise<void>;
/**
 * Allows to chain transactions.
 */
export declare function subtransaction(tx: ITransaction | undefined, fn: (tx: ITransaction) => void, getDebugName?: () => string): void;
export declare class TransactionImpl implements ITransaction {
    readonly _fn: Function;
    private readonly _getDebugName?;
    private updatingObservers;
    constructor(_fn: Function, _getDebugName?: (() => string) | undefined);
    getDebugName(): string | undefined;
    updateObserver(observer: IObserver, observable: IObservable<any>): void;
    finish(): void;
}
/**
 * A settable observable.
 */
export interface ISettableObservable<T, TChange = void> extends IObservable<T, TChange>, ISettable<T, TChange> {
}
/**
 * Creates an observable value.
 * Observers get informed when the value changes.
 * @template TChange An arbitrary type to describe how or why the value changed. Defaults to `void`.
 * Observers will receive every single change value.
 */
export declare function observableValue<T, TChange = void>(name: string, initialValue: T): ISettableObservable<T, TChange>;
export declare function observableValue<T, TChange = void>(owner: object, initialValue: T): ISettableObservable<T, TChange>;
export declare class ObservableValue<T, TChange = void> extends BaseObservable<T, TChange> implements ISettableObservable<T, TChange> {
    private readonly _debugNameData;
    private readonly _equalityComparator;
    protected _value: T;
    get debugName(): string;
    constructor(_debugNameData: DebugNameData, initialValue: T, _equalityComparator: EqualityComparer<T>);
    get(): T;
    set(value: T, tx: ITransaction | undefined, change: TChange): void;
    toString(): string;
    protected _setValue(newValue: T): void;
}
/**
 * A disposable observable. When disposed, its value is also disposed.
 * When a new value is set, the previous value is disposed.
 */
export declare function disposableObservableValue<T extends IDisposable | undefined, TChange = void>(nameOrOwner: string | object, initialValue: T): ISettableObservable<T, TChange> & IDisposable;
export declare class DisposableObservableValue<T extends IDisposable | undefined, TChange = void> extends ObservableValue<T, TChange> implements IDisposable {
    protected _setValue(newValue: T): void;
    dispose(): void;
}
export interface IChangeTracker {
    /**
     * Returns if this change should cause an invalidation.
     * Implementations can record changes.
    */
    handleChange(context: IChangeContext): boolean;
}
export interface IChangeContext {
    readonly changedObservable: IObservable<any, any>;
    readonly change: unknown;
    /**
     * Returns if the given observable caused the change.
     */
    didChange<T, TChange>(observable: IObservable<T, TChange>): this is {
        change: TChange;
    };
}
export {};
