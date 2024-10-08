import { VSBuffer } from '../../../base/common/buffer.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ManagedSocket, RemoteSocketHalf } from '../../../platform/remote/common/managedSocket.js';
import { IRemoteSocketFactoryService } from '../../../platform/remote/common/remoteSocketFactoryService.js';
import { ExtHostManagedSocketsShape, MainThreadManagedSocketsShape } from '../common/extHost.protocol.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
export declare class MainThreadManagedSockets extends Disposable implements MainThreadManagedSocketsShape {
    private readonly _remoteSocketFactoryService;
    private readonly _proxy;
    private readonly _registrations;
    private readonly _remoteSockets;
    constructor(extHostContext: IExtHostContext, _remoteSocketFactoryService: IRemoteSocketFactoryService);
    $registerSocketFactory(socketFactoryId: number): Promise<void>;
    $unregisterSocketFactory(socketFactoryId: number): Promise<void>;
    $onDidManagedSocketHaveData(socketId: number, data: VSBuffer): void;
    $onDidManagedSocketClose(socketId: number, error: string | undefined): void;
    $onDidManagedSocketEnd(socketId: number): void;
}
export declare class MainThreadManagedSocket extends ManagedSocket {
    private readonly socketId;
    private readonly proxy;
    static connect(socketId: number, proxy: ExtHostManagedSocketsShape, path: string, query: string, debugLabel: string, half: RemoteSocketHalf): Promise<MainThreadManagedSocket>;
    private constructor();
    write(buffer: VSBuffer): void;
    protected closeRemote(): void;
    drain(): Promise<void>;
}
