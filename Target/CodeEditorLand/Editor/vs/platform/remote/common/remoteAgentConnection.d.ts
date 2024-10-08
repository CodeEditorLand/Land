import { CancelablePromise } from '../../../base/common/async.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IIPCLogger } from '../../../base/parts/ipc/common/ipc.js';
import { Client, PersistentProtocol } from '../../../base/parts/ipc/common/ipc.net.js';
import { ILogService } from '../../log/common/log.js';
import { RemoteAgentConnectionContext } from './remoteAgentEnvironment.js';
import { RemoteConnection } from './remoteAuthorityResolver.js';
import { IRemoteSocketFactoryService } from './remoteSocketFactoryService.js';
import { ISignService } from '../../sign/common/sign.js';
export declare const enum ConnectionType {
    Management = 1,
    ExtensionHost = 2,
    Tunnel = 3
}
export interface AuthRequest {
    type: 'auth';
    auth: string;
    data: string;
}
export interface SignRequest {
    type: 'sign';
    data: string;
    signedData: string;
}
export interface ConnectionTypeRequest {
    type: 'connectionType';
    commit?: string;
    signedData: string;
    desiredConnectionType?: ConnectionType;
    args?: any;
}
export interface ErrorMessage {
    type: 'error';
    reason: string;
}
export interface OKMessage {
    type: 'ok';
}
export type HandshakeMessage = AuthRequest | SignRequest | ConnectionTypeRequest | ErrorMessage | OKMessage;
interface ISimpleConnectionOptions<T extends RemoteConnection = RemoteConnection> {
    commit: string | undefined;
    quality: string | undefined;
    connectTo: T;
    connectionToken: string | undefined;
    reconnectionToken: string;
    reconnectionProtocol: PersistentProtocol | null;
    remoteSocketFactoryService: IRemoteSocketFactoryService;
    signService: ISignService;
    logService: ILogService;
}
export interface IRemoteExtensionHostStartParams {
    language: string;
    debugId?: string;
    break?: boolean;
    port?: number | null;
    env?: {
        [key: string]: string | null;
    };
}
export interface ITunnelConnectionStartParams {
    host: string;
    port: number;
}
export interface IConnectionOptions<T extends RemoteConnection = RemoteConnection> {
    commit: string | undefined;
    quality: string | undefined;
    addressProvider: IAddressProvider<T>;
    remoteSocketFactoryService: IRemoteSocketFactoryService;
    signService: ISignService;
    logService: ILogService;
    ipcLogger: IIPCLogger | null;
}
export interface IAddress<T extends RemoteConnection = RemoteConnection> {
    connectTo: T;
    connectionToken: string | undefined;
}
export interface IAddressProvider<T extends RemoteConnection = RemoteConnection> {
    getAddress(): Promise<IAddress<T>>;
}
export declare function connectRemoteAgentManagement(options: IConnectionOptions, remoteAuthority: string, clientId: string): Promise<ManagementPersistentConnection>;
export declare function connectRemoteAgentExtensionHost(options: IConnectionOptions, startArguments: IRemoteExtensionHostStartParams): Promise<ExtensionHostPersistentConnection>;
export declare function connectRemoteAgentTunnel(options: IConnectionOptions, tunnelRemoteHost: string, tunnelRemotePort: number): Promise<PersistentProtocol>;
export declare const enum PersistentConnectionEventType {
    ConnectionLost = 0,
    ReconnectionWait = 1,
    ReconnectionRunning = 2,
    ReconnectionPermanentFailure = 3,
    ConnectionGain = 4
}
export declare class ConnectionLostEvent {
    readonly reconnectionToken: string;
    readonly millisSinceLastIncomingData: number;
    readonly type = PersistentConnectionEventType.ConnectionLost;
    constructor(reconnectionToken: string, millisSinceLastIncomingData: number);
}
export declare class ReconnectionWaitEvent {
    readonly reconnectionToken: string;
    readonly millisSinceLastIncomingData: number;
    readonly durationSeconds: number;
    private readonly cancellableTimer;
    readonly type = PersistentConnectionEventType.ReconnectionWait;
    constructor(reconnectionToken: string, millisSinceLastIncomingData: number, durationSeconds: number, cancellableTimer: CancelablePromise<void>);
    skipWait(): void;
}
export declare class ReconnectionRunningEvent {
    readonly reconnectionToken: string;
    readonly millisSinceLastIncomingData: number;
    readonly attempt: number;
    readonly type = PersistentConnectionEventType.ReconnectionRunning;
    constructor(reconnectionToken: string, millisSinceLastIncomingData: number, attempt: number);
}
export declare class ConnectionGainEvent {
    readonly reconnectionToken: string;
    readonly millisSinceLastIncomingData: number;
    readonly attempt: number;
    readonly type = PersistentConnectionEventType.ConnectionGain;
    constructor(reconnectionToken: string, millisSinceLastIncomingData: number, attempt: number);
}
export declare class ReconnectionPermanentFailureEvent {
    readonly reconnectionToken: string;
    readonly millisSinceLastIncomingData: number;
    readonly attempt: number;
    readonly handled: boolean;
    readonly type = PersistentConnectionEventType.ReconnectionPermanentFailure;
    constructor(reconnectionToken: string, millisSinceLastIncomingData: number, attempt: number, handled: boolean);
}
export type PersistentConnectionEvent = ConnectionGainEvent | ConnectionLostEvent | ReconnectionWaitEvent | ReconnectionRunningEvent | ReconnectionPermanentFailureEvent;
export declare abstract class PersistentConnection extends Disposable {
    private readonly _connectionType;
    protected readonly _options: IConnectionOptions;
    readonly reconnectionToken: string;
    readonly protocol: PersistentProtocol;
    private readonly _reconnectionFailureIsFatal;
    static triggerPermanentFailure(millisSinceLastIncomingData: number, attempt: number, handled: boolean): void;
    static debugTriggerReconnection(): void;
    static debugPauseSocketWriting(): void;
    private static _permanentFailure;
    private static _permanentFailureMillisSinceLastIncomingData;
    private static _permanentFailureAttempt;
    private static _permanentFailureHandled;
    private static _instances;
    private readonly _onDidStateChange;
    readonly onDidStateChange: import("../../../workbench/workbench.web.main.internal.js").Event<PersistentConnectionEvent>;
    private _permanentFailure;
    private get _isPermanentFailure();
    private _isReconnecting;
    private _isDisposed;
    constructor(_connectionType: ConnectionType, _options: IConnectionOptions, reconnectionToken: string, protocol: PersistentProtocol, _reconnectionFailureIsFatal: boolean);
    dispose(): void;
    private _beginReconnecting;
    private _runReconnectingLoop;
    private _onReconnectionPermanentFailure;
    private _gotoPermanentFailure;
    private _pauseSocketWriting;
    protected abstract _reconnect(options: ISimpleConnectionOptions, timeoutCancellationToken: CancellationToken): Promise<void>;
}
export declare class ManagementPersistentConnection extends PersistentConnection {
    readonly client: Client<RemoteAgentConnectionContext>;
    constructor(options: IConnectionOptions, remoteAuthority: string, clientId: string, reconnectionToken: string, protocol: PersistentProtocol);
    protected _reconnect(options: ISimpleConnectionOptions, timeoutCancellationToken: CancellationToken): Promise<void>;
}
export declare class ExtensionHostPersistentConnection extends PersistentConnection {
    private readonly _startArguments;
    readonly debugPort: number | undefined;
    constructor(options: IConnectionOptions, startArguments: IRemoteExtensionHostStartParams, reconnectionToken: string, protocol: PersistentProtocol, debugPort: number | undefined);
    protected _reconnect(options: ISimpleConnectionOptions, timeoutCancellationToken: CancellationToken): Promise<void>;
}
export {};
