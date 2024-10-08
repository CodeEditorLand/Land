import { IQuickPick, IQuickPickItem } from '../common/quickInput.js';
import { IStorageService } from '../../storage/common/storage.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
/**
 * Initially, adds pin buttons to all @param quickPick items.
 * When pinned, a copy of the item will be moved to the end of the pinned list and any duplicate within the pinned list will
 * be removed if @param filterDupliates has been provided. Pin and pinned button events trigger updates to the underlying storage.
 * Shows the quickpick once formatted.
 */
export declare function showWithPinnedItems(storageService: IStorageService, storageKey: string, quickPick: IQuickPick<IQuickPickItem, {
    useSeparators: true;
}>, filterDuplicates?: boolean): IDisposable;
