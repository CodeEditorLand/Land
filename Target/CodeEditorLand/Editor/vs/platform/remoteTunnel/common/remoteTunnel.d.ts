import { Event } from '../../../base/common/event.js';
export interface IRemoteTunnelSession {
    readonly providerId: string;
    readonly sessionId: string;
    readonly accountLabel: string;
    readonly token?: string;
}
export declare const IRemoteTunnelService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IRemoteTunnelService>;
export interface IRemoteTunnelService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeTunnelStatus: Event<TunnelStatus>;
    getTunnelStatus(): Promise<TunnelStatus>;
    getMode(): Promise<TunnelMode>;
    readonly onDidChangeMode: Event<TunnelMode>;
    readonly onDidTokenFailed: Event<IRemoteTunnelSession | undefined>;
    initialize(mode: TunnelMode): Promise<TunnelStatus>;
    startTunnel(mode: ActiveTunnelMode): Promise<TunnelStatus>;
    stopTunnel(): Promise<void>;
    getTunnelName(): Promise<string | undefined>;
}
export interface ActiveTunnelMode {
    readonly active: true;
    readonly session: IRemoteTunnelSession;
    readonly asService: boolean;
}
export interface InactiveTunnelMode {
    readonly active: false;
}
export declare const INACTIVE_TUNNEL_MODE: InactiveTunnelMode;
export type TunnelMode = ActiveTunnelMode | InactiveTunnelMode;
export type TunnelStatus = TunnelStates.Connected | TunnelStates.Disconnected | TunnelStates.Connecting | TunnelStates.Uninitialized;
export declare namespace TunnelStates {
    interface Uninitialized {
        readonly type: 'uninitialized';
    }
    interface Connecting {
        readonly type: 'connecting';
        readonly progress?: string;
    }
    interface Connected {
        readonly type: 'connected';
        readonly info: ConnectionInfo;
        readonly serviceInstallFailed: boolean;
    }
    interface Disconnected {
        readonly type: 'disconnected';
        readonly onTokenFailed?: IRemoteTunnelSession;
    }
    const disconnected: (onTokenFailed?: IRemoteTunnelSession) => Disconnected;
    const connected: (info: ConnectionInfo, serviceInstallFailed: boolean) => Connected;
    const connecting: (progress?: string) => Connecting;
    const uninitialized: Uninitialized;
}
export interface ConnectionInfo {
    link: string;
    domain: string;
    tunnelName: string;
    isAttached: boolean;
}
export declare const CONFIGURATION_KEY_PREFIX = "remote.tunnels.access";
export declare const CONFIGURATION_KEY_HOST_NAME: string;
export declare const CONFIGURATION_KEY_PREVENT_SLEEP: string;
export declare const LOG_ID = "remoteTunnelService";
export declare const LOGGER_NAME: string;
