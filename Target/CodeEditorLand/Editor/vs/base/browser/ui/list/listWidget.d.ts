import { Dimension } from '../../dom.js';
import { IKeyboardEvent, StandardKeyboardEvent } from '../../keyboardEvent.js';
import { AriaRole } from '../aria/aria.js';
import { ScrollableElementChangeOptions } from '../scrollbar/scrollableElementOptions.js';
import { Event } from '../../../common/event.js';
import { DisposableStore, IDisposable } from '../../../common/lifecycle.js';
import { ScrollbarVisibility, ScrollEvent } from '../../../common/scrollable.js';
import { ISpliceable } from '../../../common/sequence.js';
import './list.css';
import { IIdentityProvider, IKeyboardNavigationDelegate, IKeyboardNavigationLabelProvider, IListContextMenuEvent, IListDragAndDrop, IListEvent, IListGestureEvent, IListMouseEvent, IListRenderer, IListTouchEvent, IListVirtualDelegate } from './list.js';
import { IListView, IListViewAccessibilityProvider, IListViewOptions, IListViewOptionsUpdate } from './listView.js';
import { IObservable } from '../../../common/observable.js';
export declare function isMonacoEditor(e: HTMLElement): boolean;
export declare function isMonacoCustomToggle(e: HTMLElement): boolean;
export declare function isActionItem(e: HTMLElement): boolean;
export declare function isMonacoTwistie(e: HTMLElement): boolean;
export declare function isStickyScrollElement(e: HTMLElement): boolean;
export declare function isStickyScrollContainer(e: HTMLElement): boolean;
export declare function isButton(e: HTMLElement): boolean;
export declare enum TypeNavigationMode {
    Automatic = 0,
    Trigger = 1
}
export declare const DefaultKeyboardNavigationDelegate: {
    mightProducePrintableCharacter(event: IKeyboardEvent): boolean;
};
export declare function isSelectionSingleChangeEvent(event: IListMouseEvent<any> | IListTouchEvent<any>): boolean;
export declare function isSelectionRangeChangeEvent(event: IListMouseEvent<any> | IListTouchEvent<any>): boolean;
export declare class MouseController<T> implements IDisposable {
    protected list: List<T>;
    private multipleSelectionController;
    private mouseSupport;
    private readonly disposables;
    private _onPointer;
    readonly onPointer: Event<IListMouseEvent<T>>;
    constructor(list: List<T>);
    updateOptions(optionsUpdate: IListOptionsUpdate): void;
    protected isSelectionSingleChangeEvent(event: IListMouseEvent<any> | IListTouchEvent<any>): boolean;
    protected isSelectionRangeChangeEvent(event: IListMouseEvent<any> | IListTouchEvent<any>): boolean;
    private isSelectionChangeEvent;
    protected onMouseDown(e: IListMouseEvent<T> | IListTouchEvent<T>): void;
    protected onContextMenu(e: IListContextMenuEvent<T>): void;
    protected onViewPointer(e: IListMouseEvent<T>): void;
    protected onDoubleClick(e: IListMouseEvent<T>): void;
    private changeSelection;
    dispose(): void;
}
export interface IMultipleSelectionController<T> {
    isSelectionSingleChangeEvent(event: IListMouseEvent<T> | IListTouchEvent<T>): boolean;
    isSelectionRangeChangeEvent(event: IListMouseEvent<T> | IListTouchEvent<T>): boolean;
}
export interface IStyleController {
    style(styles: IListStyles): void;
}
export interface IListAccessibilityProvider<T> extends IListViewAccessibilityProvider<T> {
    getAriaLabel(element: T): string | IObservable<string> | null;
    getWidgetAriaLabel(): string;
    getWidgetRole?(): AriaRole;
    getAriaLevel?(element: T): number | undefined;
    onDidChangeActiveDescendant?: Event<void>;
    getActiveDescendantId?(element: T): string | undefined;
}
export declare class DefaultStyleController implements IStyleController {
    private styleElement;
    private selectorSuffix;
    constructor(styleElement: HTMLStyleElement, selectorSuffix: string);
    style(styles: IListStyles): void;
}
export interface IKeyboardNavigationEventFilter {
    (e: StandardKeyboardEvent): boolean;
}
export interface IListOptionsUpdate extends IListViewOptionsUpdate {
    readonly typeNavigationEnabled?: boolean;
    readonly typeNavigationMode?: TypeNavigationMode;
    readonly multipleSelectionSupport?: boolean;
}
export interface IListOptions<T> extends IListOptionsUpdate {
    readonly identityProvider?: IIdentityProvider<T>;
    readonly dnd?: IListDragAndDrop<T>;
    readonly keyboardNavigationLabelProvider?: IKeyboardNavigationLabelProvider<T>;
    readonly keyboardNavigationDelegate?: IKeyboardNavigationDelegate;
    readonly keyboardSupport?: boolean;
    readonly multipleSelectionController?: IMultipleSelectionController<T>;
    readonly styleController?: (suffix: string) => IStyleController;
    readonly accessibilityProvider?: IListAccessibilityProvider<T>;
    readonly keyboardNavigationEventFilter?: IKeyboardNavigationEventFilter;
    readonly useShadows?: boolean;
    readonly verticalScrollMode?: ScrollbarVisibility;
    readonly setRowLineHeight?: boolean;
    readonly setRowHeight?: boolean;
    readonly supportDynamicHeights?: boolean;
    readonly mouseSupport?: boolean;
    readonly horizontalScrolling?: boolean;
    readonly scrollByPage?: boolean;
    readonly transformOptimization?: boolean;
    readonly smoothScrolling?: boolean;
    readonly scrollableElementChangeOptions?: ScrollableElementChangeOptions;
    readonly alwaysConsumeMouseWheel?: boolean;
    readonly initialSize?: Dimension;
    readonly paddingTop?: number;
    readonly paddingBottom?: number;
}
export interface IListStyles {
    listBackground: string | undefined;
    listFocusBackground: string | undefined;
    listFocusForeground: string | undefined;
    listActiveSelectionBackground: string | undefined;
    listActiveSelectionForeground: string | undefined;
    listActiveSelectionIconForeground: string | undefined;
    listFocusAndSelectionOutline: string | undefined;
    listFocusAndSelectionBackground: string | undefined;
    listFocusAndSelectionForeground: string | undefined;
    listInactiveSelectionBackground: string | undefined;
    listInactiveSelectionIconForeground: string | undefined;
    listInactiveSelectionForeground: string | undefined;
    listInactiveFocusForeground: string | undefined;
    listInactiveFocusBackground: string | undefined;
    listHoverBackground: string | undefined;
    listHoverForeground: string | undefined;
    listDropOverBackground: string | undefined;
    listDropBetweenBackground: string | undefined;
    listFocusOutline: string | undefined;
    listInactiveFocusOutline: string | undefined;
    listSelectionOutline: string | undefined;
    listHoverOutline: string | undefined;
    treeIndentGuidesStroke: string | undefined;
    treeInactiveIndentGuidesStroke: string | undefined;
    treeStickyScrollBackground: string | undefined;
    treeStickyScrollBorder: string | undefined;
    treeStickyScrollShadow: string | undefined;
    tableColumnsBorder: string | undefined;
    tableOddRowsBackgroundColor: string | undefined;
}
export declare const unthemedListStyles: IListStyles;
/**
 * The {@link List} is a virtual scrolling widget, built on top of the {@link ListView}
 * widget.
 *
 * Features:
 * - Customizable keyboard and mouse support
 * - Element traits: focus, selection, achor
 * - Accessibility support
 * - Touch support
 * - Performant template-based rendering
 * - Horizontal scrolling
 * - Variable element height support
 * - Dynamic element height support
 * - Drag-and-drop support
 */
export declare class List<T> implements ISpliceable<T>, IDisposable {
    private user;
    private _options;
    private focus;
    private selection;
    private anchor;
    private eventBufferer;
    protected view: IListView<T>;
    private spliceable;
    private styleController;
    private typeNavigationController?;
    private accessibilityProvider?;
    private keyboardController;
    private mouseController;
    private _ariaLabel;
    protected readonly disposables: DisposableStore;
    get onDidChangeFocus(): Event<IListEvent<T>>;
    get onDidChangeSelection(): Event<IListEvent<T>>;
    get domId(): string;
    get onDidScroll(): Event<ScrollEvent>;
    get onMouseClick(): Event<IListMouseEvent<T>>;
    get onMouseDblClick(): Event<IListMouseEvent<T>>;
    get onMouseMiddleClick(): Event<IListMouseEvent<T>>;
    get onPointer(): Event<IListMouseEvent<T>>;
    get onMouseUp(): Event<IListMouseEvent<T>>;
    get onMouseDown(): Event<IListMouseEvent<T>>;
    get onMouseOver(): Event<IListMouseEvent<T>>;
    get onMouseMove(): Event<IListMouseEvent<T>>;
    get onMouseOut(): Event<IListMouseEvent<T>>;
    get onTouchStart(): Event<IListTouchEvent<T>>;
    get onTap(): Event<IListGestureEvent<T>>;
    /**
     * Possible context menu trigger events:
     * - ContextMenu key
     * - Shift F10
     * - Ctrl Option Shift M (macOS with VoiceOver)
     * - Mouse right click
     */
    get onContextMenu(): Event<IListContextMenuEvent<T>>;
    get onKeyDown(): Event<KeyboardEvent>;
    get onKeyUp(): Event<KeyboardEvent>;
    get onKeyPress(): Event<KeyboardEvent>;
    get onDidFocus(): Event<void>;
    get onDidBlur(): Event<void>;
    private readonly _onDidDispose;
    readonly onDidDispose: Event<void>;
    constructor(user: string, container: HTMLElement, virtualDelegate: IListVirtualDelegate<T>, renderers: IListRenderer<any, any>[], _options?: IListOptions<T>);
    protected createListView(container: HTMLElement, virtualDelegate: IListVirtualDelegate<T>, renderers: IListRenderer<any, any>[], viewOptions: IListViewOptions<T>): IListView<T>;
    protected createMouseController(options: IListOptions<T>): MouseController<T>;
    updateOptions(optionsUpdate?: IListOptionsUpdate): void;
    get options(): IListOptions<T>;
    splice(start: number, deleteCount: number, elements?: readonly T[]): void;
    updateWidth(index: number): void;
    updateElementHeight(index: number, size: number | undefined): void;
    rerender(): void;
    element(index: number): T;
    indexOf(element: T): number;
    indexAt(position: number): number;
    get length(): number;
    get contentHeight(): number;
    get contentWidth(): number;
    get onDidChangeContentHeight(): Event<number>;
    get onDidChangeContentWidth(): Event<number>;
    get scrollTop(): number;
    set scrollTop(scrollTop: number);
    get scrollLeft(): number;
    set scrollLeft(scrollLeft: number);
    get scrollHeight(): number;
    get renderHeight(): number;
    get firstVisibleIndex(): number;
    get firstMostlyVisibleIndex(): number;
    get lastVisibleIndex(): number;
    get ariaLabel(): string;
    set ariaLabel(value: string);
    domFocus(): void;
    layout(height?: number, width?: number): void;
    triggerTypeNavigation(): void;
    setSelection(indexes: number[], browserEvent?: UIEvent): void;
    getSelection(): number[];
    getSelectedElements(): T[];
    setAnchor(index: number | undefined): void;
    getAnchor(): number | undefined;
    getAnchorElement(): T | undefined;
    setFocus(indexes: number[], browserEvent?: UIEvent): void;
    focusNext(n?: number, loop?: boolean, browserEvent?: UIEvent, filter?: (element: T) => boolean): void;
    focusPrevious(n?: number, loop?: boolean, browserEvent?: UIEvent, filter?: (element: T) => boolean): void;
    focusNextPage(browserEvent?: UIEvent, filter?: (element: T) => boolean): Promise<void>;
    focusPreviousPage(browserEvent?: UIEvent, filter?: (element: T) => boolean, getPaddingTop?: () => number): Promise<void>;
    focusLast(browserEvent?: UIEvent, filter?: (element: T) => boolean): void;
    focusFirst(browserEvent?: UIEvent, filter?: (element: T) => boolean): void;
    focusNth(n: number, browserEvent?: UIEvent, filter?: (element: T) => boolean): void;
    private findNextIndex;
    private findPreviousIndex;
    getFocus(): number[];
    getFocusedElements(): T[];
    reveal(index: number, relativeTop?: number, paddingTop?: number): void;
    /**
     * Returns the relative position of an element rendered in the list.
     * Returns `null` if the element isn't *entirely* in the visible viewport.
     */
    getRelativeTop(index: number, paddingTop?: number): number | null;
    isDOMFocused(): boolean;
    getHTMLElement(): HTMLElement;
    getScrollableElement(): HTMLElement;
    getElementID(index: number): string;
    getElementTop(index: number): number;
    style(styles: IListStyles): void;
    private toListEvent;
    private _onFocusChange;
    private onDidChangeActiveDescendant;
    private _onSelectionChange;
    dispose(): void;
}
