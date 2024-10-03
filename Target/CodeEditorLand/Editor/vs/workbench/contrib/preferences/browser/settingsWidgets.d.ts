import { SelectBox } from '../../../../base/browser/ui/selectBox/selectBox.js';
import { IAction } from '../../../../base/common/actions.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import './media/settingsWidgets.css';
import { IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { SettingValueType } from '../../../services/preferences/common/preferences.js';
type EditKey = 'none' | 'create' | number;
type RowElementGroup = {
    rowElement: HTMLElement;
    keyElement: HTMLElement;
    valueElement?: HTMLElement;
};
type IListViewItem<TDataItem extends object> = TDataItem & {
    editing?: boolean;
    selected?: boolean;
};
export declare class ListSettingListModel<TDataItem extends object> {
    protected _dataItems: TDataItem[];
    private _editKey;
    private _selectedIdx;
    private _newDataItem;
    get items(): IListViewItem<TDataItem>[];
    constructor(newItem: TDataItem);
    setEditKey(key: EditKey): void;
    setValue(listData: TDataItem[]): void;
    select(idx: number | null): void;
    getSelected(): number | null;
    selectNext(): void;
    selectPrevious(): void;
}
export interface ISettingListChangeEvent<TDataItem extends object> {
    type: 'change';
    originalItem: TDataItem;
    newItem: TDataItem;
    targetIndex: number;
}
export interface ISettingListAddEvent<TDataItem extends object> {
    type: 'add';
    newItem: TDataItem;
    targetIndex: number;
}
export interface ISettingListMoveEvent<TDataItem extends object> {
    type: 'move';
    originalItem: TDataItem;
    newItem: TDataItem;
    targetIndex: number;
    sourceIndex: number;
}
export interface ISettingListRemoveEvent<TDataItem extends object> {
    type: 'remove';
    originalItem: TDataItem;
    targetIndex: number;
}
export interface ISettingListResetEvent<TDataItem extends object> {
    type: 'reset';
    originalItem: TDataItem;
    targetIndex: number;
}
export type SettingListEvent<TDataItem extends object> = ISettingListChangeEvent<TDataItem> | ISettingListAddEvent<TDataItem> | ISettingListMoveEvent<TDataItem> | ISettingListRemoveEvent<TDataItem> | ISettingListResetEvent<TDataItem>;
export declare abstract class AbstractListSettingWidget<TDataItem extends object> extends Disposable {
    private container;
    protected readonly themeService: IThemeService;
    protected readonly contextViewService: IContextViewService;
    private listElement;
    private rowElements;
    protected readonly _onDidChangeList: Emitter<SettingListEvent<TDataItem>>;
    protected readonly model: ListSettingListModel<TDataItem>;
    protected readonly listDisposables: DisposableStore;
    readonly onDidChangeList: Event<SettingListEvent<TDataItem>>;
    get domNode(): HTMLElement;
    get items(): TDataItem[];
    get inReadMode(): boolean;
    constructor(container: HTMLElement, themeService: IThemeService, contextViewService: IContextViewService);
    setValue(listData: TDataItem[]): void;
    abstract isItemNew(item: TDataItem): boolean;
    protected abstract getEmptyItem(): TDataItem;
    protected abstract getContainerClasses(): string[];
    protected abstract getActionsForItem(item: TDataItem, idx: number): IAction[];
    protected abstract renderItem(item: TDataItem, idx: number): RowElementGroup;
    protected abstract renderEdit(item: TDataItem, idx: number): HTMLElement;
    protected abstract addTooltipsToRow(rowElement: RowElementGroup, item: TDataItem): void;
    protected abstract getLocalizedStrings(): {
        deleteActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
    };
    protected renderHeader(): HTMLElement | undefined;
    protected isAddButtonVisible(): boolean;
    protected renderList(): void;
    protected createBasicSelectBox(value: IObjectEnumData): SelectBox;
    protected editSetting(idx: number): void;
    cancelEdit(): void;
    protected handleItemChange(originalItem: TDataItem, changedItem: TDataItem, idx: number): void;
    protected renderDataOrEditItem(item: IListViewItem<TDataItem>, idx: number, listFocused: boolean): HTMLElement;
    private renderDataItem;
    private renderAddButton;
    private onListClick;
    private onListDoubleClick;
    private getClickedItemIndex;
    private selectRow;
    private selectNextRow;
    private selectPreviousRow;
}
interface IListSetValueOptions {
    showAddButton: boolean;
    keySuggester?: IObjectKeySuggester;
}
export interface IListDataItem {
    value: ObjectKey;
    sibling?: string;
}
export declare class ListSettingWidget<TListDataItem extends IListDataItem> extends AbstractListSettingWidget<TListDataItem> {
    protected readonly hoverService: IHoverService;
    private keyValueSuggester;
    private showAddButton;
    setValue(listData: TListDataItem[], options?: IListSetValueOptions): void;
    constructor(container: HTMLElement, themeService: IThemeService, contextViewService: IContextViewService, hoverService: IHoverService);
    protected getEmptyItem(): TListDataItem;
    protected isAddButtonVisible(): boolean;
    protected getContainerClasses(): string[];
    protected getActionsForItem(item: TListDataItem, idx: number): IAction[];
    private dragDetails;
    private getDragImage;
    protected renderItem(item: TListDataItem, idx: number): RowElementGroup;
    protected addDragAndDrop(rowElement: HTMLElement, item: TListDataItem, idx: number): void;
    protected renderEdit(item: TListDataItem, idx: number): HTMLElement;
    isItemNew(item: TListDataItem): boolean;
    protected addTooltipsToRow(rowElementGroup: RowElementGroup, { value, sibling }: TListDataItem): void;
    protected getLocalizedStrings(): {
        deleteActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
        inputPlaceholder: string;
        siblingInputPlaceholder: string;
    };
    private renderInputBox;
    private renderDropdown;
}
export declare class ExcludeSettingWidget extends ListSettingWidget<IIncludeExcludeDataItem> {
    protected getContainerClasses(): string[];
    protected addDragAndDrop(rowElement: HTMLElement, item: IIncludeExcludeDataItem, idx: number): void;
    protected addTooltipsToRow(rowElementGroup: RowElementGroup, item: IIncludeExcludeDataItem): void;
    protected getLocalizedStrings(): {
        deleteActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
        inputPlaceholder: string;
        siblingInputPlaceholder: string;
    };
}
export declare class IncludeSettingWidget extends ListSettingWidget<IIncludeExcludeDataItem> {
    protected getContainerClasses(): string[];
    protected addDragAndDrop(rowElement: HTMLElement, item: IIncludeExcludeDataItem, idx: number): void;
    protected addTooltipsToRow(rowElementGroup: RowElementGroup, item: IIncludeExcludeDataItem): void;
    protected getLocalizedStrings(): {
        deleteActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
        inputPlaceholder: string;
        siblingInputPlaceholder: string;
    };
}
interface IObjectStringData {
    type: 'string';
    data: string;
}
export interface IObjectEnumOption {
    value: string;
    description?: string;
}
interface IObjectEnumData {
    type: 'enum';
    data: string;
    options: IObjectEnumOption[];
}
interface IObjectBoolData {
    type: 'boolean';
    data: boolean;
}
type ObjectKey = IObjectStringData | IObjectEnumData;
export type ObjectValue = IObjectStringData | IObjectEnumData | IObjectBoolData;
export interface IObjectDataItem {
    key: ObjectKey;
    value: ObjectValue;
    keyDescription?: string;
    source?: string;
    removable: boolean;
    resetable: boolean;
}
export interface IIncludeExcludeDataItem {
    value: ObjectKey;
    elementType: SettingValueType;
    sibling?: string;
    source?: string;
}
export interface IObjectValueSuggester {
    (key: string): ObjectValue | undefined;
}
export interface IObjectKeySuggester {
    (existingKeys: string[], idx?: number): IObjectEnumData | undefined;
}
interface IObjectSetValueOptions {
    settingKey: string;
    showAddButton: boolean;
    keySuggester: IObjectKeySuggester;
    valueSuggester: IObjectValueSuggester;
}
export declare class ObjectSettingDropdownWidget extends AbstractListSettingWidget<IObjectDataItem> {
    private readonly hoverService;
    private currentSettingKey;
    private showAddButton;
    private keySuggester;
    private valueSuggester;
    constructor(container: HTMLElement, themeService: IThemeService, contextViewService: IContextViewService, hoverService: IHoverService);
    setValue(listData: IObjectDataItem[], options?: IObjectSetValueOptions): void;
    isItemNew(item: IObjectDataItem): boolean;
    protected isAddButtonVisible(): boolean;
    protected getEmptyItem(): IObjectDataItem;
    protected getContainerClasses(): string[];
    protected getActionsForItem(item: IObjectDataItem, idx: number): IAction[];
    protected renderHeader(): HTMLElement;
    protected renderItem(item: IObjectDataItem, idx: number): RowElementGroup;
    protected renderEdit(item: IObjectDataItem, idx: number): HTMLElement;
    private renderEditWidget;
    private renderStringEditWidget;
    private renderEnumEditWidget;
    private shouldUseSuggestion;
    protected addTooltipsToRow(rowElementGroup: RowElementGroup, item: IObjectDataItem): void;
    private getEnumDescription;
    protected getLocalizedStrings(): {
        deleteActionTooltip: string;
        resetActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
        keyHeaderText: string;
        valueHeaderText: string;
    };
}
interface IBoolObjectSetValueOptions {
    settingKey: string;
}
export interface IBoolObjectDataItem {
    key: IObjectStringData;
    value: IObjectBoolData;
    keyDescription?: string;
    source?: string;
    removable: false;
    resetable: boolean;
}
export declare class ObjectSettingCheckboxWidget extends AbstractListSettingWidget<IBoolObjectDataItem> {
    private readonly hoverService;
    private currentSettingKey;
    constructor(container: HTMLElement, themeService: IThemeService, contextViewService: IContextViewService, hoverService: IHoverService);
    setValue(listData: IBoolObjectDataItem[], options?: IBoolObjectSetValueOptions): void;
    isItemNew(item: IBoolObjectDataItem): boolean;
    protected getEmptyItem(): IBoolObjectDataItem;
    protected getContainerClasses(): string[];
    protected getActionsForItem(item: IBoolObjectDataItem, idx: number): IAction[];
    protected isAddButtonVisible(): boolean;
    protected renderHeader(): undefined;
    protected renderDataOrEditItem(item: IListViewItem<IBoolObjectDataItem>, idx: number, listFocused: boolean): HTMLElement;
    protected renderItem(item: IBoolObjectDataItem, idx: number): RowElementGroup;
    protected renderEdit(item: IBoolObjectDataItem, idx: number): HTMLElement;
    private renderEditWidget;
    protected addTooltipsToRow(rowElementGroup: RowElementGroup, item: IBoolObjectDataItem): void;
    protected getLocalizedStrings(): {
        deleteActionTooltip: string;
        resetActionTooltip: string;
        editActionTooltip: string;
        addButtonLabel: string;
        keyHeaderText: string;
        valueHeaderText: string;
    };
}
export {};
