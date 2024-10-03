import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStatusbarEntryPriority, StatusbarAlignment } from '../../../services/statusbar/browser/statusbar.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export interface IStatusbarViewModelEntry {
    readonly id: string;
    readonly name: string;
    readonly hasCommand: boolean;
    readonly alignment: StatusbarAlignment;
    readonly priority: IStatusbarEntryPriority;
    readonly container: HTMLElement;
    readonly labelContainer: HTMLElement;
}
export declare class StatusbarViewModel extends Disposable {
    private readonly storageService;
    private static readonly HIDDEN_ENTRIES_KEY;
    private readonly _onDidChangeEntryVisibility;
    readonly onDidChangeEntryVisibility: import("../../../workbench.web.main.internal.js").Event<{
        id: string;
        visible: boolean;
    }>;
    private _entries;
    get entries(): IStatusbarViewModelEntry[];
    private _lastFocusedEntry;
    get lastFocusedEntry(): IStatusbarViewModelEntry | undefined;
    private hidden;
    constructor(storageService: IStorageService);
    private restoreState;
    private registerListeners;
    private onDidStorageValueChange;
    add(entry: IStatusbarViewModelEntry): void;
    remove(entry: IStatusbarViewModelEntry): void;
    isHidden(id: string): boolean;
    hide(id: string): void;
    show(id: string): void;
    findEntry(container: HTMLElement): IStatusbarViewModelEntry | undefined;
    getEntries(alignment: StatusbarAlignment): IStatusbarViewModelEntry[];
    focusNextEntry(): void;
    focusPreviousEntry(): void;
    isEntryFocused(): boolean;
    private getFocusedEntry;
    private focusEntry;
    private updateVisibility;
    private saveState;
    private sort;
    private markFirstLastVisibleEntry;
    private doMarkFirstLastVisibleStatusbarItem;
}
