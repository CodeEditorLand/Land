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
var EditorsObserver_1;
import { EditorExtensions } from '../../../common/editor.js';
import { SideBySideEditorInput } from '../../../common/editor/sideBySideEditorInput.js';
import { dispose, Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { LinkedMap, ResourceMap } from '../../../../base/common/map.js';
import { equals } from '../../../../base/common/objects.js';
/**
 * A observer of opened editors across all editor groups by most recently used.
 * Rules:
 * - the last editor in the list is the one most recently activated
 * - the first editor in the list is the one that was activated the longest time ago
 * - an editor that opens inactive will be placed behind the currently active editor
 *
 * The observer may start to close editors based on the workbench.editor.limit setting.
 */
let EditorsObserver = class EditorsObserver extends Disposable {
    static { EditorsObserver_1 = this; }
    static { this.STORAGE_KEY = 'editors.mru'; }
    get count() {
        return this.mostRecentEditorsMap.size;
    }
    get editors() {
        return [...this.mostRecentEditorsMap.values()];
    }
    hasEditor(editor) {
        const editors = this.editorsPerResourceCounter.get(editor.resource);
        return editors?.has(this.toIdentifier(editor)) ?? false;
    }
    hasEditors(resource) {
        return this.editorsPerResourceCounter.has(resource);
    }
    toIdentifier(arg1, editorId) {
        if (typeof arg1 !== 'string') {
            return this.toIdentifier(arg1.typeId, arg1.editorId);
        }
        if (editorId) {
            return `${arg1}/${editorId}`;
        }
        return arg1;
    }
    constructor(editorGroupsContainer, editorGroupService, storageService) {
        super();
        this.editorGroupService = editorGroupService;
        this.storageService = storageService;
        this.keyMap = new Map();
        this.mostRecentEditorsMap = new LinkedMap();
        this.editorsPerResourceCounter = new ResourceMap();
        this._onDidMostRecentlyActiveEditorsChange = this._register(new Emitter());
        this.onDidMostRecentlyActiveEditorsChange = this._onDidMostRecentlyActiveEditorsChange.event;
        this.editorGroupsContainer = editorGroupsContainer ?? editorGroupService;
        this.isScoped = !!editorGroupsContainer;
        this.registerListeners();
        this.loadState();
    }
    registerListeners() {
        this._register(this.editorGroupsContainer.onDidAddGroup(group => this.onGroupAdded(group)));
        this._register(this.editorGroupService.onDidChangeEditorPartOptions(e => this.onDidChangeEditorPartOptions(e)));
        this._register(this.storageService.onWillSaveState(() => this.saveState()));
    }
    onGroupAdded(group) {
        // Make sure to add any already existing editor
        // of the new group into our list in LRU order
        const groupEditorsMru = group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
        for (let i = groupEditorsMru.length - 1; i >= 0; i--) {
            this.addMostRecentEditor(group, groupEditorsMru[i], false /* is not active */, true /* is new */);
        }
        // Make sure that active editor is put as first if group is active
        if (this.editorGroupsContainer.activeGroup === group && group.activeEditor) {
            this.addMostRecentEditor(group, group.activeEditor, true /* is active */, false /* already added before */);
        }
        // Group Listeners
        this.registerGroupListeners(group);
    }
    registerGroupListeners(group) {
        const groupDisposables = new DisposableStore();
        groupDisposables.add(group.onDidModelChange(e => {
            switch (e.kind) {
                // Group gets active: put active editor as most recent
                case 0 /* GroupModelChangeKind.GROUP_ACTIVE */: {
                    if (this.editorGroupsContainer.activeGroup === group && group.activeEditor) {
                        this.addMostRecentEditor(group, group.activeEditor, true /* is active */, false /* editor already opened */);
                    }
                    break;
                }
                // Editor opens: put it as second most recent
                //
                // Also check for maximum allowed number of editors and
                // start to close oldest ones if needed.
                case 5 /* GroupModelChangeKind.EDITOR_OPEN */: {
                    if (e.editor) {
                        this.addMostRecentEditor(group, e.editor, false /* is not active */, true /* is new */);
                        this.ensureOpenedEditorsLimit({ groupId: group.id, editor: e.editor }, group.id);
                    }
                    break;
                }
            }
        }));
        // Editor closes: remove from recently opened
        groupDisposables.add(group.onDidCloseEditor(e => {
            this.removeMostRecentEditor(group, e.editor);
        }));
        // Editor gets active: put active editor as most recent
        // if group is active, otherwise second most recent
        groupDisposables.add(group.onDidActiveEditorChange(e => {
            if (e.editor) {
                this.addMostRecentEditor(group, e.editor, this.editorGroupsContainer.activeGroup === group, false /* editor already opened */);
            }
        }));
        // Make sure to cleanup on dispose
        Event.once(group.onWillDispose)(() => dispose(groupDisposables));
    }
    onDidChangeEditorPartOptions(event) {
        if (!equals(event.newPartOptions.limit, event.oldPartOptions.limit)) {
            const activeGroup = this.editorGroupsContainer.activeGroup;
            let exclude = undefined;
            if (activeGroup.activeEditor) {
                exclude = { editor: activeGroup.activeEditor, groupId: activeGroup.id };
            }
            this.ensureOpenedEditorsLimit(exclude);
        }
    }
    addMostRecentEditor(group, editor, isActive, isNew) {
        const key = this.ensureKey(group, editor);
        const mostRecentEditor = this.mostRecentEditorsMap.first;
        // Active or first entry: add to end of map
        if (isActive || !mostRecentEditor) {
            this.mostRecentEditorsMap.set(key, key, mostRecentEditor ? 1 /* Touch.AsOld */ : undefined);
        }
        // Otherwise: insert before most recent
        else {
            // we have most recent editors. as such we
            // put this newly opened editor right before
            // the current most recent one because it cannot
            // be the most recently active one unless
            // it becomes active. but it is still more
            // active then any other editor in the list.
            this.mostRecentEditorsMap.set(key, key, 1 /* Touch.AsOld */);
            this.mostRecentEditorsMap.set(mostRecentEditor, mostRecentEditor, 1 /* Touch.AsOld */);
        }
        // Update in resource map if this is a new editor
        if (isNew) {
            this.updateEditorResourcesMap(editor, true);
        }
        // Event
        this._onDidMostRecentlyActiveEditorsChange.fire();
    }
    updateEditorResourcesMap(editor, add) {
        // Distill the editor resource and type id with support
        // for side by side editor's primary side too.
        let resource = undefined;
        let typeId = undefined;
        let editorId = undefined;
        if (editor instanceof SideBySideEditorInput) {
            resource = editor.primary.resource;
            typeId = editor.primary.typeId;
            editorId = editor.primary.editorId;
        }
        else {
            resource = editor.resource;
            typeId = editor.typeId;
            editorId = editor.editorId;
        }
        if (!resource) {
            return; // require a resource
        }
        const identifier = this.toIdentifier(typeId, editorId);
        // Add entry
        if (add) {
            let editorsPerResource = this.editorsPerResourceCounter.get(resource);
            if (!editorsPerResource) {
                editorsPerResource = new Map();
                this.editorsPerResourceCounter.set(resource, editorsPerResource);
            }
            editorsPerResource.set(identifier, (editorsPerResource.get(identifier) ?? 0) + 1);
        }
        // Remove entry
        else {
            const editorsPerResource = this.editorsPerResourceCounter.get(resource);
            if (editorsPerResource) {
                const counter = editorsPerResource.get(identifier) ?? 0;
                if (counter > 1) {
                    editorsPerResource.set(identifier, counter - 1);
                }
                else {
                    editorsPerResource.delete(identifier);
                    if (editorsPerResource.size === 0) {
                        this.editorsPerResourceCounter.delete(resource);
                    }
                }
            }
        }
    }
    removeMostRecentEditor(group, editor) {
        // Update in resource map
        this.updateEditorResourcesMap(editor, false);
        // Update in MRU list
        const key = this.findKey(group, editor);
        if (key) {
            // Remove from most recent editors
            this.mostRecentEditorsMap.delete(key);
            // Remove from key map
            const map = this.keyMap.get(group.id);
            if (map && map.delete(key.editor) && map.size === 0) {
                this.keyMap.delete(group.id);
            }
            // Event
            this._onDidMostRecentlyActiveEditorsChange.fire();
        }
    }
    findKey(group, editor) {
        const groupMap = this.keyMap.get(group.id);
        if (!groupMap) {
            return undefined;
        }
        return groupMap.get(editor);
    }
    ensureKey(group, editor) {
        let groupMap = this.keyMap.get(group.id);
        if (!groupMap) {
            groupMap = new Map();
            this.keyMap.set(group.id, groupMap);
        }
        let key = groupMap.get(editor);
        if (!key) {
            key = { groupId: group.id, editor };
            groupMap.set(editor, key);
        }
        return key;
    }
    async ensureOpenedEditorsLimit(exclude, groupId) {
        if (!this.editorGroupService.partOptions.limit?.enabled ||
            typeof this.editorGroupService.partOptions.limit.value !== 'number' ||
            this.editorGroupService.partOptions.limit.value <= 0) {
            return; // return early if not enabled or invalid
        }
        const limit = this.editorGroupService.partOptions.limit.value;
        // In editor group
        if (this.editorGroupService.partOptions.limit?.perEditorGroup) {
            // For specific editor groups
            if (typeof groupId === 'number') {
                const group = this.editorGroupsContainer.getGroup(groupId);
                if (group) {
                    await this.doEnsureOpenedEditorsLimit(limit, group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */).map(editor => ({ editor, groupId })), exclude);
                }
            }
            // For all editor groups
            else {
                for (const group of this.editorGroupsContainer.groups) {
                    await this.ensureOpenedEditorsLimit(exclude, group.id);
                }
            }
        }
        // Across all editor groups
        else {
            await this.doEnsureOpenedEditorsLimit(limit, [...this.mostRecentEditorsMap.values()], exclude);
        }
    }
    async doEnsureOpenedEditorsLimit(limit, mostRecentEditors, exclude) {
        // Check for `excludeDirty` setting and apply it by excluding
        // any recent editor that is dirty from the opened editors limit
        let mostRecentEditorsCountingForLimit;
        if (this.editorGroupService.partOptions.limit?.excludeDirty) {
            mostRecentEditorsCountingForLimit = mostRecentEditors.filter(({ editor }) => {
                if ((editor.isDirty() && !editor.isSaving()) || editor.hasCapability(512 /* EditorInputCapabilities.Scratchpad */)) {
                    return false; // not dirty editors (unless in the process of saving) or scratchpads
                }
                return true;
            });
        }
        else {
            mostRecentEditorsCountingForLimit = mostRecentEditors;
        }
        if (limit >= mostRecentEditorsCountingForLimit.length) {
            return; // only if opened editors exceed setting and is valid and enabled
        }
        // Extract least recently used editors that can be closed
        const leastRecentlyClosableEditors = mostRecentEditorsCountingForLimit.reverse().filter(({ editor, groupId }) => {
            if ((editor.isDirty() && !editor.isSaving()) || editor.hasCapability(512 /* EditorInputCapabilities.Scratchpad */)) {
                return false; // not dirty editors (unless in the process of saving) or scratchpads
            }
            if (exclude && editor === exclude.editor && groupId === exclude.groupId) {
                return false; // never the editor that should be excluded
            }
            if (this.editorGroupsContainer.getGroup(groupId)?.isSticky(editor)) {
                return false; // never sticky editors
            }
            return true;
        });
        // Close editors until we reached the limit again
        let editorsToCloseCount = mostRecentEditorsCountingForLimit.length - limit;
        const mapGroupToEditorsToClose = new Map();
        for (const { groupId, editor } of leastRecentlyClosableEditors) {
            let editorsInGroupToClose = mapGroupToEditorsToClose.get(groupId);
            if (!editorsInGroupToClose) {
                editorsInGroupToClose = [];
                mapGroupToEditorsToClose.set(groupId, editorsInGroupToClose);
            }
            editorsInGroupToClose.push(editor);
            editorsToCloseCount--;
            if (editorsToCloseCount === 0) {
                break; // limit reached
            }
        }
        for (const [groupId, editors] of mapGroupToEditorsToClose) {
            const group = this.editorGroupsContainer.getGroup(groupId);
            if (group) {
                await group.closeEditors(editors, { preserveFocus: true });
            }
        }
    }
    saveState() {
        if (this.isScoped) {
            return; // do not persist state when scoped
        }
        if (this.mostRecentEditorsMap.isEmpty()) {
            this.storageService.remove(EditorsObserver_1.STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
        }
        else {
            this.storageService.store(EditorsObserver_1.STORAGE_KEY, JSON.stringify(this.serialize()), 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
    }
    serialize() {
        const registry = Registry.as(EditorExtensions.EditorFactory);
        const entries = [...this.mostRecentEditorsMap.values()];
        const mapGroupToSerializableEditorsOfGroup = new Map();
        return {
            entries: coalesce(entries.map(({ editor, groupId }) => {
                // Find group for entry
                const group = this.editorGroupsContainer.getGroup(groupId);
                if (!group) {
                    return undefined;
                }
                // Find serializable editors of group
                let serializableEditorsOfGroup = mapGroupToSerializableEditorsOfGroup.get(group);
                if (!serializableEditorsOfGroup) {
                    serializableEditorsOfGroup = group.getEditors(1 /* EditorsOrder.SEQUENTIAL */).filter(editor => {
                        const editorSerializer = registry.getEditorSerializer(editor);
                        return editorSerializer?.canSerialize(editor);
                    });
                    mapGroupToSerializableEditorsOfGroup.set(group, serializableEditorsOfGroup);
                }
                // Only store the index of the editor of that group
                // which can be undefined if the editor is not serializable
                const index = serializableEditorsOfGroup.indexOf(editor);
                if (index === -1) {
                    return undefined;
                }
                return { groupId, index };
            }))
        };
    }
    async loadState() {
        if (this.editorGroupsContainer === this.editorGroupService.mainPart || this.editorGroupsContainer === this.editorGroupService) {
            await this.editorGroupService.whenReady;
        }
        // Previous state: Load editors map from persisted state
        // unless we are running in scoped mode
        let hasRestorableState = false;
        if (!this.isScoped) {
            const serialized = this.storageService.get(EditorsObserver_1.STORAGE_KEY, 1 /* StorageScope.WORKSPACE */);
            if (serialized) {
                hasRestorableState = true;
                this.deserialize(JSON.parse(serialized));
            }
        }
        // No previous state: best we can do is add each editor
        // from oldest to most recently used editor group
        if (!hasRestorableState) {
            const groups = this.editorGroupsContainer.getGroups(1 /* GroupsOrder.MOST_RECENTLY_ACTIVE */);
            for (let i = groups.length - 1; i >= 0; i--) {
                const group = groups[i];
                const groupEditorsMru = group.getEditors(0 /* EditorsOrder.MOST_RECENTLY_ACTIVE */);
                for (let i = groupEditorsMru.length - 1; i >= 0; i--) {
                    this.addMostRecentEditor(group, groupEditorsMru[i], true /* enforce as active to preserve order */, true /* is new */);
                }
            }
        }
        // Ensure we listen on group changes for those that exist on startup
        for (const group of this.editorGroupsContainer.groups) {
            this.registerGroupListeners(group);
        }
    }
    deserialize(serialized) {
        const mapValues = [];
        for (const { groupId, index } of serialized.entries) {
            // Find group for entry
            const group = this.editorGroupsContainer.getGroup(groupId);
            if (!group) {
                continue;
            }
            // Find editor for entry
            const editor = group.getEditorByIndex(index);
            if (!editor) {
                continue;
            }
            // Make sure key is registered as well
            const editorIdentifier = this.ensureKey(group, editor);
            mapValues.push([editorIdentifier, editorIdentifier]);
            // Update in resource map
            this.updateEditorResourcesMap(editor, true);
        }
        // Fill map with deserialized values
        this.mostRecentEditorsMap.fromJSON(mapValues);
    }
};
EditorsObserver = EditorsObserver_1 = __decorate([
    __param(1, IEditorGroupsService),
    __param(2, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object])
], EditorsObserver);
export { EditorsObserver };
