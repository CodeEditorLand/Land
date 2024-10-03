import { Emitter } from '../../../base/common/event.js';
import { EditorResourceAccessor, AbstractEditorInput, isEditorInput } from '../editor.js';
import { isEqual } from '../../../base/common/resources.js';
export class EditorInput extends AbstractEditorInput {
    constructor() {
        super(...arguments);
        this._onDidChangeDirty = this._register(new Emitter());
        this._onDidChangeLabel = this._register(new Emitter());
        this._onDidChangeCapabilities = this._register(new Emitter());
        this._onWillDispose = this._register(new Emitter());
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this.onDidChangeLabel = this._onDidChangeLabel.event;
        this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
        this.onWillDispose = this._onWillDispose.event;
    }
    get editorId() {
        return undefined;
    }
    get capabilities() {
        return 2;
    }
    hasCapability(capability) {
        if (capability === 0) {
            return this.capabilities === 0;
        }
        return (this.capabilities & capability) !== 0;
    }
    isReadonly() {
        return this.hasCapability(2);
    }
    getName() {
        return `Editor ${this.typeId}`;
    }
    getDescription(verbosity) {
        return undefined;
    }
    getTitle(verbosity) {
        return this.getName();
    }
    getLabelExtraClasses() {
        return [];
    }
    getAriaLabel() {
        return this.getTitle(0);
    }
    getIcon() {
        return undefined;
    }
    getTelemetryDescriptor() {
        return { typeId: this.typeId };
    }
    isDirty() {
        return false;
    }
    isModified() {
        return this.isDirty();
    }
    isSaving() {
        return false;
    }
    async resolve() {
        return null;
    }
    async save(group, options) {
        return this;
    }
    async saveAs(group, options) {
        return this;
    }
    async revert(group, options) { }
    async rename(group, target) {
        return undefined;
    }
    copy() {
        return this;
    }
    canMove(sourceGroup, targetGroup) {
        return true;
    }
    matches(otherInput) {
        if (isEditorInput(otherInput)) {
            return this === otherInput;
        }
        const otherInputEditorId = otherInput.options?.override;
        if (this.editorId !== otherInputEditorId && otherInputEditorId !== undefined && this.editorId !== undefined) {
            return false;
        }
        return isEqual(this.resource, EditorResourceAccessor.getCanonicalUri(otherInput));
    }
    prefersEditorPane(editorPanes) {
        return editorPanes.at(0);
    }
    toUntyped(options) {
        return undefined;
    }
    isDisposed() {
        return this._store.isDisposed;
    }
    dispose() {
        if (!this.isDisposed()) {
            this._onWillDispose.fire();
        }
        super.dispose();
    }
}
