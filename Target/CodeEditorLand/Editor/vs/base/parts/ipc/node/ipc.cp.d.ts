import { CancellationToken } from '../../../common/cancellation.js';
import { Event } from '../../../common/event.js';
import { IDisposable } from '../../../common/lifecycle.js';
import { ChannelServer as IPCServer, IChannel, IChannelClient } from '../common/ipc.js';
/**
 * This implementation doesn't perform well since it uses base64 encoding for buffers.
 * We should move all implementations to use named ipc.net, so we stop depending on cp.fork.
 */
export declare class Server<TContext extends string> extends IPCServer<TContext> {
    constructor(ctx: TContext);
}
export interface IIPCOptions {
    /**
     * A descriptive name for the server this connection is to. Used in logging.
     */
    serverName: string;
    /**
     * Time in millies before killing the ipc process. The next request after killing will start it again.
     */
    timeout?: number;
    /**
     * Arguments to the module to execute.
     */
    args?: string[];
    /**
     * Environment key-value pairs to be passed to the process that gets spawned for the ipc.
     */
    env?: any;
    /**
     * Allows to assign a debug port for debugging the application executed.
     */
    debug?: number;
    /**
     * Allows to assign a debug port for debugging the application and breaking it on the first line.
     */
    debugBrk?: number;
    /**
     * If set, starts the fork with empty execArgv. If not set, execArgv from the parent process are inherited,
     * except --inspect= and --inspect-brk= which are filtered as they would result in a port conflict.
     */
    freshExecArgv?: boolean;
    /**
     * Enables our createQueuedSender helper for this Client. Uses a queue when the internal Node.js queue is
     * full of messages - see notes on that method.
     */
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
