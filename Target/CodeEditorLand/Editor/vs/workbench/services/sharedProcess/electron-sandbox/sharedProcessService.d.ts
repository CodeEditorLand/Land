import { IChannel, IServerChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-sandbox/services.js';
export declare class SharedProcessService extends Disposable implements ISharedProcessService {
    readonly windowId: number;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly withSharedProcessConnection;
    private readonly restoredBarrier;
    constructor(windowId: number, logService: ILogService);
    private connect;
    notifyRestored(): void;
    getChannel(channelName: string): IChannel;
    registerChannel(channelName: string, channel: IServerChannel<string>): void;
    createRawConnection(): Promise<MessagePort>;
}
