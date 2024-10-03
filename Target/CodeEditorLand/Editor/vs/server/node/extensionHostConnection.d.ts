import { VSBuffer } from '../../base/common/buffer.js';
import { Event } from '../../base/common/event.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { IProcessEnvironment } from '../../base/common/platform.js';
import { NodeSocket, WebSocketNodeSocket } from '../../base/parts/ipc/node/ipc.net.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { ILogService } from '../../platform/log/common/log.js';
import { IRemoteExtensionHostStartParams } from '../../platform/remote/common/remoteAgentConnection.js';
import { IExtensionHostStatusService } from './extensionHostStatusService.js';
import { IServerEnvironmentService } from './serverEnvironmentService.js';
export declare function buildUserEnvironment(startParamsEnv: {
    [key: string]: string | null;
} | undefined, withUserShellEnvironment: boolean, language: string, environmentService: IServerEnvironmentService, logService: ILogService, configurationService: IConfigurationService): Promise<IProcessEnvironment>;
export declare class ExtensionHostConnection extends Disposable {
    private readonly _reconnectionToken;
    private readonly _environmentService;
    private readonly _logService;
    private readonly _extensionHostStatusService;
    private readonly _configurationService;
    private _onClose;
    readonly onClose: Event<void>;
    private readonly _canSendSocket;
    private _disposed;
    private _remoteAddress;
    private _extensionHostProcess;
    private _connectionData;
    constructor(_reconnectionToken: string, remoteAddress: string, socket: NodeSocket | WebSocketNodeSocket, initialDataChunk: VSBuffer, _environmentService: IServerEnvironmentService, _logService: ILogService, _extensionHostStatusService: IExtensionHostStatusService, _configurationService: IConfigurationService);
    dispose(): void;
    private get _logPrefix();
    private _log;
    private _logError;
    private _pipeSockets;
    private _sendSocketToExtensionHost;
    shortenReconnectionGraceTimeIfNecessary(): void;
    acceptReconnection(remoteAddress: string, _socket: NodeSocket | WebSocketNodeSocket, initialDataChunk: VSBuffer): void;
    private _cleanResources;
    start(startParams: IRemoteExtensionHostStartParams): Promise<void>;
    private _listenOnPipe;
}
