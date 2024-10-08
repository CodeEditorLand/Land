import { Disposable } from '../common/lifecycle.js';
export declare class BroadcastDataChannel<T> extends Disposable {
    private readonly channelName;
    private broadcastChannel;
    private readonly _onDidReceiveData;
    readonly onDidReceiveData: import("../common/event.js").Event<T>;
    constructor(channelName: string);
    private createBroadcastChannel;
    /**
     * Sends the data to other BroadcastChannel objects set up for this channel. Data can be structured objects, e.g. nested objects and arrays.
     * @param data data to broadcast
     */
    postData(data: T): void;
}
