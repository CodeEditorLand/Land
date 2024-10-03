import { URI } from '../../../../base/common/uri.js';
import { IReplaceService } from './replace.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Match, FileMatch, FileMatchOrMatch } from './searchModel.js';
import { IProgress, IProgressStep } from '../../../../platform/progress/common/progress.js';
import { ITextModelService, ITextModelContentProvider } from '../../../../editor/common/services/resolverService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { IBulkEditService } from '../../../../editor/browser/services/bulkEditService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { INotebookEditorModelResolverService } from '../../notebook/common/notebookEditorModelResolverService.js';
export declare class ReplacePreviewContentProvider implements ITextModelContentProvider, IWorkbenchContribution {
    private readonly instantiationService;
    private readonly textModelResolverService;
    static readonly ID = "workbench.contrib.replacePreviewContentProvider";
    constructor(instantiationService: IInstantiationService, textModelResolverService: ITextModelService);
    provideTextContent(uri: URI): Promise<ITextModel> | null;
}
export declare class ReplaceService implements IReplaceService {
    private readonly textFileService;
    private readonly editorService;
    private readonly textModelResolverService;
    private readonly bulkEditorService;
    private readonly labelService;
    private readonly notebookEditorModelResolverService;
    readonly _serviceBrand: undefined;
    private static readonly REPLACE_SAVE_SOURCE;
    constructor(textFileService: ITextFileService, editorService: IEditorService, textModelResolverService: ITextModelService, bulkEditorService: IBulkEditService, labelService: ILabelService, notebookEditorModelResolverService: INotebookEditorModelResolverService);
    replace(match: Match): Promise<any>;
    replace(files: FileMatch[], progress?: IProgress<IProgressStep>): Promise<any>;
    replace(match: FileMatchOrMatch, progress?: IProgress<IProgressStep>, resource?: URI): Promise<any>;
    openReplacePreview(element: FileMatchOrMatch, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<any>;
    updateReplacePreview(fileMatch: FileMatch, override?: boolean): Promise<void>;
    private applyEditsToPreview;
    private createEdits;
    private createEdit;
}
