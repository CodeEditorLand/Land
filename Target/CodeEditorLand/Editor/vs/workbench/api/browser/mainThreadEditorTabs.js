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
import { Event } from '../../../base/common/event.js';
import { DisposableMap, DisposableStore } from '../../../base/common/lifecycle.js';
import { isEqual } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { EditorResourceAccessor, SideBySideEditor } from '../../common/editor.js';
import { DiffEditorInput } from '../../common/editor/diffEditorInput.js';
import { isGroupEditorMoveEvent } from '../../common/editor/editorGroupModel.js';
import { SideBySideEditorInput } from '../../common/editor/sideBySideEditorInput.js';
import { AbstractTextResourceEditorInput } from '../../common/editor/textResourceEditorInput.js';
import { ChatEditorInput } from '../../contrib/chat/browser/chatEditorInput.js';
import { CustomEditorInput } from '../../contrib/customEditor/browser/customEditorInput.js';
import { InteractiveEditorInput } from '../../contrib/interactive/browser/interactiveEditorInput.js';
import { MergeEditorInput } from '../../contrib/mergeEditor/browser/mergeEditorInput.js';
import { MultiDiffEditorInput } from '../../contrib/multiDiffEditor/browser/multiDiffEditorInput.js';
import { NotebookEditorInput } from '../../contrib/notebook/common/notebookEditorInput.js';
import { TerminalEditorInput } from '../../contrib/terminal/browser/terminalEditorInput.js';
import { WebviewInput } from '../../contrib/webviewPanel/browser/webviewEditorInput.js';
import { columnToEditorGroup, editorGroupToColumn } from '../../services/editor/common/editorGroupColumn.js';
import { IEditorGroupsService, preferredSideBySideGroupDirection } from '../../services/editor/common/editorGroupsService.js';
import { IEditorService, SIDE_GROUP } from '../../services/editor/common/editorService.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
let MainThreadEditorTabs = class MainThreadEditorTabs {
    constructor(extHostContext, _editorGroupsService, _configurationService, _logService, editorService) {
        this._editorGroupsService = _editorGroupsService;
        this._configurationService = _configurationService;
        this._logService = _logService;
        this._dispoables = new DisposableStore();
        // List of all groups and their corresponding tabs, this is **the** model
        this._tabGroupModel = [];
        // Lookup table for finding group by id
        this._groupLookup = new Map();
        // Lookup table for finding tab by id
        this._tabInfoLookup = new Map();
        // Tracks the currently open MultiDiffEditorInputs to listen to resource changes
        this._multiDiffEditorInputListeners = new DisposableMap();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostEditorTabs);
        // Main listener which responds to events from the editor service
        this._dispoables.add(editorService.onDidEditorsChange((event) => {
            try {
                this._updateTabsModel(event);
            }
            catch {
                this._logService.error('Failed to update model, rebuilding');
                this._createTabsModel();
            }
        }));
        this._dispoables.add(this._multiDiffEditorInputListeners);
        // Structural group changes (add, remove, move, etc) are difficult to patch.
        // Since they happen infrequently we just rebuild the entire model
        this._dispoables.add(this._editorGroupsService.onDidAddGroup(() => this._createTabsModel()));
        this._dispoables.add(this._editorGroupsService.onDidRemoveGroup(() => this._createTabsModel()));
        // Once everything is read go ahead and initialize the model
        this._editorGroupsService.whenReady.then(() => this._createTabsModel());
    }
    dispose() {
        this._groupLookup.clear();
        this._tabInfoLookup.clear();
        this._dispoables.dispose();
    }
    /**
     * Creates a tab object with the correct properties
     * @param editor The editor input represented by the tab
     * @param group The group the tab is in
     * @returns A tab object
     */
    _buildTabObject(group, editor, editorIndex) {
        const editorId = editor.editorId;
        const tab = {
            id: this._generateTabId(editor, group.id),
            label: editor.getName(),
            editorId,
            input: this._editorInputToDto(editor),
            isPinned: group.isSticky(editorIndex),
            isPreview: !group.isPinned(editorIndex),
            isActive: group.isActive(editor),
            isDirty: editor.isDirty()
        };
        return tab;
    }
    _editorInputToDto(editor) {
        if (editor instanceof MergeEditorInput) {
            return {
                kind: 3 /* TabInputKind.TextMergeInput */,
                base: editor.base,
                input1: editor.input1.uri,
                input2: editor.input2.uri,
                result: editor.resource
            };
        }
        if (editor instanceof AbstractTextResourceEditorInput) {
            return {
                kind: 1 /* TabInputKind.TextInput */,
                uri: editor.resource
            };
        }
        if (editor instanceof SideBySideEditorInput && !(editor instanceof DiffEditorInput)) {
            const primaryResource = editor.primary.resource;
            const secondaryResource = editor.secondary.resource;
            // If side by side editor with same resource on both sides treat it as a singular tab kind
            if (editor.primary instanceof AbstractTextResourceEditorInput
                && editor.secondary instanceof AbstractTextResourceEditorInput
                && isEqual(primaryResource, secondaryResource)
                && primaryResource
                && secondaryResource) {
                return {
                    kind: 1 /* TabInputKind.TextInput */,
                    uri: primaryResource
                };
            }
            return { kind: 0 /* TabInputKind.UnknownInput */ };
        }
        if (editor instanceof NotebookEditorInput) {
            return {
                kind: 4 /* TabInputKind.NotebookInput */,
                notebookType: editor.viewType,
                uri: editor.resource
            };
        }
        if (editor instanceof CustomEditorInput) {
            return {
                kind: 6 /* TabInputKind.CustomEditorInput */,
                viewType: editor.viewType,
                uri: editor.resource,
            };
        }
        if (editor instanceof WebviewInput) {
            return {
                kind: 7 /* TabInputKind.WebviewEditorInput */,
                viewType: editor.viewType
            };
        }
        if (editor instanceof TerminalEditorInput) {
            return {
                kind: 8 /* TabInputKind.TerminalEditorInput */
            };
        }
        if (editor instanceof DiffEditorInput) {
            if (editor.modified instanceof AbstractTextResourceEditorInput && editor.original instanceof AbstractTextResourceEditorInput) {
                return {
                    kind: 2 /* TabInputKind.TextDiffInput */,
                    modified: editor.modified.resource,
                    original: editor.original.resource
                };
            }
            if (editor.modified instanceof NotebookEditorInput && editor.original instanceof NotebookEditorInput) {
                return {
                    kind: 5 /* TabInputKind.NotebookDiffInput */,
                    notebookType: editor.original.viewType,
                    modified: editor.modified.resource,
                    original: editor.original.resource
                };
            }
        }
        if (editor instanceof InteractiveEditorInput) {
            return {
                kind: 9 /* TabInputKind.InteractiveEditorInput */,
                uri: editor.resource,
                inputBoxUri: editor.inputResource
            };
        }
        if (editor instanceof ChatEditorInput) {
            return {
                kind: 10 /* TabInputKind.ChatEditorInput */,
            };
        }
        if (editor instanceof MultiDiffEditorInput) {
            const diffEditors = [];
            for (const resource of (editor?.resources.get() ?? [])) {
                if (resource.originalUri && resource.modifiedUri) {
                    diffEditors.push({
                        kind: 2 /* TabInputKind.TextDiffInput */,
                        original: resource.originalUri,
                        modified: resource.modifiedUri
                    });
                }
            }
            return {
                kind: 11 /* TabInputKind.MultiDiffEditorInput */,
                diffEditors
            };
        }
        return { kind: 0 /* TabInputKind.UnknownInput */ };
    }
    /**
     * Generates a unique id for a tab
     * @param editor The editor input
     * @param groupId The group id
     * @returns A unique identifier for a specific tab
     */
    _generateTabId(editor, groupId) {
        let resourceString;
        // Properly get the resource and account for side by side editors
        const resource = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: SideBySideEditor.BOTH });
        if (resource instanceof URI) {
            resourceString = resource.toString();
        }
        else {
            resourceString = `${resource?.primary?.toString()}-${resource?.secondary?.toString()}`;
        }
        return `${groupId}~${editor.editorId}-${editor.typeId}-${resourceString} `;
    }
    /**
     * Called whenever a group activates, updates the model by marking the group as active an notifies the extension host
     */
    _onDidGroupActivate() {
        const activeGroupId = this._editorGroupsService.activeGroup.id;
        const activeGroup = this._groupLookup.get(activeGroupId);
        if (activeGroup) {
            // Ok not to loop as exthost accepts last active group
            activeGroup.isActive = true;
            this._proxy.$acceptTabGroupUpdate(activeGroup);
        }
    }
    /**
     * Called when the tab label changes
     * @param groupId The id of the group the tab exists in
     * @param editorInput The editor input represented by the tab
     */
    _onDidTabLabelChange(groupId, editorInput, editorIndex) {
        const tabId = this._generateTabId(editorInput, groupId);
        const tabInfo = this._tabInfoLookup.get(tabId);
        // If tab is found patch, else rebuild
        if (tabInfo) {
            tabInfo.tab.label = editorInput.getName();
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: tabInfo.tab,
                kind: 2 /* TabModelOperationKind.TAB_UPDATE */
            });
        }
        else {
            this._logService.error('Invalid model for label change, rebuilding');
            this._createTabsModel();
        }
    }
    /**
     * Called when a new tab is opened
     * @param groupId The id of the group the tab is being created in
     * @param editorInput The editor input being opened
     * @param editorIndex The index of the editor within that group
     */
    _onDidTabOpen(groupId, editorInput, editorIndex) {
        const group = this._editorGroupsService.getGroup(groupId);
        // Even if the editor service knows about the group the group might not exist yet in our model
        const groupInModel = this._groupLookup.get(groupId) !== undefined;
        // Means a new group was likely created so we rebuild the model
        if (!group || !groupInModel) {
            this._createTabsModel();
            return;
        }
        const tabs = this._groupLookup.get(groupId)?.tabs;
        if (!tabs) {
            return;
        }
        // Splice tab into group at index editorIndex
        const tabObject = this._buildTabObject(group, editorInput, editorIndex);
        tabs.splice(editorIndex, 0, tabObject);
        // Update lookup
        const tabId = this._generateTabId(editorInput, groupId);
        this._tabInfoLookup.set(tabId, { group, editorInput, tab: tabObject });
        if (editorInput instanceof MultiDiffEditorInput) {
            this._multiDiffEditorInputListeners.set(editorInput, Event.fromObservableLight(editorInput.resources)(() => {
                const tabInfo = this._tabInfoLookup.get(tabId);
                if (!tabInfo) {
                    return;
                }
                tabInfo.tab = this._buildTabObject(group, editorInput, editorIndex);
                this._proxy.$acceptTabOperation({
                    groupId,
                    index: editorIndex,
                    tabDto: tabInfo.tab,
                    kind: 2 /* TabModelOperationKind.TAB_UPDATE */
                });
            }));
        }
        this._proxy.$acceptTabOperation({
            groupId,
            index: editorIndex,
            tabDto: tabObject,
            kind: 0 /* TabModelOperationKind.TAB_OPEN */
        });
    }
    /**
     * Called when a tab is closed
     * @param groupId The id of the group the tab is being removed from
     * @param editorIndex The index of the editor within that group
     */
    _onDidTabClose(groupId, editorIndex) {
        const group = this._editorGroupsService.getGroup(groupId);
        const tabs = this._groupLookup.get(groupId)?.tabs;
        // Something is wrong with the model state so we rebuild
        if (!group || !tabs) {
            this._createTabsModel();
            return;
        }
        // Splice tab into group at index editorIndex
        const removedTab = tabs.splice(editorIndex, 1);
        // Index must no longer be valid so we return prematurely
        if (removedTab.length === 0) {
            return;
        }
        // Update lookup
        this._tabInfoLookup.delete(removedTab[0]?.id ?? '');
        if (removedTab[0]?.input instanceof MultiDiffEditorInput) {
            this._multiDiffEditorInputListeners.deleteAndDispose(removedTab[0]?.input);
        }
        this._proxy.$acceptTabOperation({
            groupId,
            index: editorIndex,
            tabDto: removedTab[0],
            kind: 1 /* TabModelOperationKind.TAB_CLOSE */
        });
    }
    /**
     * Called when the active tab changes
     * @param groupId The id of the group the tab is contained in
     * @param editorIndex The index of the tab
     */
    _onDidTabActiveChange(groupId, editorIndex) {
        // TODO @lramos15 use the tab lookup here if possible. Do we have an editor input?!
        const tabs = this._groupLookup.get(groupId)?.tabs;
        if (!tabs) {
            return;
        }
        const activeTab = tabs[editorIndex];
        // No need to loop over as the exthost uses the most recently marked active tab
        activeTab.isActive = true;
        // Send DTO update to the exthost
        this._proxy.$acceptTabOperation({
            groupId,
            index: editorIndex,
            tabDto: activeTab,
            kind: 2 /* TabModelOperationKind.TAB_UPDATE */
        });
    }
    /**
     * Called when the dirty indicator on the tab changes
     * @param groupId The id of the group the tab is in
     * @param editorIndex The index of the tab
     * @param editor The editor input represented by the tab
     */
    _onDidTabDirty(groupId, editorIndex, editor) {
        const tabId = this._generateTabId(editor, groupId);
        const tabInfo = this._tabInfoLookup.get(tabId);
        // Something wrong with the model state so we rebuild
        if (!tabInfo) {
            this._logService.error('Invalid model for dirty change, rebuilding');
            this._createTabsModel();
            return;
        }
        tabInfo.tab.isDirty = editor.isDirty();
        this._proxy.$acceptTabOperation({
            groupId,
            index: editorIndex,
            tabDto: tabInfo.tab,
            kind: 2 /* TabModelOperationKind.TAB_UPDATE */
        });
    }
    /**
     * Called when the tab is pinned/unpinned
     * @param groupId The id of the group the tab is in
     * @param editorIndex The index of the tab
     * @param editor The editor input represented by the tab
     */
    _onDidTabPinChange(groupId, editorIndex, editor) {
        const tabId = this._generateTabId(editor, groupId);
        const tabInfo = this._tabInfoLookup.get(tabId);
        const group = tabInfo?.group;
        const tab = tabInfo?.tab;
        // Something wrong with the model state so we rebuild
        if (!group || !tab) {
            this._logService.error('Invalid model for sticky change, rebuilding');
            this._createTabsModel();
            return;
        }
        // Whether or not the tab has the pin icon (internally it's called sticky)
        tab.isPinned = group.isSticky(editorIndex);
        this._proxy.$acceptTabOperation({
            groupId,
            index: editorIndex,
            tabDto: tab,
            kind: 2 /* TabModelOperationKind.TAB_UPDATE */
        });
    }
    /**
 * Called when the tab is preview / unpreviewed
 * @param groupId The id of the group the tab is in
 * @param editorIndex The index of the tab
 * @param editor The editor input represented by the tab
 */
    _onDidTabPreviewChange(groupId, editorIndex, editor) {
        const tabId = this._generateTabId(editor, groupId);
        const tabInfo = this._tabInfoLookup.get(tabId);
        const group = tabInfo?.group;
        const tab = tabInfo?.tab;
        // Something wrong with the model state so we rebuild
        if (!group || !tab) {
            this._logService.error('Invalid model for sticky change, rebuilding');
            this._createTabsModel();
            return;
        }
        // Whether or not the tab has the pin icon (internally it's called pinned)
        tab.isPreview = !group.isPinned(editorIndex);
        this._proxy.$acceptTabOperation({
            kind: 2 /* TabModelOperationKind.TAB_UPDATE */,
            groupId,
            tabDto: tab,
            index: editorIndex
        });
    }
    _onDidTabMove(groupId, editorIndex, oldEditorIndex, editor) {
        const tabs = this._groupLookup.get(groupId)?.tabs;
        // Something wrong with the model state so we rebuild
        if (!tabs) {
            this._logService.error('Invalid model for move change, rebuilding');
            this._createTabsModel();
            return;
        }
        // Move tab from old index to new index
        const removedTab = tabs.splice(oldEditorIndex, 1);
        if (removedTab.length === 0) {
            return;
        }
        tabs.splice(editorIndex, 0, removedTab[0]);
        // Notify exthost of move
        this._proxy.$acceptTabOperation({
            kind: 3 /* TabModelOperationKind.TAB_MOVE */,
            groupId,
            tabDto: removedTab[0],
            index: editorIndex,
            oldIndex: oldEditorIndex
        });
    }
    /**
     * Builds the model from scratch based on the current state of the editor service.
     */
    _createTabsModel() {
        if (this._editorGroupsService.groups.length === 0) {
            return; // skip this invalid state, it may happen when the entire editor area is transitioning to other state ("editor working sets")
        }
        this._tabGroupModel = [];
        this._groupLookup.clear();
        this._tabInfoLookup.clear();
        let tabs = [];
        for (const group of this._editorGroupsService.groups) {
            const currentTabGroupModel = {
                groupId: group.id,
                isActive: group.id === this._editorGroupsService.activeGroup.id,
                viewColumn: editorGroupToColumn(this._editorGroupsService, group),
                tabs: []
            };
            group.editors.forEach((editor, editorIndex) => {
                const tab = this._buildTabObject(group, editor, editorIndex);
                tabs.push(tab);
                // Add information about the tab to the lookup
                this._tabInfoLookup.set(this._generateTabId(editor, group.id), {
                    group,
                    tab,
                    editorInput: editor
                });
            });
            currentTabGroupModel.tabs = tabs;
            this._tabGroupModel.push(currentTabGroupModel);
            this._groupLookup.set(group.id, currentTabGroupModel);
            tabs = [];
        }
        // notify the ext host of the new model
        this._proxy.$acceptEditorTabModel(this._tabGroupModel);
    }
    // TODOD @lramos15 Remove this after done finishing the tab model code
    // private _eventToString(event: IEditorsChangeEvent | IEditorsMoveEvent): string {
    // 	let eventString = '';
    // 	switch (event.kind) {
    // 		case GroupModelChangeKind.GROUP_INDEX: eventString += 'GROUP_INDEX'; break;
    // 		case GroupModelChangeKind.EDITOR_ACTIVE: eventString += 'EDITOR_ACTIVE'; break;
    // 		case GroupModelChangeKind.EDITOR_PIN: eventString += 'EDITOR_PIN'; break;
    // 		case GroupModelChangeKind.EDITOR_OPEN: eventString += 'EDITOR_OPEN'; break;
    // 		case GroupModelChangeKind.EDITOR_CLOSE: eventString += 'EDITOR_CLOSE'; break;
    // 		case GroupModelChangeKind.EDITOR_MOVE: eventString += 'EDITOR_MOVE'; break;
    // 		case GroupModelChangeKind.EDITOR_LABEL: eventString += 'EDITOR_LABEL'; break;
    // 		case GroupModelChangeKind.GROUP_ACTIVE: eventString += 'GROUP_ACTIVE'; break;
    // 		case GroupModelChangeKind.GROUP_LOCKED: eventString += 'GROUP_LOCKED'; break;
    // 		case GroupModelChangeKind.EDITOR_DIRTY: eventString += 'EDITOR_DIRTY'; break;
    // 		case GroupModelChangeKind.EDITOR_STICKY: eventString += 'EDITOR_STICKY'; break;
    // 		default: eventString += `UNKNOWN: ${event.kind}`; break;
    // 	}
    // 	return eventString;
    // }
    /**
     * The main handler for the tab events
     * @param events The list of events to process
     */
    _updateTabsModel(changeEvent) {
        const event = changeEvent.event;
        const groupId = changeEvent.groupId;
        switch (event.kind) {
            case 0 /* GroupModelChangeKind.GROUP_ACTIVE */:
                if (groupId === this._editorGroupsService.activeGroup.id) {
                    this._onDidGroupActivate();
                    break;
                }
                else {
                    return;
                }
            case 9 /* GroupModelChangeKind.EDITOR_LABEL */:
                if (event.editor !== undefined && event.editorIndex !== undefined) {
                    this._onDidTabLabelChange(groupId, event.editor, event.editorIndex);
                    break;
                }
            case 5 /* GroupModelChangeKind.EDITOR_OPEN */:
                if (event.editor !== undefined && event.editorIndex !== undefined) {
                    this._onDidTabOpen(groupId, event.editor, event.editorIndex);
                    break;
                }
            case 6 /* GroupModelChangeKind.EDITOR_CLOSE */:
                if (event.editorIndex !== undefined) {
                    this._onDidTabClose(groupId, event.editorIndex);
                    break;
                }
            case 8 /* GroupModelChangeKind.EDITOR_ACTIVE */:
                if (event.editorIndex !== undefined) {
                    this._onDidTabActiveChange(groupId, event.editorIndex);
                    break;
                }
            case 14 /* GroupModelChangeKind.EDITOR_DIRTY */:
                if (event.editorIndex !== undefined && event.editor !== undefined) {
                    this._onDidTabDirty(groupId, event.editorIndex, event.editor);
                    break;
                }
            case 13 /* GroupModelChangeKind.EDITOR_STICKY */:
                if (event.editorIndex !== undefined && event.editor !== undefined) {
                    this._onDidTabPinChange(groupId, event.editorIndex, event.editor);
                    break;
                }
            case 11 /* GroupModelChangeKind.EDITOR_PIN */:
                if (event.editorIndex !== undefined && event.editor !== undefined) {
                    this._onDidTabPreviewChange(groupId, event.editorIndex, event.editor);
                    break;
                }
            case 12 /* GroupModelChangeKind.EDITOR_TRANSIENT */:
                // Currently not exposed in the API
                break;
            case 7 /* GroupModelChangeKind.EDITOR_MOVE */:
                if (isGroupEditorMoveEvent(event) && event.editor && event.editorIndex !== undefined && event.oldEditorIndex !== undefined) {
                    this._onDidTabMove(groupId, event.editorIndex, event.oldEditorIndex, event.editor);
                    break;
                }
            default:
                // If it's not an optimized case we rebuild the tabs model from scratch
                this._createTabsModel();
        }
    }
    //#region Messages received from Ext Host
    $moveTab(tabId, index, viewColumn, preserveFocus) {
        const groupId = columnToEditorGroup(this._editorGroupsService, this._configurationService, viewColumn);
        const tabInfo = this._tabInfoLookup.get(tabId);
        const tab = tabInfo?.tab;
        if (!tab) {
            throw new Error(`Attempted to close tab with id ${tabId} which does not exist`);
        }
        let targetGroup;
        const sourceGroup = this._editorGroupsService.getGroup(tabInfo.group.id);
        if (!sourceGroup) {
            return;
        }
        // If group index is out of bounds then we make a new one that's to the right of the last group
        if (this._groupLookup.get(groupId) === undefined) {
            let direction = 3 /* GroupDirection.RIGHT */;
            // Make sure we respect the user's preferred side direction
            if (viewColumn === SIDE_GROUP) {
                direction = preferredSideBySideGroupDirection(this._configurationService);
            }
            targetGroup = this._editorGroupsService.addGroup(this._editorGroupsService.groups[this._editorGroupsService.groups.length - 1], direction);
        }
        else {
            targetGroup = this._editorGroupsService.getGroup(groupId);
        }
        if (!targetGroup) {
            return;
        }
        // Similar logic to if index is out of bounds we place it at the end
        if (index < 0 || index > targetGroup.editors.length) {
            index = targetGroup.editors.length;
        }
        // Find the correct EditorInput using the tab info
        const editorInput = tabInfo?.editorInput;
        if (!editorInput) {
            return;
        }
        // Move the editor to the target group
        sourceGroup.moveEditor(editorInput, targetGroup, { index, preserveFocus });
        return;
    }
    async $closeTab(tabIds, preserveFocus) {
        const groups = new Map();
        for (const tabId of tabIds) {
            const tabInfo = this._tabInfoLookup.get(tabId);
            const tab = tabInfo?.tab;
            const group = tabInfo?.group;
            const editorTab = tabInfo?.editorInput;
            // If not found skip
            if (!group || !tab || !tabInfo || !editorTab) {
                continue;
            }
            const groupEditors = groups.get(group);
            if (!groupEditors) {
                groups.set(group, [editorTab]);
            }
            else {
                groupEditors.push(editorTab);
            }
        }
        // Loop over keys of the groups map and call closeEditors
        const results = [];
        for (const [group, editors] of groups) {
            results.push(await group.closeEditors(editors, { preserveFocus }));
        }
        // TODO @jrieken This isn't quite right how can we say true for some but not others?
        return results.every(result => result);
    }
    async $closeGroup(groupIds, preserveFocus) {
        const groupCloseResults = [];
        for (const groupId of groupIds) {
            const group = this._editorGroupsService.getGroup(groupId);
            if (group) {
                groupCloseResults.push(await group.closeAllEditors());
                // Make sure group is empty but still there before removing it
                if (group.count === 0 && this._editorGroupsService.getGroup(group.id)) {
                    this._editorGroupsService.removeGroup(group);
                }
            }
        }
        return groupCloseResults.every(result => result);
    }
};
MainThreadEditorTabs = __decorate([
    extHostNamedCustomer(MainContext.MainThreadEditorTabs),
    __param(1, IEditorGroupsService),
    __param(2, IConfigurationService),
    __param(3, ILogService),
    __param(4, IEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], MainThreadEditorTabs);
export { MainThreadEditorTabs };
