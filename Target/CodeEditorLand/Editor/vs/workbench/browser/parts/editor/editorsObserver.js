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
        const groupEditorsMru = group.getEditors(0);
        for (let i = groupEditorsMru.length - 1; i >= 0; i--) {
            this.addMostRecentEditor(group, groupEditorsMru[i], false, true);
        }
        if (this.editorGroupsContainer.activeGroup === group && group.activeEditor) {
            this.addMostRecentEditor(group, group.activeEditor, true, false);
        }
        this.registerGroupListeners(group);
    }
    registerGroupListeners(group) {
        const groupDisposables = new DisposableStore();
        groupDisposables.add(group.onDidModelChange(e => {
            switch (e.kind) {
                case 0: {
                    if (this.editorGroupsContainer.activeGroup === group && group.activeEditor) {
                        this.addMostRecentEditor(group, group.activeEditor, true, false);
                    }
                    break;
                }
                case 5: {
                    if (e.editor) {
                        this.addMostRecentEditor(group, e.editor, false, true);
                        this.ensureOpenedEditorsLimit({ groupId: group.id, editor: e.editor }, group.id);
                    }
                    break;
                }
            }
        }));
        groupDisposables.add(group.onDidCloseEditor(e => {
            this.removeMostRecentEditor(group, e.editor);
        }));
        groupDisposables.add(group.onDidActiveEditorChange(e => {
            if (e.editor) {
                this.addMostRecentEditor(group, e.editor, this.editorGroupsContainer.activeGroup === group, false);
            }
        }));
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
        if (isActive || !mostRecentEditor) {
            this.mostRecentEditorsMap.set(key, key, mostRecentEditor ? 1 : undefined);
        }
        else {
            this.mostRecentEditorsMap.set(key, key, 1);
            this.mostRecentEditorsMap.set(mostRecentEditor, mostRecentEditor, 1);
        }
        if (isNew) {
            this.updateEditorResourcesMap(editor, true);
        }
        this._onDidMostRecentlyActiveEditorsChange.fire();
    }
    updateEditorResourcesMap(editor, add) {
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
            return;
        }
        const identifier = this.toIdentifier(typeId, editorId);
        if (add) {
            let editorsPerResource = this.editorsPerResourceCounter.get(resource);
            if (!editorsPerResource) {
                editorsPerResource = new Map();
                this.editorsPerResourceCounter.set(resource, editorsPerResource);
            }
            editorsPerResource.set(identifier, (editorsPerResource.get(identifier) ?? 0) + 1);
        }
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
        this.updateEditorResourcesMap(editor, false);
        const key = this.findKey(group, editor);
        if (key) {
            this.mostRecentEditorsMap.delete(key);
            const map = this.keyMap.get(group.id);
            if (map && map.delete(key.editor) && map.size === 0) {
                this.keyMap.delete(group.id);
            }
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
            return;
        }
        const limit = this.editorGroupService.partOptions.limit.value;
        if (this.editorGroupService.partOptions.limit?.perEditorGroup) {
            if (typeof groupId === 'number') {
                const group = this.editorGroupsContainer.getGroup(groupId);
                if (group) {
                    await this.doEnsureOpenedEditorsLimit(limit, group.getEditors(0).map(editor => ({ editor, groupId })), exclude);
                }
            }
            else {
                for (const group of this.editorGroupsContainer.groups) {
                    await this.ensureOpenedEditorsLimit(exclude, group.id);
                }
            }
        }
        else {
            await this.doEnsureOpenedEditorsLimit(limit, [...this.mostRecentEditorsMap.values()], exclude);
        }
    }
    async doEnsureOpenedEditorsLimit(limit, mostRecentEditors, exclude) {
        let mostRecentEditorsCountingForLimit;
        if (this.editorGroupService.partOptions.limit?.excludeDirty) {
            mostRecentEditorsCountingForLimit = mostRecentEditors.filter(({ editor }) => {
                if ((editor.isDirty() && !editor.isSaving()) || editor.hasCapability(512)) {
                    return false;
                }
                return true;
            });
        }
        else {
            mostRecentEditorsCountingForLimit = mostRecentEditors;
        }
        if (limit >= mostRecentEditorsCountingForLimit.length) {
            return;
        }
        const leastRecentlyClosableEditors = mostRecentEditorsCountingForLimit.reverse().filter(({ editor, groupId }) => {
            if ((editor.isDirty() && !editor.isSaving()) || editor.hasCapability(512)) {
                return false;
            }
            if (exclude && editor === exclude.editor && groupId === exclude.groupId) {
                return false;
            }
            if (this.editorGroupsContainer.getGroup(groupId)?.isSticky(editor)) {
                return false;
            }
            return true;
        });
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
                break;
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
            return;
        }
        if (this.mostRecentEditorsMap.isEmpty()) {
            this.storageService.remove(EditorsObserver_1.STORAGE_KEY, 1);
        }
        else {
            this.storageService.store(EditorsObserver_1.STORAGE_KEY, JSON.stringify(this.serialize()), 1, 1);
        }
    }
    serialize() {
        const registry = Registry.as(EditorExtensions.EditorFactory);
        const entries = [...this.mostRecentEditorsMap.values()];
        const mapGroupToSerializableEditorsOfGroup = new Map();
        return {
            entries: coalesce(entries.map(({ editor, groupId }) => {
                const group = this.editorGroupsContainer.getGroup(groupId);
                if (!group) {
                    return undefined;
                }
                let serializableEditorsOfGroup = mapGroupToSerializableEditorsOfGroup.get(group);
                if (!serializableEditorsOfGroup) {
                    serializableEditorsOfGroup = group.getEditors(1).filter(editor => {
                        const editorSerializer = registry.getEditorSerializer(editor);
                        return editorSerializer?.canSerialize(editor);
                    });
                    mapGroupToSerializableEditorsOfGroup.set(group, serializableEditorsOfGroup);
                }
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
        let hasRestorableState = false;
        if (!this.isScoped) {
            const serialized = this.storageService.get(EditorsObserver_1.STORAGE_KEY, 1);
            if (serialized) {
                hasRestorableState = true;
                this.deserialize(JSON.parse(serialized));
            }
        }
        if (!hasRestorableState) {
            const groups = this.editorGroupsContainer.getGroups(1);
            for (let i = groups.length - 1; i >= 0; i--) {
                const group = groups[i];
                const groupEditorsMru = group.getEditors(0);
                for (let i = groupEditorsMru.length - 1; i >= 0; i--) {
                    this.addMostRecentEditor(group, groupEditorsMru[i], true, true);
                }
            }
        }
        for (const group of this.editorGroupsContainer.groups) {
            this.registerGroupListeners(group);
        }
    }
    deserialize(serialized) {
        const mapValues = [];
        for (const { groupId, index } of serialized.entries) {
            const group = this.editorGroupsContainer.getGroup(groupId);
            if (!group) {
                continue;
            }
            const editor = group.getEditorByIndex(index);
            if (!editor) {
                continue;
            }
            const editorIdentifier = this.ensureKey(group, editor);
            mapValues.push([editorIdentifier, editorIdentifier]);
            this.updateEditorResourcesMap(editor, true);
        }
        this.mostRecentEditorsMap.fromJSON(mapValues);
    }
};
EditorsObserver = EditorsObserver_1 = __decorate([
    __param(1, IEditorGroupsService),
    __param(2, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object])
], EditorsObserver);
export { EditorsObserver };
