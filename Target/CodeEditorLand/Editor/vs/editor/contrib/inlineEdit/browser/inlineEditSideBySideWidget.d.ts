import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IDiffProviderFactoryService } from '../../../browser/widget/diffEditor/diffProviderFactoryService.js';
import { IInlineEdit } from '../../../common/languages.js';
import { IModelService } from '../../../common/services/model.js';
import './inlineEditSideBySideWidget.css';
export declare class InlineEditSideBySideWidget extends Disposable {
    private readonly _editor;
    private readonly _model;
    private readonly _instantiationService;
    private readonly _diffProviderFactoryService;
    private readonly _modelService;
    private static _modelId;
    private static _createUniqueUri;
    private readonly _position;
    private readonly _text;
    private readonly _originalModel;
    private readonly _modifiedModel;
    private readonly _diff;
    private readonly _diffPromise;
    constructor(_editor: ICodeEditor, _model: IObservable<IInlineEdit | undefined>, _instantiationService: IInstantiationService, _diffProviderFactoryService: IDiffProviderFactoryService, _modelService: IModelService);
}
