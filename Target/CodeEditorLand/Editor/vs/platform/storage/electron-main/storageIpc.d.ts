import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { ILogService } from '../../log/common/log.js';
import { IBaseSerializableStorageRequest } from '../common/storageIpc.js';
import { IStorageMainService } from './storageMainService.js';
export declare class StorageDatabaseChannel extends Disposable implements IServerChannel {
    private readonly logService;
    private readonly storageMainService;
    private static readonly STORAGE_CHANGE_DEBOUNCE_TIME;
    private readonly onDidChangeApplicationStorageEmitter;
    private readonly mapProfileToOnDidChangeProfileStorageEmitter;
    constructor(logService: ILogService, storageMainService: IStorageMainService);
    private registerStorageChangeListeners;
    private serializeStorageChangeEvents;
    listen(_: unknown, event: string, arg: IBaseSerializableStorageRequest): Event<any>;
    call(_: unknown, command: string, arg: IBaseSerializableStorageRequest): Promise<any>;
    private withStorageInitialized;
}
