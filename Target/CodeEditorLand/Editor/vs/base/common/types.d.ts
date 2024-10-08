/**
 * @returns whether the provided parameter is a JavaScript String or not.
 */
export declare function isString(str: unknown): str is string;
/**
 * @returns whether the provided parameter is a JavaScript Array and each element in the array is a string.
 */
export declare function isStringArray(value: unknown): value is string[];
/**
 * @returns whether the provided parameter is of type `object` but **not**
 *	`null`, an `array`, a `regexp`, nor a `date`.
 */
export declare function isObject(obj: unknown): obj is Object;
/**
 * @returns whether the provided parameter is of type `Buffer` or Uint8Array dervived type
 */
export declare function isTypedArray(obj: unknown): obj is Object;
/**
 * In **contrast** to just checking `typeof` this will return `false` for `NaN`.
 * @returns whether the provided parameter is a JavaScript Number or not.
 */
export declare function isNumber(obj: unknown): obj is number;
/**
 * @returns whether the provided parameter is an Iterable, casting to the given generic
 */
export declare function isIterable<T>(obj: unknown): obj is Iterable<T>;
/**
 * @returns whether the provided parameter is a JavaScript Boolean or not.
 */
export declare function isBoolean(obj: unknown): obj is boolean;
/**
 * @returns whether the provided parameter is undefined.
 */
export declare function isUndefined(obj: unknown): obj is undefined;
/**
 * @returns whether the provided parameter is defined.
 */
export declare function isDefined<T>(arg: T | null | undefined): arg is T;
/**
 * @returns whether the provided parameter is undefined or null.
 */
export declare function isUndefinedOrNull(obj: unknown): obj is undefined | null;
export declare function assertType(condition: unknown, type?: string): asserts condition;
/**
 * Asserts that the argument passed in is neither undefined nor null.
 */
export declare function assertIsDefined<T>(arg: T | null | undefined): T;
/**
 * Asserts that each argument passed in is neither undefined nor null.
 */
export declare function assertAllDefined<T1, T2>(t1: T1 | null | undefined, t2: T2 | null | undefined): [T1, T2];
export declare function assertAllDefined<T1, T2, T3>(t1: T1 | null | undefined, t2: T2 | null | undefined, t3: T3 | null | undefined): [T1, T2, T3];
export declare function assertAllDefined<T1, T2, T3, T4>(t1: T1 | null | undefined, t2: T2 | null | undefined, t3: T3 | null | undefined, t4: T4 | null | undefined): [T1, T2, T3, T4];
/**
 * @returns whether the provided parameter is an empty JavaScript Object or not.
 */
export declare function isEmptyObject(obj: unknown): obj is object;
/**
 * @returns whether the provided parameter is a JavaScript Function or not.
 */
export declare function isFunction(obj: unknown): obj is Function;
/**
 * @returns whether the provided parameters is are JavaScript Function or not.
 */
export declare function areFunctions(...objects: unknown[]): boolean;
export type TypeConstraint = string | Function;
export declare function validateConstraints(args: unknown[], constraints: Array<TypeConstraint | undefined>): void;
export declare function validateConstraint(arg: unknown, constraint: TypeConstraint | undefined): void;
/**
 * Helper type assertion that safely upcasts a type to a supertype.
 *
 * This can be used to make sure the argument correctly conforms to the subtype while still being able to pass it
 * to contexts that expects the supertype.
 */
export declare function upcast<Base, Sub extends Base = Base>(x: Sub): Base;
type AddFirstParameterToFunction<T, TargetFunctionsReturnType, FirstParameter> = T extends (...args: any[]) => TargetFunctionsReturnType ? (firstArg: FirstParameter, ...args: Parameters<T>) => ReturnType<T> : T;
/**
 * Allows to add a first parameter to functions of a type.
 */
export type AddFirstParameterToFunctions<Target, TargetFunctionsReturnType, FirstParameter> = {
    [K in keyof Target]: AddFirstParameterToFunction<Target[K], TargetFunctionsReturnType, FirstParameter>;
};
/**
 * Given an object with all optional properties, requires at least one to be defined.
 * i.e. AtLeastOne<MyObject>;
 */
export type AtLeastOne<T, U = {
    [K in keyof T]: Pick<T, K>;
}> = Partial<T> & U[keyof U];
/**
 * Only picks the non-optional properties of a type.
 */
export type OmitOptional<T> = {
    [K in keyof T as T[K] extends Required<T>[K] ? K : never]: T[K];
};
/**
 * A type that removed readonly-less from all properties of `T`
 */
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
/**
 * A single object or an array of the objects.
 */
export type SingleOrMany<T> = T | T[];
/**
 * A type that recursively makes all properties of `T` required
 */
export type DeepRequiredNonNullable<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequiredNonNullable<T[P]> : Required<NonNullable<T[P]>>;
};
/**
 * Represents a type that is a partial version of a given type `T`, where all properties are optional and can be deeply nested.
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : Partial<T[P]>;
};
/**
 * Represents a type that is a partial version of a given type `T`, except a subset.
 */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;
export {};
