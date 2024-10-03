import type { VSBuffer } from '../../../../base/common/buffer.js';
import type { CancellationToken } from '../../../../base/common/cancellation.js';
export interface IRPCProtocol {
    getProxy<T>(identifier: ProxyIdentifier<T>): Proxied<T>;
    set<T, R extends T>(identifier: ProxyIdentifier<T>, instance: R): R;
    assertRegistered(identifiers: ProxyIdentifier<any>[]): void;
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
export declare class SerializableObjectWithBuffers<T> {
    readonly value: T;
    constructor(value: T);
}
