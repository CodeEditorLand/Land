import { Orientation, Sash } from '../sash/sash.js';
import { Color } from '../../../common/color.js';
import { Event } from '../../../common/event.js';
import { Disposable, IDisposable } from '../../../common/lifecycle.js';
import { ScrollbarVisibility, ScrollEvent } from '../../../common/scrollable.js';
import './splitview.css';
export { Orientation } from '../sash/sash.js';
export interface ISplitViewStyles {
    readonly separatorBorder: Color;
}
export declare const enum LayoutPriority {
    Normal = 0,
    Low = 1,
    High = 2
}
export interface IView<TLayoutContext = undefined> {
    readonly element: HTMLElement;
    readonly minimumSize: number;
    readonly maximumSize: number;
    readonly priority?: LayoutPriority;
    readonly proportionalLayout?: boolean;
    readonly snap?: boolean;
    readonly onDidChange: Event<number | undefined>;
    layout(size: number, offset: number, context: TLayoutContext | undefined): void;
    setVisible?(visible: boolean): void;
}
export interface ISplitViewDescriptor<TLayoutContext = undefined, TView extends IView<TLayoutContext> = IView<TLayoutContext>> {
    readonly size: number;
    readonly views: {
        readonly visible?: boolean;
        readonly size: number;
        readonly view: TView;
    }[];
}
export interface ISplitViewOptions<TLayoutContext = undefined, TView extends IView<TLayoutContext> = IView<TLayoutContext>> {
    readonly orientation?: Orientation;
    readonly styles?: ISplitViewStyles;
    readonly inverseAltBehavior?: boolean;
    readonly proportionalLayout?: boolean;
    readonly descriptor?: ISplitViewDescriptor<TLayoutContext, TView>;
    readonly scrollbarVisibility?: ScrollbarVisibility;
    readonly getSashOrthogonalSize?: () => number;
}
interface ISashItem {
    sash: Sash;
    disposable: IDisposable;
}
export type DistributeSizing = {
    type: 'distribute';
};
export type SplitSizing = {
    type: 'split';
    index: number;
};
export type AutoSizing = {
    type: 'auto';
    index: number;
};
export type InvisibleSizing = {
    type: 'invisible';
    cachedVisibleSize: number;
};
export type Sizing = DistributeSizing | SplitSizing | AutoSizing | InvisibleSizing;
export declare namespace Sizing {
    const Distribute: DistributeSizing;
    function Split(index: number): SplitSizing;
    function Auto(index: number): AutoSizing;
    function Invisible(cachedVisibleSize: number): InvisibleSizing;
}
export declare class SplitView<TLayoutContext = undefined, TView extends IView<TLayoutContext> = IView<TLayoutContext>> extends Disposable {
    readonly orientation: Orientation;
    readonly el: HTMLElement;
    private sashContainer;
    private viewContainer;
    private scrollable;
    private scrollableElement;
    private size;
    private layoutContext;
    private _contentSize;
    private proportions;
    private viewItems;
    sashItems: ISashItem[];
    private sashDragState;
    private state;
    private inverseAltBehavior;
    private proportionalLayout;
    private readonly getSashOrthogonalSize;
    private _onDidSashChange;
    private _onDidSashReset;
    private _orthogonalStartSash;
    private _orthogonalEndSash;
    private _startSnappingEnabled;
    private _endSnappingEnabled;
    get contentSize(): number;
    readonly onDidSashChange: Event<number>;
    readonly onDidSashReset: Event<number>;
    readonly onDidScroll: Event<ScrollEvent>;
    get length(): number;
    get minimumSize(): number;
    get maximumSize(): number;
    get orthogonalStartSash(): Sash | undefined;
    get orthogonalEndSash(): Sash | undefined;
    get startSnappingEnabled(): boolean;
    get endSnappingEnabled(): boolean;
    set orthogonalStartSash(sash: Sash | undefined);
    set orthogonalEndSash(sash: Sash | undefined);
    get sashes(): readonly Sash[];
    set startSnappingEnabled(startSnappingEnabled: boolean);
    set endSnappingEnabled(endSnappingEnabled: boolean);
    constructor(container: HTMLElement, options?: ISplitViewOptions<TLayoutContext, TView>);
    style(styles: ISplitViewStyles): void;
    addView(view: TView, size: number | Sizing, index?: number, skipLayout?: boolean): void;
    removeView(index: number, sizing?: Sizing): TView;
    removeAllViews(): TView[];
    moveView(from: number, to: number): void;
    swapViews(from: number, to: number): void;
    isViewVisible(index: number): boolean;
    setViewVisible(index: number, visible: boolean): void;
    getViewCachedVisibleSize(index: number): number | undefined;
    layout(size: number, layoutContext?: TLayoutContext): void;
    private saveProportions;
    private onSashStart;
    private onSashChange;
    private onSashEnd;
    private onViewChange;
    resizeView(index: number, size: number): void;
    isViewExpanded(index: number): boolean;
    distributeViewSizes(): void;
    getViewSize(index: number): number;
    private doAddView;
    private relayout;
    private resize;
    private distributeEmptySpace;
    private layoutViews;
    private updateScrollableElement;
    private updateSashEnablement;
    private getSashPosition;
    private findFirstSnapIndex;
    private areViewsDistributed;
    dispose(): void;
}
