import { VSBuffer } from '../../../../base/common/buffer.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IURITransformer } from '../../../../base/common/uriIpc.js';
import { IMessagePassingProtocol } from '../../../../base/parts/ipc/common/ipc.js';
import { IRPCProtocol, Proxied, ProxyIdentifier } from './proxyIdentifier.js';
export interface JSONStringifyReplacer {
    (key: string, value: any): any;
}
declare class StringifiedJsonWithBufferRefs {
    readonly jsonString: string;
    readonly referencedBuffers: readonly VSBuffer[];
    constructor(jsonString: string, referencedBuffers: readonly VSBuffer[]);
}
export declare function stringifyJsonWithBufferRefs<T>(obj: T, replacer?: JSONStringifyReplacer | null, useSafeStringify?: boolean): StringifiedJsonWithBufferRefs;
export declare function parseJsonAndRestoreBufferRefs(jsonString: string, buffers: readonly VSBuffer[], uriTransformer: IURITransformer | null): any;
export declare const enum RequestInitiator {
    LocalSide = 0,
    OtherSide = 1
}
export declare const enum ResponsiveState {
    Responsive = 0,
    Unresponsive = 1
}
export interface IRPCProtocolLogger {
    logIncoming(msgLength: number, req: number, initiator: RequestInitiator, str: string, data?: any): void;
    logOutgoing(msgLength: number, req: number, initiator: RequestInitiator, str: string, data?: any): void;
}
declare const _RPCProtocolSymbol: unique symbol;
export declare class RPCProtocol extends Disposable implements IRPCProtocol {
    [_RPCProtocolSymbol]: boolean;
    private static readonly UNRESPONSIVE_TIME;
    private readonly _onDidChangeResponsiveState;
    readonly onDidChangeResponsiveState: Event<ResponsiveState>;
    private readonly _protocol;
    private readonly _logger;
    private readonly _uriTransformer;
    private readonly _uriReplacer;
    private _isDisposed;
    private readonly _locals;
    private readonly _proxies;
    private _lastMessageId;
    private readonly _cancelInvokedHandlers;
    private readonly _pendingRPCReplies;
    private _responsiveState;
    private _unacknowledgedCount;
    private _unresponsiveTime;
    private _asyncCheckUresponsive;
    constructor(protocol: IMessagePassingProtocol, logger?: IRPCProtocolLogger | null, transformer?: IURITransformer | null);
    dispose(): void;
    drain(): Promise<void>;
    private _onWillSendRequest;
    private _onDidReceiveAcknowledge;
    private _checkUnresponsive;
    private _setResponsiveState;
    get responsiveState(): ResponsiveState;
    transformIncomingURIs<T>(obj: T): T;
    getProxy<T>(identifier: ProxyIdentifier<T>): Proxied<T>;
    private _createProxy;
    set<T, R extends T>(identifier: ProxyIdentifier<T>, value: R): R;
    assertRegistered(identifiers: ProxyIdentifier<any>[]): void;
    private _receiveOneMessage;
    private _receiveRequest;
    private _receiveCancel;
    private _receiveReply;
    private _receiveReplyErr;
    private _invokeHandler;
    private _doInvokeHandler;
    private _remoteCall;
}
export {};
