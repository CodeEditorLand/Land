import { Widget } from '../widget.js';
import { ThemeIcon } from '../../../common/themables.js';
/**
 * The arrow image size.
 */
export declare const ARROW_IMG_SIZE = 11;
export interface ScrollbarArrowOptions {
    onActivate: () => void;
    className: string;
    icon: ThemeIcon;
    bgWidth: number;
    bgHeight: number;
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
}
export declare class ScrollbarArrow extends Widget {
    private _onActivate;
    bgDomNode: HTMLElement;
    domNode: HTMLElement;
    private _pointerdownRepeatTimer;
    private _pointerdownScheduleRepeatTimer;
    private _pointerMoveMonitor;
    constructor(opts: ScrollbarArrowOptions);
    private _arrowPointerDown;
}
