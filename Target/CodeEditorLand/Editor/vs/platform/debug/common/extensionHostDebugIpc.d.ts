import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IAttachSessionEvent, ICloseSessionEvent, IExtensionHostDebugService, IOpenExtensionWindowResult, IReloadSessionEvent, ITerminateSessionEvent } from './extensionHostDebug.js';
export declare class ExtensionHostDebugBroadcastChannel<TContext> implements IServerChannel<TContext> {
    static readonly ChannelName = "extensionhostdebugservice";
    private readonly _onCloseEmitter;
    private readonly _onReloadEmitter;
    private readonly _onTerminateEmitter;
    private readonly _onAttachEmitter;
    call(ctx: TContext, command: string, arg?: any): Promise<any>;
    listen(ctx: TContext, event: string, arg?: any): Event<any>;
}
export declare class ExtensionHostDebugChannelClient extends Disposable implements IExtensionHostDebugService {
    private channel;
    readonly _serviceBrand: undefined;
    constructor(channel: IChannel);
    reload(sessionId: string): void;
    get onReload(): Event<IReloadSessionEvent>;
    close(sessionId: string): void;
    get onClose(): Event<ICloseSessionEvent>;
    attachSession(sessionId: string, port: number, subId?: string): void;
    get onAttachSession(): Event<IAttachSessionEvent>;
    terminateSession(sessionId: string, subId?: string): void;
    get onTerminateSession(): Event<ITerminateSessionEvent>;
    openExtensionDevelopmentHostWindow(args: string[], debugRenderer: boolean): Promise<IOpenExtensionWindowResult>;
}
