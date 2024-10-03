import { Emitter } from '../../../base/common/event.js';
class TabFocusImpl {
    constructor() {
        this._tabFocus = false;
        this._onDidChangeTabFocus = new Emitter();
        this.onDidChangeTabFocus = this._onDidChangeTabFocus.event;
    }
    getTabFocusMode() {
        return this._tabFocus;
    }
    setTabFocusMode(tabFocusMode) {
        this._tabFocus = tabFocusMode;
        this._onDidChangeTabFocus.fire(this._tabFocus);
    }
}
export const TabFocus = new TabFocusImpl();
