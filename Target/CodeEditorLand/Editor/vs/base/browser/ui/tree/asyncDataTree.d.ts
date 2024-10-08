import { IIdentityProvider, IListVirtualDelegate } from '../list/list.js';
import { IListStyles } from '../list/listWidget.js';
import { TreeFindMode as TreeFindMode, IAbstractTreeOptions, IAbstractTreeOptionsUpdate, TreeFindMatchType, AbstractTreePart, LabelFuzzyScore, ITreeFindToggleContribution } from './abstractTree.js';
import { ICompressedTreeElement, ICompressedTreeNode } from './compressedObjectTreeModel.js';
import { CompressibleObjectTree, ICompressibleKeyboardNavigationLabelProvider, ICompressibleTreeRenderer, IObjectTreeSetChildrenOptions, ObjectTree } from './objectTree.js';
import { IAsyncDataSource, ICollapseStateChangeEvent, IObjectTreeElement, ITreeContextMenuEvent, ITreeEvent, ITreeMouseEvent, ITreeNavigator, ITreeNode, ITreeRenderer, ITreeSorter, ObjectTreeElementCollapseState, WeakMapper } from './tree.js';
import { Emitter, Event } from '../../../common/event.js';
import { DisposableStore, IDisposable } from '../../../common/lifecycle.js';
import { ScrollEvent } from '../../../common/scrollable.js';
import { CancellationToken } from '../../../common/cancellation.js';
import { FuzzyScore } from '../../../common/filters.js';
interface IAsyncDataTreeNode<TInput, T> {
    element: TInput | T;
    readonly parent: IAsyncDataTreeNode<TInput, T> | null;
    readonly children: IAsyncDataTreeNode<TInput, T>[];
    readonly id?: string | null;
    refreshPromise: Promise<void> | undefined;
    hasChildren: boolean;
    stale: boolean;
    slow: boolean;
    readonly defaultCollapseState: undefined | ObjectTreeElementCollapseState.PreserveOrCollapsed | ObjectTreeElementCollapseState.PreserveOrExpanded;
    forceExpanded: boolean;
}
type AsyncDataTreeNodeMapper<TInput, T, TFilterData> = WeakMapper<ITreeNode<IAsyncDataTreeNode<TInput, T> | null, TFilterData>, ITreeNode<TInput | T, TFilterData>>;
export interface IAsyncFindResult<T> {
    element: T;
    filterdata?: FuzzyScore | LabelFuzzyScore;
}
export interface IAsyncFindProvider<T> {
    toggles?: ITreeFindToggleContribution[];
    placeholder?: string;
    getFindResults(pattern: string, sessionId: number, token: CancellationToken, toggleStates: {
        id: string;
        isChecked: boolean;
    }[]): AsyncIterable<IAsyncFindResult<T>>;
    revealResultInTree?(findElement: T): void;
}
export interface IAsyncDataTreeOptionsUpdate extends IAbstractTreeOptionsUpdate {
}
export interface IAsyncDataTreeUpdateChildrenOptions<T> extends IObjectTreeSetChildrenOptions<T> {
}
export interface IAsyncDataTreeOptions<T, TFilterData = void> extends IAsyncDataTreeOptionsUpdate, Pick<IAbstractTreeOptions<T, TFilterData>, Exclude<keyof IAbstractTreeOptions<T, TFilterData>, 'collapseByDefault'>> {
    readonly collapseByDefault?: {
        (e: T): boolean;
    };
    readonly identityProvider?: IIdentityProvider<T>;
    readonly sorter?: ITreeSorter<T>;
    readonly autoExpandSingleChildren?: boolean;
    readonly findResultsProvider?: IAsyncFindProvider<T>;
}
export interface IAsyncDataTreeViewState {
    readonly focus?: string[];
    readonly selection?: string[];
    readonly expanded?: string[];
    readonly scrollTop?: number;
}
interface IAsyncDataTreeViewStateContext<TInput, T> {
    readonly viewState: IAsyncDataTreeViewState;
    readonly selection: IAsyncDataTreeNode<TInput, T>[];
    readonly focus: IAsyncDataTreeNode<TInput, T>[];
}
export declare class AsyncDataTree<TInput, T, TFilterData = void> implements IDisposable {
    protected user: string;
    private dataSource;
    protected readonly tree: ObjectTree<IAsyncDataTreeNode<TInput, T>, TFilterData>;
    private readonly model;
    protected readonly root: IAsyncDataTreeNode<TInput, T>;
    private readonly nodes;
    private readonly sorter?;
    private readonly findController?;
    private readonly getDefaultCollapseState;
    private readonly subTreeRefreshPromises;
    private readonly refreshPromises;
    protected readonly identityProvider?: IIdentityProvider<T>;
    private readonly autoExpandSingleChildren;
    private readonly _onDidRender;
    protected readonly _onDidChangeNodeSlowState: Emitter<IAsyncDataTreeNode<TInput, T>>;
    protected readonly nodeMapper: AsyncDataTreeNodeMapper<TInput, T, TFilterData>;
    protected readonly disposables: DisposableStore;
    get onDidScroll(): Event<ScrollEvent>;
    get onDidChangeFocus(): Event<ITreeEvent<T>>;
    get onDidChangeSelection(): Event<ITreeEvent<T>>;
    get onKeyDown(): Event<KeyboardEvent>;
    get onMouseClick(): Event<ITreeMouseEvent<T>>;
    get onMouseDblClick(): Event<ITreeMouseEvent<T>>;
    get onContextMenu(): Event<ITreeContextMenuEvent<T>>;
    get onTap(): Event<ITreeMouseEvent<T>>;
    get onPointer(): Event<ITreeMouseEvent<T>>;
    get onDidFocus(): Event<void>;
    get onDidBlur(): Event<void>;
    /**
     * To be used internally only!
     * @deprecated
     */
    get onDidChangeModel(): Event<void>;
    get onDidChangeCollapseState(): Event<ICollapseStateChangeEvent<IAsyncDataTreeNode<TInput, T> | null, TFilterData>>;
    get onDidUpdateOptions(): Event<IAsyncDataTreeOptionsUpdate>;
    readonly onDidChangeFindOpenState: Event<boolean>;
    get onDidChangeStickyScrollFocused(): Event<boolean>;
    get findMode(): TreeFindMode;
    set findMode(mode: TreeFindMode);
    readonly onDidChangeFindMode: Event<TreeFindMode>;
    get findMatchType(): TreeFindMatchType;
    set findMatchType(matchType: TreeFindMatchType);
    readonly onDidChangeFindMatchType: Event<TreeFindMatchType>;
    get expandOnlyOnTwistieClick(): boolean | ((e: T) => boolean);
    get onDidDispose(): Event<void>;
    constructor(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], dataSource: IAsyncDataSource<TInput, T>, options?: IAsyncDataTreeOptions<T, TFilterData>);
    protected createTree(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], options: IAsyncDataTreeOptions<T, TFilterData>): ObjectTree<IAsyncDataTreeNode<TInput, T>, TFilterData>;
    updateOptions(options?: IAsyncDataTreeOptionsUpdate): void;
    get options(): IAsyncDataTreeOptions<T, TFilterData>;
    getHTMLElement(): HTMLElement;
    get contentHeight(): number;
    get contentWidth(): number;
    get onDidChangeContentHeight(): Event<number>;
    get onDidChangeContentWidth(): Event<number>;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get scrollLeft(): number;
    set scrollLeft(scrollLeft: number);
    get scrollHeight(): number;
    get renderHeight(): number;
    get lastVisibleElement(): T;
    get ariaLabel(): string;
    set ariaLabel(value: string);
    domFocus(): void;
    isDOMFocused(): boolean;
    navigate(start?: T): AsyncDataTreeNavigator<TInput, T>;
    layout(height?: number, width?: number): void;
    style(styles: IListStyles): void;
    getInput(): TInput | undefined;
    setInput(input: TInput, viewState?: IAsyncDataTreeViewState): Promise<void>;
    updateChildren(element?: TInput | T, recursive?: boolean, rerender?: boolean, options?: IAsyncDataTreeUpdateChildrenOptions<T>): Promise<void>;
    private _updateChildren;
    resort(element?: TInput | T, recursive?: boolean): void;
    hasNode(element: TInput | T): boolean;
    rerender(element?: T): void;
    updateElementHeight(element: T, height: number | undefined): void;
    updateWidth(element: T): void;
    getNode(element?: TInput | T): ITreeNode<TInput | T, TFilterData>;
    collapse(element: T, recursive?: boolean): boolean;
    expand(element: T, recursive?: boolean): Promise<boolean>;
    toggleCollapsed(element: T, recursive?: boolean): boolean;
    expandAll(): void;
    expandTo(element: T): Promise<void>;
    collapseAll(): void;
    isCollapsible(element: T): boolean;
    isCollapsed(element: TInput | T): boolean;
    triggerTypeNavigation(): void;
    openFind(): void;
    closeFind(): void;
    refilter(): void;
    setAnchor(element: T | undefined): void;
    getAnchor(): T | undefined;
    setSelection(elements: T[], browserEvent?: UIEvent): void;
    getSelection(): T[];
    setFocus(elements: T[], browserEvent?: UIEvent): void;
    focusNext(n?: number, loop?: boolean, browserEvent?: UIEvent): void;
    focusPrevious(n?: number, loop?: boolean, browserEvent?: UIEvent): void;
    focusNextPage(browserEvent?: UIEvent): Promise<void>;
    focusPreviousPage(browserEvent?: UIEvent): Promise<void>;
    focusLast(browserEvent?: UIEvent): void;
    focusFirst(browserEvent?: UIEvent): void;
    getFocus(): T[];
    getStickyScrollFocus(): T[];
    getFocusedPart(): AbstractTreePart;
    reveal(element: T, relativeTop?: number): void;
    getRelativeTop(element: T): number | null;
    getParentElement(element: T): TInput | T;
    getFirstElementChild(element?: TInput | T): TInput | T | undefined;
    protected getDataNode(element: TInput | T): IAsyncDataTreeNode<TInput, T>;
    private refreshAndRenderNode;
    private refreshNode;
    private doRefreshSubTree;
    private doRefreshNode;
    private doGetChildren;
    private _onDidChangeCollapseState;
    private setChildren;
    protected render(node: IAsyncDataTreeNode<TInput, T>, viewStateContext?: IAsyncDataTreeViewStateContext<TInput, T>, options?: IAsyncDataTreeUpdateChildrenOptions<T>): void;
    protected asTreeElement(node: IAsyncDataTreeNode<TInput, T>, viewStateContext?: IAsyncDataTreeViewStateContext<TInput, T>): IObjectTreeElement<IAsyncDataTreeNode<TInput, T>>;
    protected processChildren(children: Iterable<T>): Iterable<T>;
    getViewState(): IAsyncDataTreeViewState;
    dispose(): void;
}
type CompressibleAsyncDataTreeNodeMapper<TInput, T, TFilterData> = WeakMapper<ITreeNode<ICompressedTreeNode<IAsyncDataTreeNode<TInput, T>>, TFilterData>, ITreeNode<ICompressedTreeNode<TInput | T>, TFilterData>>;
export interface ITreeCompressionDelegate<T> {
    isIncompressible(element: T): boolean;
}
export interface ICompressibleAsyncDataTreeOptions<T, TFilterData = void> extends IAsyncDataTreeOptions<T, TFilterData> {
    readonly compressionEnabled?: boolean;
    readonly keyboardNavigationLabelProvider?: ICompressibleKeyboardNavigationLabelProvider<T>;
}
export interface ICompressibleAsyncDataTreeOptionsUpdate extends IAsyncDataTreeOptionsUpdate {
    readonly compressionEnabled?: boolean;
}
export declare class CompressibleAsyncDataTree<TInput, T, TFilterData = void> extends AsyncDataTree<TInput, T, TFilterData> {
    private compressionDelegate;
    protected readonly tree: CompressibleObjectTree<IAsyncDataTreeNode<TInput, T>, TFilterData>;
    protected readonly compressibleNodeMapper: CompressibleAsyncDataTreeNodeMapper<TInput, T, TFilterData>;
    private filter?;
    constructor(user: string, container: HTMLElement, virtualDelegate: IListVirtualDelegate<T>, compressionDelegate: ITreeCompressionDelegate<T>, renderers: ICompressibleTreeRenderer<T, TFilterData, any>[], dataSource: IAsyncDataSource<TInput, T>, options?: ICompressibleAsyncDataTreeOptions<T, TFilterData>);
    getCompressedTreeNode(e: T | TInput): ICompressedTreeNode<IAsyncDataTreeNode<TInput, T>> | null;
    protected createTree(user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ICompressibleTreeRenderer<T, TFilterData, any>[], options: ICompressibleAsyncDataTreeOptions<T, TFilterData>): ObjectTree<IAsyncDataTreeNode<TInput, T>, TFilterData>;
    protected asTreeElement(node: IAsyncDataTreeNode<TInput, T>, viewStateContext?: IAsyncDataTreeViewStateContext<TInput, T>): ICompressedTreeElement<IAsyncDataTreeNode<TInput, T>>;
    updateOptions(options?: ICompressibleAsyncDataTreeOptionsUpdate): void;
    getViewState(): IAsyncDataTreeViewState;
    protected render(node: IAsyncDataTreeNode<TInput, T>, viewStateContext?: IAsyncDataTreeViewStateContext<TInput, T>, options?: IAsyncDataTreeUpdateChildrenOptions<T>): void;
    protected processChildren(children: Iterable<T>): Iterable<T>;
    navigate(start?: T): AsyncDataTreeNavigator<TInput, T>;
}
declare class AsyncDataTreeNavigator<TInput, T> implements ITreeNavigator<T> {
    private navigator;
    constructor(navigator: ITreeNavigator<IAsyncDataTreeNode<TInput, T> | null>);
    current(): T | null;
    previous(): T | null;
    first(): T | null;
    last(): T | null;
    next(): T | null;
}
export {};
