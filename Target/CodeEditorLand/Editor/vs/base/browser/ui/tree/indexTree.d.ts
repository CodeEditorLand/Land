import { IListVirtualDelegate } from '../list/list.js';
import { AbstractTree, IAbstractTreeOptions } from './abstractTree.js';
import { IndexTreeModel } from './indexTreeModel.js';
import { ITreeElement, ITreeModel, ITreeRenderer } from './tree.js';
import './media/tree.css';
export interface IIndexTreeOptions<T, TFilterData = void> extends IAbstractTreeOptions<T, TFilterData> {
}
export declare class IndexTree<T, TFilterData = void> extends AbstractTree<T, TFilterData, number[]> {
    private readonly user;
    private rootElement;
    protected model: IndexTreeModel<T, TFilterData>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], rootElement: T, options?: IIndexTreeOptions<T, TFilterData>);
    splice(location: number[], deleteCount: number, toInsert?: Iterable<ITreeElement<T>>): void;
    rerender(location?: number[]): void;
    updateElementHeight(location: number[], height: number): void;
    protected createModel(user: string, options: IIndexTreeOptions<T, TFilterData>): ITreeModel<T, TFilterData, number[]>;
}
