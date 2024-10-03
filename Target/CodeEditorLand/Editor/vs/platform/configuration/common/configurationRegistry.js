import { distinct } from '../../../base/common/arrays.js';
import { Emitter } from '../../../base/common/event.js';
import * as types from '../../../base/common/types.js';
import * as nls from '../../../nls.js';
import { getLanguageTagSettingPlainKey } from './configuration.js';
import { Extensions as JSONExtensions } from '../../jsonschemas/common/jsonContributionRegistry.js';
import { Registry } from '../../registry/common/platform.js';
export var EditPresentationTypes;
(function (EditPresentationTypes) {
    EditPresentationTypes["Multiline"] = "multilineText";
    EditPresentationTypes["Singleline"] = "singlelineText";
})(EditPresentationTypes || (EditPresentationTypes = {}));
export const Extensions = {
    Configuration: 'base.contributions.configuration'
};
export const allSettings = { properties: {}, patternProperties: {} };
export const applicationSettings = { properties: {}, patternProperties: {} };
export const machineSettings = { properties: {}, patternProperties: {} };
export const machineOverridableSettings = { properties: {}, patternProperties: {} };
export const windowSettings = { properties: {}, patternProperties: {} };
export const resourceSettings = { properties: {}, patternProperties: {} };
export const resourceLanguageSettingsSchemaId = 'vscode://schemas/settings/resourceLanguage';
export const configurationDefaultsSchemaId = 'vscode://schemas/settings/configurationDefaults';
const contributionRegistry = Registry.as(JSONExtensions.JSONContribution);
class ConfigurationRegistry {
    constructor() {
        this.registeredConfigurationDefaults = [];
        this.overrideIdentifiers = new Set();
        this._onDidSchemaChange = new Emitter();
        this.onDidSchemaChange = this._onDidSchemaChange.event;
        this._onDidUpdateConfiguration = new Emitter();
        this.onDidUpdateConfiguration = this._onDidUpdateConfiguration.event;
        this.configurationDefaultsOverrides = new Map();
        this.defaultLanguageConfigurationOverridesNode = {
            id: 'defaultOverrides',
            title: nls.localize('defaultLanguageConfigurationOverrides.title', "Default Language Configuration Overrides"),
            properties: {}
        };
        this.configurationContributors = [this.defaultLanguageConfigurationOverridesNode];
        this.resourceLanguageSettingsSchema = {
            properties: {},
            patternProperties: {},
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        this.configurationProperties = {};
        this.policyConfigurations = new Map();
        this.excludedConfigurationProperties = {};
        contributionRegistry.registerSchema(resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
        this.registerOverridePropertyPatternKey();
    }
    registerConfiguration(configuration, validate = true) {
        this.registerConfigurations([configuration], validate);
    }
    registerConfigurations(configurations, validate = true) {
        const properties = new Set();
        this.doRegisterConfigurations(configurations, validate, properties);
        contributionRegistry.registerSchema(resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
        this._onDidSchemaChange.fire();
        this._onDidUpdateConfiguration.fire({ properties });
    }
    deregisterConfigurations(configurations) {
        const properties = new Set();
        this.doDeregisterConfigurations(configurations, properties);
        contributionRegistry.registerSchema(resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
        this._onDidSchemaChange.fire();
        this._onDidUpdateConfiguration.fire({ properties });
    }
    updateConfigurations({ add, remove }) {
        const properties = new Set();
        this.doDeregisterConfigurations(remove, properties);
        this.doRegisterConfigurations(add, false, properties);
        contributionRegistry.registerSchema(resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
        this._onDidSchemaChange.fire();
        this._onDidUpdateConfiguration.fire({ properties });
    }
    registerDefaultConfigurations(configurationDefaults) {
        const properties = new Set();
        this.doRegisterDefaultConfigurations(configurationDefaults, properties);
        this._onDidSchemaChange.fire();
        this._onDidUpdateConfiguration.fire({ properties, defaultsOverrides: true });
    }
    doRegisterDefaultConfigurations(configurationDefaults, bucket) {
        this.registeredConfigurationDefaults.push(...configurationDefaults);
        const overrideIdentifiers = [];
        for (const { overrides, source } of configurationDefaults) {
            for (const key in overrides) {
                bucket.add(key);
                const configurationDefaultOverridesForKey = this.configurationDefaultsOverrides.get(key)
                    ?? this.configurationDefaultsOverrides.set(key, { configurationDefaultOverrides: [] }).get(key);
                const value = overrides[key];
                configurationDefaultOverridesForKey.configurationDefaultOverrides.push({ value, source });
                if (OVERRIDE_PROPERTY_REGEX.test(key)) {
                    const newDefaultOverride = this.mergeDefaultConfigurationsForOverrideIdentifier(key, value, source, configurationDefaultOverridesForKey.configurationDefaultOverrideValue);
                    if (!newDefaultOverride) {
                        continue;
                    }
                    configurationDefaultOverridesForKey.configurationDefaultOverrideValue = newDefaultOverride;
                    this.updateDefaultOverrideProperty(key, newDefaultOverride, source);
                    overrideIdentifiers.push(...overrideIdentifiersFromKey(key));
                }
                else {
                    const newDefaultOverride = this.mergeDefaultConfigurationsForConfigurationProperty(key, value, source, configurationDefaultOverridesForKey.configurationDefaultOverrideValue);
                    if (!newDefaultOverride) {
                        continue;
                    }
                    configurationDefaultOverridesForKey.configurationDefaultOverrideValue = newDefaultOverride;
                    const property = this.configurationProperties[key];
                    if (property) {
                        this.updatePropertyDefaultValue(key, property);
                        this.updateSchema(key, property);
                    }
                }
            }
        }
        this.doRegisterOverrideIdentifiers(overrideIdentifiers);
    }
    deregisterDefaultConfigurations(defaultConfigurations) {
        const properties = new Set();
        this.doDeregisterDefaultConfigurations(defaultConfigurations, properties);
        this._onDidSchemaChange.fire();
        this._onDidUpdateConfiguration.fire({ properties, defaultsOverrides: true });
    }
    doDeregisterDefaultConfigurations(defaultConfigurations, bucket) {
        for (const defaultConfiguration of defaultConfigurations) {
            const index = this.registeredConfigurationDefaults.indexOf(defaultConfiguration);
            if (index !== -1) {
                this.registeredConfigurationDefaults.splice(index, 1);
            }
        }
        for (const { overrides, source } of defaultConfigurations) {
            for (const key in overrides) {
                const configurationDefaultOverridesForKey = this.configurationDefaultsOverrides.get(key);
                if (!configurationDefaultOverridesForKey) {
                    continue;
                }
                const index = configurationDefaultOverridesForKey.configurationDefaultOverrides
                    .findIndex(configurationDefaultOverride => source ? configurationDefaultOverride.source?.id === source.id : configurationDefaultOverride.value === overrides[key]);
                if (index === -1) {
                    continue;
                }
                configurationDefaultOverridesForKey.configurationDefaultOverrides.splice(index, 1);
                if (configurationDefaultOverridesForKey.configurationDefaultOverrides.length === 0) {
                    this.configurationDefaultsOverrides.delete(key);
                }
                if (OVERRIDE_PROPERTY_REGEX.test(key)) {
                    let configurationDefaultOverrideValue;
                    for (const configurationDefaultOverride of configurationDefaultOverridesForKey.configurationDefaultOverrides) {
                        configurationDefaultOverrideValue = this.mergeDefaultConfigurationsForOverrideIdentifier(key, configurationDefaultOverride.value, configurationDefaultOverride.source, configurationDefaultOverrideValue);
                    }
                    if (configurationDefaultOverrideValue && !types.isEmptyObject(configurationDefaultOverrideValue.value)) {
                        configurationDefaultOverridesForKey.configurationDefaultOverrideValue = configurationDefaultOverrideValue;
                        this.updateDefaultOverrideProperty(key, configurationDefaultOverrideValue, source);
                    }
                    else {
                        this.configurationDefaultsOverrides.delete(key);
                        delete this.configurationProperties[key];
                        delete this.defaultLanguageConfigurationOverridesNode.properties[key];
                    }
                }
                else {
                    let configurationDefaultOverrideValue;
                    for (const configurationDefaultOverride of configurationDefaultOverridesForKey.configurationDefaultOverrides) {
                        configurationDefaultOverrideValue = this.mergeDefaultConfigurationsForConfigurationProperty(key, configurationDefaultOverride.value, configurationDefaultOverride.source, configurationDefaultOverrideValue);
                    }
                    configurationDefaultOverridesForKey.configurationDefaultOverrideValue = configurationDefaultOverrideValue;
                    const property = this.configurationProperties[key];
                    if (property) {
                        this.updatePropertyDefaultValue(key, property);
                        this.updateSchema(key, property);
                    }
                }
                bucket.add(key);
            }
        }
        this.updateOverridePropertyPatternKey();
    }
    updateDefaultOverrideProperty(key, newDefaultOverride, source) {
        const property = {
            type: 'object',
            default: newDefaultOverride.value,
            description: nls.localize('defaultLanguageConfiguration.description', "Configure settings to be overridden for the {0} language.", getLanguageTagSettingPlainKey(key)),
            $ref: resourceLanguageSettingsSchemaId,
            defaultDefaultValue: newDefaultOverride.value,
            source,
            defaultValueSource: source
        };
        this.configurationProperties[key] = property;
        this.defaultLanguageConfigurationOverridesNode.properties[key] = property;
    }
    mergeDefaultConfigurationsForOverrideIdentifier(overrideIdentifier, configurationValueObject, valueSource, existingDefaultOverride) {
        const defaultValue = existingDefaultOverride?.value || {};
        const source = existingDefaultOverride?.source ?? new Map();
        if (!(source instanceof Map)) {
            console.error('objectConfigurationSources is not a Map');
            return undefined;
        }
        for (const propertyKey of Object.keys(configurationValueObject)) {
            const propertyDefaultValue = configurationValueObject[propertyKey];
            const isObjectSetting = types.isObject(propertyDefaultValue) &&
                (types.isUndefined(defaultValue[propertyKey]) || types.isObject(defaultValue[propertyKey]));
            if (isObjectSetting) {
                defaultValue[propertyKey] = { ...(defaultValue[propertyKey] ?? {}), ...propertyDefaultValue };
                if (valueSource) {
                    for (const objectKey in propertyDefaultValue) {
                        source.set(`${propertyKey}.${objectKey}`, valueSource);
                    }
                }
            }
            else {
                defaultValue[propertyKey] = propertyDefaultValue;
                if (valueSource) {
                    source.set(propertyKey, valueSource);
                }
                else {
                    source.delete(propertyKey);
                }
            }
        }
        return { value: defaultValue, source };
    }
    mergeDefaultConfigurationsForConfigurationProperty(propertyKey, value, valuesSource, existingDefaultOverride) {
        const property = this.configurationProperties[propertyKey];
        const existingDefaultValue = existingDefaultOverride?.value ?? property?.defaultDefaultValue;
        let source = valuesSource;
        const isObjectSetting = types.isObject(value) &&
            (property !== undefined && property.type === 'object' ||
                property === undefined && (types.isUndefined(existingDefaultValue) || types.isObject(existingDefaultValue)));
        if (isObjectSetting) {
            source = existingDefaultOverride?.source ?? new Map();
            if (!(source instanceof Map)) {
                console.error('defaultValueSource is not a Map');
                return undefined;
            }
            for (const objectKey in value) {
                if (valuesSource) {
                    source.set(`${propertyKey}.${objectKey}`, valuesSource);
                }
            }
            value = { ...(types.isObject(existingDefaultValue) ? existingDefaultValue : {}), ...value };
        }
        return { value, source };
    }
    deltaConfiguration(delta) {
        let defaultsOverrides = false;
        const properties = new Set();
        if (delta.removedDefaults) {
            this.doDeregisterDefaultConfigurations(delta.removedDefaults, properties);
            defaultsOverrides = true;
        }
        if (delta.addedDefaults) {
            this.doRegisterDefaultConfigurations(delta.addedDefaults, properties);
            defaultsOverrides = true;
        }
        if (delta.removedConfigurations) {
            this.doDeregisterConfigurations(delta.removedConfigurations, properties);
        }
        if (delta.addedConfigurations) {
            this.doRegisterConfigurations(delta.addedConfigurations, false, properties);
        }
        this._onDidSchemaChange.fire();
        this._onDidUpdateConfiguration.fire({ properties, defaultsOverrides });
    }
    notifyConfigurationSchemaUpdated(...configurations) {
        this._onDidSchemaChange.fire();
    }
    registerOverrideIdentifiers(overrideIdentifiers) {
        this.doRegisterOverrideIdentifiers(overrideIdentifiers);
        this._onDidSchemaChange.fire();
    }
    doRegisterOverrideIdentifiers(overrideIdentifiers) {
        for (const overrideIdentifier of overrideIdentifiers) {
            this.overrideIdentifiers.add(overrideIdentifier);
        }
        this.updateOverridePropertyPatternKey();
    }
    doRegisterConfigurations(configurations, validate, bucket) {
        configurations.forEach(configuration => {
            this.validateAndRegisterProperties(configuration, validate, configuration.extensionInfo, configuration.restrictedProperties, undefined, bucket);
            this.configurationContributors.push(configuration);
            this.registerJSONConfiguration(configuration);
        });
    }
    doDeregisterConfigurations(configurations, bucket) {
        const deregisterConfiguration = (configuration) => {
            if (configuration.properties) {
                for (const key in configuration.properties) {
                    bucket.add(key);
                    const property = this.configurationProperties[key];
                    if (property?.policy?.name) {
                        this.policyConfigurations.delete(property.policy.name);
                    }
                    delete this.configurationProperties[key];
                    this.removeFromSchema(key, configuration.properties[key]);
                }
            }
            configuration.allOf?.forEach(node => deregisterConfiguration(node));
        };
        for (const configuration of configurations) {
            deregisterConfiguration(configuration);
            const index = this.configurationContributors.indexOf(configuration);
            if (index !== -1) {
                this.configurationContributors.splice(index, 1);
            }
        }
    }
    validateAndRegisterProperties(configuration, validate = true, extensionInfo, restrictedProperties, scope = 3, bucket) {
        scope = types.isUndefinedOrNull(configuration.scope) ? scope : configuration.scope;
        const properties = configuration.properties;
        if (properties) {
            for (const key in properties) {
                const property = properties[key];
                if (validate && validateProperty(key, property)) {
                    delete properties[key];
                    continue;
                }
                property.source = extensionInfo;
                property.defaultDefaultValue = properties[key].default;
                this.updatePropertyDefaultValue(key, property);
                if (OVERRIDE_PROPERTY_REGEX.test(key)) {
                    property.scope = undefined;
                }
                else {
                    property.scope = types.isUndefinedOrNull(property.scope) ? scope : property.scope;
                    property.restricted = types.isUndefinedOrNull(property.restricted) ? !!restrictedProperties?.includes(key) : property.restricted;
                }
                if (properties[key].hasOwnProperty('included') && !properties[key].included) {
                    this.excludedConfigurationProperties[key] = properties[key];
                    delete properties[key];
                    continue;
                }
                else {
                    this.configurationProperties[key] = properties[key];
                    if (properties[key].policy?.name) {
                        this.policyConfigurations.set(properties[key].policy.name, key);
                    }
                }
                if (!properties[key].deprecationMessage && properties[key].markdownDeprecationMessage) {
                    properties[key].deprecationMessage = properties[key].markdownDeprecationMessage;
                }
                bucket.add(key);
            }
        }
        const subNodes = configuration.allOf;
        if (subNodes) {
            for (const node of subNodes) {
                this.validateAndRegisterProperties(node, validate, extensionInfo, restrictedProperties, scope, bucket);
            }
        }
    }
    getConfigurations() {
        return this.configurationContributors;
    }
    getConfigurationProperties() {
        return this.configurationProperties;
    }
    getPolicyConfigurations() {
        return this.policyConfigurations;
    }
    getExcludedConfigurationProperties() {
        return this.excludedConfigurationProperties;
    }
    getRegisteredDefaultConfigurations() {
        return [...this.registeredConfigurationDefaults];
    }
    getConfigurationDefaultsOverrides() {
        const configurationDefaultsOverrides = new Map();
        for (const [key, value] of this.configurationDefaultsOverrides) {
            if (value.configurationDefaultOverrideValue) {
                configurationDefaultsOverrides.set(key, value.configurationDefaultOverrideValue);
            }
        }
        return configurationDefaultsOverrides;
    }
    registerJSONConfiguration(configuration) {
        const register = (configuration) => {
            const properties = configuration.properties;
            if (properties) {
                for (const key in properties) {
                    this.updateSchema(key, properties[key]);
                }
            }
            const subNodes = configuration.allOf;
            subNodes?.forEach(register);
        };
        register(configuration);
    }
    updateSchema(key, property) {
        allSettings.properties[key] = property;
        switch (property.scope) {
            case 1:
                applicationSettings.properties[key] = property;
                break;
            case 2:
                machineSettings.properties[key] = property;
                break;
            case 6:
                machineOverridableSettings.properties[key] = property;
                break;
            case 3:
                windowSettings.properties[key] = property;
                break;
            case 4:
                resourceSettings.properties[key] = property;
                break;
            case 5:
                resourceSettings.properties[key] = property;
                this.resourceLanguageSettingsSchema.properties[key] = property;
                break;
        }
    }
    removeFromSchema(key, property) {
        delete allSettings.properties[key];
        switch (property.scope) {
            case 1:
                delete applicationSettings.properties[key];
                break;
            case 2:
                delete machineSettings.properties[key];
                break;
            case 6:
                delete machineOverridableSettings.properties[key];
                break;
            case 3:
                delete windowSettings.properties[key];
                break;
            case 4:
            case 5:
                delete resourceSettings.properties[key];
                delete this.resourceLanguageSettingsSchema.properties[key];
                break;
        }
    }
    updateOverridePropertyPatternKey() {
        for (const overrideIdentifier of this.overrideIdentifiers.values()) {
            const overrideIdentifierProperty = `[${overrideIdentifier}]`;
            const resourceLanguagePropertiesSchema = {
                type: 'object',
                description: nls.localize('overrideSettings.defaultDescription', "Configure editor settings to be overridden for a language."),
                errorMessage: nls.localize('overrideSettings.errorMessage', "This setting does not support per-language configuration."),
                $ref: resourceLanguageSettingsSchemaId,
            };
            this.updatePropertyDefaultValue(overrideIdentifierProperty, resourceLanguagePropertiesSchema);
            allSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
            applicationSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
            machineSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
            machineOverridableSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
            windowSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
            resourceSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
        }
    }
    registerOverridePropertyPatternKey() {
        const resourceLanguagePropertiesSchema = {
            type: 'object',
            description: nls.localize('overrideSettings.defaultDescription', "Configure editor settings to be overridden for a language."),
            errorMessage: nls.localize('overrideSettings.errorMessage', "This setting does not support per-language configuration."),
            $ref: resourceLanguageSettingsSchemaId,
        };
        allSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
        applicationSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
        machineSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
        machineOverridableSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
        windowSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
        resourceSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
        this._onDidSchemaChange.fire();
    }
    updatePropertyDefaultValue(key, property) {
        const configurationdefaultOverride = this.configurationDefaultsOverrides.get(key)?.configurationDefaultOverrideValue;
        let defaultValue = undefined;
        let defaultSource = undefined;
        if (configurationdefaultOverride
            && (!property.disallowConfigurationDefault || !configurationdefaultOverride.source)) {
            defaultValue = configurationdefaultOverride.value;
            defaultSource = configurationdefaultOverride.source;
        }
        if (types.isUndefined(defaultValue)) {
            defaultValue = property.defaultDefaultValue;
            defaultSource = undefined;
        }
        if (types.isUndefined(defaultValue)) {
            defaultValue = getDefaultValue(property.type);
        }
        property.default = defaultValue;
        property.defaultValueSource = defaultSource;
    }
}
const OVERRIDE_IDENTIFIER_PATTERN = `\\[([^\\]]+)\\]`;
const OVERRIDE_IDENTIFIER_REGEX = new RegExp(OVERRIDE_IDENTIFIER_PATTERN, 'g');
export const OVERRIDE_PROPERTY_PATTERN = `^(${OVERRIDE_IDENTIFIER_PATTERN})+$`;
export const OVERRIDE_PROPERTY_REGEX = new RegExp(OVERRIDE_PROPERTY_PATTERN);
export function overrideIdentifiersFromKey(key) {
    const identifiers = [];
    if (OVERRIDE_PROPERTY_REGEX.test(key)) {
        let matches = OVERRIDE_IDENTIFIER_REGEX.exec(key);
        while (matches?.length) {
            const identifier = matches[1].trim();
            if (identifier) {
                identifiers.push(identifier);
            }
            matches = OVERRIDE_IDENTIFIER_REGEX.exec(key);
        }
    }
    return distinct(identifiers);
}
export function keyFromOverrideIdentifiers(overrideIdentifiers) {
    return overrideIdentifiers.reduce((result, overrideIdentifier) => `${result}[${overrideIdentifier}]`, '');
}
export function getDefaultValue(type) {
    const t = Array.isArray(type) ? type[0] : type;
    switch (t) {
        case 'boolean':
            return false;
        case 'integer':
        case 'number':
            return 0;
        case 'string':
            return '';
        case 'array':
            return [];
        case 'object':
            return {};
        default:
            return null;
    }
}
const configurationRegistry = new ConfigurationRegistry();
Registry.add(Extensions.Configuration, configurationRegistry);
export function validateProperty(property, schema) {
    if (!property.trim()) {
        return nls.localize('config.property.empty', "Cannot register an empty property");
    }
    if (OVERRIDE_PROPERTY_REGEX.test(property)) {
        return nls.localize('config.property.languageDefault', "Cannot register '{0}'. This matches property pattern '\\\\[.*\\\\]$' for describing language specific editor settings. Use 'configurationDefaults' contribution.", property);
    }
    if (configurationRegistry.getConfigurationProperties()[property] !== undefined) {
        return nls.localize('config.property.duplicate', "Cannot register '{0}'. This property is already registered.", property);
    }
    if (schema.policy?.name && configurationRegistry.getPolicyConfigurations().get(schema.policy?.name) !== undefined) {
        return nls.localize('config.policy.duplicate', "Cannot register '{0}'. The associated policy {1} is already registered with {2}.", property, schema.policy?.name, configurationRegistry.getPolicyConfigurations().get(schema.policy?.name));
    }
    return null;
}
export function getScopes() {
    const scopes = [];
    const configurationProperties = configurationRegistry.getConfigurationProperties();
    for (const key of Object.keys(configurationProperties)) {
        scopes.push([key, configurationProperties[key].scope]);
    }
    scopes.push(['launch', 4]);
    scopes.push(['task', 4]);
    return scopes;
}
export function getAllConfigurationProperties(configurationNode) {
    const result = {};
    for (const configuration of configurationNode) {
        const properties = configuration.properties;
        if (types.isObject(properties)) {
            for (const key in properties) {
                result[key] = properties[key];
            }
        }
        if (configuration.allOf) {
            Object.assign(result, getAllConfigurationProperties(configuration.allOf));
        }
    }
    return result;
}
export function parseScope(scope) {
    switch (scope) {
        case 'application':
            return 1;
        case 'machine':
            return 2;
        case 'resource':
            return 4;
        case 'machine-overridable':
            return 6;
        case 'language-overridable':
            return 5;
        default:
            return 3;
    }
}
