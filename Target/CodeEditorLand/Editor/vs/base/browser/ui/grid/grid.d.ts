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
export interface IView extends IGridViewView {
    readonly preferredWidth?: number;
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
export declare class Grid<T extends IView = IView> extends Disposable {
    protected gridview: GridView;
    private views;
    get orientation(): Orientation;
    set orientation(orientation: Orientation);
    get width(): number;
    get height(): number;
    get minimumWidth(): number;
    get minimumHeight(): number;
    get maximumWidth(): number;
    get maximumHeight(): number;
    readonly onDidChange: Event<{
        width: number;
        height: number;
    } | undefined>;
    readonly onDidScroll: Event<void>;
    get boundarySashes(): IBoundarySashes;
    set boundarySashes(boundarySashes: IBoundarySashes);
    set edgeSnapping(edgeSnapping: boolean);
    get element(): HTMLElement;
    private didLayout;
    readonly onDidChangeViewMaximized: Event<boolean>;
    constructor(view: T | GridView, options?: IGridOptions);
    style(styles: IGridStyles): void;
    layout(width: number, height: number, top?: number, left?: number): void;
    addView(newView: T, size: number | Sizing, referenceView: T, direction: Direction): void;
    private addViewAt;
    protected _addView(newView: T, size: number | GridViewSizing, location: GridLocation): void;
    removeView(view: T, sizing?: Sizing): void;
    moveView(view: T, sizing: number | Sizing, referenceView: T, direction: Direction): void;
    moveViewTo(view: T, location: GridLocation): void;
    swapViews(from: T, to: T): void;
    resizeView(view: T, size: IViewSize): void;
    isViewExpanded(view: T): boolean;
    isViewMaximized(view: T): boolean;
    hasMaximizedView(): boolean;
    getViewSize(view?: T): IViewSize;
    getViewCachedVisibleSize(view: T): number | undefined;
    maximizeView(view: T): void;
    exitMaximizedView(): void;
    expandView(view: T): void;
    distributeViewSizes(): void;
    isViewVisible(view: T): boolean;
    setViewVisible(view: T, visible: boolean): void;
    getViews(): GridBranchNode<T>;
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
export declare class SerializableGrid<T extends ISerializableView> extends Grid<T> {
    private static serializeNode;
    static deserialize<T extends ISerializableView>(json: ISerializedGrid, deserializer: IViewDeserializer<T>, options?: IGridOptions): SerializableGrid<T>;
    static from<T extends ISerializableView>(gridDescriptor: GridDescriptor<T>, options?: IGridOptions): SerializableGrid<T>;
    private initialLayoutContext;
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
export declare function createSerializedGrid<T>(gridDescriptor: GridDescriptor<T>): ISerializedGrid;
