import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export class EditorModel extends Disposable {
    constructor() {
        super(...arguments);
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        this.resolved = false;
    }
    async resolve() {
        this.resolved = true;
    }
    isResolved() {
        return this.resolved;
    }
    isDisposed() {
        return this._store.isDisposed;
    }
    dispose() {
        this._onWillDispose.fire();
        super.dispose();
    }
}
