import { IStringDictionary } from '../../../base/common/collections.js';
import { ILogService } from '../../log/common/log.js';
import { IStorageValue } from './userDataSync.js';
export interface IMergeResult {
    local: {
        added: IStringDictionary<IStorageValue>;
        removed: string[];
        updated: IStringDictionary<IStorageValue>;
    };
    remote: {
        added: string[];
        removed: string[];
        updated: string[];
        all: IStringDictionary<IStorageValue> | null;
    };
}
export declare function merge(localStorage: IStringDictionary<IStorageValue>, remoteStorage: IStringDictionary<IStorageValue> | null, baseStorage: IStringDictionary<IStorageValue> | null, storageKeys: {
    machine: ReadonlyArray<string>;
    unregistered: ReadonlyArray<string>;
}, logService: ILogService): IMergeResult;
