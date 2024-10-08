import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
export declare class SnippetCodeActions implements IWorkbenchContribution {
    private readonly _store;
    constructor(instantiationService: IInstantiationService, languageFeaturesService: ILanguageFeaturesService, configService: IConfigurationService);
    dispose(): void;
}
