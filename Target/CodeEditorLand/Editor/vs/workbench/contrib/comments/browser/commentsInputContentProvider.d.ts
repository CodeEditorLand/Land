import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelContentProvider, ITextModelService } from '../../../../editor/common/services/resolverService.js';
export declare class CommentsInputContentProvider extends Disposable implements ITextModelContentProvider, IEditorContribution {
    private readonly _modelService;
    private readonly _languageService;
    static readonly ID = "comments.input.contentProvider";
    constructor(textModelService: ITextModelService, codeEditorService: ICodeEditorService, _modelService: IModelService, _languageService: ILanguageService);
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
