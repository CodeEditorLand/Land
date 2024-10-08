import { Event } from '../../../base/common/event.js';
import { IChannel, IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IUpdateService, State } from './update.js';
export declare class UpdateChannel implements IServerChannel {
    private service;
    constructor(service: IUpdateService);
    listen(_: unknown, event: string): Event<any>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
}
export declare class UpdateChannelClient implements IUpdateService {
    private readonly channel;
    readonly _serviceBrand: undefined;
    private readonly _onStateChange;
    readonly onStateChange: Event<State>;
    private _state;
    get state(): State;
    set state(state: State);
    constructor(channel: IChannel);
    checkForUpdates(explicit: boolean): Promise<void>;
    downloadUpdate(): Promise<void>;
    applyUpdate(): Promise<void>;
    quitAndInstall(): Promise<void>;
    isLatestVersion(): Promise<boolean | undefined>;
    _applySpecificUpdate(packagePath: string): Promise<void>;
}
