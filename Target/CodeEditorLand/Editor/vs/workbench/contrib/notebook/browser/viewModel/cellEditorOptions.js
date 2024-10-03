import { Emitter } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { deepClone } from '../../../../../base/common/objects.js';
export class BaseCellEditorOptions extends Disposable {
    static { this.fixedEditorOptions = {
        scrollBeyondLastLine: false,
        scrollbar: {
            verticalScrollbarSize: 14,
            horizontal: 'auto',
            useShadows: true,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            alwaysConsumeMouseWheel: false
        },
        renderLineHighlightOnlyWhenFocus: true,
        overviewRulerLanes: 0,
        lineDecorationsWidth: 0,
        folding: true,
        fixedOverflowWidgets: true,
        minimap: { enabled: false },
        renderValidationDecorations: 'on',
        lineNumbersMinChars: 3
    }; }
    get value() {
        return this._value;
    }
    constructor(notebookEditor, notebookOptions, configurationService, language) {
        super();
        this.notebookEditor = notebookEditor;
        this.notebookOptions = notebookOptions;
        this.configurationService = configurationService;
        this.language = language;
        this._localDisposableStore = this._register(new DisposableStore());
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._register(configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('editor') || e.affectsConfiguration('notebook')) {
                this._recomputeOptions();
            }
        }));
        this._register(notebookOptions.onDidChangeOptions(e => {
            if (e.cellStatusBarVisibility || e.editorTopPadding || e.editorOptionsCustomizations) {
                this._recomputeOptions();
            }
        }));
        this._register(this.notebookEditor.onDidChangeModel(() => {
            this._localDisposableStore.clear();
            if (this.notebookEditor.hasModel()) {
                this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
                    this._recomputeOptions();
                }));
                this._recomputeOptions();
            }
        }));
        if (this.notebookEditor.hasModel()) {
            this._localDisposableStore.add(this.notebookEditor.onDidChangeOptions(() => {
                this._recomputeOptions();
            }));
        }
        this._value = this._computeEditorOptions();
    }
    _recomputeOptions() {
        this._value = this._computeEditorOptions();
        this._onDidChange.fire();
    }
    _computeEditorOptions() {
        const editorOptions = deepClone(this.configurationService.getValue('editor', { overrideIdentifier: this.language }));
        const editorOptionsOverrideRaw = this.notebookOptions.getDisplayOptions().editorOptionsCustomizations;
        const editorOptionsOverride = {};
        if (editorOptionsOverrideRaw) {
            for (const key in editorOptionsOverrideRaw) {
                if (key.indexOf('editor.') === 0) {
                    editorOptionsOverride[key.substring(7)] = editorOptionsOverrideRaw[key];
                }
            }
        }
        const computed = Object.freeze({
            ...editorOptions,
            ...BaseCellEditorOptions.fixedEditorOptions,
            ...editorOptionsOverride,
            ...{ padding: { top: 12, bottom: 12 } },
            readOnly: this.notebookEditor.isReadOnly
        });
        return computed;
    }
}
