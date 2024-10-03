export declare function ok(value?: unknown, message?: string): void;
export declare function assertNever(value: never, message?: string): never;
export declare function assert(condition: boolean, message?: string): asserts condition;
export declare function softAssert(condition: boolean): void;
export declare function assertFn(condition: () => boolean): void;
export declare function checkAdjacentItems<T>(items: readonly T[], predicate: (item1: T, item2: T) => boolean): boolean;
