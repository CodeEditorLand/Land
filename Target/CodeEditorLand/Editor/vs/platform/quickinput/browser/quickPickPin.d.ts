import { IQuickPick, IQuickPickItem } from '../common/quickInput.js';
import { IStorageService } from '../../storage/common/storage.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
export declare function showWithPinnedItems(storageService: IStorageService, storageKey: string, quickPick: IQuickPick<IQuickPickItem, {
    useSeparators: true;
}>, filterDuplicates?: boolean): IDisposable;
