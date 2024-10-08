import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IRequestContext, IRequestOptions } from '../../../base/parts/request/common/request.js';
import { AuthInfo, Credentials, IRequestService } from './request.js';
export declare class RequestChannel implements IServerChannel {
    private readonly service;
    constructor(service: IRequestService);
    listen(context: any, event: string): Event<any>;
    call(context: any, command: string, args?: any, token?: CancellationToken): Promise<any>;
}
export declare class RequestChannelClient implements IRequestService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    constructor(channel: IChannel);
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
