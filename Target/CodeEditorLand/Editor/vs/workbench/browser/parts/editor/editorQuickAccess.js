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
var ActiveGroupEditorsByMostRecentlyUsedQuickAccess_1, AllEditorsByAppearanceQuickAccess_1, AllEditorsByMostRecentlyUsedQuickAccess_1;
import './media/editorquickaccess.css';
import { localize } from '../../../../nls.js';
import { quickPickItemScorerAccessor } from '../../../../platform/quickinput/common/quickInput.js';
import { PickerQuickAccessProvider, TriggerAction } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../../common/editor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { getIconClasses } from '../../../../editor/common/services/getIconClasses.js';
import { prepareQuery, scoreItemFuzzy, compareItemsByFuzzyScore } from '../../../../base/common/fuzzyScorer.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
let BaseEditorQuickAccessProvider = class BaseEditorQuickAccessProvider extends PickerQuickAccessProvider {
    constructor(prefix, editorGroupService, editorService, modelService, languageService) {
        super(prefix, {
            canAcceptInBackground: true,
            noResultsPick: {
                label: localize('noViewResults', "No matching editors"),
                groupId: -1
            }
        });
        this.editorGroupService = editorGroupService;
        this.editorService = editorService;
        this.modelService = modelService;
        this.languageService = languageService;
        this.pickState = new class {
            constructor() {
                this.scorerCache = Object.create(null);
                this.isQuickNavigating = undefined;
            }
            reset(isQuickNavigating) {
                // Caches
                if (!isQuickNavigating) {
                    this.scorerCache = Object.create(null);
                }
                // Other
                this.isQuickNavigating = isQuickNavigating;
            }
        };
    }
    provide(picker, token) {
        // Reset the pick state for this run
        this.pickState.reset(!!picker.quickNavigate);
        // Start picker
        return super.provide(picker, token);
    }
    _getPicks(filter) {
        const query = prepareQuery(filter);
        // Filtering
        const filteredEditorEntries = this.doGetEditorPickItems().filter(entry => {
            if (!query.normalized) {
                return true;
            }
            // Score on label and description
            const itemScore = scoreItemFuzzy(entry, query, true, quickPickItemScorerAccessor, this.pickState.scorerCache);
            if (!itemScore.score) {
                return false;
            }
            // Apply highlights
            entry.highlights = { label: itemScore.labelMatch, description: itemScore.descriptionMatch };
            return true;
        });
        // Sorting
        if (query.normalized) {
            const groups = this.editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */).map(group => group.id);
            filteredEditorEntries.sort((entryA, entryB) => {
                if (entryA.groupId !== entryB.groupId) {
                    return groups.indexOf(entryA.groupId) - groups.indexOf(entryB.groupId); // older groups first
                }
                return compareItemsByFuzzyScore(entryA, entryB, query, true, quickPickItemScorerAccessor, this.pickState.scorerCache);
            });
        }
        // Grouping (for more than one group)
        const filteredEditorEntriesWithSeparators = [];
        if (this.editorGroupService.count > 1) {
            let lastGroupId = undefined;
            for (const entry of filteredEditorEntries) {
                if (typeof lastGroupId !== 'number' || lastGroupId !== entry.groupId) {
                    const group = this.editorGroupService.getGroup(entry.groupId);
                    if (group) {
                        filteredEditorEntriesWithSeparators.push({ type: 'separator', label: group.label });
                    }
                    lastGroupId = entry.groupId;
                }
                filteredEditorEntriesWithSeparators.push(entry);
            }
        }
        else {
            filteredEditorEntriesWithSeparators.push(...filteredEditorEntries);
        }
        return filteredEditorEntriesWithSeparators;
    }
    doGetEditorPickItems() {
        const editors = this.doGetEditors();
        const mapGroupIdToGroupAriaLabel = new Map();
        for (const { groupId } of editors) {
            if (!mapGroupIdToGroupAriaLabel.has(groupId)) {
                const group = this.editorGroupService.getGroup(groupId);
                if (group) {
                    mapGroupIdToGroupAriaLabel.set(groupId, group.ariaLabel);
                }
            }
        }
        return this.doGetEditors().map(({ editor, groupId }) => {
            const resource = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.PRIMARY });
            const isDirty = editor.isDirty() && !editor.isSaving();
            const description = editor.getDescription();
            const nameAndDescription = description ? `${editor.getName()} ${description}` : editor.getName();
            return {
                groupId,
                resource,
                label: editor.getName(),
                ariaLabel: (() => {
                    if (mapGroupIdToGroupAriaLabel.size > 1) {
                        return isDirty ?
                            localize('entryAriaLabelWithGroupDirty', "{0}, unsaved changes, {1}", nameAndDescription, mapGroupIdToGroupAriaLabel.get(groupId)) :
                            localize('entryAriaLabelWithGroup', "{0}, {1}", nameAndDescription, mapGroupIdToGroupAriaLabel.get(groupId));
                    }
                    return isDirty ? localize('entryAriaLabelDirty', "{0}, unsaved changes", nameAndDescription) : nameAndDescription;
                })(),
                description,
                iconClasses: getIconClasses(this.modelService, this.languageService, resource, undefined, editor.getIcon()).concat(editor.getLabelExtraClasses()),
                italic: !this.editorGroupService.getGroup(groupId)?.isPinned(editor),
                buttons: (() => {
                    return [
                        {
                            iconClass: isDirty ? ('dirty-editor ' + ThemeIcon.asClassName(Codicon.closeDirty)) : ThemeIcon.asClassName(Codicon.close),
                            tooltip: localize('closeEditor', "Close Editor"),
                            alwaysVisible: isDirty
                        }
                    ];
                })(),
                trigger: async () => {
                    const group = this.editorGroupService.getGroup(groupId);
                    if (group) {
                        await group.closeEditor(editor, { preserveFocus: true });
                        if (!group.contains(editor)) {
                            return TriggerAction.REMOVE_ITEM;
                        }
                    }
                    return TriggerAction.NO_ACTION;
                },
                accept: (keyMods, event) => this.editorGroupService.getGroup(groupId)?.openEditor(editor, { preserveFocus: event.inBackground }),
            };
        });
    }
};
BaseEditorQuickAccessProvider = __decorate([
    __param(1, IEditorGroupsService),
    __param(2, IEditorService),
    __param(3, IModelService),
    __param(4, ILanguageService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object])
], BaseEditorQuickAccessProvider);
export { BaseEditorQuickAccessProvider };
//#region Active Editor Group Editors by Most Recently Used
let ActiveGroupEditorsByMostRecentlyUsedQuickAccess = class ActiveGroupEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static { ActiveGroupEditorsByMostRecentlyUsedQuickAccess_1 = this; }
    static { this.PREFIX = 'edt active '; }
    constructor(editorGroupService, editorService, modelService, languageService) {
        super(ActiveGroupEditorsByMostRecentlyUsedQuickAccess_1.PREFIX, editorGroupService, editorService, modelService, languageService);
    }
    doGetEditors() {
        const group = this.editorGroupService.activeGroup;
        return group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).map(editor => ({ editor, groupId: group.id }));
    }
};
ActiveGroupEditorsByMostRecentlyUsedQuickAccess = ActiveGroupEditorsByMostRecentlyUsedQuickAccess_1 = __decorate([
    __param(0, IEditorGroupsService),
    __param(1, IEditorService),
    __param(2, IModelService),
    __param(3, ILanguageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ActiveGroupEditorsByMostRecentlyUsedQuickAccess);
export { ActiveGroupEditorsByMostRecentlyUsedQuickAccess };
//#endregion
//#region All Editors by Appearance
let AllEditorsByAppearanceQuickAccess = class AllEditorsByAppearanceQuickAccess extends BaseEditorQuickAccessProvider {
    static { AllEditorsByAppearanceQuickAccess_1 = this; }
    static { this.PREFIX = 'edt '; }
    constructor(editorGroupService, editorService, modelService, languageService) {
        super(AllEditorsByAppearanceQuickAccess_1.PREFIX, editorGroupService, editorService, modelService, languageService);
    }
    doGetEditors() {
        const entries = [];
        for (const group of this.editorGroupService.getGroups(2 /* GroupsOrder.GRID_APPEARANCE */)) {
            for (const editor of group.getEditors(1 /* EditorsOrder.SEQUENTIAL */)) {
                entries.push({ editor, groupId: group.id });
            }
        }
        return entries;
    }
};
AllEditorsByAppearanceQuickAccess = AllEditorsByAppearanceQuickAccess_1 = __decorate([
    __param(0, IEditorGroupsService),
    __param(1, IEditorService),
    __param(2, IModelService),
    __param(3, ILanguageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AllEditorsByAppearanceQuickAccess);
export { AllEditorsByAppearanceQuickAccess };
//#endregion
//#region All Editors by Most Recently Used
let AllEditorsByMostRecentlyUsedQuickAccess = class AllEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static { AllEditorsByMostRecentlyUsedQuickAccess_1 = this; }
    static { this.PREFIX = 'edt mru '; }
    constructor(editorGroupService, editorService, modelService, languageService) {
        super(AllEditorsByMostRecentlyUsedQuickAccess_1.PREFIX, editorGroupService, editorService, modelService, languageService);
    }
    doGetEditors() {
        const entries = [];
        for (const editor of this.editorService.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */)) {
            entries.push(editor);
        }
        return entries;
    }
};
AllEditorsByMostRecentlyUsedQuickAccess = AllEditorsByMostRecentlyUsedQuickAccess_1 = __decorate([
    __param(0, IEditorGroupsService),
    __param(1, IEditorService),
    __param(2, IModelService),
    __param(3, ILanguageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AllEditorsByMostRecentlyUsedQuickAccess);
export { AllEditorsByMostRecentlyUsedQuickAccess };
//#endregion
