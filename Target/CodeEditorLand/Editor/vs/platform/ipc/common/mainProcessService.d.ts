import { IChannel, IPCServer, IServerChannel, StaticRouter } from '../../../base/parts/ipc/common/ipc.js';
import { IRemoteService } from './services.js';
export declare const IMainProcessService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMainProcessService>;
export interface IMainProcessService extends IRemoteService {
}
/**
 * An implementation of `IMainProcessService` that leverages `IPCServer`.
 */
export declare class MainProcessService implements IMainProcessService {
    private server;
    private router;
    readonly _serviceBrand: undefined;
    constructor(server: IPCServer, router: StaticRouter);
    getChannel(channelName: string): IChannel;
    registerChannel(channelName: string, channel: IServerChannel<string>): void;
}
