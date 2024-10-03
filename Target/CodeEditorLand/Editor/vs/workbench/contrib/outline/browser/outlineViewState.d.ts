import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IOutlineViewState, OutlineSortOrder } from './outline.js';
export declare class OutlineViewState implements IOutlineViewState {
    private _followCursor;
    private _filterOnType;
    private _sortBy;
    private readonly _onDidChange;
    readonly onDidChange: import("../../../workbench.web.main.internal.js").Event<{
        followCursor?: boolean;
        sortBy?: boolean;
        filterOnType?: boolean;
    }>;
    dispose(): void;
    set followCursor(value: boolean);
    get followCursor(): boolean;
    get filterOnType(): boolean;
    set filterOnType(value: boolean);
    set sortBy(value: OutlineSortOrder);
    get sortBy(): OutlineSortOrder;
    persist(storageService: IStorageService): void;
    restore(storageService: IStorageService): void;
}
