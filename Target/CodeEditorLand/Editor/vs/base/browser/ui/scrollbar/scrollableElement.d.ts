import { IMouseWheelEvent, StandardWheelEvent } from '../../mouseEvent.js';
import { ScrollableElementChangeOptions, ScrollableElementCreationOptions, ScrollableElementResolvedOptions } from './scrollableElementOptions.js';
import { Widget } from '../widget.js';
import { Event } from '../../../common/event.js';
import { INewScrollDimensions, INewScrollPosition, IScrollDimensions, IScrollPosition, ScrollEvent, Scrollable } from '../../../common/scrollable.js';
import './media/scrollbars.css';
export interface IOverviewRulerLayoutInfo {
    parent: HTMLElement;
    insertBefore: HTMLElement;
}
export declare class MouseWheelClassifier {
    static readonly INSTANCE: MouseWheelClassifier;
    private readonly _capacity;
    private _memory;
    private _front;
    private _rear;
    constructor();
    isPhysicalMouseWheel(): boolean;
    acceptStandardWheelEvent(e: StandardWheelEvent): void;
    accept(timestamp: number, deltaX: number, deltaY: number): void;
    private _computeScore;
    private _isAlmostInt;
}
export declare abstract class AbstractScrollableElement extends Widget {
    private readonly _options;
    protected readonly _scrollable: Scrollable;
    private readonly _verticalScrollbar;
    private readonly _horizontalScrollbar;
    private readonly _domNode;
    private readonly _leftShadowDomNode;
    private readonly _topShadowDomNode;
    private readonly _topLeftShadowDomNode;
    private readonly _listenOnDomNode;
    private _mouseWheelToDispose;
    private _isDragging;
    private _mouseIsOver;
    private readonly _hideTimeout;
    private _shouldRender;
    private _revealOnScroll;
    private readonly _onScroll;
    readonly onScroll: Event<ScrollEvent>;
    private readonly _onWillScroll;
    readonly onWillScroll: Event<ScrollEvent>;
    get options(): Readonly<ScrollableElementResolvedOptions>;
    protected constructor(element: HTMLElement, options: ScrollableElementCreationOptions, scrollable: Scrollable);
    dispose(): void;
    getDomNode(): HTMLElement;
    getOverviewRulerLayoutInfo(): IOverviewRulerLayoutInfo;
    delegateVerticalScrollbarPointerDown(browserEvent: PointerEvent): void;
    getScrollDimensions(): IScrollDimensions;
    setScrollDimensions(dimensions: INewScrollDimensions): void;
    updateClassName(newClassName: string): void;
    updateOptions(newOptions: ScrollableElementChangeOptions): void;
    setRevealOnScroll(value: boolean): void;
    delegateScrollFromMouseWheelEvent(browserEvent: IMouseWheelEvent): void;
    private _setListeningToMouseWheel;
    private _onMouseWheel;
    private _onDidScroll;
    renderNow(): void;
    private _render;
    private _onDragStart;
    private _onDragEnd;
    private _onMouseLeave;
    private _onMouseOver;
    private _reveal;
    private _hide;
    private _scheduleHide;
}
export declare class ScrollableElement extends AbstractScrollableElement {
    constructor(element: HTMLElement, options: ScrollableElementCreationOptions);
    setScrollPosition(update: INewScrollPosition): void;
    getScrollPosition(): IScrollPosition;
}
export declare class SmoothScrollableElement extends AbstractScrollableElement {
    constructor(element: HTMLElement, options: ScrollableElementCreationOptions, scrollable: Scrollable);
    setScrollPosition(update: INewScrollPosition & {
        reuseAnimation?: boolean;
    }): void;
    getScrollPosition(): IScrollPosition;
}
export declare class DomScrollableElement extends AbstractScrollableElement {
    private _element;
    constructor(element: HTMLElement, options: ScrollableElementCreationOptions);
    setScrollPosition(update: INewScrollPosition): void;
    getScrollPosition(): IScrollPosition;
    scanDomNode(): void;
}
