import { IConfigurationValue } from '../../../../platform/configuration/common/configuration.js';
import { SettingsTarget } from './preferencesWidgets.js';
import { ITOCEntry } from './settingsLayout.js';
import { ISearchResult, ISetting, SettingValueType } from '../../../services/preferences/common/preferences.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IWorkbenchConfigurationService } from '../../../services/configuration/common/configuration.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Emitter } from '../../../../base/common/event.js';
import { ConfigurationDefaultValueSource } from '../../../../platform/configuration/common/configurationRegistry.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare const ONLINE_SERVICES_SETTING_TAG = "usesOnlineServices";
export interface ISettingsEditorViewState {
    settingsTarget: SettingsTarget;
    query?: string;
    tagFilters?: Set<string>;
    extensionFilters?: Set<string>;
    featureFilters?: Set<string>;
    idFilters?: Set<string>;
    languageFilter?: string;
    filterToCategory?: SettingsTreeGroupElement;
}
export declare abstract class SettingsTreeElement extends Disposable {
    id: string;
    parent?: SettingsTreeGroupElement;
    private _tabbable;
    protected readonly _onDidChangeTabbable: Emitter<void>;
    readonly onDidChangeTabbable: import("../../../workbench.web.main.internal.js").Event<void>;
    constructor(_id: string);
    get tabbable(): boolean;
    set tabbable(value: boolean);
}
export type SettingsTreeGroupChild = (SettingsTreeGroupElement | SettingsTreeSettingElement | SettingsTreeNewExtensionsElement);
export declare class SettingsTreeGroupElement extends SettingsTreeElement {
    count?: number;
    label: string;
    level: number;
    isFirstGroup: boolean;
    private _childSettingKeys;
    private _children;
    get children(): SettingsTreeGroupChild[];
    set children(newChildren: SettingsTreeGroupChild[]);
    constructor(_id: string, count: number | undefined, label: string, level: number, isFirstGroup: boolean);
    containsSetting(key: string): boolean;
}
export declare class SettingsTreeNewExtensionsElement extends SettingsTreeElement {
    readonly extensionIds: string[];
    constructor(_id: string, extensionIds: string[]);
}
export declare class SettingsTreeSettingElement extends SettingsTreeElement {
    readonly settingsTarget: SettingsTarget;
    private readonly isWorkspaceTrusted;
    private readonly languageFilter;
    private readonly languageService;
    private readonly productService;
    private readonly userDataProfileService;
    private readonly configurationService;
    private static readonly MAX_DESC_LINES;
    setting: ISetting;
    private _displayCategory;
    private _displayLabel;
    value: any;
    scopeValue: any;
    defaultValue?: any;
    defaultValueSource: ConfigurationDefaultValueSource | undefined;
    isConfigured: boolean;
    isUntrusted: boolean;
    hasPolicyValue: boolean;
    tags?: Set<string>;
    overriddenScopeList: string[];
    overriddenDefaultsLanguageList: string[];
    languageOverrideValues: Map<string, IConfigurationValue<unknown>>;
    description: string;
    valueType: SettingValueType;
    constructor(setting: ISetting, parent: SettingsTreeGroupElement, settingsTarget: SettingsTarget, isWorkspaceTrusted: boolean, languageFilter: string | undefined, languageService: ILanguageService, productService: IProductService, userDataProfileService: IUserDataProfileService, configurationService: IWorkbenchConfigurationService);
    get displayCategory(): string;
    get displayLabel(): string;
    private initLabels;
    private initSettingDescription;
    private initSettingValueType;
    inspectSelf(): void;
    private getTargetToInspect;
    private update;
    matchesAllTags(tagFilters?: Set<string>): boolean;
    matchesScope(scope: SettingsTarget, isRemote: boolean): boolean;
    matchesAnyExtension(extensionFilters?: Set<string>): boolean;
    matchesAnyFeature(featureFilters?: Set<string>): boolean;
    matchesAnyId(idFilters?: Set<string>): boolean;
    matchesAllLanguages(languageFilter?: string): boolean;
}
export declare class SettingsTreeModel {
    protected readonly _viewState: ISettingsEditorViewState;
    private _isWorkspaceTrusted;
    private readonly _configurationService;
    private readonly _languageService;
    private readonly _userDataProfileService;
    private readonly _productService;
    protected _root: SettingsTreeGroupElement;
    private _tocRoot;
    private readonly _treeElementsBySettingName;
    constructor(_viewState: ISettingsEditorViewState, _isWorkspaceTrusted: boolean, _configurationService: IWorkbenchConfigurationService, _languageService: ILanguageService, _userDataProfileService: IUserDataProfileService, _productService: IProductService);
    get root(): SettingsTreeGroupElement;
    update(newTocRoot?: ITOCEntry<ISetting>): void;
    updateWorkspaceTrust(workspaceTrusted: boolean): void;
    private disposeChildren;
    private recursiveDispose;
    getElementsByName(name: string): SettingsTreeSettingElement[] | null;
    updateElementsByName(name: string): void;
    private updateRequireTrustedTargetElements;
    private reinspectSettings;
    private createSettingsTreeGroupElement;
    private getDepth;
    private createSettingsTreeSettingElement;
}
interface IInspectResult {
    isConfigured: boolean;
    inspected: IConfigurationValue<unknown>;
    targetSelector: 'applicationValue' | 'userLocalValue' | 'userRemoteValue' | 'workspaceValue' | 'workspaceFolderValue';
    inspectedLanguageOverrides: Map<string, IConfigurationValue<unknown>>;
    languageSelector: string | undefined;
}
export declare function inspectSetting(key: string, target: SettingsTarget, languageFilter: string | undefined, configurationService: IWorkbenchConfigurationService): IInspectResult;
export declare function settingKeyToDisplayFormat(key: string, groupId?: string, isLanguageTagSetting?: boolean): {
    category: string;
    label: string;
};
export declare function objectSettingSupportsRemoveDefaultValue(key: string): boolean;
export declare const enum SearchResultIdx {
    Local = 0,
    Remote = 1,
    NewExtensions = 2
}
export declare class SearchResultModel extends SettingsTreeModel {
    private readonly environmentService;
    private rawSearchResults;
    private cachedUniqueSearchResults;
    private newExtensionSearchResults;
    private searchResultCount;
    private settingsOrderByTocIndex;
    readonly id = "searchResultModel";
    constructor(viewState: ISettingsEditorViewState, settingsOrderByTocIndex: Map<string, number> | null, isWorkspaceTrusted: boolean, configurationService: IWorkbenchConfigurationService, environmentService: IWorkbenchEnvironmentService, languageService: ILanguageService, userDataProfileService: IUserDataProfileService, productService: IProductService);
    private sortResults;
    getUniqueResults(): ISearchResult | null;
    getRawResults(): ISearchResult[];
    setResult(order: SearchResultIdx, result: ISearchResult | null): void;
    updateChildren(): void;
    getUniqueResultsCount(): number;
    private getFlatSettings;
}
export interface IParsedQuery {
    tags: string[];
    query: string;
    extensionFilters: string[];
    idFilters: string[];
    featureFilters: string[];
    languageFilter: string | undefined;
}
export declare function parseQuery(query: string): IParsedQuery;
export {};
