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
var EditorGroupModel_1;
import { Event, Emitter } from '../../../base/common/event.js';
import { EditorExtensions, SideBySideEditor, EditorCloseContext } from '../editor.js';
import { EditorInput } from './editorInput.js';
import { SideBySideEditorInput } from './sideBySideEditorInput.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { dispose, Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { Registry } from '../../../platform/registry/common/platform.js';
import { coalesce } from '../../../base/common/arrays.js';
const EditorOpenPositioning = {
    LEFT: 'left',
    RIGHT: 'right',
    FIRST: 'first',
    LAST: 'last'
};
export function isSerializedEditorGroupModel(group) {
    const candidate = group;
    return !!(candidate && typeof candidate === 'object' && Array.isArray(candidate.editors) && Array.isArray(candidate.mru));
}
export function isGroupEditorChangeEvent(e) {
    const candidate = e;
    return candidate.editor && candidate.editorIndex !== undefined;
}
export function isGroupEditorOpenEvent(e) {
    const candidate = e;
    return candidate.kind === 5 && candidate.editorIndex !== undefined;
}
export function isGroupEditorMoveEvent(e) {
    const candidate = e;
    return candidate.kind === 7 && candidate.editorIndex !== undefined && candidate.oldEditorIndex !== undefined;
}
export function isGroupEditorCloseEvent(e) {
    const candidate = e;
    return candidate.kind === 6 && candidate.editorIndex !== undefined && candidate.context !== undefined && candidate.sticky !== undefined;
}
let EditorGroupModel = class EditorGroupModel extends Disposable {
    static { EditorGroupModel_1 = this; }
    static { this.IDS = 0; }
    get id() { return this._id; }
    get active() {
        return this.selection[0] ?? null;
    }
    constructor(labelOrSerializedGroup, instantiationService, configurationService) {
        super();
        this.instantiationService = instantiationService;
        this.configurationService = configurationService;
        this._onDidModelChange = this._register(new Emitter({ leakWarningThreshold: 500 }));
        this.onDidModelChange = this._onDidModelChange.event;
        this.editors = [];
        this.mru = [];
        this.editorListeners = new Set();
        this.locked = false;
        this.selection = [];
        this.preview = null;
        this.sticky = -1;
        this.transient = new Set();
        if (isSerializedEditorGroupModel(labelOrSerializedGroup)) {
            this._id = this.deserialize(labelOrSerializedGroup);
        }
        else {
            this._id = EditorGroupModel_1.IDS++;
        }
        this.onConfigurationUpdated();
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.configurationService.onDidChangeConfiguration(e => this.onConfigurationUpdated(e)));
    }
    onConfigurationUpdated(e) {
        if (e && !e.affectsConfiguration('workbench.editor.openPositioning') && !e.affectsConfiguration('workbench.editor.focusRecentEditorAfterClose')) {
            return;
        }
        this.editorOpenPositioning = this.configurationService.getValue('workbench.editor.openPositioning');
        this.focusRecentEditorAfterClose = this.configurationService.getValue('workbench.editor.focusRecentEditorAfterClose');
    }
    get count() {
        return this.editors.length;
    }
    get stickyCount() {
        return this.sticky + 1;
    }
    getEditors(order, options) {
        const editors = order === 0 ? this.mru.slice(0) : this.editors.slice(0);
        if (options?.excludeSticky) {
            if (order === 0) {
                return editors.filter(editor => !this.isSticky(editor));
            }
            return editors.slice(this.sticky + 1);
        }
        return editors;
    }
    getEditorByIndex(index) {
        return this.editors[index];
    }
    get activeEditor() {
        return this.active;
    }
    isActive(candidate) {
        return this.matches(this.active, candidate);
    }
    get previewEditor() {
        return this.preview;
    }
    openEditor(candidate, options) {
        const makeSticky = options?.sticky || (typeof options?.index === 'number' && this.isSticky(options.index));
        const makePinned = options?.pinned || options?.sticky;
        const makeTransient = !!options?.transient;
        const makeActive = options?.active || !this.activeEditor || (!makePinned && this.preview === this.activeEditor);
        const existingEditorAndIndex = this.findEditor(candidate, options);
        if (!existingEditorAndIndex) {
            const newEditor = candidate;
            const indexOfActive = this.indexOf(this.active);
            let targetIndex;
            if (options && typeof options.index === 'number') {
                targetIndex = options.index;
            }
            else if (this.editorOpenPositioning === EditorOpenPositioning.FIRST) {
                targetIndex = 0;
                if (!makeSticky && this.isSticky(targetIndex)) {
                    targetIndex = this.sticky + 1;
                }
            }
            else if (this.editorOpenPositioning === EditorOpenPositioning.LAST) {
                targetIndex = this.editors.length;
            }
            else {
                if (this.editorOpenPositioning === EditorOpenPositioning.LEFT) {
                    if (indexOfActive === 0 || !this.editors.length) {
                        targetIndex = 0;
                    }
                    else {
                        targetIndex = indexOfActive;
                    }
                }
                else {
                    targetIndex = indexOfActive + 1;
                }
                if (!makeSticky && this.isSticky(targetIndex)) {
                    targetIndex = this.sticky + 1;
                }
            }
            if (makeSticky) {
                this.sticky++;
                if (!this.isSticky(targetIndex)) {
                    targetIndex = this.sticky;
                }
            }
            if (makePinned || !this.preview) {
                this.splice(targetIndex, false, newEditor);
            }
            if (makeTransient) {
                this.doSetTransient(newEditor, targetIndex, true);
            }
            if (!makePinned) {
                if (this.preview) {
                    const indexOfPreview = this.indexOf(this.preview);
                    if (targetIndex > indexOfPreview) {
                        targetIndex--;
                    }
                    this.replaceEditor(this.preview, newEditor, targetIndex, !makeActive);
                }
                this.preview = newEditor;
            }
            this.registerEditorListeners(newEditor);
            const event = {
                kind: 5,
                editor: newEditor,
                editorIndex: targetIndex
            };
            this._onDidModelChange.fire(event);
            this.setSelection(makeActive ? newEditor : this.activeEditor, options?.inactiveSelection ?? []);
            return {
                editor: newEditor,
                isNew: true
            };
        }
        else {
            const [existingEditor, existingEditorIndex] = existingEditorAndIndex;
            this.doSetTransient(existingEditor, existingEditorIndex, makeTransient === false ? false : this.isTransient(existingEditor));
            if (makePinned) {
                this.doPin(existingEditor, existingEditorIndex);
            }
            this.setSelection(makeActive ? existingEditor : this.activeEditor, options?.inactiveSelection ?? []);
            if (options && typeof options.index === 'number') {
                this.moveEditor(existingEditor, options.index);
            }
            if (makeSticky) {
                this.doStick(existingEditor, this.indexOf(existingEditor));
            }
            return {
                editor: existingEditor,
                isNew: false
            };
        }
    }
    registerEditorListeners(editor) {
        const listeners = new DisposableStore();
        this.editorListeners.add(listeners);
        listeners.add(Event.once(editor.onWillDispose)(() => {
            const editorIndex = this.editors.indexOf(editor);
            if (editorIndex >= 0) {
                const event = {
                    kind: 15,
                    editor,
                    editorIndex
                };
                this._onDidModelChange.fire(event);
            }
        }));
        listeners.add(editor.onDidChangeDirty(() => {
            const event = {
                kind: 14,
                editor,
                editorIndex: this.editors.indexOf(editor)
            };
            this._onDidModelChange.fire(event);
        }));
        listeners.add(editor.onDidChangeLabel(() => {
            const event = {
                kind: 9,
                editor,
                editorIndex: this.editors.indexOf(editor)
            };
            this._onDidModelChange.fire(event);
        }));
        listeners.add(editor.onDidChangeCapabilities(() => {
            const event = {
                kind: 10,
                editor,
                editorIndex: this.editors.indexOf(editor)
            };
            this._onDidModelChange.fire(event);
        }));
        listeners.add(this.onDidModelChange(event => {
            if (event.kind === 6 && event.editor?.matches(editor)) {
                dispose(listeners);
                this.editorListeners.delete(listeners);
            }
        }));
    }
    replaceEditor(toReplace, replaceWith, replaceIndex, openNext = true) {
        const closeResult = this.doCloseEditor(toReplace, EditorCloseContext.REPLACE, openNext);
        this.splice(replaceIndex, false, replaceWith);
        if (closeResult) {
            const event = {
                kind: 6,
                ...closeResult
            };
            this._onDidModelChange.fire(event);
        }
    }
    closeEditor(candidate, context = EditorCloseContext.UNKNOWN, openNext = true) {
        const closeResult = this.doCloseEditor(candidate, context, openNext);
        if (closeResult) {
            const event = {
                kind: 6,
                ...closeResult
            };
            this._onDidModelChange.fire(event);
            return closeResult;
        }
        return undefined;
    }
    doCloseEditor(candidate, context, openNext) {
        const index = this.indexOf(candidate);
        if (index === -1) {
            return undefined;
        }
        const editor = this.editors[index];
        const sticky = this.isSticky(index);
        const isActiveEditor = this.active === editor;
        if (openNext && isActiveEditor) {
            if (this.mru.length > 1) {
                let newActive;
                if (this.focusRecentEditorAfterClose) {
                    newActive = this.mru[1];
                }
                else {
                    if (index === this.editors.length - 1) {
                        newActive = this.editors[index - 1];
                    }
                    else {
                        newActive = this.editors[index + 1];
                    }
                }
                const newInactiveSelectedEditors = this.selection.filter(selected => selected !== editor && selected !== newActive);
                this.doSetSelection(newActive, this.editors.indexOf(newActive), newInactiveSelectedEditors);
            }
            else {
                this.doSetSelection(null, undefined, []);
            }
        }
        else if (!isActiveEditor) {
            if (this.doIsSelected(editor)) {
                const newInactiveSelectedEditors = this.selection.filter(selected => selected !== editor && selected !== this.activeEditor);
                this.doSetSelection(this.activeEditor, this.indexOf(this.activeEditor), newInactiveSelectedEditors);
            }
        }
        if (this.preview === editor) {
            this.preview = null;
        }
        this.transient.delete(editor);
        this.splice(index, true);
        return { editor, sticky, editorIndex: index, context };
    }
    moveEditor(candidate, toIndex) {
        if (toIndex >= this.editors.length) {
            toIndex = this.editors.length - 1;
        }
        else if (toIndex < 0) {
            toIndex = 0;
        }
        const index = this.indexOf(candidate);
        if (index < 0 || toIndex === index) {
            return;
        }
        const editor = this.editors[index];
        const sticky = this.sticky;
        if (this.isSticky(index) && toIndex > this.sticky) {
            this.sticky--;
        }
        else if (!this.isSticky(index) && toIndex <= this.sticky) {
            this.sticky++;
        }
        this.editors.splice(index, 1);
        this.editors.splice(toIndex, 0, editor);
        const event = {
            kind: 7,
            editor,
            oldEditorIndex: index,
            editorIndex: toIndex
        };
        this._onDidModelChange.fire(event);
        if (sticky !== this.sticky) {
            const event = {
                kind: 13,
                editor,
                editorIndex: toIndex
            };
            this._onDidModelChange.fire(event);
        }
        return editor;
    }
    setActive(candidate) {
        let result = undefined;
        if (!candidate) {
            this.setGroupActive();
        }
        else {
            result = this.setEditorActive(candidate);
        }
        return result;
    }
    setGroupActive() {
        this._onDidModelChange.fire({ kind: 0 });
    }
    setEditorActive(candidate) {
        const res = this.findEditor(candidate);
        if (!res) {
            return;
        }
        const [editor, editorIndex] = res;
        this.doSetSelection(editor, editorIndex, []);
        return editor;
    }
    get selectedEditors() {
        return this.editors.filter(editor => this.doIsSelected(editor));
    }
    isSelected(editorCandidateOrIndex) {
        let editor;
        if (typeof editorCandidateOrIndex === 'number') {
            editor = this.editors[editorCandidateOrIndex];
        }
        else {
            editor = this.findEditor(editorCandidateOrIndex)?.[0];
        }
        return !!editor && this.doIsSelected(editor);
    }
    doIsSelected(editor) {
        return this.selection.includes(editor);
    }
    setSelection(activeSelectedEditorCandidate, inactiveSelectedEditorCandidates) {
        const res = this.findEditor(activeSelectedEditorCandidate);
        if (!res) {
            return;
        }
        const [activeSelectedEditor, activeSelectedEditorIndex] = res;
        const inactiveSelectedEditors = new Set();
        for (const inactiveSelectedEditorCandidate of inactiveSelectedEditorCandidates) {
            const res = this.findEditor(inactiveSelectedEditorCandidate);
            if (!res) {
                return;
            }
            const [inactiveSelectedEditor] = res;
            if (inactiveSelectedEditor === activeSelectedEditor) {
                continue;
            }
            inactiveSelectedEditors.add(inactiveSelectedEditor);
        }
        this.doSetSelection(activeSelectedEditor, activeSelectedEditorIndex, Array.from(inactiveSelectedEditors));
    }
    doSetSelection(activeSelectedEditor, activeSelectedEditorIndex, inactiveSelectedEditors) {
        const previousActiveEditor = this.activeEditor;
        const previousSelection = this.selection;
        let newSelection;
        if (activeSelectedEditor) {
            newSelection = [activeSelectedEditor, ...inactiveSelectedEditors];
        }
        else {
            newSelection = [];
        }
        this.selection = newSelection;
        const activeEditorChanged = activeSelectedEditor && typeof activeSelectedEditorIndex === 'number' && previousActiveEditor !== activeSelectedEditor;
        if (activeEditorChanged) {
            const mruIndex = this.indexOf(activeSelectedEditor, this.mru);
            this.mru.splice(mruIndex, 1);
            this.mru.unshift(activeSelectedEditor);
            const event = {
                kind: 8,
                editor: activeSelectedEditor,
                editorIndex: activeSelectedEditorIndex
            };
            this._onDidModelChange.fire(event);
        }
        if (activeEditorChanged ||
            previousSelection.length !== newSelection.length ||
            previousSelection.some(editor => !newSelection.includes(editor))) {
            const event = {
                kind: 4
            };
            this._onDidModelChange.fire(event);
        }
    }
    setIndex(index) {
        this._onDidModelChange.fire({ kind: 1 });
    }
    setLabel(label) {
        this._onDidModelChange.fire({ kind: 2 });
    }
    pin(candidate) {
        const res = this.findEditor(candidate);
        if (!res) {
            return;
        }
        const [editor, editorIndex] = res;
        this.doPin(editor, editorIndex);
        return editor;
    }
    doPin(editor, editorIndex) {
        if (this.isPinned(editor)) {
            return;
        }
        this.setTransient(editor, false);
        this.preview = null;
        const event = {
            kind: 11,
            editor,
            editorIndex
        };
        this._onDidModelChange.fire(event);
    }
    unpin(candidate) {
        const res = this.findEditor(candidate);
        if (!res) {
            return;
        }
        const [editor, editorIndex] = res;
        this.doUnpin(editor, editorIndex);
        return editor;
    }
    doUnpin(editor, editorIndex) {
        if (!this.isPinned(editor)) {
            return;
        }
        const oldPreview = this.preview;
        this.preview = editor;
        const event = {
            kind: 11,
            editor,
            editorIndex
        };
        this._onDidModelChange.fire(event);
        if (oldPreview) {
            this.closeEditor(oldPreview, EditorCloseContext.UNPIN);
        }
    }
    isPinned(editorCandidateOrIndex) {
        let editor;
        if (typeof editorCandidateOrIndex === 'number') {
            editor = this.editors[editorCandidateOrIndex];
        }
        else {
            editor = editorCandidateOrIndex;
        }
        return !this.matches(this.preview, editor);
    }
    stick(candidate) {
        const res = this.findEditor(candidate);
        if (!res) {
            return;
        }
        const [editor, editorIndex] = res;
        this.doStick(editor, editorIndex);
        return editor;
    }
    doStick(editor, editorIndex) {
        if (this.isSticky(editorIndex)) {
            return;
        }
        this.pin(editor);
        const newEditorIndex = this.sticky + 1;
        this.moveEditor(editor, newEditorIndex);
        this.sticky++;
        const event = {
            kind: 13,
            editor,
            editorIndex: newEditorIndex
        };
        this._onDidModelChange.fire(event);
    }
    unstick(candidate) {
        const res = this.findEditor(candidate);
        if (!res) {
            return;
        }
        const [editor, editorIndex] = res;
        this.doUnstick(editor, editorIndex);
        return editor;
    }
    doUnstick(editor, editorIndex) {
        if (!this.isSticky(editorIndex)) {
            return;
        }
        const newEditorIndex = this.sticky;
        this.moveEditor(editor, newEditorIndex);
        this.sticky--;
        const event = {
            kind: 13,
            editor,
            editorIndex: newEditorIndex
        };
        this._onDidModelChange.fire(event);
    }
    isSticky(candidateOrIndex) {
        if (this.sticky < 0) {
            return false;
        }
        let index;
        if (typeof candidateOrIndex === 'number') {
            index = candidateOrIndex;
        }
        else {
            index = this.indexOf(candidateOrIndex);
        }
        if (index < 0) {
            return false;
        }
        return index <= this.sticky;
    }
    setTransient(candidate, transient) {
        if (!transient && this.transient.size === 0) {
            return;
        }
        const res = this.findEditor(candidate);
        if (!res) {
            return;
        }
        const [editor, editorIndex] = res;
        this.doSetTransient(editor, editorIndex, transient);
        return editor;
    }
    doSetTransient(editor, editorIndex, transient) {
        if (transient) {
            if (this.transient.has(editor)) {
                return;
            }
            this.transient.add(editor);
        }
        else {
            if (!this.transient.has(editor)) {
                return;
            }
            this.transient.delete(editor);
        }
        const event = {
            kind: 12,
            editor,
            editorIndex
        };
        this._onDidModelChange.fire(event);
    }
    isTransient(editorCandidateOrIndex) {
        if (this.transient.size === 0) {
            return false;
        }
        let editor;
        if (typeof editorCandidateOrIndex === 'number') {
            editor = this.editors[editorCandidateOrIndex];
        }
        else {
            editor = this.findEditor(editorCandidateOrIndex)?.[0];
        }
        return !!editor && this.transient.has(editor);
    }
    splice(index, del, editor) {
        const editorToDeleteOrReplace = this.editors[index];
        if (del && this.isSticky(index)) {
            this.sticky--;
        }
        if (editor) {
            this.editors.splice(index, del ? 1 : 0, editor);
        }
        else {
            this.editors.splice(index, del ? 1 : 0);
        }
        {
            if (!del && editor) {
                if (this.mru.length === 0) {
                    this.mru.push(editor);
                }
                else {
                    this.mru.splice(1, 0, editor);
                }
            }
            else {
                const indexInMRU = this.indexOf(editorToDeleteOrReplace, this.mru);
                if (del && !editor) {
                    this.mru.splice(indexInMRU, 1);
                }
                else if (del && editor) {
                    this.mru.splice(indexInMRU, 1, editor);
                }
            }
        }
    }
    indexOf(candidate, editors = this.editors, options) {
        let index = -1;
        if (!candidate) {
            return index;
        }
        for (let i = 0; i < editors.length; i++) {
            const editor = editors[i];
            if (this.matches(editor, candidate, options)) {
                if (options?.supportSideBySide && editor instanceof SideBySideEditorInput && !(candidate instanceof SideBySideEditorInput)) {
                    index = i;
                }
                else {
                    index = i;
                    break;
                }
            }
        }
        return index;
    }
    findEditor(candidate, options) {
        const index = this.indexOf(candidate, this.editors, options);
        if (index === -1) {
            return undefined;
        }
        return [this.editors[index], index];
    }
    isFirst(candidate, editors = this.editors) {
        return this.matches(editors[0], candidate);
    }
    isLast(candidate, editors = this.editors) {
        return this.matches(editors[editors.length - 1], candidate);
    }
    contains(candidate, options) {
        return this.indexOf(candidate, this.editors, options) !== -1;
    }
    matches(editor, candidate, options) {
        if (!editor || !candidate) {
            return false;
        }
        if (options?.supportSideBySide && editor instanceof SideBySideEditorInput && !(candidate instanceof SideBySideEditorInput)) {
            switch (options.supportSideBySide) {
                case SideBySideEditor.ANY:
                    if (this.matches(editor.primary, candidate, options) || this.matches(editor.secondary, candidate, options)) {
                        return true;
                    }
                    break;
                case SideBySideEditor.BOTH:
                    if (this.matches(editor.primary, candidate, options) && this.matches(editor.secondary, candidate, options)) {
                        return true;
                    }
                    break;
            }
        }
        const strictEquals = editor === candidate;
        if (options?.strictEquals) {
            return strictEquals;
        }
        return strictEquals || editor.matches(candidate);
    }
    get isLocked() {
        return this.locked;
    }
    lock(locked) {
        if (this.isLocked !== locked) {
            this.locked = locked;
            this._onDidModelChange.fire({ kind: 3 });
        }
    }
    clone() {
        const clone = this.instantiationService.createInstance(EditorGroupModel_1, undefined);
        clone.editors = this.editors.slice(0);
        clone.mru = this.mru.slice(0);
        clone.preview = this.preview;
        clone.selection = this.selection.slice(0);
        clone.sticky = this.sticky;
        for (const editor of clone.editors) {
            clone.registerEditorListeners(editor);
        }
        return clone;
    }
    serialize() {
        const registry = Registry.as(EditorExtensions.EditorFactory);
        const serializableEditors = [];
        const serializedEditors = [];
        let serializablePreviewIndex;
        let serializableSticky = this.sticky;
        for (let i = 0; i < this.editors.length; i++) {
            const editor = this.editors[i];
            let canSerializeEditor = false;
            const editorSerializer = registry.getEditorSerializer(editor);
            if (editorSerializer) {
                const value = editorSerializer.canSerialize(editor) ? editorSerializer.serialize(editor) : undefined;
                if (typeof value === 'string') {
                    canSerializeEditor = true;
                    serializedEditors.push({ id: editor.typeId, value });
                    serializableEditors.push(editor);
                    if (this.preview === editor) {
                        serializablePreviewIndex = serializableEditors.length - 1;
                    }
                }
                else {
                    canSerializeEditor = false;
                }
            }
            if (!canSerializeEditor && this.isSticky(i)) {
                serializableSticky--;
            }
        }
        const serializableMru = this.mru.map(editor => this.indexOf(editor, serializableEditors)).filter(i => i >= 0);
        return {
            id: this.id,
            locked: this.locked ? true : undefined,
            editors: serializedEditors,
            mru: serializableMru,
            preview: serializablePreviewIndex,
            sticky: serializableSticky >= 0 ? serializableSticky : undefined
        };
    }
    deserialize(data) {
        const registry = Registry.as(EditorExtensions.EditorFactory);
        if (typeof data.id === 'number') {
            this._id = data.id;
            EditorGroupModel_1.IDS = Math.max(data.id + 1, EditorGroupModel_1.IDS);
        }
        else {
            this._id = EditorGroupModel_1.IDS++;
        }
        if (data.locked) {
            this.locked = true;
        }
        this.editors = coalesce(data.editors.map((e, index) => {
            let editor = undefined;
            const editorSerializer = registry.getEditorSerializer(e.id);
            if (editorSerializer) {
                const deserializedEditor = editorSerializer.deserialize(this.instantiationService, e.value);
                if (deserializedEditor instanceof EditorInput) {
                    editor = deserializedEditor;
                    this.registerEditorListeners(editor);
                }
            }
            if (!editor && typeof data.sticky === 'number' && index <= data.sticky) {
                data.sticky--;
            }
            return editor;
        }));
        this.mru = coalesce(data.mru.map(i => this.editors[i]));
        this.selection = this.mru.length > 0 ? [this.mru[0]] : [];
        if (typeof data.preview === 'number') {
            this.preview = this.editors[data.preview];
        }
        if (typeof data.sticky === 'number') {
            this.sticky = data.sticky;
        }
        return this._id;
    }
    dispose() {
        dispose(Array.from(this.editorListeners));
        this.editorListeners.clear();
        this.transient.clear();
        super.dispose();
    }
};
EditorGroupModel = EditorGroupModel_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], EditorGroupModel);
export { EditorGroupModel };
