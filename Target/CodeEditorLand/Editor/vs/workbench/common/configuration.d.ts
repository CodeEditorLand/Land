import { IConfigurationNode } from '../../platform/configuration/common/configurationRegistry.js';
import { IWorkbenchContribution } from './contributions.js';
import { IWorkspaceContextService } from '../../platform/workspace/common/workspace.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { Disposable } from '../../base/common/lifecycle.js';
import { IRemoteAgentService } from '../services/remote/common/remoteAgentService.js';
import { IUserDataProfilesService } from '../../platform/userDataProfile/common/userDataProfile.js';
export declare const applicationConfigurationNodeBase: Readonly<IConfigurationNode>;
export declare const workbenchConfigurationNodeBase: Readonly<IConfigurationNode>;
export declare const securityConfigurationNodeBase: Readonly<IConfigurationNode>;
export declare const problemsConfigurationNodeBase: Readonly<IConfigurationNode>;
export declare const windowConfigurationNodeBase: Readonly<IConfigurationNode>;
export declare const Extensions: {
    ConfigurationMigration: string;
};
export type ConfigurationValue = {
    value: any | undefined;
};
export type ConfigurationKeyValuePairs = [string, ConfigurationValue][];
export type ConfigurationMigrationFn = (value: any, valueAccessor: (key: string) => any) => ConfigurationValue | ConfigurationKeyValuePairs | Promise<ConfigurationValue | ConfigurationKeyValuePairs>;
export type ConfigurationMigration = {
    key: string;
    migrateFn: ConfigurationMigrationFn;
};
export interface IConfigurationMigrationRegistry {
    registerConfigurationMigrations(configurationMigrations: ConfigurationMigration[]): void;
}
export declare class ConfigurationMigrationWorkbenchContribution extends Disposable implements IWorkbenchContribution {
    private readonly configurationService;
    private readonly workspaceService;
    static readonly ID = "workbench.contrib.configurationMigration";
    constructor(configurationService: IConfigurationService, workspaceService: IWorkspaceContextService);
    private migrateConfigurations;
    private migrateConfigurationsForFolder;
    private migrateConfigurationsForFolderAndOverride;
    private runMigration;
}
export declare class DynamicWorkbenchSecurityConfiguration extends Disposable implements IWorkbenchContribution {
    private readonly remoteAgentService;
    static readonly ID = "workbench.contrib.dynamicWorkbenchSecurityConfiguration";
    private readonly _ready;
    readonly ready: Promise<void>;
    constructor(remoteAgentService: IRemoteAgentService);
    private create;
    private doCreate;
}
export declare const CONFIG_NEW_WINDOW_PROFILE = "window.newWindowProfile";
export declare class DynamicWindowConfiguration extends Disposable implements IWorkbenchContribution {
    private readonly userDataProfilesService;
    private readonly configurationService;
    static readonly ID = "workbench.contrib.dynamicWindowConfiguration";
    private configurationNode;
    private newWindowProfile;
    constructor(userDataProfilesService: IUserDataProfilesService, configurationService: IConfigurationService);
    private registerNewWindowProfileConfiguration;
    private setNewWindowProfile;
    private checkAndResetNewWindowProfileConfig;
}
