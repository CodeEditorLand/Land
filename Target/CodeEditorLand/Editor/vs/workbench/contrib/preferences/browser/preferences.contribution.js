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
import { KeyChord } from '../../../../base/common/keyCodes.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { isBoolean, isObject, isString } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import './media/preferences.css';
import { registerEditorContribution } from '../../../../editor/browser/editorExtensions.js';
import { Context as SuggestContext } from '../../../../editor/contrib/suggest/browser/suggest.js';
import * as nls from '../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../platform/commands/common/commands.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { InputFocusedContext, IsMacNativeContext } from '../../../../platform/contextkey/common/contextkeys.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from '../../../browser/actions/workspaceCommands.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { EditorExtensions } from '../../../common/editor.js';
import { ResourceContextKey, RemoteNameContext, WorkbenchStateContext } from '../../../common/contextkeys.js';
import { ExplorerFolderContext, ExplorerRootContext } from '../../files/common/files.js';
import { KeybindingsEditor } from './keybindingsEditor.js';
import { ConfigureLanguageBasedSettingsAction } from './preferencesActions.js';
import { SettingsEditorContribution } from './preferencesEditor.js';
import { preferencesOpenSettingsIcon } from './preferencesIcons.js';
import { SettingsEditor2 } from './settingsEditor2.js';
import { CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS, CONTEXT_KEYBINDING_FOCUS, CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_JSON_EDITOR, CONTEXT_SETTINGS_ROW_FOCUS, CONTEXT_SETTINGS_SEARCH_FOCUS, CONTEXT_TOC_ROW_FOCUS, CONTEXT_WHEN_FOCUS, KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN, KEYBINDINGS_EDITOR_COMMAND_ADD, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY, KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, KEYBINDINGS_EDITOR_COMMAND_COPY, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND, KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE, KEYBINDINGS_EDITOR_COMMAND_DEFINE, KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN, KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS, KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS, KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN, KEYBINDINGS_EDITOR_COMMAND_REMOVE, KEYBINDINGS_EDITOR_COMMAND_RESET, KEYBINDINGS_EDITOR_COMMAND_SEARCH, KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR, KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE, KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS, KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS, REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG, SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS, SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU } from '../common/preferences.js';
import { PreferencesContribution } from '../common/preferencesContribution.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { KeybindingsEditorInput } from '../../../services/preferences/browser/keybindingsEditorInput.js';
import { DEFINE_KEYBINDING_EDITOR_CONTRIB_ID, IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { SettingsEditor2Input } from '../../../services/preferences/common/preferencesEditorInput.js';
import { IUserDataProfileService, CURRENT_PROFILE_CONTEXT } from '../../../services/userDataProfile/common/userDataProfile.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { isCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
const SETTINGS_EDITOR_COMMAND_SEARCH = 'settings.action.search';
const SETTINGS_EDITOR_COMMAND_FOCUS_FILE = 'settings.action.focusSettingsFile';
const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH = 'settings.action.focusSettingsFromSearch';
const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST = 'settings.action.focusSettingsList';
const SETTINGS_EDITOR_COMMAND_FOCUS_TOC = 'settings.action.focusTOC';
const SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL = 'settings.action.focusSettingControl';
const SETTINGS_EDITOR_COMMAND_FOCUS_UP = 'settings.action.focusLevelUp';
const SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON = 'settings.switchToJSON';
const SETTINGS_EDITOR_COMMAND_FILTER_ONLINE = 'settings.filterByOnline';
const SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED = 'settings.filterUntrusted';
const SETTINGS_COMMAND_OPEN_SETTINGS = 'workbench.action.openSettings';
const SETTINGS_COMMAND_FILTER_TELEMETRY = 'settings.filterByTelemetry';
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(SettingsEditor2, SettingsEditor2.ID, nls.localize('settingsEditor2', "Settings Editor 2")), [
    new SyncDescriptor(SettingsEditor2Input)
]);
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(KeybindingsEditor, KeybindingsEditor.ID, nls.localize('keybindingsEditor', "Keybindings Editor")), [
    new SyncDescriptor(KeybindingsEditorInput)
]);
class KeybindingsEditorInputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(editorInput) {
        return '';
    }
    deserialize(instantiationService) {
        return instantiationService.createInstance(KeybindingsEditorInput);
    }
}
class SettingsEditor2InputSerializer {
    canSerialize(editorInput) {
        return true;
    }
    serialize(input) {
        return '';
    }
    deserialize(instantiationService) {
        return instantiationService.createInstance(SettingsEditor2Input);
    }
}
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(KeybindingsEditorInput.ID, KeybindingsEditorInputSerializer);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(SettingsEditor2Input.ID, SettingsEditor2InputSerializer);
const OPEN_USER_SETTINGS_UI_TITLE = nls.localize2('openSettings2', "Open Settings (UI)");
const OPEN_USER_SETTINGS_JSON_TITLE = nls.localize2('openUserSettingsJson', "Open User Settings (JSON)");
const OPEN_APPLICATION_SETTINGS_JSON_TITLE = nls.localize2('openApplicationSettingsJson', "Open Application Settings (JSON)");
const category = Categories.Preferences;
function sanitizeBoolean(arg) {
    return isBoolean(arg) ? arg : undefined;
}
function sanitizeString(arg) {
    return isString(arg) ? arg : undefined;
}
function sanitizeOpenSettingsArgs(args) {
    if (!isObject(args)) {
        args = {};
    }
    let sanitizedObject = {
        focusSearch: sanitizeBoolean(args?.focusSearch),
        openToSide: sanitizeBoolean(args?.openToSide),
        query: sanitizeString(args?.query)
    };
    if (isString(args?.revealSetting?.key)) {
        sanitizedObject = {
            ...sanitizedObject,
            revealSetting: {
                key: args.revealSetting.key,
                edit: sanitizeBoolean(args.revealSetting?.edit)
            }
        };
    }
    return sanitizedObject;
}
let PreferencesActionsContribution = class PreferencesActionsContribution extends Disposable {
    static { this.ID = 'workbench.contrib.preferencesActions'; }
    constructor(environmentService, userDataProfileService, preferencesService, workspaceContextService, labelService, extensionService, userDataProfilesService) {
        super();
        this.environmentService = environmentService;
        this.userDataProfileService = userDataProfileService;
        this.preferencesService = preferencesService;
        this.workspaceContextService = workspaceContextService;
        this.labelService = labelService;
        this.extensionService = extensionService;
        this.userDataProfilesService = userDataProfilesService;
        this.registerSettingsActions();
        this.registerKeybindingsActions();
        this.updatePreferencesEditorMenuItem();
        this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.updatePreferencesEditorMenuItem()));
        this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.updatePreferencesEditorMenuItemForWorkspaceFolders()));
    }
    registerSettingsActions() {
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_COMMAND_OPEN_SETTINGS,
                    title: {
                        ...nls.localize2('settings', "Settings"),
                        mnemonicTitle: nls.localize({ key: 'miOpenSettings', comment: ['&& denotes a mnemonic'] }, "&&Settings"),
                    },
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null,
                        primary: 2048 /* KeyMod.CtrlCmd */ | 87 /* KeyCode.Comma */,
                    },
                    menu: [{
                            id: MenuId.GlobalActivity,
                            group: '2_configuration',
                            order: 2
                        }, {
                            id: MenuId.MenubarPreferencesMenu,
                            group: '2_configuration',
                            order: 2
                        }],
                });
            }
            run(accessor, args) {
                // args takes a string for backcompat
                const opts = typeof args === 'string' ? { query: args } : sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openSettings(opts);
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openSettings2',
                    title: nls.localize2('openSettings2', "Open Settings (UI)"),
                    category,
                    f1: true,
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openSettings({ jsonEditor: false, ...args });
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openSettingsJson',
                    title: OPEN_USER_SETTINGS_JSON_TITLE,
                    metadata: {
                        description: nls.localize2('workbench.action.openSettingsJson.description', "Opens the JSON file containing the current user profile settings")
                    },
                    category,
                    f1: true,
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openSettings({ jsonEditor: true, ...args });
            }
        }));
        const that = this;
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openApplicationSettingsJson',
                    title: OPEN_APPLICATION_SETTINGS_JSON_TITLE,
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: ContextKeyExpr.notEquals(CURRENT_PROFILE_CONTEXT.key, that.userDataProfilesService.defaultProfile.id)
                    }
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openApplicationSettings({ jsonEditor: true, ...args });
            }
        }));
        // Opens the User tab of the Settings editor
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openGlobalSettings',
                    title: nls.localize2('openGlobalSettings', "Open User Settings"),
                    category,
                    f1: true,
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openUserSettings(args);
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openRawDefaultSettings',
                    title: nls.localize2('openRawDefaultSettings', "Open Default Settings (JSON)"),
                    category,
                    f1: true,
                });
            }
            run(accessor) {
                return accessor.get(IPreferencesService).openRawDefaultSettings();
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: ConfigureLanguageBasedSettingsAction.ID,
                    title: ConfigureLanguageBasedSettingsAction.LABEL,
                    category,
                    f1: true,
                });
            }
            run(accessor) {
                return accessor.get(IInstantiationService).createInstance(ConfigureLanguageBasedSettingsAction, ConfigureLanguageBasedSettingsAction.ID, ConfigureLanguageBasedSettingsAction.LABEL.value).run();
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openWorkspaceSettings',
                    title: nls.localize2('openWorkspaceSettings', "Open Workspace Settings"),
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.notEqualsTo('empty')
                    }
                });
            }
            run(accessor, args) {
                // Match the behaviour of workbench.action.openSettings
                args = typeof args === 'string' ? { query: args } : sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openWorkspaceSettings(args);
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openAccessibilitySettings',
                    title: nls.localize2('openAccessibilitySettings', "Open Accessibility Settings"),
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.notEqualsTo('empty')
                    }
                });
            }
            async run(accessor) {
                await accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:accessibility' });
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openWorkspaceSettingsFile',
                    title: nls.localize2('openWorkspaceSettingsFile', "Open Workspace Settings (JSON)"),
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.notEqualsTo('empty')
                    }
                });
            }
            run(accessor, args) {
                args = sanitizeOpenSettingsArgs(args);
                return accessor.get(IPreferencesService).openWorkspaceSettings({ jsonEditor: true, ...args });
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openFolderSettings',
                    title: nls.localize2('openFolderSettings', "Open Folder Settings"),
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.isEqualTo('workspace')
                    }
                });
            }
            async run(accessor, args) {
                const commandService = accessor.get(ICommandService);
                const preferencesService = accessor.get(IPreferencesService);
                const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
                if (workspaceFolder) {
                    args = sanitizeOpenSettingsArgs(args);
                    await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, ...args });
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openFolderSettingsFile',
                    title: nls.localize2('openFolderSettingsFile', "Open Folder Settings (JSON)"),
                    category,
                    menu: {
                        id: MenuId.CommandPalette,
                        when: WorkbenchStateContext.isEqualTo('workspace')
                    }
                });
            }
            async run(accessor, args) {
                const commandService = accessor.get(ICommandService);
                const preferencesService = accessor.get(IPreferencesService);
                const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
                if (workspaceFolder) {
                    args = sanitizeOpenSettingsArgs(args);
                    await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri, jsonEditor: true, ...args });
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: '_workbench.action.openFolderSettings',
                    title: nls.localize('openFolderSettings', "Open Folder Settings"),
                    category,
                    menu: {
                        id: MenuId.ExplorerContext,
                        group: '2_workspace',
                        order: 20,
                        when: ContextKeyExpr.and(ExplorerRootContext, ExplorerFolderContext)
                    }
                });
            }
            async run(accessor, resource) {
                if (URI.isUri(resource)) {
                    await accessor.get(IPreferencesService).openFolderSettings({ folderUri: resource });
                }
                else {
                    const commandService = accessor.get(ICommandService);
                    const preferencesService = accessor.get(IPreferencesService);
                    const workspaceFolder = await commandService.executeCommand(PICK_WORKSPACE_FOLDER_COMMAND_ID);
                    if (workspaceFolder) {
                        await preferencesService.openFolderSettings({ folderUri: workspaceFolder.uri });
                    }
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
                    title: nls.localize({ key: 'miOpenOnlineSettings', comment: ['&& denotes a mnemonic'] }, "&&Online Services Settings"),
                    menu: {
                        id: MenuId.MenubarPreferencesMenu,
                        group: '3_settings',
                        order: 1,
                    }
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof SettingsEditor2) {
                    editorPane.focusSearch(`@tag:usesOnlineServices`);
                }
                else {
                    accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:usesOnlineServices' });
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED,
                    title: nls.localize2('filterUntrusted', "Show untrusted workspace settings"),
                });
            }
            run(accessor) {
                accessor.get(IPreferencesService).openWorkspaceSettings({ jsonEditor: false, query: `@tag:${REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}` });
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_COMMAND_FILTER_TELEMETRY,
                    title: nls.localize({ key: 'miOpenTelemetrySettings', comment: ['&& denotes a mnemonic'] }, "&&Telemetry Settings")
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof SettingsEditor2) {
                    editorPane.focusSearch(`@tag:telemetry`);
                }
                else {
                    accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: '@tag:telemetry' });
                }
            }
        }));
        this.registerSettingsEditorActions();
        this.extensionService.whenInstalledExtensionsRegistered()
            .then(() => {
            const remoteAuthority = this.environmentService.remoteAuthority;
            const hostLabel = this.labelService.getHostLabel(Schemas.vscodeRemote, remoteAuthority) || remoteAuthority;
            this._register(registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openRemoteSettings',
                        title: nls.localize2('openRemoteSettings', "Open Remote Settings ({0})", hostLabel),
                        category,
                        menu: {
                            id: MenuId.CommandPalette,
                            when: RemoteNameContext.notEqualsTo('')
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(IPreferencesService).openRemoteSettings(args);
                }
            }));
            this._register(registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: 'workbench.action.openRemoteSettingsFile',
                        title: nls.localize2('openRemoteSettingsJSON', "Open Remote Settings (JSON) ({0})", hostLabel),
                        category,
                        menu: {
                            id: MenuId.CommandPalette,
                            when: RemoteNameContext.notEqualsTo('')
                        }
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(IPreferencesService).openRemoteSettings({ jsonEditor: true, ...args });
                }
            }));
        });
    }
    registerSettingsEditorActions() {
        function getPreferencesEditor(accessor) {
            const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
            if (activeEditorPane instanceof SettingsEditor2) {
                return activeEditorPane;
            }
            return null;
        }
        function settingsEditorFocusSearch(accessor) {
            const preferencesEditor = getPreferencesEditor(accessor);
            preferencesEditor?.focusSearch();
        }
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_SEARCH,
                    precondition: CONTEXT_SETTINGS_EDITOR,
                    keybinding: {
                        primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: null
                    },
                    category,
                    f1: true,
                    title: nls.localize2('settings.focusSearch', "Focus Settings Search")
                });
            }
            run(accessor) { settingsEditorFocusSearch(accessor); }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                    precondition: CONTEXT_SETTINGS_EDITOR,
                    keybinding: {
                        primary: 9 /* KeyCode.Escape */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: CONTEXT_SETTINGS_SEARCH_FOCUS
                    },
                    category,
                    f1: true,
                    title: nls.localize2('settings.clearResults', "Clear Settings Search Results")
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                preferencesEditor?.clearSearchResults();
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
                    precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, SuggestContext.Visible.toNegated()),
                    keybinding: {
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: 100 /* KeybindingWeight.EditorContrib */,
                        when: null
                    },
                    title: nls.localize('settings.focusFile', "Focus settings file")
                });
            }
            run(accessor, args) {
                const preferencesEditor = getPreferencesEditor(accessor);
                preferencesEditor?.focusSettings();
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH,
                    precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_SEARCH_FOCUS, SuggestContext.Visible.toNegated()),
                    keybinding: {
                        primary: 18 /* KeyCode.DownArrow */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null
                    },
                    title: nls.localize('settings.focusFile', "Focus settings file")
                });
            }
            run(accessor, args) {
                const preferencesEditor = getPreferencesEditor(accessor);
                preferencesEditor?.focusSettings();
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST,
                    precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_TOC_ROW_FOCUS),
                    keybinding: {
                        primary: 3 /* KeyCode.Enter */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null
                    },
                    title: nls.localize('settings.focusSettingsList', "Focus settings list")
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (preferencesEditor instanceof SettingsEditor2) {
                    preferencesEditor.focusSettings();
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_TOC,
                    precondition: CONTEXT_SETTINGS_EDITOR,
                    f1: true,
                    keybinding: [
                        {
                            primary: 15 /* KeyCode.LeftArrow */,
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when: CONTEXT_SETTINGS_ROW_FOCUS
                        }
                    ],
                    category,
                    title: nls.localize2('settings.focusSettingsTOC', "Focus Settings Table of Contents")
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (!(preferencesEditor instanceof SettingsEditor2)) {
                    return;
                }
                preferencesEditor.focusTOC();
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL,
                    precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_ROW_FOCUS),
                    keybinding: {
                        primary: 3 /* KeyCode.Enter */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    },
                    title: nls.localize('settings.focusSettingControl', "Focus Setting Control")
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (!(preferencesEditor instanceof SettingsEditor2)) {
                    return;
                }
                const activeElement = preferencesEditor.getContainer()?.ownerDocument.activeElement;
                if (activeElement?.classList.contains('monaco-list')) {
                    preferencesEditor.focusSettings(true);
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU,
                    precondition: CONTEXT_SETTINGS_EDITOR,
                    keybinding: {
                        primary: 1024 /* KeyMod.Shift */ | 67 /* KeyCode.F9 */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null
                    },
                    f1: true,
                    category,
                    title: nls.localize2('settings.showContextMenu', "Show Setting Context Menu")
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (preferencesEditor instanceof SettingsEditor2) {
                    preferencesEditor.showContextMenu();
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_FOCUS_UP,
                    precondition: ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_SEARCH_FOCUS.toNegated(), CONTEXT_SETTINGS_JSON_EDITOR.toNegated()),
                    keybinding: {
                        primary: 9 /* KeyCode.Escape */,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: null
                    },
                    f1: true,
                    category,
                    title: nls.localize2('settings.focusLevelUp', "Move Focus Up One Level")
                });
            }
            run(accessor) {
                const preferencesEditor = getPreferencesEditor(accessor);
                if (!(preferencesEditor instanceof SettingsEditor2)) {
                    return;
                }
                if (preferencesEditor.currentFocusContext === 3 /* SettingsFocusContext.SettingControl */) {
                    preferencesEditor.focusSettings();
                }
                else if (preferencesEditor.currentFocusContext === 2 /* SettingsFocusContext.SettingTree */) {
                    preferencesEditor.focusTOC();
                }
                else if (preferencesEditor.currentFocusContext === 1 /* SettingsFocusContext.TableOfContents */) {
                    preferencesEditor.focusSearch();
                }
            }
        }));
    }
    registerKeybindingsActions() {
        const that = this;
        const category = nls.localize2('preferences', "Preferences");
        const id = 'workbench.action.openGlobalKeybindings';
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id,
                    title: nls.localize2('openGlobalKeybindings', "Open Keyboard Shortcuts"),
                    shortTitle: nls.localize('keyboardShortcuts', "Keyboard Shortcuts"),
                    category,
                    icon: preferencesOpenSettingsIcon,
                    keybinding: {
                        when: null,
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 49 /* KeyCode.KeyS */)
                    },
                    menu: [
                        { id: MenuId.CommandPalette },
                        {
                            id: MenuId.EditorTitle,
                            when: ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString()),
                            group: 'navigation',
                            order: 1,
                        },
                        {
                            id: MenuId.GlobalActivity,
                            group: '2_configuration',
                            order: 4
                        }
                    ]
                });
            }
            run(accessor, args) {
                const query = typeof args === 'string' ? args : undefined;
                return accessor.get(IPreferencesService).openGlobalKeybindingSettings(false, { query });
            }
        }));
        this._register(MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
            command: {
                id,
                title: nls.localize('keyboardShortcuts', "Keyboard Shortcuts"),
            },
            group: '2_configuration',
            order: 4
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openDefaultKeybindingsFile',
                    title: nls.localize2('openDefaultKeybindingsFile', "Open Default Keyboard Shortcuts (JSON)"),
                    category,
                    menu: { id: MenuId.CommandPalette }
                });
            }
            run(accessor) {
                return accessor.get(IPreferencesService).openDefaultKeybindingsFile();
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: 'workbench.action.openGlobalKeybindingsFile',
                    title: nls.localize2('openGlobalKeybindingsFile', "Open Keyboard Shortcuts (JSON)"),
                    category,
                    icon: preferencesOpenSettingsIcon,
                    menu: [
                        { id: MenuId.CommandPalette },
                        {
                            id: MenuId.EditorTitle,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                            group: 'navigation',
                        }
                    ]
                });
            }
            run(accessor) {
                return accessor.get(IPreferencesService).openGlobalKeybindingSettings(true);
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
                    title: nls.localize2('showDefaultKeybindings', "Show System Keybindings"),
                    menu: [
                        {
                            id: MenuId.EditorTitle,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                            group: '1_keyboard_preferences_actions'
                        }
                    ]
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.search('@source:system');
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
                    title: nls.localize2('showExtensionKeybindings', "Show Extension Keybindings"),
                    menu: [
                        {
                            id: MenuId.EditorTitle,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                            group: '1_keyboard_preferences_actions'
                        }
                    ]
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.search('@source:extension');
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
                    title: nls.localize2('showUserKeybindings', "Show User Keybindings"),
                    menu: [
                        {
                            id: MenuId.EditorTitle,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                            group: '1_keyboard_preferences_actions'
                        }
                    ]
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.search('@source:user');
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
                    title: nls.localize('clear', "Clear Search Results"),
                    keybinding: {
                        weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                        when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
                        primary: 9 /* KeyCode.Escape */,
                    }
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.clearSearchResults();
                }
            }
        }));
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY,
                    title: nls.localize('clearHistory', "Clear Keyboard Shortcuts Search History"),
                    category,
                    menu: [
                        {
                            id: MenuId.CommandPalette,
                            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
                        }
                    ]
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.clearKeyboardShortcutSearchHistory();
                }
            }
        }));
        this.registerKeybindingEditorActions();
    }
    registerKeybindingEditorActions() {
        const that = this;
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_DEFINE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, CONTEXT_WHEN_FOCUS.toNegated()),
            primary: 3 /* KeyCode.Enter */,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.defineKeybinding(editorPane.activeKeybindingEntry, false);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_ADD,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 31 /* KeyCode.KeyA */),
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.defineKeybinding(editorPane.activeKeybindingEntry, true);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 35 /* KeyCode.KeyE */),
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor && editorPane.activeKeybindingEntry.keybindingItem.keybinding) {
                    editorPane.defineWhenExpression(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_REMOVE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, InputFocusedContext.toNegated()),
            primary: 20 /* KeyCode.Delete */,
            mac: {
                primary: 2048 /* KeyMod.CtrlCmd */ | 1 /* KeyCode.Backspace */
            },
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.removeKeybinding(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_RESET,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: 0,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.resetKeybinding(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_SEARCH,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
            primary: 2048 /* KeyMod.CtrlCmd */ | 36 /* KeyCode.KeyF */,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.focusSearch();
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
            primary: 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 41 /* KeyCode.KeyK */ },
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.recordSearchKeys();
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
            primary: 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */,
            mac: { primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 46 /* KeyCode.KeyP */ },
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.toggleSortByPrecedence();
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: 0,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.showSimilarKeybindings(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_COPY,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS, CONTEXT_WHEN_FOCUS.negate()),
            primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
            handler: async (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    await editorPane.copyKeybinding(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: 0,
            handler: async (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    await editorPane.copyKeybindingCommand(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDING_FOCUS),
            primary: 0,
            handler: async (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    await editorPane.copyKeybindingCommandTitle(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_KEYBINDINGS_SEARCH_FOCUS),
            primary: 2048 /* KeyMod.CtrlCmd */ | 18 /* KeyCode.DownArrow */,
            handler: (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.focusKeybindings();
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_WHEN_FOCUS, SuggestContext.Visible.toNegated()),
            primary: 9 /* KeyCode.Escape */,
            handler: async (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.rejectWhenExpression(editorPane.activeKeybindingEntry);
                }
            }
        });
        KeybindingsRegistry.registerCommandAndKeybindingRule({
            id: KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN,
            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
            when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR, CONTEXT_WHEN_FOCUS, SuggestContext.Visible.toNegated()),
            primary: 3 /* KeyCode.Enter */,
            handler: async (accessor, args) => {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof KeybindingsEditor) {
                    editorPane.acceptWhenExpression(editorPane.activeKeybindingEntry);
                }
            }
        });
        const profileScopedActionDisposables = this._register(new DisposableStore());
        const registerProfileScopedActions = () => {
            profileScopedActionDisposables.clear();
            profileScopedActionDisposables.add(registerAction2(class DefineKeybindingAction extends Action2 {
                constructor() {
                    const when = ResourceContextKey.Resource.isEqualTo(that.userDataProfileService.currentProfile.keybindingsResource.toString());
                    super({
                        id: 'editor.action.defineKeybinding',
                        title: nls.localize2('defineKeybinding.start', "Define Keybinding"),
                        f1: true,
                        precondition: when,
                        keybinding: {
                            weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                            when,
                            primary: KeyChord(2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */, 2048 /* KeyMod.CtrlCmd */ | 41 /* KeyCode.KeyK */)
                        },
                        menu: {
                            id: MenuId.EditorContent,
                            when,
                        }
                    });
                }
                async run(accessor) {
                    const codeEditor = accessor.get(IEditorService).activeTextEditorControl;
                    if (isCodeEditor(codeEditor)) {
                        codeEditor.getContribution(DEFINE_KEYBINDING_EDITOR_CONTRIB_ID)?.showDefineKeybindingWidget();
                    }
                }
            }));
        };
        registerProfileScopedActions();
        this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => registerProfileScopedActions()));
    }
    updatePreferencesEditorMenuItem() {
        const commandId = '_workbench.openWorkspaceSettingsEditor';
        if (this.workspaceContextService.getWorkbenchState() === 3 /* WorkbenchState.WORKSPACE */ && !CommandsRegistry.getCommand(commandId)) {
            CommandsRegistry.registerCommand(commandId, () => this.preferencesService.openWorkspaceSettings({ jsonEditor: false }));
            MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
                command: {
                    id: commandId,
                    title: OPEN_USER_SETTINGS_UI_TITLE,
                    icon: preferencesOpenSettingsIcon
                },
                when: ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.preferencesService.workspaceSettingsResource.toString()), WorkbenchStateContext.isEqualTo('workspace'), ContextKeyExpr.not('isInDiffEditor')),
                group: 'navigation',
                order: 1
            });
        }
        this.updatePreferencesEditorMenuItemForWorkspaceFolders();
    }
    updatePreferencesEditorMenuItemForWorkspaceFolders() {
        for (const folder of this.workspaceContextService.getWorkspace().folders) {
            const commandId = `_workbench.openFolderSettings.${folder.uri.toString()}`;
            if (!CommandsRegistry.getCommand(commandId)) {
                CommandsRegistry.registerCommand(commandId, () => {
                    if (this.workspaceContextService.getWorkbenchState() === 2 /* WorkbenchState.FOLDER */) {
                        return this.preferencesService.openWorkspaceSettings({ jsonEditor: false });
                    }
                    else {
                        return this.preferencesService.openFolderSettings({ folderUri: folder.uri, jsonEditor: false });
                    }
                });
                MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
                    command: {
                        id: commandId,
                        title: OPEN_USER_SETTINGS_UI_TITLE,
                        icon: preferencesOpenSettingsIcon
                    },
                    when: ContextKeyExpr.and(ResourceContextKey.Resource.isEqualTo(this.preferencesService.getFolderSettingsResource(folder.uri).toString()), ContextKeyExpr.not('isInDiffEditor')),
                    group: 'navigation',
                    order: 1
                });
            }
        }
    }
};
PreferencesActionsContribution = __decorate([
    __param(0, IWorkbenchEnvironmentService),
    __param(1, IUserDataProfileService),
    __param(2, IPreferencesService),
    __param(3, IWorkspaceContextService),
    __param(4, ILabelService),
    __param(5, IExtensionService),
    __param(6, IUserDataProfilesService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], PreferencesActionsContribution);
let SettingsEditorTitleContribution = class SettingsEditorTitleContribution extends Disposable {
    constructor(userDataProfileService, userDataProfilesService) {
        super();
        this.userDataProfileService = userDataProfileService;
        this.userDataProfilesService = userDataProfilesService;
        this.registerSettingsEditorTitleActions();
    }
    registerSettingsEditorTitleActions() {
        const registerOpenUserSettingsEditorFromJsonActionDisposables = this._register(new MutableDisposable());
        const openUserSettingsEditorWhen = ContextKeyExpr.and(ContextKeyExpr.or(ResourceContextKey.Resource.isEqualTo(this.userDataProfileService.currentProfile.settingsResource.toString()), ResourceContextKey.Resource.isEqualTo(this.userDataProfilesService.defaultProfile.settingsResource.toString())), ContextKeyExpr.not('isInDiffEditor'));
        const registerOpenUserSettingsEditorFromJsonAction = () => {
            registerOpenUserSettingsEditorFromJsonActionDisposables.value = undefined;
            registerOpenUserSettingsEditorFromJsonActionDisposables.value = registerAction2(class extends Action2 {
                constructor() {
                    super({
                        id: '_workbench.openUserSettingsEditor',
                        title: OPEN_USER_SETTINGS_UI_TITLE,
                        icon: preferencesOpenSettingsIcon,
                        menu: [{
                                id: MenuId.EditorTitle,
                                when: openUserSettingsEditorWhen,
                                group: 'navigation',
                                order: 1
                            }]
                    });
                }
                run(accessor, args) {
                    args = sanitizeOpenSettingsArgs(args);
                    return accessor.get(IPreferencesService).openUserSettings({ jsonEditor: false, ...args });
                }
            });
        };
        registerOpenUserSettingsEditorFromJsonAction();
        this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => {
            // Force the action to check the context again.
            registerOpenUserSettingsEditorFromJsonAction();
        }));
        const openSettingsJsonWhen = ContextKeyExpr.and(CONTEXT_SETTINGS_EDITOR, CONTEXT_SETTINGS_JSON_EDITOR.toNegated());
        this._register(registerAction2(class extends Action2 {
            constructor() {
                super({
                    id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON,
                    title: nls.localize2('openSettingsJson', "Open Settings (JSON)"),
                    icon: preferencesOpenSettingsIcon,
                    menu: [{
                            id: MenuId.EditorTitle,
                            when: openSettingsJsonWhen,
                            group: 'navigation',
                            order: 1
                        }]
                });
            }
            run(accessor) {
                const editorPane = accessor.get(IEditorService).activeEditorPane;
                if (editorPane instanceof SettingsEditor2) {
                    return editorPane.switchToSettingsFile();
                }
                return null;
            }
        }));
    }
};
SettingsEditorTitleContribution = __decorate([
    __param(0, IUserDataProfileService),
    __param(1, IUserDataProfilesService),
    __metadata("design:paramtypes", [Object, Object])
], SettingsEditorTitleContribution);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(PreferencesActionsContribution.ID, PreferencesActionsContribution, 1 /* WorkbenchPhase.BlockStartup */);
registerWorkbenchContribution2(PreferencesContribution.ID, PreferencesContribution, 1 /* WorkbenchPhase.BlockStartup */);
workbenchContributionsRegistry.registerWorkbenchContribution(SettingsEditorTitleContribution, 3 /* LifecyclePhase.Restored */);
registerEditorContribution(SettingsEditorContribution.ID, SettingsEditorContribution, 1 /* EditorContributionInstantiation.AfterFirstRender */);
// Preferences menu
MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
    title: nls.localize({ key: 'miPreferences', comment: ['&& denotes a mnemonic'] }, "&&Preferences"),
    submenu: MenuId.MenubarPreferencesMenu,
    group: '5_autosave',
    order: 2,
    when: IsMacNativeContext.toNegated() // on macOS native the preferences menu is separate under the application menu
});
