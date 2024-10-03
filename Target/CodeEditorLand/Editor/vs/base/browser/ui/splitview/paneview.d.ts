import { IBoundarySashes, Orientation } from '../sash/sash.js';
import { Event } from '../../../common/event.js';
import { Disposable } from '../../../common/lifecycle.js';
import { ScrollEvent } from '../../../common/scrollable.js';
import './paneview.css';
import { IView } from './splitview.js';
export interface IPaneOptions {
    minimumBodySize?: number;
    maximumBodySize?: number;
    expanded?: boolean;
    orientation?: Orientation;
    title: string;
    titleDescription?: string;
}
export interface IPaneStyles {
    readonly dropBackground: string | undefined;
    readonly headerForeground: string | undefined;
    readonly headerBackground: string | undefined;
    readonly headerBorder: string | undefined;
    readonly leftBorder: string | undefined;
}
export declare abstract class Pane extends Disposable implements IView {
    private static readonly HEADER_SIZE;
    readonly element: HTMLElement;
    private header;
    private body;
    protected _expanded: boolean;
    protected _orientation: Orientation;
    private expandedSize;
    private _headerVisible;
    private _collapsible;
    private _bodyRendered;
    private _minimumBodySize;
    private _maximumBodySize;
    private _ariaHeaderLabel;
    private styles;
    private animationTimer;
    private readonly _onDidChange;
    readonly onDidChange: Event<number | undefined>;
    private readonly _onDidChangeExpansionState;
    readonly onDidChangeExpansionState: Event<boolean>;
    get ariaHeaderLabel(): string;
    set ariaHeaderLabel(newLabel: string);
    get draggableElement(): HTMLElement;
    get dropTargetElement(): HTMLElement;
    get dropBackground(): string | undefined;
    get minimumBodySize(): number;
    set minimumBodySize(size: number);
    get maximumBodySize(): number;
    set maximumBodySize(size: number);
    private get headerSize();
    get minimumSize(): number;
    get maximumSize(): number;
    orthogonalSize: number;
    constructor(options: IPaneOptions);
    isExpanded(): boolean;
    setExpanded(expanded: boolean): boolean;
    get headerVisible(): boolean;
    set headerVisible(visible: boolean);
    get collapsible(): boolean;
    set collapsible(collapsible: boolean);
    get orientation(): Orientation;
    set orientation(orientation: Orientation);
    render(): void;
    layout(size: number): void;
    style(styles: IPaneStyles): void;
    protected updateHeader(): void;
    protected abstract renderHeader(container: HTMLElement): void;
    protected abstract renderBody(container: HTMLElement): void;
    protected abstract layoutBody(height: number, width: number): void;
}
export interface IPaneDndController {
    canDrag(pane: Pane): boolean;
    canDrop(pane: Pane, overPane: Pane): boolean;
}
export declare class DefaultPaneDndController implements IPaneDndController {
    canDrag(pane: Pane): boolean;
    canDrop(pane: Pane, overPane: Pane): boolean;
}
export interface IPaneViewOptions {
    dnd?: IPaneDndController;
    orientation?: Orientation;
}
export declare class PaneView extends Disposable {
    private dnd;
    private dndContext;
    readonly element: HTMLElement;
    private paneItems;
    private orthogonalSize;
    private size;
    private splitview;
    private animationTimer;
    private _onDidDrop;
    readonly onDidDrop: Event<{
        from: Pane;
        to: Pane;
    }>;
    orientation: Orientation;
    private boundarySashes;
    readonly onDidSashChange: Event<number>;
    readonly onDidSashReset: Event<number>;
    readonly onDidScroll: Event<ScrollEvent>;
    constructor(container: HTMLElement, options?: IPaneViewOptions);
    addPane(pane: Pane, size: number, index?: number): void;
    removePane(pane: Pane): void;
    movePane(from: Pane, to: Pane): void;
    resizePane(pane: Pane, size: number): void;
    getPaneSize(pane: Pane): number;
    layout(height: number, width: number): void;
    setBoundarySashes(sashes: IBoundarySashes): void;
    private updateSplitviewOrthogonalSashes;
    flipOrientation(height: number, width: number): void;
    private setupAnimation;
    private getPaneHeaderElements;
    private focusPrevious;
    private focusNext;
    dispose(): void;
}
