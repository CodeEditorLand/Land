import { Event } from '../../../base/common/event.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IWorkspaceFolder } from '../../workspace/common/workspace.js';
export declare const IConfigurationService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IConfigurationService>;
export declare function isConfigurationOverrides(thing: any): thing is IConfigurationOverrides;
export interface IConfigurationOverrides {
    overrideIdentifier?: string | null;
    resource?: URI | null;
}
export declare function isConfigurationUpdateOverrides(thing: any): thing is IConfigurationUpdateOverrides;
export type IConfigurationUpdateOverrides = Omit<IConfigurationOverrides, 'overrideIdentifier'> & {
    overrideIdentifiers?: string[] | null;
};
export declare const enum ConfigurationTarget {
    APPLICATION = 1,
    USER = 2,
    USER_LOCAL = 3,
    USER_REMOTE = 4,
    WORKSPACE = 5,
    WORKSPACE_FOLDER = 6,
    DEFAULT = 7,
    MEMORY = 8
}
export declare function ConfigurationTargetToString(configurationTarget: ConfigurationTarget): "APPLICATION" | "USER" | "USER_LOCAL" | "USER_REMOTE" | "WORKSPACE" | "WORKSPACE_FOLDER" | "DEFAULT" | "MEMORY";
export interface IConfigurationChange {
    keys: string[];
    overrides: [string, string[]][];
}
export interface IConfigurationChangeEvent {
    readonly source: ConfigurationTarget;
    readonly affectedKeys: ReadonlySet<string>;
    readonly change: IConfigurationChange;
    affectsConfiguration(configuration: string, overrides?: IConfigurationOverrides): boolean;
}
export interface IInspectValue<T> {
    readonly value?: T;
    readonly override?: T;
    readonly overrides?: {
        readonly identifiers: string[];
        readonly value: T;
    }[];
}
export interface IConfigurationValue<T> {
    readonly defaultValue?: T;
    readonly applicationValue?: T;
    readonly userValue?: T;
    readonly userLocalValue?: T;
    readonly userRemoteValue?: T;
    readonly workspaceValue?: T;
    readonly workspaceFolderValue?: T;
    readonly memoryValue?: T;
    readonly policyValue?: T;
    readonly value?: T;
    readonly default?: IInspectValue<T>;
    readonly application?: IInspectValue<T>;
    readonly user?: IInspectValue<T>;
    readonly userLocal?: IInspectValue<T>;
    readonly userRemote?: IInspectValue<T>;
    readonly workspace?: IInspectValue<T>;
    readonly workspaceFolder?: IInspectValue<T>;
    readonly memory?: IInspectValue<T>;
    readonly policy?: {
        value?: T;
    };
    readonly overrideIdentifiers?: string[];
}
export declare function isConfigured<T>(configValue: IConfigurationValue<T>): configValue is IConfigurationValue<T> & {
    value: T;
};
export interface IConfigurationUpdateOptions {
    donotNotifyError?: boolean;
    handleDirtyFile?: 'save' | 'revert';
}
export interface IConfigurationService {
    readonly _serviceBrand: undefined;
    onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
    getConfigurationData(): IConfigurationData | null;
    getValue<T>(): T;
    getValue<T>(section: string): T;
    getValue<T>(overrides: IConfigurationOverrides): T;
    getValue<T>(section: string, overrides: IConfigurationOverrides): T;
    updateValue(key: string, value: any): Promise<void>;
    updateValue(key: string, value: any, target: ConfigurationTarget): Promise<void>;
    updateValue(key: string, value: any, overrides: IConfigurationOverrides | IConfigurationUpdateOverrides): Promise<void>;
    updateValue(key: string, value: any, overrides: IConfigurationOverrides | IConfigurationUpdateOverrides, target: ConfigurationTarget, options?: IConfigurationUpdateOptions): Promise<void>;
    inspect<T>(key: string, overrides?: IConfigurationOverrides): IConfigurationValue<Readonly<T>>;
    reloadConfiguration(target?: ConfigurationTarget | IWorkspaceFolder): Promise<void>;
    keys(): {
        default: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
        memory?: string[];
    };
}
export interface IConfigurationModel {
    contents: any;
    keys: string[];
    overrides: IOverrides[];
}
export interface IOverrides {
    keys: string[];
    contents: any;
    identifiers: string[];
}
export interface IConfigurationData {
    defaults: IConfigurationModel;
    policy: IConfigurationModel;
    application: IConfigurationModel;
    user: IConfigurationModel;
    workspace: IConfigurationModel;
    folders: [UriComponents, IConfigurationModel][];
}
export interface IConfigurationCompareResult {
    added: string[];
    removed: string[];
    updated: string[];
    overrides: [string, string[]][];
}
export declare function toValuesTree(properties: {
    [qualifiedKey: string]: any;
}, conflictReporter: (message: string) => void): any;
export declare function addToValueTree(settingsTreeRoot: any, key: string, value: any, conflictReporter: (message: string) => void): void;
export declare function removeFromValueTree(valueTree: any, key: string): void;
export declare function getConfigurationValue<T>(config: any, settingPath: string, defaultValue?: T): T;
export declare function merge(base: any, add: any, overwrite: boolean): void;
export declare function getLanguageTagSettingPlainKey(settingKey: string): string;
