import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { IExtensionFeaturesManagementService } from '../../../services/extensionManagement/common/extensionFeatures.js';
export declare const ILanguageModelStatsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageModelStatsService>;
export interface ILanguageModelStatsService {
    readonly _serviceBrand: undefined;
    update(model: string, extensionId: ExtensionIdentifier, agent: string | undefined, tokenCount: number | undefined): Promise<void>;
}
export declare class LanguageModelStatsService extends Disposable implements ILanguageModelStatsService {
    private readonly extensionFeaturesManagementService;
    private readonly _storageService;
    private static readonly MODEL_STATS_STORAGE_KEY_PREFIX;
    private static readonly MODEL_ACCESS_STORAGE_KEY_PREFIX;
    _serviceBrand: undefined;
    private readonly _onDidChangeStats;
    readonly onDidChangeLanguageMoelStats: import("../../../workbench.web.main.internal.js").Event<string>;
    private readonly sessionStats;
    constructor(extensionFeaturesManagementService: IExtensionFeaturesManagementService, _storageService: IStorageService);
    hasAccessedModel(extensionId: string, model: string): boolean;
    update(model: string, extensionId: ExtensionIdentifier, agent: string | undefined, tokenCount: number | undefined): Promise<void>;
    private addAccess;
    private getAccessExtensions;
    private write;
    private add;
    private read;
    private getModel;
    private getKey;
    private getAccessKey;
}
