import { CancellationToken } from '../../../common/cancellation.js';
import { Event } from '../../../common/event.js';
import { IDisposable } from '../../../common/lifecycle.js';
import { ChannelServer as IPCServer, IChannel, IChannelClient } from '../common/ipc.js';
export declare class Server<TContext extends string> extends IPCServer<TContext> {
    constructor(ctx: TContext);
}
export interface IIPCOptions {
    serverName: string;
    timeout?: number;
    args?: string[];
    env?: any;
    debug?: number;
    debugBrk?: number;
    freshExecArgv?: boolean;
    useQueue?: boolean;
}
export declare class Client implements IChannelClient, IDisposable {
    private modulePath;
    private options;
    private disposeDelayer;
    private activeRequests;
    private child;
    private _client;
    private channels;
    private readonly _onDidProcessExit;
    readonly onDidProcessExit: Event<{
        code: number;
        signal: string;
    }>;
    constructor(modulePath: string, options: IIPCOptions);
    getChannel<T extends IChannel>(channelName: string): T;
    protected requestPromise<T>(channelName: string, name: string, arg?: any, cancellationToken?: Readonly<CancellationToken>): Promise<T>;
    protected requestEvent<T>(channelName: string, name: string, arg?: any): Event<T>;
    private get client();
    private getCachedChannel;
    private disposeClient;
    dispose(): void;
}
