import { Event } from '../../../common/event.js';
import { Disposable } from '../../../common/lifecycle.js';
import './sash.css';
export interface IVerticalSashLayoutProvider {
    getVerticalSashLeft(sash: Sash): number;
    getVerticalSashTop?(sash: Sash): number;
    getVerticalSashHeight?(sash: Sash): number;
}
export interface IHorizontalSashLayoutProvider {
    getHorizontalSashTop(sash: Sash): number;
    getHorizontalSashLeft?(sash: Sash): number;
    getHorizontalSashWidth?(sash: Sash): number;
}
export interface ISashEvent {
    readonly startX: number;
    readonly currentX: number;
    readonly startY: number;
    readonly currentY: number;
    readonly altKey: boolean;
}
export declare enum OrthogonalEdge {
    North = "north",
    South = "south",
    East = "east",
    West = "west"
}
export interface IBoundarySashes {
    readonly top?: Sash;
    readonly right?: Sash;
    readonly bottom?: Sash;
    readonly left?: Sash;
}
export interface ISashOptions {
    readonly orientation: Orientation;
    readonly size?: number;
    readonly orthogonalStartSash?: Sash;
    readonly orthogonalEndSash?: Sash;
    readonly orthogonalEdge?: OrthogonalEdge;
}
export interface IVerticalSashOptions extends ISashOptions {
    readonly orientation: Orientation.VERTICAL;
}
export interface IHorizontalSashOptions extends ISashOptions {
    readonly orientation: Orientation.HORIZONTAL;
}
export declare const enum Orientation {
    VERTICAL = 0,
    HORIZONTAL = 1
}
export declare const enum SashState {
    Disabled = 0,
    AtMinimum = 1,
    AtMaximum = 2,
    Enabled = 3
}
export declare function setGlobalSashSize(size: number): void;
export declare function setGlobalHoverDelay(size: number): void;
export declare class Sash extends Disposable {
    private el;
    private layoutProvider;
    private orientation;
    private size;
    private hoverDelay;
    private hoverDelayer;
    private _state;
    private readonly onDidEnablementChange;
    private readonly _onDidStart;
    private readonly _onDidChange;
    private readonly _onDidReset;
    private readonly _onDidEnd;
    private readonly orthogonalStartSashDisposables;
    private _orthogonalStartSash;
    private readonly orthogonalStartDragHandleDisposables;
    private _orthogonalStartDragHandle;
    private readonly orthogonalEndSashDisposables;
    private _orthogonalEndSash;
    private readonly orthogonalEndDragHandleDisposables;
    private _orthogonalEndDragHandle;
    get state(): SashState;
    get orthogonalStartSash(): Sash | undefined;
    get orthogonalEndSash(): Sash | undefined;
    set state(state: SashState);
    readonly onDidStart: Event<ISashEvent>;
    readonly onDidChange: Event<ISashEvent>;
    readonly onDidReset: Event<void>;
    readonly onDidEnd: Event<void>;
    linkedSash: Sash | undefined;
    set orthogonalStartSash(sash: Sash | undefined);
    set orthogonalEndSash(sash: Sash | undefined);
    constructor(container: HTMLElement, verticalLayoutProvider: IVerticalSashLayoutProvider, options: IVerticalSashOptions);
    constructor(container: HTMLElement, horizontalLayoutProvider: IHorizontalSashLayoutProvider, options: IHorizontalSashOptions);
    private onPointerStart;
    private onPointerDoublePress;
    private static onMouseEnter;
    private static onMouseLeave;
    clearSashHoverState(): void;
    layout(): void;
    private getOrthogonalSash;
    dispose(): void;
}
