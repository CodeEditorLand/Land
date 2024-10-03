import * as arrays from '../../../base/common/arrays.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { MainContext } from './extHost.protocol.js';
import { TextEditorDecorationType } from './extHostTextEditor.js';
import * as TypeConverters from './extHostTypeConverters.js';
import { TextEditorSelectionChangeKind } from './extHostTypes.js';
export class ExtHostEditors extends Disposable {
    constructor(mainContext, _extHostDocumentsAndEditors) {
        super();
        this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
        this._onDidChangeTextEditorSelection = new Emitter();
        this._onDidChangeTextEditorOptions = new Emitter();
        this._onDidChangeTextEditorVisibleRanges = new Emitter();
        this._onDidChangeTextEditorViewColumn = new Emitter();
        this._onDidChangeActiveTextEditor = new Emitter();
        this._onDidChangeVisibleTextEditors = new Emitter();
        this.onDidChangeTextEditorSelection = this._onDidChangeTextEditorSelection.event;
        this.onDidChangeTextEditorOptions = this._onDidChangeTextEditorOptions.event;
        this.onDidChangeTextEditorVisibleRanges = this._onDidChangeTextEditorVisibleRanges.event;
        this.onDidChangeTextEditorViewColumn = this._onDidChangeTextEditorViewColumn.event;
        this.onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
        this.onDidChangeVisibleTextEditors = this._onDidChangeVisibleTextEditors.event;
        this._proxy = mainContext.getProxy(MainContext.MainThreadTextEditors);
        this._register(this._extHostDocumentsAndEditors.onDidChangeVisibleTextEditors(e => this._onDidChangeVisibleTextEditors.fire(e)));
        this._register(this._extHostDocumentsAndEditors.onDidChangeActiveTextEditor(e => this._onDidChangeActiveTextEditor.fire(e)));
    }
    getActiveTextEditor() {
        return this._extHostDocumentsAndEditors.activeEditor();
    }
    getVisibleTextEditors(internal) {
        const editors = this._extHostDocumentsAndEditors.allEditors();
        return internal
            ? editors
            : editors.map(editor => editor.value);
    }
    async showTextDocument(document, columnOrOptions, preserveFocus) {
        let options;
        if (typeof columnOrOptions === 'number') {
            options = {
                position: TypeConverters.ViewColumn.from(columnOrOptions),
                preserveFocus
            };
        }
        else if (typeof columnOrOptions === 'object') {
            options = {
                position: TypeConverters.ViewColumn.from(columnOrOptions.viewColumn),
                preserveFocus: columnOrOptions.preserveFocus,
                selection: typeof columnOrOptions.selection === 'object' ? TypeConverters.Range.from(columnOrOptions.selection) : undefined,
                pinned: typeof columnOrOptions.preview === 'boolean' ? !columnOrOptions.preview : undefined
            };
        }
        else {
            options = {
                preserveFocus: false
            };
        }
        const editorId = await this._proxy.$tryShowTextDocument(document.uri, options);
        const editor = editorId && this._extHostDocumentsAndEditors.getEditor(editorId);
        if (editor) {
            return editor.value;
        }
        if (editorId) {
            throw new Error(`Could NOT open editor for "${document.uri.toString()}" because another editor opened in the meantime.`);
        }
        else {
            throw new Error(`Could NOT open editor for "${document.uri.toString()}".`);
        }
    }
    createTextEditorDecorationType(extension, options) {
        return new TextEditorDecorationType(this._proxy, extension, options).value;
    }
    $acceptEditorPropertiesChanged(id, data) {
        const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
        if (!textEditor) {
            throw new Error('unknown text editor');
        }
        if (data.options) {
            textEditor._acceptOptions(data.options);
        }
        if (data.selections) {
            const selections = data.selections.selections.map(TypeConverters.Selection.to);
            textEditor._acceptSelections(selections);
        }
        if (data.visibleRanges) {
            const visibleRanges = arrays.coalesce(data.visibleRanges.map(TypeConverters.Range.to));
            textEditor._acceptVisibleRanges(visibleRanges);
        }
        if (data.options) {
            this._onDidChangeTextEditorOptions.fire({
                textEditor: textEditor.value,
                options: { ...data.options, lineNumbers: TypeConverters.TextEditorLineNumbersStyle.to(data.options.lineNumbers) }
            });
        }
        if (data.selections) {
            const kind = TextEditorSelectionChangeKind.fromValue(data.selections.source);
            const selections = data.selections.selections.map(TypeConverters.Selection.to);
            this._onDidChangeTextEditorSelection.fire({
                textEditor: textEditor.value,
                selections,
                kind
            });
        }
        if (data.visibleRanges) {
            const visibleRanges = arrays.coalesce(data.visibleRanges.map(TypeConverters.Range.to));
            this._onDidChangeTextEditorVisibleRanges.fire({
                textEditor: textEditor.value,
                visibleRanges
            });
        }
    }
    $acceptEditorPositionData(data) {
        for (const id in data) {
            const textEditor = this._extHostDocumentsAndEditors.getEditor(id);
            if (!textEditor) {
                throw new Error('Unknown text editor');
            }
            const viewColumn = TypeConverters.ViewColumn.to(data[id]);
            if (textEditor.value.viewColumn !== viewColumn) {
                textEditor._acceptViewColumn(viewColumn);
                this._onDidChangeTextEditorViewColumn.fire({ textEditor: textEditor.value, viewColumn });
            }
        }
    }
    getDiffInformation(id) {
        return Promise.resolve(this._proxy.$getDiffInformation(id));
    }
}
