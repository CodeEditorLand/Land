import { IModelService } from '../../../../editor/common/services/model.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
export declare class OutputLinkProvider extends Disposable {
    private readonly contextService;
    private readonly modelService;
    private readonly languageFeaturesService;
    private static readonly DISPOSE_WORKER_TIME;
    private worker?;
    private disposeWorkerScheduler;
    private linkProviderRegistration;
    constructor(contextService: IWorkspaceContextService, modelService: IModelService, languageFeaturesService: ILanguageFeaturesService);
    private registerListeners;
    private updateLinkProviderWorker;
    private getOrCreateWorker;
    private provideLinks;
    private disposeWorker;
}
