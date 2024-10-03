import { distinct, equals as arrayEquals } from '../../../base/common/arrays.js';
import { Queue, RunOnceScheduler } from '../../../base/common/async.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { Emitter } from '../../../base/common/event.js';
import { parse } from '../../../base/common/json.js';
import { applyEdits, setProperty } from '../../../base/common/jsonEdit.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../base/common/map.js';
import { equals } from '../../../base/common/objects.js';
import { OS } from '../../../base/common/platform.js';
import { extUriBiasedIgnorePathCase } from '../../../base/common/resources.js';
import { isConfigurationOverrides, isConfigurationUpdateOverrides } from './configuration.js';
import { Configuration, ConfigurationChangeEvent, ConfigurationModel, UserSettings } from './configurationModels.js';
import { keyFromOverrideIdentifiers } from './configurationRegistry.js';
import { DefaultConfiguration, NullPolicyConfiguration, PolicyConfiguration } from './configurations.js';
import { NullPolicyService } from '../../policy/common/policy.js';
export class ConfigurationService extends Disposable {
    constructor(settingsResource, fileService, policyService, logService) {
        super();
        this.settingsResource = settingsResource;
        this.logService = logService;
        this._onDidChangeConfiguration = this._register(new Emitter());
        this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
        this.defaultConfiguration = this._register(new DefaultConfiguration(logService));
        this.policyConfiguration = policyService instanceof NullPolicyService ? new NullPolicyConfiguration() : this._register(new PolicyConfiguration(this.defaultConfiguration, policyService, logService));
        this.userConfiguration = this._register(new UserSettings(this.settingsResource, {}, extUriBiasedIgnorePathCase, fileService, logService));
        this.configuration = new Configuration(this.defaultConfiguration.configurationModel, this.policyConfiguration.configurationModel, ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), new ResourceMap(), ConfigurationModel.createEmptyModel(logService), new ResourceMap(), logService);
        this.configurationEditing = new ConfigurationEditing(settingsResource, fileService, this);
        this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.reloadConfiguration(), 50));
        this._register(this.defaultConfiguration.onDidChangeConfiguration(({ defaults, properties }) => this.onDidDefaultConfigurationChange(defaults, properties)));
        this._register(this.policyConfiguration.onDidChangeConfiguration(model => this.onDidPolicyConfigurationChange(model)));
        this._register(this.userConfiguration.onDidChange(() => this.reloadConfigurationScheduler.schedule()));
    }
    async initialize() {
        const [defaultModel, policyModel, userModel] = await Promise.all([this.defaultConfiguration.initialize(), this.policyConfiguration.initialize(), this.userConfiguration.loadConfiguration()]);
        this.configuration = new Configuration(defaultModel, policyModel, ConfigurationModel.createEmptyModel(this.logService), userModel, ConfigurationModel.createEmptyModel(this.logService), ConfigurationModel.createEmptyModel(this.logService), new ResourceMap(), ConfigurationModel.createEmptyModel(this.logService), new ResourceMap(), this.logService);
    }
    getConfigurationData() {
        return this.configuration.toData();
    }
    getValue(arg1, arg2) {
        const section = typeof arg1 === 'string' ? arg1 : undefined;
        const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : {};
        return this.configuration.getValue(section, overrides, undefined);
    }
    async updateValue(key, value, arg3, arg4, options) {
        const overrides = isConfigurationUpdateOverrides(arg3) ? arg3
            : isConfigurationOverrides(arg3) ? { resource: arg3.resource, overrideIdentifiers: arg3.overrideIdentifier ? [arg3.overrideIdentifier] : undefined } : undefined;
        const target = overrides ? arg4 : arg3;
        if (target !== undefined) {
            if (target !== 3 && target !== 2) {
                throw new Error(`Unable to write ${key} to target ${target}.`);
            }
        }
        if (overrides?.overrideIdentifiers) {
            overrides.overrideIdentifiers = distinct(overrides.overrideIdentifiers);
            overrides.overrideIdentifiers = overrides.overrideIdentifiers.length ? overrides.overrideIdentifiers : undefined;
        }
        const inspect = this.inspect(key, { resource: overrides?.resource, overrideIdentifier: overrides?.overrideIdentifiers ? overrides.overrideIdentifiers[0] : undefined });
        if (inspect.policyValue !== undefined) {
            throw new Error(`Unable to write ${key} because it is configured in system policy.`);
        }
        if (equals(value, inspect.defaultValue)) {
            value = undefined;
        }
        if (overrides?.overrideIdentifiers?.length && overrides.overrideIdentifiers.length > 1) {
            const overrideIdentifiers = overrides.overrideIdentifiers.sort();
            const existingOverrides = this.configuration.localUserConfiguration.overrides.find(override => arrayEquals([...override.identifiers].sort(), overrideIdentifiers));
            if (existingOverrides) {
                overrides.overrideIdentifiers = existingOverrides.identifiers;
            }
        }
        const path = overrides?.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key] : [key];
        await this.configurationEditing.write(path, value);
        await this.reloadConfiguration();
    }
    inspect(key, overrides = {}) {
        return this.configuration.inspect(key, overrides, undefined);
    }
    keys() {
        return this.configuration.keys(undefined);
    }
    async reloadConfiguration() {
        const configurationModel = await this.userConfiguration.loadConfiguration();
        this.onDidChangeUserConfiguration(configurationModel);
    }
    onDidChangeUserConfiguration(userConfigurationModel) {
        const previous = this.configuration.toData();
        const change = this.configuration.compareAndUpdateLocalUserConfiguration(userConfigurationModel);
        this.trigger(change, previous, 2);
    }
    onDidDefaultConfigurationChange(defaultConfigurationModel, properties) {
        const previous = this.configuration.toData();
        const change = this.configuration.compareAndUpdateDefaultConfiguration(defaultConfigurationModel, properties);
        this.trigger(change, previous, 7);
    }
    onDidPolicyConfigurationChange(policyConfiguration) {
        const previous = this.configuration.toData();
        const change = this.configuration.compareAndUpdatePolicyConfiguration(policyConfiguration);
        this.trigger(change, previous, 7);
    }
    trigger(configurationChange, previous, source) {
        const event = new ConfigurationChangeEvent(configurationChange, { data: previous }, this.configuration, undefined, this.logService);
        event.source = source;
        this._onDidChangeConfiguration.fire(event);
    }
}
class ConfigurationEditing {
    constructor(settingsResource, fileService, configurationService) {
        this.settingsResource = settingsResource;
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.queue = new Queue();
    }
    write(path, value) {
        return this.queue.queue(() => this.doWriteConfiguration(path, value));
    }
    async doWriteConfiguration(path, value) {
        let content;
        try {
            const fileContent = await this.fileService.readFile(this.settingsResource);
            content = fileContent.value.toString();
        }
        catch (error) {
            if (error.fileOperationResult === 1) {
                content = '{}';
            }
            else {
                throw error;
            }
        }
        const parseErrors = [];
        parse(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
        if (parseErrors.length > 0) {
            throw new Error('Unable to write into the settings file. Please open the file to correct errors/warnings in the file and try again.');
        }
        const edits = this.getEdits(content, path, value);
        content = applyEdits(content, edits);
        await this.fileService.writeFile(this.settingsResource, VSBuffer.fromString(content));
    }
    getEdits(content, path, value) {
        const { tabSize, insertSpaces, eol } = this.formattingOptions;
        if (!path.length) {
            const content = JSON.stringify(value, null, insertSpaces ? ' '.repeat(tabSize) : '\t');
            return [{
                    content,
                    length: content.length,
                    offset: 0
                }];
        }
        return setProperty(content, path, value, { tabSize, insertSpaces, eol });
    }
    get formattingOptions() {
        if (!this._formattingOptions) {
            let eol = OS === 3 || OS === 2 ? '\n' : '\r\n';
            const configuredEol = this.configurationService.getValue('files.eol', { overrideIdentifier: 'jsonc' });
            if (configuredEol && typeof configuredEol === 'string' && configuredEol !== 'auto') {
                eol = configuredEol;
            }
            this._formattingOptions = {
                eol,
                insertSpaces: !!this.configurationService.getValue('editor.insertSpaces', { overrideIdentifier: 'jsonc' }),
                tabSize: this.configurationService.getValue('editor.tabSize', { overrideIdentifier: 'jsonc' })
            };
        }
        return this._formattingOptions;
    }
}
