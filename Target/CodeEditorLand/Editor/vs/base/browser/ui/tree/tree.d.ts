import { IDragAndDropData } from '../../dnd.js';
import { IMouseEvent } from '../../mouseEvent.js';
import { IListDragAndDrop, IListDragOverReaction, IListRenderer } from '../list/list.js';
import { ListViewTargetSector } from '../list/listView.js';
import { Event } from '../../../common/event.js';
export declare const enum TreeVisibility {
    Hidden = 0,
    Visible = 1,
    Recurse = 2
}
export interface ITreeFilterDataResult<TFilterData> {
    visibility: boolean | TreeVisibility;
    data: TFilterData;
}
export type TreeFilterResult<TFilterData> = boolean | TreeVisibility | ITreeFilterDataResult<TFilterData>;
export interface ITreeFilter<T, TFilterData = void> {
    filter(element: T, parentVisibility: TreeVisibility): TreeFilterResult<TFilterData>;
}
export interface ITreeSorter<T> {
    compare(element: T, otherElement: T): number;
}
export interface ITreeElement<T> {
    readonly element: T;
    readonly children?: Iterable<ITreeElement<T>>;
    readonly collapsible?: boolean;
    readonly collapsed?: boolean;
}
export declare enum ObjectTreeElementCollapseState {
    Expanded = 0,
    Collapsed = 1,
    PreserveOrExpanded = 2,
    PreserveOrCollapsed = 3
}
export interface IObjectTreeElement<T> {
    readonly element: T;
    readonly children?: Iterable<IObjectTreeElement<T>>;
    readonly collapsible?: boolean;
    readonly collapsed?: boolean | ObjectTreeElementCollapseState;
}
export interface ITreeNode<T, TFilterData = void> {
    readonly element: T;
    readonly children: ITreeNode<T, TFilterData>[];
    readonly depth: number;
    readonly visibleChildrenCount: number;
    readonly visibleChildIndex: number;
    readonly collapsible: boolean;
    readonly collapsed: boolean;
    readonly visible: boolean;
    readonly filterData: TFilterData | undefined;
}
export interface ICollapseStateChangeEvent<T, TFilterData> {
    node: ITreeNode<T, TFilterData>;
    deep: boolean;
}
export interface ITreeListSpliceData<T, TFilterData> {
    start: number;
    deleteCount: number;
    elements: ITreeNode<T, TFilterData>[];
}
export interface ITreeModelSpliceEvent<T, TFilterData> {
    insertedNodes: ITreeNode<T, TFilterData>[];
    deletedNodes: ITreeNode<T, TFilterData>[];
}
export interface ITreeModel<T, TFilterData, TRef> {
    readonly rootRef: TRef;
    readonly onDidSpliceModel: Event<ITreeModelSpliceEvent<T, TFilterData>>;
    readonly onDidSpliceRenderedNodes: Event<ITreeListSpliceData<T, TFilterData>>;
    readonly onDidChangeCollapseState: Event<ICollapseStateChangeEvent<T, TFilterData>>;
    readonly onDidChangeRenderNodeCount: Event<ITreeNode<T, TFilterData>>;
    has(location: TRef): boolean;
    getListIndex(location: TRef): number;
    getListRenderCount(location: TRef): number;
    getNode(location?: TRef): ITreeNode<T, any>;
    getNodeLocation(node: ITreeNode<T, any>): TRef;
    getParentNodeLocation(location: TRef): TRef | undefined;
    getFirstElementChild(location: TRef): T | undefined;
    getLastElementAncestor(location?: TRef): T | undefined;
    isCollapsible(location: TRef): boolean;
    setCollapsible(location: TRef, collapsible?: boolean): boolean;
    isCollapsed(location: TRef): boolean;
    setCollapsed(location: TRef, collapsed?: boolean, recursive?: boolean): boolean;
    expandTo(location: TRef): void;
    rerender(location: TRef): void;
    refilter(): void;
}
export interface ITreeRenderer<T, TFilterData = void, TTemplateData = void> extends IListRenderer<ITreeNode<T, TFilterData>, TTemplateData> {
    renderTwistie?(element: T, twistieElement: HTMLElement): boolean;
    onDidChangeTwistieState?: Event<T>;
}
export interface ITreeEvent<T> {
    readonly elements: readonly T[];
    readonly browserEvent?: UIEvent;
}
export declare enum TreeMouseEventTarget {
    Unknown = 0,
    Twistie = 1,
    Element = 2,
    Filter = 3
}
export interface ITreeMouseEvent<T> {
    readonly browserEvent: MouseEvent;
    readonly element: T | null;
    readonly target: TreeMouseEventTarget;
}
export interface ITreeContextMenuEvent<T> {
    readonly browserEvent: UIEvent;
    readonly element: T | null;
    readonly anchor: HTMLElement | IMouseEvent;
    readonly isStickyScroll: boolean;
}
export interface ITreeNavigator<T> {
    current(): T | null;
    previous(): T | null;
    first(): T | null;
    last(): T | null;
    next(): T | null;
}
export interface IDataSource<TInput, T> {
    hasChildren?(element: TInput | T): boolean;
    getChildren(element: TInput | T): Iterable<T>;
}
export interface IAsyncDataSource<TInput, T> {
    hasChildren(element: TInput | T): boolean;
    getChildren(element: TInput | T): Iterable<T> | Promise<Iterable<T>>;
    getParent?(element: T): TInput | T;
}
export declare const enum TreeDragOverBubble {
    Down = 0,
    Up = 1
}
export interface ITreeDragOverReaction extends IListDragOverReaction {
    bubble?: TreeDragOverBubble;
    autoExpand?: boolean;
}
export declare const TreeDragOverReactions: {
    acceptBubbleUp(): ITreeDragOverReaction;
    acceptBubbleDown(autoExpand?: boolean): ITreeDragOverReaction;
    acceptCopyBubbleUp(): ITreeDragOverReaction;
    acceptCopyBubbleDown(autoExpand?: boolean): ITreeDragOverReaction;
};
export interface ITreeDragAndDrop<T> extends IListDragAndDrop<T> {
    onDragOver(data: IDragAndDropData, targetElement: T | undefined, targetIndex: number | undefined, targetSector: ListViewTargetSector | undefined, originalEvent: DragEvent): boolean | ITreeDragOverReaction;
}
export declare class TreeError extends Error {
    constructor(user: string, message: string);
}
export declare class WeakMapper<K extends object, V> {
    private fn;
    constructor(fn: (k: K) => V);
    private _map;
    map(key: K): V;
}
