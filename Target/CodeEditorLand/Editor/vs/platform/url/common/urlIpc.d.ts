import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { URI } from '../../../base/common/uri.js';
import { Client, IChannel, IClientRouter, IConnectionHub, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { ILogService } from '../../log/common/log.js';
import { IOpenURLOptions, IURLHandler } from './url.js';
export declare class URLHandlerChannel implements IServerChannel {
    private handler;
    constructor(handler: IURLHandler);
    listen<T>(_: unknown, event: string): Event<T>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
}
export declare class URLHandlerChannelClient implements IURLHandler {
    private channel;
    constructor(channel: IChannel);
    handleURL(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
}
export declare class URLHandlerRouter implements IClientRouter<string> {
    private next;
    private readonly logService;
    constructor(next: IClientRouter<string>, logService: ILogService);
    routeCall(hub: IConnectionHub<string>, command: string, arg?: any, cancellationToken?: CancellationToken): Promise<Client<string>>;
    routeEvent(_: IConnectionHub<string>, event: string): Promise<Client<string>>;
}
