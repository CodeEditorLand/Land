import { equalsIfDefined, itemsEquals } from '../../base/common/equals.js';
import { Disposable, DisposableStore, toDisposable } from '../../base/common/lifecycle.js';
import { TransactionImpl, autorun, autorunOpts, derived, derivedOpts, derivedWithSetter, observableFromEvent, observableSignal, observableValue, observableValueOpts } from '../../base/common/observable.js';
import { Position } from '../common/core/position.js';
import { Selection } from '../common/core/selection.js';
export function observableCodeEditor(editor) {
    return ObservableCodeEditor.get(editor);
}
export class ObservableCodeEditor extends Disposable {
    static { this._map = new Map(); }
    static get(editor) {
        let result = ObservableCodeEditor._map.get(editor);
        if (!result) {
            result = new ObservableCodeEditor(editor);
            ObservableCodeEditor._map.set(editor, result);
            const d = editor.onDidDispose(() => {
                const item = ObservableCodeEditor._map.get(editor);
                if (item) {
                    ObservableCodeEditor._map.delete(editor);
                    item.dispose();
                    d.dispose();
                }
            });
        }
        return result;
    }
    _beginUpdate() {
        this._updateCounter++;
        if (this._updateCounter === 1) {
            this._currentTransaction = new TransactionImpl(() => {
            });
        }
    }
    _endUpdate() {
        this._updateCounter--;
        if (this._updateCounter === 0) {
            const t = this._currentTransaction;
            this._currentTransaction = undefined;
            t.finish();
        }
    }
    constructor(editor) {
        super();
        this.editor = editor;
        this._updateCounter = 0;
        this._currentTransaction = undefined;
        this._model = observableValue(this, this.editor.getModel());
        this.model = this._model;
        this.isReadonly = observableFromEvent(this, this.editor.onDidChangeConfiguration, () => this.editor.getOption(94));
        this._versionId = observableValueOpts({ owner: this, lazy: true }, this.editor.getModel()?.getVersionId() ?? null);
        this.versionId = this._versionId;
        this._selections = observableValueOpts({ owner: this, equalsFn: equalsIfDefined(itemsEquals(Selection.selectionsEqual)), lazy: true }, this.editor.getSelections() ?? null);
        this.selections = this._selections;
        this.positions = derivedOpts({ owner: this, equalsFn: equalsIfDefined(itemsEquals(Position.equals)) }, reader => this.selections.read(reader)?.map(s => s.getStartPosition()) ?? null);
        this.isFocused = observableFromEvent(this, e => {
            const d1 = this.editor.onDidFocusEditorWidget(e);
            const d2 = this.editor.onDidBlurEditorWidget(e);
            return {
                dispose() {
                    d1.dispose();
                    d2.dispose();
                }
            };
        }, () => this.editor.hasWidgetFocus());
        this.value = derivedWithSetter(this, reader => { this.versionId.read(reader); return this.model.read(reader)?.getValue() ?? ''; }, (value, tx) => {
            const model = this.model.get();
            if (model !== null) {
                if (value !== model.getValue()) {
                    model.setValue(value);
                }
            }
        });
        this.valueIsEmpty = derived(this, reader => { this.versionId.read(reader); return this.editor.getModel()?.getValueLength() === 0; });
        this.cursorSelection = derivedOpts({ owner: this, equalsFn: equalsIfDefined(Selection.selectionsEqual) }, reader => this.selections.read(reader)?.[0] ?? null);
        this.cursorPosition = derivedOpts({ owner: this, equalsFn: Position.equals }, reader => this.selections.read(reader)?.[0]?.getPosition() ?? null);
        this.cursorLineNumber = derived(this, reader => this.cursorPosition.read(reader)?.lineNumber ?? null);
        this.onDidType = observableSignal(this);
        this.scrollTop = observableFromEvent(this.editor.onDidScrollChange, () => this.editor.getScrollTop());
        this.scrollLeft = observableFromEvent(this.editor.onDidScrollChange, () => this.editor.getScrollLeft());
        this.layoutInfo = observableFromEvent(this.editor.onDidLayoutChange, () => this.editor.getLayoutInfo());
        this.layoutInfoContentLeft = this.layoutInfo.map(l => l.contentLeft);
        this.layoutInfoDecorationsLeft = this.layoutInfo.map(l => l.decorationsLeft);
        this.contentWidth = observableFromEvent(this.editor.onDidContentSizeChange, () => this.editor.getContentWidth());
        this._overlayWidgetCounter = 0;
        this._register(this.editor.onBeginUpdate(() => this._beginUpdate()));
        this._register(this.editor.onEndUpdate(() => this._endUpdate()));
        this._register(this.editor.onDidChangeModel(() => {
            this._beginUpdate();
            try {
                this._model.set(this.editor.getModel(), this._currentTransaction);
                this._forceUpdate();
            }
            finally {
                this._endUpdate();
            }
        }));
        this._register(this.editor.onDidType((e) => {
            this._beginUpdate();
            try {
                this._forceUpdate();
                this.onDidType.trigger(this._currentTransaction, e);
            }
            finally {
                this._endUpdate();
            }
        }));
        this._register(this.editor.onDidChangeModelContent(e => {
            this._beginUpdate();
            try {
                this._versionId.set(this.editor.getModel()?.getVersionId() ?? null, this._currentTransaction, e);
                this._forceUpdate();
            }
            finally {
                this._endUpdate();
            }
        }));
        this._register(this.editor.onDidChangeCursorSelection(e => {
            this._beginUpdate();
            try {
                this._selections.set(this.editor.getSelections(), this._currentTransaction, e);
                this._forceUpdate();
            }
            finally {
                this._endUpdate();
            }
        }));
    }
    forceUpdate(cb) {
        this._beginUpdate();
        try {
            this._forceUpdate();
            if (!cb) {
                return undefined;
            }
            return cb(this._currentTransaction);
        }
        finally {
            this._endUpdate();
        }
    }
    _forceUpdate() {
        this._beginUpdate();
        try {
            this._model.set(this.editor.getModel(), this._currentTransaction);
            this._versionId.set(this.editor.getModel()?.getVersionId() ?? null, this._currentTransaction, undefined);
            this._selections.set(this.editor.getSelections(), this._currentTransaction, undefined);
        }
        finally {
            this._endUpdate();
        }
    }
    getOption(id) {
        return observableFromEvent(this, cb => this.editor.onDidChangeConfiguration(e => {
            if (e.hasChanged(id)) {
                cb(undefined);
            }
        }), () => this.editor.getOption(id));
    }
    setDecorations(decorations) {
        const d = new DisposableStore();
        const decorationsCollection = this.editor.createDecorationsCollection();
        d.add(autorunOpts({ owner: this, debugName: () => `Apply decorations from ${decorations.debugName}` }, reader => {
            const d = decorations.read(reader);
            decorationsCollection.set(d);
        }));
        d.add({
            dispose: () => {
                decorationsCollection.clear();
            }
        });
        return d;
    }
    createOverlayWidget(widget) {
        const overlayWidgetId = 'observableOverlayWidget' + (this._overlayWidgetCounter++);
        const w = {
            getDomNode: () => widget.domNode,
            getPosition: () => widget.position.get(),
            getId: () => overlayWidgetId,
            allowEditorOverflow: widget.allowEditorOverflow,
            getMinContentWidthInPx: () => widget.minContentWidthInPx.get(),
        };
        this.editor.addOverlayWidget(w);
        const d = autorun(reader => {
            widget.position.read(reader);
            widget.minContentWidthInPx.read(reader);
            this.editor.layoutOverlayWidget(w);
        });
        return toDisposable(() => {
            d.dispose();
            this.editor.removeOverlayWidget(w);
        });
    }
}
