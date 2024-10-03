import { IStringDictionary } from '../../../base/common/collections.js';
import { Event } from '../../../base/common/event.js';
import { IJSONSchema } from '../../../base/common/jsonSchema.js';
import { PolicyName } from '../../policy/common/policy.js';
export declare enum EditPresentationTypes {
    Multiline = "multilineText",
    Singleline = "singlelineText"
}
export declare const Extensions: {
    Configuration: string;
};
export interface IConfigurationDelta {
    removedDefaults?: IConfigurationDefaults[];
    removedConfigurations?: IConfigurationNode[];
    addedDefaults?: IConfigurationDefaults[];
    addedConfigurations?: IConfigurationNode[];
}
export interface IConfigurationRegistry {
    registerConfiguration(configuration: IConfigurationNode): void;
    registerConfigurations(configurations: IConfigurationNode[], validate?: boolean): void;
    deregisterConfigurations(configurations: IConfigurationNode[]): void;
    updateConfigurations(configurations: {
        add: IConfigurationNode[];
        remove: IConfigurationNode[];
    }): void;
    registerDefaultConfigurations(defaultConfigurations: IConfigurationDefaults[]): void;
    deregisterDefaultConfigurations(defaultConfigurations: IConfigurationDefaults[]): void;
    deltaConfiguration(delta: IConfigurationDelta): void;
    getRegisteredDefaultConfigurations(): IConfigurationDefaults[];
    getConfigurationDefaultsOverrides(): Map<string, IConfigurationDefaultOverrideValue>;
    notifyConfigurationSchemaUpdated(...configurations: IConfigurationNode[]): void;
    readonly onDidSchemaChange: Event<void>;
    readonly onDidUpdateConfiguration: Event<{
        properties: ReadonlySet<string>;
        defaultsOverrides?: boolean;
    }>;
    getConfigurations(): IConfigurationNode[];
    getConfigurationProperties(): IStringDictionary<IRegisteredConfigurationPropertySchema>;
    getPolicyConfigurations(): Map<PolicyName, string>;
    getExcludedConfigurationProperties(): IStringDictionary<IRegisteredConfigurationPropertySchema>;
    registerOverrideIdentifiers(identifiers: string[]): void;
}
export declare const enum ConfigurationScope {
    APPLICATION = 1,
    MACHINE = 2,
    WINDOW = 3,
    RESOURCE = 4,
    LANGUAGE_OVERRIDABLE = 5,
    MACHINE_OVERRIDABLE = 6
}
export interface IPolicy {
    readonly name: PolicyName;
    readonly minimumVersion: `${number}.${number}`;
}
export interface IConfigurationPropertySchema extends IJSONSchema {
    scope?: ConfigurationScope;
    restricted?: boolean;
    included?: boolean;
    tags?: string[];
    ignoreSync?: boolean;
    disallowSyncIgnore?: boolean;
    disallowConfigurationDefault?: boolean;
    enumItemLabels?: string[];
    editPresentation?: EditPresentationTypes;
    order?: number;
    policy?: IPolicy;
}
export interface IExtensionInfo {
    id: string;
    displayName?: string;
}
export interface IConfigurationNode {
    id?: string;
    order?: number;
    type?: string | string[];
    title?: string;
    description?: string;
    properties?: IStringDictionary<IConfigurationPropertySchema>;
    allOf?: IConfigurationNode[];
    scope?: ConfigurationScope;
    extensionInfo?: IExtensionInfo;
    restrictedProperties?: string[];
}
export type ConfigurationDefaultValueSource = IExtensionInfo | Map<string, IExtensionInfo>;
export interface IConfigurationDefaults {
    overrides: IStringDictionary<any>;
    source?: IExtensionInfo;
}
export type IRegisteredConfigurationPropertySchema = IConfigurationPropertySchema & {
    defaultDefaultValue?: any;
    source?: IExtensionInfo;
    defaultValueSource?: ConfigurationDefaultValueSource;
};
export interface IConfigurationDefaultOverride {
    readonly value: any;
    readonly source?: IExtensionInfo;
}
export interface IConfigurationDefaultOverrideValue {
    readonly value: any;
    readonly source?: ConfigurationDefaultValueSource;
}
export declare const allSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const applicationSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const machineSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const machineOverridableSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const windowSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const resourceSettings: {
    properties: IStringDictionary<IConfigurationPropertySchema>;
    patternProperties: IStringDictionary<IConfigurationPropertySchema>;
};
export declare const resourceLanguageSettingsSchemaId = "vscode://schemas/settings/resourceLanguage";
export declare const configurationDefaultsSchemaId = "vscode://schemas/settings/configurationDefaults";
export declare const OVERRIDE_PROPERTY_PATTERN = "^(\\[([^\\]]+)\\])+$";
export declare const OVERRIDE_PROPERTY_REGEX: RegExp;
export declare function overrideIdentifiersFromKey(key: string): string[];
export declare function keyFromOverrideIdentifiers(overrideIdentifiers: string[]): string;
export declare function getDefaultValue(type: string | string[] | undefined): {} | null;
export declare function validateProperty(property: string, schema: IRegisteredConfigurationPropertySchema): string | null;
export declare function getScopes(): [string, ConfigurationScope | undefined][];
export declare function getAllConfigurationProperties(configurationNode: IConfigurationNode[]): IStringDictionary<IRegisteredConfigurationPropertySchema>;
export declare function parseScope(scope: string): ConfigurationScope;
