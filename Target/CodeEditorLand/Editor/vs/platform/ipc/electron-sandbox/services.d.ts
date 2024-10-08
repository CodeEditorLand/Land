import { IChannel, ProxyChannel } from '../../../base/parts/ipc/common/ipc.js';
import { ServiceIdentifier } from '../../instantiation/common/instantiation.js';
import { IRemoteService } from '../common/services.js';
type ChannelClientCtor<T> = {
    new (channel: IChannel, ...args: any[]): T;
};
export interface IRemoteServiceWithChannelClientOptions<T> {
    readonly channelClientCtor: ChannelClientCtor<T>;
}
export interface IRemoteServiceWithProxyOptions {
    readonly proxyOptions?: ProxyChannel.ICreateProxyServiceOptions;
}
export declare function registerMainProcessRemoteService<T>(id: ServiceIdentifier<T>, channelName: string, options?: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions): void;
export declare const ISharedProcessService: ServiceIdentifier<ISharedProcessService>;
export interface ISharedProcessService extends IRemoteService {
    /**
     * Allows to create a `MessagePort` connection between the
     * shared process and the renderer process.
     *
     * Use this only when you need raw IPC to the shared process
     * via `postMessage` and `on('message')` of special data structures
     * like typed arrays.
     *
     * Callers have to call `port.start()` after having installed
     * listeners to enable the data flow.
     */
    createRawConnection(): Promise<MessagePort>;
    notifyRestored(): void;
}
export declare function registerSharedProcessRemoteService<T>(id: ServiceIdentifier<T>, channelName: string, options?: IRemoteServiceWithChannelClientOptions<T> | IRemoteServiceWithProxyOptions): void;
export {};
