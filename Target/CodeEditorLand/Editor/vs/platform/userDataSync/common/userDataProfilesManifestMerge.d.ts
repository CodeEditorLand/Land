import { IUserDataProfile } from '../../userDataProfile/common/userDataProfile.js';
import { ISyncUserDataProfile } from './userDataSync.js';
interface IRelaxedMergeResult {
    local: {
        added: ISyncUserDataProfile[];
        removed: IUserDataProfile[];
        updated: ISyncUserDataProfile[];
    };
    remote: {
        added: IUserDataProfile[];
        removed: ISyncUserDataProfile[];
        updated: IUserDataProfile[];
    } | null;
}
export type IMergeResult = Required<IRelaxedMergeResult>;
export declare function merge(local: IUserDataProfile[], remote: ISyncUserDataProfile[] | null, lastSync: ISyncUserDataProfile[] | null, ignored: string[]): IMergeResult;
export {};
