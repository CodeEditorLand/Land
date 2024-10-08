interface IVerifier<T> {
    verify(value: unknown): T;
}
declare abstract class Verifier<T> implements IVerifier<T> {
    protected readonly defaultValue: T;
    constructor(defaultValue: T);
    verify(value: unknown): T;
    protected abstract isType(value: unknown): value is T;
}
export declare class BooleanVerifier extends Verifier<boolean> {
    protected isType(value: unknown): value is boolean;
}
export declare class NumberVerifier extends Verifier<number> {
    protected isType(value: unknown): value is number;
}
export declare class SetVerifier<T> extends Verifier<Set<T>> {
    protected isType(value: unknown): value is Set<T>;
}
export declare class EnumVerifier<T> extends Verifier<T> {
    private readonly allowedValues;
    constructor(defaultValue: T, allowedValues: ReadonlyArray<T>);
    protected isType(value: unknown): value is T;
}
export declare class ObjectVerifier<T extends Object> extends Verifier<T> {
    private readonly verifier;
    constructor(defaultValue: T, verifier: {
        [K in keyof T]: IVerifier<T[K]>;
    });
    verify(value: unknown): T;
    protected isType(value: unknown): value is T;
}
export declare function verifyObject<T extends Object>(verifiers: {
    [K in keyof T]: IVerifier<T[K]>;
}, value: Object): T;
export {};
