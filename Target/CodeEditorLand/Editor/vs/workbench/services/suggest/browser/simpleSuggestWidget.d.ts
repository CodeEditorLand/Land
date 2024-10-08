import './media/suggest.css';
import * as dom from '../../../../base/browser/dom.js';
import { List } from '../../../../base/browser/ui/list/listWidget.js';
import { ResizableHTMLElement } from '../../../../base/browser/ui/resizable/resizable.js';
import { SimpleCompletionItem } from './simpleCompletionItem.js';
import { LineContext, SimpleCompletionModel } from './simpleCompletionModel.js';
import { type ISimpleSuggestWidgetFontInfo } from './simpleSuggestWidgetRenderer.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
export interface ISimpleSelectedSuggestion {
    item: SimpleCompletionItem;
    index: number;
    model: SimpleCompletionModel;
}
interface IPersistedWidgetSizeDelegate {
    restore(): dom.Dimension | undefined;
    store(size: dom.Dimension): void;
    reset(): void;
}
export interface IWorkbenchSuggestWidgetOptions {
    /**
     * The {@link MenuId} to use for the status bar. Items on the menu must use the groups `'left'`
     * and `'right'`.
     */
    statusBarMenuId?: MenuId;
}
export declare class SimpleSuggestWidget extends Disposable {
    private readonly _container;
    private readonly _persistedSize;
    private readonly _getFontInfo;
    private _state;
    private _completionModel?;
    private _cappedHeight?;
    private _forceRenderingAbove;
    private _preference?;
    private readonly _pendingLayout;
    readonly element: ResizableHTMLElement;
    private readonly _listElement;
    private readonly _list;
    private readonly _status?;
    private readonly _showTimeout;
    private readonly _onDidSelect;
    readonly onDidSelect: Event<ISimpleSelectedSuggestion>;
    private readonly _onDidHide;
    readonly onDidHide: Event<this>;
    private readonly _onDidShow;
    readonly onDidShow: Event<this>;
    get list(): List<SimpleCompletionItem>;
    constructor(_container: HTMLElement, _persistedSize: IPersistedWidgetSizeDelegate, _getFontInfo: () => ISimpleSuggestWidgetFontInfo, options: IWorkbenchSuggestWidgetOptions, instantiationService: IInstantiationService);
    private _cursorPosition?;
    setCompletionModel(completionModel: SimpleCompletionModel): void;
    hasCompletions(): boolean;
    showSuggestions(selectionIndex: number, isFrozen: boolean, isAuto: boolean, cursorPosition: {
        top: number;
        left: number;
        height: number;
    }): void;
    setLineContext(lineContext: LineContext): void;
    private _setState;
    private _show;
    hide(): void;
    private _layout;
    private _resize;
    private _getLayoutInfo;
    private _onListMouseDownOrTap;
    private _onListSelection;
    private _select;
    selectNext(): boolean;
    selectNextPage(): boolean;
    selectPrevious(): boolean;
    selectPreviousPage(): boolean;
    getFocusedItem(): ISimpleSelectedSuggestion | undefined;
    forceRenderingAbove(): void;
    stopForceRenderingAbove(): void;
}
export {};
