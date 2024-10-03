import { Emitter } from '../../../../../../base/common/event.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { NotebookFindScopeType } from '../../../common/notebookCommon.js';
export class NotebookFindFilters extends Disposable {
    get markupInput() {
        return this._markupInput;
    }
    set markupInput(value) {
        if (this._markupInput !== value) {
            this._markupInput = value;
            this._onDidChange.fire({ markupInput: value });
        }
    }
    get markupPreview() {
        return this._markupPreview;
    }
    set markupPreview(value) {
        if (this._markupPreview !== value) {
            this._markupPreview = value;
            this._onDidChange.fire({ markupPreview: value });
        }
    }
    get codeInput() {
        return this._codeInput;
    }
    set codeInput(value) {
        if (this._codeInput !== value) {
            this._codeInput = value;
            this._onDidChange.fire({ codeInput: value });
        }
    }
    get codeOutput() {
        return this._codeOutput;
    }
    set codeOutput(value) {
        if (this._codeOutput !== value) {
            this._codeOutput = value;
            this._onDidChange.fire({ codeOutput: value });
        }
    }
    get findScope() {
        return this._findScope;
    }
    set findScope(value) {
        if (this._findScope !== value) {
            this._findScope = value;
            this._onDidChange.fire({ findScope: true });
        }
    }
    constructor(markupInput, markupPreview, codeInput, codeOutput, findScope) {
        super();
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._markupInput = true;
        this._markupPreview = true;
        this._codeInput = true;
        this._codeOutput = true;
        this._findScope = { findScopeType: NotebookFindScopeType.None };
        this._markupInput = markupInput;
        this._markupPreview = markupPreview;
        this._codeInput = codeInput;
        this._codeOutput = codeOutput;
        this._findScope = findScope;
        this._initialMarkupInput = markupInput;
        this._initialMarkupPreview = markupPreview;
        this._initialCodeInput = codeInput;
        this._initialCodeOutput = codeOutput;
    }
    isModified() {
        return (this._markupInput !== this._initialMarkupInput
            || this._markupPreview !== this._initialMarkupPreview
            || this._codeInput !== this._initialCodeInput
            || this._codeOutput !== this._initialCodeOutput);
    }
    update(v) {
        this._markupInput = v.markupInput;
        this._markupPreview = v.markupPreview;
        this._codeInput = v.codeInput;
        this._codeOutput = v.codeOutput;
        this._findScope = v.findScope;
    }
}
