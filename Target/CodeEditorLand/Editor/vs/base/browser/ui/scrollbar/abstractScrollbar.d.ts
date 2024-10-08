import { FastDomNode } from '../../fastDomNode.js';
import { StandardWheelEvent } from '../../mouseEvent.js';
import { ScrollbarArrowOptions } from './scrollbarArrow.js';
import { ScrollbarState } from './scrollbarState.js';
import { ScrollbarVisibilityController } from './scrollbarVisibilityController.js';
import { Widget } from '../widget.js';
import { INewScrollPosition, Scrollable, ScrollbarVisibility } from '../../../common/scrollable.js';
export interface ISimplifiedPointerEvent {
    buttons: number;
    pageX: number;
    pageY: number;
}
export interface ScrollbarHost {
    onMouseWheel(mouseWheelEvent: StandardWheelEvent): void;
    onDragStart(): void;
    onDragEnd(): void;
}
export interface AbstractScrollbarOptions {
    lazyRender: boolean;
    host: ScrollbarHost;
    scrollbarState: ScrollbarState;
    visibility: ScrollbarVisibility;
    extraScrollbarClassName: string;
    scrollable: Scrollable;
    scrollByPage: boolean;
}
export declare abstract class AbstractScrollbar extends Widget {
    protected _host: ScrollbarHost;
    protected _scrollable: Scrollable;
    protected _scrollByPage: boolean;
    private _lazyRender;
    protected _scrollbarState: ScrollbarState;
    protected _visibilityController: ScrollbarVisibilityController;
    private _pointerMoveMonitor;
    domNode: FastDomNode<HTMLElement>;
    slider: FastDomNode<HTMLElement>;
    protected _shouldRender: boolean;
    constructor(opts: AbstractScrollbarOptions);
    /**
     * Creates the dom node for an arrow & adds it to the container
     */
    protected _createArrow(opts: ScrollbarArrowOptions): void;
    /**
     * Creates the slider dom node, adds it to the container & hooks up the events
     */
    protected _createSlider(top: number, left: number, width: number | undefined, height: number | undefined): void;
    protected _onElementSize(visibleSize: number): boolean;
    protected _onElementScrollSize(elementScrollSize: number): boolean;
    protected _onElementScrollPosition(elementScrollPosition: number): boolean;
    beginReveal(): void;
    beginHide(): void;
    render(): void;
    private _domNodePointerDown;
    delegatePointerDown(e: PointerEvent): void;
    private _onPointerDown;
    private _sliderPointerDown;
    private _setDesiredScrollPositionNow;
    updateScrollbarSize(scrollbarSize: number): void;
    isNeeded(): boolean;
    protected abstract _renderDomNode(largeSize: number, smallSize: number): void;
    protected abstract _updateSlider(sliderSize: number, sliderPosition: number): void;
    protected abstract _pointerDownRelativePosition(offsetX: number, offsetY: number): number;
    protected abstract _sliderPointerPosition(e: ISimplifiedPointerEvent): number;
    protected abstract _sliderOrthogonalPointerPosition(e: ISimplifiedPointerEvent): number;
    protected abstract _updateScrollbarSize(size: number): void;
    abstract writeScrollPosition(target: INewScrollPosition, scrollPosition: number): void;
}
