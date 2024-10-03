import { DisposableStore, IDisposable } from './lifecycle.js';
export interface CancellationToken {
    readonly isCancellationRequested: boolean;
    readonly onCancellationRequested: (listener: (e: any) => any, thisArgs?: any, disposables?: IDisposable[]) => IDisposable;
}
export declare namespace CancellationToken {
    function isCancellationToken(thing: unknown): thing is CancellationToken;
    const None: Readonly<CancellationToken>;
    const Cancelled: Readonly<CancellationToken>;
}
export declare class CancellationTokenSource {
    private _token?;
    private _parentListener?;
    constructor(parent?: CancellationToken);
    get token(): CancellationToken;
    cancel(): void;
    dispose(cancel?: boolean): void;
}
export declare function cancelOnDispose(store: DisposableStore): CancellationToken;
