import { ISettingsEditorModel, ISetting, ISearchResult, SettingMatchType } from '../../../services/preferences/common/preferences.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IPreferencesSearchService, IRemoteSearchProvider, ISearchProvider } from '../common/preferences.js';
import { IExtensionManagementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export interface IEndpointDetails {
    urlBase?: string;
    key?: string;
}
export declare class PreferencesSearchService extends Disposable implements IPreferencesSearchService {
    private readonly instantiationService;
    private readonly configurationService;
    private readonly extensionManagementService;
    private readonly extensionEnablementService;
    readonly _serviceBrand: undefined;
    private _installedExtensions;
    private _remoteSearchProvider;
    constructor(instantiationService: IInstantiationService, configurationService: IConfigurationService, extensionManagementService: IExtensionManagementService, extensionEnablementService: IWorkbenchExtensionEnablementService);
    private get remoteSearchAllowed();
    getRemoteSearchProvider(filter: string): IRemoteSearchProvider | undefined;
    getLocalSearchProvider(filter: string): LocalSearchProvider;
}
export declare class LocalSearchProvider implements ISearchProvider {
    private _filter;
    private readonly configurationService;
    static readonly EXACT_MATCH_SCORE = 10000;
    static readonly START_SCORE = 1000;
    constructor(_filter: string, configurationService: IConfigurationService);
    searchModel(preferencesModel: ISettingsEditorModel, token?: CancellationToken): Promise<ISearchResult | null>;
    private getGroupFilter;
}
export declare class SettingMatches {
    private searchDescription;
    private readonly configurationService;
    readonly matches: IRange[];
    matchType: SettingMatchType;
    constructor(searchString: string, setting: ISetting, requireFullQueryMatch: boolean, searchDescription: boolean, valuesMatcher: (filter: string, setting: ISetting) => IRange[], configurationService: IConfigurationService);
    private _findMatchesInSetting;
    private _keyToLabel;
    private _doFindMatchesInSetting;
    private toKeyRange;
    private toDescriptionRange;
    private toValueRange;
}
