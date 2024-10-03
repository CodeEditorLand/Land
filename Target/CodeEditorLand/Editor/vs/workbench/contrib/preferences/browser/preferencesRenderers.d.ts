import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IPreferencesService, ISetting } from '../../../services/preferences/common/preferences.js';
import { SettingsEditorModel } from '../../../services/preferences/common/preferencesModels.js';
export interface IPreferencesRenderer extends IDisposable {
    render(): void;
    updatePreference(key: string, value: any, source: ISetting): void;
    focusPreference(setting: ISetting): void;
    clearFocus(setting: ISetting): void;
    editPreference(setting: ISetting): boolean;
}
export declare class UserSettingsRenderer extends Disposable implements IPreferencesRenderer {
    protected editor: ICodeEditor;
    readonly preferencesModel: SettingsEditorModel;
    protected preferencesService: IPreferencesService;
    private readonly configurationService;
    protected instantiationService: IInstantiationService;
    private settingHighlighter;
    private editSettingActionRenderer;
    private modelChangeDelayer;
    private associatedPreferencesModel;
    private unsupportedSettingsRenderer;
    constructor(editor: ICodeEditor, preferencesModel: SettingsEditorModel, preferencesService: IPreferencesService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    render(): void;
    updatePreference(key: string, value: any, source: IIndexedSetting): void;
    private onModelChanged;
    private onSettingUpdated;
    private getSetting;
    focusPreference(setting: ISetting): void;
    clearFocus(setting: ISetting): void;
    editPreference(setting: ISetting): boolean;
}
export declare class WorkspaceSettingsRenderer extends UserSettingsRenderer implements IPreferencesRenderer {
    private workspaceConfigurationRenderer;
    constructor(editor: ICodeEditor, preferencesModel: SettingsEditorModel, preferencesService: IPreferencesService, configurationService: IConfigurationService, instantiationService: IInstantiationService);
    render(): void;
}
export interface IIndexedSetting extends ISetting {
    index: number;
    groupId: string;
}
