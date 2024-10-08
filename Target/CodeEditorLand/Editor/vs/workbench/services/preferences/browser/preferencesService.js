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
import { getErrorMessage } from '../../../../base/common/errors.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { parse } from '../../../../base/common/json.js';
import { Disposable, MutableDisposable } from '../../../../base/common/lifecycle.js';
import * as network from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { CoreEditingCommands } from '../../../../editor/browser/coreCommands.js';
import { getCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions, getDefaultValue, OVERRIDE_PROPERTY_REGEX } from '../../../../platform/configuration/common/configurationRegistry.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { DEFAULT_EDITOR_ASSOCIATION } from '../../../common/editor.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { IJSONEditingService } from '../../configuration/common/jsonEditing.js';
import { IEditorGroupsService } from '../../editor/common/editorGroupsService.js';
import { IEditorService, SIDE_GROUP } from '../../editor/common/editorService.js';
import { KeybindingsEditorInput } from './keybindingsEditorInput.js';
import { DEFAULT_SETTINGS_EDITOR_SETTING, FOLDER_SETTINGS_PATH, IPreferencesService, SETTINGS_AUTHORITY, USE_SPLIT_JSON_SETTING, validateSettingsEditorOptions } from '../common/preferences.js';
import { SettingsEditor2Input } from '../common/preferencesEditorInput.js';
import { defaultKeybindingsContents, DefaultKeybindingsEditorModel, DefaultRawSettingsEditorModel, DefaultSettings, DefaultSettingsEditorModel, Settings2EditorModel, SettingsEditorModel, WorkspaceConfigurationEditorModel } from '../common/preferencesModels.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { ITextEditorService } from '../../textfile/common/textEditorService.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { isObject } from '../../../../base/common/types.js';
import { SuggestController } from '../../../../editor/contrib/suggest/browser/suggestController.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { ResourceSet } from '../../../../base/common/map.js';
import { isEqual } from '../../../../base/common/resources.js';
import { IURLService } from '../../../../platform/url/common/url.js';
import { compareIgnoreCase } from '../../../../base/common/strings.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
const emptyEditableSettingsContent = '{\n}';
let PreferencesService = class PreferencesService extends Disposable {
    constructor(editorService, editorGroupService, textFileService, configurationService, notificationService, contextService, instantiationService, userDataProfileService, userDataProfilesService, textModelResolverService, keybindingService, modelService, jsonEditingService, labelService, remoteAgentService, textEditorService, urlService, extensionService, progressService) {
        super();
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.textFileService = textFileService;
        this.configurationService = configurationService;
        this.notificationService = notificationService;
        this.contextService = contextService;
        this.instantiationService = instantiationService;
        this.userDataProfileService = userDataProfileService;
        this.userDataProfilesService = userDataProfilesService;
        this.textModelResolverService = textModelResolverService;
        this.jsonEditingService = jsonEditingService;
        this.labelService = labelService;
        this.remoteAgentService = remoteAgentService;
        this.textEditorService = textEditorService;
        this.extensionService = extensionService;
        this.progressService = progressService;
        this._onDispose = this._register(new Emitter());
        this._onDidDefaultSettingsContentChanged = this._register(new Emitter());
        this.onDidDefaultSettingsContentChanged = this._onDidDefaultSettingsContentChanged.event;
        this._requestedDefaultSettings = new ResourceSet();
        this._settingsGroups = undefined;
        this.defaultKeybindingsResource = URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: '/keybindings.json' });
        this.defaultSettingsRawResource = URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: '/defaultSettings.json' });
        // The default keybindings.json updates based on keyboard layouts, so here we make sure
        // if a model has been given out we update it accordingly.
        this._register(keybindingService.onDidUpdateKeybindings(() => {
            const model = modelService.getModel(this.defaultKeybindingsResource);
            if (!model) {
                // model has not been given out => nothing to do
                return;
            }
            modelService.updateModel(model, defaultKeybindingsContents(keybindingService));
        }));
        this._register(urlService.registerHandler(this));
    }
    get userSettingsResource() {
        return this.userDataProfileService.currentProfile.settingsResource;
    }
    get workspaceSettingsResource() {
        if (this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */) {
            return null;
        }
        const workspace = this.contextService.getWorkspace();
        return workspace.configuration || workspace.folders[0].toResource(FOLDER_SETTINGS_PATH);
    }
    createSettingsEditor2Input() {
        return new SettingsEditor2Input(this);
    }
    getFolderSettingsResource(resource) {
        const folder = this.contextService.getWorkspaceFolder(resource);
        return folder ? folder.toResource(FOLDER_SETTINGS_PATH) : null;
    }
    hasDefaultSettingsContent(uri) {
        return this.isDefaultSettingsResource(uri) || isEqual(uri, this.defaultSettingsRawResource) || isEqual(uri, this.defaultKeybindingsResource);
    }
    getDefaultSettingsContent(uri) {
        if (this.isDefaultSettingsResource(uri)) {
            // We opened a split json editor in this case,
            // and this half shows the default settings.
            const target = this.getConfigurationTargetFromDefaultSettingsResource(uri);
            const defaultSettings = this.getDefaultSettings(target);
            if (!this._requestedDefaultSettings.has(uri)) {
                this._register(defaultSettings.onDidChange(() => this._onDidDefaultSettingsContentChanged.fire(uri)));
                this._requestedDefaultSettings.add(uri);
            }
            return defaultSettings.getContentWithoutMostCommonlyUsed(true);
        }
        if (isEqual(uri, this.defaultSettingsRawResource)) {
            if (!this._defaultRawSettingsEditorModel) {
                this._defaultRawSettingsEditorModel = this._register(this.instantiationService.createInstance(DefaultRawSettingsEditorModel, this.getDefaultSettings(3 /* ConfigurationTarget.USER_LOCAL */)));
                this._register(this._defaultRawSettingsEditorModel.onDidContentChanged(() => this._onDidDefaultSettingsContentChanged.fire(uri)));
            }
            return this._defaultRawSettingsEditorModel.content;
        }
        if (isEqual(uri, this.defaultKeybindingsResource)) {
            const defaultKeybindingsEditorModel = this.instantiationService.createInstance(DefaultKeybindingsEditorModel, uri);
            return defaultKeybindingsEditorModel.content;
        }
        return undefined;
    }
    async createPreferencesEditorModel(uri) {
        if (this.isDefaultSettingsResource(uri)) {
            return this.createDefaultSettingsEditorModel(uri);
        }
        if (this.userSettingsResource.toString() === uri.toString() || this.userDataProfilesService.defaultProfile.settingsResource.toString() === uri.toString()) {
            return this.createEditableSettingsEditorModel(3 /* ConfigurationTarget.USER_LOCAL */, uri);
        }
        const workspaceSettingsUri = await this.getEditableSettingsURI(5 /* ConfigurationTarget.WORKSPACE */);
        if (workspaceSettingsUri && workspaceSettingsUri.toString() === uri.toString()) {
            return this.createEditableSettingsEditorModel(5 /* ConfigurationTarget.WORKSPACE */, workspaceSettingsUri);
        }
        if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */) {
            const settingsUri = await this.getEditableSettingsURI(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, uri);
            if (settingsUri && settingsUri.toString() === uri.toString()) {
                return this.createEditableSettingsEditorModel(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, uri);
            }
        }
        const remoteEnvironment = await this.remoteAgentService.getEnvironment();
        const remoteSettingsUri = remoteEnvironment ? remoteEnvironment.settingsPath : null;
        if (remoteSettingsUri && remoteSettingsUri.toString() === uri.toString()) {
            return this.createEditableSettingsEditorModel(4 /* ConfigurationTarget.USER_REMOTE */, uri);
        }
        return null;
    }
    openRawDefaultSettings() {
        return this.editorService.openEditor({ resource: this.defaultSettingsRawResource });
    }
    openRawUserSettings() {
        return this.editorService.openEditor({ resource: this.userSettingsResource });
    }
    shouldOpenJsonByDefault() {
        return this.configurationService.getValue('workbench.settings.editor') === 'json';
    }
    openSettings(options = {}) {
        options = {
            ...options,
            target: 3 /* ConfigurationTarget.USER_LOCAL */,
        };
        if (options.query) {
            options.jsonEditor = false;
        }
        return this.open(this.userSettingsResource, options);
    }
    openLanguageSpecificSettings(languageId, options = {}) {
        if (this.shouldOpenJsonByDefault()) {
            options.query = undefined;
            options.revealSetting = { key: `[${languageId}]`, edit: true };
        }
        else {
            options.query = `@lang:${languageId}${options.query ? ` ${options.query}` : ''}`;
        }
        options.target = options.target ?? 3 /* ConfigurationTarget.USER_LOCAL */;
        return this.open(this.userSettingsResource, options);
    }
    open(settingsResource, options) {
        options = {
            ...options,
            jsonEditor: options.jsonEditor ?? this.shouldOpenJsonByDefault()
        };
        return options.jsonEditor ?
            this.openSettingsJson(settingsResource, options) :
            this.openSettings2(options);
    }
    async openSettings2(options) {
        const input = this.createSettingsEditor2Input();
        options = {
            ...options,
            focusSearch: true
        };
        await this.editorService.openEditor(input, validateSettingsEditorOptions(options), options.openToSide ? SIDE_GROUP : undefined);
        return this.editorGroupService.activeGroup.activeEditorPane;
    }
    openApplicationSettings(options = {}) {
        options = {
            ...options,
            target: 3 /* ConfigurationTarget.USER_LOCAL */,
        };
        return this.open(this.userDataProfilesService.defaultProfile.settingsResource, options);
    }
    openUserSettings(options = {}) {
        options = {
            ...options,
            target: 3 /* ConfigurationTarget.USER_LOCAL */,
        };
        return this.open(this.userSettingsResource, options);
    }
    async openRemoteSettings(options = {}) {
        const environment = await this.remoteAgentService.getEnvironment();
        if (environment) {
            options = {
                ...options,
                target: 4 /* ConfigurationTarget.USER_REMOTE */,
            };
            this.open(environment.settingsPath, options);
        }
        return undefined;
    }
    openWorkspaceSettings(options = {}) {
        if (!this.workspaceSettingsResource) {
            this.notificationService.info(nls.localize('openFolderFirst', "Open a folder or workspace first to create workspace or folder settings."));
            return Promise.reject(null);
        }
        options = {
            ...options,
            target: 5 /* ConfigurationTarget.WORKSPACE */
        };
        return this.open(this.workspaceSettingsResource, options);
    }
    async openFolderSettings(options = {}) {
        options = {
            ...options,
            target: 6 /* ConfigurationTarget.WORKSPACE_FOLDER */
        };
        if (!options.folderUri) {
            throw new Error(`Missing folder URI`);
        }
        const folderSettingsUri = await this.getEditableSettingsURI(6 /* ConfigurationTarget.WORKSPACE_FOLDER */, options.folderUri);
        if (!folderSettingsUri) {
            throw new Error(`Invalid folder URI - ${options.folderUri.toString()}`);
        }
        return this.open(folderSettingsUri, options);
    }
    async openGlobalKeybindingSettings(textual, options) {
        options = { pinned: true, revealIfOpened: true, ...options };
        if (textual) {
            const emptyContents = '// ' + nls.localize('emptyKeybindingsHeader', "Place your key bindings in this file to override the defaults") + '\n[\n]';
            const editableKeybindings = this.userDataProfileService.currentProfile.keybindingsResource;
            const openDefaultKeybindings = !!this.configurationService.getValue('workbench.settings.openDefaultKeybindings');
            // Create as needed and open in editor
            await this.createIfNotExists(editableKeybindings, emptyContents);
            if (openDefaultKeybindings) {
                const activeEditorGroup = this.editorGroupService.activeGroup;
                const sideEditorGroup = this.editorGroupService.addGroup(activeEditorGroup.id, 3 /* GroupDirection.RIGHT */);
                await Promise.all([
                    this.editorService.openEditor({ resource: this.defaultKeybindingsResource, options: { pinned: true, preserveFocus: true, revealIfOpened: true, override: DEFAULT_EDITOR_ASSOCIATION.id }, label: nls.localize('defaultKeybindings', "Default Keybindings"), description: '' }),
                    this.editorService.openEditor({ resource: editableKeybindings, options }, sideEditorGroup.id)
                ]);
            }
            else {
                await this.editorService.openEditor({ resource: editableKeybindings, options });
            }
        }
        else {
            const editor = (await this.editorService.openEditor(this.instantiationService.createInstance(KeybindingsEditorInput), { ...options }));
            if (options.query) {
                editor.search(options.query);
            }
        }
    }
    openDefaultKeybindingsFile() {
        return this.editorService.openEditor({ resource: this.defaultKeybindingsResource, label: nls.localize('defaultKeybindings', "Default Keybindings") });
    }
    async openSettingsJson(resource, options) {
        const group = options?.openToSide ? SIDE_GROUP : undefined;
        const editor = await this.doOpenSettingsJson(resource, options, group);
        if (editor && options?.revealSetting) {
            await this.revealSetting(options.revealSetting.key, !!options.revealSetting.edit, editor, resource);
        }
        return editor;
    }
    async doOpenSettingsJson(resource, options, group) {
        const openSplitJSON = !!this.configurationService.getValue(USE_SPLIT_JSON_SETTING);
        const openDefaultSettings = !!this.configurationService.getValue(DEFAULT_SETTINGS_EDITOR_SETTING);
        if (openSplitJSON || openDefaultSettings) {
            return this.doOpenSplitJSON(resource, options, group);
        }
        const configurationTarget = options?.target ?? 2 /* ConfigurationTarget.USER */;
        const editableSettingsEditorInput = await this.getOrCreateEditableSettingsEditorInput(configurationTarget, resource);
        options = { ...options, pinned: true };
        return await this.editorService.openEditor(editableSettingsEditorInput, validateSettingsEditorOptions(options), group);
    }
    async doOpenSplitJSON(resource, options = {}, group) {
        const configurationTarget = options.target ?? 2 /* ConfigurationTarget.USER */;
        await this.createSettingsIfNotExists(configurationTarget, resource);
        const preferencesEditorInput = this.createSplitJsonEditorInput(configurationTarget, resource);
        options = { ...options, pinned: true };
        return this.editorService.openEditor(preferencesEditorInput, validateSettingsEditorOptions(options), group);
    }
    createSplitJsonEditorInput(configurationTarget, resource) {
        const editableSettingsEditorInput = this.textEditorService.createTextEditor({ resource });
        const defaultPreferencesEditorInput = this.textEditorService.createTextEditor({ resource: this.getDefaultSettingsResource(configurationTarget) });
        return this.instantiationService.createInstance(SideBySideEditorInput, editableSettingsEditorInput.getName(), undefined, defaultPreferencesEditorInput, editableSettingsEditorInput);
    }
    createSettings2EditorModel() {
        return this.instantiationService.createInstance(Settings2EditorModel, this.getDefaultSettings(3 /* ConfigurationTarget.USER_LOCAL */));
    }
    getConfigurationTargetFromDefaultSettingsResource(uri) {
        return this.isDefaultWorkspaceSettingsResource(uri) ?
            5 /* ConfigurationTarget.WORKSPACE */ :
            this.isDefaultFolderSettingsResource(uri) ?
                6 /* ConfigurationTarget.WORKSPACE_FOLDER */ :
                3 /* ConfigurationTarget.USER_LOCAL */;
    }
    isDefaultSettingsResource(uri) {
        return this.isDefaultUserSettingsResource(uri) || this.isDefaultWorkspaceSettingsResource(uri) || this.isDefaultFolderSettingsResource(uri);
    }
    isDefaultUserSettingsResource(uri) {
        return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?settings\.json$/);
    }
    isDefaultWorkspaceSettingsResource(uri) {
        return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?workspaceSettings\.json$/);
    }
    isDefaultFolderSettingsResource(uri) {
        return uri.authority === 'defaultsettings' && uri.scheme === network.Schemas.vscode && !!uri.path.match(/\/(\d+\/)?resourceSettings\.json$/);
    }
    getDefaultSettingsResource(configurationTarget) {
        switch (configurationTarget) {
            case 5 /* ConfigurationTarget.WORKSPACE */:
                return URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: `/workspaceSettings.json` });
            case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                return URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: `/resourceSettings.json` });
        }
        return URI.from({ scheme: network.Schemas.vscode, authority: 'defaultsettings', path: `/settings.json` });
    }
    async getOrCreateEditableSettingsEditorInput(target, resource) {
        await this.createSettingsIfNotExists(target, resource);
        return this.textEditorService.createTextEditor({ resource });
    }
    async createEditableSettingsEditorModel(configurationTarget, settingsUri) {
        const workspace = this.contextService.getWorkspace();
        if (workspace.configuration && workspace.configuration.toString() === settingsUri.toString()) {
            const reference = await this.textModelResolverService.createModelReference(settingsUri);
            return this.instantiationService.createInstance(WorkspaceConfigurationEditorModel, reference, configurationTarget);
        }
        const reference = await this.textModelResolverService.createModelReference(settingsUri);
        return this.instantiationService.createInstance(SettingsEditorModel, reference, configurationTarget);
    }
    async createDefaultSettingsEditorModel(defaultSettingsUri) {
        const reference = await this.textModelResolverService.createModelReference(defaultSettingsUri);
        const target = this.getConfigurationTargetFromDefaultSettingsResource(defaultSettingsUri);
        return this.instantiationService.createInstance(DefaultSettingsEditorModel, defaultSettingsUri, reference, this.getDefaultSettings(target));
    }
    getDefaultSettings(target) {
        if (target === 5 /* ConfigurationTarget.WORKSPACE */) {
            this._defaultWorkspaceSettingsContentModel ??= this._register(new DefaultSettings(this.getMostCommonlyUsedSettings(), target, this.configurationService));
            return this._defaultWorkspaceSettingsContentModel;
        }
        if (target === 6 /* ConfigurationTarget.WORKSPACE_FOLDER */) {
            this._defaultFolderSettingsContentModel ??= this._register(new DefaultSettings(this.getMostCommonlyUsedSettings(), target, this.configurationService));
            return this._defaultFolderSettingsContentModel;
        }
        this._defaultUserSettingsContentModel ??= this._register(new DefaultSettings(this.getMostCommonlyUsedSettings(), target, this.configurationService));
        return this._defaultUserSettingsContentModel;
    }
    async getEditableSettingsURI(configurationTarget, resource) {
        switch (configurationTarget) {
            case 1 /* ConfigurationTarget.APPLICATION */:
                return this.userDataProfilesService.defaultProfile.settingsResource;
            case 2 /* ConfigurationTarget.USER */:
            case 3 /* ConfigurationTarget.USER_LOCAL */:
                return this.userSettingsResource;
            case 4 /* ConfigurationTarget.USER_REMOTE */: {
                const remoteEnvironment = await this.remoteAgentService.getEnvironment();
                return remoteEnvironment ? remoteEnvironment.settingsPath : null;
            }
            case 5 /* ConfigurationTarget.WORKSPACE */:
                return this.workspaceSettingsResource;
            case 6 /* ConfigurationTarget.WORKSPACE_FOLDER */:
                if (resource) {
                    return this.getFolderSettingsResource(resource);
                }
        }
        return null;
    }
    async createSettingsIfNotExists(target, resource) {
        if (this.contextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && target === 5 /* ConfigurationTarget.WORKSPACE */) {
            const workspaceConfig = this.contextService.getWorkspace().configuration;
            if (!workspaceConfig) {
                return;
            }
            const content = await this.textFileService.read(workspaceConfig);
            if (Object.keys(parse(content.value)).indexOf('settings') === -1) {
                await this.jsonEditingService.write(resource, [{ path: ['settings'], value: {} }], true);
            }
            return undefined;
        }
        await this.createIfNotExists(resource, emptyEditableSettingsContent);
    }
    async createIfNotExists(resource, contents) {
        try {
            await this.textFileService.read(resource, { acceptTextOnly: true });
        }
        catch (error) {
            if (error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                try {
                    await this.textFileService.write(resource, contents);
                    return;
                }
                catch (error2) {
                    throw new Error(nls.localize('fail.createSettings', "Unable to create '{0}' ({1}).", this.labelService.getUriLabel(resource, { relative: true }), getErrorMessage(error2)));
                }
            }
            else {
                throw error;
            }
        }
    }
    getMostCommonlyUsedSettings() {
        return [
            'files.autoSave',
            'editor.fontSize',
            'editor.fontFamily',
            'editor.tabSize',
            'editor.renderWhitespace',
            'editor.cursorStyle',
            'editor.multiCursorModifier',
            'editor.insertSpaces',
            'editor.wordWrap',
            'files.exclude',
            'files.associations',
            'workbench.editor.enablePreview'
        ];
    }
    async revealSetting(settingKey, edit, editor, settingsResource) {
        const codeEditor = editor ? getCodeEditor(editor.getControl()) : null;
        if (!codeEditor) {
            return;
        }
        const settingsModel = await this.createPreferencesEditorModel(settingsResource);
        if (!settingsModel) {
            return;
        }
        const position = await this.getPositionToReveal(settingKey, edit, settingsModel, codeEditor);
        if (position) {
            codeEditor.setPosition(position);
            codeEditor.revealPositionNearTop(position);
            codeEditor.focus();
            if (edit) {
                SuggestController.get(codeEditor)?.triggerSuggest();
            }
        }
    }
    async getPositionToReveal(settingKey, edit, settingsModel, codeEditor) {
        const model = codeEditor.getModel();
        if (!model) {
            return null;
        }
        const schema = Registry.as(Extensions.Configuration).getConfigurationProperties()[settingKey];
        const isOverrideProperty = OVERRIDE_PROPERTY_REGEX.test(settingKey);
        if (!schema && !isOverrideProperty) {
            return null;
        }
        let position = null;
        const type = schema?.type ?? 'object' /* Type not defined or is an Override Identifier */;
        let setting = settingsModel.getPreference(settingKey);
        if (!setting && edit) {
            let defaultValue = (type === 'object' || type === 'array') ? this.configurationService.inspect(settingKey).defaultValue : getDefaultValue(type);
            defaultValue = defaultValue === undefined && isOverrideProperty ? {} : defaultValue;
            if (defaultValue !== undefined) {
                const key = settingsModel instanceof WorkspaceConfigurationEditorModel ? ['settings', settingKey] : [settingKey];
                await this.jsonEditingService.write(settingsModel.uri, [{ path: key, value: defaultValue }], false);
                setting = settingsModel.getPreference(settingKey);
            }
        }
        if (setting) {
            if (edit) {
                if (isObject(setting.value) || Array.isArray(setting.value)) {
                    position = { lineNumber: setting.valueRange.startLineNumber, column: setting.valueRange.startColumn + 1 };
                    codeEditor.setPosition(position);
                    await CoreEditingCommands.LineBreakInsert.runEditorCommand(null, codeEditor, null);
                    position = { lineNumber: position.lineNumber + 1, column: model.getLineMaxColumn(position.lineNumber + 1) };
                    const firstNonWhiteSpaceColumn = model.getLineFirstNonWhitespaceColumn(position.lineNumber);
                    if (firstNonWhiteSpaceColumn) {
                        // Line has some text. Insert another new line.
                        codeEditor.setPosition({ lineNumber: position.lineNumber, column: firstNonWhiteSpaceColumn });
                        await CoreEditingCommands.LineBreakInsert.runEditorCommand(null, codeEditor, null);
                        position = { lineNumber: position.lineNumber, column: model.getLineMaxColumn(position.lineNumber) };
                    }
                }
                else {
                    position = { lineNumber: setting.valueRange.startLineNumber, column: setting.valueRange.endColumn };
                }
            }
            else {
                position = { lineNumber: setting.keyRange.startLineNumber, column: setting.keyRange.startColumn };
            }
        }
        return position;
    }
    getSetting(settingId) {
        if (!this._settingsGroups) {
            const defaultSettings = this.getDefaultSettings(2 /* ConfigurationTarget.USER */);
            const defaultsChangedDisposable = this._register(new MutableDisposable());
            defaultsChangedDisposable.value = defaultSettings.onDidChange(() => {
                this._settingsGroups = undefined;
                defaultsChangedDisposable.clear();
            });
            this._settingsGroups = defaultSettings.getSettingsGroups();
        }
        for (const group of this._settingsGroups) {
            for (const section of group.sections) {
                for (const setting of section.settings) {
                    if (compareIgnoreCase(setting.key, settingId) === 0) {
                        return setting;
                    }
                }
            }
        }
        return undefined;
    }
    /**
     * Should be of the format:
     * 	code://settings/settingName
     * Examples:
     * 	code://settings/files.autoSave
     *
     */
    async handleURL(uri) {
        if (compareIgnoreCase(uri.authority, SETTINGS_AUTHORITY) !== 0) {
            return false;
        }
        const settingInfo = uri.path.split('/').filter(part => !!part);
        const settingId = ((settingInfo.length > 0) ? settingInfo[0] : undefined);
        if (!settingId) {
            this.openSettings();
            return true;
        }
        let setting = this.getSetting(settingId);
        if (!setting && this.extensionService.extensions.length === 0) {
            // wait for extension points to be processed
            await this.progressService.withProgress({ location: 10 /* ProgressLocation.Window */ }, () => Event.toPromise(this.extensionService.onDidRegisterExtensions));
            setting = this.getSetting(settingId);
        }
        const openSettingsOptions = {};
        if (setting) {
            openSettingsOptions.query = settingId;
        }
        this.openSettings(openSettingsOptions);
        return true;
    }
    dispose() {
        this._onDispose.fire();
        super.dispose();
    }
};
PreferencesService = __decorate([
    __param(0, IEditorService),
    __param(1, IEditorGroupsService),
    __param(2, ITextFileService),
    __param(3, IConfigurationService),
    __param(4, INotificationService),
    __param(5, IWorkspaceContextService),
    __param(6, IInstantiationService),
    __param(7, IUserDataProfileService),
    __param(8, IUserDataProfilesService),
    __param(9, ITextModelService),
    __param(10, IKeybindingService),
    __param(11, IModelService),
    __param(12, IJSONEditingService),
    __param(13, ILabelService),
    __param(14, IRemoteAgentService),
    __param(15, ITextEditorService),
    __param(16, IURLService),
    __param(17, IExtensionService),
    __param(18, IProgressService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], PreferencesService);
export { PreferencesService };
registerSingleton(IPreferencesService, PreferencesService, 1 /* InstantiationType.Delayed */);
