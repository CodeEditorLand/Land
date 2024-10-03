import { distinct } from '../../../base/common/arrays.js';
import { isObject, isString } from '../../../base/common/types.js';
import { localize } from '../../../nls.js';
import { allSettings, Extensions as ConfigurationExtensions, getAllConfigurationProperties, parseScope } from '../../configuration/common/configurationRegistry.js';
import { EXTENSION_IDENTIFIER_PATTERN } from '../../extensionManagement/common/extensionManagement.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { Extensions as JSONExtensions } from '../../jsonschemas/common/jsonContributionRegistry.js';
import { Registry } from '../../registry/common/platform.js';
export function getDisallowedIgnoredSettings() {
    const allSettings = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
    return Object.keys(allSettings).filter(setting => !!allSettings[setting].disallowSyncIgnore);
}
export function getDefaultIgnoredSettings(excludeExtensions = false) {
    const allSettings = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
    const ignoredSettings = getIgnoredSettings(allSettings, excludeExtensions);
    const disallowedSettings = getDisallowedIgnoredSettings();
    return distinct([...ignoredSettings, ...disallowedSettings]);
}
export function getIgnoredSettingsForExtension(manifest) {
    if (!manifest.contributes?.configuration) {
        return [];
    }
    const configurations = Array.isArray(manifest.contributes.configuration) ? manifest.contributes.configuration : [manifest.contributes.configuration];
    if (!configurations.length) {
        return [];
    }
    const properties = getAllConfigurationProperties(configurations);
    return getIgnoredSettings(properties, false);
}
function getIgnoredSettings(properties, excludeExtensions) {
    const ignoredSettings = new Set();
    for (const key in properties) {
        if (excludeExtensions && !!properties[key].source) {
            continue;
        }
        const scope = isString(properties[key].scope) ? parseScope(properties[key].scope) : properties[key].scope;
        if (properties[key].ignoreSync
            || scope === 2
            || scope === 6) {
            ignoredSettings.add(key);
        }
    }
    return [...ignoredSettings.values()];
}
export const USER_DATA_SYNC_CONFIGURATION_SCOPE = 'settingsSync';
export const CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM = 'settingsSync.keybindingsPerPlatform';
export function registerConfiguration() {
    const ignoredSettingsSchemaId = 'vscode://schemas/ignoredSettings';
    const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
    configurationRegistry.registerConfiguration({
        id: 'settingsSync',
        order: 30,
        title: localize('settings sync', "Settings Sync"),
        type: 'object',
        properties: {
            [CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM]: {
                type: 'boolean',
                description: localize('settingsSync.keybindingsPerPlatform', "Synchronize keybindings for each platform."),
                default: true,
                scope: 1,
                tags: ['sync', 'usesOnlineServices']
            },
            'settingsSync.ignoredExtensions': {
                'type': 'array',
                markdownDescription: localize('settingsSync.ignoredExtensions', "List of extensions to be ignored while synchronizing. The identifier of an extension is always `${publisher}.${name}`. For example: `vscode.csharp`."),
                items: [{
                        type: 'string',
                        pattern: EXTENSION_IDENTIFIER_PATTERN,
                        errorMessage: localize('app.extension.identifier.errorMessage', "Expected format '${publisher}.${name}'. Example: 'vscode.csharp'.")
                    }],
                'default': [],
                'scope': 1,
                uniqueItems: true,
                disallowSyncIgnore: true,
                tags: ['sync', 'usesOnlineServices']
            },
            'settingsSync.ignoredSettings': {
                'type': 'array',
                description: localize('settingsSync.ignoredSettings', "Configure settings to be ignored while synchronizing."),
                'default': [],
                'scope': 1,
                $ref: ignoredSettingsSchemaId,
                additionalProperties: true,
                uniqueItems: true,
                disallowSyncIgnore: true,
                tags: ['sync', 'usesOnlineServices']
            }
        }
    });
    const jsonRegistry = Registry.as(JSONExtensions.JSONContribution);
    const registerIgnoredSettingsSchema = () => {
        const disallowedIgnoredSettings = getDisallowedIgnoredSettings();
        const defaultIgnoredSettings = getDefaultIgnoredSettings();
        const settings = Object.keys(allSettings.properties).filter(setting => !defaultIgnoredSettings.includes(setting));
        const ignoredSettings = defaultIgnoredSettings.filter(setting => !disallowedIgnoredSettings.includes(setting));
        const ignoredSettingsSchema = {
            items: {
                type: 'string',
                enum: [...settings, ...ignoredSettings.map(setting => `-${setting}`)]
            },
        };
        jsonRegistry.registerSchema(ignoredSettingsSchemaId, ignoredSettingsSchema);
    };
    return configurationRegistry.onDidUpdateConfiguration(() => registerIgnoredSettingsSchema());
}
export function isAuthenticationProvider(thing) {
    return thing
        && isObject(thing)
        && isString(thing.id)
        && Array.isArray(thing.scopes);
}
export const ALL_SYNC_RESOURCES = ["settings", "keybindings", "snippets", "tasks", "extensions", "globalState", "profiles"];
export function getPathSegments(collection, ...paths) {
    return collection ? [collection, ...paths] : paths;
}
export function getLastSyncResourceUri(collection, syncResource, environmentService, extUri) {
    return extUri.joinPath(environmentService.userDataSyncHome, ...getPathSegments(collection, syncResource, `lastSync${syncResource}.json`));
}
export const IUserDataSyncStoreManagementService = createDecorator('IUserDataSyncStoreManagementService');
export const IUserDataSyncStoreService = createDecorator('IUserDataSyncStoreService');
export const IUserDataSyncLocalStoreService = createDecorator('IUserDataSyncLocalStoreService');
export const HEADER_OPERATION_ID = 'x-operation-id';
export const HEADER_EXECUTION_ID = 'X-Execution-Id';
export function createSyncHeaders(executionId) {
    const headers = {};
    headers[HEADER_EXECUTION_ID] = executionId;
    return headers;
}
export class UserDataSyncError extends Error {
    constructor(message, code, resource, operationId) {
        super(message);
        this.code = code;
        this.resource = resource;
        this.operationId = operationId;
        this.name = `${this.code} (UserDataSyncError) syncResource:${this.resource || 'unknown'} operationId:${this.operationId || 'unknown'}`;
    }
}
export class UserDataSyncStoreError extends UserDataSyncError {
    constructor(message, url, code, serverCode, operationId) {
        super(message, code, undefined, operationId);
        this.url = url;
        this.serverCode = serverCode;
    }
}
export class UserDataAutoSyncError extends UserDataSyncError {
    constructor(message, code) {
        super(message, code);
    }
}
(function (UserDataSyncError) {
    function toUserDataSyncError(error) {
        if (error instanceof UserDataSyncError) {
            return error;
        }
        const match = /^(.+) \(UserDataSyncError\) syncResource:(.+) operationId:(.+)$/.exec(error.name);
        if (match && match[1]) {
            const syncResource = match[2] === 'unknown' ? undefined : match[2];
            const operationId = match[3] === 'unknown' ? undefined : match[3];
            return new UserDataSyncError(error.message, match[1], syncResource, operationId);
        }
        return new UserDataSyncError(error.message, "Unknown");
    }
    UserDataSyncError.toUserDataSyncError = toUserDataSyncError;
})(UserDataSyncError || (UserDataSyncError = {}));
export const SYNC_SERVICE_URL_TYPE = 'sync.store.url.type';
export function getEnablementKey(resource) { return `sync.enable.${resource}`; }
export const IUserDataSyncEnablementService = createDecorator('IUserDataSyncEnablementService');
export const IUserDataSyncService = createDecorator('IUserDataSyncService');
export const IUserDataSyncResourceProviderService = createDecorator('IUserDataSyncResourceProviderService');
export const IUserDataAutoSyncService = createDecorator('IUserDataAutoSyncService');
export const IUserDataSyncUtilService = createDecorator('IUserDataSyncUtilService');
export const IUserDataSyncLogService = createDecorator('IUserDataSyncLogService');
export const USER_DATA_SYNC_LOG_ID = 'userDataSync';
export const USER_DATA_SYNC_SCHEME = 'vscode-userdata-sync';
export const PREVIEW_DIR_NAME = 'preview';
