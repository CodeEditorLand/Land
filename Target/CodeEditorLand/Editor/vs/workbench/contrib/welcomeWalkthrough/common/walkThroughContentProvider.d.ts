import { URI } from '../../../../base/common/uri.js';
import { ITextModelService, ITextModelContentProvider } from '../../../../editor/common/services/resolverService.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IInstantiationService, ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
interface IWalkThroughContentProvider {
    (accessor: ServicesAccessor): string;
}
declare class WalkThroughContentProviderRegistry {
    private readonly providers;
    registerProvider(moduleId: string, provider: IWalkThroughContentProvider): void;
    getProvider(moduleId: string): IWalkThroughContentProvider | undefined;
}
export declare const walkThroughContentRegistry: WalkThroughContentProviderRegistry;
export declare function moduleToContent(instantiationService: IInstantiationService, resource: URI): Promise<string>;
export declare class WalkThroughSnippetContentProvider implements ITextModelContentProvider, IWorkbenchContribution {
    private readonly textModelResolverService;
    private readonly languageService;
    private readonly modelService;
    private readonly instantiationService;
    static readonly ID = "workbench.contrib.walkThroughSnippetContentProvider";
    private loads;
    constructor(textModelResolverService: ITextModelService, languageService: ILanguageService, modelService: IModelService, instantiationService: IInstantiationService);
    private textBufferFactoryFromResource;
    provideTextContent(resource: URI): Promise<ITextModel>;
}
export {};
