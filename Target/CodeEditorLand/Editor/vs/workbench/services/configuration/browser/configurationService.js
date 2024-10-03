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
import { URI } from '../../../../base/common/uri.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { equals } from '../../../../base/common/objects.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { Queue, Barrier, Promises, Delayer } from '../../../../base/common/async.js';
import { Extensions as JSONExtensions } from '../../../../platform/jsonschemas/common/jsonContributionRegistry.js';
import { IWorkspaceContextService, Workspace as BaseWorkspace, toWorkspaceFolder, isWorkspaceFolder, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
import { ConfigurationModel, ConfigurationChangeEvent, mergeChanges } from '../../../../platform/configuration/common/configurationModels.js';
import { isConfigurationOverrides, ConfigurationTargetToString, isConfigurationUpdateOverrides, IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { NullPolicyConfiguration, PolicyConfiguration } from '../../../../platform/configuration/common/configurations.js';
import { Configuration } from '../common/configurationModels.js';
import { FOLDER_CONFIG_FOLDER_NAME, defaultSettingsSchemaId, userSettingsSchemaId, workspaceSettingsSchemaId, folderSettingsSchemaId, machineSettingsSchemaId, LOCAL_MACHINE_SCOPES, PROFILE_SCOPES, LOCAL_MACHINE_PROFILE_SCOPES, profileSettingsSchemaId, APPLY_ALL_PROFILES_SETTING } from '../common/configuration.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions, allSettings, windowSettings, resourceSettings, applicationSettings, machineSettings, machineOverridableSettings, keyFromOverrideIdentifiers, OVERRIDE_PROPERTY_PATTERN, resourceLanguageSettingsSchemaId, configurationDefaultsSchemaId } from '../../../../platform/configuration/common/configurationRegistry.js';
import { isStoredWorkspaceFolder, getStoredWorkspaceFolder, toWorkspaceFolders } from '../../../../platform/workspaces/common/workspaces.js';
import { ConfigurationEditing } from '../common/configurationEditing.js';
import { WorkspaceConfiguration, FolderConfiguration, RemoteUserConfiguration, UserConfiguration, DefaultConfiguration, ApplicationConfiguration } from './configuration.js';
import { mark } from '../../../../base/common/performance.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { delta, distinct, equals as arrayEquals } from '../../../../base/common/arrays.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IWorkbenchAssignmentService } from '../../assignment/common/assignmentService.js';
import { isUndefined } from '../../../../base/common/types.js';
import { localize } from '../../../../nls.js';
import { NullPolicyService } from '../../../../platform/policy/common/policy.js';
import { IJSONEditingService } from '../common/jsonEditing.js';
import { workbenchConfigurationNodeBase } from '../../../common/configuration.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { runWhenWindowIdle } from '../../../../base/browser/dom.js';
function getLocalUserConfigurationScopes(userDataProfile, hasRemote) {
    return (userDataProfile.isDefault || userDataProfile.useDefaultFlags?.settings)
        ? hasRemote ? LOCAL_MACHINE_SCOPES : undefined
        : hasRemote ? LOCAL_MACHINE_PROFILE_SCOPES : PROFILE_SCOPES;
}
class Workspace extends BaseWorkspace {
    constructor() {
        super(...arguments);
        this.initialized = false;
    }
}
export class WorkspaceService extends Disposable {
    get restrictedSettings() { return this._restrictedSettings; }
    constructor({ remoteAuthority, configurationCache }, environmentService, userDataProfileService, userDataProfilesService, fileService, remoteAgentService, uriIdentityService, logService, policyService) {
        super();
        this.userDataProfileService = userDataProfileService;
        this.userDataProfilesService = userDataProfilesService;
        this.fileService = fileService;
        this.remoteAgentService = remoteAgentService;
        this.uriIdentityService = uriIdentityService;
        this.logService = logService;
        this.initialized = false;
        this.applicationConfiguration = null;
        this.remoteUserConfiguration = null;
        this._onDidChangeConfiguration = this._register(new Emitter());
        this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
        this._onWillChangeWorkspaceFolders = this._register(new Emitter());
        this.onWillChangeWorkspaceFolders = this._onWillChangeWorkspaceFolders.event;
        this._onDidChangeWorkspaceFolders = this._register(new Emitter());
        this.onDidChangeWorkspaceFolders = this._onDidChangeWorkspaceFolders.event;
        this._onDidChangeWorkspaceName = this._register(new Emitter());
        this.onDidChangeWorkspaceName = this._onDidChangeWorkspaceName.event;
        this._onDidChangeWorkbenchState = this._register(new Emitter());
        this.onDidChangeWorkbenchState = this._onDidChangeWorkbenchState.event;
        this.isWorkspaceTrusted = true;
        this._restrictedSettings = { default: [] };
        this._onDidChangeRestrictedSettings = this._register(new Emitter());
        this.onDidChangeRestrictedSettings = this._onDidChangeRestrictedSettings.event;
        this.configurationRegistry = Registry.as(Extensions.Configuration);
        this.initRemoteUserConfigurationBarrier = new Barrier();
        this.completeWorkspaceBarrier = new Barrier();
        this.defaultConfiguration = this._register(new DefaultConfiguration(configurationCache, environmentService, logService));
        this.policyConfiguration = policyService instanceof NullPolicyService ? new NullPolicyConfiguration() : this._register(new PolicyConfiguration(this.defaultConfiguration, policyService, logService));
        this.configurationCache = configurationCache;
        this._configuration = new Configuration(this.defaultConfiguration.configurationModel, this.policyConfiguration.configurationModel, ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), ConfigurationModel.createEmptyModel(logService), new ResourceMap(), ConfigurationModel.createEmptyModel(logService), new ResourceMap(), this.workspace, logService);
        this.applicationConfigurationDisposables = this._register(new DisposableStore());
        this.createApplicationConfiguration();
        this.localUserConfiguration = this._register(new UserConfiguration(userDataProfileService.currentProfile.settingsResource, userDataProfileService.currentProfile.tasksResource, { scopes: getLocalUserConfigurationScopes(userDataProfileService.currentProfile, !!remoteAuthority) }, fileService, uriIdentityService, logService));
        this.cachedFolderConfigs = new ResourceMap();
        this._register(this.localUserConfiguration.onDidChangeConfiguration(userConfiguration => this.onLocalUserConfigurationChanged(userConfiguration)));
        if (remoteAuthority) {
            const remoteUserConfiguration = this.remoteUserConfiguration = this._register(new RemoteUserConfiguration(remoteAuthority, configurationCache, fileService, uriIdentityService, remoteAgentService, logService));
            this._register(remoteUserConfiguration.onDidInitialize(remoteUserConfigurationModel => {
                this._register(remoteUserConfiguration.onDidChangeConfiguration(remoteUserConfigurationModel => this.onRemoteUserConfigurationChanged(remoteUserConfigurationModel)));
                this.onRemoteUserConfigurationChanged(remoteUserConfigurationModel);
                this.initRemoteUserConfigurationBarrier.open();
            }));
        }
        else {
            this.initRemoteUserConfigurationBarrier.open();
        }
        this.workspaceConfiguration = this._register(new WorkspaceConfiguration(configurationCache, fileService, uriIdentityService, logService));
        this._register(this.workspaceConfiguration.onDidUpdateConfiguration(fromCache => {
            this.onWorkspaceConfigurationChanged(fromCache).then(() => {
                this.workspace.initialized = this.workspaceConfiguration.initialized;
                this.checkAndMarkWorkspaceComplete(fromCache);
            });
        }));
        this._register(this.defaultConfiguration.onDidChangeConfiguration(({ properties, defaults }) => this.onDefaultConfigurationChanged(defaults, properties)));
        this._register(this.policyConfiguration.onDidChangeConfiguration(configurationModel => this.onPolicyConfigurationChanged(configurationModel)));
        this._register(userDataProfileService.onDidChangeCurrentProfile(e => this.onUserDataProfileChanged(e)));
        this.workspaceEditingQueue = new Queue();
    }
    createApplicationConfiguration() {
        this.applicationConfigurationDisposables.clear();
        if (this.userDataProfileService.currentProfile.isDefault || this.userDataProfileService.currentProfile.useDefaultFlags?.settings) {
            this.applicationConfiguration = null;
        }
        else {
            this.applicationConfiguration = this.applicationConfigurationDisposables.add(this._register(new ApplicationConfiguration(this.userDataProfilesService, this.fileService, this.uriIdentityService, this.logService)));
            this.applicationConfigurationDisposables.add(this.applicationConfiguration.onDidChangeConfiguration(configurationModel => this.onApplicationConfigurationChanged(configurationModel)));
        }
    }
    async getCompleteWorkspace() {
        await this.completeWorkspaceBarrier.wait();
        return this.getWorkspace();
    }
    getWorkspace() {
        return this.workspace;
    }
    getWorkbenchState() {
        if (this.workspace.configuration) {
            return 3;
        }
        if (this.workspace.folders.length === 1) {
            return 2;
        }
        return 1;
    }
    getWorkspaceFolder(resource) {
        return this.workspace.getFolder(resource);
    }
    addFolders(foldersToAdd, index) {
        return this.updateFolders(foldersToAdd, [], index);
    }
    removeFolders(foldersToRemove) {
        return this.updateFolders([], foldersToRemove);
    }
    async updateFolders(foldersToAdd, foldersToRemove, index) {
        return this.workspaceEditingQueue.queue(() => this.doUpdateFolders(foldersToAdd, foldersToRemove, index));
    }
    isInsideWorkspace(resource) {
        return !!this.getWorkspaceFolder(resource);
    }
    isCurrentWorkspace(workspaceIdOrFolder) {
        switch (this.getWorkbenchState()) {
            case 2: {
                let folderUri = undefined;
                if (URI.isUri(workspaceIdOrFolder)) {
                    folderUri = workspaceIdOrFolder;
                }
                else if (isSingleFolderWorkspaceIdentifier(workspaceIdOrFolder)) {
                    folderUri = workspaceIdOrFolder.uri;
                }
                return URI.isUri(folderUri) && this.uriIdentityService.extUri.isEqual(folderUri, this.workspace.folders[0].uri);
            }
            case 3:
                return isWorkspaceIdentifier(workspaceIdOrFolder) && this.workspace.id === workspaceIdOrFolder.id;
        }
        return false;
    }
    async doUpdateFolders(foldersToAdd, foldersToRemove, index) {
        if (this.getWorkbenchState() !== 3) {
            return Promise.resolve(undefined);
        }
        if (foldersToAdd.length + foldersToRemove.length === 0) {
            return Promise.resolve(undefined);
        }
        let foldersHaveChanged = false;
        let currentWorkspaceFolders = this.getWorkspace().folders;
        let newStoredFolders = currentWorkspaceFolders.map(f => f.raw).filter((folder, index) => {
            if (!isStoredWorkspaceFolder(folder)) {
                return true;
            }
            return !this.contains(foldersToRemove, currentWorkspaceFolders[index].uri);
        });
        foldersHaveChanged = currentWorkspaceFolders.length !== newStoredFolders.length;
        if (foldersToAdd.length) {
            const workspaceConfigPath = this.getWorkspace().configuration;
            const workspaceConfigFolder = this.uriIdentityService.extUri.dirname(workspaceConfigPath);
            currentWorkspaceFolders = toWorkspaceFolders(newStoredFolders, workspaceConfigPath, this.uriIdentityService.extUri);
            const currentWorkspaceFolderUris = currentWorkspaceFolders.map(folder => folder.uri);
            const storedFoldersToAdd = [];
            for (const folderToAdd of foldersToAdd) {
                const folderURI = folderToAdd.uri;
                if (this.contains(currentWorkspaceFolderUris, folderURI)) {
                    continue;
                }
                try {
                    const result = await this.fileService.stat(folderURI);
                    if (!result.isDirectory) {
                        continue;
                    }
                }
                catch (e) { }
                storedFoldersToAdd.push(getStoredWorkspaceFolder(folderURI, false, folderToAdd.name, workspaceConfigFolder, this.uriIdentityService.extUri));
            }
            if (storedFoldersToAdd.length > 0) {
                foldersHaveChanged = true;
                if (typeof index === 'number' && index >= 0 && index < newStoredFolders.length) {
                    newStoredFolders = newStoredFolders.slice(0);
                    newStoredFolders.splice(index, 0, ...storedFoldersToAdd);
                }
                else {
                    newStoredFolders = [...newStoredFolders, ...storedFoldersToAdd];
                }
            }
        }
        if (foldersHaveChanged) {
            return this.setFolders(newStoredFolders);
        }
        return Promise.resolve(undefined);
    }
    async setFolders(folders) {
        if (!this.instantiationService) {
            throw new Error('Cannot update workspace folders because workspace service is not yet ready to accept writes.');
        }
        await this.instantiationService.invokeFunction(accessor => this.workspaceConfiguration.setFolders(folders, accessor.get(IJSONEditingService)));
        return this.onWorkspaceConfigurationChanged(false);
    }
    contains(resources, toCheck) {
        return resources.some(resource => this.uriIdentityService.extUri.isEqual(resource, toCheck));
    }
    getConfigurationData() {
        return this._configuration.toData();
    }
    getValue(arg1, arg2) {
        const section = typeof arg1 === 'string' ? arg1 : undefined;
        const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : undefined;
        return this._configuration.getValue(section, overrides);
    }
    async updateValue(key, value, arg3, arg4, options) {
        const overrides = isConfigurationUpdateOverrides(arg3) ? arg3
            : isConfigurationOverrides(arg3) ? { resource: arg3.resource, overrideIdentifiers: arg3.overrideIdentifier ? [arg3.overrideIdentifier] : undefined } : undefined;
        const target = overrides ? arg4 : arg3;
        const targets = target ? [target] : [];
        if (overrides?.overrideIdentifiers) {
            overrides.overrideIdentifiers = distinct(overrides.overrideIdentifiers);
            overrides.overrideIdentifiers = overrides.overrideIdentifiers.length ? overrides.overrideIdentifiers : undefined;
        }
        if (!targets.length) {
            if (overrides?.overrideIdentifiers && overrides.overrideIdentifiers.length > 1) {
                throw new Error('Configuration Target is required while updating the value for multiple override identifiers');
            }
            const inspect = this.inspect(key, { resource: overrides?.resource, overrideIdentifier: overrides?.overrideIdentifiers ? overrides.overrideIdentifiers[0] : undefined });
            targets.push(...this.deriveConfigurationTargets(key, value, inspect));
            if (equals(value, inspect.defaultValue) && targets.length === 1 && (targets[0] === 2 || targets[0] === 3)) {
                value = undefined;
            }
        }
        await Promises.settled(targets.map(target => this.writeConfigurationValue(key, value, target, overrides, options)));
    }
    async reloadConfiguration(target) {
        if (target === undefined) {
            this.reloadDefaultConfiguration();
            const application = await this.reloadApplicationConfiguration(true);
            const { local, remote } = await this.reloadUserConfiguration();
            await this.reloadWorkspaceConfiguration();
            await this.loadConfiguration(application, local, remote, true);
            return;
        }
        if (isWorkspaceFolder(target)) {
            await this.reloadWorkspaceFolderConfiguration(target);
            return;
        }
        switch (target) {
            case 7:
                this.reloadDefaultConfiguration();
                return;
            case 2: {
                const { local, remote } = await this.reloadUserConfiguration();
                await this.loadConfiguration(this._configuration.applicationConfiguration, local, remote, true);
                return;
            }
            case 3:
                await this.reloadLocalUserConfiguration();
                return;
            case 4:
                await this.reloadRemoteUserConfiguration();
                return;
            case 5:
            case 6:
                await this.reloadWorkspaceConfiguration();
                return;
        }
    }
    hasCachedConfigurationDefaultsOverrides() {
        return this.defaultConfiguration.hasCachedConfigurationDefaultsOverrides();
    }
    inspect(key, overrides) {
        return this._configuration.inspect(key, overrides);
    }
    keys() {
        return this._configuration.keys();
    }
    async whenRemoteConfigurationLoaded() {
        await this.initRemoteUserConfigurationBarrier.wait();
    }
    async initialize(arg) {
        mark('code/willInitWorkspaceService');
        const trigger = this.initialized;
        this.initialized = false;
        const workspace = await this.createWorkspace(arg);
        await this.updateWorkspaceAndInitializeConfiguration(workspace, trigger);
        this.checkAndMarkWorkspaceComplete(false);
        mark('code/didInitWorkspaceService');
    }
    updateWorkspaceTrust(trusted) {
        if (this.isWorkspaceTrusted !== trusted) {
            this.isWorkspaceTrusted = trusted;
            const data = this._configuration.toData();
            const folderConfigurationModels = [];
            for (const folder of this.workspace.folders) {
                const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
                let configurationModel;
                if (folderConfiguration) {
                    configurationModel = folderConfiguration.updateWorkspaceTrust(this.isWorkspaceTrusted);
                    this._configuration.updateFolderConfiguration(folder.uri, configurationModel);
                }
                folderConfigurationModels.push(configurationModel);
            }
            if (this.getWorkbenchState() === 2) {
                if (folderConfigurationModels[0]) {
                    this._configuration.updateWorkspaceConfiguration(folderConfigurationModels[0]);
                }
            }
            else {
                this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.updateWorkspaceTrust(this.isWorkspaceTrusted));
            }
            this.updateRestrictedSettings();
            let keys = [];
            if (this.restrictedSettings.userLocal) {
                keys.push(...this.restrictedSettings.userLocal);
            }
            if (this.restrictedSettings.userRemote) {
                keys.push(...this.restrictedSettings.userRemote);
            }
            if (this.restrictedSettings.workspace) {
                keys.push(...this.restrictedSettings.workspace);
            }
            this.restrictedSettings.workspaceFolder?.forEach((value) => keys.push(...value));
            keys = distinct(keys);
            if (keys.length) {
                this.triggerConfigurationChange({ keys, overrides: [] }, { data, workspace: this.workspace }, 5);
            }
        }
    }
    acquireInstantiationService(instantiationService) {
        this.instantiationService = instantiationService;
    }
    isSettingAppliedForAllProfiles(key) {
        if (this.configurationRegistry.getConfigurationProperties()[key]?.scope === 1) {
            return true;
        }
        const allProfilesSettings = this.getValue(APPLY_ALL_PROFILES_SETTING) ?? [];
        return Array.isArray(allProfilesSettings) && allProfilesSettings.includes(key);
    }
    async createWorkspace(arg) {
        if (isWorkspaceIdentifier(arg)) {
            return this.createMultiFolderWorkspace(arg);
        }
        if (isSingleFolderWorkspaceIdentifier(arg)) {
            return this.createSingleFolderWorkspace(arg);
        }
        return this.createEmptyWorkspace(arg);
    }
    async createMultiFolderWorkspace(workspaceIdentifier) {
        await this.workspaceConfiguration.initialize({ id: workspaceIdentifier.id, configPath: workspaceIdentifier.configPath }, this.isWorkspaceTrusted);
        const workspaceConfigPath = workspaceIdentifier.configPath;
        const workspaceFolders = toWorkspaceFolders(this.workspaceConfiguration.getFolders(), workspaceConfigPath, this.uriIdentityService.extUri);
        const workspaceId = workspaceIdentifier.id;
        const workspace = new Workspace(workspaceId, workspaceFolders, this.workspaceConfiguration.isTransient(), workspaceConfigPath, uri => this.uriIdentityService.extUri.ignorePathCasing(uri));
        workspace.initialized = this.workspaceConfiguration.initialized;
        return workspace;
    }
    createSingleFolderWorkspace(singleFolderWorkspaceIdentifier) {
        const workspace = new Workspace(singleFolderWorkspaceIdentifier.id, [toWorkspaceFolder(singleFolderWorkspaceIdentifier.uri)], false, null, uri => this.uriIdentityService.extUri.ignorePathCasing(uri));
        workspace.initialized = true;
        return workspace;
    }
    createEmptyWorkspace(emptyWorkspaceIdentifier) {
        const workspace = new Workspace(emptyWorkspaceIdentifier.id, [], false, null, uri => this.uriIdentityService.extUri.ignorePathCasing(uri));
        workspace.initialized = true;
        return Promise.resolve(workspace);
    }
    checkAndMarkWorkspaceComplete(fromCache) {
        if (!this.completeWorkspaceBarrier.isOpen() && this.workspace.initialized) {
            this.completeWorkspaceBarrier.open();
            this.validateWorkspaceFoldersAndReload(fromCache);
        }
    }
    async updateWorkspaceAndInitializeConfiguration(workspace, trigger) {
        const hasWorkspaceBefore = !!this.workspace;
        let previousState;
        let previousWorkspacePath;
        let previousFolders = [];
        if (hasWorkspaceBefore) {
            previousState = this.getWorkbenchState();
            previousWorkspacePath = this.workspace.configuration ? this.workspace.configuration.fsPath : undefined;
            previousFolders = this.workspace.folders;
            this.workspace.update(workspace);
        }
        else {
            this.workspace = workspace;
        }
        await this.initializeConfiguration(trigger);
        if (hasWorkspaceBefore) {
            const newState = this.getWorkbenchState();
            if (previousState && newState !== previousState) {
                this._onDidChangeWorkbenchState.fire(newState);
            }
            const newWorkspacePath = this.workspace.configuration ? this.workspace.configuration.fsPath : undefined;
            if (previousWorkspacePath && newWorkspacePath !== previousWorkspacePath || newState !== previousState) {
                this._onDidChangeWorkspaceName.fire();
            }
            const folderChanges = this.compareFolders(previousFolders, this.workspace.folders);
            if (folderChanges && (folderChanges.added.length || folderChanges.removed.length || folderChanges.changed.length)) {
                await this.handleWillChangeWorkspaceFolders(folderChanges, false);
                this._onDidChangeWorkspaceFolders.fire(folderChanges);
            }
        }
        if (!this.localUserConfiguration.hasTasksLoaded) {
            this._register(runWhenWindowIdle(mainWindow, () => this.reloadLocalUserConfiguration(false, this._configuration.localUserConfiguration)));
        }
    }
    compareFolders(currentFolders, newFolders) {
        const result = { added: [], removed: [], changed: [] };
        result.added = newFolders.filter(newFolder => !currentFolders.some(currentFolder => newFolder.uri.toString() === currentFolder.uri.toString()));
        for (let currentIndex = 0; currentIndex < currentFolders.length; currentIndex++) {
            const currentFolder = currentFolders[currentIndex];
            let newIndex = 0;
            for (newIndex = 0; newIndex < newFolders.length && currentFolder.uri.toString() !== newFolders[newIndex].uri.toString(); newIndex++) { }
            if (newIndex < newFolders.length) {
                if (currentIndex !== newIndex || currentFolder.name !== newFolders[newIndex].name) {
                    result.changed.push(currentFolder);
                }
            }
            else {
                result.removed.push(currentFolder);
            }
        }
        return result;
    }
    async initializeConfiguration(trigger) {
        await this.defaultConfiguration.initialize();
        const initPolicyConfigurationPromise = this.policyConfiguration.initialize();
        const initApplicationConfigurationPromise = this.applicationConfiguration ? this.applicationConfiguration.initialize() : Promise.resolve(ConfigurationModel.createEmptyModel(this.logService));
        const initUserConfiguration = async () => {
            mark('code/willInitUserConfiguration');
            const result = await Promise.all([this.localUserConfiguration.initialize(), this.remoteUserConfiguration ? this.remoteUserConfiguration.initialize() : Promise.resolve(ConfigurationModel.createEmptyModel(this.logService))]);
            if (this.applicationConfiguration) {
                const applicationConfigurationModel = await initApplicationConfigurationPromise;
                result[0] = this.localUserConfiguration.reparse({ exclude: applicationConfigurationModel.getValue(APPLY_ALL_PROFILES_SETTING) });
            }
            mark('code/didInitUserConfiguration');
            return result;
        };
        const [, application, [local, remote]] = await Promise.all([
            initPolicyConfigurationPromise,
            initApplicationConfigurationPromise,
            initUserConfiguration()
        ]);
        mark('code/willInitWorkspaceConfiguration');
        await this.loadConfiguration(application, local, remote, trigger);
        mark('code/didInitWorkspaceConfiguration');
    }
    reloadDefaultConfiguration() {
        this.onDefaultConfigurationChanged(this.defaultConfiguration.reload());
    }
    async reloadApplicationConfiguration(donotTrigger) {
        if (!this.applicationConfiguration) {
            return ConfigurationModel.createEmptyModel(this.logService);
        }
        const model = await this.applicationConfiguration.loadConfiguration();
        if (!donotTrigger) {
            this.onApplicationConfigurationChanged(model);
        }
        return model;
    }
    async reloadUserConfiguration() {
        const [local, remote] = await Promise.all([this.reloadLocalUserConfiguration(true), this.reloadRemoteUserConfiguration(true)]);
        return { local, remote };
    }
    async reloadLocalUserConfiguration(donotTrigger, settingsConfiguration) {
        const model = await this.localUserConfiguration.reload(settingsConfiguration);
        if (!donotTrigger) {
            this.onLocalUserConfigurationChanged(model);
        }
        return model;
    }
    async reloadRemoteUserConfiguration(donotTrigger) {
        if (this.remoteUserConfiguration) {
            const model = await this.remoteUserConfiguration.reload();
            if (!donotTrigger) {
                this.onRemoteUserConfigurationChanged(model);
            }
            return model;
        }
        return ConfigurationModel.createEmptyModel(this.logService);
    }
    async reloadWorkspaceConfiguration() {
        const workbenchState = this.getWorkbenchState();
        if (workbenchState === 2) {
            return this.onWorkspaceFolderConfigurationChanged(this.workspace.folders[0]);
        }
        if (workbenchState === 3) {
            return this.workspaceConfiguration.reload().then(() => this.onWorkspaceConfigurationChanged(false));
        }
    }
    reloadWorkspaceFolderConfiguration(folder) {
        return this.onWorkspaceFolderConfigurationChanged(folder);
    }
    async loadConfiguration(applicationConfigurationModel, userConfigurationModel, remoteUserConfigurationModel, trigger) {
        this.cachedFolderConfigs = new ResourceMap();
        const folders = this.workspace.folders;
        const folderConfigurations = await this.loadFolderConfigurations(folders);
        const workspaceConfiguration = this.getWorkspaceConfigurationModel(folderConfigurations);
        const folderConfigurationModels = new ResourceMap();
        folderConfigurations.forEach((folderConfiguration, index) => folderConfigurationModels.set(folders[index].uri, folderConfiguration));
        const currentConfiguration = this._configuration;
        this._configuration = new Configuration(this.defaultConfiguration.configurationModel, this.policyConfiguration.configurationModel, applicationConfigurationModel, userConfigurationModel, remoteUserConfigurationModel, workspaceConfiguration, folderConfigurationModels, ConfigurationModel.createEmptyModel(this.logService), new ResourceMap(), this.workspace, this.logService);
        this.initialized = true;
        if (trigger) {
            const change = this._configuration.compare(currentConfiguration);
            this.triggerConfigurationChange(change, { data: currentConfiguration.toData(), workspace: this.workspace }, 5);
        }
        this.updateRestrictedSettings();
    }
    getWorkspaceConfigurationModel(folderConfigurations) {
        switch (this.getWorkbenchState()) {
            case 2:
                return folderConfigurations[0];
            case 3:
                return this.workspaceConfiguration.getConfiguration();
            default:
                return ConfigurationModel.createEmptyModel(this.logService);
        }
    }
    onUserDataProfileChanged(e) {
        e.join((async () => {
            const promises = [];
            promises.push(this.localUserConfiguration.reset(e.profile.settingsResource, e.profile.tasksResource, { scopes: getLocalUserConfigurationScopes(e.profile, !!this.remoteUserConfiguration) }));
            if (e.previous.isDefault !== e.profile.isDefault
                || !!e.previous.useDefaultFlags?.settings !== !!e.profile.useDefaultFlags?.settings) {
                this.createApplicationConfiguration();
                if (this.applicationConfiguration) {
                    promises.push(this.reloadApplicationConfiguration(true));
                }
            }
            let [localUser, application] = await Promise.all(promises);
            application = application ?? this._configuration.applicationConfiguration;
            if (this.applicationConfiguration) {
                localUser = this.localUserConfiguration.reparse({ exclude: application.getValue(APPLY_ALL_PROFILES_SETTING) });
            }
            await this.loadConfiguration(application, localUser, this._configuration.remoteUserConfiguration, true);
        })());
    }
    onDefaultConfigurationChanged(configurationModel, properties) {
        if (this.workspace) {
            const previousData = this._configuration.toData();
            const change = this._configuration.compareAndUpdateDefaultConfiguration(configurationModel, properties);
            if (this.applicationConfiguration) {
                this._configuration.updateApplicationConfiguration(this.applicationConfiguration.reparse());
            }
            if (this.remoteUserConfiguration) {
                this._configuration.updateLocalUserConfiguration(this.localUserConfiguration.reparse());
                this._configuration.updateRemoteUserConfiguration(this.remoteUserConfiguration.reparse());
            }
            if (this.getWorkbenchState() === 2) {
                const folderConfiguration = this.cachedFolderConfigs.get(this.workspace.folders[0].uri);
                if (folderConfiguration) {
                    this._configuration.updateWorkspaceConfiguration(folderConfiguration.reparse());
                    this._configuration.updateFolderConfiguration(this.workspace.folders[0].uri, folderConfiguration.reparse());
                }
            }
            else {
                this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.reparseWorkspaceSettings());
                for (const folder of this.workspace.folders) {
                    const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
                    if (folderConfiguration) {
                        this._configuration.updateFolderConfiguration(folder.uri, folderConfiguration.reparse());
                    }
                }
            }
            this.triggerConfigurationChange(change, { data: previousData, workspace: this.workspace }, 7);
            this.updateRestrictedSettings();
        }
    }
    onPolicyConfigurationChanged(policyConfiguration) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const change = this._configuration.compareAndUpdatePolicyConfiguration(policyConfiguration);
        this.triggerConfigurationChange(change, previous, 7);
    }
    onApplicationConfigurationChanged(applicationConfiguration) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const previousAllProfilesSettings = this._configuration.applicationConfiguration.getValue(APPLY_ALL_PROFILES_SETTING) ?? [];
        const change = this._configuration.compareAndUpdateApplicationConfiguration(applicationConfiguration);
        const currentAllProfilesSettings = this.getValue(APPLY_ALL_PROFILES_SETTING) ?? [];
        const configurationProperties = this.configurationRegistry.getConfigurationProperties();
        const changedKeys = [];
        for (const changedKey of change.keys) {
            if (configurationProperties[changedKey]?.scope === 1) {
                changedKeys.push(changedKey);
                if (changedKey === APPLY_ALL_PROFILES_SETTING) {
                    for (const previousAllProfileSetting of previousAllProfilesSettings) {
                        if (!currentAllProfilesSettings.includes(previousAllProfileSetting)) {
                            changedKeys.push(previousAllProfileSetting);
                        }
                    }
                    for (const currentAllProfileSetting of currentAllProfilesSettings) {
                        if (!previousAllProfilesSettings.includes(currentAllProfileSetting)) {
                            changedKeys.push(currentAllProfileSetting);
                        }
                    }
                }
            }
            else if (currentAllProfilesSettings.includes(changedKey)) {
                changedKeys.push(changedKey);
            }
        }
        change.keys = changedKeys;
        if (change.keys.includes(APPLY_ALL_PROFILES_SETTING)) {
            this._configuration.updateLocalUserConfiguration(this.localUserConfiguration.reparse({ exclude: currentAllProfilesSettings }));
        }
        this.triggerConfigurationChange(change, previous, 2);
    }
    onLocalUserConfigurationChanged(userConfiguration) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const change = this._configuration.compareAndUpdateLocalUserConfiguration(userConfiguration);
        this.triggerConfigurationChange(change, previous, 2);
    }
    onRemoteUserConfigurationChanged(userConfiguration) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const change = this._configuration.compareAndUpdateRemoteUserConfiguration(userConfiguration);
        this.triggerConfigurationChange(change, previous, 2);
    }
    async onWorkspaceConfigurationChanged(fromCache) {
        if (this.workspace && this.workspace.configuration) {
            let newFolders = toWorkspaceFolders(this.workspaceConfiguration.getFolders(), this.workspace.configuration, this.uriIdentityService.extUri);
            if (this.workspace.initialized) {
                const { added, removed, changed } = this.compareFolders(this.workspace.folders, newFolders);
                if (added.length || removed.length || changed.length) {
                    newFolders = await this.toValidWorkspaceFolders(newFolders);
                }
                else {
                    newFolders = this.workspace.folders;
                }
            }
            await this.updateWorkspaceConfiguration(newFolders, this.workspaceConfiguration.getConfiguration(), fromCache);
        }
    }
    updateRestrictedSettings() {
        const changed = [];
        const allProperties = this.configurationRegistry.getConfigurationProperties();
        const defaultRestrictedSettings = Object.keys(allProperties).filter(key => allProperties[key].restricted).sort((a, b) => a.localeCompare(b));
        const defaultDelta = delta(defaultRestrictedSettings, this._restrictedSettings.default, (a, b) => a.localeCompare(b));
        changed.push(...defaultDelta.added, ...defaultDelta.removed);
        const application = (this.applicationConfiguration?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
        const applicationDelta = delta(application, this._restrictedSettings.application || [], (a, b) => a.localeCompare(b));
        changed.push(...applicationDelta.added, ...applicationDelta.removed);
        const userLocal = this.localUserConfiguration.getRestrictedSettings().sort((a, b) => a.localeCompare(b));
        const userLocalDelta = delta(userLocal, this._restrictedSettings.userLocal || [], (a, b) => a.localeCompare(b));
        changed.push(...userLocalDelta.added, ...userLocalDelta.removed);
        const userRemote = (this.remoteUserConfiguration?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
        const userRemoteDelta = delta(userRemote, this._restrictedSettings.userRemote || [], (a, b) => a.localeCompare(b));
        changed.push(...userRemoteDelta.added, ...userRemoteDelta.removed);
        const workspaceFolderMap = new ResourceMap();
        for (const workspaceFolder of this.workspace.folders) {
            const cachedFolderConfig = this.cachedFolderConfigs.get(workspaceFolder.uri);
            const folderRestrictedSettings = (cachedFolderConfig?.getRestrictedSettings() || []).sort((a, b) => a.localeCompare(b));
            if (folderRestrictedSettings.length) {
                workspaceFolderMap.set(workspaceFolder.uri, folderRestrictedSettings);
            }
            const previous = this._restrictedSettings.workspaceFolder?.get(workspaceFolder.uri) || [];
            const workspaceFolderDelta = delta(folderRestrictedSettings, previous, (a, b) => a.localeCompare(b));
            changed.push(...workspaceFolderDelta.added, ...workspaceFolderDelta.removed);
        }
        const workspace = this.getWorkbenchState() === 3 ? this.workspaceConfiguration.getRestrictedSettings().sort((a, b) => a.localeCompare(b))
            : this.workspace.folders[0] ? (workspaceFolderMap.get(this.workspace.folders[0].uri) || []) : [];
        const workspaceDelta = delta(workspace, this._restrictedSettings.workspace || [], (a, b) => a.localeCompare(b));
        changed.push(...workspaceDelta.added, ...workspaceDelta.removed);
        if (changed.length) {
            this._restrictedSettings = {
                default: defaultRestrictedSettings,
                application: application.length ? application : undefined,
                userLocal: userLocal.length ? userLocal : undefined,
                userRemote: userRemote.length ? userRemote : undefined,
                workspace: workspace.length ? workspace : undefined,
                workspaceFolder: workspaceFolderMap.size ? workspaceFolderMap : undefined,
            };
            this._onDidChangeRestrictedSettings.fire(this.restrictedSettings);
        }
    }
    async updateWorkspaceConfiguration(workspaceFolders, configuration, fromCache) {
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const change = this._configuration.compareAndUpdateWorkspaceConfiguration(configuration);
        const changes = this.compareFolders(this.workspace.folders, workspaceFolders);
        if (changes.added.length || changes.removed.length || changes.changed.length) {
            this.workspace.folders = workspaceFolders;
            const change = await this.onFoldersChanged();
            await this.handleWillChangeWorkspaceFolders(changes, fromCache);
            this.triggerConfigurationChange(change, previous, 6);
            this._onDidChangeWorkspaceFolders.fire(changes);
        }
        else {
            this.triggerConfigurationChange(change, previous, 5);
        }
        this.updateRestrictedSettings();
    }
    async handleWillChangeWorkspaceFolders(changes, fromCache) {
        const joiners = [];
        this._onWillChangeWorkspaceFolders.fire({
            join(updateWorkspaceTrustStatePromise) {
                joiners.push(updateWorkspaceTrustStatePromise);
            },
            changes,
            fromCache
        });
        try {
            await Promises.settled(joiners);
        }
        catch (error) { }
    }
    async onWorkspaceFolderConfigurationChanged(folder) {
        const [folderConfiguration] = await this.loadFolderConfigurations([folder]);
        const previous = { data: this._configuration.toData(), workspace: this.workspace };
        const folderConfigurationChange = this._configuration.compareAndUpdateFolderConfiguration(folder.uri, folderConfiguration);
        if (this.getWorkbenchState() === 2) {
            const workspaceConfigurationChange = this._configuration.compareAndUpdateWorkspaceConfiguration(folderConfiguration);
            this.triggerConfigurationChange(mergeChanges(folderConfigurationChange, workspaceConfigurationChange), previous, 5);
        }
        else {
            this.triggerConfigurationChange(folderConfigurationChange, previous, 6);
        }
        this.updateRestrictedSettings();
    }
    async onFoldersChanged() {
        const changes = [];
        for (const key of this.cachedFolderConfigs.keys()) {
            if (!this.workspace.folders.filter(folder => folder.uri.toString() === key.toString())[0]) {
                const folderConfiguration = this.cachedFolderConfigs.get(key);
                folderConfiguration.dispose();
                this.cachedFolderConfigs.delete(key);
                changes.push(this._configuration.compareAndDeleteFolderConfiguration(key));
            }
        }
        const toInitialize = this.workspace.folders.filter(folder => !this.cachedFolderConfigs.has(folder.uri));
        if (toInitialize.length) {
            const folderConfigurations = await this.loadFolderConfigurations(toInitialize);
            folderConfigurations.forEach((folderConfiguration, index) => {
                changes.push(this._configuration.compareAndUpdateFolderConfiguration(toInitialize[index].uri, folderConfiguration));
            });
        }
        return mergeChanges(...changes);
    }
    loadFolderConfigurations(folders) {
        return Promise.all([...folders.map(folder => {
                let folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
                if (!folderConfiguration) {
                    folderConfiguration = new FolderConfiguration(!this.initialized, folder, FOLDER_CONFIG_FOLDER_NAME, this.getWorkbenchState(), this.isWorkspaceTrusted, this.fileService, this.uriIdentityService, this.logService, this.configurationCache);
                    this._register(folderConfiguration.onDidChange(() => this.onWorkspaceFolderConfigurationChanged(folder)));
                    this.cachedFolderConfigs.set(folder.uri, this._register(folderConfiguration));
                }
                return folderConfiguration.loadConfiguration();
            })]);
    }
    async validateWorkspaceFoldersAndReload(fromCache) {
        const validWorkspaceFolders = await this.toValidWorkspaceFolders(this.workspace.folders);
        const { removed } = this.compareFolders(this.workspace.folders, validWorkspaceFolders);
        if (removed.length) {
            await this.updateWorkspaceConfiguration(validWorkspaceFolders, this.workspaceConfiguration.getConfiguration(), fromCache);
        }
    }
    async toValidWorkspaceFolders(workspaceFolders) {
        const validWorkspaceFolders = [];
        for (const workspaceFolder of workspaceFolders) {
            try {
                const result = await this.fileService.stat(workspaceFolder.uri);
                if (!result.isDirectory) {
                    continue;
                }
            }
            catch (e) {
                this.logService.warn(`Ignoring the error while validating workspace folder ${workspaceFolder.uri.toString()} - ${toErrorMessage(e)}`);
            }
            validWorkspaceFolders.push(workspaceFolder);
        }
        return validWorkspaceFolders;
    }
    async writeConfigurationValue(key, value, target, overrides, options) {
        if (!this.instantiationService) {
            throw new Error('Cannot write configuration because the configuration service is not yet ready to accept writes.');
        }
        if (target === 7) {
            throw new Error('Invalid configuration target');
        }
        if (target === 8) {
            const previous = { data: this._configuration.toData(), workspace: this.workspace };
            this._configuration.updateValue(key, value, overrides);
            this.triggerConfigurationChange({ keys: overrides?.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key] : [key], overrides: overrides?.overrideIdentifiers?.length ? overrides.overrideIdentifiers.map(overrideIdentifier => ([overrideIdentifier, [key]])) : [] }, previous, target);
            return;
        }
        const editableConfigurationTarget = this.toEditableConfigurationTarget(target, key);
        if (!editableConfigurationTarget) {
            throw new Error('Invalid configuration target');
        }
        if (editableConfigurationTarget === 2 && !this.remoteUserConfiguration) {
            throw new Error('Invalid configuration target');
        }
        if (overrides?.overrideIdentifiers?.length && overrides.overrideIdentifiers.length > 1) {
            const configurationModel = this.getConfigurationModelForEditableConfigurationTarget(editableConfigurationTarget, overrides.resource);
            if (configurationModel) {
                const overrideIdentifiers = overrides.overrideIdentifiers.sort();
                const existingOverrides = configurationModel.overrides.find(override => arrayEquals([...override.identifiers].sort(), overrideIdentifiers));
                if (existingOverrides) {
                    overrides.overrideIdentifiers = existingOverrides.identifiers;
                }
            }
        }
        this.configurationEditing = this.configurationEditing ?? this.createConfigurationEditingService(this.instantiationService);
        await (await this.configurationEditing).writeConfiguration(editableConfigurationTarget, { key, value }, { scopes: overrides, ...options });
        switch (editableConfigurationTarget) {
            case 1:
                if (this.applicationConfiguration && this.isSettingAppliedForAllProfiles(key)) {
                    await this.reloadApplicationConfiguration();
                }
                else {
                    await this.reloadLocalUserConfiguration();
                }
                return;
            case 2:
                return this.reloadRemoteUserConfiguration().then(() => undefined);
            case 3:
                return this.reloadWorkspaceConfiguration();
            case 4: {
                const workspaceFolder = overrides && overrides.resource ? this.workspace.getFolder(overrides.resource) : null;
                if (workspaceFolder) {
                    return this.reloadWorkspaceFolderConfiguration(workspaceFolder);
                }
            }
        }
    }
    async createConfigurationEditingService(instantiationService) {
        const remoteSettingsResource = (await this.remoteAgentService.getEnvironment())?.settingsPath ?? null;
        return instantiationService.createInstance(ConfigurationEditing, remoteSettingsResource);
    }
    getConfigurationModelForEditableConfigurationTarget(target, resource) {
        switch (target) {
            case 1: return this._configuration.localUserConfiguration;
            case 2: return this._configuration.remoteUserConfiguration;
            case 3: return this._configuration.workspaceConfiguration;
            case 4: return resource ? this._configuration.folderConfigurations.get(resource) : undefined;
        }
    }
    getConfigurationModel(target, resource) {
        switch (target) {
            case 3: return this._configuration.localUserConfiguration;
            case 4: return this._configuration.remoteUserConfiguration;
            case 5: return this._configuration.workspaceConfiguration;
            case 6: return resource ? this._configuration.folderConfigurations.get(resource) : undefined;
            default: return undefined;
        }
    }
    deriveConfigurationTargets(key, value, inspect) {
        if (equals(value, inspect.value)) {
            return [];
        }
        const definedTargets = [];
        if (inspect.workspaceFolderValue !== undefined) {
            definedTargets.push(6);
        }
        if (inspect.workspaceValue !== undefined) {
            definedTargets.push(5);
        }
        if (inspect.userRemoteValue !== undefined) {
            definedTargets.push(4);
        }
        if (inspect.userLocalValue !== undefined) {
            definedTargets.push(3);
        }
        if (inspect.applicationValue !== undefined) {
            definedTargets.push(1);
        }
        if (value === undefined) {
            return definedTargets;
        }
        return [definedTargets[0] || 2];
    }
    triggerConfigurationChange(change, previous, target) {
        if (change.keys.length) {
            if (target !== 7) {
                this.logService.debug(`Configuration keys changed in ${ConfigurationTargetToString(target)} target`, ...change.keys);
            }
            const configurationChangeEvent = new ConfigurationChangeEvent(change, previous, this._configuration, this.workspace, this.logService);
            configurationChangeEvent.source = target;
            this._onDidChangeConfiguration.fire(configurationChangeEvent);
        }
    }
    toEditableConfigurationTarget(target, key) {
        if (target === 1) {
            return 1;
        }
        if (target === 2) {
            if (this.remoteUserConfiguration) {
                const scope = this.configurationRegistry.getConfigurationProperties()[key]?.scope;
                if (scope === 2 || scope === 6) {
                    return 2;
                }
                if (this.inspect(key).userRemoteValue !== undefined) {
                    return 2;
                }
            }
            return 1;
        }
        if (target === 3) {
            return 1;
        }
        if (target === 4) {
            return 2;
        }
        if (target === 5) {
            return 3;
        }
        if (target === 6) {
            return 4;
        }
        return null;
    }
}
let RegisterConfigurationSchemasContribution = class RegisterConfigurationSchemasContribution extends Disposable {
    constructor(workspaceContextService, environmentService, workspaceTrustManagementService, extensionService, lifecycleService) {
        super();
        this.workspaceContextService = workspaceContextService;
        this.environmentService = environmentService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        extensionService.whenInstalledExtensionsRegistered().then(() => {
            this.registerConfigurationSchemas();
            const configurationRegistry = Registry.as(Extensions.Configuration);
            const delayer = this._register(new Delayer(50));
            this._register(Event.any(configurationRegistry.onDidUpdateConfiguration, configurationRegistry.onDidSchemaChange, workspaceTrustManagementService.onDidChangeTrust)(() => delayer.trigger(() => this.registerConfigurationSchemas(), lifecycleService.phase === 4 ? undefined : 2500)));
        });
    }
    registerConfigurationSchemas() {
        const allSettingsSchema = {
            properties: allSettings.properties,
            patternProperties: allSettings.patternProperties,
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        const userSettingsSchema = this.environmentService.remoteAuthority ?
            {
                properties: Object.assign({}, applicationSettings.properties, windowSettings.properties, resourceSettings.properties),
                patternProperties: allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            }
            : allSettingsSchema;
        const profileSettingsSchema = {
            properties: Object.assign({}, machineSettings.properties, machineOverridableSettings.properties, windowSettings.properties, resourceSettings.properties),
            patternProperties: allSettings.patternProperties,
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        const machineSettingsSchema = {
            properties: Object.assign({}, machineSettings.properties, machineOverridableSettings.properties, windowSettings.properties, resourceSettings.properties),
            patternProperties: allSettings.patternProperties,
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        const workspaceSettingsSchema = {
            properties: Object.assign({}, this.checkAndFilterPropertiesRequiringTrust(machineOverridableSettings.properties), this.checkAndFilterPropertiesRequiringTrust(windowSettings.properties), this.checkAndFilterPropertiesRequiringTrust(resourceSettings.properties)),
            patternProperties: allSettings.patternProperties,
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        const defaultSettingsSchema = {
            properties: Object.keys(allSettings.properties).reduce((result, key) => {
                result[key] = Object.assign({ deprecationMessage: undefined }, allSettings.properties[key]);
                return result;
            }, {}),
            patternProperties: Object.keys(allSettings.patternProperties).reduce((result, key) => {
                result[key] = Object.assign({ deprecationMessage: undefined }, allSettings.patternProperties[key]);
                return result;
            }, {}),
            additionalProperties: true,
            allowTrailingCommas: true,
            allowComments: true
        };
        const folderSettingsSchema = 3 === this.workspaceContextService.getWorkbenchState() ?
            {
                properties: Object.assign({}, this.checkAndFilterPropertiesRequiringTrust(machineOverridableSettings.properties), this.checkAndFilterPropertiesRequiringTrust(resourceSettings.properties)),
                patternProperties: allSettings.patternProperties,
                additionalProperties: true,
                allowTrailingCommas: true,
                allowComments: true
            } : workspaceSettingsSchema;
        const configDefaultsSchema = {
            type: 'object',
            description: localize('configurationDefaults.description', 'Contribute defaults for configurations'),
            properties: Object.assign({}, this.filterDefaultOverridableProperties(machineOverridableSettings.properties), this.filterDefaultOverridableProperties(windowSettings.properties), this.filterDefaultOverridableProperties(resourceSettings.properties)),
            patternProperties: {
                [OVERRIDE_PROPERTY_PATTERN]: {
                    type: 'object',
                    default: {},
                    $ref: resourceLanguageSettingsSchemaId,
                }
            },
            additionalProperties: false
        };
        this.registerSchemas({
            defaultSettingsSchema,
            userSettingsSchema,
            profileSettingsSchema,
            machineSettingsSchema,
            workspaceSettingsSchema,
            folderSettingsSchema,
            configDefaultsSchema,
        });
    }
    registerSchemas(schemas) {
        const jsonRegistry = Registry.as(JSONExtensions.JSONContribution);
        jsonRegistry.registerSchema(defaultSettingsSchemaId, schemas.defaultSettingsSchema);
        jsonRegistry.registerSchema(userSettingsSchemaId, schemas.userSettingsSchema);
        jsonRegistry.registerSchema(profileSettingsSchemaId, schemas.profileSettingsSchema);
        jsonRegistry.registerSchema(machineSettingsSchemaId, schemas.machineSettingsSchema);
        jsonRegistry.registerSchema(workspaceSettingsSchemaId, schemas.workspaceSettingsSchema);
        jsonRegistry.registerSchema(folderSettingsSchemaId, schemas.folderSettingsSchema);
        jsonRegistry.registerSchema(configurationDefaultsSchemaId, schemas.configDefaultsSchema);
    }
    checkAndFilterPropertiesRequiringTrust(properties) {
        if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
            return properties;
        }
        const result = {};
        Object.entries(properties).forEach(([key, value]) => {
            if (!value.restricted) {
                result[key] = value;
            }
        });
        return result;
    }
    filterDefaultOverridableProperties(properties) {
        const result = {};
        Object.entries(properties).forEach(([key, value]) => {
            if (!value.disallowConfigurationDefault) {
                result[key] = value;
            }
        });
        return result;
    }
};
RegisterConfigurationSchemasContribution = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IWorkspaceTrustManagementService),
    __param(3, IExtensionService),
    __param(4, ILifecycleService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], RegisterConfigurationSchemasContribution);
let ResetConfigurationDefaultsOverridesCache = class ResetConfigurationDefaultsOverridesCache extends Disposable {
    constructor(configurationService, extensionService) {
        super();
        if (configurationService.hasCachedConfigurationDefaultsOverrides()) {
            extensionService.whenInstalledExtensionsRegistered().then(() => configurationService.reloadConfiguration(7));
        }
    }
};
ResetConfigurationDefaultsOverridesCache = __decorate([
    __param(0, IConfigurationService),
    __param(1, IExtensionService),
    __metadata("design:paramtypes", [WorkspaceService, Object])
], ResetConfigurationDefaultsOverridesCache);
let UpdateExperimentalSettingsDefaults = class UpdateExperimentalSettingsDefaults extends Disposable {
    static { this.ID = 'workbench.contrib.updateExperimentalSettingsDefaults'; }
    constructor(workbenchAssignmentService) {
        super();
        this.workbenchAssignmentService = workbenchAssignmentService;
        this.processedExperimentalSettings = new Set();
        this.configurationRegistry = Registry.as(Extensions.Configuration);
        this.processExperimentalSettings(Object.keys(this.configurationRegistry.getConfigurationProperties()));
        this._register(this.configurationRegistry.onDidUpdateConfiguration(({ properties }) => this.processExperimentalSettings(properties)));
    }
    async processExperimentalSettings(properties) {
        const overrides = {};
        const allProperties = this.configurationRegistry.getConfigurationProperties();
        for (const property of properties) {
            const schema = allProperties[property];
            if (!schema?.tags?.includes('experimental')) {
                continue;
            }
            if (this.processedExperimentalSettings.has(property)) {
                continue;
            }
            this.processedExperimentalSettings.add(property);
            try {
                const value = await this.workbenchAssignmentService.getTreatment(`config.${property}`);
                if (!isUndefined(value) && !equals(value, schema.default)) {
                    overrides[property] = value;
                }
            }
            catch (error) { }
        }
        if (Object.keys(overrides).length) {
            this.configurationRegistry.registerDefaultConfigurations([{ overrides }]);
        }
    }
};
UpdateExperimentalSettingsDefaults = __decorate([
    __param(0, IWorkbenchAssignmentService),
    __metadata("design:paramtypes", [Object])
], UpdateExperimentalSettingsDefaults);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
workbenchContributionsRegistry.registerWorkbenchContribution(RegisterConfigurationSchemasContribution, 3);
workbenchContributionsRegistry.registerWorkbenchContribution(ResetConfigurationDefaultsOverridesCache, 4);
registerWorkbenchContribution2(UpdateExperimentalSettingsDefaults.ID, UpdateExperimentalSettingsDefaults, 2);
const configurationRegistry = Registry.as(Extensions.Configuration);
configurationRegistry.registerConfiguration({
    ...workbenchConfigurationNodeBase,
    properties: {
        [APPLY_ALL_PROFILES_SETTING]: {
            'type': 'array',
            description: localize('setting description', "Configure settings to be applied for all profiles."),
            'default': [],
            'scope': 1,
            additionalProperties: true,
            uniqueItems: true,
        }
    }
});
