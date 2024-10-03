import * as dom from './dom.js';
import { DisposableStore, toDisposable } from '../common/lifecycle.js';
export class GlobalPointerMoveMonitor {
    constructor() {
        this._hooks = new DisposableStore();
        this._pointerMoveCallback = null;
        this._onStopCallback = null;
    }
    dispose() {
        this.stopMonitoring(false);
        this._hooks.dispose();
    }
    stopMonitoring(invokeStopCallback, browserEvent) {
        if (!this.isMonitoring()) {
            return;
        }
        this._hooks.clear();
        this._pointerMoveCallback = null;
        const onStopCallback = this._onStopCallback;
        this._onStopCallback = null;
        if (invokeStopCallback && onStopCallback) {
            onStopCallback(browserEvent);
        }
    }
    isMonitoring() {
        return !!this._pointerMoveCallback;
    }
    startMonitoring(initialElement, pointerId, initialButtons, pointerMoveCallback, onStopCallback) {
        if (this.isMonitoring()) {
            this.stopMonitoring(false);
        }
        this._pointerMoveCallback = pointerMoveCallback;
        this._onStopCallback = onStopCallback;
        let eventSource = initialElement;
        try {
            initialElement.setPointerCapture(pointerId);
            this._hooks.add(toDisposable(() => {
                try {
                    initialElement.releasePointerCapture(pointerId);
                }
                catch (err) {
                }
            }));
        }
        catch (err) {
            eventSource = dom.getWindow(initialElement);
        }
        this._hooks.add(dom.addDisposableListener(eventSource, dom.EventType.POINTER_MOVE, (e) => {
            if (e.buttons !== initialButtons) {
                this.stopMonitoring(true);
                return;
            }
            e.preventDefault();
            this._pointerMoveCallback(e);
        }));
        this._hooks.add(dom.addDisposableListener(eventSource, dom.EventType.POINTER_UP, (e) => this.stopMonitoring(true)));
    }
}
