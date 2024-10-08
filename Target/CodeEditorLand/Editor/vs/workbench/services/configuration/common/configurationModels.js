/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { equals } from '../../../../base/common/objects.js';
import { toValuesTree } from '../../../../platform/configuration/common/configuration.js';
import { Configuration as BaseConfiguration, ConfigurationModelParser, ConfigurationModel } from '../../../../platform/configuration/common/configurationModels.js';
import { isBoolean } from '../../../../base/common/types.js';
import { distinct } from '../../../../base/common/arrays.js';
export class WorkspaceConfigurationModelParser extends ConfigurationModelParser {
    constructor(name, logService) {
        super(name, logService);
        this._folders = [];
        this._transient = false;
        this._settingsModelParser = new ConfigurationModelParser(name, logService);
        this._launchModel = ConfigurationModel.createEmptyModel(logService);
        this._tasksModel = ConfigurationModel.createEmptyModel(logService);
    }
    get folders() {
        return this._folders;
    }
    get transient() {
        return this._transient;
    }
    get settingsModel() {
        return this._settingsModelParser.configurationModel;
    }
    get launchModel() {
        return this._launchModel;
    }
    get tasksModel() {
        return this._tasksModel;
    }
    reparseWorkspaceSettings(configurationParseOptions) {
        this._settingsModelParser.reparse(configurationParseOptions);
    }
    getRestrictedWorkspaceSettings() {
        return this._settingsModelParser.restrictedConfigurations;
    }
    doParseRaw(raw, configurationParseOptions) {
        this._folders = (raw['folders'] || []);
        this._transient = isBoolean(raw['transient']) && raw['transient'];
        this._settingsModelParser.parseRaw(raw['settings'], configurationParseOptions);
        this._launchModel = this.createConfigurationModelFrom(raw, 'launch');
        this._tasksModel = this.createConfigurationModelFrom(raw, 'tasks');
        return super.doParseRaw(raw, configurationParseOptions);
    }
    createConfigurationModelFrom(raw, key) {
        const data = raw[key];
        if (data) {
            const contents = toValuesTree(data, message => console.error(`Conflict in settings file ${this._name}: ${message}`));
            const scopedContents = Object.create(null);
            scopedContents[key] = contents;
            const keys = Object.keys(data).map(k => `${key}.${k}`);
            return new ConfigurationModel(scopedContents, keys, [], undefined, this.logService);
        }
        return ConfigurationModel.createEmptyModel(this.logService);
    }
}
export class StandaloneConfigurationModelParser extends ConfigurationModelParser {
    constructor(name, scope, logService) {
        super(name, logService);
        this.scope = scope;
    }
    doParseRaw(raw, configurationParseOptions) {
        const contents = toValuesTree(raw, message => console.error(`Conflict in settings file ${this._name}: ${message}`));
        const scopedContents = Object.create(null);
        scopedContents[this.scope] = contents;
        const keys = Object.keys(raw).map(key => `${this.scope}.${key}`);
        return { contents: scopedContents, keys, overrides: [] };
    }
}
export class Configuration extends BaseConfiguration {
    constructor(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource, _workspace, logService) {
        super(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource, logService);
        this._workspace = _workspace;
    }
    getValue(key, overrides = {}) {
        return super.getValue(key, overrides, this._workspace);
    }
    inspect(key, overrides = {}) {
        return super.inspect(key, overrides, this._workspace);
    }
    keys() {
        return super.keys(this._workspace);
    }
    compareAndDeleteFolderConfiguration(folder) {
        if (this._workspace && this._workspace.folders.length > 0 && this._workspace.folders[0].uri.toString() === folder.toString()) {
            // Do not remove workspace configuration
            return { keys: [], overrides: [] };
        }
        return super.compareAndDeleteFolderConfiguration(folder);
    }
    compare(other) {
        const compare = (fromKeys, toKeys, overrideIdentifier) => {
            const keys = [];
            keys.push(...toKeys.filter(key => fromKeys.indexOf(key) === -1));
            keys.push(...fromKeys.filter(key => toKeys.indexOf(key) === -1));
            keys.push(...fromKeys.filter(key => {
                // Ignore if the key does not exist in both models
                if (toKeys.indexOf(key) === -1) {
                    return false;
                }
                // Compare workspace value
                if (!equals(this.getValue(key, { overrideIdentifier }), other.getValue(key, { overrideIdentifier }))) {
                    return true;
                }
                // Compare workspace folder value
                return this._workspace && this._workspace.folders.some(folder => !equals(this.getValue(key, { resource: folder.uri, overrideIdentifier }), other.getValue(key, { resource: folder.uri, overrideIdentifier })));
            }));
            return keys;
        };
        const keys = compare(this.allKeys(), other.allKeys());
        const overrides = [];
        const allOverrideIdentifiers = distinct([...this.allOverrideIdentifiers(), ...other.allOverrideIdentifiers()]);
        for (const overrideIdentifier of allOverrideIdentifiers) {
            const keys = compare(this.getAllKeysForOverrideIdentifier(overrideIdentifier), other.getAllKeysForOverrideIdentifier(overrideIdentifier), overrideIdentifier);
            if (keys.length) {
                overrides.push([overrideIdentifier, keys]);
            }
        }
        return { keys, overrides };
    }
}
