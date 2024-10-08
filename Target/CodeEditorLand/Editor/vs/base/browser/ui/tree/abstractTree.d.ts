import { IContextViewProvider } from '../contextview/contextview.js';
import { IInputBoxStyles } from '../inputbox/inputBox.js';
import { IIdentityProvider, IListRenderer, IListVirtualDelegate } from '../list/list.js';
import { IListOptions, IListStyles, List, MouseController, TypeNavigationMode } from '../list/listWidget.js';
import { IToggleStyles } from '../toggle/toggle.js';
import { ICollapseStateChangeEvent, ITreeContextMenuEvent, ITreeDragAndDrop, ITreeEvent, ITreeFilter, ITreeModel, ITreeModelSpliceEvent, ITreeMouseEvent, ITreeNavigator, ITreeNode, ITreeRenderer, TreeFilterResult, TreeVisibility } from './tree.js';
import { ThemeIcon } from '../../../common/themables.js';
import { SetMap } from '../../../common/map.js';
import { Event } from '../../../common/event.js';
import { FuzzyScore } from '../../../common/filters.js';
import { Disposable, DisposableStore, IDisposable } from '../../../common/lifecycle.js';
import { ScrollEvent } from '../../../common/scrollable.js';
import './media/tree.css';
export declare class ComposedTreeDelegate<T, N extends {
    element: T;
}> implements IListVirtualDelegate<N> {
    private delegate;
    constructor(delegate: IListVirtualDelegate<T>);
    getHeight(element: N): number;
    getTemplateId(element: N): string;
    hasDynamicHeight(element: N): boolean;
    setDynamicHeight(element: N, height: number): void;
}
interface ITreeListTemplateData<T> {
    readonly container: HTMLElement;
    readonly indent: HTMLElement;
    readonly twistie: HTMLElement;
    indentGuidesDisposable: IDisposable;
    readonly templateData: T;
}
export interface IAbstractTreeViewState {
    readonly focus: Iterable<string>;
    readonly selection: Iterable<string>;
    readonly expanded: {
        [id: string]: 1 | 0;
    };
    readonly scrollTop: number;
}
export declare class AbstractTreeViewState implements IAbstractTreeViewState {
    readonly focus: Set<string>;
    readonly selection: Set<string>;
    readonly expanded: {
        [id: string]: 1 | 0;
    };
    scrollTop: number;
    static lift(state: IAbstractTreeViewState): AbstractTreeViewState;
    static empty(scrollTop?: number): AbstractTreeViewState;
    protected constructor(state: IAbstractTreeViewState);
    toJSON(): IAbstractTreeViewState;
}
export declare enum RenderIndentGuides {
    None = "none",
    OnHover = "onHover",
    Always = "always"
}
interface ITreeRendererOptions {
    readonly indent?: number;
    readonly renderIndentGuides?: RenderIndentGuides;
    readonly hideTwistiesOfChildlessElements?: boolean;
}
interface Collection<T> {
    readonly elements: T[];
    readonly onDidChange: Event<T[]>;
}
export declare class TreeRenderer<T, TFilterData, TRef, TTemplateData> implements IListRenderer<ITreeNode<T, TFilterData>, ITreeListTemplateData<TTemplateData>> {
    private renderer;
    private model;
    private activeNodes;
    private renderedIndentGuides;
    private static readonly DefaultIndent;
    readonly templateId: string;
    private renderedElements;
    private renderedNodes;
    private indent;
    private hideTwistiesOfChildlessElements;
    private shouldRenderIndentGuides;
    private activeIndentNodes;
    private indentGuidesDisposable;
    private readonly disposables;
    constructor(renderer: ITreeRenderer<T, TFilterData, TTemplateData>, model: ITreeModel<T, TFilterData, TRef>, onDidChangeCollapseState: Event<ICollapseStateChangeEvent<T, TFilterData>>, activeNodes: Collection<ITreeNode<T, TFilterData>>, renderedIndentGuides: SetMap<ITreeNode<T, TFilterData>, HTMLDivElement>, options?: ITreeRendererOptions);
    updateOptions(options?: ITreeRendererOptions): void;
    renderTemplate(container: HTMLElement): ITreeListTemplateData<TTemplateData>;
    renderElement(node: ITreeNode<T, TFilterData>, index: number, templateData: ITreeListTemplateData<TTemplateData>, height: number | undefined): void;
    disposeElement(node: ITreeNode<T, TFilterData>, index: number, templateData: ITreeListTemplateData<TTemplateData>, height: number | undefined): void;
    disposeTemplate(templateData: ITreeListTemplateData<TTemplateData>): void;
    private onDidChangeTwistieState;
    private onDidChangeNodeTwistieState;
    private renderTreeElement;
    private _renderIndentGuides;
    private _onDidChangeActiveNodes;
    setModel(model: ITreeModel<T, TFilterData, TRef>): void;
    dispose(): void;
}
export declare function contiguousFuzzyScore(patternLower: string, wordLower: string): FuzzyScore | undefined;
export type LabelFuzzyScore = {
    label: string;
    score: FuzzyScore;
};
export interface IFindFilter<T> extends ITreeFilter<T, FuzzyScore | LabelFuzzyScore> {
    filter(element: T, parentVisibility: TreeVisibility): TreeFilterResult<FuzzyScore | LabelFuzzyScore>;
    pattern: string;
}
export interface ITreeFindToggleContribution {
    id: string;
    title: string;
    icon: ThemeIcon;
    isChecked: boolean;
}
export declare class FindToggles {
    private stateMap;
    constructor(startStates: ITreeFindToggleContribution[]);
    states(): ITreeFindToggleContribution[];
    get(id: string): boolean;
    set(id: string, value: boolean): boolean;
}
export interface ITreeFindToggleChangeEvent {
    readonly id: string;
    readonly isChecked: boolean;
}
export interface IFindWidgetStyles {
    listFilterWidgetBackground: string | undefined;
    listFilterWidgetOutline: string | undefined;
    listFilterWidgetNoMatchesOutline: string | undefined;
    listFilterWidgetShadow: string | undefined;
    readonly toggleStyles: IToggleStyles;
    readonly inputBoxStyles: IInputBoxStyles;
}
export interface IFindWidgetOptions {
    readonly history?: string[];
    readonly styles?: IFindWidgetStyles;
}
export declare enum TreeFindMode {
    Highlight = 0,
    Filter = 1
}
export declare enum TreeFindMatchType {
    Fuzzy = 0,
    Contiguous = 1
}
interface IAbstractFindControllerOptions extends IFindWidgetOptions {
    placeholder?: string;
    toggles?: ITreeFindToggleContribution[];
    showNotFoundMessage?: boolean;
}
export declare abstract class AbstractFindController<T, TFilterData> implements IDisposable {
    protected tree: AbstractTree<T, TFilterData, any>;
    protected filter: IFindFilter<T>;
    protected readonly contextViewProvider: IContextViewProvider;
    protected readonly options: IAbstractFindControllerOptions;
    private _history;
    private _pattern;
    get pattern(): string;
    private previousPattern;
    protected readonly toggles: FindToggles;
    private _placeholder;
    protected get placeholder(): string;
    protected set placeholder(value: string);
    private widget;
    private width;
    private readonly _onDidChangePattern;
    readonly onDidChangePattern: Event<string>;
    private readonly _onDidChangeOpenState;
    readonly onDidChangeOpenState: Event<boolean>;
    private readonly enabledDisposables;
    protected readonly disposables: DisposableStore;
    constructor(tree: AbstractTree<T, TFilterData, any>, filter: IFindFilter<T>, contextViewProvider: IContextViewProvider, options?: IAbstractFindControllerOptions);
    isOpened(): boolean;
    open(): void;
    close(): void;
    protected onDidChangeValue(pattern: string): void;
    protected abstract applyPattern(pattern: string): void;
    protected onDidToggleChange(e: ITreeFindToggleChangeEvent): void;
    protected updateToggleState(id: string, checked: boolean): void;
    protected renderMessage(showNotFound: boolean): void;
    protected alertResults(results: number): void;
    layout(width: number): void;
    dispose(): void;
}
export interface StickyScrollNode<T, TFilterData> {
    readonly node: ITreeNode<T, TFilterData>;
    readonly startIndex: number;
    readonly endIndex: number;
    readonly height: number;
    readonly position: number;
}
export interface IStickyScrollDelegate<T, TFilterData> {
    constrainStickyScrollNodes(stickyNodes: StickyScrollNode<T, TFilterData>[], stickyScrollMaxItemCount: number, maxWidgetHeight: number): StickyScrollNode<T, TFilterData>[];
}
declare class StickyScrollController<T, TFilterData, TRef> extends Disposable {
    private readonly tree;
    private model;
    private readonly view;
    private readonly treeDelegate;
    readonly onDidChangeHasFocus: Event<boolean>;
    readonly onContextMenu: Event<ITreeContextMenuEvent<T>>;
    private readonly stickyScrollDelegate;
    private stickyScrollMaxItemCount;
    private readonly maxWidgetViewRatio;
    private readonly _widget;
    constructor(tree: AbstractTree<T, TFilterData, TRef>, model: ITreeModel<T, TFilterData, TRef>, view: List<ITreeNode<T, TFilterData>>, renderers: TreeRenderer<T, TFilterData, TRef, any>[], treeDelegate: IListVirtualDelegate<ITreeNode<T, TFilterData>>, options?: IAbstractTreeOptions<T, TFilterData>);
    get height(): number;
    get count(): number;
    getNode(node: ITreeNode<T, TFilterData>): StickyScrollNode<T, TFilterData> | undefined;
    private getNodeAtHeight;
    private update;
    private findStickyState;
    private getNextVisibleNode;
    private getNextStickyNode;
    private nodeTopAlignsWithStickyNodesBottom;
    private createStickyScrollNode;
    private getAncestorUnderPrevious;
    private calculateStickyNodePosition;
    private constrainStickyNodes;
    private getParentNode;
    private nodeIsUncollapsedParent;
    private getNodeIndex;
    private getNodeRange;
    nodePositionTopBelowWidget(node: ITreeNode<T, TFilterData>): number;
    getFocus(): T | undefined;
    domFocus(): void;
    focusedLast(): boolean;
    updateOptions(optionsUpdate?: IAbstractTreeOptionsUpdate): void;
    validateStickySettings(options: IAbstractTreeOptionsUpdate): {
        stickyScrollMaxItemCount: number;
    };
    setModel(model: ITreeModel<T, TFilterData, TRef>): void;
}
export interface IAbstractTreeOptionsUpdate extends ITreeRendererOptions {
    readonly multipleSelectionSupport?: boolean;
    readonly typeNavigationEnabled?: boolean;
    readonly typeNavigationMode?: TypeNavigationMode;
    readonly defaultFindMode?: TreeFindMode;
    readonly defaultFindMatchType?: TreeFindMatchType;
    readonly showNotFoundMessage?: boolean;
    readonly smoothScrolling?: boolean;
    readonly horizontalScrolling?: boolean;
    readonly scrollByPage?: boolean;
    readonly mouseWheelScrollSensitivity?: number;
    readonly fastScrollSensitivity?: number;
    readonly expandOnDoubleClick?: boolean;
    readonly expandOnlyOnTwistieClick?: boolean | ((e: any) => boolean);
    readonly enableStickyScroll?: boolean;
    readonly stickyScrollMaxItemCount?: number;
}
export interface IAbstractTreeOptions<T, TFilterData = void> extends IAbstractTreeOptionsUpdate, IListOptions<T> {
    readonly contextViewProvider?: IContextViewProvider;
    readonly collapseByDefault?: boolean;
    readonly allowNonCollapsibleParents?: boolean;
    readonly filter?: ITreeFilter<T, TFilterData>;
    readonly dnd?: ITreeDragAndDrop<T>;
    readonly paddingBottom?: number;
    readonly findWidgetEnabled?: boolean;
    readonly findWidgetStyles?: IFindWidgetStyles;
    readonly defaultFindVisibility?: TreeVisibility | ((e: T) => TreeVisibility);
    readonly stickyScrollDelegate?: IStickyScrollDelegate<any, TFilterData>;
}
/**
 * The trait concept needs to exist at the tree level, because collapsed
 * tree nodes will not be known by the list.
 */
declare class Trait<T> {
    private getFirstViewElementWithTrait;
    private identityProvider?;
    private nodes;
    private elements;
    private readonly _onDidChange;
    readonly onDidChange: Event<ITreeEvent<T>>;
    private _nodeSet;
    private get nodeSet();
    constructor(getFirstViewElementWithTrait: () => ITreeNode<T, any> | undefined, identityProvider?: IIdentityProvider<T> | undefined);
    set(nodes: ITreeNode<T, any>[], browserEvent?: UIEvent): void;
    private _set;
    get(): T[];
    getNodes(): readonly ITreeNode<T, any>[];
    has(node: ITreeNode<T, any>): boolean;
    onDidModelSplice({ insertedNodes, deletedNodes }: ITreeModelSpliceEvent<T, any>): void;
    private createNodeSet;
}
interface ITreeNodeListOptions<T, TFilterData, TRef> extends IListOptions<ITreeNode<T, TFilterData>> {
    readonly tree: AbstractTree<T, TFilterData, TRef>;
    readonly stickyScrollProvider: () => StickyScrollController<T, TFilterData, TRef> | undefined;
}
/**
 * We use this List subclass to restore selection and focus as nodes
 * get rendered in the list, possibly due to a node expand() call.
 */
declare class TreeNodeList<T, TFilterData, TRef> extends List<ITreeNode<T, TFilterData>> {
    private focusTrait;
    private selectionTrait;
    private anchorTrait;
    constructor(user: string, container: HTMLElement, virtualDelegate: IListVirtualDelegate<ITreeNode<T, TFilterData>>, renderers: IListRenderer<any, any>[], focusTrait: Trait<T>, selectionTrait: Trait<T>, anchorTrait: Trait<T>, options: ITreeNodeListOptions<T, TFilterData, TRef>);
    protected createMouseController(options: ITreeNodeListOptions<T, TFilterData, TRef>): MouseController<ITreeNode<T, TFilterData>>;
    splice(start: number, deleteCount: number, elements?: readonly ITreeNode<T, TFilterData>[]): void;
    setFocus(indexes: number[], browserEvent?: UIEvent, fromAPI?: boolean): void;
    setSelection(indexes: number[], browserEvent?: UIEvent, fromAPI?: boolean): void;
    setAnchor(index: number | undefined, fromAPI?: boolean): void;
}
export declare const enum AbstractTreePart {
    Tree = 0,
    StickyScroll = 1
}
export declare abstract class AbstractTree<T, TFilterData, TRef> implements IDisposable {
    private readonly _user;
    private _options;
    protected view: TreeNodeList<T, TFilterData, TRef>;
    private renderers;
    protected model: ITreeModel<T, TFilterData, TRef>;
    private treeDelegate;
    private focus;
    private selection;
    private anchor;
    private eventBufferer;
    private findController?;
    private findFilter?;
    readonly onDidChangeFindOpenState: Event<boolean>;
    onDidChangeStickyScrollFocused: Event<boolean>;
    private focusNavigationFilter;
    private stickyScrollController?;
    private styleElement;
    protected readonly disposables: DisposableStore;
    get onDidScroll(): Event<ScrollEvent>;
    get onDidChangeFocus(): Event<ITreeEvent<T>>;
    get onDidChangeSelection(): Event<ITreeEvent<T>>;
    get onMouseClick(): Event<ITreeMouseEvent<T>>;
    get onMouseDblClick(): Event<ITreeMouseEvent<T>>;
    get onMouseOver(): Event<ITreeMouseEvent<T>>;
    get onMouseOut(): Event<ITreeMouseEvent<T>>;
    get onContextMenu(): Event<ITreeContextMenuEvent<T>>;
    get onTap(): Event<ITreeMouseEvent<T>>;
    get onPointer(): Event<ITreeMouseEvent<T>>;
    get onKeyDown(): Event<KeyboardEvent>;
    get onKeyUp(): Event<KeyboardEvent>;
    get onKeyPress(): Event<KeyboardEvent>;
    get onDidFocus(): Event<void>;
    get onDidBlur(): Event<void>;
    private readonly onDidSwapModel;
    private readonly onDidChangeModelRelay;
    private readonly onDidSpliceModelRelay;
    private readonly onDidChangeCollapseStateRelay;
    private readonly onDidChangeRenderNodeCountRelay;
    private readonly onDidChangeActiveNodesRelay;
    get onDidChangeModel(): Event<void>;
    get onDidChangeCollapseState(): Event<ICollapseStateChangeEvent<T, TFilterData>>;
    get onDidChangeRenderNodeCount(): Event<ITreeNode<T, TFilterData>>;
    private readonly _onWillRefilter;
    readonly onWillRefilter: Event<void>;
    get findMode(): TreeFindMode;
    set findMode(findMode: TreeFindMode);
    readonly onDidChangeFindMode: Event<TreeFindMode>;
    get findMatchType(): TreeFindMatchType;
    set findMatchType(findFuzzy: TreeFindMatchType);
    readonly onDidChangeFindMatchType: Event<TreeFindMatchType>;
    get onDidChangeFindPattern(): Event<string>;
    get expandOnDoubleClick(): boolean;
    get expandOnlyOnTwistieClick(): boolean | ((e: T) => boolean);
    private readonly _onDidUpdateOptions;
    readonly onDidUpdateOptions: Event<IAbstractTreeOptions<T, TFilterData>>;
    get onDidDispose(): Event<void>;
    constructor(_user: string, container: HTMLElement, delegate: IListVirtualDelegate<T>, renderers: ITreeRenderer<T, TFilterData, any>[], _options?: IAbstractTreeOptions<T, TFilterData>);
    updateOptions(optionsUpdate?: IAbstractTreeOptionsUpdate): void;
    get options(): IAbstractTreeOptions<T, TFilterData>;
    private updateStickyScroll;
    updateWidth(element: TRef): void;
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
    get firstVisibleElement(): T | undefined;
    get lastVisibleElement(): T;
    get ariaLabel(): string;
    set ariaLabel(value: string);
    get selectionSize(): number;
    domFocus(): void;
    isDOMFocused(): boolean;
    layout(height?: number, width?: number): void;
    style(styles: IListStyles): void;
    getParentElement(location: TRef): T;
    getFirstElementChild(location: TRef): T | undefined;
    getNode(location?: TRef): ITreeNode<T, TFilterData>;
    getNodeLocation(node: ITreeNode<T, TFilterData>): TRef;
    collapse(location: TRef, recursive?: boolean): boolean;
    expand(location: TRef, recursive?: boolean): boolean;
    toggleCollapsed(location: TRef, recursive?: boolean): boolean;
    expandAll(): void;
    collapseAll(): void;
    isCollapsible(location: TRef): boolean;
    setCollapsible(location: TRef, collapsible?: boolean): boolean;
    isCollapsed(location: TRef): boolean;
    expandTo(location: TRef): void;
    triggerTypeNavigation(): void;
    openFind(): void;
    closeFind(): void;
    refilter(): void;
    setAnchor(element: TRef | undefined): void;
    getAnchor(): T | undefined;
    setSelection(elements: TRef[], browserEvent?: UIEvent): void;
    getSelection(): T[];
    setFocus(elements: TRef[], browserEvent?: UIEvent): void;
    focusNext(n?: number, loop?: boolean, browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    focusPrevious(n?: number, loop?: boolean, browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    focusNextPage(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): Promise<void>;
    focusPreviousPage(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): Promise<void>;
    focusLast(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    focusFirst(browserEvent?: UIEvent, filter?: ((node: ITreeNode<T, TFilterData>) => boolean) | undefined): void;
    getFocus(): T[];
    getStickyScrollFocus(): T[];
    getFocusedPart(): AbstractTreePart;
    reveal(location: TRef, relativeTop?: number): void;
    /**
     * Returns the relative position of an element rendered in the list.
     * Returns `null` if the element isn't *entirely* in the visible viewport.
     */
    getRelativeTop(location: TRef): number | null;
    getViewState(identityProvider?: IIdentityProvider<T> | undefined): AbstractTreeViewState;
    private onLeftArrow;
    private onRightArrow;
    private onSpace;
    protected abstract createModel(user: string, options: IAbstractTreeOptions<T, TFilterData>): ITreeModel<T, TFilterData, TRef>;
    createNewModel(options?: IAbstractTreeOptions<T, TFilterData>): ITreeModel<T, TFilterData, TRef>;
    private readonly modelDisposables;
    private setupModel;
    setModel(newModel: ITreeModel<T, TFilterData, TRef>): void;
    getModel(): ITreeModel<T, TFilterData, TRef>;
    navigate(start?: TRef): ITreeNavigator<T>;
    dispose(): void;
}
export {};
