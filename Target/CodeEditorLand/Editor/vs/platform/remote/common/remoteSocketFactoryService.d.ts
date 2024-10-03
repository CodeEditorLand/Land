import { IDisposable } from '../../../base/common/lifecycle.js';
import { ISocket } from '../../../base/parts/ipc/common/ipc.net.js';
import { RemoteConnectionOfType, RemoteConnectionType, RemoteConnection } from './remoteAuthorityResolver.js';
export declare const IRemoteSocketFactoryService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IRemoteSocketFactoryService>;
export interface IRemoteSocketFactoryService {
    readonly _serviceBrand: undefined;
    register<T extends RemoteConnectionType>(type: T, factory: ISocketFactory<T>): IDisposable;
    connect(connectTo: RemoteConnection, path: string, query: string, debugLabel: string): Promise<ISocket>;
}
export interface ISocketFactory<T extends RemoteConnectionType> {
    supports(connectTo: RemoteConnectionOfType<T>): boolean;
    connect(connectTo: RemoteConnectionOfType<T>, path: string, query: string, debugLabel: string): Promise<ISocket>;
}
export declare class RemoteSocketFactoryService implements IRemoteSocketFactoryService {
    readonly _serviceBrand: undefined;
    private readonly factories;
    register<T extends RemoteConnectionType>(type: T, factory: ISocketFactory<T>): IDisposable;
    private getSocketFactory;
    connect(connectTo: RemoteConnection, path: string, query: string, debugLabel: string): Promise<ISocket>;
}
