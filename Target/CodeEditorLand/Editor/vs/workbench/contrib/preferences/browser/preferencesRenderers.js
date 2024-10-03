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
var WorkspaceConfigurationRenderer_1;
import { EventHelper, getDomNodePagePosition } from '../../../../base/browser/dom.js';
import { SubmenuAction } from '../../../../base/common/actions.js';
import { Delayer } from '../../../../base/common/async.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { isEqual } from '../../../../base/common/resources.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Range } from '../../../../editor/common/core/range.js';
import { ModelDecorationOptions } from '../../../../editor/common/model/textModel.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { CodeActionKind } from '../../../../editor/contrib/codeAction/common/types.js';
import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions as ConfigurationExtensions, OVERRIDE_PROPERTY_REGEX, overrideIdentifiersFromKey } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IMarkerService, MarkerSeverity } from '../../../../platform/markers/common/markers.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { RangeHighlightDecorations } from '../../../browser/codeeditor.js';
import { settingsEditIcon } from './preferencesIcons.js';
import { EditPreferenceWidget } from './preferencesWidgets.js';
import { APPLY_ALL_PROFILES_SETTING, IWorkbenchConfigurationService } from '../../../services/configuration/common/configuration.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { DefaultSettingsEditorModel, SettingsEditorModel, WorkspaceConfigurationEditorModel } from '../../../services/preferences/common/preferencesModels.js';
import { IUserDataProfileService } from '../../../services/userDataProfile/common/userDataProfile.js';
let UserSettingsRenderer = class UserSettingsRenderer extends Disposable {
    constructor(editor, preferencesModel, preferencesService, configurationService, instantiationService) {
        super();
        this.editor = editor;
        this.preferencesModel = preferencesModel;
        this.preferencesService = preferencesService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.modelChangeDelayer = new Delayer(200);
        this.settingHighlighter = this._register(instantiationService.createInstance(SettingHighlighter, editor));
        this.editSettingActionRenderer = this._register(this.instantiationService.createInstance(EditSettingRenderer, this.editor, this.preferencesModel, this.settingHighlighter));
        this._register(this.editSettingActionRenderer.onUpdateSetting(({ key, value, source }) => this.updatePreference(key, value, source)));
        this._register(this.editor.getModel().onDidChangeContent(() => this.modelChangeDelayer.trigger(() => this.onModelChanged())));
        this.unsupportedSettingsRenderer = this._register(instantiationService.createInstance(UnsupportedSettingsRenderer, editor, preferencesModel));
    }
    render() {
        this.editSettingActionRenderer.render(this.preferencesModel.settingsGroups, this.associatedPreferencesModel);
        this.unsupportedSettingsRenderer.render();
    }
    updatePreference(key, value, source) {
        const overrideIdentifiers = source.overrideOf ? overrideIdentifiersFromKey(source.overrideOf.key) : null;
        const resource = this.preferencesModel.uri;
        this.configurationService.updateValue(key, value, { overrideIdentifiers, resource }, this.preferencesModel.configurationTarget)
            .then(() => this.onSettingUpdated(source));
    }
    onModelChanged() {
        if (!this.editor.hasModel()) {
            return;
        }
        this.render();
    }
    onSettingUpdated(setting) {
        this.editor.focus();
        setting = this.getSetting(setting);
        if (setting) {
            this.editor.setSelection(setting.valueRange);
            this.settingHighlighter.highlight(setting, true);
        }
    }
    getSetting(setting) {
        const { key, overrideOf } = setting;
        if (overrideOf) {
            const setting = this.getSetting(overrideOf);
            for (const override of setting.overrides) {
                if (override.key === key) {
                    return override;
                }
            }
            return undefined;
        }
        return this.preferencesModel.getPreference(key);
    }
    focusPreference(setting) {
        const s = this.getSetting(setting);
        if (s) {
            this.settingHighlighter.highlight(s, true);
            this.editor.setPosition({ lineNumber: s.keyRange.startLineNumber, column: s.keyRange.startColumn });
        }
        else {
            this.settingHighlighter.clear(true);
        }
    }
    clearFocus(setting) {
        this.settingHighlighter.clear(true);
    }
    editPreference(setting) {
        const editableSetting = this.getSetting(setting);
        return !!(editableSetting && this.editSettingActionRenderer.activateOnSetting(editableSetting));
    }
};
UserSettingsRenderer = __decorate([
    __param(2, IPreferencesService),
    __param(3, IConfigurationService),
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Object, SettingsEditorModel, Object, Object, Object])
], UserSettingsRenderer);
export { UserSettingsRenderer };
let WorkspaceSettingsRenderer = class WorkspaceSettingsRenderer extends UserSettingsRenderer {
    constructor(editor, preferencesModel, preferencesService, configurationService, instantiationService) {
        super(editor, preferencesModel, preferencesService, configurationService, instantiationService);
        this.workspaceConfigurationRenderer = this._register(instantiationService.createInstance(WorkspaceConfigurationRenderer, editor, preferencesModel));
    }
    render() {
        super.render();
        this.workspaceConfigurationRenderer.render();
    }
};
WorkspaceSettingsRenderer = __decorate([
    __param(2, IPreferencesService),
    __param(3, IConfigurationService),
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Object, SettingsEditorModel, Object, Object, Object])
], WorkspaceSettingsRenderer);
export { WorkspaceSettingsRenderer };
let EditSettingRenderer = class EditSettingRenderer extends Disposable {
    constructor(editor, primarySettingsModel, settingHighlighter, configurationService, instantiationService, contextMenuService) {
        super();
        this.editor = editor;
        this.primarySettingsModel = primarySettingsModel;
        this.settingHighlighter = settingHighlighter;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.contextMenuService = contextMenuService;
        this.settingsGroups = [];
        this._onUpdateSetting = new Emitter();
        this.onUpdateSetting = this._onUpdateSetting.event;
        this.editPreferenceWidgetForCursorPosition = this._register(this.instantiationService.createInstance(EditPreferenceWidget, editor));
        this.editPreferenceWidgetForMouseMove = this._register(this.instantiationService.createInstance(EditPreferenceWidget, editor));
        this.toggleEditPreferencesForMouseMoveDelayer = new Delayer(75);
        this._register(this.editPreferenceWidgetForCursorPosition.onClick(e => this.onEditSettingClicked(this.editPreferenceWidgetForCursorPosition, e)));
        this._register(this.editPreferenceWidgetForMouseMove.onClick(e => this.onEditSettingClicked(this.editPreferenceWidgetForMouseMove, e)));
        this._register(this.editor.onDidChangeCursorPosition(positionChangeEvent => this.onPositionChanged(positionChangeEvent)));
        this._register(this.editor.onMouseMove(mouseMoveEvent => this.onMouseMoved(mouseMoveEvent)));
        this._register(this.editor.onDidChangeConfiguration(() => this.onConfigurationChanged()));
    }
    render(settingsGroups, associatedPreferencesModel) {
        this.editPreferenceWidgetForCursorPosition.hide();
        this.editPreferenceWidgetForMouseMove.hide();
        this.settingsGroups = settingsGroups;
        this.associatedPreferencesModel = associatedPreferencesModel;
        const settings = this.getSettings(this.editor.getPosition().lineNumber);
        if (settings.length) {
            this.showEditPreferencesWidget(this.editPreferenceWidgetForCursorPosition, settings);
        }
    }
    isDefaultSettings() {
        return this.primarySettingsModel instanceof DefaultSettingsEditorModel;
    }
    onConfigurationChanged() {
        if (!this.editor.getOption(59)) {
            this.editPreferenceWidgetForCursorPosition.hide();
            this.editPreferenceWidgetForMouseMove.hide();
        }
    }
    onPositionChanged(positionChangeEvent) {
        this.editPreferenceWidgetForMouseMove.hide();
        const settings = this.getSettings(positionChangeEvent.position.lineNumber);
        if (settings.length) {
            this.showEditPreferencesWidget(this.editPreferenceWidgetForCursorPosition, settings);
        }
        else {
            this.editPreferenceWidgetForCursorPosition.hide();
        }
    }
    onMouseMoved(mouseMoveEvent) {
        const editPreferenceWidget = this.getEditPreferenceWidgetUnderMouse(mouseMoveEvent);
        if (editPreferenceWidget) {
            this.onMouseOver(editPreferenceWidget);
            return;
        }
        this.settingHighlighter.clear();
        this.toggleEditPreferencesForMouseMoveDelayer.trigger(() => this.toggleEditPreferenceWidgetForMouseMove(mouseMoveEvent));
    }
    getEditPreferenceWidgetUnderMouse(mouseMoveEvent) {
        if (mouseMoveEvent.target.type === 2) {
            const line = mouseMoveEvent.target.position.lineNumber;
            if (this.editPreferenceWidgetForMouseMove.getLine() === line && this.editPreferenceWidgetForMouseMove.isVisible()) {
                return this.editPreferenceWidgetForMouseMove;
            }
            if (this.editPreferenceWidgetForCursorPosition.getLine() === line && this.editPreferenceWidgetForCursorPosition.isVisible()) {
                return this.editPreferenceWidgetForCursorPosition;
            }
        }
        return undefined;
    }
    toggleEditPreferenceWidgetForMouseMove(mouseMoveEvent) {
        const settings = mouseMoveEvent.target.position ? this.getSettings(mouseMoveEvent.target.position.lineNumber) : null;
        if (settings && settings.length) {
            this.showEditPreferencesWidget(this.editPreferenceWidgetForMouseMove, settings);
        }
        else {
            this.editPreferenceWidgetForMouseMove.hide();
        }
    }
    showEditPreferencesWidget(editPreferencesWidget, settings) {
        const line = settings[0].valueRange.startLineNumber;
        if (this.editor.getOption(59) && this.marginFreeFromOtherDecorations(line)) {
            editPreferencesWidget.show(line, nls.localize('editTtile', "Edit"), settings);
            const editPreferenceWidgetToHide = editPreferencesWidget === this.editPreferenceWidgetForCursorPosition ? this.editPreferenceWidgetForMouseMove : this.editPreferenceWidgetForCursorPosition;
            editPreferenceWidgetToHide.hide();
        }
    }
    marginFreeFromOtherDecorations(line) {
        const decorations = this.editor.getLineDecorations(line);
        if (decorations) {
            for (const { options } of decorations) {
                if (options.glyphMarginClassName && options.glyphMarginClassName.indexOf(ThemeIcon.asClassName(settingsEditIcon)) === -1) {
                    return false;
                }
            }
        }
        return true;
    }
    getSettings(lineNumber) {
        const configurationMap = this.getConfigurationsMap();
        return this.getSettingsAtLineNumber(lineNumber).filter(setting => {
            const configurationNode = configurationMap[setting.key];
            if (configurationNode) {
                if (configurationNode.policy && this.configurationService.inspect(setting.key).policyValue !== undefined) {
                    return false;
                }
                if (this.isDefaultSettings()) {
                    if (setting.key === 'launch') {
                        return false;
                    }
                    return true;
                }
                if (configurationNode.type === 'boolean' || configurationNode.enum) {
                    if (this.primarySettingsModel.configurationTarget !== 6) {
                        return true;
                    }
                    if (configurationNode.scope === 4 || configurationNode.scope === 5) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
    getSettingsAtLineNumber(lineNumber) {
        let index = 0;
        const settings = [];
        for (const group of this.settingsGroups) {
            if (group.range.startLineNumber > lineNumber) {
                break;
            }
            if (lineNumber >= group.range.startLineNumber && lineNumber <= group.range.endLineNumber) {
                for (const section of group.sections) {
                    for (const setting of section.settings) {
                        if (setting.range.startLineNumber > lineNumber) {
                            break;
                        }
                        if (lineNumber >= setting.range.startLineNumber && lineNumber <= setting.range.endLineNumber) {
                            if (!this.isDefaultSettings() && setting.overrides.length) {
                                for (const overrideSetting of setting.overrides) {
                                    if (lineNumber >= overrideSetting.range.startLineNumber && lineNumber <= overrideSetting.range.endLineNumber) {
                                        settings.push({ ...overrideSetting, index, groupId: group.id });
                                    }
                                }
                            }
                            else {
                                settings.push({ ...setting, index, groupId: group.id });
                            }
                        }
                        index++;
                    }
                }
            }
        }
        return settings;
    }
    onMouseOver(editPreferenceWidget) {
        this.settingHighlighter.highlight(editPreferenceWidget.preferences[0]);
    }
    onEditSettingClicked(editPreferenceWidget, e) {
        EventHelper.stop(e.event, true);
        const actions = this.getSettings(editPreferenceWidget.getLine()).length === 1 ? this.getActions(editPreferenceWidget.preferences[0], this.getConfigurationsMap()[editPreferenceWidget.preferences[0].key])
            : editPreferenceWidget.preferences.map(setting => new SubmenuAction(`preferences.submenu.${setting.key}`, setting.key, this.getActions(setting, this.getConfigurationsMap()[setting.key])));
        this.contextMenuService.showContextMenu({
            getAnchor: () => e.event,
            getActions: () => actions
        });
    }
    activateOnSetting(setting) {
        const startLine = setting.keyRange.startLineNumber;
        const settings = this.getSettings(startLine);
        if (!settings.length) {
            return false;
        }
        this.editPreferenceWidgetForMouseMove.show(startLine, '', settings);
        const actions = this.getActions(this.editPreferenceWidgetForMouseMove.preferences[0], this.getConfigurationsMap()[this.editPreferenceWidgetForMouseMove.preferences[0].key]);
        this.contextMenuService.showContextMenu({
            getAnchor: () => this.toAbsoluteCoords(new Position(startLine, 1)),
            getActions: () => actions
        });
        return true;
    }
    toAbsoluteCoords(position) {
        const positionCoords = this.editor.getScrolledVisiblePosition(position);
        const editorCoords = getDomNodePagePosition(this.editor.getDomNode());
        const x = editorCoords.left + positionCoords.left;
        const y = editorCoords.top + positionCoords.top + positionCoords.height;
        return { x, y: y + 10 };
    }
    getConfigurationsMap() {
        return Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
    }
    getActions(setting, jsonSchema) {
        if (jsonSchema.type === 'boolean') {
            return [{
                    id: 'truthyValue',
                    label: 'true',
                    tooltip: 'true',
                    enabled: true,
                    run: () => this.updateSetting(setting.key, true, setting),
                    class: undefined
                }, {
                    id: 'falsyValue',
                    label: 'false',
                    tooltip: 'false',
                    enabled: true,
                    run: () => this.updateSetting(setting.key, false, setting),
                    class: undefined
                }];
        }
        if (jsonSchema.enum) {
            return jsonSchema.enum.map(value => {
                return {
                    id: value,
                    label: JSON.stringify(value),
                    tooltip: JSON.stringify(value),
                    enabled: true,
                    run: () => this.updateSetting(setting.key, value, setting),
                    class: undefined
                };
            });
        }
        return this.getDefaultActions(setting);
    }
    getDefaultActions(setting) {
        if (this.isDefaultSettings()) {
            const settingInOtherModel = this.associatedPreferencesModel.getPreference(setting.key);
            return [{
                    id: 'setDefaultValue',
                    label: settingInOtherModel ? nls.localize('replaceDefaultValue', "Replace in Settings") : nls.localize('copyDefaultValue', "Copy to Settings"),
                    tooltip: settingInOtherModel ? nls.localize('replaceDefaultValue', "Replace in Settings") : nls.localize('copyDefaultValue', "Copy to Settings"),
                    enabled: true,
                    run: () => this.updateSetting(setting.key, setting.value, setting),
                    class: undefined
                }];
        }
        return [];
    }
    updateSetting(key, value, source) {
        this._onUpdateSetting.fire({ key, value, source });
    }
};
EditSettingRenderer = __decorate([
    __param(3, IConfigurationService),
    __param(4, IInstantiationService),
    __param(5, IContextMenuService),
    __metadata("design:paramtypes", [Object, Object, SettingHighlighter, Object, Object, Object])
], EditSettingRenderer);
let SettingHighlighter = class SettingHighlighter extends Disposable {
    constructor(editor, instantiationService) {
        super();
        this.editor = editor;
        this.fixedHighlighter = this._register(instantiationService.createInstance(RangeHighlightDecorations));
        this.volatileHighlighter = this._register(instantiationService.createInstance(RangeHighlightDecorations));
    }
    highlight(setting, fix = false) {
        this.volatileHighlighter.removeHighlightRange();
        this.fixedHighlighter.removeHighlightRange();
        const highlighter = fix ? this.fixedHighlighter : this.volatileHighlighter;
        highlighter.highlightRange({
            range: setting.valueRange,
            resource: this.editor.getModel().uri
        }, this.editor);
        this.editor.revealLineInCenterIfOutsideViewport(setting.valueRange.startLineNumber, 0);
    }
    clear(fix = false) {
        this.volatileHighlighter.removeHighlightRange();
        if (fix) {
            this.fixedHighlighter.removeHighlightRange();
        }
    }
};
SettingHighlighter = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], SettingHighlighter);
let UnsupportedSettingsRenderer = class UnsupportedSettingsRenderer extends Disposable {
    constructor(editor, settingsEditorModel, markerService, environmentService, configurationService, workspaceTrustManagementService, uriIdentityService, languageFeaturesService, userDataProfileService, userDataProfilesService) {
        super();
        this.editor = editor;
        this.settingsEditorModel = settingsEditorModel;
        this.markerService = markerService;
        this.environmentService = environmentService;
        this.configurationService = configurationService;
        this.workspaceTrustManagementService = workspaceTrustManagementService;
        this.uriIdentityService = uriIdentityService;
        this.userDataProfileService = userDataProfileService;
        this.userDataProfilesService = userDataProfilesService;
        this.renderingDelayer = new Delayer(200);
        this.codeActions = new ResourceMap(uri => this.uriIdentityService.extUri.getComparisonKey(uri));
        this._register(this.editor.getModel().onDidChangeContent(() => this.delayedRender()));
        this._register(Event.filter(this.configurationService.onDidChangeConfiguration, e => e.source === 7)(() => this.delayedRender()));
        this._register(languageFeaturesService.codeActionProvider.register({ pattern: settingsEditorModel.uri.path }, this));
        this._register(userDataProfileService.onDidChangeCurrentProfile(() => this.delayedRender()));
    }
    delayedRender() {
        this.renderingDelayer.trigger(() => this.render());
    }
    render() {
        this.codeActions.clear();
        const markerData = this.generateMarkerData();
        if (markerData.length) {
            this.markerService.changeOne('UnsupportedSettingsRenderer', this.settingsEditorModel.uri, markerData);
        }
        else {
            this.markerService.remove('UnsupportedSettingsRenderer', [this.settingsEditorModel.uri]);
        }
    }
    async provideCodeActions(model, range, context, token) {
        const actions = [];
        const codeActionsByRange = this.codeActions.get(model.uri);
        if (codeActionsByRange) {
            for (const [codeActionsRange, codeActions] of codeActionsByRange) {
                if (codeActionsRange.containsRange(range)) {
                    actions.push(...codeActions);
                }
            }
        }
        return {
            actions,
            dispose: () => { }
        };
    }
    generateMarkerData() {
        const markerData = [];
        const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration).getConfigurationProperties();
        for (const settingsGroup of this.settingsEditorModel.settingsGroups) {
            for (const section of settingsGroup.sections) {
                for (const setting of section.settings) {
                    if (OVERRIDE_PROPERTY_REGEX.test(setting.key)) {
                        if (setting.overrides) {
                            this.handleOverrides(setting.overrides, configurationRegistry, markerData);
                        }
                        continue;
                    }
                    const configuration = configurationRegistry[setting.key];
                    if (configuration) {
                        if (this.handlePolicyConfiguration(setting, configuration, markerData)) {
                            continue;
                        }
                        switch (this.settingsEditorModel.configurationTarget) {
                            case 3:
                                this.handleLocalUserConfiguration(setting, configuration, markerData);
                                break;
                            case 4:
                                this.handleRemoteUserConfiguration(setting, configuration, markerData);
                                break;
                            case 5:
                                this.handleWorkspaceConfiguration(setting, configuration, markerData);
                                break;
                            case 6:
                                this.handleWorkspaceFolderConfiguration(setting, configuration, markerData);
                                break;
                        }
                    }
                    else {
                        markerData.push(this.gemerateUnknownConfigurationMarker(setting));
                    }
                }
            }
        }
        return markerData;
    }
    handlePolicyConfiguration(setting, configuration, markerData) {
        if (!configuration.policy) {
            return false;
        }
        if (this.configurationService.inspect(setting.key).policyValue === undefined) {
            return false;
        }
        if (this.settingsEditorModel.configurationTarget === 7) {
            return false;
        }
        markerData.push({
            severity: MarkerSeverity.Hint,
            tags: [1],
            ...setting.range,
            message: nls.localize('unsupportedPolicySetting', "This setting cannot be applied because it is configured in the system policy.")
        });
        return true;
    }
    handleOverrides(overrides, configurationRegistry, markerData) {
        for (const setting of overrides || []) {
            const configuration = configurationRegistry[setting.key];
            if (configuration) {
                if (configuration.scope !== 5) {
                    markerData.push({
                        severity: MarkerSeverity.Hint,
                        tags: [1],
                        ...setting.range,
                        message: nls.localize('unsupportLanguageOverrideSetting', "This setting cannot be applied because it is not registered as language override setting.")
                    });
                }
            }
            else {
                markerData.push(this.gemerateUnknownConfigurationMarker(setting));
            }
        }
    }
    handleLocalUserConfiguration(setting, configuration, markerData) {
        if (!this.userDataProfileService.currentProfile.isDefault && !this.userDataProfileService.currentProfile.useDefaultFlags?.settings) {
            if (isEqual(this.userDataProfilesService.defaultProfile.settingsResource, this.settingsEditorModel.uri) && !this.configurationService.isSettingAppliedForAllProfiles(setting.key)) {
                markerData.push({
                    severity: MarkerSeverity.Hint,
                    tags: [1],
                    ...setting.range,
                    message: nls.localize('defaultProfileSettingWhileNonDefaultActive', "This setting cannot be applied while a non-default profile is active. It will be applied when the default profile is active.")
                });
            }
            else if (isEqual(this.userDataProfileService.currentProfile.settingsResource, this.settingsEditorModel.uri)) {
                if (configuration.scope === 1) {
                    markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
                }
                else if (this.configurationService.isSettingAppliedForAllProfiles(setting.key)) {
                    markerData.push({
                        severity: MarkerSeverity.Hint,
                        tags: [1],
                        ...setting.range,
                        message: nls.localize('allProfileSettingWhileInNonDefaultProfileSetting', "This setting cannot be applied because it is configured to be applied in all profiles using setting {0}. Value from the default profile will be used instead.", APPLY_ALL_PROFILES_SETTING)
                    });
                }
            }
        }
        if (this.environmentService.remoteAuthority && (configuration.scope === 2 || configuration.scope === 6)) {
            markerData.push({
                severity: MarkerSeverity.Hint,
                tags: [1],
                ...setting.range,
                message: nls.localize('unsupportedRemoteMachineSetting', "This setting cannot be applied in this window. It will be applied when you open a local window.")
            });
        }
    }
    handleRemoteUserConfiguration(setting, configuration, markerData) {
        if (configuration.scope === 1) {
            markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
        }
    }
    handleWorkspaceConfiguration(setting, configuration, markerData) {
        if (configuration.scope === 1) {
            markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
        }
        if (configuration.scope === 2) {
            markerData.push(this.generateUnsupportedMachineSettingMarker(setting));
        }
        if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && configuration.restricted) {
            const marker = this.generateUntrustedSettingMarker(setting);
            markerData.push(marker);
            const codeActions = this.generateUntrustedSettingCodeActions([marker]);
            this.addCodeActions(marker, codeActions);
        }
    }
    handleWorkspaceFolderConfiguration(setting, configuration, markerData) {
        if (configuration.scope === 1) {
            markerData.push(this.generateUnsupportedApplicationSettingMarker(setting));
        }
        if (configuration.scope === 2) {
            markerData.push(this.generateUnsupportedMachineSettingMarker(setting));
        }
        if (configuration.scope === 3) {
            markerData.push({
                severity: MarkerSeverity.Hint,
                tags: [1],
                ...setting.range,
                message: nls.localize('unsupportedWindowSetting', "This setting cannot be applied in this workspace. It will be applied when you open the containing workspace folder directly.")
            });
        }
        if (!this.workspaceTrustManagementService.isWorkspaceTrusted() && configuration.restricted) {
            const marker = this.generateUntrustedSettingMarker(setting);
            markerData.push(marker);
            const codeActions = this.generateUntrustedSettingCodeActions([marker]);
            this.addCodeActions(marker, codeActions);
        }
    }
    generateUnsupportedApplicationSettingMarker(setting) {
        return {
            severity: MarkerSeverity.Hint,
            tags: [1],
            ...setting.range,
            message: nls.localize('unsupportedApplicationSetting', "This setting has an application scope and can be set only in the user settings file.")
        };
    }
    generateUnsupportedMachineSettingMarker(setting) {
        return {
            severity: MarkerSeverity.Hint,
            tags: [1],
            ...setting.range,
            message: nls.localize('unsupportedMachineSetting', "This setting can only be applied in user settings in local window or in remote settings in remote window.")
        };
    }
    generateUntrustedSettingMarker(setting) {
        return {
            severity: MarkerSeverity.Warning,
            ...setting.range,
            message: nls.localize('untrustedSetting', "This setting can only be applied in a trusted workspace.")
        };
    }
    gemerateUnknownConfigurationMarker(setting) {
        return {
            severity: MarkerSeverity.Hint,
            tags: [1],
            ...setting.range,
            message: nls.localize('unknown configuration setting', "Unknown Configuration Setting")
        };
    }
    generateUntrustedSettingCodeActions(diagnostics) {
        return [{
                title: nls.localize('manage workspace trust', "Manage Workspace Trust"),
                command: {
                    id: 'workbench.trust.manage',
                    title: nls.localize('manage workspace trust', "Manage Workspace Trust")
                },
                diagnostics,
                kind: CodeActionKind.QuickFix.value
            }];
    }
    addCodeActions(range, codeActions) {
        let actions = this.codeActions.get(this.settingsEditorModel.uri);
        if (!actions) {
            actions = [];
            this.codeActions.set(this.settingsEditorModel.uri, actions);
        }
        actions.push([Range.lift(range), codeActions]);
    }
    dispose() {
        this.markerService.remove('UnsupportedSettingsRenderer', [this.settingsEditorModel.uri]);
        this.codeActions.clear();
        super.dispose();
    }
};
UnsupportedSettingsRenderer = __decorate([
    __param(2, IMarkerService),
    __param(3, IWorkbenchEnvironmentService),
    __param(4, IWorkbenchConfigurationService),
    __param(5, IWorkspaceTrustManagementService),
    __param(6, IUriIdentityService),
    __param(7, ILanguageFeaturesService),
    __param(8, IUserDataProfileService),
    __param(9, IUserDataProfilesService),
    __metadata("design:paramtypes", [Object, SettingsEditorModel, Object, Object, Object, Object, Object, Object, Object, Object])
], UnsupportedSettingsRenderer);
let WorkspaceConfigurationRenderer = class WorkspaceConfigurationRenderer extends Disposable {
    static { WorkspaceConfigurationRenderer_1 = this; }
    static { this.supportedKeys = ['folders', 'tasks', 'launch', 'extensions', 'settings', 'remoteAuthority', 'transient']; }
    constructor(editor, workspaceSettingsEditorModel, workspaceContextService, markerService) {
        super();
        this.editor = editor;
        this.workspaceSettingsEditorModel = workspaceSettingsEditorModel;
        this.workspaceContextService = workspaceContextService;
        this.markerService = markerService;
        this.decorations = this.editor.createDecorationsCollection();
        this.renderingDelayer = new Delayer(200);
        this._register(this.editor.getModel().onDidChangeContent(() => this.renderingDelayer.trigger(() => this.render())));
    }
    render() {
        const markerData = [];
        if (this.workspaceContextService.getWorkbenchState() === 3 && this.workspaceSettingsEditorModel instanceof WorkspaceConfigurationEditorModel) {
            const ranges = [];
            for (const settingsGroup of this.workspaceSettingsEditorModel.configurationGroups) {
                for (const section of settingsGroup.sections) {
                    for (const setting of section.settings) {
                        if (!WorkspaceConfigurationRenderer_1.supportedKeys.includes(setting.key)) {
                            markerData.push({
                                severity: MarkerSeverity.Hint,
                                tags: [1],
                                ...setting.range,
                                message: nls.localize('unsupportedProperty', "Unsupported Property")
                            });
                        }
                    }
                }
            }
            this.decorations.set(ranges.map(range => this.createDecoration(range)));
        }
        if (markerData.length) {
            this.markerService.changeOne('WorkspaceConfigurationRenderer', this.workspaceSettingsEditorModel.uri, markerData);
        }
        else {
            this.markerService.remove('WorkspaceConfigurationRenderer', [this.workspaceSettingsEditorModel.uri]);
        }
    }
    static { this._DIM_CONFIGURATION_ = ModelDecorationOptions.register({
        description: 'dim-configuration',
        stickiness: 1,
        inlineClassName: 'dim-configuration'
    }); }
    createDecoration(range) {
        return {
            range,
            options: WorkspaceConfigurationRenderer_1._DIM_CONFIGURATION_
        };
    }
    dispose() {
        this.markerService.remove('WorkspaceConfigurationRenderer', [this.workspaceSettingsEditorModel.uri]);
        this.decorations.clear();
        super.dispose();
    }
};
WorkspaceConfigurationRenderer = WorkspaceConfigurationRenderer_1 = __decorate([
    __param(2, IWorkspaceContextService),
    __param(3, IMarkerService),
    __metadata("design:paramtypes", [Object, SettingsEditorModel, Object, Object])
], WorkspaceConfigurationRenderer);
