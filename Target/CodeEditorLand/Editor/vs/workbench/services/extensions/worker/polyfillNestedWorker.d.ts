declare function postMessage(data: any, transferables?: Transferable[]): void;
export declare class NestedWorker extends EventTarget implements Worker {
    onmessage: ((this: Worker, ev: MessageEvent<any>) => any) | null;
    onmessageerror: ((this: Worker, ev: MessageEvent<any>) => any) | null;
    onerror: ((this: AbstractWorker, ev: ErrorEvent) => any) | null;
    readonly terminate: () => void;
    readonly postMessage: (message: any, options?: any) => void;
    constructor(nativePostMessage: typeof postMessage, stringOrUrl: string | URL, options?: WorkerOptions);
}
export {};
