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
import { diffSets } from '../../../base/common/collections.js';
import { Emitter } from '../../../base/common/event.js';
import { assertIsDefined } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import * as typeConverters from './extHostTypeConverters.js';
import { ChatEditorTabInput, CustomEditorTabInput, InteractiveWindowInput, NotebookDiffEditorTabInput, NotebookEditorTabInput, TerminalEditorTabInput, TextDiffTabInput, TextMergeTabInput, TextTabInput, WebviewEditorTabInput, TextMultiDiffTabInput } from './extHostTypes.js';
export const IExtHostEditorTabs = createDecorator('IExtHostEditorTabs');
class ExtHostEditorTab {
    constructor(dto, parentGroup, activeTabIdGetter) {
        this._activeTabIdGetter = activeTabIdGetter;
        this._parentGroup = parentGroup;
        this.acceptDtoUpdate(dto);
    }
    get apiObject() {
        if (!this._apiObject) {
            const that = this;
            const obj = {
                get isActive() {
                    return that._dto.id === that._activeTabIdGetter();
                },
                get label() {
                    return that._dto.label;
                },
                get input() {
                    return that._input;
                },
                get isDirty() {
                    return that._dto.isDirty;
                },
                get isPinned() {
                    return that._dto.isPinned;
                },
                get isPreview() {
                    return that._dto.isPreview;
                },
                get group() {
                    return that._parentGroup.apiObject;
                }
            };
            this._apiObject = Object.freeze(obj);
        }
        return this._apiObject;
    }
    get tabId() {
        return this._dto.id;
    }
    acceptDtoUpdate(dto) {
        this._dto = dto;
        this._input = this._initInput();
    }
    _initInput() {
        switch (this._dto.input.kind) {
            case 1:
                return new TextTabInput(URI.revive(this._dto.input.uri));
            case 2:
                return new TextDiffTabInput(URI.revive(this._dto.input.original), URI.revive(this._dto.input.modified));
            case 3:
                return new TextMergeTabInput(URI.revive(this._dto.input.base), URI.revive(this._dto.input.input1), URI.revive(this._dto.input.input2), URI.revive(this._dto.input.result));
            case 6:
                return new CustomEditorTabInput(URI.revive(this._dto.input.uri), this._dto.input.viewType);
            case 7:
                return new WebviewEditorTabInput(this._dto.input.viewType);
            case 4:
                return new NotebookEditorTabInput(URI.revive(this._dto.input.uri), this._dto.input.notebookType);
            case 5:
                return new NotebookDiffEditorTabInput(URI.revive(this._dto.input.original), URI.revive(this._dto.input.modified), this._dto.input.notebookType);
            case 8:
                return new TerminalEditorTabInput();
            case 9:
                return new InteractiveWindowInput(URI.revive(this._dto.input.uri), URI.revive(this._dto.input.inputBoxUri));
            case 10:
                return new ChatEditorTabInput();
            case 11:
                return new TextMultiDiffTabInput(this._dto.input.diffEditors.map(diff => new TextDiffTabInput(URI.revive(diff.original), URI.revive(diff.modified))));
            default:
                return undefined;
        }
    }
}
class ExtHostEditorTabGroup {
    constructor(dto, activeGroupIdGetter) {
        this._tabs = [];
        this._activeTabId = '';
        this._dto = dto;
        this._activeGroupIdGetter = activeGroupIdGetter;
        for (const tabDto of dto.tabs) {
            if (tabDto.isActive) {
                this._activeTabId = tabDto.id;
            }
            this._tabs.push(new ExtHostEditorTab(tabDto, this, () => this.activeTabId()));
        }
    }
    get apiObject() {
        if (!this._apiObject) {
            const that = this;
            const obj = {
                get isActive() {
                    return that._dto.groupId === that._activeGroupIdGetter();
                },
                get viewColumn() {
                    return typeConverters.ViewColumn.to(that._dto.viewColumn);
                },
                get activeTab() {
                    return that._tabs.find(tab => tab.tabId === that._activeTabId)?.apiObject;
                },
                get tabs() {
                    return Object.freeze(that._tabs.map(tab => tab.apiObject));
                }
            };
            this._apiObject = Object.freeze(obj);
        }
        return this._apiObject;
    }
    get groupId() {
        return this._dto.groupId;
    }
    get tabs() {
        return this._tabs;
    }
    acceptGroupDtoUpdate(dto) {
        this._dto = dto;
    }
    acceptTabOperation(operation) {
        if (operation.kind === 0) {
            const tab = new ExtHostEditorTab(operation.tabDto, this, () => this.activeTabId());
            this._tabs.splice(operation.index, 0, tab);
            if (operation.tabDto.isActive) {
                this._activeTabId = tab.tabId;
            }
            return tab;
        }
        else if (operation.kind === 1) {
            const tab = this._tabs.splice(operation.index, 1)[0];
            if (!tab) {
                throw new Error(`Tab close updated received for index ${operation.index} which does not exist`);
            }
            if (tab.tabId === this._activeTabId) {
                this._activeTabId = '';
            }
            return tab;
        }
        else if (operation.kind === 3) {
            if (operation.oldIndex === undefined) {
                throw new Error('Invalid old index on move IPC');
            }
            const tab = this._tabs.splice(operation.oldIndex, 1)[0];
            if (!tab) {
                throw new Error(`Tab move updated received for index ${operation.oldIndex} which does not exist`);
            }
            this._tabs.splice(operation.index, 0, tab);
            return tab;
        }
        const tab = this._tabs.find(extHostTab => extHostTab.tabId === operation.tabDto.id);
        if (!tab) {
            throw new Error('INVALID tab');
        }
        if (operation.tabDto.isActive) {
            this._activeTabId = operation.tabDto.id;
        }
        else if (this._activeTabId === operation.tabDto.id && !operation.tabDto.isActive) {
            this._activeTabId = '';
        }
        tab.acceptDtoUpdate(operation.tabDto);
        return tab;
    }
    activeTabId() {
        return this._activeTabId;
    }
}
let ExtHostEditorTabs = class ExtHostEditorTabs {
    constructor(extHostRpc) {
        this._onDidChangeTabs = new Emitter();
        this._onDidChangeTabGroups = new Emitter();
        this._extHostTabGroups = [];
        this._proxy = extHostRpc.getProxy(MainContext.MainThreadEditorTabs);
    }
    get tabGroups() {
        if (!this._apiObject) {
            const that = this;
            const obj = {
                onDidChangeTabGroups: that._onDidChangeTabGroups.event,
                onDidChangeTabs: that._onDidChangeTabs.event,
                get all() {
                    return Object.freeze(that._extHostTabGroups.map(group => group.apiObject));
                },
                get activeTabGroup() {
                    const activeTabGroupId = that._activeGroupId;
                    const activeTabGroup = assertIsDefined(that._extHostTabGroups.find(candidate => candidate.groupId === activeTabGroupId)?.apiObject);
                    return activeTabGroup;
                },
                close: async (tabOrTabGroup, preserveFocus) => {
                    const tabsOrTabGroups = Array.isArray(tabOrTabGroup) ? tabOrTabGroup : [tabOrTabGroup];
                    if (!tabsOrTabGroups.length) {
                        return true;
                    }
                    if (isTabGroup(tabsOrTabGroups[0])) {
                        return this._closeGroups(tabsOrTabGroups, preserveFocus);
                    }
                    else {
                        return this._closeTabs(tabsOrTabGroups, preserveFocus);
                    }
                },
            };
            this._apiObject = Object.freeze(obj);
        }
        return this._apiObject;
    }
    $acceptEditorTabModel(tabGroups) {
        const groupIdsBefore = new Set(this._extHostTabGroups.map(group => group.groupId));
        const groupIdsAfter = new Set(tabGroups.map(dto => dto.groupId));
        const diff = diffSets(groupIdsBefore, groupIdsAfter);
        const closed = this._extHostTabGroups.filter(group => diff.removed.includes(group.groupId)).map(group => group.apiObject);
        const opened = [];
        const changed = [];
        this._extHostTabGroups = tabGroups.map(tabGroup => {
            const group = new ExtHostEditorTabGroup(tabGroup, () => this._activeGroupId);
            if (diff.added.includes(group.groupId)) {
                opened.push(group.apiObject);
            }
            else {
                changed.push(group.apiObject);
            }
            return group;
        });
        const activeTabGroupId = assertIsDefined(tabGroups.find(group => group.isActive === true)?.groupId);
        if (activeTabGroupId !== undefined && this._activeGroupId !== activeTabGroupId) {
            this._activeGroupId = activeTabGroupId;
        }
        this._onDidChangeTabGroups.fire(Object.freeze({ opened, closed, changed }));
    }
    $acceptTabGroupUpdate(groupDto) {
        const group = this._extHostTabGroups.find(group => group.groupId === groupDto.groupId);
        if (!group) {
            throw new Error('Update Group IPC call received before group creation.');
        }
        group.acceptGroupDtoUpdate(groupDto);
        if (groupDto.isActive) {
            this._activeGroupId = groupDto.groupId;
        }
        this._onDidChangeTabGroups.fire(Object.freeze({ changed: [group.apiObject], opened: [], closed: [] }));
    }
    $acceptTabOperation(operation) {
        const group = this._extHostTabGroups.find(group => group.groupId === operation.groupId);
        if (!group) {
            throw new Error('Update Tabs IPC call received before group creation.');
        }
        const tab = group.acceptTabOperation(operation);
        switch (operation.kind) {
            case 0:
                this._onDidChangeTabs.fire(Object.freeze({
                    opened: [tab.apiObject],
                    closed: [],
                    changed: []
                }));
                return;
            case 1:
                this._onDidChangeTabs.fire(Object.freeze({
                    opened: [],
                    closed: [tab.apiObject],
                    changed: []
                }));
                return;
            case 3:
            case 2:
                this._onDidChangeTabs.fire(Object.freeze({
                    opened: [],
                    closed: [],
                    changed: [tab.apiObject]
                }));
                return;
        }
    }
    _findExtHostTabFromApi(apiTab) {
        for (const group of this._extHostTabGroups) {
            for (const tab of group.tabs) {
                if (tab.apiObject === apiTab) {
                    return tab;
                }
            }
        }
        return;
    }
    _findExtHostTabGroupFromApi(apiTabGroup) {
        return this._extHostTabGroups.find(candidate => candidate.apiObject === apiTabGroup);
    }
    async _closeTabs(tabs, preserveFocus) {
        const extHostTabIds = [];
        for (const tab of tabs) {
            const extHostTab = this._findExtHostTabFromApi(tab);
            if (!extHostTab) {
                throw new Error('Tab close: Invalid tab not found!');
            }
            extHostTabIds.push(extHostTab.tabId);
        }
        return this._proxy.$closeTab(extHostTabIds, preserveFocus);
    }
    async _closeGroups(groups, preserverFoucs) {
        const extHostGroupIds = [];
        for (const group of groups) {
            const extHostGroup = this._findExtHostTabGroupFromApi(group);
            if (!extHostGroup) {
                throw new Error('Group close: Invalid group not found!');
            }
            extHostGroupIds.push(extHostGroup.groupId);
        }
        return this._proxy.$closeGroup(extHostGroupIds, preserverFoucs);
    }
};
ExtHostEditorTabs = __decorate([
    __param(0, IExtHostRpcService),
    __metadata("design:paramtypes", [Object])
], ExtHostEditorTabs);
export { ExtHostEditorTabs };
function isTabGroup(obj) {
    const tabGroup = obj;
    if (tabGroup.tabs !== undefined) {
        return true;
    }
    return false;
}
