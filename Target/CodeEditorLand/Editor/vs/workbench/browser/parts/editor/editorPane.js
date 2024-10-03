import { Composite } from '../../composite.js';
import { isEditorInput } from '../../../common/editor.js';
import { LRUCache } from '../../../../base/common/map.js';
import { URI } from '../../../../base/common/uri.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { isEmptyObject } from '../../../../base/common/types.js';
import { DEFAULT_EDITOR_MIN_DIMENSIONS, DEFAULT_EDITOR_MAX_DIMENSIONS } from './editor.js';
import { joinPath, isEqual } from '../../../../base/common/resources.js';
import { indexOfPath } from '../../../../base/common/extpath.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { getWindowById } from '../../../../base/browser/dom.js';
export class EditorPane extends Composite {
    static { this.EDITOR_MEMENTOS = new Map(); }
    get minimumWidth() { return DEFAULT_EDITOR_MIN_DIMENSIONS.width; }
    get maximumWidth() { return DEFAULT_EDITOR_MAX_DIMENSIONS.width; }
    get minimumHeight() { return DEFAULT_EDITOR_MIN_DIMENSIONS.height; }
    get maximumHeight() { return DEFAULT_EDITOR_MAX_DIMENSIONS.height; }
    get input() { return this._input; }
    get options() { return this._options; }
    get window() { return getWindowById(this.group.windowId, true).window; }
    get scopedContextKeyService() { return undefined; }
    constructor(id, group, telemetryService, themeService, storageService) {
        super(id, telemetryService, themeService, storageService);
        this.group = group;
        this.onDidChangeSizeConstraints = Event.None;
        this._onDidChangeControl = this._register(new Emitter());
        this.onDidChangeControl = this._onDidChangeControl.event;
    }
    create(parent) {
        super.create(parent);
        this.createEditor(parent);
    }
    async setInput(input, options, context, token) {
        this._input = input;
        this._options = options;
    }
    clearInput() {
        this._input = undefined;
        this._options = undefined;
    }
    setOptions(options) {
        this._options = options;
    }
    setVisible(visible) {
        super.setVisible(visible);
        this.setEditorVisible(visible);
    }
    setEditorVisible(visible) {
    }
    setBoundarySashes(_sashes) {
    }
    getEditorMemento(editorGroupService, configurationService, key, limit = 10) {
        const mementoKey = `${this.getId()}${key}`;
        let editorMemento = EditorPane.EDITOR_MEMENTOS.get(mementoKey);
        if (!editorMemento) {
            editorMemento = this._register(new EditorMemento(this.getId(), key, this.getMemento(1, 1), limit, editorGroupService, configurationService));
            EditorPane.EDITOR_MEMENTOS.set(mementoKey, editorMemento);
        }
        return editorMemento;
    }
    getViewState() {
        return undefined;
    }
    saveState() {
        for (const [, editorMemento] of EditorPane.EDITOR_MEMENTOS) {
            if (editorMemento.id === this.getId()) {
                editorMemento.saveState();
            }
        }
        super.saveState();
    }
    dispose() {
        this._input = undefined;
        this._options = undefined;
        super.dispose();
    }
}
export class EditorMemento extends Disposable {
    static { this.SHARED_EDITOR_STATE = -1; }
    constructor(id, key, memento, limit, editorGroupService, configurationService) {
        super();
        this.id = id;
        this.key = key;
        this.memento = memento;
        this.limit = limit;
        this.editorGroupService = editorGroupService;
        this.configurationService = configurationService;
        this.cleanedUp = false;
        this.shareEditorState = false;
        this.updateConfiguration(undefined);
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => this.updateConfiguration(e)));
    }
    updateConfiguration(e) {
        if (!e || e.affectsConfiguration(undefined, 'workbench.editor.sharedViewState')) {
            this.shareEditorState = this.configurationService.getValue(undefined, 'workbench.editor.sharedViewState') === true;
        }
    }
    saveEditorState(group, resourceOrEditor, state) {
        const resource = this.doGetResource(resourceOrEditor);
        if (!resource || !group) {
            return;
        }
        const cache = this.doLoad();
        let mementosForResource = cache.get(resource.toString());
        if (!mementosForResource) {
            mementosForResource = Object.create(null);
            cache.set(resource.toString(), mementosForResource);
        }
        mementosForResource[group.id] = state;
        if (this.shareEditorState) {
            mementosForResource[EditorMemento.SHARED_EDITOR_STATE] = state;
        }
        if (isEditorInput(resourceOrEditor)) {
            this.clearEditorStateOnDispose(resource, resourceOrEditor);
        }
    }
    loadEditorState(group, resourceOrEditor) {
        const resource = this.doGetResource(resourceOrEditor);
        if (!resource || !group) {
            return;
        }
        const cache = this.doLoad();
        const mementosForResource = cache.get(resource.toString());
        if (mementosForResource) {
            const mementoForResourceAndGroup = mementosForResource[group.id];
            if (mementoForResourceAndGroup) {
                return mementoForResourceAndGroup;
            }
            if (this.shareEditorState) {
                return mementosForResource[EditorMemento.SHARED_EDITOR_STATE];
            }
        }
        return undefined;
    }
    clearEditorState(resourceOrEditor, group) {
        if (isEditorInput(resourceOrEditor)) {
            this.editorDisposables?.delete(resourceOrEditor);
        }
        const resource = this.doGetResource(resourceOrEditor);
        if (resource) {
            const cache = this.doLoad();
            if (group) {
                const mementosForResource = cache.get(resource.toString());
                if (mementosForResource) {
                    delete mementosForResource[group.id];
                    if (isEmptyObject(mementosForResource)) {
                        cache.delete(resource.toString());
                    }
                }
            }
            else {
                cache.delete(resource.toString());
            }
        }
    }
    clearEditorStateOnDispose(resource, editor) {
        if (!this.editorDisposables) {
            this.editorDisposables = new Map();
        }
        if (!this.editorDisposables.has(editor)) {
            this.editorDisposables.set(editor, Event.once(editor.onWillDispose)(() => {
                this.clearEditorState(resource);
                this.editorDisposables?.delete(editor);
            }));
        }
    }
    moveEditorState(source, target, comparer) {
        const cache = this.doLoad();
        const cacheKeys = [...cache.keys()];
        for (const cacheKey of cacheKeys) {
            const resource = URI.parse(cacheKey);
            if (!comparer.isEqualOrParent(resource, source)) {
                continue;
            }
            let targetResource;
            if (isEqual(source, resource)) {
                targetResource = target;
            }
            else {
                const index = indexOfPath(resource.path, source.path);
                targetResource = joinPath(target, resource.path.substr(index + source.path.length + 1));
            }
            const value = cache.get(cacheKey, 0);
            if (value) {
                cache.delete(cacheKey);
                cache.set(targetResource.toString(), value);
            }
        }
    }
    doGetResource(resourceOrEditor) {
        if (isEditorInput(resourceOrEditor)) {
            return resourceOrEditor.resource;
        }
        return resourceOrEditor;
    }
    doLoad() {
        if (!this.cache) {
            this.cache = new LRUCache(this.limit);
            const rawEditorMemento = this.memento[this.key];
            if (Array.isArray(rawEditorMemento)) {
                this.cache.fromJSON(rawEditorMemento);
            }
        }
        return this.cache;
    }
    saveState() {
        const cache = this.doLoad();
        if (!this.cleanedUp) {
            this.cleanUp();
            this.cleanedUp = true;
        }
        this.memento[this.key] = cache.toJSON();
    }
    cleanUp() {
        const cache = this.doLoad();
        const entries = [...cache.entries()];
        for (const [resource, mapGroupToMementos] of entries) {
            for (const group of Object.keys(mapGroupToMementos)) {
                const groupId = Number(group);
                if (groupId === EditorMemento.SHARED_EDITOR_STATE && this.shareEditorState) {
                    continue;
                }
                if (!this.editorGroupService.getGroup(groupId)) {
                    delete mapGroupToMementos[groupId];
                    if (isEmptyObject(mapGroupToMementos)) {
                        cache.delete(resource);
                    }
                }
            }
        }
    }
}
