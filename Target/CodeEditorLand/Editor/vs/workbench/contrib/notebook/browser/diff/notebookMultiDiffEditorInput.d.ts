import { URI } from '../../../../../base/common/uri.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { ITextResourceConfigurationService } from '../../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { MultiDiffEditorInput } from '../../../multiDiffEditor/browser/multiDiffEditorInput.js';
import { IMultiDiffSourceResolverService, IResolvedMultiDiffSource, type IMultiDiffSourceResolver } from '../../../multiDiffEditor/browser/multiDiffSourceResolverService.js';
import { NotebookDiffViewModel } from './notebookDiffViewModel.js';
import { NotebookDiffEditorInput } from '../../common/notebookDiffEditorInput.js';
import { ITextFileService } from '../../../../services/textfile/common/textfiles.js';
export declare const NotebookMultiDiffEditorScheme = "multi-cell-notebook-diff-editor";
export declare class NotebookMultiDiffEditorInput extends NotebookDiffEditorInput {
    static readonly ID: string;
    static create(instantiationService: IInstantiationService, resource: URI, name: string | undefined, description: string | undefined, originalResource: URI, viewType: string): NotebookMultiDiffEditorInput;
}
export declare class NotebookMultiDiffEditorWidgetInput extends MultiDiffEditorInput implements IMultiDiffSourceResolver {
    private readonly notebookDiffViewModel;
    static createInput(notebookDiffViewModel: NotebookDiffViewModel, instantiationService: IInstantiationService): NotebookMultiDiffEditorWidgetInput;
    constructor(multiDiffSource: URI, notebookDiffViewModel: NotebookDiffViewModel, _textModelService: ITextModelService, _textResourceConfigurationService: ITextResourceConfigurationService, _instantiationService: IInstantiationService, _multiDiffSourceResolverService: IMultiDiffSourceResolverService, _textFileService: ITextFileService);
    canHandleUri(uri: URI): boolean;
    resolveDiffSource(_: URI): Promise<IResolvedMultiDiffSource>;
}
