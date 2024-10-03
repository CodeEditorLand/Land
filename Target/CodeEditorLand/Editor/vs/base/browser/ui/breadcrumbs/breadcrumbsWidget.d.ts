import * as dom from '../../dom.js';
import { ThemeIcon } from '../../../common/themables.js';
import { Event } from '../../../common/event.js';
import './breadcrumbsWidget.css';
export declare abstract class BreadcrumbsItem {
    abstract dispose(): void;
    abstract equals(other: BreadcrumbsItem): boolean;
    abstract render(container: HTMLElement): void;
}
export interface IBreadcrumbsWidgetStyles {
    readonly breadcrumbsBackground: string | undefined;
    readonly breadcrumbsForeground: string | undefined;
    readonly breadcrumbsHoverForeground: string | undefined;
    readonly breadcrumbsFocusForeground: string | undefined;
    readonly breadcrumbsFocusAndSelectionForeground: string | undefined;
}
export interface IBreadcrumbsItemEvent {
    type: 'select' | 'focus';
    item: BreadcrumbsItem;
    node: HTMLElement;
    payload: any;
}
export declare class BreadcrumbsWidget {
    private readonly _disposables;
    private readonly _domNode;
    private readonly _scrollable;
    private readonly _onDidSelectItem;
    private readonly _onDidFocusItem;
    private readonly _onDidChangeFocus;
    readonly onDidSelectItem: Event<IBreadcrumbsItemEvent>;
    readonly onDidFocusItem: Event<IBreadcrumbsItemEvent>;
    readonly onDidChangeFocus: Event<boolean>;
    private readonly _items;
    private readonly _nodes;
    private readonly _freeNodes;
    private readonly _separatorIcon;
    private _enabled;
    private _focusedItemIdx;
    private _selectedItemIdx;
    private _pendingDimLayout;
    private _pendingLayout;
    private _dimension;
    constructor(container: HTMLElement, horizontalScrollbarSize: number, separatorIcon: ThemeIcon, styles: IBreadcrumbsWidgetStyles);
    setHorizontalScrollbarSize(size: number): void;
    dispose(): void;
    layout(dim: dom.Dimension | undefined): void;
    private _updateDimensions;
    private _updateScrollbar;
    private _style;
    setEnabled(value: boolean): void;
    domFocus(): void;
    isDOMFocused(): boolean;
    getFocused(): BreadcrumbsItem;
    setFocused(item: BreadcrumbsItem | undefined, payload?: any): void;
    focusPrev(payload?: any): void;
    focusNext(payload?: any): void;
    private _focus;
    reveal(item: BreadcrumbsItem): void;
    revealLast(): void;
    private _reveal;
    getSelection(): BreadcrumbsItem;
    setSelection(item: BreadcrumbsItem | undefined, payload?: any): void;
    private _select;
    getItems(): readonly BreadcrumbsItem[];
    setItems(items: BreadcrumbsItem[]): void;
    private _render;
    private _renderItem;
    private _onClick;
}
