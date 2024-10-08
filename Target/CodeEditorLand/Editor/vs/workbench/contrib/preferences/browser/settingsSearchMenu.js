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
import { DropdownMenuActionViewItem } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { SuggestController } from '../../../../editor/contrib/suggest/browser/suggestController.js';
import { localize } from '../../../../nls.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { SuggestEnabledInput } from '../../codeEditor/browser/suggestEnabledInput/suggestEnabledInput.js';
import { EXTENSION_SETTING_TAG, FEATURE_SETTING_TAG, GENERAL_TAG_SETTING_TAG, LANGUAGE_SETTING_TAG, MODIFIED_SETTING_TAG, POLICY_SETTING_TAG } from '../common/preferences.js';
let SettingsSearchFilterDropdownMenuActionViewItem = class SettingsSearchFilterDropdownMenuActionViewItem extends DropdownMenuActionViewItem {
    constructor(action, options, actionRunner, searchWidget, contextMenuService) {
        super(action, { getActions: () => this.getActions() }, contextMenuService, {
            ...options,
            actionRunner,
            classNames: action.class,
            anchorAlignmentProvider: () => 1 /* AnchorAlignment.RIGHT */,
            menuAsChild: true
        });
        this.searchWidget = searchWidget;
        this.suggestController = SuggestController.get(this.searchWidget.inputWidget);
    }
    render(container) {
        super.render(container);
    }
    doSearchWidgetAction(queryToAppend, triggerSuggest) {
        this.searchWidget.setValue(this.searchWidget.getValue().trimEnd() + ' ' + queryToAppend);
        this.searchWidget.focus();
        if (triggerSuggest && this.suggestController) {
            this.suggestController.triggerSuggest();
        }
    }
    /**
     * The created action appends a query to the search widget search string. It optionally triggers suggestions.
     */
    createAction(id, label, tooltip, queryToAppend, triggerSuggest) {
        return {
            id,
            label,
            tooltip,
            class: undefined,
            enabled: true,
            run: () => { this.doSearchWidgetAction(queryToAppend, triggerSuggest); }
        };
    }
    /**
     * The created action appends a query to the search widget search string, if the query does not exist.
     * Otherwise, it removes the query from the search widget search string.
     * The action does not trigger suggestions after adding or removing the query.
     */
    createToggleAction(id, label, tooltip, queryToAppend) {
        const splitCurrentQuery = this.searchWidget.getValue().split(' ');
        const queryContainsQueryToAppend = splitCurrentQuery.includes(queryToAppend);
        return {
            id,
            label,
            tooltip,
            class: undefined,
            enabled: true,
            checked: queryContainsQueryToAppend,
            run: () => {
                if (!queryContainsQueryToAppend) {
                    const trimmedCurrentQuery = this.searchWidget.getValue().trimEnd();
                    const newQuery = trimmedCurrentQuery ? trimmedCurrentQuery + ' ' + queryToAppend : queryToAppend;
                    this.searchWidget.setValue(newQuery);
                }
                else {
                    const queryWithRemovedTags = this.searchWidget.getValue().split(' ')
                        .filter(word => word !== queryToAppend).join(' ');
                    this.searchWidget.setValue(queryWithRemovedTags);
                }
                this.searchWidget.focus();
            }
        };
    }
    getActions() {
        return [
            this.createToggleAction('modifiedSettingsSearch', localize('modifiedSettingsSearch', "Modified"), localize('modifiedSettingsSearchTooltip', "Add or remove modified settings filter"), `@${MODIFIED_SETTING_TAG}`),
            this.createAction('extSettingsSearch', localize('extSettingsSearch', "Extension ID..."), localize('extSettingsSearchTooltip', "Add extension ID filter"), `@${EXTENSION_SETTING_TAG}`, true),
            this.createAction('featuresSettingsSearch', localize('featureSettingsSearch', "Feature..."), localize('featureSettingsSearchTooltip', "Add feature filter"), `@${FEATURE_SETTING_TAG}`, true),
            this.createAction('tagSettingsSearch', localize('tagSettingsSearch', "Tag..."), localize('tagSettingsSearchTooltip', "Add tag filter"), `@${GENERAL_TAG_SETTING_TAG}`, true),
            this.createAction('langSettingsSearch', localize('langSettingsSearch', "Language..."), localize('langSettingsSearchTooltip', "Add language ID filter"), `@${LANGUAGE_SETTING_TAG}`, true),
            this.createToggleAction('onlineSettingsSearch', localize('onlineSettingsSearch', "Online services"), localize('onlineSettingsSearchTooltip', "Show settings for online services"), '@tag:usesOnlineServices'),
            this.createToggleAction('policySettingsSearch', localize('policySettingsSearch', "Policy services"), localize('policySettingsSearchTooltip', "Show settings for policy services"), `@${POLICY_SETTING_TAG}`)
        ];
    }
};
SettingsSearchFilterDropdownMenuActionViewItem = __decorate([
    __param(4, IContextMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, SuggestEnabledInput, Object])
], SettingsSearchFilterDropdownMenuActionViewItem);
export { SettingsSearchFilterDropdownMenuActionViewItem };
