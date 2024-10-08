import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../../../base/common/observable.js';
import { MenuWorkbenchToolBar } from '../../../../../../platform/actions/browser/toolbar.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor } from '../../../../../browser/editorBrowser.js';
import { IDiffProviderFactoryService } from '../../../../../browser/widget/diffEditor/diffProviderFactoryService.js';
import { LineRange } from '../../../../../common/core/lineRange.js';
import { TextEdit } from '../../../../../common/core/textEdit.js';
import { IModelService } from '../../../../../common/services/model.js';
import { InlineEdit } from '../../model/inlineEdit.js';
import './inlineEditsView.css';
export declare class InlineEditsViewAndDiffProducer extends Disposable {
    private readonly _editor;
    private readonly _edit;
    private readonly _instantiationService;
    private readonly _diffProviderFactoryService;
    private readonly _modelService;
    static readonly hot: IObservable<typeof InlineEditsViewAndDiffProducer, unknown>;
    private readonly _modelUriGenerator;
    private readonly _originalModel;
    private readonly _modifiedModel;
    private readonly _inlineEditPromise;
    private readonly _inlineEdit;
    constructor(_editor: ICodeEditor, _edit: IObservable<InlineEdit | undefined>, _instantiationService: IInstantiationService, _diffProviderFactoryService: IDiffProviderFactoryService, _modelService: IModelService);
}
export declare class InlineEditWithChanges {
    readonly diffedTextEdit: TextEdit;
    readonly originalLineRange: LineRange;
    readonly modifiedLineRange: LineRange;
    constructor(diffedTextEdit: TextEdit);
}
export declare class InlineEditsView extends Disposable {
    private readonly _editor;
    private readonly _edit;
    private readonly _instantiationService;
    private readonly _editorObs;
    private readonly _elements;
    private readonly _indicator;
    private readonly _previewEditorWidth;
    constructor(_editor: ICodeEditor, _edit: IObservable<InlineEditWithChanges | undefined>, _instantiationService: IInstantiationService);
    private readonly _uiState;
    protected readonly _toolbar: MenuWorkbenchToolBar;
    private readonly _previewTextModel;
    private readonly _previewEditor;
    private readonly _previewEditorObs;
    private readonly _ensureModelTextIsSet;
    private readonly _decorations;
    private readonly _layout1;
    private readonly _layout;
}
