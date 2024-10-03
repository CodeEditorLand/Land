export type EqualityComparer<T> = (a: T, b: T) => boolean;
export declare const strictEquals: EqualityComparer<any>;
export declare function itemsEquals<T>(itemEquals?: EqualityComparer<T>): EqualityComparer<readonly T[]>;
export declare function jsonStringifyEquals<T>(): EqualityComparer<T>;
export declare function itemEquals<T extends {
    equals(other: T): boolean;
}>(): EqualityComparer<T>;
export declare function equalsIfDefined<T>(v1: T | undefined | null, v2: T | undefined | null, equals: EqualityComparer<T>): boolean;
export declare function equalsIfDefined<T>(equals: EqualityComparer<T>): EqualityComparer<T | undefined | null>;
export declare function structuralEquals<T>(a: T, b: T): boolean;
export declare function getStructuralKey(t: unknown): string;
