import { AbstractScrollbar, ISimplifiedPointerEvent, ScrollbarHost } from './abstractScrollbar.js';
import { ScrollableElementResolvedOptions } from './scrollableElementOptions.js';
import { INewScrollPosition, Scrollable, ScrollEvent } from '../../../common/scrollable.js';
export declare class HorizontalScrollbar extends AbstractScrollbar {
    constructor(scrollable: Scrollable, options: ScrollableElementResolvedOptions, host: ScrollbarHost);
    protected _updateSlider(sliderSize: number, sliderPosition: number): void;
    protected _renderDomNode(largeSize: number, smallSize: number): void;
    onDidScroll(e: ScrollEvent): boolean;
    protected _pointerDownRelativePosition(offsetX: number, offsetY: number): number;
    protected _sliderPointerPosition(e: ISimplifiedPointerEvent): number;
    protected _sliderOrthogonalPointerPosition(e: ISimplifiedPointerEvent): number;
    protected _updateScrollbarSize(size: number): void;
    writeScrollPosition(target: INewScrollPosition, scrollPosition: number): void;
    updateOptions(options: ScrollableElementResolvedOptions): void;
}
