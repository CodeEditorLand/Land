import { IIdentityProvider } from '../list/list.js';
import { IIndexTreeModelOptions, IIndexTreeModelSpliceOptions } from './indexTreeModel.js';
import { ICollapseStateChangeEvent, IObjectTreeElement, ITreeListSpliceData, ITreeModel, ITreeModelSpliceEvent, ITreeNode, ITreeSorter } from './tree.js';
import { Event } from '../../../common/event.js';
export type ITreeNodeCallback<T, TFilterData> = (node: ITreeNode<T, TFilterData>) => void;
export interface IObjectTreeModel<T extends NonNullable<any>, TFilterData extends NonNullable<any> = void> extends ITreeModel<T | null, TFilterData, T | null> {
    setChildren(element: T | null, children: Iterable<IObjectTreeElement<T>> | undefined, options?: IObjectTreeModelSetChildrenOptions<T, TFilterData>): void;
    resort(element?: T | null, recursive?: boolean): void;
}
export interface IObjectTreeModelSetChildrenOptions<T, TFilterData> extends IIndexTreeModelSpliceOptions<T, TFilterData> {
}
export interface IObjectTreeModelOptions<T, TFilterData> extends IIndexTreeModelOptions<T, TFilterData> {
    readonly sorter?: ITreeSorter<T>;
    readonly identityProvider?: IIdentityProvider<T>;
}
export declare class ObjectTreeModel<T extends NonNullable<any>, TFilterData extends NonNullable<any> = void> implements IObjectTreeModel<T, TFilterData> {
    private user;
    readonly rootRef: null;
    private model;
    private nodes;
    private readonly nodesByIdentity;
    private readonly identityProvider?;
    private sorter?;
    readonly onDidSpliceModel: Event<ITreeModelSpliceEvent<T | null, TFilterData>>;
    readonly onDidSpliceRenderedNodes: Event<ITreeListSpliceData<T | null, TFilterData>>;
    readonly onDidChangeCollapseState: Event<ICollapseStateChangeEvent<T, TFilterData>>;
    readonly onDidChangeRenderNodeCount: Event<ITreeNode<T, TFilterData>>;
    get size(): number;
    constructor(user: string, options?: IObjectTreeModelOptions<T, TFilterData>);
    setChildren(element: T | null, children?: Iterable<IObjectTreeElement<T>>, options?: IObjectTreeModelSetChildrenOptions<T, TFilterData>): void;
    private _setChildren;
    private preserveCollapseState;
    rerender(element: T | null): void;
    resort(element?: T | null, recursive?: boolean): void;
    private resortChildren;
    getFirstElementChild(ref?: T | null): T | null | undefined;
    getLastElementAncestor(ref?: T | null): T | null | undefined;
    has(element: T | null): boolean;
    getListIndex(element: T | null): number;
    getListRenderCount(element: T | null): number;
    isCollapsible(element: T | null): boolean;
    setCollapsible(element: T | null, collapsible?: boolean): boolean;
    isCollapsed(element: T | null): boolean;
    setCollapsed(element: T | null, collapsed?: boolean, recursive?: boolean): boolean;
    expandTo(element: T | null): void;
    refilter(): void;
    getNode(element?: T | null): ITreeNode<T | null, TFilterData>;
    getNodeLocation(node: ITreeNode<T, TFilterData>): T | null;
    getParentNodeLocation(element: T | null): T | null;
    private getElementLocation;
}
