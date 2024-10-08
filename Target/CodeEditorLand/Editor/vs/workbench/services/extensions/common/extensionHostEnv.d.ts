import { IProcessEnvironment } from '../../../../base/common/platform.js';
export declare const enum ExtHostConnectionType {
    IPC = 1,
    Socket = 2,
    MessagePort = 3
}
/**
 * The extension host will connect via named pipe / domain socket to its renderer.
 */
export declare class IPCExtHostConnection {
    readonly pipeName: string;
    static ENV_KEY: string;
    readonly type = ExtHostConnectionType.IPC;
    constructor(pipeName: string);
    serialize(env: IProcessEnvironment): void;
}
/**
 * The extension host will receive via nodejs IPC the socket to its renderer.
 */
export declare class SocketExtHostConnection {
    static ENV_KEY: string;
    readonly type = ExtHostConnectionType.Socket;
    serialize(env: IProcessEnvironment): void;
}
/**
 * The extension host will receive via nodejs IPC the MessagePort to its renderer.
 */
export declare class MessagePortExtHostConnection {
    static ENV_KEY: string;
    readonly type = ExtHostConnectionType.MessagePort;
    serialize(env: IProcessEnvironment): void;
}
export type ExtHostConnection = IPCExtHostConnection | SocketExtHostConnection | MessagePortExtHostConnection;
/**
 * Write `connection` into `env` and clean up `env`.
 */
export declare function writeExtHostConnection(connection: ExtHostConnection, env: IProcessEnvironment): void;
/**
 * Read `connection` from `env` and clean up `env`.
 */
export declare function readExtHostConnection(env: IProcessEnvironment): ExtHostConnection;
