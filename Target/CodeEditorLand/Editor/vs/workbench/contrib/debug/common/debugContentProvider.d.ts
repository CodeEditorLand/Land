import { URI as uri } from '../../../../base/common/uri.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ITextModelService, ITextModelContentProvider } from '../../../../editor/common/services/resolverService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IDebugService } from './debug.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
export declare class DebugContentProvider implements IWorkbenchContribution, ITextModelContentProvider {
    private readonly debugService;
    private readonly modelService;
    private readonly languageService;
    private readonly editorWorkerService;
    private static INSTANCE;
    private readonly pendingUpdates;
    constructor(textModelResolverService: ITextModelService, debugService: IDebugService, modelService: IModelService, languageService: ILanguageService, editorWorkerService: IEditorWorkerService);
    dispose(): void;
    provideTextContent(resource: uri): Promise<ITextModel> | null;
    static refreshDebugContent(resource: uri): void;
    private createOrUpdateContentModel;
}
