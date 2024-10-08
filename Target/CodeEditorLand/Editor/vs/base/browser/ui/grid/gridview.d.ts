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
/**
 * The interface to implement for views within a {@link GridView}.
 */
export interface IView {
    /**
     * The DOM element for this view.
     */
    readonly element: HTMLElement;
    /**
     * A minimum width for this view.
     *
     * @remarks If none, set it to `0`.
     */
    readonly minimumWidth: number;
    /**
     * A minimum width for this view.
     *
     * @remarks If none, set it to `Number.POSITIVE_INFINITY`.
     */
    readonly maximumWidth: number;
    /**
     * A minimum height for this view.
     *
     * @remarks If none, set it to `0`.
     */
    readonly minimumHeight: number;
    /**
     * A minimum height for this view.
     *
     * @remarks If none, set it to `Number.POSITIVE_INFINITY`.
     */
    readonly maximumHeight: number;
    /**
     * The priority of the view when the {@link GridView} layout algorithm
     * runs. Views with higher priority will be resized first.
     *
     * @remarks Only used when `proportionalLayout` is false.
     */
    readonly priority?: LayoutPriority;
    /**
     * If the {@link GridView} supports proportional layout,
     * this property allows for finer control over the proportional layout algorithm, per view.
     *
     * @defaultValue `true`
     */
    readonly proportionalLayout?: boolean;
    /**
     * Whether the view will snap whenever the user reaches its minimum size or
     * attempts to grow it beyond the minimum size.
     *
     * @defaultValue `false`
     */
    readonly snap?: boolean;
    /**
     * View instances are supposed to fire this event whenever any of the constraint
     * properties have changed:
     *
     * - {@link IView.minimumWidth}
     * - {@link IView.maximumWidth}
     * - {@link IView.minimumHeight}
     * - {@link IView.maximumHeight}
     * - {@link IView.priority}
     * - {@link IView.snap}
     *
     * The {@link GridView} will relayout whenever that happens. The event can
     * optionally emit the view's preferred size for that relayout.
     */
    readonly onDidChange: Event<IViewSize | undefined>;
    /**
     * This will be called by the {@link GridView} during layout. A view meant to
     * pass along the layout information down to its descendants.
     */
    layout(width: number, height: number, top: number, left: number): void;
    /**
     * This will be called by the {@link GridView} whenever this view is made
     * visible or hidden.
     *
     * @param visible Whether the view becomes visible.
     */
    setVisible?(visible: boolean): void;
    /**
     * This will be called by the {@link GridView} whenever this view is on
     * an edge of the grid and the grid's
     * {@link GridView.boundarySashes boundary sashes} change.
     */
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
    /**
     * Styles overriding the {@link defaultStyles default ones}.
     */
    readonly styles?: IGridViewStyles;
    /**
     * Resize each view proportionally when resizing the {@link GridView}.
     *
     * @defaultValue `true`
     */
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
/**
 * The location of a {@link IView view} within a {@link GridView}.
 *
 * A GridView is a tree composition of multiple {@link SplitView} instances, orthogonal
 * between one another. Here's an example:
 *
 * ```
 *  +-----+---------------+
 *  |  A  |      B        |
 *  +-----+---------+-----+
 *  |        C      |     |
 *  +---------------+  D  |
 *  |        E      |     |
 *  +---------------+-----+
 * ```
 *
 * The above grid's tree structure is:
 *
 * ```
 *  Vertical SplitView
 *  +-Horizontal SplitView
 *  | +-A
 *  | +-B
 *  +- Horizontal SplitView
 *    +-Vertical SplitView
 *    | +-C
 *    | +-E
 *    +-D
 * ```
 *
 * So, {@link IView views} within a {@link GridView} can be referenced by
 * a sequence of indexes, each index referencing each SplitView. Here are
 * each view's locations, from the example above:
 *
 * - `A`: `[0,0]`
 * - `B`: `[0,1]`
 * - `C`: `[1,0,0]`
 * - `D`: `[1,1]`
 * - `E`: `[1,0,1]`
 */
export type GridLocation = number[];
/**
 * The {@link GridView} is the UI component which implements a two dimensional
 * flex-like layout algorithm for a collection of {@link IView} instances, which
 * are mostly HTMLElement instances with size constraints. A {@link GridView} is a
 * tree composition of multiple {@link SplitView} instances, orthogonal between
 * one another. It will respect view's size contraints, just like the SplitView.
 *
 * It has a low-level index based API, allowing for fine grain performant operations.
 * Look into the {@link Grid} widget for a higher-level API.
 *
 * Features:
 * - flex-like layout algorithm
 * - snap support
 * - corner sash support
 * - Alt key modifier behavior, macOS style
 * - layout (de)serialization
 */
export declare class GridView implements IDisposable {
    /**
     * The DOM element for this view.
     */
    readonly element: HTMLElement;
    private styles;
    private proportionalLayout;
    private _root;
    private onDidSashResetRelay;
    private _onDidScroll;
    private _onDidChange;
    private _boundarySashes;
    /**
     * The layout controller makes sure layout only propagates
     * to the views after the very first call to {@link GridView.layout}.
     */
    private layoutController;
    private disposable2x2;
    private get root();
    private set root(value);
    /**
     * Fires whenever the user double clicks a {@link Sash sash}.
     */
    readonly onDidSashReset: Event<GridLocation>;
    /**
     * Fires whenever the user scrolls a {@link SplitView} within
     * the grid.
     */
    readonly onDidScroll: Event<void>;
    /**
     * Fires whenever a view within the grid changes its size constraints.
     */
    readonly onDidChange: Event<IViewSize | undefined>;
    /**
     * The width of the grid.
     */
    get width(): number;
    /**
     * The height of the grid.
     */
    get height(): number;
    /**
     * The minimum width of the grid.
     */
    get minimumWidth(): number;
    /**
     * The minimum height of the grid.
     */
    get minimumHeight(): number;
    /**
     * The maximum width of the grid.
     */
    get maximumWidth(): number;
    /**
     * The maximum height of the grid.
     */
    get maximumHeight(): number;
    get orientation(): Orientation;
    get boundarySashes(): IBoundarySashes;
    /**
     * The orientation of the grid. Matches the orientation of the root
     * {@link SplitView} in the grid's tree model.
     */
    set orientation(orientation: Orientation);
    /**
     * A collection of sashes perpendicular to each edge of the grid.
     * Corner sashes will be created for each intersection.
     */
    set boundarySashes(boundarySashes: IBoundarySashes);
    /**
     * Enable/disable edge snapping across all grid views.
     */
    set edgeSnapping(edgeSnapping: boolean);
    private maximizedNode;
    private readonly _onDidChangeViewMaximized;
    readonly onDidChangeViewMaximized: Event<boolean>;
    /**
     * Create a new {@link GridView} instance.
     *
     * @remarks It's the caller's responsibility to append the
     * {@link GridView.element} to the page's DOM.
     */
    constructor(options?: IGridViewOptions);
    style(styles: IGridViewStyles): void;
    /**
     * Layout the {@link GridView}.
     *
     * Optionally provide a `top` and `left` positions, those will propagate
     * as an origin for positions passed to {@link IView.layout}.
     *
     * @param width The width of the {@link GridView}.
     * @param height The height of the {@link GridView}.
     * @param top Optional, the top location of the {@link GridView}.
     * @param left Optional, the left location of the {@link GridView}.
     */
    layout(width: number, height: number, top?: number, left?: number): void;
    /**
     * Add a {@link IView view} to this {@link GridView}.
     *
     * @param view The view to add.
     * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
     * @param location The {@link GridLocation location} to insert the view on.
     */
    addView(view: IView, size: number | Sizing, location: GridLocation): void;
    /**
     * Remove a {@link IView view} from this {@link GridView}.
     *
     * @param location The {@link GridLocation location} of the {@link IView view}.
     * @param sizing Whether to distribute other {@link IView view}'s sizes.
     */
    removeView(location: GridLocation, sizing?: DistributeSizing | AutoSizing): IView;
    /**
     * Move a {@link IView view} within its parent.
     *
     * @param parentLocation The {@link GridLocation location} of the {@link IView view}'s parent.
     * @param from The index of the {@link IView view} to move.
     * @param to The index where the {@link IView view} should move to.
     */
    moveView(parentLocation: GridLocation, from: number, to: number): void;
    /**
     * Swap two {@link IView views} within the {@link GridView}.
     *
     * @param from The {@link GridLocation location} of one view.
     * @param to The {@link GridLocation location} of another view.
     */
    swapViews(from: GridLocation, to: GridLocation): void;
    /**
     * Resize a {@link IView view}.
     *
     * @param location The {@link GridLocation location} of the view.
     * @param size The size the view should be. Optionally provide a single dimension.
     */
    resizeView(location: GridLocation, size: Partial<IViewSize>): void;
    /**
     * Get the size of a {@link IView view}.
     *
     * @param location The {@link GridLocation location} of the view. Provide `undefined` to get
     * the size of the grid itself.
     */
    getViewSize(location?: GridLocation): IViewSize;
    /**
     * Get the cached visible size of a {@link IView view}. This was the size
     * of the view at the moment it last became hidden.
     *
     * @param location The {@link GridLocation location} of the view.
     */
    getViewCachedVisibleSize(location: GridLocation): number | undefined;
    /**
     * Maximize the size of a {@link IView view} by collapsing all other views
     * to their minimum sizes.
     *
     * @param location The {@link GridLocation location} of the view.
     */
    expandView(location: GridLocation): void;
    /**
     * Returns whether all other {@link IView views} are at their minimum size.
     *
     * @param location The {@link GridLocation location} of the view.
     */
    isViewExpanded(location: GridLocation): boolean;
    maximizeView(location: GridLocation): void;
    exitMaximizedView(): void;
    hasMaximizedView(): boolean;
    /**
     * Returns whether the {@link IView view} is maximized.
     *
     * @param location The {@link GridLocation location} of the view.
     */
    isViewMaximized(location: GridLocation): boolean;
    /**
     * Distribute the size among all {@link IView views} within the entire
     * grid or within a single {@link SplitView}.
     *
     * @param location The {@link GridLocation location} of a view containing
     * children views, which will have their sizes distributed within the parent
     * view's size. Provide `undefined` to recursively distribute all views' sizes
     * in the entire grid.
     */
    distributeViewSizes(location?: GridLocation): void;
    /**
     * Returns whether a {@link IView view} is visible.
     *
     * @param location The {@link GridLocation location} of the view.
     */
    isViewVisible(location: GridLocation): boolean;
    /**
     * Set the visibility state of a {@link IView view}.
     *
     * @param location The {@link GridLocation location} of the view.
     */
    setViewVisible(location: GridLocation, visible: boolean): void;
    /**
     * Returns a descriptor for the entire grid.
     */
    getView(): GridBranchNode;
    /**
     * Returns a descriptor for a {@link GridLocation subtree} within the
     * {@link GridView}.
     *
     * @param location The {@link GridLocation location} of the root of
     * the {@link GridLocation subtree}.
     */
    getView(location: GridLocation): GridNode;
    /**
     * Construct a new {@link GridView} from a JSON object.
     *
     * @param json The JSON object.
     * @param deserializer A deserializer which can revive each view.
     * @returns A new {@link GridView} instance.
     */
    static deserialize<T extends ISerializableView>(json: ISerializedGridView, deserializer: IViewDeserializer<T>, options?: IGridViewOptions): GridView;
    private _deserialize;
    private _deserializeNode;
    private _getViews;
    private getNode;
    /**
     * Attempt to lock the {@link Sash sashes} in this {@link GridView} so
     * the grid behaves as a 2x2 matrix, with a corner sash in the middle.
     *
     * In case the grid isn't a 2x2 grid _and_ all sashes are not aligned,
     * this method is a no-op.
     */
    trySet2x2(): void;
    /**
     * Populate a map with views to DOM nodes.
     * @remarks To be used internally only.
     */
    getViewMap(map: Map<IView, HTMLElement>, node?: Node): void;
    dispose(): void;
}
