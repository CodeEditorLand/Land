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
        this._tabGroupModel = [];
        this._groupLookup = new Map();
        this._tabInfoLookup = new Map();
        this._multiDiffEditorInputListeners = new DisposableMap();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostEditorTabs);
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
        this._dispoables.add(this._editorGroupsService.onDidAddGroup(() => this._createTabsModel()));
        this._dispoables.add(this._editorGroupsService.onDidRemoveGroup(() => this._createTabsModel()));
        this._editorGroupsService.whenReady.then(() => this._createTabsModel());
    }
    dispose() {
        this._groupLookup.clear();
        this._tabInfoLookup.clear();
        this._dispoables.dispose();
    }
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
                kind: 3,
                base: editor.base,
                input1: editor.input1.uri,
                input2: editor.input2.uri,
                result: editor.resource
            };
        }
        if (editor instanceof AbstractTextResourceEditorInput) {
            return {
                kind: 1,
                uri: editor.resource
            };
        }
        if (editor instanceof SideBySideEditorInput && !(editor instanceof DiffEditorInput)) {
            const primaryResource = editor.primary.resource;
            const secondaryResource = editor.secondary.resource;
            if (editor.primary instanceof AbstractTextResourceEditorInput
                && editor.secondary instanceof AbstractTextResourceEditorInput
                && isEqual(primaryResource, secondaryResource)
                && primaryResource
                && secondaryResource) {
                return {
                    kind: 1,
                    uri: primaryResource
                };
            }
            return { kind: 0 };
        }
        if (editor instanceof NotebookEditorInput) {
            return {
                kind: 4,
                notebookType: editor.viewType,
                uri: editor.resource
            };
        }
        if (editor instanceof CustomEditorInput) {
            return {
                kind: 6,
                viewType: editor.viewType,
                uri: editor.resource,
            };
        }
        if (editor instanceof WebviewInput) {
            return {
                kind: 7,
                viewType: editor.viewType
            };
        }
        if (editor instanceof TerminalEditorInput) {
            return {
                kind: 8
            };
        }
        if (editor instanceof DiffEditorInput) {
            if (editor.modified instanceof AbstractTextResourceEditorInput && editor.original instanceof AbstractTextResourceEditorInput) {
                return {
                    kind: 2,
                    modified: editor.modified.resource,
                    original: editor.original.resource
                };
            }
            if (editor.modified instanceof NotebookEditorInput && editor.original instanceof NotebookEditorInput) {
                return {
                    kind: 5,
                    notebookType: editor.original.viewType,
                    modified: editor.modified.resource,
                    original: editor.original.resource
                };
            }
        }
        if (editor instanceof InteractiveEditorInput) {
            return {
                kind: 9,
                uri: editor.resource,
                inputBoxUri: editor.inputResource
            };
        }
        if (editor instanceof ChatEditorInput) {
            return {
                kind: 10,
            };
        }
        if (editor instanceof MultiDiffEditorInput) {
            const diffEditors = [];
            for (const resource of (editor?.resources.get() ?? [])) {
                if (resource.originalUri && resource.modifiedUri) {
                    diffEditors.push({
                        kind: 2,
                        original: resource.originalUri,
                        modified: resource.modifiedUri
                    });
                }
            }
            return {
                kind: 11,
                diffEditors
            };
        }
        return { kind: 0 };
    }
    _generateTabId(editor, groupId) {
        let resourceString;
        const resource = EditorResourceAccessor.getCanonicalUri(editor, { supportSideBySide: SideBySideEditor.BOTH });
        if (resource instanceof URI) {
            resourceString = resource.toString();
        }
        else {
            resourceString = `${resource?.primary?.toString()}-${resource?.secondary?.toString()}`;
        }
        return `${groupId}~${editor.editorId}-${editor.typeId}-${resourceString} `;
    }
    _onDidGroupActivate() {
        const activeGroupId = this._editorGroupsService.activeGroup.id;
        const activeGroup = this._groupLookup.get(activeGroupId);
        if (activeGroup) {
            activeGroup.isActive = true;
            this._proxy.$acceptTabGroupUpdate(activeGroup);
        }
    }
    _onDidTabLabelChange(groupId, editorInput, editorIndex) {
        const tabId = this._generateTabId(editorInput, groupId);
        const tabInfo = this._tabInfoLookup.get(tabId);
        if (tabInfo) {
            tabInfo.tab.label = editorInput.getName();
            this._proxy.$acceptTabOperation({
                groupId,
                index: editorIndex,
                tabDto: tabInfo.tab,
                kind: 2
            });
        }
        else {
            this._logService.error('Invalid model for label change, rebuilding');
            this._createTabsModel();
        }
    }
    _onDidTabOpen(groupId, editorInput, editorIndex) {
        const group = this._editorGroupsService.getGroup(groupId);
        const groupInModel = this._groupLookup.get(groupId) !== undefined;
        if (!group || !groupInModel) {
            this._createTabsModel();
            return;
        }
        const tabs = this._groupLookup.get(groupId)?.tabs;
        if (!tabs) {
            return;
        }
        const tabObject = this._buildTabObject(group, editorInput, editorIndex);
        tabs.splice(editorIndex, 0, tabObject);
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
                    kind: 2
                });
            }));
        }
        this._proxy.$acceptTabOperation({
            groupId,
            index: editorIndex,
            tabDto: tabObject,
            kind: 0
        });
    }
    _onDidTabClose(groupId, editorIndex) {
        const group = this._editorGroupsService.getGroup(groupId);
        const tabs = this._groupLookup.get(groupId)?.tabs;
        if (!group || !tabs) {
            this._createTabsModel();
            return;
        }
        const removedTab = tabs.splice(editorIndex, 1);
        if (removedTab.length === 0) {
            return;
        }
        this._tabInfoLookup.delete(removedTab[0]?.id ?? '');
        if (removedTab[0]?.input instanceof MultiDiffEditorInput) {
            this._multiDiffEditorInputListeners.deleteAndDispose(removedTab[0]?.input);
        }
        this._proxy.$acceptTabOperation({
            groupId,
            index: editorIndex,
            tabDto: removedTab[0],
            kind: 1
        });
    }
    _onDidTabActiveChange(groupId, editorIndex) {
        const tabs = this._groupLookup.get(groupId)?.tabs;
        if (!tabs) {
            return;
        }
        const activeTab = tabs[editorIndex];
        activeTab.isActive = true;
        this._proxy.$acceptTabOperation({
            groupId,
            index: editorIndex,
            tabDto: activeTab,
            kind: 2
        });
    }
    _onDidTabDirty(groupId, editorIndex, editor) {
        const tabId = this._generateTabId(editor, groupId);
        const tabInfo = this._tabInfoLookup.get(tabId);
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
            kind: 2
        });
    }
    _onDidTabPinChange(groupId, editorIndex, editor) {
        const tabId = this._generateTabId(editor, groupId);
        const tabInfo = this._tabInfoLookup.get(tabId);
        const group = tabInfo?.group;
        const tab = tabInfo?.tab;
        if (!group || !tab) {
            this._logService.error('Invalid model for sticky change, rebuilding');
            this._createTabsModel();
            return;
        }
        tab.isPinned = group.isSticky(editorIndex);
        this._proxy.$acceptTabOperation({
            groupId,
            index: editorIndex,
            tabDto: tab,
            kind: 2
        });
    }
    _onDidTabPreviewChange(groupId, editorIndex, editor) {
        const tabId = this._generateTabId(editor, groupId);
        const tabInfo = this._tabInfoLookup.get(tabId);
        const group = tabInfo?.group;
        const tab = tabInfo?.tab;
        if (!group || !tab) {
            this._logService.error('Invalid model for sticky change, rebuilding');
            this._createTabsModel();
            return;
        }
        tab.isPreview = !group.isPinned(editorIndex);
        this._proxy.$acceptTabOperation({
            kind: 2,
            groupId,
            tabDto: tab,
            index: editorIndex
        });
    }
    _onDidTabMove(groupId, editorIndex, oldEditorIndex, editor) {
        const tabs = this._groupLookup.get(groupId)?.tabs;
        if (!tabs) {
            this._logService.error('Invalid model for move change, rebuilding');
            this._createTabsModel();
            return;
        }
        const removedTab = tabs.splice(oldEditorIndex, 1);
        if (removedTab.length === 0) {
            return;
        }
        tabs.splice(editorIndex, 0, removedTab[0]);
        this._proxy.$acceptTabOperation({
            kind: 3,
            groupId,
            tabDto: removedTab[0],
            index: editorIndex,
            oldIndex: oldEditorIndex
        });
    }
    _createTabsModel() {
        if (this._editorGroupsService.groups.length === 0) {
            return;
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
        this._proxy.$acceptEditorTabModel(this._tabGroupModel);
    }
    _updateTabsModel(changeEvent) {
        const event = changeEvent.event;
        const groupId = changeEvent.groupId;
        switch (event.kind) {
            case 0:
                if (groupId === this._editorGroupsService.activeGroup.id) {
                    this._onDidGroupActivate();
                    break;
                }
                else {
                    return;
                }
            case 9:
                if (event.editor !== undefined && event.editorIndex !== undefined) {
                    this._onDidTabLabelChange(groupId, event.editor, event.editorIndex);
                    break;
                }
            case 5:
                if (event.editor !== undefined && event.editorIndex !== undefined) {
                    this._onDidTabOpen(groupId, event.editor, event.editorIndex);
                    break;
                }
            case 6:
                if (event.editorIndex !== undefined) {
                    this._onDidTabClose(groupId, event.editorIndex);
                    break;
                }
            case 8:
                if (event.editorIndex !== undefined) {
                    this._onDidTabActiveChange(groupId, event.editorIndex);
                    break;
                }
            case 14:
                if (event.editorIndex !== undefined && event.editor !== undefined) {
                    this._onDidTabDirty(groupId, event.editorIndex, event.editor);
                    break;
                }
            case 13:
                if (event.editorIndex !== undefined && event.editor !== undefined) {
                    this._onDidTabPinChange(groupId, event.editorIndex, event.editor);
                    break;
                }
            case 11:
                if (event.editorIndex !== undefined && event.editor !== undefined) {
                    this._onDidTabPreviewChange(groupId, event.editorIndex, event.editor);
                    break;
                }
            case 12:
                break;
            case 7:
                if (isGroupEditorMoveEvent(event) && event.editor && event.editorIndex !== undefined && event.oldEditorIndex !== undefined) {
                    this._onDidTabMove(groupId, event.editorIndex, event.oldEditorIndex, event.editor);
                    break;
                }
            default:
                this._createTabsModel();
        }
    }
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
        if (this._groupLookup.get(groupId) === undefined) {
            let direction = 3;
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
        if (index < 0 || index > targetGroup.editors.length) {
            index = targetGroup.editors.length;
        }
        const editorInput = tabInfo?.editorInput;
        if (!editorInput) {
            return;
        }
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
        const results = [];
        for (const [group, editors] of groups) {
            results.push(await group.closeEditors(editors, { preserveFocus }));
        }
        return results.every(result => result);
    }
    async $closeGroup(groupIds, preserveFocus) {
        const groupCloseResults = [];
        for (const groupId of groupIds) {
            const group = this._editorGroupsService.getGroup(groupId);
            if (group) {
                groupCloseResults.push(await group.closeAllEditors());
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
