import { IObservable } from './base.js';
export declare class ObservableLazy<T> {
    private readonly _computeValue;
    private readonly _value;
    get cachedValue(): IObservable<T | undefined>;
    constructor(_computeValue: () => T);
    getValue(): T;
}
export declare class ObservablePromise<T> {
    static fromFn<T>(fn: () => Promise<T>): ObservablePromise<T>;
    private readonly _value;
    readonly promise: Promise<T>;
    readonly promiseResult: IObservable<PromiseResult<T> | undefined>;
    constructor(promise: Promise<T>);
}
export declare class PromiseResult<T> {
    readonly data: T | undefined;
    readonly error: unknown | undefined;
    constructor(data: T | undefined, error: unknown | undefined);
    getDataOrThrow(): T;
}
export declare class ObservableLazyPromise<T> {
    private readonly _computePromise;
    private readonly _lazyValue;
    readonly cachedPromiseResult: IObservable<PromiseResult<T> | undefined, unknown>;
    constructor(_computePromise: () => Promise<T>);
    getPromise(): Promise<T>;
}
