import { Disposable } from '../common/lifecycle.js';
export declare class BroadcastDataChannel<T> extends Disposable {
    private readonly channelName;
    private broadcastChannel;
    private readonly _onDidReceiveData;
    readonly onDidReceiveData: import("../common/event.js").Event<T>;
    constructor(channelName: string);
    private createBroadcastChannel;
    postData(data: T): void;
}
