import { IProcessEnvironment } from '../../../../base/common/platform.js';
export declare const enum ExtHostConnectionType {
    IPC = 1,
    Socket = 2,
    MessagePort = 3
}
export declare class IPCExtHostConnection {
    readonly pipeName: string;
    static ENV_KEY: string;
    readonly type = ExtHostConnectionType.IPC;
    constructor(pipeName: string);
    serialize(env: IProcessEnvironment): void;
}
export declare class SocketExtHostConnection {
    static ENV_KEY: string;
    readonly type = ExtHostConnectionType.Socket;
    serialize(env: IProcessEnvironment): void;
}
export declare class MessagePortExtHostConnection {
    static ENV_KEY: string;
    readonly type = ExtHostConnectionType.MessagePort;
    serialize(env: IProcessEnvironment): void;
}
export type ExtHostConnection = IPCExtHostConnection | SocketExtHostConnection | MessagePortExtHostConnection;
export declare function writeExtHostConnection(connection: ExtHostConnection, env: IProcessEnvironment): void;
export declare function readExtHostConnection(env: IProcessEnvironment): ExtHostConnection;
