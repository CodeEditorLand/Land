import { Disposable } from '../../../base/common/lifecycle.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IMainProcessService } from '../common/mainProcessService.js';
export declare class ElectronIPCMainProcessService extends Disposable implements IMainProcessService {
    readonly _serviceBrand: undefined;
    private mainProcessConnection;
    constructor(windowId: number);
    getChannel(channelName: string): IChannel;
    registerChannel(channelName: string, channel: IServerChannel<string>): void;
}
