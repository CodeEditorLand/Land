import { IListVirtualDelegate } from '../list/list.js';
import { AbstractTree, AbstractTreeViewState, IAbstractTreeOptions } from './abstractTree.js';
import { ObjectTreeModel } from './objectTreeModel.js';
import { IDataSource, ITreeModel, ITreeRenderer, ITreeSorter } from './tree.js';
export interface IDataTreeOptions<T, TFilterData = void> extends IAbstractTreeOptions<T, TFilterData> {
    readonly sorter?: ITreeSorter<T>;
}
export declare class DataTree<TInput, T, TFilterData = void> extends AbstractTree<T | null, TFilterData, T | null> {
    private user;
    private dataSource;
    protected model: ObjectTreeModel<T, TFilterData>;
    private input;
    private identityProvider;
    private nodesByIdentity;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], dataSource: IDataSource<TInput, T>, options?: IDataTreeOptions<T, TFilterData>);
    getInput(): TInput | undefined;
    setInput(input: TInput | undefined, viewState?: AbstractTreeViewState): void;
    updateChildren(element?: TInput | T): void;
    resort(element?: T | TInput, recursive?: boolean): void;
    refresh(element?: T): void;
    private _refresh;
    private iterate;
    protected createModel(user: string, options: IDataTreeOptions<T, TFilterData>): ITreeModel<T | null, TFilterData, T | null>;
}
