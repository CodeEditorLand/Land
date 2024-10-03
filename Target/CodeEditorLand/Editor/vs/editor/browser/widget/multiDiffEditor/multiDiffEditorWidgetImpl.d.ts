import { Dimension } from '../../../../base/browser/dom.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ITextEditorOptions } from '../../../../platform/editor/common/editor.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IRange } from '../../../common/core/range.js';
import { ISelection } from '../../../common/core/selection.js';
import { IDiffEditor } from '../../../common/editorCommon.js';
import { ICodeEditor } from '../../editorBrowser.js';
import { IDocumentDiffItem } from './model.js';
import { MultiDiffEditorViewModel } from './multiDiffEditorViewModel.js';
import { RevealOptions } from './multiDiffEditorWidget.js';
import './style.css';
import { IWorkbenchUIElementFactory } from './workbenchUIElementFactory.js';
export declare class MultiDiffEditorWidgetImpl extends Disposable {
    private readonly _element;
    private readonly _dimension;
    private readonly _viewModel;
    private readonly _workbenchUIElementFactory;
    private readonly _parentContextKeyService;
    private readonly _parentInstantiationService;
    private readonly _scrollableElements;
    private readonly _scrollable;
    private readonly _scrollableElement;
    private readonly _elements;
    private readonly _sizeObserver;
    private readonly _objectPool;
    readonly scrollTop: IObservable<number, unknown>;
    readonly scrollLeft: IObservable<number, unknown>;
    private readonly _viewItemsInfo;
    private readonly _viewItems;
    private readonly _spaceBetweenPx;
    private readonly _totalHeight;
    readonly activeControl: IObservable<import("../diffEditor/diffEditorWidget.js").DiffEditorWidget | undefined, unknown>;
    private readonly _contextKeyService;
    private readonly _instantiationService;
    constructor(_element: HTMLElement, _dimension: IObservable<Dimension | undefined>, _viewModel: IObservable<MultiDiffEditorViewModel | undefined>, _workbenchUIElementFactory: IWorkbenchUIElementFactory, _parentContextKeyService: IContextKeyService, _parentInstantiationService: IInstantiationService);
    setScrollState(scrollState: {
        top?: number;
        left?: number;
    }): void;
    reveal(resource: IMultiDiffResourceId, options?: RevealOptions): void;
    getViewState(): IMultiDiffEditorViewState;
    private _lastDocStates;
    setViewState(viewState: IMultiDiffEditorViewState): void;
    findDocumentDiffItem(resource: URI): IDocumentDiffItem | undefined;
    tryGetCodeEditor(resource: URI): {
        diffEditor: IDiffEditor;
        editor: ICodeEditor;
    } | undefined;
    private render;
}
export interface IMultiDiffEditorViewState {
    scrollState: {
        top: number;
        left: number;
    };
    docStates?: Record<string, IMultiDiffDocState>;
}
interface IMultiDiffDocState {
    collapsed: boolean;
    selections?: ISelection[];
}
export interface IMultiDiffEditorOptions extends ITextEditorOptions {
    viewState?: IMultiDiffEditorOptionsViewState;
}
export interface IMultiDiffEditorOptionsViewState {
    revealData?: {
        resource: IMultiDiffResourceId;
        range?: IRange;
    };
}
export type IMultiDiffResourceId = {
    original: URI | undefined;
    modified: URI | undefined;
};
export {};
