import { addDisposableListener } from '../../../../../base/browser/dom.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
export class FocusTracker extends Disposable {
    constructor(_domNode, _onFocusChange) {
        super();
        this._domNode = _domNode;
        this._onFocusChange = _onFocusChange;
        this._isFocused = false;
        this._register(addDisposableListener(this._domNode, 'focus', () => this._handleFocusedChanged(true)));
        this._register(addDisposableListener(this._domNode, 'blur', () => this._handleFocusedChanged(false)));
    }
    _handleFocusedChanged(focused) {
        if (this._isFocused === focused) {
            return;
        }
        this._isFocused = focused;
        this._onFocusChange(this._isFocused);
    }
    focus() {
        this._handleFocusedChanged(true);
        this._domNode.focus();
    }
    get isFocused() {
        return this._isFocused;
    }
}
export function editContextAddDisposableListener(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    return {
        dispose() {
            target.removeEventListener(type, listener);
        }
    };
}
