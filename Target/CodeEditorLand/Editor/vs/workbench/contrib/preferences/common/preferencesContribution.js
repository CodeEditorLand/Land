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
import { Disposable, dispose } from '../../../../base/common/lifecycle.js';
import { isEqual } from '../../../../base/common/resources.js';
import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { workbenchConfigurationNodeBase } from '../../../common/configuration.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { RegisteredEditorPriority, IEditorResolverService } from '../../../services/editor/common/editorResolverService.js';
import { ITextEditorService } from '../../../services/textfile/common/textEditorService.js';
import { DEFAULT_SETTINGS_EDITOR_SETTING, FOLDER_SETTINGS_PATH, IPreferencesService, USE_SPLIT_JSON_SETTING } from '../../../services/preferences/common/preferences.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { SettingsFileSystemProvider } from './settingsFilesystemProvider.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
let PreferencesContribution = class PreferencesContribution extends Disposable {
    static { this.ID = 'workbench.contrib.preferences'; }
    constructor(fileService, instantiationService, preferencesService, userDataProfileService, workspaceService, configurationService, editorResolverService, textEditorService) {
        super();
        this.instantiationService = instantiationService;
        this.preferencesService = preferencesService;
        this.userDataProfileService = userDataProfileService;
        this.workspaceService = workspaceService;
        this.configurationService = configurationService;
        this.editorResolverService = editorResolverService;
        this.textEditorService = textEditorService;
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(USE_SPLIT_JSON_SETTING) || e.affectsConfiguration(DEFAULT_SETTINGS_EDITOR_SETTING)) {
                this.handleSettingsEditorRegistration();
            }
        }));
        this.handleSettingsEditorRegistration();
        const fileSystemProvider = this._register(this.instantiationService.createInstance(SettingsFileSystemProvider));
        this._register(fileService.registerProvider(SettingsFileSystemProvider.SCHEMA, fileSystemProvider));
    }
    handleSettingsEditorRegistration() {
        dispose(this.editorOpeningListener);
        if (!!this.configurationService.getValue(USE_SPLIT_JSON_SETTING) || !!this.configurationService.getValue(DEFAULT_SETTINGS_EDITOR_SETTING)) {
            this.editorOpeningListener = this.editorResolverService.registerEditor('**/settings.json', {
                id: SideBySideEditorInput.ID,
                label: nls.localize('splitSettingsEditorLabel', "Split Settings Editor"),
                priority: RegisteredEditorPriority.builtin,
            }, {}, {
                createEditorInput: ({ resource, options }) => {
                    if (isEqual(resource, this.userDataProfileService.currentProfile.settingsResource)) {
                        return { editor: this.preferencesService.createSplitJsonEditorInput(3, resource), options };
                    }
                    const state = this.workspaceService.getWorkbenchState();
                    if (state === 2) {
                        const folders = this.workspaceService.getWorkspace().folders;
                        if (isEqual(resource, folders[0].toResource(FOLDER_SETTINGS_PATH))) {
                            return { editor: this.preferencesService.createSplitJsonEditorInput(5, resource), options };
                        }
                    }
                    else if (state === 3) {
                        const folders = this.workspaceService.getWorkspace().folders;
                        for (const folder of folders) {
                            if (isEqual(resource, folder.toResource(FOLDER_SETTINGS_PATH))) {
                                return { editor: this.preferencesService.createSplitJsonEditorInput(6, resource), options };
                            }
                        }
                    }
                    return { editor: this.textEditorService.createTextEditor({ resource }), options };
                }
            });
        }
    }
    dispose() {
        dispose(this.editorOpeningListener);
        super.dispose();
    }
};
PreferencesContribution = __decorate([
    __param(0, IFileService),
    __param(1, IInstantiationService),
    __param(2, IPreferencesService),
    __param(3, IUserDataProfileService),
    __param(4, IWorkspaceContextService),
    __param(5, IConfigurationService),
    __param(6, IEditorResolverService),
    __param(7, ITextEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], PreferencesContribution);
export { PreferencesContribution };
const registry = Registry.as(Extensions.Configuration);
registry.registerConfiguration({
    ...workbenchConfigurationNodeBase,
    'properties': {
        'workbench.settings.enableNaturalLanguageSearch': {
            'type': 'boolean',
            'description': nls.localize('enableNaturalLanguageSettingsSearch', "Controls whether to enable the natural language search mode for settings. The natural language search is provided by a Microsoft online service."),
            'default': true,
            'scope': 3,
            'tags': ['usesOnlineServices']
        },
        'workbench.settings.settingsSearchTocBehavior': {
            'type': 'string',
            'enum': ['hide', 'filter'],
            'enumDescriptions': [
                nls.localize('settingsSearchTocBehavior.hide', "Hide the Table of Contents while searching."),
                nls.localize('settingsSearchTocBehavior.filter', "Filter the Table of Contents to just categories that have matching settings. Clicking on a category will filter the results to that category."),
            ],
            'description': nls.localize('settingsSearchTocBehavior', "Controls the behavior of the Settings editor Table of Contents while searching. If this setting is being changed in the Settings editor, the setting will take effect after the search query is modified."),
            'default': 'filter',
            'scope': 3
        },
    }
});
