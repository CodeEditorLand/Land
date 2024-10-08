import { FormattingOptions } from '../../../base/common/jsonFormatter.js';
import { IUserDataSyncUtilService } from './userDataSync.js';
export declare function merge(localContent: string, remoteContent: string, baseContent: string | null, formattingOptions: FormattingOptions, userDataSyncUtilService: IUserDataSyncUtilService): Promise<{
    mergeContent: string;
    hasChanges: boolean;
    hasConflicts: boolean;
}>;
