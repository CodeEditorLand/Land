export interface IDisposableTracker {
    trackDisposable(disposable: IDisposable): void;
    setParent(child: IDisposable, parent: IDisposable | null): void;
    markAsDisposed(disposable: IDisposable): void;
    markAsSingleton(disposable: IDisposable): void;
}
export interface DisposableInfo {
    value: IDisposable;
    source: string | null;
    parent: IDisposable | null;
    isSingleton: boolean;
    idx: number;
}
export declare class DisposableTracker implements IDisposableTracker {
    private static idx;
    private readonly livingDisposables;
    private getDisposableData;
    trackDisposable(d: IDisposable): void;
    setParent(child: IDisposable, parent: IDisposable | null): void;
    markAsDisposed(x: IDisposable): void;
    markAsSingleton(disposable: IDisposable): void;
    private getRootParent;
    getTrackedDisposables(): IDisposable[];
    computeLeakingDisposables(maxReported?: number, preComputedLeaks?: DisposableInfo[]): {
        leaks: DisposableInfo[];
        details: string;
    } | undefined;
}
export declare function setDisposableTracker(tracker: IDisposableTracker | null): void;
export declare function trackDisposable<T extends IDisposable>(x: T): T;
export declare function markAsDisposed(disposable: IDisposable): void;
export declare function markAsSingleton<T extends IDisposable>(singleton: T): T;
export interface IDisposable {
    dispose(): void;
}
export declare function isDisposable<E extends any>(thing: E): thing is E & IDisposable;
export declare function dispose<T extends IDisposable>(disposable: T): T;
export declare function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined;
export declare function dispose<T extends IDisposable, A extends Iterable<T> = Iterable<T>>(disposables: A): A;
export declare function dispose<T extends IDisposable>(disposables: Array<T>): Array<T>;
export declare function dispose<T extends IDisposable>(disposables: ReadonlyArray<T>): ReadonlyArray<T>;
export declare function disposeIfDisposable<T extends IDisposable | object>(disposables: Array<T>): Array<T>;
export declare function combinedDisposable(...disposables: IDisposable[]): IDisposable;
export declare function toDisposable(fn: () => void): IDisposable;
export declare class DisposableStore implements IDisposable {
    static DISABLE_DISPOSED_WARNING: boolean;
    private readonly _toDispose;
    private _isDisposed;
    constructor();
    dispose(): void;
    get isDisposed(): boolean;
    clear(): void;
    add<T extends IDisposable>(o: T): T;
    delete<T extends IDisposable>(o: T): void;
    deleteAndLeak<T extends IDisposable>(o: T): void;
}
export declare abstract class Disposable implements IDisposable {
    static readonly None: Readonly<IDisposable>;
    protected readonly _store: DisposableStore;
    constructor();
    dispose(): void;
    protected _register<T extends IDisposable>(o: T): T;
}
export declare class MutableDisposable<T extends IDisposable> implements IDisposable {
    private _value?;
    private _isDisposed;
    constructor();
    get value(): T | undefined;
    set value(value: T | undefined);
    clear(): void;
    dispose(): void;
    clearAndLeak(): T | undefined;
}
export declare class MandatoryMutableDisposable<T extends IDisposable> implements IDisposable {
    private readonly _disposable;
    private _isDisposed;
    constructor(initialValue: T);
    get value(): T;
    set value(value: T);
    dispose(): void;
}
export declare class RefCountedDisposable {
    private readonly _disposable;
    private _counter;
    constructor(_disposable: IDisposable);
    acquire(): this;
    release(): this;
}
export declare class SafeDisposable implements IDisposable {
    dispose: () => void;
    unset: () => void;
    isset: () => boolean;
    constructor();
    set(fn: Function): this;
}
export interface IReference<T> extends IDisposable {
    readonly object: T;
}
export declare abstract class ReferenceCollection<T> {
    private readonly references;
    acquire(key: string, ...args: any[]): IReference<T>;
    protected abstract createReferencedObject(key: string, ...args: any[]): T;
    protected abstract destroyReferencedObject(key: string, object: T): void;
}
export declare class AsyncReferenceCollection<T> {
    private referenceCollection;
    constructor(referenceCollection: ReferenceCollection<Promise<T>>);
    acquire(key: string, ...args: any[]): Promise<IReference<T>>;
}
export declare class ImmortalReference<T> implements IReference<T> {
    object: T;
    constructor(object: T);
    dispose(): void;
}
export declare function disposeOnReturn(fn: (store: DisposableStore) => void): void;
export declare class DisposableMap<K, V extends IDisposable = IDisposable> implements IDisposable {
    private readonly _store;
    private _isDisposed;
    constructor();
    dispose(): void;
    clearAndDisposeAll(): void;
    has(key: K): boolean;
    get size(): number;
    get(key: K): V | undefined;
    set(key: K, value: V, skipDisposeOnOverwrite?: boolean): void;
    deleteAndDispose(key: K): void;
    deleteAndLeak(key: K): V | undefined;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
}
