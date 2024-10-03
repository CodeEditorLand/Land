import { IStringDictionary } from '../../../base/common/collections.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../base/common/map.js';
import { IExtUri } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { ConfigurationTarget, IConfigurationChange, IConfigurationChangeEvent, IConfigurationData, IConfigurationModel, IConfigurationOverrides, IConfigurationUpdateOverrides, IConfigurationValue, IInspectValue, IOverrides } from './configuration.js';
import { ConfigurationScope } from './configurationRegistry.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { Workspace } from '../../workspace/common/workspace.js';
type InspectValue<V> = IInspectValue<V> & {
    merged?: V;
};
export declare class ConfigurationModel implements IConfigurationModel {
    private readonly _contents;
    private readonly _keys;
    private readonly _overrides;
    readonly raw: ReadonlyArray<IStringDictionary<any> | ConfigurationModel> | undefined;
    private readonly logService;
    static createEmptyModel(logService: ILogService): ConfigurationModel;
    private readonly overrideConfigurations;
    constructor(_contents: any, _keys: string[], _overrides: IOverrides[], raw: ReadonlyArray<IStringDictionary<any> | ConfigurationModel> | undefined, logService: ILogService);
    private _rawConfiguration;
    get rawConfiguration(): ConfigurationModel;
    get contents(): any;
    get overrides(): IOverrides[];
    get keys(): string[];
    isEmpty(): boolean;
    getValue<V>(section: string | undefined): V;
    inspect<V>(section: string | undefined, overrideIdentifier?: string | null): InspectValue<V>;
    getOverrideValue<V>(section: string | undefined, overrideIdentifier: string): V | undefined;
    getKeysForOverrideIdentifier(identifier: string): string[];
    getAllOverrideIdentifiers(): string[];
    override(identifier: string): ConfigurationModel;
    merge(...others: ConfigurationModel[]): ConfigurationModel;
    private createOverrideConfigurationModel;
    private mergeContents;
    private getContentsForOverrideIdentifer;
    toJSON(): IConfigurationModel;
    addValue(key: string, value: any): void;
    setValue(key: string, value: any): void;
    removeValue(key: string): void;
    private updateValue;
}
export interface ConfigurationParseOptions {
    skipUnregistered?: boolean;
    scopes?: ConfigurationScope[];
    skipRestricted?: boolean;
    include?: string[];
    exclude?: string[];
}
export declare class ConfigurationModelParser {
    protected readonly _name: string;
    protected readonly logService: ILogService;
    private _raw;
    private _configurationModel;
    private _restrictedConfigurations;
    private _parseErrors;
    constructor(_name: string, logService: ILogService);
    get configurationModel(): ConfigurationModel;
    get restrictedConfigurations(): string[];
    get errors(): any[];
    parse(content: string | null | undefined, options?: ConfigurationParseOptions): void;
    reparse(options: ConfigurationParseOptions): void;
    parseRaw(raw: any, options?: ConfigurationParseOptions): void;
    private doParseContent;
    protected doParseRaw(raw: any, options?: ConfigurationParseOptions): IConfigurationModel & {
        restricted?: string[];
        hasExcludedProperties?: boolean;
    };
    private filter;
    private shouldInclude;
    private toOverrides;
}
export declare class UserSettings extends Disposable {
    private readonly userSettingsResource;
    protected parseOptions: ConfigurationParseOptions;
    private readonly fileService;
    private readonly logService;
    private readonly parser;
    protected readonly _onDidChange: Emitter<void>;
    readonly onDidChange: Event<void>;
    constructor(userSettingsResource: URI, parseOptions: ConfigurationParseOptions, extUri: IExtUri, fileService: IFileService, logService: ILogService);
    loadConfiguration(): Promise<ConfigurationModel>;
    reparse(parseOptions?: ConfigurationParseOptions): ConfigurationModel;
    getRestrictedSettings(): string[];
}
export declare class Configuration {
    private _defaultConfiguration;
    private _policyConfiguration;
    private _applicationConfiguration;
    private _localUserConfiguration;
    private _remoteUserConfiguration;
    private _workspaceConfiguration;
    private _folderConfigurations;
    private _memoryConfiguration;
    private _memoryConfigurationByResource;
    private readonly logService;
    private _workspaceConsolidatedConfiguration;
    private _foldersConsolidatedConfigurations;
    constructor(_defaultConfiguration: ConfigurationModel, _policyConfiguration: ConfigurationModel, _applicationConfiguration: ConfigurationModel, _localUserConfiguration: ConfigurationModel, _remoteUserConfiguration: ConfigurationModel, _workspaceConfiguration: ConfigurationModel, _folderConfigurations: ResourceMap<ConfigurationModel>, _memoryConfiguration: ConfigurationModel, _memoryConfigurationByResource: ResourceMap<ConfigurationModel>, logService: ILogService);
    getValue(section: string | undefined, overrides: IConfigurationOverrides, workspace: Workspace | undefined): any;
    updateValue(key: string, value: any, overrides?: IConfigurationUpdateOverrides): void;
    inspect<C>(key: string, overrides: IConfigurationOverrides, workspace: Workspace | undefined): IConfigurationValue<C>;
    keys(workspace: Workspace | undefined): {
        default: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
    };
    updateDefaultConfiguration(defaultConfiguration: ConfigurationModel): void;
    updatePolicyConfiguration(policyConfiguration: ConfigurationModel): void;
    updateApplicationConfiguration(applicationConfiguration: ConfigurationModel): void;
    updateLocalUserConfiguration(localUserConfiguration: ConfigurationModel): void;
    updateRemoteUserConfiguration(remoteUserConfiguration: ConfigurationModel): void;
    updateWorkspaceConfiguration(workspaceConfiguration: ConfigurationModel): void;
    updateFolderConfiguration(resource: URI, configuration: ConfigurationModel): void;
    deleteFolderConfiguration(resource: URI): void;
    compareAndUpdateDefaultConfiguration(defaults: ConfigurationModel, keys?: string[]): IConfigurationChange;
    compareAndUpdatePolicyConfiguration(policyConfiguration: ConfigurationModel): IConfigurationChange;
    compareAndUpdateApplicationConfiguration(application: ConfigurationModel): IConfigurationChange;
    compareAndUpdateLocalUserConfiguration(user: ConfigurationModel): IConfigurationChange;
    compareAndUpdateRemoteUserConfiguration(user: ConfigurationModel): IConfigurationChange;
    compareAndUpdateWorkspaceConfiguration(workspaceConfiguration: ConfigurationModel): IConfigurationChange;
    compareAndUpdateFolderConfiguration(resource: URI, folderConfiguration: ConfigurationModel): IConfigurationChange;
    compareAndDeleteFolderConfiguration(folder: URI): IConfigurationChange;
    get defaults(): ConfigurationModel;
    get applicationConfiguration(): ConfigurationModel;
    private _userConfiguration;
    get userConfiguration(): ConfigurationModel;
    get localUserConfiguration(): ConfigurationModel;
    get remoteUserConfiguration(): ConfigurationModel;
    get workspaceConfiguration(): ConfigurationModel;
    get folderConfigurations(): ResourceMap<ConfigurationModel>;
    private getConsolidatedConfigurationModel;
    private getConsolidatedConfigurationModelForResource;
    private getWorkspaceConsolidatedConfiguration;
    private getFolderConsolidatedConfiguration;
    private getFolderConfigurationModelForResource;
    toData(): IConfigurationData;
    allKeys(): string[];
    protected allOverrideIdentifiers(): string[];
    protected getAllKeysForOverrideIdentifier(overrideIdentifier: string): string[];
    static parse(data: IConfigurationData, logService: ILogService): Configuration;
    private static parseConfigurationModel;
}
export declare function mergeChanges(...changes: IConfigurationChange[]): IConfigurationChange;
export declare class ConfigurationChangeEvent implements IConfigurationChangeEvent {
    readonly change: IConfigurationChange;
    private readonly previous;
    private readonly currentConfiguraiton;
    private readonly currentWorkspace;
    private readonly logService;
    private readonly _marker;
    private readonly _markerCode1;
    private readonly _markerCode2;
    private readonly _affectsConfigStr;
    readonly affectedKeys: Set<string>;
    source: ConfigurationTarget;
    constructor(change: IConfigurationChange, previous: {
        workspace?: Workspace;
        data: IConfigurationData;
    } | undefined, currentConfiguraiton: Configuration, currentWorkspace: Workspace | undefined, logService: ILogService);
    private _previousConfiguration;
    get previousConfiguration(): Configuration | undefined;
    affectsConfiguration(section: string, overrides?: IConfigurationOverrides): boolean;
}
export {};
