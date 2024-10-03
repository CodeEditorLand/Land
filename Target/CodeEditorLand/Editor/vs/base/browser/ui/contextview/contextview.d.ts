import { StandardMouseEvent } from '../../mouseEvent.js';
import { Disposable, IDisposable } from '../../../common/lifecycle.js';
import { OmitOptional } from '../../../common/types.js';
import './contextview.css';
export declare const enum ContextViewDOMPosition {
    ABSOLUTE = 1,
    FIXED = 2,
    FIXED_SHADOW = 3
}
export interface IAnchor {
    x: number;
    y: number;
    width?: number;
    height?: number;
}
export declare function isAnchor(obj: unknown): obj is IAnchor | OmitOptional<IAnchor>;
export declare const enum AnchorAlignment {
    LEFT = 0,
    RIGHT = 1
}
export declare const enum AnchorPosition {
    BELOW = 0,
    ABOVE = 1
}
export declare const enum AnchorAxisAlignment {
    VERTICAL = 0,
    HORIZONTAL = 1
}
export interface IDelegate {
    getAnchor(): HTMLElement | StandardMouseEvent | IAnchor;
    render(container: HTMLElement): IDisposable | null;
    focus?(): void;
    layout?(): void;
    anchorAlignment?: AnchorAlignment;
    anchorPosition?: AnchorPosition;
    anchorAxisAlignment?: AnchorAxisAlignment;
    canRelayout?: boolean;
    onDOMEvent?(e: Event, activeElement: HTMLElement): void;
    onHide?(data?: unknown): void;
    layer?: number;
}
export interface IContextViewProvider {
    showContextView(delegate: IDelegate, container?: HTMLElement): void;
    hideContextView(): void;
    layout(): void;
}
export interface IPosition {
    top: number;
    left: number;
}
export interface ISize {
    width: number;
    height: number;
}
export interface IView extends IPosition, ISize {
}
export declare const enum LayoutAnchorPosition {
    Before = 0,
    After = 1
}
export declare enum LayoutAnchorMode {
    AVOID = 0,
    ALIGN = 1
}
export interface ILayoutAnchor {
    offset: number;
    size: number;
    mode?: LayoutAnchorMode;
    position: LayoutAnchorPosition;
}
export declare function layout(viewportSize: number, viewSize: number, anchor: ILayoutAnchor): number;
export declare class ContextView extends Disposable {
    private static readonly BUBBLE_UP_EVENTS;
    private static readonly BUBBLE_DOWN_EVENTS;
    private container;
    private view;
    private useFixedPosition;
    private useShadowDOM;
    private delegate;
    private toDisposeOnClean;
    private toDisposeOnSetContainer;
    private shadowRoot;
    private shadowRootHostElement;
    constructor(container: HTMLElement, domPosition: ContextViewDOMPosition);
    setContainer(container: HTMLElement | null, domPosition: ContextViewDOMPosition): void;
    show(delegate: IDelegate): void;
    getViewElement(): HTMLElement;
    layout(): void;
    private doLayout;
    hide(data?: unknown): void;
    private isVisible;
    private onDOMEvent;
    dispose(): void;
}
