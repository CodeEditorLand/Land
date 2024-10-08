import type { VSBuffer } from '../../../../base/common/buffer.js';
import type { CancellationToken } from '../../../../base/common/cancellation.js';
export interface IRPCProtocol {
    /**
     * Returns a proxy to an object addressable/named in the extension host process or in the renderer process.
     */
    getProxy<T>(identifier: ProxyIdentifier<T>): Proxied<T>;
    /**
     * Register manually created instance.
     */
    set<T, R extends T>(identifier: ProxyIdentifier<T>, instance: R): R;
    /**
     * Assert these identifiers are already registered via `.set`.
     */
    assertRegistered(identifiers: ProxyIdentifier<any>[]): void;
    /**
     * Wait for the write buffer (if applicable) to become empty.
     */
    drain(): Promise<void>;
    dispose(): void;
}
export declare class ProxyIdentifier<T> {
    static count: number;
    _proxyIdentifierBrand: void;
    readonly sid: string;
    readonly nid: number;
    constructor(sid: string);
}
export declare function createProxyIdentifier<T>(identifier: string): ProxyIdentifier<T>;
/**
 * Mapped-type that replaces all JSONable-types with their toJSON-result type
 */
export type Dto<T> = T extends {
    toJSON(): infer U;
} ? U : T extends VSBuffer ? T : T extends CancellationToken ? T : T extends Function ? never : T extends object ? {
    [k in keyof T]: Dto<T[k]>;
} : T;
export type Proxied<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: {
        [K in keyof A]: Dto<A[K]>;
    }) => Promise<Dto<Awaited<R>>> : never;
};
export declare function getStringIdentifierForProxy(nid: number): string;
/**
 * Marks the object as containing buffers that should be serialized more efficiently.
 */
export declare class SerializableObjectWithBuffers<T> {
    readonly value: T;
    constructor(value: T);
}
