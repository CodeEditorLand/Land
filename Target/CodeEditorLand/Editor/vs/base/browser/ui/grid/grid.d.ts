import { IBoundarySashes, Orientation } from '../sash/sash.js';
import { Event } from '../../../common/event.js';
import { Disposable } from '../../../common/lifecycle.js';
import './gridview.css';
import { Box, GridView, IGridViewOptions, IGridViewStyles, IView as IGridViewView, IViewSize, Sizing as GridViewSizing, GridLocation } from './gridview.js';
export type { IViewSize };
export { LayoutPriority, Orientation, orthogonal } from './gridview.js';
export declare const enum Direction {
    Up = 0,
    Down = 1,
    Left = 2,
    Right = 3
}
/**
 * The interface to implement for views within a {@link Grid}.
 */
export interface IView extends IGridViewView {
    /**
     * The preferred width for when the user double clicks a sash
     * adjacent to this view.
     */
    readonly preferredWidth?: number;
    /**
     * The preferred height for when the user double clicks a sash
     * adjacent to this view.
     */
    readonly preferredHeight?: number;
}
export interface GridLeafNode<T extends IView> {
    readonly view: T;
    readonly box: Box;
    readonly cachedVisibleSize: number | undefined;
    readonly maximized: boolean;
}
export interface GridBranchNode<T extends IView> {
    readonly children: GridNode<T>[];
    readonly box: Box;
}
export type GridNode<T extends IView> = GridLeafNode<T> | GridBranchNode<T>;
export declare function isGridBranchNode<T extends IView>(node: GridNode<T>): node is GridBranchNode<T>;
export declare function getRelativeLocation(rootOrientation: Orientation, location: GridLocation, direction: Direction): GridLocation;
export type DistributeSizing = {
    type: 'distribute';
};
export type SplitSizing = {
    type: 'split';
};
export type AutoSizing = {
    type: 'auto';
};
export type InvisibleSizing = {
    type: 'invisible';
    cachedVisibleSize: number;
};
export type Sizing = DistributeSizing | SplitSizing | AutoSizing | InvisibleSizing;
export declare namespace Sizing {
    const Distribute: DistributeSizing;
    const Split: SplitSizing;
    const Auto: AutoSizing;
    function Invisible(cachedVisibleSize: number): InvisibleSizing;
}
export interface IGridStyles extends IGridViewStyles {
}
export interface IGridOptions extends IGridViewOptions {
}
/**
 * The {@link Grid} exposes a Grid widget in a friendlier API than the underlying
 * {@link GridView} widget. Namely, all mutation operations are addressed by the
 * model elements, rather than indexes.
 *
 * It support the same features as the {@link GridView}.
 */
export declare class Grid<T extends IView = IView> extends Disposable {
    protected gridview: GridView;
    private views;
    /**
     * The orientation of the grid. Matches the orientation of the root
     * {@link SplitView} in the grid's {@link GridLocation} model.
     */
    get orientation(): Orientation;
    set orientation(orientation: Orientation);
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
    /**
     * Fires whenever a view within the grid changes its size constraints.
     */
    readonly onDidChange: Event<{
        width: number;
        height: number;
    } | undefined>;
    /**
     * Fires whenever the user scrolls a {@link SplitView} within
     * the grid.
     */
    readonly onDidScroll: Event<void>;
    /**
     * A collection of sashes perpendicular to each edge of the grid.
     * Corner sashes will be created for each intersection.
     */
    get boundarySashes(): IBoundarySashes;
    set boundarySashes(boundarySashes: IBoundarySashes);
    /**
     * Enable/disable edge snapping across all grid views.
     */
    set edgeSnapping(edgeSnapping: boolean);
    /**
     * The DOM element for this view.
     */
    get element(): HTMLElement;
    private didLayout;
    readonly onDidChangeViewMaximized: Event<boolean>;
    /**
     * Create a new {@link Grid}. A grid must *always* have a view
     * inside.
     *
     * @param view An initial view for this Grid.
     */
    constructor(view: T | GridView, options?: IGridOptions);
    style(styles: IGridStyles): void;
    /**
     * Layout the {@link Grid}.
     *
     * Optionally provide a `top` and `left` positions, those will propagate
     * as an origin for positions passed to {@link IView.layout}.
     *
     * @param width The width of the {@link Grid}.
     * @param height The height of the {@link Grid}.
     * @param top Optional, the top location of the {@link Grid}.
     * @param left Optional, the left location of the {@link Grid}.
     */
    layout(width: number, height: number, top?: number, left?: number): void;
    /**
     * Add a {@link IView view} to this {@link Grid}, based on another reference view.
     *
     * Take this grid as an example:
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
     * Calling `addView(X, Sizing.Distribute, C, Direction.Right)` will make the following
     * changes:
     *
     * ```
     *  +-----+---------------+
     *  |  A  |      B        |
     *  +-----+-+-------+-----+
     *  |   C   |   X   |     |
     *  +-------+-------+  D  |
     *  |        E      |     |
     *  +---------------+-----+
     * ```
     *
     * Or `addView(X, Sizing.Distribute, D, Direction.Down)`:
     *
     * ```
     *  +-----+---------------+
     *  |  A  |      B        |
     *  +-----+---------+-----+
     *  |        C      |  D  |
     *  +---------------+-----+
     *  |        E      |  X  |
     *  +---------------+-----+
     * ```
     *
     * @param newView The view to add.
     * @param size Either a fixed size, or a dynamic {@link Sizing} strategy.
     * @param referenceView Another view to place this new view next to.
     * @param direction The direction the new view should be placed next to the reference view.
     */
    addView(newView: T, size: number | Sizing, referenceView: T, direction: Direction): void;
    private addViewAt;
    protected _addView(newView: T, size: number | GridViewSizing, location: GridLocation): void;
    /**
     * Remove a {@link IView view} from this {@link Grid}.
     *
     * @param view The {@link IView view} to remove.
     * @param sizing Whether to distribute other {@link IView view}'s sizes.
     */
    removeView(view: T, sizing?: Sizing): void;
    /**
     * Move a {@link IView view} to another location in the grid.
     *
     * @remarks See {@link Grid.addView}.
     *
     * @param view The {@link IView view} to move.
     * @param sizing Either a fixed size, or a dynamic {@link Sizing} strategy.
     * @param referenceView Another view to place the view next to.
     * @param direction The direction the view should be placed next to the reference view.
     */
    moveView(view: T, sizing: number | Sizing, referenceView: T, direction: Direction): void;
    /**
     * Move a {@link IView view} to another location in the grid.
     *
     * @remarks Internal method, do not use without knowing what you're doing.
     * @remarks See {@link GridView.moveView}.
     *
     * @param view The {@link IView view} to move.
     * @param location The {@link GridLocation location} to insert the view on.
     */
    moveViewTo(view: T, location: GridLocation): void;
    /**
     * Swap two {@link IView views} within the {@link Grid}.
     *
     * @param from One {@link IView view}.
     * @param to Another {@link IView view}.
     */
    swapViews(from: T, to: T): void;
    /**
     * Resize a {@link IView view}.
     *
     * @param view The {@link IView view} to resize.
     * @param size The size the view should be.
     */
    resizeView(view: T, size: IViewSize): void;
    /**
     * Returns whether all other {@link IView views} are at their minimum size.
     *
     * @param view The reference {@link IView view}.
     */
    isViewExpanded(view: T): boolean;
    /**
     * Returns whether the {@link IView view} is maximized.
     *
     * @param view The reference {@link IView view}.
     */
    isViewMaximized(view: T): boolean;
    /**
     * Returns whether the {@link IView view} is maximized.
     *
     * @param view The reference {@link IView view}.
     */
    hasMaximizedView(): boolean;
    /**
     * Get the size of a {@link IView view}.
     *
     * @param view The {@link IView view}. Provide `undefined` to get the size
     * of the grid itself.
     */
    getViewSize(view?: T): IViewSize;
    /**
     * Get the cached visible size of a {@link IView view}. This was the size
     * of the view at the moment it last became hidden.
     *
     * @param view The {@link IView view}.
     */
    getViewCachedVisibleSize(view: T): number | undefined;
    /**
     * Maximizes the specified view and hides all other views.
     * @param view The view to maximize.
     */
    maximizeView(view: T): void;
    exitMaximizedView(): void;
    /**
     * Expand the size of a {@link IView view} by collapsing all other views
     * to their minimum sizes.
     *
     * @param view The {@link IView view}.
     */
    expandView(view: T): void;
    /**
     * Distribute the size among all {@link IView views} within the entire
     * grid or within a single {@link SplitView}.
     */
    distributeViewSizes(): void;
    /**
     * Returns whether a {@link IView view} is visible.
     *
     * @param view The {@link IView view}.
     */
    isViewVisible(view: T): boolean;
    /**
     * Set the visibility state of a {@link IView view}.
     *
     * @param view The {@link IView view}.
     */
    setViewVisible(view: T, visible: boolean): void;
    /**
     * Returns a descriptor for the entire grid.
     */
    getViews(): GridBranchNode<T>;
    /**
     * Utility method to return the collection all views which intersect
     * a view's edge.
     *
     * @param view The {@link IView view}.
     * @param direction Which direction edge to be considered.
     * @param wrap Whether the grid wraps around (from right to left, from bottom to top).
     */
    getNeighborViews(view: T, direction: Direction, wrap?: boolean): T[];
    private getViewLocation;
    private onDidSashReset;
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
export interface ISerializedGrid {
    root: ISerializedNode;
    orientation: Orientation;
    width: number;
    height: number;
}
/**
 * A {@link Grid} which can serialize itself.
 */
export declare class SerializableGrid<T extends ISerializableView> extends Grid<T> {
    private static serializeNode;
    /**
     * Construct a new {@link SerializableGrid} from a JSON object.
     *
     * @param json The JSON object.
     * @param deserializer A deserializer which can revive each view.
     * @returns A new {@link SerializableGrid} instance.
     */
    static deserialize<T extends ISerializableView>(json: ISerializedGrid, deserializer: IViewDeserializer<T>, options?: IGridOptions): SerializableGrid<T>;
    /**
     * Construct a new {@link SerializableGrid} from a grid descriptor.
     *
     * @param gridDescriptor A grid descriptor in which leaf nodes point to actual views.
     * @returns A new {@link SerializableGrid} instance.
     */
    static from<T extends ISerializableView>(gridDescriptor: GridDescriptor<T>, options?: IGridOptions): SerializableGrid<T>;
    /**
     * Useful information in order to proportionally restore view sizes
     * upon the very first layout call.
     */
    private initialLayoutContext;
    /**
     * Serialize this grid into a JSON object.
     */
    serialize(): ISerializedGrid;
    layout(width: number, height: number, top?: number, left?: number): void;
}
export type GridLeafNodeDescriptor<T> = {
    size?: number;
    data?: any;
};
export type GridBranchNodeDescriptor<T> = {
    size?: number;
    groups: GridNodeDescriptor<T>[];
};
export type GridNodeDescriptor<T> = GridBranchNodeDescriptor<T> | GridLeafNodeDescriptor<T>;
export type GridDescriptor<T> = {
    orientation: Orientation;
} & GridBranchNodeDescriptor<T>;
export declare function sanitizeGridNodeDescriptor<T>(nodeDescriptor: GridNodeDescriptor<T>, rootNode: boolean): void;
/**
 * Creates a new JSON object from a {@link GridDescriptor}, which can
 * be deserialized by {@link SerializableGrid.deserialize}.
 */
export declare function createSerializedGrid<T>(gridDescriptor: GridDescriptor<T>): ISerializedGrid;
