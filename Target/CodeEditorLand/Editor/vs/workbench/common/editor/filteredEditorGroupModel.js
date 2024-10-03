import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
class FilteredEditorGroupModel extends Disposable {
    constructor(model) {
        super();
        this.model = model;
        this._onDidModelChange = this._register(new Emitter());
        this.onDidModelChange = this._onDidModelChange.event;
        this._register(this.model.onDidModelChange(e => {
            const candidateOrIndex = e.editorIndex ?? e.editor;
            if (candidateOrIndex !== undefined) {
                if (!this.filter(candidateOrIndex)) {
                    return;
                }
            }
            this._onDidModelChange.fire(e);
        }));
    }
    get id() { return this.model.id; }
    get isLocked() { return this.model.isLocked; }
    get stickyCount() { return this.model.stickyCount; }
    get activeEditor() { return this.model.activeEditor && this.filter(this.model.activeEditor) ? this.model.activeEditor : null; }
    get previewEditor() { return this.model.previewEditor && this.filter(this.model.previewEditor) ? this.model.previewEditor : null; }
    get selectedEditors() { return this.model.selectedEditors.filter(e => this.filter(e)); }
    isPinned(editorOrIndex) { return this.model.isPinned(editorOrIndex); }
    isTransient(editorOrIndex) { return this.model.isTransient(editorOrIndex); }
    isSticky(editorOrIndex) { return this.model.isSticky(editorOrIndex); }
    isActive(editor) { return this.model.isActive(editor); }
    isSelected(editorOrIndex) { return this.model.isSelected(editorOrIndex); }
    isFirst(editor) {
        return this.model.isFirst(editor, this.getEditors(1));
    }
    isLast(editor) {
        return this.model.isLast(editor, this.getEditors(1));
    }
    getEditors(order, options) {
        const editors = this.model.getEditors(order, options);
        return editors.filter(e => this.filter(e));
    }
    findEditor(candidate, options) {
        const result = this.model.findEditor(candidate, options);
        if (!result) {
            return undefined;
        }
        return this.filter(result[1]) ? result : undefined;
    }
}
export class StickyEditorGroupModel extends FilteredEditorGroupModel {
    get count() { return this.model.stickyCount; }
    getEditors(order, options) {
        if (options?.excludeSticky) {
            return [];
        }
        if (order === 1) {
            return this.model.getEditors(1).slice(0, this.model.stickyCount);
        }
        return super.getEditors(order, options);
    }
    isSticky(editorOrIndex) {
        return true;
    }
    getEditorByIndex(index) {
        return index < this.count ? this.model.getEditorByIndex(index) : undefined;
    }
    indexOf(editor, editors, options) {
        const editorIndex = this.model.indexOf(editor, editors, options);
        if (editorIndex < 0 || editorIndex >= this.model.stickyCount) {
            return -1;
        }
        return editorIndex;
    }
    contains(candidate, options) {
        const editorIndex = this.model.indexOf(candidate, undefined, options);
        return editorIndex >= 0 && editorIndex < this.model.stickyCount;
    }
    filter(candidateOrIndex) {
        return this.model.isSticky(candidateOrIndex);
    }
}
export class UnstickyEditorGroupModel extends FilteredEditorGroupModel {
    get count() { return this.model.count - this.model.stickyCount; }
    get stickyCount() { return 0; }
    isSticky(editorOrIndex) {
        return false;
    }
    getEditors(order, options) {
        if (order === 1) {
            return this.model.getEditors(1).slice(this.model.stickyCount);
        }
        return super.getEditors(order, options);
    }
    getEditorByIndex(index) {
        return index >= 0 ? this.model.getEditorByIndex(index + this.model.stickyCount) : undefined;
    }
    indexOf(editor, editors, options) {
        const editorIndex = this.model.indexOf(editor, editors, options);
        if (editorIndex < this.model.stickyCount || editorIndex >= this.model.count) {
            return -1;
        }
        return editorIndex - this.model.stickyCount;
    }
    contains(candidate, options) {
        const editorIndex = this.model.indexOf(candidate, undefined, options);
        return editorIndex >= this.model.stickyCount && editorIndex < this.model.count;
    }
    filter(candidateOrIndex) {
        return !this.model.isSticky(candidateOrIndex);
    }
}
