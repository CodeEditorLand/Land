import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { NotebookViewEventType } from '../notebookViewEvents.js';
export class NotebookEventDispatcher extends Disposable {
    constructor() {
        super(...arguments);
        this._onDidChangeLayout = this._register(new Emitter());
        this.onDidChangeLayout = this._onDidChangeLayout.event;
        this._onDidChangeMetadata = this._register(new Emitter());
        this.onDidChangeMetadata = this._onDidChangeMetadata.event;
        this._onDidChangeCellState = this._register(new Emitter());
        this.onDidChangeCellState = this._onDidChangeCellState.event;
    }
    emit(events) {
        for (let i = 0, len = events.length; i < len; i++) {
            const e = events[i];
            switch (e.type) {
                case NotebookViewEventType.LayoutChanged:
                    this._onDidChangeLayout.fire(e);
                    break;
                case NotebookViewEventType.MetadataChanged:
                    this._onDidChangeMetadata.fire(e);
                    break;
                case NotebookViewEventType.CellStateChanged:
                    this._onDidChangeCellState.fire(e);
                    break;
            }
        }
    }
}
