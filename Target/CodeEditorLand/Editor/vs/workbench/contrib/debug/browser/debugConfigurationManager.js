/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { distinct } from '../../../../base/common/arrays.js';
import { sequence } from '../../../../base/common/async.js';
import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import * as json from '../../../../base/common/json.js';
import { DisposableStore, dispose } from '../../../../base/common/lifecycle.js';
import * as objects from '../../../../base/common/objects.js';
import * as resources from '../../../../base/common/resources.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI as uri } from '../../../../base/common/uri.js';
import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Extensions as JSONExtensions } from '../../../../platform/jsonschemas/common/jsonContributionRegistry.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { debugConfigure } from './debugIcons.js';
import { CONTEXT_DEBUG_CONFIGURATION_TYPE, DebugConfigurationProviderTriggerKind } from '../common/debug.js';
import { launchSchema } from '../common/debugSchemas.js';
import { getVisibleAndSorted } from '../common/debugUtils.js';
import { launchSchemaId } from '../../../services/configuration/common/configuration.js';
import { ACTIVE_GROUP, IEditorService } from '../../../services/editor/common/editorService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
const jsonRegistry = Registry.as(JSONExtensions.JSONContribution);
jsonRegistry.registerSchema(launchSchemaId, launchSchema);
const DEBUG_SELECTED_CONFIG_NAME_KEY = 'debug.selectedconfigname';
const DEBUG_SELECTED_ROOT = 'debug.selectedroot';
// Debug type is only stored if a dynamic configuration is used for better restore
const DEBUG_SELECTED_TYPE = 'debug.selectedtype';
const DEBUG_RECENT_DYNAMIC_CONFIGURATIONS = 'debug.recentdynamicconfigurations';
let ConfigurationManager = class ConfigurationManager {
    constructor(adapterManager, contextService, configurationService, quickInputService, instantiationService, storageService, extensionService, historyService, uriIdentityService, contextKeyService, logService) {
        this.adapterManager = adapterManager;
        this.contextService = contextService;
        this.configurationService = configurationService;
        this.quickInputService = quickInputService;
        this.instantiationService = instantiationService;
        this.storageService = storageService;
        this.extensionService = extensionService;
        this.historyService = historyService;
        this.uriIdentityService = uriIdentityService;
        this.logService = logService;
        this.getSelectedConfig = () => Promise.resolve(undefined);
        this.selectedDynamic = false;
        this._onDidSelectConfigurationName = new Emitter();
        this._onDidChangeConfigurationProviders = new Emitter();
        this.onDidChangeConfigurationProviders = this._onDidChangeConfigurationProviders.event;
        this.configProviders = [];
        this.toDispose = [this._onDidChangeConfigurationProviders];
        this.initLaunches();
        this.setCompoundSchemaValues();
        this.registerListeners();
        const previousSelectedRoot = this.storageService.get(DEBUG_SELECTED_ROOT, 1 /* StorageScope.WORKSPACE */);
        const previousSelectedType = this.storageService.get(DEBUG_SELECTED_TYPE, 1 /* StorageScope.WORKSPACE */);
        const previousSelectedLaunch = this.launches.find(l => l.uri.toString() === previousSelectedRoot);
        const previousSelectedName = this.storageService.get(DEBUG_SELECTED_CONFIG_NAME_KEY, 1 /* StorageScope.WORKSPACE */);
        this.debugConfigurationTypeContext = CONTEXT_DEBUG_CONFIGURATION_TYPE.bindTo(contextKeyService);
        const dynamicConfig = previousSelectedType ? { type: previousSelectedType } : undefined;
        if (previousSelectedLaunch && previousSelectedLaunch.getConfigurationNames().length) {
            this.selectConfiguration(previousSelectedLaunch, previousSelectedName, undefined, dynamicConfig);
        }
        else if (this.launches.length > 0) {
            this.selectConfiguration(undefined, previousSelectedName, undefined, dynamicConfig);
        }
    }
    registerDebugConfigurationProvider(debugConfigurationProvider) {
        this.configProviders.push(debugConfigurationProvider);
        this._onDidChangeConfigurationProviders.fire();
        return {
            dispose: () => {
                this.unregisterDebugConfigurationProvider(debugConfigurationProvider);
                this._onDidChangeConfigurationProviders.fire();
            }
        };
    }
    unregisterDebugConfigurationProvider(debugConfigurationProvider) {
        const ix = this.configProviders.indexOf(debugConfigurationProvider);
        if (ix >= 0) {
            this.configProviders.splice(ix, 1);
        }
    }
    /**
     * if scope is not specified,a value of DebugConfigurationProvideTrigger.Initial is assumed.
     */
    hasDebugConfigurationProvider(debugType, triggerKind) {
        if (triggerKind === undefined) {
            triggerKind = DebugConfigurationProviderTriggerKind.Initial;
        }
        // check if there are providers for the given type that contribute a provideDebugConfigurations method
        const provider = this.configProviders.find(p => p.provideDebugConfigurations && (p.type === debugType) && (p.triggerKind === triggerKind));
        return !!provider;
    }
    async resolveConfigurationByProviders(folderUri, type, config, token) {
        const resolveDebugConfigurationForType = async (type, config) => {
            if (type !== '*') {
                await this.adapterManager.activateDebuggers('onDebugResolve', type);
            }
            for (const p of this.configProviders) {
                if (p.type === type && p.resolveDebugConfiguration && config) {
                    config = await p.resolveDebugConfiguration(folderUri, config, token);
                }
            }
            return config;
        };
        let resolvedType = config.type ?? type;
        let result = config;
        for (let seen = new Set(); result && !seen.has(resolvedType);) {
            seen.add(resolvedType);
            result = await resolveDebugConfigurationForType(resolvedType, result);
            result = await resolveDebugConfigurationForType('*', result);
            resolvedType = result?.type ?? type;
        }
        return result;
    }
    async resolveDebugConfigurationWithSubstitutedVariables(folderUri, type, config, token) {
        // pipe the config through the promises sequentially. Append at the end the '*' types
        const providers = this.configProviders.filter(p => p.type === type && p.resolveDebugConfigurationWithSubstitutedVariables)
            .concat(this.configProviders.filter(p => p.type === '*' && p.resolveDebugConfigurationWithSubstitutedVariables));
        let result = config;
        await sequence(providers.map(provider => async () => {
            // If any provider returned undefined or null make sure to respect that and do not pass the result to more resolver
            if (result) {
                result = await provider.resolveDebugConfigurationWithSubstitutedVariables(folderUri, result, token);
            }
        }));
        return result;
    }
    async provideDebugConfigurations(folderUri, type, token) {
        await this.adapterManager.activateDebuggers('onDebugInitialConfigurations');
        const results = await Promise.all(this.configProviders.filter(p => p.type === type && p.triggerKind === DebugConfigurationProviderTriggerKind.Initial && p.provideDebugConfigurations).map(p => p.provideDebugConfigurations(folderUri, token)));
        return results.reduce((first, second) => first.concat(second), []);
    }
    async getDynamicProviders() {
        await this.extensionService.whenInstalledExtensionsRegistered();
        const onDebugDynamicConfigurationsName = 'onDebugDynamicConfigurations';
        const debugDynamicExtensionsTypes = this.extensionService.extensions.reduce((acc, e) => {
            if (!e.activationEvents) {
                return acc;
            }
            const explicitTypes = [];
            let hasGenericEvent = false;
            for (const event of e.activationEvents) {
                if (event === onDebugDynamicConfigurationsName) {
                    hasGenericEvent = true;
                }
                else if (event.startsWith(`${onDebugDynamicConfigurationsName}:`)) {
                    explicitTypes.push(event.slice(onDebugDynamicConfigurationsName.length + 1));
                }
            }
            if (explicitTypes.length) {
                explicitTypes.forEach(t => acc.add(t));
            }
            else if (hasGenericEvent) {
                const debuggerType = e.contributes?.debuggers?.[0].type;
                if (debuggerType) {
                    acc.add(debuggerType);
                }
            }
            return acc;
        }, new Set());
        for (const configProvider of this.configProviders) {
            if (configProvider.triggerKind === DebugConfigurationProviderTriggerKind.Dynamic) {
                debugDynamicExtensionsTypes.add(configProvider.type);
            }
        }
        return [...debugDynamicExtensionsTypes].map(type => {
            return {
                label: this.adapterManager.getDebuggerLabel(type),
                getProvider: async () => {
                    await this.adapterManager.activateDebuggers(onDebugDynamicConfigurationsName, type);
                    return this.configProviders.find(p => p.type === type && p.triggerKind === DebugConfigurationProviderTriggerKind.Dynamic && p.provideDebugConfigurations);
                },
                type,
                pick: async () => {
                    // Do a late 'onDebugDynamicConfigurationsName' activation so extensions are not activated too early #108578
                    await this.adapterManager.activateDebuggers(onDebugDynamicConfigurationsName, type);
                    const token = new CancellationTokenSource();
                    const picks = [];
                    const provider = this.configProviders.find(p => p.type === type && p.triggerKind === DebugConfigurationProviderTriggerKind.Dynamic && p.provideDebugConfigurations);
                    this.getLaunches().forEach(launch => {
                        if (launch.workspace && provider) {
                            picks.push(provider.provideDebugConfigurations(launch.workspace.uri, token.token).then(configurations => configurations.map(config => ({
                                label: config.name,
                                description: launch.name,
                                config,
                                buttons: [{
                                        iconClass: ThemeIcon.asClassName(debugConfigure),
                                        tooltip: nls.localize('editLaunchConfig', "Edit Debug Configuration in launch.json")
                                    }],
                                launch
                            }))));
                        }
                    });
                    const disposables = new DisposableStore();
                    const input = disposables.add(this.quickInputService.createQuickPick());
                    input.busy = true;
                    input.placeholder = nls.localize('selectConfiguration', "Select Launch Configuration");
                    const chosenPromise = new Promise(resolve => {
                        disposables.add(input.onDidAccept(() => resolve(input.activeItems[0])));
                        disposables.add(input.onDidTriggerItemButton(async (context) => {
                            resolve(undefined);
                            const { launch, config } = context.item;
                            await launch.openConfigFile({ preserveFocus: false, type: config.type, suppressInitialConfigs: true });
                            // Only Launch have a pin trigger button
                            await launch.writeConfiguration(config);
                            await this.selectConfiguration(launch, config.name);
                            this.removeRecentDynamicConfigurations(config.name, config.type);
                        }));
                        disposables.add(input.onDidHide(() => resolve(undefined)));
                    });
                    let nestedPicks;
                    try {
                        // This await invokes the extension providers, which might fail due to several reasons,
                        // therefore we gate this logic under a try/catch to prevent leaving the Debug Tab
                        // selector in a borked state.
                        nestedPicks = await Promise.all(picks);
                    }
                    catch (err) {
                        this.logService.error(err);
                        disposables.dispose();
                        return;
                    }
                    const items = nestedPicks.flat();
                    input.items = items;
                    input.busy = false;
                    input.show();
                    const chosen = await chosenPromise;
                    disposables.dispose();
                    if (!chosen) {
                        // User canceled quick input we should notify the provider to cancel computing configurations
                        token.cancel();
                        return;
                    }
                    return chosen;
                }
            };
        });
    }
    getAllConfigurations() {
        const all = [];
        for (const l of this.launches) {
            for (const name of l.getConfigurationNames()) {
                const config = l.getConfiguration(name) || l.getCompound(name);
                if (config) {
                    all.push({ launch: l, name, presentation: config.presentation });
                }
            }
        }
        return getVisibleAndSorted(all);
    }
    removeRecentDynamicConfigurations(name, type) {
        const remaining = this.getRecentDynamicConfigurations().filter(c => c.name !== name || c.type !== type);
        this.storageService.store(DEBUG_RECENT_DYNAMIC_CONFIGURATIONS, JSON.stringify(remaining), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        if (this.selectedConfiguration.name === name && this.selectedType === type && this.selectedDynamic) {
            this.selectConfiguration(undefined, undefined);
        }
        else {
            this._onDidSelectConfigurationName.fire();
        }
    }
    getRecentDynamicConfigurations() {
        return JSON.parse(this.storageService.get(DEBUG_RECENT_DYNAMIC_CONFIGURATIONS, 1 /* StorageScope.WORKSPACE */, '[]'));
    }
    registerListeners() {
        this.toDispose.push(Event.any(this.contextService.onDidChangeWorkspaceFolders, this.contextService.onDidChangeWorkbenchState)(() => {
            this.initLaunches();
            this.selectConfiguration(undefined);
            this.setCompoundSchemaValues();
        }));
        this.toDispose.push(this.configurationService.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('launch')) {
                // A change happen in the launch.json. If there is already a launch configuration selected, do not change the selection.
                await this.selectConfiguration(undefined);
                this.setCompoundSchemaValues();
            }
        }));
        this.toDispose.push(this.adapterManager.onDidDebuggersExtPointRead(() => {
            this.setCompoundSchemaValues();
        }));
    }
    initLaunches() {
        this.launches = this.contextService.getWorkspace().folders.map(folder => this.instantiationService.createInstance(Launch, this, this.adapterManager, folder));
        if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
            this.launches.push(this.instantiationService.createInstance(WorkspaceLaunch, this, this.adapterManager));
        }
        this.launches.push(this.instantiationService.createInstance(UserLaunch, this, this.adapterManager));
        if (this.selectedLaunch && this.launches.indexOf(this.selectedLaunch) === -1) {
            this.selectConfiguration(undefined);
        }
    }
    setCompoundSchemaValues() {
        const compoundConfigurationsSchema = launchSchema.properties['compounds'].items.properties['configurations'];
        const launchNames = this.launches.map(l => l.getConfigurationNames(true)).reduce((first, second) => first.concat(second), []);
        compoundConfigurationsSchema.items.oneOf[0].enum = launchNames;
        compoundConfigurationsSchema.items.oneOf[1].properties.name.enum = launchNames;
        const folderNames = this.contextService.getWorkspace().folders.map(f => f.name);
        compoundConfigurationsSchema.items.oneOf[1].properties.folder.enum = folderNames;
        jsonRegistry.registerSchema(launchSchemaId, launchSchema);
    }
    getLaunches() {
        return this.launches;
    }
    getLaunch(workspaceUri) {
        if (!uri.isUri(workspaceUri)) {
            return undefined;
        }
        return this.launches.find(l => l.workspace && this.uriIdentityService.extUri.isEqual(l.workspace.uri, workspaceUri));
    }
    get selectedConfiguration() {
        return {
            launch: this.selectedLaunch,
            name: this.selectedName,
            getConfig: this.getSelectedConfig,
            type: this.selectedType
        };
    }
    get onDidSelectConfiguration() {
        return this._onDidSelectConfigurationName.event;
    }
    getWorkspaceLaunch() {
        if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
            return this.launches[this.launches.length - 1];
        }
        return undefined;
    }
    async selectConfiguration(launch, name, config, dynamicConfig) {
        if (typeof launch === 'undefined') {
            const rootUri = this.historyService.getLastActiveWorkspaceRoot();
            launch = this.getLaunch(rootUri);
            if (!launch || launch.getConfigurationNames().length === 0) {
                launch = this.launches.find(l => !!(l && l.getConfigurationNames().length)) || launch || this.launches[0];
            }
        }
        const previousLaunch = this.selectedLaunch;
        const previousName = this.selectedName;
        const previousSelectedDynamic = this.selectedDynamic;
        this.selectedLaunch = launch;
        if (this.selectedLaunch) {
            this.storageService.store(DEBUG_SELECTED_ROOT, this.selectedLaunch.uri.toString(), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        else {
            this.storageService.remove(DEBUG_SELECTED_ROOT, 1 /* StorageScope.WORKSPACE */);
        }
        const names = launch ? launch.getConfigurationNames() : [];
        this.getSelectedConfig = () => {
            const selected = this.selectedName ? launch?.getConfiguration(this.selectedName) : undefined;
            return Promise.resolve(selected || config);
        };
        let type = config?.type;
        if (name && names.indexOf(name) >= 0) {
            this.setSelectedLaunchName(name);
        }
        else if (dynamicConfig && dynamicConfig.type) {
            // We could not find the previously used name and config is not passed. We should get all dynamic configurations from providers
            // And potentially auto select the previously used dynamic configuration #96293
            type = dynamicConfig.type;
            if (!config) {
                const providers = (await this.getDynamicProviders()).filter(p => p.type === type);
                this.getSelectedConfig = async () => {
                    const activatedProviders = await Promise.all(providers.map(p => p.getProvider()));
                    const provider = activatedProviders.length > 0 ? activatedProviders[0] : undefined;
                    if (provider && launch && launch.workspace) {
                        const token = new CancellationTokenSource();
                        const dynamicConfigs = await provider.provideDebugConfigurations(launch.workspace.uri, token.token);
                        const dynamicConfig = dynamicConfigs.find(c => c.name === name);
                        if (dynamicConfig) {
                            return dynamicConfig;
                        }
                    }
                    return undefined;
                };
            }
            this.setSelectedLaunchName(name);
            let recentDynamicProviders = this.getRecentDynamicConfigurations();
            if (name && dynamicConfig.type) {
                // We need to store the recently used dynamic configurations to be able to show them in UI #110009
                recentDynamicProviders.unshift({ name, type: dynamicConfig.type });
                recentDynamicProviders = distinct(recentDynamicProviders, t => `${t.name} : ${t.type}`);
                this.storageService.store(DEBUG_RECENT_DYNAMIC_CONFIGURATIONS, JSON.stringify(recentDynamicProviders), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
            }
        }
        else if (!this.selectedName || names.indexOf(this.selectedName) === -1) {
            // We could not find the configuration to select, pick the first one, or reset the selection if there is no launch configuration
            const nameToSet = names.length ? names[0] : undefined;
            this.setSelectedLaunchName(nameToSet);
        }
        if (!config && launch && this.selectedName) {
            config = launch.getConfiguration(this.selectedName);
            type = config?.type;
        }
        this.selectedType = dynamicConfig?.type || config?.type;
        this.selectedDynamic = !!dynamicConfig;
        // Only store the selected type if we are having a dynamic configuration. Otherwise restoring this configuration from storage might be misindentified as a dynamic configuration
        this.storageService.store(DEBUG_SELECTED_TYPE, dynamicConfig ? this.selectedType : undefined, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        if (type) {
            this.debugConfigurationTypeContext.set(type);
        }
        else {
            this.debugConfigurationTypeContext.reset();
        }
        if (this.selectedLaunch !== previousLaunch || this.selectedName !== previousName || previousSelectedDynamic !== this.selectedDynamic) {
            this._onDidSelectConfigurationName.fire();
        }
    }
    setSelectedLaunchName(selectedName) {
        this.selectedName = selectedName;
        if (this.selectedName) {
            this.storageService.store(DEBUG_SELECTED_CONFIG_NAME_KEY, this.selectedName, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        else {
            this.storageService.remove(DEBUG_SELECTED_CONFIG_NAME_KEY, 1 /* StorageScope.WORKSPACE */);
        }
    }
    dispose() {
        this.toDispose = dispose(this.toDispose);
    }
};
ConfigurationManager = __decorate([
    __param(1, IWorkspaceContextService),
    __param(2, IConfigurationService),
    __param(3, IQuickInputService),
    __param(4, IInstantiationService),
    __param(5, IStorageService),
    __param(6, IExtensionService),
    __param(7, IHistoryService),
    __param(8, IUriIdentityService),
    __param(9, IContextKeyService),
    __param(10, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ConfigurationManager);
export { ConfigurationManager };
class AbstractLaunch {
    constructor(configurationManager, adapterManager) {
        this.configurationManager = configurationManager;
        this.adapterManager = adapterManager;
    }
    getCompound(name) {
        const config = this.getConfig();
        if (!config || !config.compounds) {
            return undefined;
        }
        return config.compounds.find(compound => compound.name === name);
    }
    getConfigurationNames(ignoreCompoundsAndPresentation = false) {
        const config = this.getConfig();
        if (!config || (!Array.isArray(config.configurations) && !Array.isArray(config.compounds))) {
            return [];
        }
        else {
            const configurations = [];
            if (config.configurations) {
                configurations.push(...config.configurations.filter(cfg => cfg && typeof cfg.name === 'string'));
            }
            if (ignoreCompoundsAndPresentation) {
                return configurations.map(c => c.name);
            }
            if (config.compounds) {
                configurations.push(...config.compounds.filter(compound => typeof compound.name === 'string' && compound.configurations && compound.configurations.length));
            }
            return getVisibleAndSorted(configurations).map(c => c.name);
        }
    }
    getConfiguration(name) {
        // We need to clone the configuration in order to be able to make changes to it #42198
        const config = objects.deepClone(this.getConfig());
        if (!config || !config.configurations) {
            return undefined;
        }
        const configuration = config.configurations.find(config => config && config.name === name);
        if (configuration) {
            if (this instanceof UserLaunch) {
                configuration.__configurationTarget = 2 /* ConfigurationTarget.USER */;
            }
            else if (this instanceof WorkspaceLaunch) {
                configuration.__configurationTarget = 5 /* ConfigurationTarget.WORKSPACE */;
            }
            else {
                configuration.__configurationTarget = 6 /* ConfigurationTarget.WORKSPACE_FOLDER */;
            }
        }
        return configuration;
    }
    async getInitialConfigurationContent(folderUri, type, useInitialConfigs, token) {
        let content = '';
        const adapter = type ? this.adapterManager.getEnabledDebugger(type) : await this.adapterManager.guessDebugger(true);
        if (adapter) {
            const initialConfigs = useInitialConfigs ?
                await this.configurationManager.provideDebugConfigurations(folderUri, adapter.type, token || CancellationToken.None) :
                [];
            content = await adapter.getInitialConfigurationContent(initialConfigs);
        }
        return content;
    }
    get hidden() {
        return false;
    }
}
let Launch = class Launch extends AbstractLaunch {
    constructor(configurationManager, adapterManager, workspace, fileService, textFileService, editorService, configurationService) {
        super(configurationManager, adapterManager);
        this.workspace = workspace;
        this.fileService = fileService;
        this.textFileService = textFileService;
        this.editorService = editorService;
        this.configurationService = configurationService;
    }
    get uri() {
        return resources.joinPath(this.workspace.uri, '/.vscode/launch.json');
    }
    get name() {
        return this.workspace.name;
    }
    getConfig() {
        return this.configurationService.inspect('launch', { resource: this.workspace.uri }).workspaceFolderValue;
    }
    async openConfigFile({ preserveFocus, type, suppressInitialConfigs }, token) {
        const resource = this.uri;
        let created = false;
        let content = '';
        try {
            const fileContent = await this.fileService.readFile(resource);
            content = fileContent.value.toString();
        }
        catch {
            // launch.json not found: create one by collecting launch configs from debugConfigProviders
            content = await this.getInitialConfigurationContent(this.workspace.uri, type, !suppressInitialConfigs, token);
            if (!content) {
                // Cancelled
                return { editor: null, created: false };
            }
            created = true; // pin only if config file is created #8727
            try {
                await this.textFileService.write(resource, content);
            }
            catch (error) {
                throw new Error(nls.localize('DebugConfig.failed', "Unable to create 'launch.json' file inside the '.vscode' folder ({0}).", error.message));
            }
        }
        const index = content.indexOf(`"${this.configurationManager.selectedConfiguration.name}"`);
        let startLineNumber = 1;
        for (let i = 0; i < index; i++) {
            if (content.charAt(i) === '\n') {
                startLineNumber++;
            }
        }
        const selection = startLineNumber > 1 ? { startLineNumber, startColumn: 4 } : undefined;
        const editor = await this.editorService.openEditor({
            resource,
            options: {
                selection,
                preserveFocus,
                pinned: created,
                revealIfVisible: true
            },
        }, ACTIVE_GROUP);
        return ({
            editor: editor ?? null,
            created
        });
    }
    async writeConfiguration(configuration) {
        const fullConfig = objects.deepClone(this.getConfig());
        if (!fullConfig.configurations) {
            fullConfig.configurations = [];
        }
        fullConfig.configurations.push(configuration);
        await this.configurationService.updateValue('launch', fullConfig, { resource: this.workspace.uri }, 6 /* ConfigurationTarget.WORKSPACE_FOLDER */);
    }
};
Launch = __decorate([
    __param(3, IFileService),
    __param(4, ITextFileService),
    __param(5, IEditorService),
    __param(6, IConfigurationService),
    __metadata("design:paramtypes", [ConfigurationManager, Object, Object, Object, Object, Object, Object])
], Launch);
let WorkspaceLaunch = class WorkspaceLaunch extends AbstractLaunch {
    constructor(configurationManager, adapterManager, editorService, configurationService, contextService) {
        super(configurationManager, adapterManager);
        this.editorService = editorService;
        this.configurationService = configurationService;
        this.contextService = contextService;
    }
    get workspace() {
        return undefined;
    }
    get uri() {
        return this.contextService.getWorkspace().configuration;
    }
    get name() {
        return nls.localize('workspace', "workspace");
    }
    getConfig() {
        return this.configurationService.inspect('launch').workspaceValue;
    }
    async openConfigFile({ preserveFocus, type, useInitialConfigs }, token) {
        const launchExistInFile = !!this.getConfig();
        if (!launchExistInFile) {
            // Launch property in workspace config not found: create one by collecting launch configs from debugConfigProviders
            const content = await this.getInitialConfigurationContent(undefined, type, useInitialConfigs, token);
            if (content) {
                await this.configurationService.updateValue('launch', json.parse(content), 5 /* ConfigurationTarget.WORKSPACE */);
            }
            else {
                return { editor: null, created: false };
            }
        }
        const editor = await this.editorService.openEditor({
            resource: this.contextService.getWorkspace().configuration,
            options: { preserveFocus }
        }, ACTIVE_GROUP);
        return ({
            editor: editor ?? null,
            created: false
        });
    }
};
WorkspaceLaunch = __decorate([
    __param(2, IEditorService),
    __param(3, IConfigurationService),
    __param(4, IWorkspaceContextService),
    __metadata("design:paramtypes", [ConfigurationManager, Object, Object, Object, Object])
], WorkspaceLaunch);
let UserLaunch = class UserLaunch extends AbstractLaunch {
    constructor(configurationManager, adapterManager, configurationService, preferencesService) {
        super(configurationManager, adapterManager);
        this.configurationService = configurationService;
        this.preferencesService = preferencesService;
    }
    get workspace() {
        return undefined;
    }
    get uri() {
        return this.preferencesService.userSettingsResource;
    }
    get name() {
        return nls.localize('user settings', "user settings");
    }
    get hidden() {
        return true;
    }
    getConfig() {
        return this.configurationService.inspect('launch').userValue;
    }
    async openConfigFile({ preserveFocus, type, useInitialContent }) {
        const editor = await this.preferencesService.openUserSettings({ jsonEditor: true, preserveFocus, revealSetting: { key: 'launch' } });
        return ({
            editor: editor ?? null,
            created: false
        });
    }
};
UserLaunch = __decorate([
    __param(2, IConfigurationService),
    __param(3, IPreferencesService),
    __metadata("design:paramtypes", [ConfigurationManager, Object, Object, Object])
], UserLaunch);
