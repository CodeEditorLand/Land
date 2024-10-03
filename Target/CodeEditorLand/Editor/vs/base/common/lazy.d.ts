export declare class Lazy<T> {
    private readonly executor;
    private _didRun;
    private _value?;
    private _error;
    constructor(executor: () => T);
    get hasValue(): boolean;
    get value(): T;
    get rawValue(): T | undefined;
}
