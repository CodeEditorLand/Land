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
import { tail, coalesce } from '../../../../base/common/arrays.js';
import { Emitter } from '../../../../base/common/event.js';
import { visit } from '../../../../base/common/json.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { Range } from '../../../../editor/common/core/range.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import * as nls from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Extensions, OVERRIDE_PROPERTY_REGEX } from '../../../../platform/configuration/common/configurationRegistry.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { SettingMatchType } from './preferences.js';
import { FOLDER_SCOPES, WORKSPACE_SCOPES } from '../../configuration/common/configuration.js';
import { createValidator } from './preferencesValidation.js';
export const nullRange = { startLineNumber: -1, startColumn: -1, endLineNumber: -1, endColumn: -1 };
function isNullRange(range) { return range.startLineNumber === -1 && range.startColumn === -1 && range.endLineNumber === -1 && range.endColumn === -1; }
class AbstractSettingsModel extends EditorModel {
    constructor() {
        super(...arguments);
        this._currentResultGroups = new Map();
    }
    updateResultGroup(id, resultGroup) {
        if (resultGroup) {
            this._currentResultGroups.set(id, resultGroup);
        }
        else {
            this._currentResultGroups.delete(id);
        }
        this.removeDuplicateResults();
        return this.update();
    }
    removeDuplicateResults() {
        const settingKeys = new Set();
        [...this._currentResultGroups.keys()]
            .sort((a, b) => this._currentResultGroups.get(a).order - this._currentResultGroups.get(b).order)
            .forEach(groupId => {
            const group = this._currentResultGroups.get(groupId);
            group.result.filterMatches = group.result.filterMatches.filter(s => !settingKeys.has(s.setting.key));
            group.result.filterMatches.forEach(s => settingKeys.add(s.setting.key));
        });
    }
    filterSettings(filter, groupFilter, settingMatcher) {
        const allGroups = this.filterGroups;
        const filterMatches = [];
        for (const group of allGroups) {
            const groupMatched = groupFilter(group);
            for (const section of group.sections) {
                for (const setting of section.settings) {
                    const settingMatchResult = settingMatcher(setting, group);
                    if (groupMatched || settingMatchResult) {
                        filterMatches.push({
                            setting,
                            matches: settingMatchResult && settingMatchResult.matches,
                            matchType: settingMatchResult?.matchType ?? SettingMatchType.None,
                            score: settingMatchResult?.score ?? 0
                        });
                    }
                }
            }
        }
        return filterMatches;
    }
    getPreference(key) {
        for (const group of this.settingsGroups) {
            for (const section of group.sections) {
                for (const setting of section.settings) {
                    if (key === setting.key) {
                        return setting;
                    }
                }
            }
        }
        return undefined;
    }
    collectMetadata(groups) {
        const metadata = Object.create(null);
        let hasMetadata = false;
        groups.forEach(g => {
            if (g.result.metadata) {
                metadata[g.id] = g.result.metadata;
                hasMetadata = true;
            }
        });
        return hasMetadata ? metadata : null;
    }
    get filterGroups() {
        return this.settingsGroups;
    }
}
export class SettingsEditorModel extends AbstractSettingsModel {
    constructor(reference, _configurationTarget) {
        super();
        this._configurationTarget = _configurationTarget;
        this._onDidChangeGroups = this._register(new Emitter());
        this.onDidChangeGroups = this._onDidChangeGroups.event;
        this.settingsModel = reference.object.textEditorModel;
        this._register(this.onWillDispose(() => reference.dispose()));
        this._register(this.settingsModel.onDidChangeContent(() => {
            this._settingsGroups = undefined;
            this._onDidChangeGroups.fire();
        }));
    }
    get uri() {
        return this.settingsModel.uri;
    }
    get configurationTarget() {
        return this._configurationTarget;
    }
    get settingsGroups() {
        if (!this._settingsGroups) {
            this.parse();
        }
        return this._settingsGroups;
    }
    get content() {
        return this.settingsModel.getValue();
    }
    findValueMatches(filter, setting) {
        return this.settingsModel.findMatches(filter, setting.valueRange, false, false, null, false).map(match => match.range);
    }
    isSettingsProperty(property, previousParents) {
        return previousParents.length === 0;
    }
    parse() {
        this._settingsGroups = parse(this.settingsModel, (property, previousParents) => this.isSettingsProperty(property, previousParents));
    }
    update() {
        const resultGroups = [...this._currentResultGroups.values()];
        if (!resultGroups.length) {
            return undefined;
        }
        const filteredSettings = [];
        const matches = [];
        resultGroups.forEach(group => {
            group.result.filterMatches.forEach(filterMatch => {
                filteredSettings.push(filterMatch.setting);
                if (filterMatch.matches) {
                    matches.push(...filterMatch.matches);
                }
            });
        });
        let filteredGroup;
        const modelGroup = this.settingsGroups[0];
        if (modelGroup) {
            filteredGroup = {
                id: modelGroup.id,
                range: modelGroup.range,
                sections: [{
                        settings: filteredSettings
                    }],
                title: modelGroup.title,
                titleRange: modelGroup.titleRange,
                order: modelGroup.order,
                extensionInfo: modelGroup.extensionInfo
            };
        }
        const metadata = this.collectMetadata(resultGroups);
        return {
            allGroups: this.settingsGroups,
            filteredGroups: filteredGroup ? [filteredGroup] : [],
            matches,
            metadata
        };
    }
}
let Settings2EditorModel = class Settings2EditorModel extends AbstractSettingsModel {
    constructor(_defaultSettings, configurationService) {
        super();
        this._defaultSettings = _defaultSettings;
        this._onDidChangeGroups = this._register(new Emitter());
        this.onDidChangeGroups = this._onDidChangeGroups.event;
        this.additionalGroups = [];
        this.dirty = false;
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.source === 7) {
                this.dirty = true;
                this._onDidChangeGroups.fire();
            }
        }));
        this._register(Registry.as(Extensions.Configuration).onDidSchemaChange(e => {
            this.dirty = true;
            this._onDidChangeGroups.fire();
        }));
    }
    get filterGroups() {
        return this.settingsGroups.slice(1);
    }
    get settingsGroups() {
        const groups = this._defaultSettings.getSettingsGroups(this.dirty);
        this.dirty = false;
        return [...groups, ...this.additionalGroups];
    }
    setAdditionalGroups(groups) {
        this.additionalGroups = groups;
    }
    findValueMatches(filter, setting) {
        return [];
    }
    update() {
        throw new Error('Not supported');
    }
};
Settings2EditorModel = __decorate([
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [DefaultSettings, Object])
], Settings2EditorModel);
export { Settings2EditorModel };
function parse(model, isSettingsProperty) {
    const settings = [];
    let overrideSetting = null;
    let currentProperty = null;
    let currentParent = [];
    const previousParents = [];
    let settingsPropertyIndex = -1;
    const range = {
        startLineNumber: 0,
        startColumn: 0,
        endLineNumber: 0,
        endColumn: 0
    };
    function onValue(value, offset, length) {
        if (Array.isArray(currentParent)) {
            currentParent.push(value);
        }
        else if (currentProperty) {
            currentParent[currentProperty] = value;
        }
        if (previousParents.length === settingsPropertyIndex + 1 || (previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null)) {
            const setting = previousParents.length === settingsPropertyIndex + 1 ? settings[settings.length - 1] : overrideSetting.overrides[overrideSetting.overrides.length - 1];
            if (setting) {
                const valueStartPosition = model.getPositionAt(offset);
                const valueEndPosition = model.getPositionAt(offset + length);
                setting.value = value;
                setting.valueRange = {
                    startLineNumber: valueStartPosition.lineNumber,
                    startColumn: valueStartPosition.column,
                    endLineNumber: valueEndPosition.lineNumber,
                    endColumn: valueEndPosition.column
                };
                setting.range = Object.assign(setting.range, {
                    endLineNumber: valueEndPosition.lineNumber,
                    endColumn: valueEndPosition.column
                });
            }
        }
    }
    const visitor = {
        onObjectBegin: (offset, length) => {
            if (isSettingsProperty(currentProperty, previousParents)) {
                settingsPropertyIndex = previousParents.length;
                const position = model.getPositionAt(offset);
                range.startLineNumber = position.lineNumber;
                range.startColumn = position.column;
            }
            const object = {};
            onValue(object, offset, length);
            currentParent = object;
            currentProperty = null;
            previousParents.push(currentParent);
        },
        onObjectProperty: (name, offset, length) => {
            currentProperty = name;
            if (previousParents.length === settingsPropertyIndex + 1 || (previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null)) {
                const settingStartPosition = model.getPositionAt(offset);
                const setting = {
                    description: [],
                    descriptionIsMarkdown: false,
                    key: name,
                    keyRange: {
                        startLineNumber: settingStartPosition.lineNumber,
                        startColumn: settingStartPosition.column + 1,
                        endLineNumber: settingStartPosition.lineNumber,
                        endColumn: settingStartPosition.column + length
                    },
                    range: {
                        startLineNumber: settingStartPosition.lineNumber,
                        startColumn: settingStartPosition.column,
                        endLineNumber: 0,
                        endColumn: 0
                    },
                    value: null,
                    valueRange: nullRange,
                    descriptionRanges: [],
                    overrides: [],
                    overrideOf: overrideSetting ?? undefined,
                };
                if (previousParents.length === settingsPropertyIndex + 1) {
                    settings.push(setting);
                    if (OVERRIDE_PROPERTY_REGEX.test(name)) {
                        overrideSetting = setting;
                    }
                }
                else {
                    overrideSetting.overrides.push(setting);
                }
            }
        },
        onObjectEnd: (offset, length) => {
            currentParent = previousParents.pop();
            if (settingsPropertyIndex !== -1 && (previousParents.length === settingsPropertyIndex + 1 || (previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null))) {
                const setting = previousParents.length === settingsPropertyIndex + 1 ? settings[settings.length - 1] : overrideSetting.overrides[overrideSetting.overrides.length - 1];
                if (setting) {
                    const valueEndPosition = model.getPositionAt(offset + length);
                    setting.valueRange = Object.assign(setting.valueRange, {
                        endLineNumber: valueEndPosition.lineNumber,
                        endColumn: valueEndPosition.column
                    });
                    setting.range = Object.assign(setting.range, {
                        endLineNumber: valueEndPosition.lineNumber,
                        endColumn: valueEndPosition.column
                    });
                }
                if (previousParents.length === settingsPropertyIndex + 1) {
                    overrideSetting = null;
                }
            }
            if (previousParents.length === settingsPropertyIndex) {
                const position = model.getPositionAt(offset);
                range.endLineNumber = position.lineNumber;
                range.endColumn = position.column;
                settingsPropertyIndex = -1;
            }
        },
        onArrayBegin: (offset, length) => {
            const array = [];
            onValue(array, offset, length);
            previousParents.push(currentParent);
            currentParent = array;
            currentProperty = null;
        },
        onArrayEnd: (offset, length) => {
            currentParent = previousParents.pop();
            if (previousParents.length === settingsPropertyIndex + 1 || (previousParents.length === settingsPropertyIndex + 2 && overrideSetting !== null)) {
                const setting = previousParents.length === settingsPropertyIndex + 1 ? settings[settings.length - 1] : overrideSetting.overrides[overrideSetting.overrides.length - 1];
                if (setting) {
                    const valueEndPosition = model.getPositionAt(offset + length);
                    setting.valueRange = Object.assign(setting.valueRange, {
                        endLineNumber: valueEndPosition.lineNumber,
                        endColumn: valueEndPosition.column
                    });
                    setting.range = Object.assign(setting.range, {
                        endLineNumber: valueEndPosition.lineNumber,
                        endColumn: valueEndPosition.column
                    });
                }
            }
        },
        onLiteralValue: onValue,
        onError: (error) => {
            const setting = settings[settings.length - 1];
            if (setting && (isNullRange(setting.range) || isNullRange(setting.keyRange) || isNullRange(setting.valueRange))) {
                settings.pop();
            }
        }
    };
    if (!model.isDisposed()) {
        visit(model.getValue(), visitor);
    }
    return settings.length > 0 ? [{
            id: model.isDisposed() ? '' : model.id,
            sections: [
                {
                    settings
                }
            ],
            title: '',
            titleRange: nullRange,
            range
        }] : [];
}
export class WorkspaceConfigurationEditorModel extends SettingsEditorModel {
    constructor() {
        super(...arguments);
        this._configurationGroups = [];
    }
    get configurationGroups() {
        return this._configurationGroups;
    }
    parse() {
        super.parse();
        this._configurationGroups = parse(this.settingsModel, (property, previousParents) => previousParents.length === 0);
    }
    isSettingsProperty(property, previousParents) {
        return property === 'settings' && previousParents.length === 1;
    }
}
export class DefaultSettings extends Disposable {
    constructor(_mostCommonlyUsedSettingsKeys, target, configurationService) {
        super();
        this._mostCommonlyUsedSettingsKeys = _mostCommonlyUsedSettingsKeys;
        this.target = target;
        this.configurationService = configurationService;
        this._settingsByName = new Map();
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.source === 7) {
                this.reset();
                this._onDidChange.fire();
            }
        }));
    }
    getContent(forceUpdate = false) {
        if (!this._content || forceUpdate) {
            this.initialize();
        }
        return this._content;
    }
    getContentWithoutMostCommonlyUsed(forceUpdate = false) {
        if (!this._contentWithoutMostCommonlyUsed || forceUpdate) {
            this.initialize();
        }
        return this._contentWithoutMostCommonlyUsed;
    }
    getSettingsGroups(forceUpdate = false) {
        if (!this._allSettingsGroups || forceUpdate) {
            this.initialize();
        }
        return this._allSettingsGroups;
    }
    initialize() {
        this._allSettingsGroups = this.parse();
        this._content = this.toContent(this._allSettingsGroups, 0);
        this._contentWithoutMostCommonlyUsed = this.toContent(this._allSettingsGroups, 1);
    }
    reset() {
        this._content = undefined;
        this._contentWithoutMostCommonlyUsed = undefined;
        this._allSettingsGroups = undefined;
    }
    parse() {
        const settingsGroups = this.getRegisteredGroups();
        this.initAllSettingsMap(settingsGroups);
        const mostCommonlyUsed = this.getMostCommonlyUsedSettings();
        return [mostCommonlyUsed, ...settingsGroups];
    }
    getRegisteredGroups() {
        const configurations = Registry.as(Extensions.Configuration).getConfigurations().slice();
        const groups = this.removeEmptySettingsGroups(configurations.sort(this.compareConfigurationNodes)
            .reduce((result, config, index, array) => this.parseConfig(config, result, array), []));
        return this.sortGroups(groups);
    }
    sortGroups(groups) {
        groups.forEach(group => {
            group.sections.forEach(section => {
                section.settings.sort((a, b) => a.key.localeCompare(b.key));
            });
        });
        return groups;
    }
    initAllSettingsMap(allSettingsGroups) {
        this._settingsByName = new Map();
        for (const group of allSettingsGroups) {
            for (const section of group.sections) {
                for (const setting of section.settings) {
                    this._settingsByName.set(setting.key, setting);
                }
            }
        }
    }
    getMostCommonlyUsedSettings() {
        const settings = coalesce(this._mostCommonlyUsedSettingsKeys.map(key => {
            const setting = this._settingsByName.get(key);
            if (setting) {
                return {
                    description: setting.description,
                    key: setting.key,
                    value: setting.value,
                    keyRange: nullRange,
                    range: nullRange,
                    valueRange: nullRange,
                    overrides: [],
                    scope: 4,
                    type: setting.type,
                    enum: setting.enum,
                    enumDescriptions: setting.enumDescriptions,
                    descriptionRanges: []
                };
            }
            return null;
        }));
        return {
            id: 'mostCommonlyUsed',
            range: nullRange,
            title: nls.localize('commonlyUsed', "Commonly Used"),
            titleRange: nullRange,
            sections: [
                {
                    settings
                }
            ]
        };
    }
    parseConfig(config, result, configurations, settingsGroup, seenSettings) {
        seenSettings = seenSettings ? seenSettings : {};
        let title = config.title;
        if (!title) {
            const configWithTitleAndSameId = configurations.find(c => (c.id === config.id) && c.title);
            if (configWithTitleAndSameId) {
                title = configWithTitleAndSameId.title;
            }
        }
        if (title) {
            if (!settingsGroup) {
                settingsGroup = result.find(g => g.title === title && g.extensionInfo?.id === config.extensionInfo?.id);
                if (!settingsGroup) {
                    settingsGroup = { sections: [{ settings: [] }], id: config.id || '', title: title || '', titleRange: nullRange, order: config.order, range: nullRange, extensionInfo: config.extensionInfo };
                    result.push(settingsGroup);
                }
            }
            else {
                settingsGroup.sections[settingsGroup.sections.length - 1].title = title;
            }
        }
        if (config.properties) {
            if (!settingsGroup) {
                settingsGroup = { sections: [{ settings: [] }], id: config.id || '', title: config.id || '', titleRange: nullRange, order: config.order, range: nullRange, extensionInfo: config.extensionInfo };
                result.push(settingsGroup);
            }
            const configurationSettings = [];
            for (const setting of [...settingsGroup.sections[settingsGroup.sections.length - 1].settings, ...this.parseSettings(config)]) {
                if (!seenSettings[setting.key]) {
                    configurationSettings.push(setting);
                    seenSettings[setting.key] = true;
                }
            }
            if (configurationSettings.length) {
                settingsGroup.sections[settingsGroup.sections.length - 1].settings = configurationSettings;
            }
        }
        config.allOf?.forEach(c => this.parseConfig(c, result, configurations, settingsGroup, seenSettings));
        return result;
    }
    removeEmptySettingsGroups(settingsGroups) {
        const result = [];
        for (const settingsGroup of settingsGroups) {
            settingsGroup.sections = settingsGroup.sections.filter(section => section.settings.length > 0);
            if (settingsGroup.sections.length) {
                result.push(settingsGroup);
            }
        }
        return result;
    }
    parseSettings(config) {
        const result = [];
        const settingsObject = config.properties;
        const extensionInfo = config.extensionInfo;
        const categoryLabel = config.extensionInfo?.id === config.id ? config.title : config.id;
        for (const key in settingsObject) {
            const prop = settingsObject[key];
            if (this.matchesScope(prop)) {
                const value = prop.default;
                let description = (prop.markdownDescription || prop.description || '');
                if (typeof description !== 'string') {
                    description = '';
                }
                const descriptionLines = description.split('\n');
                const overrides = OVERRIDE_PROPERTY_REGEX.test(key) ? this.parseOverrideSettings(prop.default) : [];
                let listItemType;
                if (prop.type === 'array' && prop.items && !Array.isArray(prop.items) && prop.items.type) {
                    if (prop.items.enum) {
                        listItemType = 'enum';
                    }
                    else if (!Array.isArray(prop.items.type)) {
                        listItemType = prop.items.type;
                    }
                }
                const objectProperties = prop.type === 'object' ? prop.properties : undefined;
                const objectPatternProperties = prop.type === 'object' ? prop.patternProperties : undefined;
                const objectAdditionalProperties = prop.type === 'object' ? prop.additionalProperties : undefined;
                let enumToUse = prop.enum;
                let enumDescriptions = prop.markdownEnumDescriptions ?? prop.enumDescriptions;
                let enumDescriptionsAreMarkdown = !!prop.markdownEnumDescriptions;
                if (listItemType === 'enum' && !Array.isArray(prop.items)) {
                    enumToUse = prop.items.enum;
                    enumDescriptions = prop.items.markdownEnumDescriptions ?? prop.items.enumDescriptions;
                    enumDescriptionsAreMarkdown = !!prop.items.markdownEnumDescriptions;
                }
                let allKeysAreBoolean = false;
                if (prop.type === 'object' && !prop.additionalProperties && prop.properties && Object.keys(prop.properties).length) {
                    allKeysAreBoolean = Object.keys(prop.properties).every(key => {
                        return prop.properties[key].type === 'boolean';
                    });
                }
                let isLanguageTagSetting = false;
                if (OVERRIDE_PROPERTY_REGEX.test(key)) {
                    isLanguageTagSetting = true;
                }
                let defaultValueSource;
                if (!isLanguageTagSetting) {
                    const registeredConfigurationProp = prop;
                    if (registeredConfigurationProp && registeredConfigurationProp.defaultValueSource) {
                        defaultValueSource = registeredConfigurationProp.defaultValueSource;
                    }
                }
                if (!enumToUse && (prop.enumItemLabels || enumDescriptions || enumDescriptionsAreMarkdown)) {
                    console.error(`The setting ${key} has enum-related fields, but doesn't have an enum field. This setting may render improperly in the Settings editor.`);
                }
                result.push({
                    key,
                    value,
                    description: descriptionLines,
                    descriptionIsMarkdown: !!prop.markdownDescription,
                    range: nullRange,
                    keyRange: nullRange,
                    valueRange: nullRange,
                    descriptionRanges: [],
                    overrides,
                    scope: prop.scope,
                    type: prop.type,
                    arrayItemType: listItemType,
                    objectProperties,
                    objectPatternProperties,
                    objectAdditionalProperties,
                    enum: enumToUse,
                    enumDescriptions: enumDescriptions,
                    enumDescriptionsAreMarkdown: enumDescriptionsAreMarkdown,
                    enumItemLabels: prop.enumItemLabels,
                    uniqueItems: prop.uniqueItems,
                    tags: prop.tags,
                    disallowSyncIgnore: prop.disallowSyncIgnore,
                    restricted: prop.restricted,
                    extensionInfo: extensionInfo,
                    deprecationMessage: prop.markdownDeprecationMessage || prop.deprecationMessage,
                    deprecationMessageIsMarkdown: !!prop.markdownDeprecationMessage,
                    validator: createValidator(prop),
                    allKeysAreBoolean,
                    editPresentation: prop.editPresentation,
                    order: prop.order,
                    nonLanguageSpecificDefaultValueSource: defaultValueSource,
                    isLanguageTagSetting,
                    categoryLabel
                });
            }
        }
        return result;
    }
    parseOverrideSettings(overrideSettings) {
        return Object.keys(overrideSettings).map((key) => ({
            key,
            value: overrideSettings[key],
            description: [],
            descriptionIsMarkdown: false,
            range: nullRange,
            keyRange: nullRange,
            valueRange: nullRange,
            descriptionRanges: [],
            overrides: []
        }));
    }
    matchesScope(property) {
        if (!property.scope) {
            return true;
        }
        if (this.target === 6) {
            return FOLDER_SCOPES.indexOf(property.scope) !== -1;
        }
        if (this.target === 5) {
            return WORKSPACE_SCOPES.indexOf(property.scope) !== -1;
        }
        return true;
    }
    compareConfigurationNodes(c1, c2) {
        if (typeof c1.order !== 'number') {
            return 1;
        }
        if (typeof c2.order !== 'number') {
            return -1;
        }
        if (c1.order === c2.order) {
            const title1 = c1.title || '';
            const title2 = c2.title || '';
            return title1.localeCompare(title2);
        }
        return c1.order - c2.order;
    }
    toContent(settingsGroups, startIndex) {
        const builder = new SettingsContentBuilder();
        for (let i = startIndex; i < settingsGroups.length; i++) {
            builder.pushGroup(settingsGroups[i], i === startIndex, i === settingsGroups.length - 1);
        }
        return builder.getContent();
    }
}
export class DefaultSettingsEditorModel extends AbstractSettingsModel {
    constructor(_uri, reference, defaultSettings) {
        super();
        this._uri = _uri;
        this.defaultSettings = defaultSettings;
        this._onDidChangeGroups = this._register(new Emitter());
        this.onDidChangeGroups = this._onDidChangeGroups.event;
        this._register(defaultSettings.onDidChange(() => this._onDidChangeGroups.fire()));
        this._model = reference.object.textEditorModel;
        this._register(this.onWillDispose(() => reference.dispose()));
    }
    get uri() {
        return this._uri;
    }
    get target() {
        return this.defaultSettings.target;
    }
    get settingsGroups() {
        return this.defaultSettings.getSettingsGroups();
    }
    get filterGroups() {
        return this.settingsGroups.slice(1);
    }
    update() {
        if (this._model.isDisposed()) {
            return undefined;
        }
        const resultGroups = [...this._currentResultGroups.values()]
            .sort((a, b) => a.order - b.order);
        const nonEmptyResultGroups = resultGroups.filter(group => group.result.filterMatches.length);
        const startLine = tail(this.settingsGroups).range.endLineNumber + 2;
        const { settingsGroups: filteredGroups, matches } = this.writeResultGroups(nonEmptyResultGroups, startLine);
        const metadata = this.collectMetadata(resultGroups);
        return resultGroups.length ?
            {
                allGroups: this.settingsGroups,
                filteredGroups,
                matches,
                metadata
            } :
            undefined;
    }
    writeResultGroups(groups, startLine) {
        const contentBuilderOffset = startLine - 1;
        const builder = new SettingsContentBuilder(contentBuilderOffset);
        const settingsGroups = [];
        const matches = [];
        if (groups.length) {
            builder.pushLine(',');
            groups.forEach(resultGroup => {
                const settingsGroup = this.getGroup(resultGroup);
                settingsGroups.push(settingsGroup);
                matches.push(...this.writeSettingsGroupToBuilder(builder, settingsGroup, resultGroup.result.filterMatches));
            });
        }
        const groupContent = builder.getContent() + '\n';
        const groupEndLine = this._model.getLineCount();
        const cursorPosition = new Selection(startLine, 1, startLine, 1);
        const edit = {
            text: groupContent,
            forceMoveMarkers: true,
            range: new Range(startLine, 1, groupEndLine, 1)
        };
        this._model.pushEditOperations([cursorPosition], [edit], () => [cursorPosition]);
        const tokenizeTo = Math.min(startLine + 60, this._model.getLineCount());
        this._model.tokenization.forceTokenization(tokenizeTo);
        return { matches, settingsGroups };
    }
    writeSettingsGroupToBuilder(builder, settingsGroup, filterMatches) {
        filterMatches = filterMatches
            .map(filteredMatch => {
            return {
                setting: filteredMatch.setting,
                score: filteredMatch.score,
                matchType: filteredMatch.matchType,
                matches: filteredMatch.matches && filteredMatch.matches.map(match => {
                    return new Range(match.startLineNumber - filteredMatch.setting.range.startLineNumber, match.startColumn, match.endLineNumber - filteredMatch.setting.range.startLineNumber, match.endColumn);
                })
            };
        });
        builder.pushGroup(settingsGroup);
        const fixedMatches = filterMatches
            .map(m => m.matches || [])
            .flatMap((settingMatches, i) => {
            const setting = settingsGroup.sections[0].settings[i];
            return settingMatches.map(range => {
                return new Range(range.startLineNumber + setting.range.startLineNumber, range.startColumn, range.endLineNumber + setting.range.startLineNumber, range.endColumn);
            });
        });
        return fixedMatches;
    }
    copySetting(setting) {
        return {
            description: setting.description,
            scope: setting.scope,
            type: setting.type,
            enum: setting.enum,
            enumDescriptions: setting.enumDescriptions,
            key: setting.key,
            value: setting.value,
            range: setting.range,
            overrides: [],
            overrideOf: setting.overrideOf,
            tags: setting.tags,
            deprecationMessage: setting.deprecationMessage,
            keyRange: nullRange,
            valueRange: nullRange,
            descriptionIsMarkdown: undefined,
            descriptionRanges: []
        };
    }
    findValueMatches(filter, setting) {
        return [];
    }
    getPreference(key) {
        for (const group of this.settingsGroups) {
            for (const section of group.sections) {
                for (const setting of section.settings) {
                    if (setting.key === key) {
                        return setting;
                    }
                }
            }
        }
        return undefined;
    }
    getGroup(resultGroup) {
        return {
            id: resultGroup.id,
            range: nullRange,
            title: resultGroup.label,
            titleRange: nullRange,
            sections: [
                {
                    settings: resultGroup.result.filterMatches.map(m => this.copySetting(m.setting))
                }
            ]
        };
    }
}
class SettingsContentBuilder {
    get lineCountWithOffset() {
        return this._contentByLines.length + this._rangeOffset;
    }
    get lastLine() {
        return this._contentByLines[this._contentByLines.length - 1] || '';
    }
    constructor(_rangeOffset = 0) {
        this._rangeOffset = _rangeOffset;
        this._contentByLines = [];
    }
    pushLine(...lineText) {
        this._contentByLines.push(...lineText);
    }
    pushGroup(settingsGroups, isFirst, isLast) {
        this._contentByLines.push(isFirst ? '[{' : '{');
        const lastSetting = this._pushGroup(settingsGroups, '  ');
        if (lastSetting) {
            const lineIdx = lastSetting.range.endLineNumber - this._rangeOffset;
            const content = this._contentByLines[lineIdx - 2];
            this._contentByLines[lineIdx - 2] = content.substring(0, content.length - 1);
        }
        this._contentByLines.push(isLast ? '}]' : '},');
    }
    _pushGroup(group, indent) {
        let lastSetting = null;
        const groupStart = this.lineCountWithOffset + 1;
        for (const section of group.sections) {
            if (section.title) {
                const sectionTitleStart = this.lineCountWithOffset + 1;
                this.addDescription([section.title], indent, this._contentByLines);
                section.titleRange = { startLineNumber: sectionTitleStart, startColumn: 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length };
            }
            if (section.settings.length) {
                for (const setting of section.settings) {
                    this.pushSetting(setting, indent);
                    lastSetting = setting;
                }
            }
        }
        group.range = { startLineNumber: groupStart, startColumn: 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length };
        return lastSetting;
    }
    getContent() {
        return this._contentByLines.join('\n');
    }
    pushSetting(setting, indent) {
        const settingStart = this.lineCountWithOffset + 1;
        this.pushSettingDescription(setting, indent);
        let preValueContent = indent;
        const keyString = JSON.stringify(setting.key);
        preValueContent += keyString;
        setting.keyRange = { startLineNumber: this.lineCountWithOffset + 1, startColumn: preValueContent.indexOf(setting.key) + 1, endLineNumber: this.lineCountWithOffset + 1, endColumn: setting.key.length };
        preValueContent += ': ';
        const valueStart = this.lineCountWithOffset + 1;
        this.pushValue(setting, preValueContent, indent);
        setting.valueRange = { startLineNumber: valueStart, startColumn: preValueContent.length + 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length + 1 };
        this._contentByLines[this._contentByLines.length - 1] += ',';
        this._contentByLines.push('');
        setting.range = { startLineNumber: settingStart, startColumn: 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length };
    }
    pushSettingDescription(setting, indent) {
        const fixSettingLink = (line) => line.replace(/`#(.*)#`/g, (match, settingName) => `\`${settingName}\``);
        setting.descriptionRanges = [];
        const descriptionPreValue = indent + '// ';
        const deprecationMessageLines = setting.deprecationMessage?.split(/\n/g) ?? [];
        for (let line of [...deprecationMessageLines, ...setting.description]) {
            line = fixSettingLink(line);
            this._contentByLines.push(descriptionPreValue + line);
            setting.descriptionRanges.push({ startLineNumber: this.lineCountWithOffset, startColumn: this.lastLine.indexOf(line) + 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length });
        }
        if (setting.enum && setting.enumDescriptions?.some(desc => !!desc)) {
            setting.enumDescriptions.forEach((desc, i) => {
                const displayEnum = escapeInvisibleChars(String(setting.enum[i]));
                const line = desc ?
                    `${displayEnum}: ${fixSettingLink(desc)}` :
                    displayEnum;
                const lines = line.split(/\n/g);
                lines[0] = ' - ' + lines[0];
                this._contentByLines.push(...lines.map(l => `${indent}// ${l}`));
                setting.descriptionRanges.push({ startLineNumber: this.lineCountWithOffset, startColumn: this.lastLine.indexOf(line) + 1, endLineNumber: this.lineCountWithOffset, endColumn: this.lastLine.length });
            });
        }
    }
    pushValue(setting, preValueConent, indent) {
        const valueString = JSON.stringify(setting.value, null, indent);
        if (valueString && (typeof setting.value === 'object')) {
            if (setting.overrides && setting.overrides.length) {
                this._contentByLines.push(preValueConent + ' {');
                for (const subSetting of setting.overrides) {
                    this.pushSetting(subSetting, indent + indent);
                    this._contentByLines.pop();
                }
                const lastSetting = setting.overrides[setting.overrides.length - 1];
                const content = this._contentByLines[lastSetting.range.endLineNumber - 2];
                this._contentByLines[lastSetting.range.endLineNumber - 2] = content.substring(0, content.length - 1);
                this._contentByLines.push(indent + '}');
            }
            else {
                const mulitLineValue = valueString.split('\n');
                this._contentByLines.push(preValueConent + mulitLineValue[0]);
                for (let i = 1; i < mulitLineValue.length; i++) {
                    this._contentByLines.push(indent + mulitLineValue[i]);
                }
            }
        }
        else {
            this._contentByLines.push(preValueConent + valueString);
        }
    }
    addDescription(description, indent, result) {
        for (const line of description) {
            result.push(indent + '// ' + line);
        }
    }
}
class RawSettingsContentBuilder extends SettingsContentBuilder {
    constructor(indent = '\t') {
        super(0);
        this.indent = indent;
    }
    pushGroup(settingsGroups) {
        this._pushGroup(settingsGroups, this.indent);
    }
}
export class DefaultRawSettingsEditorModel extends Disposable {
    constructor(defaultSettings) {
        super();
        this.defaultSettings = defaultSettings;
        this._content = null;
        this._onDidContentChanged = this._register(new Emitter());
        this.onDidContentChanged = this._onDidContentChanged.event;
        this._register(defaultSettings.onDidChange(() => {
            this._content = null;
            this._onDidContentChanged.fire();
        }));
    }
    get content() {
        if (this._content === null) {
            const builder = new RawSettingsContentBuilder();
            builder.pushLine('{');
            for (const settingsGroup of this.defaultSettings.getRegisteredGroups()) {
                builder.pushGroup(settingsGroup);
            }
            builder.pushLine('}');
            this._content = builder.getContent();
        }
        return this._content;
    }
}
function escapeInvisibleChars(enumValue) {
    return enumValue && enumValue
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');
}
export function defaultKeybindingsContents(keybindingService) {
    const defaultsHeader = '// ' + nls.localize('defaultKeybindingsHeader', "Override key bindings by placing them into your key bindings file.");
    return defaultsHeader + '\n' + keybindingService.getDefaultKeybindingsContent();
}
let DefaultKeybindingsEditorModel = class DefaultKeybindingsEditorModel {
    constructor(_uri, keybindingService) {
        this._uri = _uri;
        this.keybindingService = keybindingService;
    }
    get uri() {
        return this._uri;
    }
    get content() {
        if (!this._content) {
            this._content = defaultKeybindingsContents(this.keybindingService);
        }
        return this._content;
    }
    getPreference() {
        return null;
    }
    dispose() {
    }
};
DefaultKeybindingsEditorModel = __decorate([
    __param(1, IKeybindingService),
    __metadata("design:paramtypes", [URI, Object])
], DefaultKeybindingsEditorModel);
export { DefaultKeybindingsEditorModel };
