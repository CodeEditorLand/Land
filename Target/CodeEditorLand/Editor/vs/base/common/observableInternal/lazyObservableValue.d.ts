import { EqualityComparer } from './commonFacade/deps.js';
import { BaseObservable, IObserver, ISettableObservable, ITransaction } from './base.js';
import { DebugNameData } from './debugName.js';
/**
 * Holds off updating observers until the value is actually read.
*/
export declare class LazyObservableValue<T, TChange = void> extends BaseObservable<T, TChange> implements ISettableObservable<T, TChange> {
    private readonly _debugNameData;
    private readonly _equalityComparator;
    protected _value: T;
    private _isUpToDate;
    private readonly _deltas;
    get debugName(): string;
    constructor(_debugNameData: DebugNameData, initialValue: T, _equalityComparator: EqualityComparer<T>);
    get(): T;
    private _update;
    private _updateCounter;
    private _beginUpdate;
    private _endUpdate;
    addObserver(observer: IObserver): void;
    removeObserver(observer: IObserver): void;
    set(value: T, tx: ITransaction | undefined, change: TChange): void;
    toString(): string;
    protected _setValue(newValue: T): void;
}
