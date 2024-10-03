export interface MessagePortMain extends NodeJS.EventEmitter {
    on(event: 'close', listener: Function): this;
    off(event: 'close', listener: Function): this;
    once(event: 'close', listener: Function): this;
    addListener(event: 'close', listener: Function): this;
    removeListener(event: 'close', listener: Function): this;
    on(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    off(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    once(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    addListener(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    removeListener(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    close(): void;
    postMessage(message: any, transfer?: MessagePortMain[]): void;
    start(): void;
}
export interface MessageEvent {
    data: any;
    ports: MessagePortMain[];
}
export interface ParentPort extends NodeJS.EventEmitter {
    on(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    off(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    once(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    addListener(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    removeListener(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    postMessage(message: any): void;
}
export interface UtilityNodeJSProcess extends NodeJS.Process {
    parentPort: ParentPort;
}
export declare function isUtilityProcess(process: NodeJS.Process): process is UtilityNodeJSProcess;
