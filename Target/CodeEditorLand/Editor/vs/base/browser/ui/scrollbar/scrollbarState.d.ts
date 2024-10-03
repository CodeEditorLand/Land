export declare class ScrollbarState {
    private _scrollbarSize;
    private _oppositeScrollbarSize;
    private readonly _arrowSize;
    private _visibleSize;
    private _scrollSize;
    private _scrollPosition;
    private _computedAvailableSize;
    private _computedIsNeeded;
    private _computedSliderSize;
    private _computedSliderRatio;
    private _computedSliderPosition;
    constructor(arrowSize: number, scrollbarSize: number, oppositeScrollbarSize: number, visibleSize: number, scrollSize: number, scrollPosition: number);
    clone(): ScrollbarState;
    setVisibleSize(visibleSize: number): boolean;
    setScrollSize(scrollSize: number): boolean;
    setScrollPosition(scrollPosition: number): boolean;
    setScrollbarSize(scrollbarSize: number): void;
    setOppositeScrollbarSize(oppositeScrollbarSize: number): void;
    private static _computeValues;
    private _refreshComputedValues;
    getArrowSize(): number;
    getScrollPosition(): number;
    getRectangleLargeSize(): number;
    getRectangleSmallSize(): number;
    isNeeded(): boolean;
    getSliderSize(): number;
    getSliderPosition(): number;
    getDesiredScrollPositionFromOffset(offset: number): number;
    getDesiredScrollPositionFromOffsetPaged(offset: number): number;
    getDesiredScrollPositionFromDelta(delta: number): number;
}
