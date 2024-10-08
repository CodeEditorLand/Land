/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { DEFAULT_EDITOR_ASSOCIATION } from '../../../common/editor.js';
export var SettingValueType;
(function (SettingValueType) {
    SettingValueType["Null"] = "null";
    SettingValueType["Enum"] = "enum";
    SettingValueType["String"] = "string";
    SettingValueType["MultilineString"] = "multiline-string";
    SettingValueType["Integer"] = "integer";
    SettingValueType["Number"] = "number";
    SettingValueType["Boolean"] = "boolean";
    SettingValueType["Array"] = "array";
    SettingValueType["Exclude"] = "exclude";
    SettingValueType["Include"] = "include";
    SettingValueType["Complex"] = "complex";
    SettingValueType["NullableInteger"] = "nullable-integer";
    SettingValueType["NullableNumber"] = "nullable-number";
    SettingValueType["Object"] = "object";
    SettingValueType["BooleanObject"] = "boolean-object";
    SettingValueType["LanguageTag"] = "language-tag";
    SettingValueType["ExtensionToggle"] = "extension-toggle";
})(SettingValueType || (SettingValueType = {}));
/**
 * The ways a setting could match a query,
 * sorted in increasing order of relevance.
 */
export var SettingMatchType;
(function (SettingMatchType) {
    SettingMatchType[SettingMatchType["None"] = 0] = "None";
    SettingMatchType[SettingMatchType["LanguageTagSettingMatch"] = 1] = "LanguageTagSettingMatch";
    SettingMatchType[SettingMatchType["RemoteMatch"] = 2] = "RemoteMatch";
    SettingMatchType[SettingMatchType["DescriptionOrValueMatch"] = 4] = "DescriptionOrValueMatch";
    SettingMatchType[SettingMatchType["KeyMatch"] = 8] = "KeyMatch";
})(SettingMatchType || (SettingMatchType = {}));
export function validateSettingsEditorOptions(options) {
    return {
        // Inherit provided options
        ...options,
        // Enforce some options for settings specifically
        override: DEFAULT_EDITOR_ASSOCIATION.id,
        pinned: true
    };
}
export const IPreferencesService = createDecorator('preferencesService');
export const DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = 'editor.contrib.defineKeybinding';
export const FOLDER_SETTINGS_PATH = '.vscode/settings.json';
export const DEFAULT_SETTINGS_EDITOR_SETTING = 'workbench.settings.openDefaultSettings';
export const USE_SPLIT_JSON_SETTING = 'workbench.settings.useSplitJSON';
export const SETTINGS_AUTHORITY = 'settings';
