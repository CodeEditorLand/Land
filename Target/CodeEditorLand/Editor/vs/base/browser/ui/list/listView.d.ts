import { IDragAndDropData } from '../../dnd.js';
import { Dimension } from '../../dom.js';
import { IMouseWheelEvent } from '../../mouseEvent.js';
import { Event, IValueWithChangeEvent } from '../../../common/event.js';
import { IDisposable } from '../../../common/lifecycle.js';
import { IRange } from '../../../common/range.js';
import { ScrollbarVisibility, ScrollEvent } from '../../../common/scrollable.js';
import { ISpliceable } from '../../../common/sequence.js';
import { IListDragAndDrop, IListGestureEvent, IListMouseEvent, IListRenderer, IListTouchEvent, IListVirtualDelegate } from './list.js';
import { IRangeMap } from './rangeMap.js';
import { AriaRole } from '../aria/aria.js';
export interface IListViewDragAndDrop<T> extends IListDragAndDrop<T> {
    getDragElements(element: T): T[];
}
export declare const enum ListViewTargetSector {
    TOP = 0,// [0%-25%)
    CENTER_TOP = 1,// [25%-50%)
    CENTER_BOTTOM = 2,// [50%-75%)
    BOTTOM = 3
}
export interface IListViewAccessibilityProvider<T> {
    getSetSize?(element: T, index: number, listLength: number): number;
    getPosInSet?(element: T, index: number): number;
    getRole?(element: T): AriaRole | undefined;
    isChecked?(element: T): boolean | IValueWithChangeEvent<boolean> | undefined;
}
export interface IListViewOptionsUpdate {
    readonly smoothScrolling?: boolean;
    readonly horizontalScrolling?: boolean;
    readonly scrollByPage?: boolean;
    readonly mouseWheelScrollSensitivity?: number;
    readonly fastScrollSensitivity?: number;
    readonly paddingTop?: number;
    readonly paddingBottom?: number;
}
export interface IListViewOptions<T> extends IListViewOptionsUpdate {
    readonly dnd?: IListViewDragAndDrop<T>;
    readonly useShadows?: boolean;
    readonly verticalScrollMode?: ScrollbarVisibility;
    readonly setRowLineHeight?: boolean;
    readonly setRowHeight?: boolean;
    readonly supportDynamicHeights?: boolean;
    readonly mouseSupport?: boolean;
    readonly accessibilityProvider?: IListViewAccessibilityProvider<T>;
    readonly transformOptimization?: boolean;
    readonly alwaysConsumeMouseWheel?: boolean;
    readonly initialSize?: Dimension;
}
export declare class ElementsDragAndDropData<T, TContext = void> implements IDragAndDropData {
    readonly elements: T[];
    private _context;
    get context(): TContext | undefined;
    set context(value: TContext | undefined);
    constructor(elements: T[]);
    update(): void;
    getData(): T[];
}
export declare class ExternalElementsDragAndDropData<T> implements IDragAndDropData {
    readonly elements: T[];
    constructor(elements: T[]);
    update(): void;
    getData(): T[];
}
export declare class NativeDragAndDropData implements IDragAndDropData {
    readonly types: any[];
    readonly files: any[];
    constructor();
    update(dataTransfer: DataTransfer): void;
    getData(): {
        types: any[];
        files: any[];
    };
}
export interface IListView<T> extends ISpliceable<T>, IDisposable {
    readonly domId: string;
    readonly domNode: HTMLElement;
    readonly containerDomNode: HTMLElement;
    readonly scrollableElementDomNode: HTMLElement;
    readonly length: number;
    readonly contentHeight: number;
    readonly contentWidth: number;
    readonly onDidChangeContentHeight: Event<number>;
    readonly onDidChangeContentWidth: Event<number>;
    readonly renderHeight: number;
    readonly scrollHeight: number;
    readonly firstVisibleIndex: number;
    readonly firstMostlyVisibleIndex: number;
    readonly lastVisibleIndex: number;
    onDidScroll: Event<ScrollEvent>;
    onWillScroll: Event<ScrollEvent>;
    onMouseClick: Event<IListMouseEvent<T>>;
    onMouseDblClick: Event<IListMouseEvent<T>>;
    onMouseMiddleClick: Event<IListMouseEvent<T>>;
    onMouseUp: Event<IListMouseEvent<T>>;
    onMouseDown: Event<IListMouseEvent<T>>;
    onMouseOver: Event<IListMouseEvent<T>>;
    onMouseMove: Event<IListMouseEvent<T>>;
    onMouseOut: Event<IListMouseEvent<T>>;
    onContextMenu: Event<IListMouseEvent<T>>;
    onTouchStart: Event<IListTouchEvent<T>>;
    onTap: Event<IListGestureEvent<T>>;
    element(index: number): T;
    domElement(index: number): HTMLElement | null;
    getElementDomId(index: number): string;
    elementHeight(index: number): number;
    elementTop(index: number): number;
    indexOf(element: T): number;
    indexAt(position: number): number;
    indexAfter(position: number): number;
    updateOptions(options: IListViewOptionsUpdate): void;
    getScrollTop(): number;
    setScrollTop(scrollTop: number, reuseAnimation?: boolean): void;
    getScrollLeft(): number;
    setScrollLeft(scrollLeft: number): void;
    delegateScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    updateWidth(index: number): void;
    updateElementHeight(index: number, size: number | undefined, anchorIndex: number | null): void;
    rerender(): void;
    layout(height?: number, width?: number): void;
}
/**
 * The {@link ListView} is a virtual scrolling engine.
 *
 * Given that it only renders elements within its viewport, it can hold large
 * collections of elements and stay very performant. The performance bottleneck
 * usually lies within the user's rendering code for each element.
 *
 * @remarks It is a low-level widget, not meant to be used directly. Refer to the
 * List widget instead.
 */
export declare class ListView<T> implements IListView<T> {
    private virtualDelegate;
    private static InstanceCount;
    readonly domId: string;
    readonly domNode: HTMLElement;
    private items;
    private itemId;
    protected rangeMap: IRangeMap;
    private cache;
    private renderers;
    protected lastRenderTop: number;
    protected lastRenderHeight: number;
    private renderWidth;
    private rowsContainer;
    private scrollable;
    private scrollableElement;
    private _scrollHeight;
    private scrollableElementUpdateDisposable;
    private scrollableElementWidthDelayer;
    private splicing;
    private dragOverAnimationDisposable;
    private dragOverAnimationStopDisposable;
    private dragOverMouseY;
    private setRowLineHeight;
    private setRowHeight;
    private supportDynamicHeights;
    private paddingBottom;
    private accessibilityProvider;
    private scrollWidth;
    private dnd;
    private canDrop;
    private currentDragData;
    private currentDragFeedback;
    private currentDragFeedbackPosition;
    private currentDragFeedbackDisposable;
    private onDragLeaveTimeout;
    private readonly disposables;
    private readonly _onDidChangeContentHeight;
    private readonly _onDidChangeContentWidth;
    readonly onDidChangeContentHeight: Event<number>;
    readonly onDidChangeContentWidth: Event<number>;
    get contentHeight(): number;
    get contentWidth(): number;
    get onDidScroll(): Event<ScrollEvent>;
    get onWillScroll(): Event<ScrollEvent>;
    get containerDomNode(): HTMLElement;
    get scrollableElementDomNode(): HTMLElement;
    private _horizontalScrolling;
    private get horizontalScrolling();
    private set horizontalScrolling(value);
    constructor(container: HTMLElement, virtualDelegate: IListVirtualDelegate<T>, renderers: IListRenderer<any, any>[], options?: IListViewOptions<T>);
    updateOptions(options: IListViewOptionsUpdate): void;
    delegateScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    updateElementHeight(index: number, size: number | undefined, anchorIndex: number | null): void;
    protected createRangeMap(paddingTop: number): IRangeMap;
    splice(start: number, deleteCount: number, elements?: readonly T[]): T[];
    private _splice;
    protected eventuallyUpdateScrollDimensions(): void;
    private eventuallyUpdateScrollWidth;
    private updateScrollWidth;
    updateWidth(index: number): void;
    rerender(): void;
    get length(): number;
    get renderHeight(): number;
    get firstVisibleIndex(): number;
    get firstMostlyVisibleIndex(): number;
    get lastVisibleIndex(): number;
    element(index: number): T;
    indexOf(element: T): number;
    domElement(index: number): HTMLElement | null;
    elementHeight(index: number): number;
    elementTop(index: number): number;
    indexAt(position: number): number;
    indexAfter(position: number): number;
    layout(height?: number, width?: number): void;
    protected render(previousRenderRange: IRange, renderTop: number, renderHeight: number, renderLeft: number | undefined, scrollWidth: number | undefined, updateItemsInDOM?: boolean): void;
    private insertItemInDOM;
    private measureItemWidth;
    private updateItemInDOM;
    private removeItemFromDOM;
    getScrollTop(): number;
    setScrollTop(scrollTop: number, reuseAnimation?: boolean): void;
    getScrollLeft(): number;
    setScrollLeft(scrollLeft: number): void;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get scrollHeight(): number;
    get onMouseClick(): Event<IListMouseEvent<T>>;
    get onMouseDblClick(): Event<IListMouseEvent<T>>;
    get onMouseMiddleClick(): Event<IListMouseEvent<T>>;
    get onMouseUp(): Event<IListMouseEvent<T>>;
    get onMouseDown(): Event<IListMouseEvent<T>>;
    get onMouseOver(): Event<IListMouseEvent<T>>;
    get onMouseMove(): Event<IListMouseEvent<T>>;
    get onMouseOut(): Event<IListMouseEvent<T>>;
    get onContextMenu(): Event<IListMouseEvent<T> | IListGestureEvent<T>>;
    get onTouchStart(): Event<IListTouchEvent<T>>;
    get onTap(): Event<IListGestureEvent<T>>;
    private toMouseEvent;
    private toTouchEvent;
    private toGestureEvent;
    private toDragEvent;
    private onScroll;
    private onTouchChange;
    private onDragStart;
    private onDragOver;
    private onDragLeave;
    private onDrop;
    private onDragEnd;
    private clearDragOverFeedback;
    private setupDragAndDropScrollTopAnimation;
    private animateDragAndDropScrollTop;
    private teardownDragAndDropScrollTopAnimation;
    private getTargetSector;
    private getItemIndexFromEventTarget;
    protected getRenderRange(renderTop: number, renderHeight: number): IRange;
    /**
     * Given a stable rendered state, checks every rendered element whether it needs
     * to be probed for dynamic height. Adjusts scroll height and top if necessary.
     */
    protected _rerender(renderTop: number, renderHeight: number, inSmoothScrolling?: boolean): void;
    private probeDynamicHeight;
    getElementDomId(index: number): string;
    dispose(): void;
}
