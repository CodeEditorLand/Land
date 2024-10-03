export declare function isString(str: unknown): str is string;
export declare function isStringArray(value: unknown): value is string[];
export declare function isObject(obj: unknown): obj is Object;
export declare function isTypedArray(obj: unknown): obj is Object;
export declare function isNumber(obj: unknown): obj is number;
export declare function isIterable<T>(obj: unknown): obj is Iterable<T>;
export declare function isBoolean(obj: unknown): obj is boolean;
export declare function isUndefined(obj: unknown): obj is undefined;
export declare function isDefined<T>(arg: T | null | undefined): arg is T;
export declare function isUndefinedOrNull(obj: unknown): obj is undefined | null;
export declare function assertType(condition: unknown, type?: string): asserts condition;
export declare function assertIsDefined<T>(arg: T | null | undefined): T;
export declare function assertAllDefined<T1, T2>(t1: T1 | null | undefined, t2: T2 | null | undefined): [T1, T2];
export declare function assertAllDefined<T1, T2, T3>(t1: T1 | null | undefined, t2: T2 | null | undefined, t3: T3 | null | undefined): [T1, T2, T3];
export declare function assertAllDefined<T1, T2, T3, T4>(t1: T1 | null | undefined, t2: T2 | null | undefined, t3: T3 | null | undefined, t4: T4 | null | undefined): [T1, T2, T3, T4];
export declare function isEmptyObject(obj: unknown): obj is object;
export declare function isFunction(obj: unknown): obj is Function;
export declare function areFunctions(...objects: unknown[]): boolean;
export type TypeConstraint = string | Function;
export declare function validateConstraints(args: unknown[], constraints: Array<TypeConstraint | undefined>): void;
export declare function validateConstraint(arg: unknown, constraint: TypeConstraint | undefined): void;
export declare function upcast<Base, Sub extends Base>(x: Sub): Base;
type AddFirstParameterToFunction<T, TargetFunctionsReturnType, FirstParameter> = T extends (...args: any[]) => TargetFunctionsReturnType ? (firstArg: FirstParameter, ...args: Parameters<T>) => ReturnType<T> : T;
export type AddFirstParameterToFunctions<Target, TargetFunctionsReturnType, FirstParameter> = {
    [K in keyof Target]: AddFirstParameterToFunction<Target[K], TargetFunctionsReturnType, FirstParameter>;
};
export type AtLeastOne<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
export type OmitOptional<T> = {
    [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
export type SingleOrMany<T> = T | T[];
export type DeepRequiredNonNullable<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequiredNonNullable<T[P]> : Required<NonNullable<T[P]>>;
};
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : Partial<T[P]>;
};
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;
export {};
