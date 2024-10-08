import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { ILogService } from '../../log/common/log.js';
import { IBaseSerializableStorageRequest } from '../../storage/common/storageIpc.js';
import { IStorageMainService } from '../../storage/electron-main/storageMainService.js';
import { IUserDataProfilesService } from '../common/userDataProfile.js';
export declare class ProfileStorageChangesListenerChannel extends Disposable implements IServerChannel {
    private readonly storageMainService;
    private readonly userDataProfilesService;
    private readonly logService;
    private readonly _onDidChange;
    constructor(storageMainService: IStorageMainService, userDataProfilesService: IUserDataProfilesService, logService: ILogService);
    private registerStorageChangeListeners;
    private onDidChangeApplicationStorage;
    private onDidChangeProfileStorage;
    private triggerEvents;
    listen(_: unknown, event: string, arg: IBaseSerializableStorageRequest): Event<any>;
    call(_: unknown, command: string): Promise<any>;
}
