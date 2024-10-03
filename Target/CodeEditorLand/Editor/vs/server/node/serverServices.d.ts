import { Event } from '../../base/common/event.js';
import { DisposableStore } from '../../base/common/lifecycle.js';
import { IMessagePassingProtocol, IPCServer } from '../../base/parts/ipc/common/ipc.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { RemoteAgentConnectionContext } from '../../platform/remote/common/remoteAgentEnvironment.js';
import { ServerConnectionToken } from './serverConnectionToken.js';
import { ServerParsedArgs } from './serverEnvironmentService.js';
export declare function setupServerServices(connectionToken: ServerConnectionToken, args: ServerParsedArgs, REMOTE_DATA_FOLDER: string, disposables: DisposableStore): Promise<{
    socketServer: SocketServer<RemoteAgentConnectionContext>;
    instantiationService: IInstantiationService;
}>;
export declare class SocketServer<TContext = string> extends IPCServer<TContext> {
    private _onDidConnectEmitter;
    constructor();
    acceptConnection(protocol: IMessagePassingProtocol, onDidClientDisconnect: Event<void>): void;
}
