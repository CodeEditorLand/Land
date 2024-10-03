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
var AbstractSettingRenderer_1, CopySettingIdAction_1, CopySettingAsJSONAction_1, CopySettingAsURLAction_1, SyncSettingAction_1, ApplySettingToAllProfilesAction_1;
import { BrowserFeatures } from '../../../../base/browser/canIUse.js';
import * as DOM from '../../../../base/browser/dom.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import { renderMarkdownAsPlaintext } from '../../../../base/browser/markdownRenderer.js';
import * as aria from '../../../../base/browser/ui/aria/aria.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { SimpleIconLabel } from '../../../../base/browser/ui/iconLabel/simpleIconLabel.js';
import { InputBox } from '../../../../base/browser/ui/inputbox/inputBox.js';
import { CachedListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { DefaultStyleController } from '../../../../base/browser/ui/list/listWidget.js';
import { SelectBox } from '../../../../base/browser/ui/selectBox/selectBox.js';
import { Toggle, unthemedToggleStyles } from '../../../../base/browser/ui/toggle/toggle.js';
import { ToolBar } from '../../../../base/browser/ui/toolbar/toolbar.js';
import { RenderIndentGuides } from '../../../../base/browser/ui/tree/abstractTree.js';
import { ObjectTreeModel } from '../../../../base/browser/ui/tree/objectTreeModel.js';
import { Action, Separator } from '../../../../base/common/actions.js';
import { distinct } from '../../../../base/common/arrays.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, DisposableStore, dispose, isDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { isIOS } from '../../../../base/common/platform.js';
import { escapeRegExpCharacters } from '../../../../base/common/strings.js';
import { isDefined, isUndefinedOrNull } from '../../../../base/common/types.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { MarkdownRenderer } from '../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js';
import { localize } from '../../../../nls.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService, getLanguageTagSettingPlainKey } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService, IContextViewService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IListService, WorkbenchObjectTree } from '../../../../platform/list/browser/listService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { defaultButtonStyles, getInputBoxStyle, getListStyles, getSelectBoxStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { editorBackground, foreground } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { getIgnoredSettings } from '../../../../platform/userDataSync/common/settingsMerge.js';
import { IUserDataSyncEnablementService, getDefaultIgnoredSettings } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
import { settingsMoreActionIcon } from './preferencesIcons.js';
import { SettingsTreeIndicatorsLabel, getIndicatorsLabelAriaLabel } from './settingsEditorSettingIndicators.js';
import { SettingsTreeGroupElement, SettingsTreeNewExtensionsElement, SettingsTreeSettingElement, inspectSetting, objectSettingSupportsRemoveDefaultValue, settingKeyToDisplayFormat } from './settingsTreeModels.js';
import { ExcludeSettingWidget, IncludeSettingWidget, ListSettingWidget, ObjectSettingCheckboxWidget, ObjectSettingDropdownWidget } from './settingsWidgets.js';
import { LANGUAGE_SETTING_TAG, SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU, compareTwoNullableNumbers } from '../common/preferences.js';
import { settingsNumberInputBackground, settingsNumberInputBorder, settingsNumberInputForeground, settingsSelectBackground, settingsSelectBorder, settingsSelectForeground, settingsSelectListBorder, settingsTextInputBackground, settingsTextInputBorder, settingsTextInputForeground } from '../common/settingsEditorColorRegistry.js';
import { APPLY_ALL_PROFILES_SETTING, IWorkbenchConfigurationService } from '../../../services/configuration/common/configuration.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { SETTINGS_AUTHORITY, SettingValueType } from '../../../services/preferences/common/preferences.js';
import { getInvalidTypeError } from '../../../services/preferences/common/preferencesValidation.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { URI } from '../../../../base/common/uri.js';
const $ = DOM.$;
function getIncludeExcludeDisplayValue(element) {
    const elementDefaultValue = typeof element.defaultValue === 'object'
        ? element.defaultValue ?? {}
        : {};
    const data = element.isConfigured ?
        { ...elementDefaultValue, ...element.scopeValue } :
        elementDefaultValue;
    return Object.keys(data)
        .filter(key => !!data[key])
        .map(key => {
        const defaultValue = elementDefaultValue[key];
        let source;
        if (defaultValue === data[key] && element.setting.type === 'object' && element.defaultValueSource instanceof Map) {
            const defaultSource = element.defaultValueSource.get(`${element.setting.key}.${key}`);
            source = typeof defaultSource === 'string' ? defaultSource : defaultSource?.displayName;
        }
        const value = data[key];
        const sibling = typeof value === 'boolean' ? undefined : value.when;
        return {
            value: {
                type: 'string',
                data: key
            },
            sibling,
            elementType: element.valueType,
            source
        };
    });
}
function areAllPropertiesDefined(properties, itemsToDisplay) {
    const staticProperties = new Set(properties);
    itemsToDisplay.forEach(({ key }) => staticProperties.delete(key.data));
    return staticProperties.size === 0;
}
function getEnumOptionsFromSchema(schema) {
    if (schema.anyOf) {
        return schema.anyOf.map(getEnumOptionsFromSchema).flat();
    }
    const enumDescriptions = schema.enumDescriptions ?? [];
    return (schema.enum ?? []).map((value, idx) => {
        const description = idx < enumDescriptions.length
            ? enumDescriptions[idx]
            : undefined;
        return { value, description };
    });
}
function getObjectValueType(schema) {
    if (schema.anyOf) {
        const subTypes = schema.anyOf.map(getObjectValueType);
        if (subTypes.some(type => type === 'enum')) {
            return 'enum';
        }
        return 'string';
    }
    if (schema.type === 'boolean') {
        return 'boolean';
    }
    else if (schema.type === 'string' && isDefined(schema.enum) && schema.enum.length > 0) {
        return 'enum';
    }
    else {
        return 'string';
    }
}
function getObjectEntryValueDisplayValue(type, data, options) {
    if (type === 'boolean') {
        return { type, data: !!data };
    }
    else if (type === 'enum') {
        return { type, data: '' + data, options };
    }
    else {
        return { type, data: '' + data };
    }
}
function getObjectDisplayValue(element) {
    const elementDefaultValue = typeof element.defaultValue === 'object'
        ? element.defaultValue ?? {}
        : {};
    const elementScopeValue = typeof element.scopeValue === 'object'
        ? element.scopeValue ?? {}
        : {};
    const data = element.isConfigured ?
        { ...elementDefaultValue, ...elementScopeValue } :
        elementDefaultValue;
    const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
    const patternsAndSchemas = Object
        .entries(objectPatternProperties ?? {})
        .map(([pattern, schema]) => ({
        pattern: new RegExp(pattern),
        schema
    }));
    const wellDefinedKeyEnumOptions = Object.entries(objectProperties ?? {}).map(([key, schema]) => ({ value: key, description: schema.description }));
    return Object.keys(data).map(key => {
        const defaultValue = elementDefaultValue[key];
        let source;
        if (defaultValue === data[key] && element.setting.type === 'object' && element.defaultValueSource instanceof Map) {
            const defaultSource = element.defaultValueSource.get(`${element.setting.key}.${key}`);
            source = typeof defaultSource === 'string' ? defaultSource : defaultSource?.displayName;
        }
        if (isDefined(objectProperties) && key in objectProperties) {
            const valueEnumOptions = getEnumOptionsFromSchema(objectProperties[key]);
            return {
                key: {
                    type: 'enum',
                    data: key,
                    options: wellDefinedKeyEnumOptions,
                },
                value: getObjectEntryValueDisplayValue(getObjectValueType(objectProperties[key]), data[key], valueEnumOptions),
                keyDescription: objectProperties[key].description,
                removable: isUndefinedOrNull(defaultValue),
                resetable: !isUndefinedOrNull(defaultValue),
                source
            };
        }
        const removable = defaultValue === undefined || objectSettingSupportsRemoveDefaultValue(element.setting.key);
        const resetable = !!defaultValue && defaultValue !== data[key];
        const schema = patternsAndSchemas.find(({ pattern }) => pattern.test(key))?.schema;
        if (schema) {
            const valueEnumOptions = getEnumOptionsFromSchema(schema);
            return {
                key: { type: 'string', data: key },
                value: getObjectEntryValueDisplayValue(getObjectValueType(schema), data[key], valueEnumOptions),
                keyDescription: schema.description,
                removable,
                resetable,
                source
            };
        }
        const additionalValueEnums = getEnumOptionsFromSchema(typeof objectAdditionalProperties === 'boolean'
            ? {}
            : objectAdditionalProperties ?? {});
        return {
            key: { type: 'string', data: key },
            value: getObjectEntryValueDisplayValue(typeof objectAdditionalProperties === 'object' ? getObjectValueType(objectAdditionalProperties) : 'string', data[key], additionalValueEnums),
            keyDescription: typeof objectAdditionalProperties === 'object' ? objectAdditionalProperties.description : undefined,
            removable,
            resetable,
            source
        };
    }).filter(item => !isUndefinedOrNull(item.value.data));
}
function getBoolObjectDisplayValue(element) {
    const elementDefaultValue = typeof element.defaultValue === 'object'
        ? element.defaultValue ?? {}
        : {};
    const elementScopeValue = typeof element.scopeValue === 'object'
        ? element.scopeValue ?? {}
        : {};
    const data = element.isConfigured ?
        { ...elementDefaultValue, ...elementScopeValue } :
        elementDefaultValue;
    const { objectProperties } = element.setting;
    const displayValues = [];
    for (const key in objectProperties) {
        const defaultValue = elementDefaultValue[key];
        let source;
        if (defaultValue === data[key] && element.setting.type === 'object' && element.defaultValueSource instanceof Map) {
            const defaultSource = element.defaultValueSource.get(key);
            source = typeof defaultSource === 'string' ? defaultSource : defaultSource?.displayName;
        }
        displayValues.push({
            key: {
                type: 'string',
                data: key
            },
            value: {
                type: 'boolean',
                data: !!data[key]
            },
            keyDescription: objectProperties[key].description,
            removable: false,
            resetable: true,
            source
        });
    }
    return displayValues;
}
function createArraySuggester(element) {
    return (keys, idx) => {
        const enumOptions = [];
        if (element.setting.enum) {
            element.setting.enum.forEach((key, i) => {
                if (!element.setting.uniqueItems || (idx !== undefined && key === keys[idx]) || !keys.includes(key)) {
                    const description = element.setting.enumDescriptions?.[i];
                    enumOptions.push({ value: key, description });
                }
            });
        }
        return enumOptions.length > 0
            ? { type: 'enum', data: enumOptions[0].value, options: enumOptions }
            : undefined;
    };
}
function createObjectKeySuggester(element) {
    const { objectProperties } = element.setting;
    const allStaticKeys = Object.keys(objectProperties ?? {});
    return keys => {
        const existingKeys = new Set(keys);
        const enumOptions = [];
        allStaticKeys.forEach(staticKey => {
            if (!existingKeys.has(staticKey)) {
                enumOptions.push({ value: staticKey, description: objectProperties[staticKey].description });
            }
        });
        return enumOptions.length > 0
            ? { type: 'enum', data: enumOptions[0].value, options: enumOptions }
            : undefined;
    };
}
function createObjectValueSuggester(element) {
    const { objectProperties, objectPatternProperties, objectAdditionalProperties } = element.setting;
    const patternsAndSchemas = Object
        .entries(objectPatternProperties ?? {})
        .map(([pattern, schema]) => ({
        pattern: new RegExp(pattern),
        schema
    }));
    return (key) => {
        let suggestedSchema;
        if (isDefined(objectProperties) && key in objectProperties) {
            suggestedSchema = objectProperties[key];
        }
        const patternSchema = suggestedSchema ?? patternsAndSchemas.find(({ pattern }) => pattern.test(key))?.schema;
        if (isDefined(patternSchema)) {
            suggestedSchema = patternSchema;
        }
        else if (isDefined(objectAdditionalProperties) && typeof objectAdditionalProperties === 'object') {
            suggestedSchema = objectAdditionalProperties;
        }
        if (isDefined(suggestedSchema)) {
            const type = getObjectValueType(suggestedSchema);
            if (type === 'boolean') {
                return { type, data: suggestedSchema.default ?? true };
            }
            else if (type === 'enum') {
                const options = getEnumOptionsFromSchema(suggestedSchema);
                return { type, data: suggestedSchema.default ?? options[0].value, options };
            }
            else {
                return { type, data: suggestedSchema.default ?? '' };
            }
        }
        return;
    };
}
function isNonNullableNumericType(type) {
    return type === 'number' || type === 'integer';
}
function parseNumericObjectValues(dataElement, v) {
    const newRecord = {};
    for (const key in v) {
        let keyMatchesNumericProperty;
        const patternProperties = dataElement.setting.objectPatternProperties;
        const properties = dataElement.setting.objectProperties;
        const additionalProperties = dataElement.setting.objectAdditionalProperties;
        if (properties) {
            for (const propKey in properties) {
                if (propKey === key) {
                    keyMatchesNumericProperty = isNonNullableNumericType(properties[propKey].type);
                    break;
                }
            }
        }
        if (keyMatchesNumericProperty === undefined && patternProperties) {
            for (const patternKey in patternProperties) {
                if (key.match(patternKey)) {
                    keyMatchesNumericProperty = isNonNullableNumericType(patternProperties[patternKey].type);
                    break;
                }
            }
        }
        if (keyMatchesNumericProperty === undefined && additionalProperties && typeof additionalProperties !== 'boolean') {
            if (isNonNullableNumericType(additionalProperties.type)) {
                keyMatchesNumericProperty = true;
            }
        }
        newRecord[key] = keyMatchesNumericProperty ? Number(v[key]) : v[key];
    }
    return newRecord;
}
function getListDisplayValue(element) {
    if (!element.value || !Array.isArray(element.value)) {
        return [];
    }
    if (element.setting.arrayItemType === 'enum') {
        let enumOptions = [];
        if (element.setting.enum) {
            enumOptions = element.setting.enum.map((setting, i) => {
                return {
                    value: setting,
                    description: element.setting.enumDescriptions?.[i]
                };
            });
        }
        return element.value.map((key) => {
            return {
                value: {
                    type: 'enum',
                    data: key,
                    options: enumOptions
                }
            };
        });
    }
    else {
        return element.value.map((key) => {
            return {
                value: {
                    type: 'string',
                    data: key
                }
            };
        });
    }
}
function getShowAddButtonList(dataElement, listDisplayValue) {
    if (dataElement.setting.enum && dataElement.setting.uniqueItems) {
        return dataElement.setting.enum.length - listDisplayValue.length > 0;
    }
    else {
        return true;
    }
}
export function resolveSettingsTree(tocData, coreSettingsGroups, logService) {
    const allSettings = getFlatSettings(coreSettingsGroups);
    return {
        tree: _resolveSettingsTree(tocData, allSettings, logService),
        leftoverSettings: allSettings
    };
}
export function resolveConfiguredUntrustedSettings(groups, target, languageFilter, configurationService) {
    const allSettings = getFlatSettings(groups);
    return [...allSettings].filter(setting => setting.restricted && inspectSetting(setting.key, target, languageFilter, configurationService).isConfigured);
}
export async function createTocTreeForExtensionSettings(extensionService, groups) {
    const extGroupTree = new Map();
    const addEntryToTree = (extensionId, extensionName, childEntry) => {
        if (!extGroupTree.has(extensionId)) {
            const rootEntry = {
                id: extensionId,
                label: extensionName,
                children: []
            };
            extGroupTree.set(extensionId, rootEntry);
        }
        extGroupTree.get(extensionId).children.push(childEntry);
    };
    const processGroupEntry = async (group) => {
        const flatSettings = group.sections.map(section => section.settings).flat();
        const extensionId = group.extensionInfo.id;
        const extension = await extensionService.getExtension(extensionId);
        const extensionName = extension?.displayName ?? extension?.name ?? extensionId;
        const childEntry = {
            id: group.id || group.title,
            label: group.title,
            order: group.order,
            settings: flatSettings
        };
        addEntryToTree(extensionId, extensionName, childEntry);
    };
    const processPromises = groups.map(g => processGroupEntry(g));
    return Promise.all(processPromises).then(() => {
        const extGroups = [];
        for (const extensionRootEntry of extGroupTree.values()) {
            for (const child of extensionRootEntry.children) {
                child.settings?.sort((a, b) => {
                    return compareTwoNullableNumbers(a.order, b.order);
                });
            }
            if (extensionRootEntry.children.length === 1) {
                extGroups.push({
                    id: extensionRootEntry.id,
                    label: extensionRootEntry.children[0].label,
                    settings: extensionRootEntry.children[0].settings
                });
            }
            else {
                extensionRootEntry.children.sort((a, b) => {
                    return compareTwoNullableNumbers(a.order, b.order);
                });
                const ungroupedChild = extensionRootEntry.children.find(child => child.label === extensionRootEntry.label);
                if (ungroupedChild && !ungroupedChild.children) {
                    const groupedChildren = extensionRootEntry.children.filter(child => child !== ungroupedChild);
                    extGroups.push({
                        id: extensionRootEntry.id,
                        label: extensionRootEntry.label,
                        settings: ungroupedChild.settings,
                        children: groupedChildren
                    });
                }
                else {
                    extGroups.push(extensionRootEntry);
                }
            }
        }
        extGroups.sort((a, b) => a.label.localeCompare(b.label));
        return {
            id: 'extensions',
            label: localize('extensions', "Extensions"),
            children: extGroups
        };
    });
}
function _resolveSettingsTree(tocData, allSettings, logService) {
    let children;
    if (tocData.children) {
        children = tocData.children
            .map(child => _resolveSettingsTree(child, allSettings, logService))
            .filter(child => child.children?.length || child.settings?.length);
    }
    let settings;
    if (tocData.settings) {
        settings = tocData.settings.map(pattern => getMatchingSettings(allSettings, pattern, logService)).flat();
    }
    if (!children && !settings) {
        throw new Error(`TOC node has no child groups or settings: ${tocData.id}`);
    }
    return {
        id: tocData.id,
        label: tocData.label,
        children,
        settings
    };
}
const knownDynamicSettingGroups = [
    /^settingsSync\..*/,
    /^sync\..*/,
    /^workbench.fontAliasing$/,
];
function getMatchingSettings(allSettings, pattern, logService) {
    const result = [];
    allSettings.forEach(s => {
        if (settingMatches(s, pattern)) {
            result.push(s);
            allSettings.delete(s);
        }
    });
    if (!result.length && !knownDynamicSettingGroups.some(r => r.test(pattern))) {
        logService.warn(`Settings pattern "${pattern}" doesn't match any settings`);
    }
    return result.sort((a, b) => a.key.localeCompare(b.key));
}
const settingPatternCache = new Map();
export function createSettingMatchRegExp(pattern) {
    pattern = escapeRegExpCharacters(pattern)
        .replace(/\\\*/g, '.*');
    return new RegExp(`^${pattern}$`, 'i');
}
function settingMatches(s, pattern) {
    let regExp = settingPatternCache.get(pattern);
    if (!regExp) {
        regExp = createSettingMatchRegExp(pattern);
        settingPatternCache.set(pattern, regExp);
    }
    return regExp.test(s.key);
}
function getFlatSettings(settingsGroups) {
    const result = new Set();
    for (const group of settingsGroups) {
        for (const section of group.sections) {
            for (const s of section.settings) {
                if (!s.overrides || !s.overrides.length) {
                    result.add(s);
                }
            }
        }
    }
    return result;
}
const SETTINGS_TEXT_TEMPLATE_ID = 'settings.text.template';
const SETTINGS_MULTILINE_TEXT_TEMPLATE_ID = 'settings.multilineText.template';
const SETTINGS_NUMBER_TEMPLATE_ID = 'settings.number.template';
const SETTINGS_ENUM_TEMPLATE_ID = 'settings.enum.template';
const SETTINGS_BOOL_TEMPLATE_ID = 'settings.bool.template';
const SETTINGS_ARRAY_TEMPLATE_ID = 'settings.array.template';
const SETTINGS_EXCLUDE_TEMPLATE_ID = 'settings.exclude.template';
const SETTINGS_INCLUDE_TEMPLATE_ID = 'settings.include.template';
const SETTINGS_OBJECT_TEMPLATE_ID = 'settings.object.template';
const SETTINGS_BOOL_OBJECT_TEMPLATE_ID = 'settings.boolObject.template';
const SETTINGS_COMPLEX_TEMPLATE_ID = 'settings.complex.template';
const SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID = 'settings.newExtensions.template';
const SETTINGS_ELEMENT_TEMPLATE_ID = 'settings.group.template';
const SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID = 'settings.extensionToggle.template';
function removeChildrenFromTabOrder(node) {
    const focusableElements = node.querySelectorAll(`
		[tabindex="0"],
		input:not([tabindex="-1"]),
		select:not([tabindex="-1"]),
		textarea:not([tabindex="-1"]),
		a:not([tabindex="-1"]),
		button:not([tabindex="-1"]),
		area:not([tabindex="-1"])
	`);
    focusableElements.forEach(element => {
        element.setAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR, 'true');
        element.setAttribute('tabindex', '-1');
    });
}
function addChildrenToTabOrder(node) {
    const focusableElements = node.querySelectorAll(`[${AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR}="true"]`);
    focusableElements.forEach(element => {
        element.removeAttribute(AbstractSettingRenderer.ELEMENT_FOCUSABLE_ATTR);
        element.setAttribute('tabindex', '0');
    });
}
let AbstractSettingRenderer = class AbstractSettingRenderer extends Disposable {
    static { AbstractSettingRenderer_1 = this; }
    static { this.CONTROL_CLASS = 'setting-control-focus-target'; }
    static { this.CONTROL_SELECTOR = '.' + this.CONTROL_CLASS; }
    static { this.CONTENTS_CLASS = 'setting-item-contents'; }
    static { this.CONTENTS_SELECTOR = '.' + this.CONTENTS_CLASS; }
    static { this.ALL_ROWS_SELECTOR = '.monaco-list-row'; }
    static { this.SETTING_KEY_ATTR = 'data-key'; }
    static { this.SETTING_ID_ATTR = 'data-id'; }
    static { this.ELEMENT_FOCUSABLE_ATTR = 'data-focusable'; }
    constructor(settingActions, disposableActionFactory, _themeService, _contextViewService, _openerService, _instantiationService, _commandService, _contextMenuService, _keybindingService, _configService, _extensionsService, _extensionsWorkbenchService, _productService, _telemetryService, _hoverService) {
        super();
        this.settingActions = settingActions;
        this.disposableActionFactory = disposableActionFactory;
        this._themeService = _themeService;
        this._contextViewService = _contextViewService;
        this._openerService = _openerService;
        this._instantiationService = _instantiationService;
        this._commandService = _commandService;
        this._contextMenuService = _contextMenuService;
        this._keybindingService = _keybindingService;
        this._configService = _configService;
        this._extensionsService = _extensionsService;
        this._extensionsWorkbenchService = _extensionsWorkbenchService;
        this._productService = _productService;
        this._telemetryService = _telemetryService;
        this._hoverService = _hoverService;
        this._onDidClickOverrideElement = this._register(new Emitter());
        this.onDidClickOverrideElement = this._onDidClickOverrideElement.event;
        this._onDidChangeSetting = this._register(new Emitter());
        this.onDidChangeSetting = this._onDidChangeSetting.event;
        this._onDidOpenSettings = this._register(new Emitter());
        this.onDidOpenSettings = this._onDidOpenSettings.event;
        this._onDidClickSettingLink = this._register(new Emitter());
        this.onDidClickSettingLink = this._onDidClickSettingLink.event;
        this._onDidFocusSetting = this._register(new Emitter());
        this.onDidFocusSetting = this._onDidFocusSetting.event;
        this._onDidChangeIgnoredSettings = this._register(new Emitter());
        this.onDidChangeIgnoredSettings = this._onDidChangeIgnoredSettings.event;
        this._onDidChangeSettingHeight = this._register(new Emitter());
        this.onDidChangeSettingHeight = this._onDidChangeSettingHeight.event;
        this._onApplyFilter = this._register(new Emitter());
        this.onApplyFilter = this._onApplyFilter.event;
        this.markdownRenderer = this._register(_instantiationService.createInstance(MarkdownRenderer, {}));
        this.ignoredSettings = getIgnoredSettings(getDefaultIgnoredSettings(), this._configService);
        this._register(this._configService.onDidChangeConfiguration(e => {
            this.ignoredSettings = getIgnoredSettings(getDefaultIgnoredSettings(), this._configService);
            this._onDidChangeIgnoredSettings.fire();
        }));
    }
    renderCommonTemplate(tree, _container, typeClass) {
        _container.classList.add('setting-item');
        _container.classList.add('setting-item-' + typeClass);
        const toDispose = new DisposableStore();
        const container = DOM.append(_container, $(AbstractSettingRenderer_1.CONTENTS_SELECTOR));
        container.classList.add('settings-row-inner-container');
        const titleElement = DOM.append(container, $('.setting-item-title'));
        const labelCategoryContainer = DOM.append(titleElement, $('.setting-item-cat-label-container'));
        const categoryElement = DOM.append(labelCategoryContainer, $('span.setting-item-category'));
        const labelElementContainer = DOM.append(labelCategoryContainer, $('span.setting-item-label'));
        const labelElement = toDispose.add(new SimpleIconLabel(labelElementContainer));
        const indicatorsLabel = this._instantiationService.createInstance(SettingsTreeIndicatorsLabel, titleElement);
        toDispose.add(indicatorsLabel);
        const descriptionElement = DOM.append(container, $('.setting-item-description'));
        const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
        toDispose.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), modifiedIndicatorElement, () => localize('modified', "The setting has been configured in the current scope.")));
        const valueElement = DOM.append(container, $('.setting-item-value'));
        const controlElement = DOM.append(valueElement, $('div.setting-item-control'));
        const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
        const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
        const toolbar = this.renderSettingToolbar(toolbarContainer);
        const template = {
            toDispose,
            elementDisposables: toDispose.add(new DisposableStore()),
            containerElement: container,
            categoryElement,
            labelElement,
            descriptionElement,
            controlElement,
            deprecationWarningElement,
            indicatorsLabel,
            toolbar
        };
        toDispose.add(DOM.addDisposableListener(controlElement, DOM.EventType.MOUSE_DOWN, e => e.stopPropagation()));
        toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
        toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
        return template;
    }
    addSettingElementFocusHandler(template) {
        const focusTracker = DOM.trackFocus(template.containerElement);
        template.toDispose.add(focusTracker);
        focusTracker.onDidBlur(() => {
            if (template.containerElement.classList.contains('focused')) {
                template.containerElement.classList.remove('focused');
            }
        });
        focusTracker.onDidFocus(() => {
            template.containerElement.classList.add('focused');
            if (template.context) {
                this._onDidFocusSetting.fire(template.context);
            }
        });
    }
    renderSettingToolbar(container) {
        const toggleMenuKeybinding = this._keybindingService.lookupKeybinding(SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU);
        let toggleMenuTitle = localize('settingsContextMenuTitle', "More Actions... ");
        if (toggleMenuKeybinding) {
            toggleMenuTitle += ` (${toggleMenuKeybinding && toggleMenuKeybinding.getLabel()})`;
        }
        const toolbar = new ToolBar(container, this._contextMenuService, {
            toggleMenuTitle,
            renderDropdownAsChildElement: !isIOS,
            moreIcon: settingsMoreActionIcon
        });
        return toolbar;
    }
    renderSettingElement(node, index, template) {
        const element = node.element;
        element.inspectSelf();
        template.context = element;
        template.toolbar.context = element;
        const actions = this.disposableActionFactory(element.setting, element.settingsTarget);
        actions.forEach(a => isDisposable(a) && template.elementDisposables.add(a));
        template.toolbar.setActions([], [...this.settingActions, ...actions]);
        const setting = element.setting;
        template.containerElement.classList.toggle('is-configured', element.isConfigured);
        template.containerElement.setAttribute(AbstractSettingRenderer_1.SETTING_KEY_ATTR, element.setting.key);
        template.containerElement.setAttribute(AbstractSettingRenderer_1.SETTING_ID_ATTR, element.id);
        const titleTooltip = setting.key + (element.isConfigured ? ' - Modified' : '');
        template.categoryElement.textContent = element.displayCategory ? (element.displayCategory + ': ') : '';
        template.elementDisposables.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), template.categoryElement, titleTooltip));
        template.labelElement.text = element.displayLabel;
        template.labelElement.title = titleTooltip;
        template.descriptionElement.innerText = '';
        if (element.setting.descriptionIsMarkdown) {
            const renderedDescription = this.renderSettingMarkdown(element, template.containerElement, element.description, template.elementDisposables);
            template.descriptionElement.appendChild(renderedDescription);
        }
        else {
            template.descriptionElement.innerText = element.description;
        }
        template.indicatorsLabel.updateScopeOverrides(element, this._onDidClickOverrideElement, this._onApplyFilter);
        template.elementDisposables.add(this._configService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(APPLY_ALL_PROFILES_SETTING)) {
                template.indicatorsLabel.updateScopeOverrides(element, this._onDidClickOverrideElement, this._onApplyFilter);
            }
        }));
        const onChange = (value) => this._onDidChangeSetting.fire({
            key: element.setting.key,
            value,
            type: template.context.valueType,
            manualReset: false,
            scope: element.setting.scope
        });
        const deprecationText = element.setting.deprecationMessage || '';
        if (deprecationText && element.setting.deprecationMessageIsMarkdown) {
            template.deprecationWarningElement.innerText = '';
            template.deprecationWarningElement.appendChild(this.renderSettingMarkdown(element, template.containerElement, element.setting.deprecationMessage, template.elementDisposables));
        }
        else {
            template.deprecationWarningElement.innerText = deprecationText;
        }
        template.deprecationWarningElement.prepend($('.codicon.codicon-error'));
        template.containerElement.classList.toggle('is-deprecated', !!deprecationText);
        this.renderValue(element, template, onChange);
        template.indicatorsLabel.updateWorkspaceTrust(element);
        template.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
        template.indicatorsLabel.updateDefaultOverrideIndicator(element);
        template.elementDisposables.add(this.onDidChangeIgnoredSettings(() => {
            template.indicatorsLabel.updateSyncIgnored(element, this.ignoredSettings);
        }));
        this.updateSettingTabbable(element, template);
        template.elementDisposables.add(element.onDidChangeTabbable(() => {
            this.updateSettingTabbable(element, template);
        }));
    }
    updateSettingTabbable(element, template) {
        if (element.tabbable) {
            addChildrenToTabOrder(template.containerElement);
        }
        else {
            removeChildrenFromTabOrder(template.containerElement);
        }
    }
    renderSettingMarkdown(element, container, text, disposables) {
        text = fixSettingLinks(text);
        const renderedMarkdown = this.markdownRenderer.render({ value: text, isTrusted: true }, {
            actionHandler: {
                callback: (content) => {
                    if (content.startsWith('#')) {
                        const e = {
                            source: element,
                            targetKey: content.substring(1)
                        };
                        this._onDidClickSettingLink.fire(e);
                    }
                    else {
                        this._openerService.open(content, { allowCommands: true }).catch(onUnexpectedError);
                    }
                },
                disposables
            },
            asyncRenderCallback: () => {
                const height = container.clientHeight;
                if (height) {
                    this._onDidChangeSettingHeight.fire({ element, height });
                }
            },
        });
        disposables.add(renderedMarkdown);
        renderedMarkdown.element.classList.add('setting-item-markdown');
        cleanRenderedMarkdown(renderedMarkdown.element);
        return renderedMarkdown.element;
    }
    disposeTemplate(template) {
        template.toDispose.dispose();
    }
    disposeElement(_element, _index, template, _height) {
        template.elementDisposables?.clear();
    }
};
AbstractSettingRenderer = AbstractSettingRenderer_1 = __decorate([
    __param(2, IThemeService),
    __param(3, IContextViewService),
    __param(4, IOpenerService),
    __param(5, IInstantiationService),
    __param(6, ICommandService),
    __param(7, IContextMenuService),
    __param(8, IKeybindingService),
    __param(9, IConfigurationService),
    __param(10, IExtensionService),
    __param(11, IExtensionsWorkbenchService),
    __param(12, IProductService),
    __param(13, ITelemetryService),
    __param(14, IHoverService),
    __metadata("design:paramtypes", [Array, Function, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AbstractSettingRenderer);
export { AbstractSettingRenderer };
class SettingGroupRenderer {
    constructor() {
        this.templateId = SETTINGS_ELEMENT_TEMPLATE_ID;
    }
    renderTemplate(container) {
        container.classList.add('group-title');
        const template = {
            parent: container,
            toDispose: new DisposableStore()
        };
        return template;
    }
    renderElement(element, index, templateData) {
        templateData.parent.innerText = '';
        const labelElement = DOM.append(templateData.parent, $('div.settings-group-title-label.settings-row-inner-container'));
        labelElement.classList.add(`settings-group-level-${element.element.level}`);
        labelElement.textContent = element.element.label;
        if (element.element.isFirstGroup) {
            labelElement.classList.add('settings-group-first');
        }
    }
    disposeTemplate(templateData) {
    }
}
let SettingNewExtensionsRenderer = class SettingNewExtensionsRenderer {
    constructor(_commandService) {
        this._commandService = _commandService;
        this.templateId = SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
    }
    renderTemplate(container) {
        const toDispose = new DisposableStore();
        container.classList.add('setting-item-new-extensions');
        const button = new Button(container, { title: true, ...defaultButtonStyles });
        toDispose.add(button);
        toDispose.add(button.onDidClick(() => {
            if (template.context) {
                this._commandService.executeCommand('workbench.extensions.action.showExtensionsWithIds', template.context.extensionIds);
            }
        }));
        button.label = localize('newExtensionsButtonLabel', "Show matching extensions");
        button.element.classList.add('settings-new-extensions-button');
        const template = {
            button,
            toDispose
        };
        return template;
    }
    renderElement(element, index, templateData) {
        templateData.context = element.element;
    }
    disposeTemplate(template) {
        dispose(template.toDispose);
    }
};
SettingNewExtensionsRenderer = __decorate([
    __param(0, ICommandService),
    __metadata("design:paramtypes", [Object])
], SettingNewExtensionsRenderer);
export { SettingNewExtensionsRenderer };
export class SettingComplexRenderer extends AbstractSettingRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_COMPLEX_TEMPLATE_ID;
    }
    static { this.EDIT_IN_JSON_LABEL = localize('editInSettingsJson', "Edit in settings.json"); }
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'complex');
        const openSettingsButton = DOM.append(common.controlElement, $('a.edit-in-settings-button'));
        openSettingsButton.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        openSettingsButton.role = 'button';
        const validationErrorMessageElement = $('.setting-item-validation-message');
        common.containerElement.appendChild(validationErrorMessageElement);
        const template = {
            ...common,
            button: openSettingsButton,
            validationErrorMessageElement
        };
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        const plainKey = getLanguageTagSettingPlainKey(dataElement.setting.key);
        const editLanguageSettingLabel = localize('editLanguageSettingLabel', "Edit settings for {0}", plainKey);
        const isLanguageTagSetting = dataElement.setting.isLanguageTagSetting;
        template.button.textContent = isLanguageTagSetting
            ? editLanguageSettingLabel
            : SettingComplexRenderer.EDIT_IN_JSON_LABEL;
        const onClickOrKeydown = (e) => {
            if (isLanguageTagSetting) {
                this._onApplyFilter.fire(`@${LANGUAGE_SETTING_TAG}${plainKey}`);
            }
            else {
                this._onDidOpenSettings.fire(dataElement.setting.key);
            }
            e.preventDefault();
            e.stopPropagation();
        };
        template.elementDisposables.add(DOM.addDisposableListener(template.button, DOM.EventType.CLICK, (e) => {
            onClickOrKeydown(e);
        }));
        template.elementDisposables.add(DOM.addDisposableListener(template.button, DOM.EventType.KEY_DOWN, (e) => {
            const ev = new StandardKeyboardEvent(e);
            if (ev.equals(10) || ev.equals(3)) {
                onClickOrKeydown(e);
            }
        }));
        this.renderValidations(dataElement, template);
        if (isLanguageTagSetting) {
            template.button.setAttribute('aria-label', editLanguageSettingLabel);
        }
        else {
            template.button.setAttribute('aria-label', `${SettingComplexRenderer.EDIT_IN_JSON_LABEL}: ${dataElement.setting.key}`);
        }
    }
    renderValidations(dataElement, template) {
        const errMsg = dataElement.isConfigured && getInvalidTypeError(dataElement.value, dataElement.setting.type);
        if (errMsg) {
            template.containerElement.classList.add('invalid-input');
            template.validationErrorMessageElement.innerText = errMsg;
            return;
        }
        template.containerElement.classList.remove('invalid-input');
    }
}
class SettingArrayRenderer extends AbstractSettingRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_ARRAY_TEMPLATE_ID;
    }
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'list');
        const descriptionElement = common.containerElement.querySelector('.setting-item-description');
        const validationErrorMessageElement = $('.setting-item-validation-message');
        descriptionElement.after(validationErrorMessageElement);
        const listWidget = this._instantiationService.createInstance(ListSettingWidget, common.controlElement);
        listWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        common.toDispose.add(listWidget);
        const template = {
            ...common,
            listWidget,
            validationErrorMessageElement
        };
        this.addSettingElementFocusHandler(template);
        common.toDispose.add(listWidget.onDidChangeList(e => {
            const newList = this.computeNewList(template, e);
            template.onChange?.(newList);
        }));
        return template;
    }
    computeNewList(template, e) {
        if (template.context) {
            let newValue = [];
            if (Array.isArray(template.context.scopeValue)) {
                newValue = [...template.context.scopeValue];
            }
            else if (Array.isArray(template.context.value)) {
                newValue = [...template.context.value];
            }
            if (e.type === 'move') {
                const sourceIndex = e.sourceIndex;
                const targetIndex = e.targetIndex;
                const splicedElem = newValue.splice(sourceIndex, 1)[0];
                newValue.splice(targetIndex, 0, splicedElem);
            }
            else if (e.type === 'remove' || e.type === 'reset') {
                newValue.splice(e.targetIndex, 1);
            }
            else if (e.type === 'change') {
                const itemValueData = e.newItem.value.data.toString();
                if (e.targetIndex > -1) {
                    newValue[e.targetIndex] = itemValueData;
                }
                else {
                    newValue.push(itemValueData);
                }
            }
            else if (e.type === 'add') {
                newValue.push(e.newItem.value.data.toString());
            }
            if (template.context.defaultValue &&
                Array.isArray(template.context.defaultValue) &&
                template.context.defaultValue.length === newValue.length &&
                template.context.defaultValue.join() === newValue.join()) {
                return undefined;
            }
            return newValue;
        }
        return undefined;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        const value = getListDisplayValue(dataElement);
        const keySuggester = dataElement.setting.enum ? createArraySuggester(dataElement) : undefined;
        template.listWidget.setValue(value, {
            showAddButton: getShowAddButtonList(dataElement, value),
            keySuggester
        });
        template.context = dataElement;
        template.elementDisposables.add(toDisposable(() => {
            template.listWidget.cancelEdit();
        }));
        template.onChange = (v) => {
            if (v && !renderArrayValidations(dataElement, template, v, false)) {
                const itemType = dataElement.setting.arrayItemType;
                const arrToSave = isNonNullableNumericType(itemType) ? v.map(a => +a) : v;
                onChange(arrToSave);
            }
            else {
                onChange(v);
            }
        };
        renderArrayValidations(dataElement, template, value.map(v => v.value.data.toString()), true);
    }
}
class AbstractSettingObjectRenderer extends AbstractSettingRenderer {
    renderTemplateWithWidget(common, widget) {
        widget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        common.toDispose.add(widget);
        const descriptionElement = common.containerElement.querySelector('.setting-item-description');
        const validationErrorMessageElement = $('.setting-item-validation-message');
        descriptionElement.after(validationErrorMessageElement);
        const template = {
            ...common,
            validationErrorMessageElement
        };
        if (widget instanceof ObjectSettingCheckboxWidget) {
            template.objectCheckboxWidget = widget;
        }
        else {
            template.objectDropdownWidget = widget;
        }
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
}
class SettingObjectRenderer extends AbstractSettingObjectRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_OBJECT_TEMPLATE_ID;
    }
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'list');
        const widget = this._instantiationService.createInstance(ObjectSettingDropdownWidget, common.controlElement);
        const template = this.renderTemplateWithWidget(common, widget);
        common.toDispose.add(widget.onDidChangeList(e => {
            this.onDidChangeObject(template, e);
        }));
        return template;
    }
    onDidChangeObject(template, e) {
        const widget = template.objectDropdownWidget;
        if (template.context) {
            const settingSupportsRemoveDefault = objectSettingSupportsRemoveDefaultValue(template.context.setting.key);
            const defaultValue = typeof template.context.defaultValue === 'object'
                ? template.context.defaultValue ?? {}
                : {};
            const scopeValue = typeof template.context.scopeValue === 'object'
                ? template.context.scopeValue ?? {}
                : {};
            const newValue = { ...template.context.scopeValue };
            const newItems = [];
            widget.items.forEach((item, idx) => {
                if ((e.type === 'change' || e.type === 'move') && e.targetIndex === idx) {
                    if (e.originalItem.key.data !== e.newItem.key.data && settingSupportsRemoveDefault && e.originalItem.key.data in defaultValue) {
                        newValue[e.originalItem.key.data] = null;
                    }
                    else {
                        delete newValue[e.originalItem.key.data];
                    }
                    newValue[e.newItem.key.data] = e.newItem.value.data;
                    newItems.push(e.newItem);
                }
                else if ((e.type !== 'change' && e.type !== 'move') || e.newItem.key.data !== item.key.data) {
                    newValue[item.key.data] = item.value.data;
                    newItems.push(item);
                }
            });
            if (e.type === 'remove' || e.type === 'reset') {
                const objectKey = e.originalItem.key.data;
                const removingDefaultValue = e.type === 'remove' && settingSupportsRemoveDefault && defaultValue[objectKey] === e.originalItem.value.data;
                if (removingDefaultValue) {
                    newValue[objectKey] = null;
                }
                else {
                    delete newValue[objectKey];
                }
                const itemToDelete = newItems.findIndex(item => item.key.data === objectKey);
                const defaultItemValue = defaultValue[objectKey];
                if (removingDefaultValue || isUndefinedOrNull(defaultValue[objectKey]) && itemToDelete > -1) {
                    newItems.splice(itemToDelete, 1);
                }
                else if (!removingDefaultValue && itemToDelete > -1) {
                    newItems[itemToDelete].value.data = defaultItemValue;
                }
            }
            else if (e.type === 'add') {
                newValue[e.newItem.key.data] = e.newItem.value.data;
                newItems.push(e.newItem);
            }
            Object.entries(newValue).forEach(([key, value]) => {
                if (scopeValue[key] !== value && defaultValue[key] === value && !(settingSupportsRemoveDefault && value === null)) {
                    delete newValue[key];
                }
            });
            const newObject = Object.keys(newValue).length === 0 ? undefined : newValue;
            template.objectDropdownWidget.setValue(newItems);
            template.onChange?.(newObject);
        }
    }
    renderValue(dataElement, template, onChange) {
        const items = getObjectDisplayValue(dataElement);
        const { key, objectProperties, objectPatternProperties, objectAdditionalProperties } = dataElement.setting;
        template.objectDropdownWidget.setValue(items, {
            settingKey: key,
            showAddButton: objectAdditionalProperties === false
                ? (!areAllPropertiesDefined(Object.keys(objectProperties ?? {}), items) ||
                    isDefined(objectPatternProperties))
                : true,
            keySuggester: createObjectKeySuggester(dataElement),
            valueSuggester: createObjectValueSuggester(dataElement)
        });
        template.context = dataElement;
        template.elementDisposables.add(toDisposable(() => {
            template.objectDropdownWidget.cancelEdit();
        }));
        template.onChange = (v) => {
            if (v && !renderArrayValidations(dataElement, template, v, false)) {
                const parsedRecord = parseNumericObjectValues(dataElement, v);
                onChange(parsedRecord);
            }
            else {
                onChange(v);
            }
        };
        renderArrayValidations(dataElement, template, dataElement.value, true);
    }
}
class SettingBoolObjectRenderer extends AbstractSettingObjectRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
    }
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'list');
        const widget = this._instantiationService.createInstance(ObjectSettingCheckboxWidget, common.controlElement);
        const template = this.renderTemplateWithWidget(common, widget);
        common.toDispose.add(widget.onDidChangeList(e => {
            this.onDidChangeObject(template, e);
        }));
        return template;
    }
    onDidChangeObject(template, e) {
        if (template.context) {
            const widget = template.objectCheckboxWidget;
            const defaultValue = typeof template.context.defaultValue === 'object'
                ? template.context.defaultValue ?? {}
                : {};
            const scopeValue = typeof template.context.scopeValue === 'object'
                ? template.context.scopeValue ?? {}
                : {};
            const newValue = { ...template.context.scopeValue };
            const newItems = [];
            if (e.type !== 'change') {
                console.warn('Unexpected event type', e.type, 'for bool object setting', template.context.setting.key);
                return;
            }
            widget.items.forEach((item, idx) => {
                if (e.targetIndex === idx) {
                    newValue[e.newItem.key.data] = e.newItem.value.data;
                    newItems.push(e.newItem);
                }
                else if (e.newItem.key.data !== item.key.data) {
                    newValue[item.key.data] = item.value.data;
                    newItems.push(item);
                }
            });
            Object.entries(newValue).forEach(([key, value]) => {
                if (scopeValue[key] !== value && defaultValue[key] === value) {
                    delete newValue[key];
                }
            });
            const newObject = Object.keys(newValue).length === 0 ? undefined : newValue;
            template.objectCheckboxWidget.setValue(newItems);
            template.onChange?.(newObject);
            this._onDidFocusSetting.fire(template.context);
        }
    }
    renderValue(dataElement, template, onChange) {
        const items = getBoolObjectDisplayValue(dataElement);
        const { key } = dataElement.setting;
        template.objectCheckboxWidget.setValue(items, {
            settingKey: key
        });
        template.context = dataElement;
        template.onChange = (v) => {
            onChange(v);
        };
    }
}
class SettingIncludeExcludeRenderer extends AbstractSettingRenderer {
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'list');
        const includeExcludeWidget = this._instantiationService.createInstance(this.isExclude() ? ExcludeSettingWidget : IncludeSettingWidget, common.controlElement);
        includeExcludeWidget.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        common.toDispose.add(includeExcludeWidget);
        const template = {
            ...common,
            includeExcludeWidget
        };
        this.addSettingElementFocusHandler(template);
        common.toDispose.add(includeExcludeWidget.onDidChangeList(e => this.onDidChangeIncludeExclude(template, e)));
        return template;
    }
    onDidChangeIncludeExclude(template, e) {
        if (template.context) {
            const newValue = { ...template.context.scopeValue };
            if (e.type !== 'add') {
                if (e.originalItem.value.data.toString() in template.context.defaultValue) {
                    newValue[e.originalItem.value.data.toString()] = false;
                }
                else {
                    delete newValue[e.originalItem.value.data.toString()];
                }
            }
            if (e.type === 'change' || e.type === 'add' || e.type === 'move') {
                if (e.newItem.value.data.toString() in template.context.defaultValue && !e.newItem.sibling) {
                    delete newValue[e.newItem.value.data.toString()];
                }
                else {
                    newValue[e.newItem.value.data.toString()] = e.newItem.sibling ? { when: e.newItem.sibling } : true;
                }
            }
            function sortKeys(obj) {
                const sortedKeys = Object.keys(obj)
                    .sort((a, b) => a.localeCompare(b));
                const retVal = {};
                for (const key of sortedKeys) {
                    retVal[key] = obj[key];
                }
                return retVal;
            }
            this._onDidChangeSetting.fire({
                key: template.context.setting.key,
                value: Object.keys(newValue).length === 0 ? undefined : sortKeys(newValue),
                type: template.context.valueType,
                manualReset: false,
                scope: template.context.setting.scope
            });
        }
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        const value = getIncludeExcludeDisplayValue(dataElement);
        template.includeExcludeWidget.setValue(value);
        template.context = dataElement;
        template.elementDisposables.add(toDisposable(() => {
            template.includeExcludeWidget.cancelEdit();
        }));
    }
}
class SettingExcludeRenderer extends SettingIncludeExcludeRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_EXCLUDE_TEMPLATE_ID;
    }
    isExclude() {
        return true;
    }
}
class SettingIncludeRenderer extends SettingIncludeExcludeRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_INCLUDE_TEMPLATE_ID;
    }
    isExclude() {
        return false;
    }
}
const settingsInputBoxStyles = getInputBoxStyle({
    inputBackground: settingsTextInputBackground,
    inputForeground: settingsTextInputForeground,
    inputBorder: settingsTextInputBorder
});
class AbstractSettingTextRenderer extends AbstractSettingRenderer {
    constructor() {
        super(...arguments);
        this.MULTILINE_MAX_HEIGHT = 150;
    }
    renderTemplate(_container, useMultiline) {
        const common = this.renderCommonTemplate(null, _container, 'text');
        const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
        const inputBoxOptions = {
            flexibleHeight: useMultiline,
            flexibleWidth: false,
            flexibleMaxHeight: this.MULTILINE_MAX_HEIGHT,
            inputBoxStyles: settingsInputBoxStyles
        };
        const inputBox = new InputBox(common.controlElement, this._contextViewService, inputBoxOptions);
        common.toDispose.add(inputBox);
        common.toDispose.add(inputBox.onDidChange(e => {
            template.onChange?.(e);
        }));
        common.toDispose.add(inputBox);
        inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        inputBox.inputElement.tabIndex = 0;
        const template = {
            ...common,
            inputBox,
            validationErrorMessageElement
        };
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        template.onChange = undefined;
        template.inputBox.value = dataElement.value;
        template.inputBox.setAriaLabel(dataElement.setting.key);
        template.onChange = value => {
            if (!renderValidations(dataElement, template, false)) {
                onChange(value);
            }
        };
        renderValidations(dataElement, template, true);
    }
}
class SettingTextRenderer extends AbstractSettingTextRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_TEXT_TEMPLATE_ID;
    }
    renderTemplate(_container) {
        const template = super.renderTemplate(_container, false);
        template.toDispose.add(DOM.addStandardDisposableListener(template.inputBox.inputElement, DOM.EventType.KEY_DOWN, e => {
            if (e.equals(16) || e.equals(18)) {
                e.preventDefault();
            }
        }));
        return template;
    }
}
class SettingMultilineTextRenderer extends AbstractSettingTextRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
    }
    renderTemplate(_container) {
        return super.renderTemplate(_container, true);
    }
    renderValue(dataElement, template, onChange) {
        const onChangeOverride = (value) => {
            dataElement.value = value;
            onChange(value);
        };
        super.renderValue(dataElement, template, onChangeOverride);
        template.elementDisposables.add(template.inputBox.onDidHeightChange(e => {
            const height = template.containerElement.clientHeight;
            if (height) {
                this._onDidChangeSettingHeight.fire({
                    element: dataElement,
                    height: template.containerElement.clientHeight
                });
            }
        }));
        template.inputBox.layout();
    }
}
class SettingEnumRenderer extends AbstractSettingRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_ENUM_TEMPLATE_ID;
    }
    renderTemplate(container) {
        const common = this.renderCommonTemplate(null, container, 'enum');
        const styles = getSelectBoxStyles({
            selectBackground: settingsSelectBackground,
            selectForeground: settingsSelectForeground,
            selectBorder: settingsSelectBorder,
            selectListBorder: settingsSelectListBorder
        });
        const selectBox = new SelectBox([], 0, this._contextViewService, styles, {
            useCustomDrawn: !(isIOS && BrowserFeatures.pointerEvents)
        });
        common.toDispose.add(selectBox);
        selectBox.render(common.controlElement);
        const selectElement = common.controlElement.querySelector('select');
        if (selectElement) {
            selectElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
            selectElement.tabIndex = 0;
        }
        common.toDispose.add(selectBox.onDidSelect(e => {
            template.onChange?.(e.index);
        }));
        const enumDescriptionElement = common.containerElement.insertBefore($('.setting-item-enumDescription'), common.descriptionElement.nextSibling);
        const template = {
            ...common,
            selectBox,
            selectElement,
            enumDescriptionElement
        };
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        const enumItemLabels = dataElement.setting.enumItemLabels ? [...dataElement.setting.enumItemLabels] : [];
        const enumDescriptions = dataElement.setting.enumDescriptions ? [...dataElement.setting.enumDescriptions] : [];
        const settingEnum = [...dataElement.setting.enum];
        const enumDescriptionsAreMarkdown = dataElement.setting.enumDescriptionsAreMarkdown;
        const disposables = new DisposableStore();
        template.elementDisposables.add(disposables);
        let createdDefault = false;
        if (!settingEnum.includes(dataElement.defaultValue)) {
            settingEnum.unshift(dataElement.defaultValue);
            enumDescriptions.unshift('');
            enumItemLabels.unshift('');
            createdDefault = true;
        }
        const stringifiedDefaultValue = escapeInvisibleChars(String(dataElement.defaultValue));
        const displayOptions = settingEnum
            .map(String)
            .map(escapeInvisibleChars)
            .map((data, index) => {
            const description = (enumDescriptions[index] && (enumDescriptionsAreMarkdown ? fixSettingLinks(enumDescriptions[index], false) : enumDescriptions[index]));
            return {
                text: enumItemLabels[index] ? enumItemLabels[index] : data,
                detail: enumItemLabels[index] ? data : '',
                description,
                descriptionIsMarkdown: enumDescriptionsAreMarkdown,
                descriptionMarkdownActionHandler: {
                    callback: (content) => {
                        this._openerService.open(content).catch(onUnexpectedError);
                    },
                    disposables: disposables
                },
                decoratorRight: (((data === stringifiedDefaultValue) || (createdDefault && index === 0)) ? localize('settings.Default', "default") : '')
            };
        });
        template.selectBox.setOptions(displayOptions);
        template.selectBox.setAriaLabel(dataElement.setting.key);
        let idx = settingEnum.indexOf(dataElement.value);
        if (idx === -1) {
            idx = 0;
        }
        template.onChange = undefined;
        template.selectBox.select(idx);
        template.onChange = (idx) => {
            if (createdDefault && idx === 0) {
                onChange(dataElement.defaultValue);
            }
            else {
                onChange(settingEnum[idx]);
            }
        };
        template.enumDescriptionElement.innerText = '';
    }
}
const settingsNumberInputBoxStyles = getInputBoxStyle({
    inputBackground: settingsNumberInputBackground,
    inputForeground: settingsNumberInputForeground,
    inputBorder: settingsNumberInputBorder
});
class SettingNumberRenderer extends AbstractSettingRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_NUMBER_TEMPLATE_ID;
    }
    renderTemplate(_container) {
        const common = super.renderCommonTemplate(null, _container, 'number');
        const validationErrorMessageElement = DOM.append(common.containerElement, $('.setting-item-validation-message'));
        const inputBox = new InputBox(common.controlElement, this._contextViewService, { type: 'number', inputBoxStyles: settingsNumberInputBoxStyles });
        common.toDispose.add(inputBox);
        common.toDispose.add(inputBox.onDidChange(e => {
            template.onChange?.(e);
        }));
        common.toDispose.add(inputBox);
        inputBox.inputElement.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        inputBox.inputElement.tabIndex = 0;
        const template = {
            ...common,
            inputBox,
            validationErrorMessageElement
        };
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        const numParseFn = (dataElement.valueType === 'integer' || dataElement.valueType === 'nullable-integer')
            ? parseInt : parseFloat;
        const nullNumParseFn = (dataElement.valueType === 'nullable-integer' || dataElement.valueType === 'nullable-number')
            ? ((v) => v === '' ? null : numParseFn(v)) : numParseFn;
        template.onChange = undefined;
        template.inputBox.value = typeof dataElement.value === 'number' ?
            dataElement.value.toString() : '';
        template.inputBox.step = dataElement.valueType.includes('integer') ? '1' : 'any';
        template.inputBox.setAriaLabel(dataElement.setting.key);
        template.onChange = value => {
            if (!renderValidations(dataElement, template, false)) {
                onChange(nullNumParseFn(value));
            }
        };
        renderValidations(dataElement, template, true);
    }
}
class SettingBoolRenderer extends AbstractSettingRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_BOOL_TEMPLATE_ID;
    }
    renderTemplate(_container) {
        _container.classList.add('setting-item');
        _container.classList.add('setting-item-bool');
        const toDispose = new DisposableStore();
        const container = DOM.append(_container, $(AbstractSettingRenderer.CONTENTS_SELECTOR));
        container.classList.add('settings-row-inner-container');
        const titleElement = DOM.append(container, $('.setting-item-title'));
        const categoryElement = DOM.append(titleElement, $('span.setting-item-category'));
        const labelElementContainer = DOM.append(titleElement, $('span.setting-item-label'));
        const labelElement = toDispose.add(new SimpleIconLabel(labelElementContainer));
        const indicatorsLabel = this._instantiationService.createInstance(SettingsTreeIndicatorsLabel, titleElement);
        const descriptionAndValueElement = DOM.append(container, $('.setting-item-value-description'));
        const controlElement = DOM.append(descriptionAndValueElement, $('.setting-item-bool-control'));
        const descriptionElement = DOM.append(descriptionAndValueElement, $('.setting-item-description'));
        const modifiedIndicatorElement = DOM.append(container, $('.setting-item-modified-indicator'));
        toDispose.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), modifiedIndicatorElement, localize('modified', "The setting has been configured in the current scope.")));
        const deprecationWarningElement = DOM.append(container, $('.setting-item-deprecation-message'));
        const checkbox = new Toggle({ icon: Codicon.check, actionClassName: 'setting-value-checkbox', isChecked: true, title: '', ...unthemedToggleStyles });
        controlElement.appendChild(checkbox.domNode);
        toDispose.add(checkbox);
        toDispose.add(checkbox.onChange(() => {
            template.onChange(checkbox.checked);
        }));
        toDispose.add(DOM.addDisposableListener(descriptionElement, DOM.EventType.MOUSE_DOWN, (e) => {
            const targetElement = e.target;
            if (targetElement.tagName.toLowerCase() !== 'a') {
                template.checkbox.checked = !template.checkbox.checked;
                template.onChange(checkbox.checked);
            }
            DOM.EventHelper.stop(e);
        }));
        checkbox.domNode.classList.add(AbstractSettingRenderer.CONTROL_CLASS);
        const toolbarContainer = DOM.append(container, $('.setting-toolbar-container'));
        const toolbar = this.renderSettingToolbar(toolbarContainer);
        toDispose.add(toolbar);
        const template = {
            toDispose,
            elementDisposables: toDispose.add(new DisposableStore()),
            containerElement: container,
            categoryElement,
            labelElement,
            controlElement,
            checkbox,
            descriptionElement,
            deprecationWarningElement,
            indicatorsLabel,
            toolbar
        };
        this.addSettingElementFocusHandler(template);
        toDispose.add(DOM.addDisposableListener(controlElement, 'mousedown', (e) => e.stopPropagation()));
        toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_ENTER, e => container.classList.add('mouseover')));
        toDispose.add(DOM.addDisposableListener(titleElement, DOM.EventType.MOUSE_LEAVE, e => container.classList.remove('mouseover')));
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        template.onChange = undefined;
        template.checkbox.checked = dataElement.value;
        template.checkbox.setTitle(dataElement.setting.key);
        template.onChange = onChange;
    }
}
class SettingsExtensionToggleRenderer extends AbstractSettingRenderer {
    constructor() {
        super(...arguments);
        this.templateId = SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
        this._onDidDismissExtensionSetting = this._register(new Emitter());
        this.onDidDismissExtensionSetting = this._onDidDismissExtensionSetting.event;
    }
    renderTemplate(_container) {
        const common = super.renderCommonTemplate(null, _container, 'extension-toggle');
        const actionButton = new Button(common.containerElement, {
            title: false,
            ...defaultButtonStyles
        });
        actionButton.element.classList.add('setting-item-extension-toggle-button');
        actionButton.label = localize('showExtension', "Show Extension");
        const dismissButton = new Button(common.containerElement, {
            title: false,
            secondary: true,
            ...defaultButtonStyles
        });
        dismissButton.element.classList.add('setting-item-extension-dismiss-button');
        dismissButton.label = localize('dismiss', "Dismiss");
        const template = {
            ...common,
            actionButton,
            dismissButton
        };
        this.addSettingElementFocusHandler(template);
        return template;
    }
    renderElement(element, index, templateData) {
        super.renderSettingElement(element, index, templateData);
    }
    renderValue(dataElement, template, onChange) {
        template.elementDisposables.clear();
        const extensionId = dataElement.setting.displayExtensionId;
        template.elementDisposables.add(template.actionButton.onDidClick(async () => {
            this._telemetryService.publicLog2('ManageExtensionClick', { extensionId });
            this._commandService.executeCommand('extension.open', extensionId);
        }));
        template.elementDisposables.add(template.dismissButton.onDidClick(async () => {
            this._telemetryService.publicLog2('DismissExtensionClick', { extensionId });
            this._onDidDismissExtensionSetting.fire(extensionId);
        }));
    }
}
let SettingTreeRenderers = class SettingTreeRenderers extends Disposable {
    constructor(_instantiationService, _contextMenuService, _contextViewService, _userDataProfilesService, _userDataSyncEnablementService) {
        super();
        this._instantiationService = _instantiationService;
        this._contextMenuService = _contextMenuService;
        this._contextViewService = _contextViewService;
        this._userDataProfilesService = _userDataProfilesService;
        this._userDataSyncEnablementService = _userDataSyncEnablementService;
        this._onDidChangeSetting = this._register(new Emitter());
        this.settingActions = [
            new Action('settings.resetSetting', localize('resetSettingLabel', "Reset Setting"), undefined, undefined, async (context) => {
                if (context instanceof SettingsTreeSettingElement) {
                    if (!context.isUntrusted) {
                        this._onDidChangeSetting.fire({
                            key: context.setting.key,
                            value: undefined,
                            type: context.setting.type,
                            manualReset: true,
                            scope: context.setting.scope
                        });
                    }
                }
            }),
            new Separator(),
            this._instantiationService.createInstance(CopySettingIdAction),
            this._instantiationService.createInstance(CopySettingAsJSONAction),
            this._instantiationService.createInstance(CopySettingAsURLAction),
        ];
        const actionFactory = (setting, settingTarget) => this.getActionsForSetting(setting, settingTarget);
        const emptyActionFactory = (_) => [];
        const extensionRenderer = this._instantiationService.createInstance(SettingsExtensionToggleRenderer, [], emptyActionFactory);
        const settingRenderers = [
            this._instantiationService.createInstance(SettingBoolRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingNumberRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingArrayRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingComplexRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingTextRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingMultilineTextRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingExcludeRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingIncludeRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingEnumRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingObjectRenderer, this.settingActions, actionFactory),
            this._instantiationService.createInstance(SettingBoolObjectRenderer, this.settingActions, actionFactory),
            extensionRenderer
        ];
        this.onDidClickOverrideElement = Event.any(...settingRenderers.map(r => r.onDidClickOverrideElement));
        this.onDidChangeSetting = Event.any(...settingRenderers.map(r => r.onDidChangeSetting), this._onDidChangeSetting.event);
        this.onDidDismissExtensionSetting = extensionRenderer.onDidDismissExtensionSetting;
        this.onDidOpenSettings = Event.any(...settingRenderers.map(r => r.onDidOpenSettings));
        this.onDidClickSettingLink = Event.any(...settingRenderers.map(r => r.onDidClickSettingLink));
        this.onDidFocusSetting = Event.any(...settingRenderers.map(r => r.onDidFocusSetting));
        this.onDidChangeSettingHeight = Event.any(...settingRenderers.map(r => r.onDidChangeSettingHeight));
        this.onApplyFilter = Event.any(...settingRenderers.map(r => r.onApplyFilter));
        this.allRenderers = [
            ...settingRenderers,
            this._instantiationService.createInstance(SettingGroupRenderer),
            this._instantiationService.createInstance(SettingNewExtensionsRenderer),
        ];
    }
    getActionsForSetting(setting, settingTarget) {
        const actions = [];
        if (this._userDataProfilesService.isEnabled() && setting.scope !== 1 && settingTarget === 3) {
            actions.push(this._instantiationService.createInstance(ApplySettingToAllProfilesAction, setting));
        }
        if (this._userDataSyncEnablementService.isEnabled() && !setting.disallowSyncIgnore) {
            actions.push(this._instantiationService.createInstance(SyncSettingAction, setting));
        }
        if (actions.length) {
            actions.splice(0, 0, new Separator());
        }
        return actions;
    }
    cancelSuggesters() {
        this._contextViewService.hideContextView();
    }
    showContextMenu(element, settingDOMElement) {
        const toolbarElement = settingDOMElement.querySelector('.monaco-toolbar');
        if (toolbarElement) {
            this._contextMenuService.showContextMenu({
                getActions: () => this.settingActions,
                getAnchor: () => toolbarElement,
                getActionsContext: () => element
            });
        }
    }
    getSettingDOMElementForDOMElement(domElement) {
        const parent = DOM.findParentWithClass(domElement, AbstractSettingRenderer.CONTENTS_CLASS);
        if (parent) {
            return parent;
        }
        return null;
    }
    getDOMElementsForSettingKey(treeContainer, key) {
        return treeContainer.querySelectorAll(`[${AbstractSettingRenderer.SETTING_KEY_ATTR}="${key}"]`);
    }
    getKeyForDOMElementInSetting(element) {
        const settingElement = this.getSettingDOMElementForDOMElement(element);
        return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_KEY_ATTR);
    }
    getIdForDOMElementInSetting(element) {
        const settingElement = this.getSettingDOMElementForDOMElement(element);
        return settingElement && settingElement.getAttribute(AbstractSettingRenderer.SETTING_ID_ATTR);
    }
    dispose() {
        super.dispose();
        this.settingActions.forEach(action => {
            if (isDisposable(action)) {
                action.dispose();
            }
        });
        this.allRenderers.forEach(renderer => {
            if (isDisposable(renderer)) {
                renderer.dispose();
            }
        });
    }
};
SettingTreeRenderers = __decorate([
    __param(0, IInstantiationService),
    __param(1, IContextMenuService),
    __param(2, IContextViewService),
    __param(3, IUserDataProfilesService),
    __param(4, IUserDataSyncEnablementService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], SettingTreeRenderers);
export { SettingTreeRenderers };
function renderValidations(dataElement, template, calledOnStartup) {
    if (dataElement.setting.validator) {
        const errMsg = dataElement.setting.validator(template.inputBox.value);
        if (errMsg) {
            template.containerElement.classList.add('invalid-input');
            template.validationErrorMessageElement.innerText = errMsg;
            const validationError = localize('validationError', "Validation Error.");
            template.inputBox.inputElement.parentElement.setAttribute('aria-label', [validationError, errMsg].join(' '));
            if (!calledOnStartup) {
                aria.status(validationError + ' ' + errMsg);
            }
            return true;
        }
        else {
            template.inputBox.inputElement.parentElement.removeAttribute('aria-label');
        }
    }
    template.containerElement.classList.remove('invalid-input');
    return false;
}
function renderArrayValidations(dataElement, template, value, calledOnStartup) {
    template.containerElement.classList.add('invalid-input');
    if (dataElement.setting.validator) {
        const errMsg = dataElement.setting.validator(value);
        if (errMsg && errMsg !== '') {
            template.containerElement.classList.add('invalid-input');
            template.validationErrorMessageElement.innerText = errMsg;
            const validationError = localize('validationError', "Validation Error.");
            template.containerElement.setAttribute('aria-label', [dataElement.setting.key, validationError, errMsg].join(' '));
            if (!calledOnStartup) {
                aria.status(validationError + ' ' + errMsg);
            }
            return true;
        }
        else {
            template.containerElement.setAttribute('aria-label', dataElement.setting.key);
            template.containerElement.classList.remove('invalid-input');
        }
    }
    return false;
}
function cleanRenderedMarkdown(element) {
    for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes.item(i);
        const tagName = child.tagName && child.tagName.toLowerCase();
        if (tagName === 'img') {
            child.remove();
        }
        else {
            cleanRenderedMarkdown(child);
        }
    }
}
function fixSettingLinks(text, linkify = true) {
    return text.replace(/`#([^#\s`]+)#`|'#([^#\s']+)#'/g, (match, backticksGroup, quotesGroup) => {
        const settingKey = backticksGroup ?? quotesGroup;
        const targetDisplayFormat = settingKeyToDisplayFormat(settingKey);
        const targetName = `${targetDisplayFormat.category}: ${targetDisplayFormat.label}`;
        return linkify ?
            `[${targetName}](#${settingKey} "${settingKey}")` :
            `"${targetName}"`;
    });
}
function escapeInvisibleChars(enumValue) {
    return enumValue && enumValue
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}
let SettingsTreeFilter = class SettingsTreeFilter {
    constructor(viewState, environmentService) {
        this.viewState = viewState;
        this.environmentService = environmentService;
    }
    filter(element, parentVisibility) {
        if (this.viewState.filterToCategory && element instanceof SettingsTreeSettingElement) {
            if (!this.settingContainedInGroup(element.setting, this.viewState.filterToCategory)) {
                return false;
            }
        }
        if (element instanceof SettingsTreeSettingElement && this.viewState.settingsTarget !== 3) {
            const isRemote = !!this.environmentService.remoteAuthority;
            if (!element.matchesScope(this.viewState.settingsTarget, isRemote)) {
                return false;
            }
        }
        if (element instanceof SettingsTreeGroupElement) {
            if (typeof element.count === 'number') {
                return element.count > 0;
            }
            return 2;
        }
        if (element instanceof SettingsTreeNewExtensionsElement) {
            if (this.viewState.tagFilters?.size || this.viewState.filterToCategory) {
                return false;
            }
        }
        return true;
    }
    settingContainedInGroup(setting, group) {
        return group.children.some(child => {
            if (child instanceof SettingsTreeGroupElement) {
                return this.settingContainedInGroup(setting, child);
            }
            else if (child instanceof SettingsTreeSettingElement) {
                return child.setting.key === setting.key;
            }
            else {
                return false;
            }
        });
    }
};
SettingsTreeFilter = __decorate([
    __param(1, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object])
], SettingsTreeFilter);
export { SettingsTreeFilter };
class SettingsTreeDelegate extends CachedListVirtualDelegate {
    getTemplateId(element) {
        if (element instanceof SettingsTreeGroupElement) {
            return SETTINGS_ELEMENT_TEMPLATE_ID;
        }
        if (element instanceof SettingsTreeSettingElement) {
            if (element.valueType === SettingValueType.ExtensionToggle) {
                return SETTINGS_EXTENSION_TOGGLE_TEMPLATE_ID;
            }
            const invalidTypeError = element.isConfigured && getInvalidTypeError(element.value, element.setting.type);
            if (invalidTypeError) {
                return SETTINGS_COMPLEX_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Boolean) {
                return SETTINGS_BOOL_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Integer ||
                element.valueType === SettingValueType.Number ||
                element.valueType === SettingValueType.NullableInteger ||
                element.valueType === SettingValueType.NullableNumber) {
                return SETTINGS_NUMBER_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.MultilineString) {
                return SETTINGS_MULTILINE_TEXT_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.String) {
                return SETTINGS_TEXT_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Enum) {
                return SETTINGS_ENUM_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Array) {
                return SETTINGS_ARRAY_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Exclude) {
                return SETTINGS_EXCLUDE_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Include) {
                return SETTINGS_INCLUDE_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.Object) {
                return SETTINGS_OBJECT_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.BooleanObject) {
                return SETTINGS_BOOL_OBJECT_TEMPLATE_ID;
            }
            if (element.valueType === SettingValueType.LanguageTag) {
                return SETTINGS_COMPLEX_TEMPLATE_ID;
            }
            return SETTINGS_COMPLEX_TEMPLATE_ID;
        }
        if (element instanceof SettingsTreeNewExtensionsElement) {
            return SETTINGS_NEW_EXTENSIONS_TEMPLATE_ID;
        }
        throw new Error('unknown element type: ' + element);
    }
    hasDynamicHeight(element) {
        return !(element instanceof SettingsTreeGroupElement);
    }
    estimateHeight(element) {
        if (element instanceof SettingsTreeGroupElement) {
            return 42;
        }
        return element instanceof SettingsTreeSettingElement && element.valueType === SettingValueType.Boolean ? 78 : 104;
    }
}
export class NonCollapsibleObjectTreeModel extends ObjectTreeModel {
    isCollapsible(element) {
        return false;
    }
    setCollapsed(element, collapsed, recursive) {
        return false;
    }
}
class SettingsTreeAccessibilityProvider {
    constructor(configurationService, languageService, userDataProfilesService) {
        this.configurationService = configurationService;
        this.languageService = languageService;
        this.userDataProfilesService = userDataProfilesService;
    }
    getAriaLabel(element) {
        if (element instanceof SettingsTreeSettingElement) {
            const ariaLabelSections = [];
            ariaLabelSections.push(`${element.displayCategory} ${element.displayLabel}.`);
            if (element.isConfigured) {
                const modifiedText = localize('settings.Modified', 'Modified.');
                ariaLabelSections.push(modifiedText);
            }
            const indicatorsLabelAriaLabel = getIndicatorsLabelAriaLabel(element, this.configurationService, this.userDataProfilesService, this.languageService);
            if (indicatorsLabelAriaLabel.length) {
                ariaLabelSections.push(`${indicatorsLabelAriaLabel}.`);
            }
            const descriptionWithoutSettingLinks = renderMarkdownAsPlaintext({ value: fixSettingLinks(element.description, false) });
            if (descriptionWithoutSettingLinks.length) {
                ariaLabelSections.push(descriptionWithoutSettingLinks);
            }
            return ariaLabelSections.join(' ');
        }
        else if (element instanceof SettingsTreeGroupElement) {
            return element.label;
        }
        else {
            return element.id;
        }
    }
    getWidgetAriaLabel() {
        return localize('settings', "Settings");
    }
}
let SettingsTree = class SettingsTree extends WorkbenchObjectTree {
    constructor(container, viewState, renderers, contextKeyService, listService, configurationService, instantiationService, languageService, userDataProfilesService) {
        super('SettingsTree', container, new SettingsTreeDelegate(), renderers, {
            horizontalScrolling: false,
            supportDynamicHeights: true,
            identityProvider: {
                getId(e) {
                    return e.id;
                }
            },
            accessibilityProvider: new SettingsTreeAccessibilityProvider(configurationService, languageService, userDataProfilesService),
            styleController: id => new DefaultStyleController(DOM.createStyleSheet(container), id),
            filter: instantiationService.createInstance(SettingsTreeFilter, viewState),
            smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling'),
            multipleSelectionSupport: false,
            findWidgetEnabled: false,
            renderIndentGuides: RenderIndentGuides.None,
            transformOptimization: false
        }, instantiationService, contextKeyService, listService, configurationService);
        this.getHTMLElement().classList.add('settings-editor-tree');
        this.style(getListStyles({
            listBackground: editorBackground,
            listActiveSelectionBackground: editorBackground,
            listActiveSelectionForeground: foreground,
            listFocusAndSelectionBackground: editorBackground,
            listFocusAndSelectionForeground: foreground,
            listFocusBackground: editorBackground,
            listFocusForeground: foreground,
            listHoverForeground: foreground,
            listHoverBackground: editorBackground,
            listHoverOutline: editorBackground,
            listFocusOutline: editorBackground,
            listInactiveSelectionBackground: editorBackground,
            listInactiveSelectionForeground: foreground,
            listInactiveFocusBackground: editorBackground,
            listInactiveFocusOutline: editorBackground,
            treeIndentGuidesStroke: undefined,
            treeInactiveIndentGuidesStroke: undefined,
        }));
        this.disposables.add(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('workbench.list.smoothScrolling')) {
                this.updateOptions({
                    smoothScrolling: configurationService.getValue('workbench.list.smoothScrolling')
                });
            }
        }));
    }
    createModel(user, options) {
        return new NonCollapsibleObjectTreeModel(user, options);
    }
};
SettingsTree = __decorate([
    __param(3, IContextKeyService),
    __param(4, IListService),
    __param(5, IWorkbenchConfigurationService),
    __param(6, IInstantiationService),
    __param(7, ILanguageService),
    __param(8, IUserDataProfilesService),
    __metadata("design:paramtypes", [HTMLElement, Object, Array, Object, Object, Object, Object, Object, Object])
], SettingsTree);
export { SettingsTree };
let CopySettingIdAction = class CopySettingIdAction extends Action {
    static { CopySettingIdAction_1 = this; }
    static { this.ID = 'settings.copySettingId'; }
    static { this.LABEL = localize('copySettingIdLabel', "Copy Setting ID"); }
    constructor(clipboardService) {
        super(CopySettingIdAction_1.ID, CopySettingIdAction_1.LABEL);
        this.clipboardService = clipboardService;
    }
    async run(context) {
        if (context) {
            await this.clipboardService.writeText(context.setting.key);
        }
        return Promise.resolve(undefined);
    }
};
CopySettingIdAction = CopySettingIdAction_1 = __decorate([
    __param(0, IClipboardService),
    __metadata("design:paramtypes", [Object])
], CopySettingIdAction);
let CopySettingAsJSONAction = class CopySettingAsJSONAction extends Action {
    static { CopySettingAsJSONAction_1 = this; }
    static { this.ID = 'settings.copySettingAsJSON'; }
    static { this.LABEL = localize('copySettingAsJSONLabel', "Copy Setting as JSON"); }
    constructor(clipboardService) {
        super(CopySettingAsJSONAction_1.ID, CopySettingAsJSONAction_1.LABEL);
        this.clipboardService = clipboardService;
    }
    async run(context) {
        if (context) {
            const jsonResult = `"${context.setting.key}": ${JSON.stringify(context.value, undefined, '  ')}`;
            await this.clipboardService.writeText(jsonResult);
        }
        return Promise.resolve(undefined);
    }
};
CopySettingAsJSONAction = CopySettingAsJSONAction_1 = __decorate([
    __param(0, IClipboardService),
    __metadata("design:paramtypes", [Object])
], CopySettingAsJSONAction);
let CopySettingAsURLAction = class CopySettingAsURLAction extends Action {
    static { CopySettingAsURLAction_1 = this; }
    static { this.ID = 'settings.copySettingAsURL'; }
    static { this.LABEL = localize('copySettingAsURLLabel', "Copy Setting as URL"); }
    constructor(clipboardService, productService) {
        super(CopySettingAsURLAction_1.ID, CopySettingAsURLAction_1.LABEL);
        this.clipboardService = clipboardService;
        this.productService = productService;
    }
    async run(context) {
        if (context) {
            const settingKey = context.setting.key;
            const product = this.productService.urlProtocol;
            const uri = URI.from({ scheme: product, authority: SETTINGS_AUTHORITY, path: `/${settingKey}` }, true);
            await this.clipboardService.writeText(uri.toString());
        }
        return Promise.resolve(undefined);
    }
};
CopySettingAsURLAction = CopySettingAsURLAction_1 = __decorate([
    __param(0, IClipboardService),
    __param(1, IProductService),
    __metadata("design:paramtypes", [Object, Object])
], CopySettingAsURLAction);
let SyncSettingAction = class SyncSettingAction extends Action {
    static { SyncSettingAction_1 = this; }
    static { this.ID = 'settings.stopSyncingSetting'; }
    static { this.LABEL = localize('stopSyncingSetting', "Sync This Setting"); }
    constructor(setting, configService) {
        super(SyncSettingAction_1.ID, SyncSettingAction_1.LABEL);
        this.setting = setting;
        this.configService = configService;
        this._register(Event.filter(configService.onDidChangeConfiguration, e => e.affectsConfiguration('settingsSync.ignoredSettings'))(() => this.update()));
        this.update();
    }
    async update() {
        const ignoredSettings = getIgnoredSettings(getDefaultIgnoredSettings(), this.configService);
        this.checked = !ignoredSettings.includes(this.setting.key);
    }
    async run() {
        let currentValue = [...this.configService.getValue('settingsSync.ignoredSettings')];
        currentValue = currentValue.filter(v => v !== this.setting.key && v !== `-${this.setting.key}`);
        const defaultIgnoredSettings = getDefaultIgnoredSettings();
        const isDefaultIgnored = defaultIgnoredSettings.includes(this.setting.key);
        const askedToSync = !this.checked;
        if (askedToSync && isDefaultIgnored) {
            currentValue.push(`-${this.setting.key}`);
        }
        if (!askedToSync && !isDefaultIgnored) {
            currentValue.push(this.setting.key);
        }
        this.configService.updateValue('settingsSync.ignoredSettings', currentValue.length ? currentValue : undefined, 2);
        return Promise.resolve(undefined);
    }
};
SyncSettingAction = SyncSettingAction_1 = __decorate([
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], SyncSettingAction);
let ApplySettingToAllProfilesAction = class ApplySettingToAllProfilesAction extends Action {
    static { ApplySettingToAllProfilesAction_1 = this; }
    static { this.ID = 'settings.applyToAllProfiles'; }
    static { this.LABEL = localize('applyToAllProfiles', "Apply Setting to all Profiles"); }
    constructor(setting, configService) {
        super(ApplySettingToAllProfilesAction_1.ID, ApplySettingToAllProfilesAction_1.LABEL);
        this.setting = setting;
        this.configService = configService;
        this._register(Event.filter(configService.onDidChangeConfiguration, e => e.affectsConfiguration(APPLY_ALL_PROFILES_SETTING))(() => this.update()));
        this.update();
    }
    update() {
        const allProfilesSettings = this.configService.getValue(APPLY_ALL_PROFILES_SETTING);
        this.checked = allProfilesSettings.includes(this.setting.key);
    }
    async run() {
        const value = this.configService.getValue(APPLY_ALL_PROFILES_SETTING) ?? [];
        if (this.checked) {
            value.splice(value.indexOf(this.setting.key), 1);
        }
        else {
            value.push(this.setting.key);
        }
        const newValue = distinct(value);
        if (this.checked) {
            await this.configService.updateValue(this.setting.key, this.configService.inspect(this.setting.key).application?.value, 3);
            await this.configService.updateValue(APPLY_ALL_PROFILES_SETTING, newValue.length ? newValue : undefined, 3);
        }
        else {
            await this.configService.updateValue(APPLY_ALL_PROFILES_SETTING, newValue.length ? newValue : undefined, 3);
            await this.configService.updateValue(this.setting.key, this.configService.inspect(this.setting.key).userLocal?.value, 3);
        }
    }
};
ApplySettingToAllProfilesAction = ApplySettingToAllProfilesAction_1 = __decorate([
    __param(1, IWorkbenchConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], ApplySettingToAllProfilesAction);
