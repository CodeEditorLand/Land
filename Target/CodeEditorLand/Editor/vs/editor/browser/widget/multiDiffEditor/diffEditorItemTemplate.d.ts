import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { OffsetRange } from '../../../common/core/offsetRange.js';
import { DiffEditorWidget } from '../diffEditor/diffEditorWidget.js';
import { DocumentDiffItemViewModel } from './multiDiffEditorViewModel.js';
import { IObjectData, IPooledObject } from './objectPool.js';
import { IWorkbenchUIElementFactory } from './workbenchUIElementFactory.js';
export declare class TemplateData implements IObjectData {
    readonly viewModel: DocumentDiffItemViewModel;
    readonly deltaScrollVertical: (delta: number) => void;
    constructor(viewModel: DocumentDiffItemViewModel, deltaScrollVertical: (delta: number) => void);
    getId(): unknown;
}
export declare class DiffEditorItemTemplate extends Disposable implements IPooledObject<TemplateData> {
    private readonly _container;
    private readonly _overflowWidgetsDomNode;
    private readonly _workbenchUIElementFactory;
    private readonly _instantiationService;
    private readonly _viewModel;
    private readonly _collapsed;
    private readonly _editorContentHeight;
    readonly contentHeight: import("../../../../base/common/observable.js").IObservable<number, unknown>;
    private readonly _modifiedContentWidth;
    private readonly _modifiedWidth;
    private readonly _originalContentWidth;
    private readonly _originalWidth;
    readonly maxScroll: import("../../../../base/common/observable.js").IObservable<{
        maxScroll: number;
        width: number;
    }, unknown>;
    private readonly _elements;
    readonly editor: DiffEditorWidget;
    private readonly isModifedFocused;
    private readonly isOriginalFocused;
    readonly isFocused: import("../../../../base/common/observable.js").IObservable<boolean, unknown>;
    private readonly _resourceLabel;
    private readonly _resourceLabel2;
    private readonly _outerEditorHeight;
    private readonly _contextKeyService;
    constructor(_container: HTMLElement, _overflowWidgetsDomNode: HTMLElement, _workbenchUIElementFactory: IWorkbenchUIElementFactory, _instantiationService: IInstantiationService, _parentContextKeyService: IContextKeyService);
    setScrollLeft(left: number): void;
    private readonly _dataStore;
    private _data;
    setData(data: TemplateData | undefined): void;
    private readonly _headerHeight;
    private _lastScrollTop;
    private _isSettingScrollTop;
    render(verticalRange: OffsetRange, width: number, editorScroll: number, viewPort: OffsetRange): void;
    hide(): void;
}
