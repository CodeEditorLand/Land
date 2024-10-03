import * as net from 'net';
import * as stream from 'stream';
import { IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { IDebugAdapterExecutable, IDebugAdapterNamedPipeServer, IDebugAdapterServer } from '../common/debug.js';
import { AbstractDebugAdapter } from '../common/abstractDebugAdapter.js';
export declare abstract class StreamDebugAdapter extends AbstractDebugAdapter {
    private static readonly TWO_CRLF;
    private static readonly HEADER_LINESEPARATOR;
    private static readonly HEADER_FIELDSEPARATOR;
    private outputStream;
    private rawData;
    private contentLength;
    constructor();
    protected connect(readable: stream.Readable, writable: stream.Writable): void;
    sendMessage(message: DebugProtocol.ProtocolMessage): void;
    private handleData;
}
export declare abstract class NetworkDebugAdapter extends StreamDebugAdapter {
    protected socket?: net.Socket;
    protected abstract createConnection(connectionListener: () => void): net.Socket;
    startSession(): Promise<void>;
    stopSession(): Promise<void>;
}
export declare class SocketDebugAdapter extends NetworkDebugAdapter {
    private adapterServer;
    constructor(adapterServer: IDebugAdapterServer);
    protected createConnection(connectionListener: () => void): net.Socket;
}
export declare class NamedPipeDebugAdapter extends NetworkDebugAdapter {
    private adapterServer;
    constructor(adapterServer: IDebugAdapterNamedPipeServer);
    protected createConnection(connectionListener: () => void): net.Socket;
}
export declare class ExecutableDebugAdapter extends StreamDebugAdapter {
    private adapterExecutable;
    private debugType;
    private serverProcess;
    constructor(adapterExecutable: IDebugAdapterExecutable, debugType: string);
    startSession(): Promise<void>;
    stopSession(): Promise<void>;
    private static extract;
    static platformAdapterExecutable(extensionDescriptions: IExtensionDescription[], debugType: string): IDebugAdapterExecutable | undefined;
}
