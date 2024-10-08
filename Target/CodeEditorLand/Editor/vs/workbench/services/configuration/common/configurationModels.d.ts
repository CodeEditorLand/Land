import { IConfigurationModel, IConfigurationOverrides, IConfigurationValue, IConfigurationChange } from '../../../../platform/configuration/common/configuration.js';
import { Configuration as BaseConfiguration, ConfigurationModelParser, ConfigurationModel, ConfigurationParseOptions } from '../../../../platform/configuration/common/configurationModels.js';
import { IStoredWorkspaceFolder } from '../../../../platform/workspaces/common/workspaces.js';
import { Workspace } from '../../../../platform/workspace/common/workspace.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { URI } from '../../../../base/common/uri.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class WorkspaceConfigurationModelParser extends ConfigurationModelParser {
    private _folders;
    private _transient;
    private _settingsModelParser;
    private _launchModel;
    private _tasksModel;
    constructor(name: string, logService: ILogService);
    get folders(): IStoredWorkspaceFolder[];
    get transient(): boolean;
    get settingsModel(): ConfigurationModel;
    get launchModel(): ConfigurationModel;
    get tasksModel(): ConfigurationModel;
    reparseWorkspaceSettings(configurationParseOptions: ConfigurationParseOptions): void;
    getRestrictedWorkspaceSettings(): string[];
    protected doParseRaw(raw: any, configurationParseOptions?: ConfigurationParseOptions): IConfigurationModel;
    private createConfigurationModelFrom;
}
export declare class StandaloneConfigurationModelParser extends ConfigurationModelParser {
    private readonly scope;
    constructor(name: string, scope: string, logService: ILogService);
    protected doParseRaw(raw: any, configurationParseOptions?: ConfigurationParseOptions): IConfigurationModel;
}
export declare class Configuration extends BaseConfiguration {
    private readonly _workspace;
    constructor(defaults: ConfigurationModel, policy: ConfigurationModel, application: ConfigurationModel, localUser: ConfigurationModel, remoteUser: ConfigurationModel, workspaceConfiguration: ConfigurationModel, folders: ResourceMap<ConfigurationModel>, memoryConfiguration: ConfigurationModel, memoryConfigurationByResource: ResourceMap<ConfigurationModel>, _workspace: Workspace | undefined, logService: ILogService);
    getValue(key: string | undefined, overrides?: IConfigurationOverrides): any;
    inspect<C>(key: string, overrides?: IConfigurationOverrides): IConfigurationValue<C>;
    keys(): {
        default: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
    };
    compareAndDeleteFolderConfiguration(folder: URI): IConfigurationChange;
    compare(other: Configuration): IConfigurationChange;
}
