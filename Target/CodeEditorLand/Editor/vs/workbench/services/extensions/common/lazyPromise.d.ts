export declare class LazyPromise implements Promise<any> {
    private _actual;
    private _actualOk;
    private _actualErr;
    private _hasValue;
    private _value;
    protected _hasErr: boolean;
    protected _err: any;
    constructor();
    get [Symbol.toStringTag](): string;
    private _ensureActual;
    resolveOk(value: any): void;
    resolveErr(err: any): void;
    then(success: any, error: any): any;
    catch(error: any): any;
    finally(callback: () => void): any;
}
export declare class CanceledLazyPromise extends LazyPromise {
    constructor();
}
