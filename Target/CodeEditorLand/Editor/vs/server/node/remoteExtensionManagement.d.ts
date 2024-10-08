import { PersistentProtocol, ISocket } from '../../base/parts/ipc/common/ipc.net.js';
import { ILogService } from '../../platform/log/common/log.js';
import { Event } from '../../base/common/event.js';
import { VSBuffer } from '../../base/common/buffer.js';
export declare class ManagementConnection {
    private readonly _logService;
    private readonly _reconnectionToken;
    private _onClose;
    readonly onClose: Event<void>;
    private readonly _reconnectionGraceTime;
    private readonly _reconnectionShortGraceTime;
    private _remoteAddress;
    readonly protocol: PersistentProtocol;
    private _disposed;
    private _disconnectRunner1;
    private _disconnectRunner2;
    constructor(_logService: ILogService, _reconnectionToken: string, remoteAddress: string, protocol: PersistentProtocol);
    private _log;
    shortenReconnectionGraceTimeIfNecessary(): void;
    private _cleanResources;
    acceptReconnection(remoteAddress: string, socket: ISocket, initialDataChunk: VSBuffer): void;
}
