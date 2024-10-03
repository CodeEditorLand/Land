import { IBoundarySashes, Orientation, Sash } from '../sash/sash.js';
import { DistributeSizing, ISplitViewStyles, IView as ISplitView, LayoutPriority, Sizing, AutoSizing } from '../splitview/splitview.js';
import { Event } from '../../../common/event.js';
import { IDisposable } from '../../../common/lifecycle.js';
import './gridview.css';
export { Orientation } from '../sash/sash.js';
export { LayoutPriority, Sizing } from '../splitview/splitview.js';
export interface IGridViewStyles extends ISplitViewStyles {
}
export interface IViewSize {
    readonly width: number;
    readonly height: number;
}
interface IRelativeBoundarySashes {
    readonly start?: Sash;
    readonly end?: Sash;
    readonly orthogonalStart?: Sash;
    readonly orthogonalEnd?: Sash;
}
export interface IView {
    readonly element: HTMLElement;
    readonly minimumWidth: number;
    readonly maximumWidth: number;
    readonly minimumHeight: number;
    readonly maximumHeight: number;
    readonly priority?: LayoutPriority;
    readonly proportionalLayout?: boolean;
    readonly snap?: boolean;
    readonly onDidChange: Event<IViewSize | undefined>;
    layout(width: number, height: number, top: number, left: number): void;
    setVisible?(visible: boolean): void;
    setBoundarySashes?(sashes: IBoundarySashes): void;
}
export interface ISerializableView extends IView {
    toJSON(): object;
}
export interface IViewDeserializer<T extends ISerializableView> {
    fromJSON(json: any): T;
}
export interface ISerializedLeafNode {
    type: 'leaf';
    data: any;
    size: number;
    visible?: boolean;
    maximized?: boolean;
}
export interface ISerializedBranchNode {
    type: 'branch';
    data: ISerializedNode[];
    size: number;
    visible?: boolean;
}
export type ISerializedNode = ISerializedLeafNode | ISerializedBranchNode;
export interface ISerializedGridView {
    root: ISerializedNode;
    orientation: Orientation;
    width: number;
    height: number;
}
export declare function orthogonal(orientation: Orientation): Orientation;
export interface Box {
    readonly top: number;
    readonly left: number;
    readonly width: number;
    readonly height: number;
}
export interface GridLeafNode {
    readonly view: IView;
    readonly box: Box;
    readonly cachedVisibleSize: number | undefined;
    readonly maximized: boolean;
}
export interface GridBranchNode {
    readonly children: GridNode[];
    readonly box: Box;
}
export type GridNode = GridLeafNode | GridBranchNode;
export declare function isGridBranchNode(node: GridNode): node is GridBranchNode;
declare class LayoutController {
    isLayoutEnabled: boolean;
    constructor(isLayoutEnabled: boolean);
}
export interface IGridViewOptions {
    readonly styles?: IGridViewStyles;
    readonly proportionalLayout?: boolean;
}
interface ILayoutContext {
    readonly orthogonalSize: number;
    readonly absoluteOffset: number;
    readonly absoluteOrthogonalOffset: number;
    readonly absoluteSize: number;
    readonly absoluteOrthogonalSize: number;
}
declare class BranchNode implements ISplitView<ILayoutContext>, IDisposable {
    readonly orientation: Orientation;
    readonly layoutController: LayoutController;
    readonly splitviewProportionalLayout: boolean;
    readonly element: HTMLElement;
    readonly children: Node[];
    private splitview;
    private _size;
    get size(): number;
    private _orthogonalSize;
    get orthogonalSize(): number;
    private _absoluteOffset;
    get absoluteOffset(): number;
    private _absoluteOrthogonalOffset;
    get absoluteOrthogonalOffset(): number;
    private absoluteOrthogonalSize;
    private _styles;
    get styles(): IGridViewStyles;
    get width(): number;
    get height(): number;
    get top(): number;
    get left(): number;
    get minimumSize(): number;
    get maximumSize(): number;
    get priority(): LayoutPriority;
    get proportionalLayout(): boolean;
    get minimumOrthogonalSize(): number;
    get maximumOrthogonalSize(): number;
    get minimumWidth(): number;
    get minimumHeight(): number;
    get maximumWidth(): number;
    get maximumHeight(): number;
    private readonly _onDidChange;
    readonly onDidChange: Event<number | undefined>;
    private readonly _onDidVisibilityChange;
    readonly onDidVisibilityChange: Event<boolean>;
    private readonly childrenVisibilityChangeDisposable;
    private _onDidScroll;
    private onDidScrollDisposable;
    readonly onDidScroll: Event<void>;
    private childrenChangeDisposable;
    private readonly _onDidSashReset;
    readonly onDidSashReset: Event<GridLocation>;
    private splitviewSashResetDisposable;
    private childrenSashResetDisposable;
    private _boundarySashes;
    get boundarySashes(): IRelativeBoundarySashes;
    set boundarySashes(boundarySashes: IRelativeBoundarySashes);
    private _edgeSnapping;
    get edgeSnapping(): boolean;
    set edgeSnapping(edgeSnapping: boolean);
    constructor(orientation: Orientation, layoutController: LayoutController, styles: IGridViewStyles, splitviewProportionalLayout: boolean, size?: number, orthogonalSize?: number, edgeSnapping?: boolean, childDescriptors?: INodeDescriptor[]);
    style(styles: IGridViewStyles): void;
    layout(size: number, offset: number, ctx: ILayoutContext | undefined): void;
    setVisible(visible: boolean): void;
    addChild(node: Node, size: number | Sizing, index: number, skipLayout?: boolean): void;
    removeChild(index: number, sizing?: Sizing): Node;
    removeAllChildren(): Node[];
    moveChild(from: number, to: number): void;
    swapChildren(from: number, to: number): void;
    resizeChild(index: number, size: number): void;
    isChildExpanded(index: number): boolean;
    distributeViewSizes(recursive?: boolean): void;
    getChildSize(index: number): number;
    isChildVisible(index: number): boolean;
    setChildVisible(index: number, visible: boolean): void;
    getChildCachedVisibleSize(index: number): number | undefined;
    private updateBoundarySashes;
    private onDidChildrenChange;
    private updateChildrenEvents;
    trySet2x2(other: BranchNode): IDisposable;
    private updateSplitviewEdgeSnappingEnablement;
    dispose(): void;
}
declare class LeafNode implements ISplitView<ILayoutContext>, IDisposable {
    readonly view: IView;
    readonly orientation: Orientation;
    readonly layoutController: LayoutController;
    private _size;
    get size(): number;
    private _orthogonalSize;
    get orthogonalSize(): number;
    private absoluteOffset;
    private absoluteOrthogonalOffset;
    readonly onDidScroll: Event<void>;
    readonly onDidSashReset: Event<GridLocation>;
    private _onDidLinkedWidthNodeChange;
    private _linkedWidthNode;
    get linkedWidthNode(): LeafNode | undefined;
    set linkedWidthNode(node: LeafNode | undefined);
    private _onDidLinkedHeightNodeChange;
    private _linkedHeightNode;
    get linkedHeightNode(): LeafNode | undefined;
    set linkedHeightNode(node: LeafNode | undefined);
    private readonly _onDidSetLinkedNode;
    private _onDidViewChange;
    readonly onDidChange: Event<number | undefined>;
    private readonly disposables;
    constructor(view: IView, orientation: Orientation, layoutController: LayoutController, orthogonalSize: number, size?: number);
    get width(): number;
    get height(): number;
    get top(): number;
    get left(): number;
    get element(): HTMLElement;
    private get minimumWidth();
    private get maximumWidth();
    private get minimumHeight();
    private get maximumHeight();
    get minimumSize(): number;
    get maximumSize(): number;
    get priority(): LayoutPriority | undefined;
    get proportionalLayout(): boolean;
    get snap(): boolean | undefined;
    get minimumOrthogonalSize(): number;
    get maximumOrthogonalSize(): number;
    private _boundarySashes;
    get boundarySashes(): IRelativeBoundarySashes;
    set boundarySashes(boundarySashes: IRelativeBoundarySashes);
    layout(size: number, offset: number, ctx: ILayoutContext | undefined): void;
    private cachedWidth;
    private cachedHeight;
    private cachedTop;
    private cachedLeft;
    private _layout;
    setVisible(visible: boolean): void;
    dispose(): void;
}
type Node = BranchNode | LeafNode;
export interface INodeDescriptor {
    node: Node;
    visible?: boolean;
}
export type GridLocation = number[];
export declare class GridView implements IDisposable {
    readonly element: HTMLElement;
    private styles;
    private proportionalLayout;
    private _root;
    private onDidSashResetRelay;
    private _onDidScroll;
    private _onDidChange;
    private _boundarySashes;
    private layoutController;
    private disposable2x2;
    private get root();
    private set root(value);
    readonly onDidSashReset: Event<GridLocation>;
    readonly onDidScroll: Event<void>;
    readonly onDidChange: Event<IViewSize | undefined>;
    get width(): number;
    get height(): number;
    get minimumWidth(): number;
    get minimumHeight(): number;
    get maximumWidth(): number;
    get maximumHeight(): number;
    get orientation(): Orientation;
    get boundarySashes(): IBoundarySashes;
    set orientation(orientation: Orientation);
    set boundarySashes(boundarySashes: IBoundarySashes);
    set edgeSnapping(edgeSnapping: boolean);
    private maximizedNode;
    private readonly _onDidChangeViewMaximized;
    readonly onDidChangeViewMaximized: Event<boolean>;
    constructor(options?: IGridViewOptions);
    style(styles: IGridViewStyles): void;
    layout(width: number, height: number, top?: number, left?: number): void;
    addView(view: IView, size: number | Sizing, location: GridLocation): void;
    removeView(location: GridLocation, sizing?: DistributeSizing | AutoSizing): IView;
    moveView(parentLocation: GridLocation, from: number, to: number): void;
    swapViews(from: GridLocation, to: GridLocation): void;
    resizeView(location: GridLocation, size: Partial<IViewSize>): void;
    getViewSize(location?: GridLocation): IViewSize;
    getViewCachedVisibleSize(location: GridLocation): number | undefined;
    expandView(location: GridLocation): void;
    isViewExpanded(location: GridLocation): boolean;
    maximizeView(location: GridLocation): void;
    exitMaximizedView(): void;
    hasMaximizedView(): boolean;
    isViewMaximized(location: GridLocation): boolean;
    distributeViewSizes(location?: GridLocation): void;
    isViewVisible(location: GridLocation): boolean;
    setViewVisible(location: GridLocation, visible: boolean): void;
    getView(): GridBranchNode;
    getView(location: GridLocation): GridNode;
    static deserialize<T extends ISerializableView>(json: ISerializedGridView, deserializer: IViewDeserializer<T>, options?: IGridViewOptions): GridView;
    private _deserialize;
    private _deserializeNode;
    private _getViews;
    private getNode;
    trySet2x2(): void;
    getViewMap(map: Map<IView, HTMLElement>, node?: Node): void;
    dispose(): void;
}
