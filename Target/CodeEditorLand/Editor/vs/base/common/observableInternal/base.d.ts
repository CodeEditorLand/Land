import { DebugNameData, DebugOwner } from './debugName.js';
import { DisposableStore, EqualityComparer, IDisposable } from './commonFacade/deps.js';
import type { derivedOpts } from './derived.js';
import { keepObserved, recomputeInitiallyAndOnChange } from './utils.js';
export interface IObservable<T, TChange = unknown> {
    get(): T;
    reportChanges(): void;
    addObserver(observer: IObserver): void;
    removeObserver(observer: IObserver): void;
    read(reader: IReader | undefined): T;
    map<TNew>(fn: (value: T, reader: IReader) => TNew): IObservable<TNew>;
    map<TNew>(owner: object, fn: (value: T, reader: IReader) => TNew): IObservable<TNew>;
    flatten<TNew>(this: IObservable<IObservable<TNew>>): IObservable<TNew>;
    recomputeInitiallyAndOnChange(store: DisposableStore, handleValue?: (value: T) => void): IObservable<T>;
    keepObserved(store: DisposableStore): IObservable<T>;
    readonly debugName: string;
    readonly TChange: TChange;
}
export interface IReader {
    readObservable<T>(observable: IObservable<T, any>): T;
}
export interface IObserver {
    beginUpdate<T>(observable: IObservable<T>): void;
    endUpdate<T>(observable: IObservable<T>): void;
    handlePossibleChange<T>(observable: IObservable<T>): void;
    handleChange<T, TChange>(observable: IObservable<T, TChange>, change: TChange): void;
}
export interface ISettable<T, TChange = void> {
    set(value: T, transaction: ITransaction | undefined, change: TChange): void;
}
export interface ITransaction {
    updateObserver(observer: IObserver, observable: IObservable<any, any>): void;
}
declare let _recomputeInitiallyAndOnChange: typeof recomputeInitiallyAndOnChange;
export declare function _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange: typeof _recomputeInitiallyAndOnChange): void;
declare let _keepObserved: typeof keepObserved;
export declare function _setKeepObserved(keepObserved: typeof _keepObserved): void;
declare let _derived: typeof derivedOpts;
export declare function _setDerivedOpts(derived: typeof _derived): void;
export declare abstract class ConvenientObservable<T, TChange> implements IObservable<T, TChange> {
    get TChange(): TChange;
    abstract get(): T;
    reportChanges(): void;
    abstract addObserver(observer: IObserver): void;
    abstract removeObserver(observer: IObserver): void;
    read(reader: IReader | undefined): T;
    map<TNew>(fn: (value: T, reader: IReader) => TNew): IObservable<TNew>;
    map<TNew>(owner: DebugOwner, fn: (value: T, reader: IReader) => TNew): IObservable<TNew>;
    flatten<TNew>(this: IObservable<IObservable<TNew, any>>): IObservable<TNew, unknown>;
    recomputeInitiallyAndOnChange(store: DisposableStore, handleValue?: (value: T) => void): IObservable<T>;
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
export declare function transaction(fn: (tx: ITransaction) => void, getDebugName?: () => string): void;
export declare function globalTransaction(fn: (tx: ITransaction) => void): void;
export declare function asyncTransaction(fn: (tx: ITransaction) => Promise<void>, getDebugName?: () => string): Promise<void>;
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
export interface ISettableObservable<T, TChange = void> extends IObservable<T, TChange>, ISettable<T, TChange> {
}
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
export declare function disposableObservableValue<T extends IDisposable | undefined, TChange = void>(nameOrOwner: string | object, initialValue: T): ISettableObservable<T, TChange> & IDisposable;
export declare class DisposableObservableValue<T extends IDisposable | undefined, TChange = void> extends ObservableValue<T, TChange> implements IDisposable {
    protected _setValue(newValue: T): void;
    dispose(): void;
}
export interface IChangeTracker {
    handleChange(context: IChangeContext): boolean;
}
export interface IChangeContext {
    readonly changedObservable: IObservable<any, any>;
    readonly change: unknown;
    didChange<T, TChange>(observable: IObservable<T, TChange>): this is {
        change: TChange;
    };
}
export {};
