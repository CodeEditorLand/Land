import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
function rangesEqual(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i].start !== b[i].start || a[i].end !== b[i].end) {
            return false;
        }
    }
    return true;
}
export class NotebookCellSelectionCollection extends Disposable {
    constructor() {
        super(...arguments);
        this._onDidChangeSelection = this._register(new Emitter());
        this._primary = null;
        this._selections = [];
    }
    get onDidChangeSelection() { return this._onDidChangeSelection.event; }
    get selections() {
        return this._selections;
    }
    get focus() {
        return this._primary ?? { start: 0, end: 0 };
    }
    setState(primary, selections, forceEventEmit, source) {
        const changed = primary !== this._primary || !rangesEqual(this._selections, selections);
        this._primary = primary;
        this._selections = selections;
        if (changed || forceEventEmit) {
            this._onDidChangeSelection.fire(source);
        }
    }
    setSelections(selections, forceEventEmit, source) {
        this.setState(this._primary, selections, forceEventEmit, source);
    }
}
