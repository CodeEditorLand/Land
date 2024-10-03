export declare function deepClone<T>(obj: T): T;
export declare function deepFreeze<T>(obj: T): T;
export declare function cloneAndChange(obj: any, changer: (orig: any) => any): any;
export declare function mixin(destination: any, source: any, overwrite?: boolean): any;
export declare function equals(one: any, other: any): boolean;
export declare function safeStringify(obj: any): string;
type obj = {
    [key: string]: any;
};
export declare function distinct(base: obj, target: obj): obj;
export declare function getCaseInsensitive(target: obj, key: string): unknown;
export declare function filter(obj: obj, predicate: (key: string, value: any) => boolean): obj;
export declare function getAllPropertyNames(obj: object): string[];
export declare function getAllMethodNames(obj: object): string[];
export declare function createProxyObject<T extends object>(methodNames: string[], invoke: (method: string, args: unknown[]) => unknown): T;
export declare function mapValues<T extends {}, R>(obj: T, fn: (value: T[keyof T], key: string) => R): {
    [K in keyof T]: R;
};
export {};
