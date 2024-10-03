import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IExtensionIgnoredRecommendationsService, IgnoredRecommendationChangeNotification } from './extensionRecommendations.js';
import { IWorkspaceExtensionsConfigService } from './workspaceExtensionsConfig.js';
export declare class ExtensionIgnoredRecommendationsService extends Disposable implements IExtensionIgnoredRecommendationsService {
    private readonly workspaceExtensionsConfigService;
    private readonly storageService;
    readonly _serviceBrand: undefined;
    private _onDidChangeIgnoredRecommendations;
    readonly onDidChangeIgnoredRecommendations: import("../../../workbench.web.main.internal.js").Event<void>;
    private _globalIgnoredRecommendations;
    get globalIgnoredRecommendations(): string[];
    private _onDidChangeGlobalIgnoredRecommendation;
    readonly onDidChangeGlobalIgnoredRecommendation: import("../../../workbench.web.main.internal.js").Event<IgnoredRecommendationChangeNotification>;
    private ignoredWorkspaceRecommendations;
    get ignoredRecommendations(): string[];
    constructor(workspaceExtensionsConfigService: IWorkspaceExtensionsConfigService, storageService: IStorageService);
    private initIgnoredWorkspaceRecommendations;
    toggleGlobalIgnoredRecommendation(extensionId: string, shouldIgnore: boolean): void;
    private getCachedIgnoredRecommendations;
    private onDidStorageChange;
    private storeCachedIgnoredRecommendations;
    private _ignoredRecommendationsValue;
    private get ignoredRecommendationsValue();
    private set ignoredRecommendationsValue(value);
    private getStoredIgnoredRecommendationsValue;
    private setStoredIgnoredRecommendationsValue;
}
