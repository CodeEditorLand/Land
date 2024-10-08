import { URI } from '../../../../base/common/uri.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelContentProvider, ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ITestResultService } from './testResultService.js';
/**
 * A content provider that returns various outputs for tests. This is used
 * in the inline peek view.
 */
export declare class TestingContentProvider implements IWorkbenchContribution, ITextModelContentProvider {
    private readonly languageService;
    private readonly modelService;
    private readonly resultService;
    constructor(textModelResolverService: ITextModelService, languageService: ILanguageService, modelService: IModelService, resultService: ITestResultService);
    /**
     * @inheritdoc
     */
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
