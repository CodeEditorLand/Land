import { IChangeContext, IObservable, IObserver, IReader } from './base.js';
import { DebugNameData, IDebugNameData } from './debugName.js';
import { DisposableStore, IDisposable } from './commonFacade/deps.js';
export declare function autorun(fn: (reader: IReader) => void): IDisposable;
export declare function autorunOpts(options: IDebugNameData & {}, fn: (reader: IReader) => void): IDisposable;
export declare function autorunHandleChanges<TChangeSummary>(options: IDebugNameData & {
    createEmptyChangeSummary?: () => TChangeSummary;
    handleChange: (context: IChangeContext, changeSummary: TChangeSummary) => boolean;
}, fn: (reader: IReader, changeSummary: TChangeSummary) => void): IDisposable;
export declare function autorunWithStoreHandleChanges<TChangeSummary>(options: IDebugNameData & {
    createEmptyChangeSummary?: () => TChangeSummary;
    handleChange: (context: IChangeContext, changeSummary: TChangeSummary) => boolean;
}, fn: (reader: IReader, changeSummary: TChangeSummary, store: DisposableStore) => void): IDisposable;
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
