import { ConfigurationScope } from '../../../../platform/configuration/common/configurationRegistry.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Event } from '../../../../base/common/event.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IAnyWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
export declare const FOLDER_CONFIG_FOLDER_NAME = ".vscode";
export declare const FOLDER_SETTINGS_NAME = "settings";
export declare const FOLDER_SETTINGS_PATH = ".vscode/settings.json";
export declare const defaultSettingsSchemaId = "vscode://schemas/settings/default";
export declare const userSettingsSchemaId = "vscode://schemas/settings/user";
export declare const profileSettingsSchemaId = "vscode://schemas/settings/profile";
export declare const machineSettingsSchemaId = "vscode://schemas/settings/machine";
export declare const workspaceSettingsSchemaId = "vscode://schemas/settings/workspace";
export declare const folderSettingsSchemaId = "vscode://schemas/settings/folder";
export declare const launchSchemaId = "vscode://schemas/launch";
export declare const tasksSchemaId = "vscode://schemas/tasks";
export declare const APPLICATION_SCOPES: ConfigurationScope[];
export declare const PROFILE_SCOPES: ConfigurationScope[];
export declare const LOCAL_MACHINE_PROFILE_SCOPES: ConfigurationScope[];
export declare const LOCAL_MACHINE_SCOPES: ConfigurationScope[];
export declare const REMOTE_MACHINE_SCOPES: ConfigurationScope[];
export declare const WORKSPACE_SCOPES: ConfigurationScope[];
export declare const FOLDER_SCOPES: ConfigurationScope[];
export declare const TASKS_CONFIGURATION_KEY = "tasks";
export declare const LAUNCH_CONFIGURATION_KEY = "launch";
export declare const WORKSPACE_STANDALONE_CONFIGURATIONS: any;
export declare const USER_STANDALONE_CONFIGURATIONS: any;
export type ConfigurationKey = {
    type: 'defaults' | 'user' | 'workspaces' | 'folder';
    key: string;
};
export interface IConfigurationCache {
    needsCaching(resource: URI): boolean;
    read(key: ConfigurationKey): Promise<string>;
    write(key: ConfigurationKey, content: string): Promise<void>;
    remove(key: ConfigurationKey): Promise<void>;
}
export type RestrictedSettings = {
    default: ReadonlyArray<string>;
    application?: ReadonlyArray<string>;
    userLocal?: ReadonlyArray<string>;
    userRemote?: ReadonlyArray<string>;
    workspace?: ReadonlyArray<string>;
    workspaceFolder?: ResourceMap<ReadonlyArray<string>>;
};
export declare const IWorkbenchConfigurationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchConfigurationService>;
export interface IWorkbenchConfigurationService extends IConfigurationService {
    readonly restrictedSettings: RestrictedSettings;
    readonly onDidChangeRestrictedSettings: Event<RestrictedSettings>;
    whenRemoteConfigurationLoaded(): Promise<void>;
    initialize(arg: IAnyWorkspaceIdentifier): Promise<void>;
    isSettingAppliedForAllProfiles(setting: string): boolean;
}
export declare const TASKS_DEFAULT = "{\n\t\"version\": \"2.0.0\",\n\t\"tasks\": []\n}";
export declare const APPLY_ALL_PROFILES_SETTING = "workbench.settings.applyToAllProfiles";
