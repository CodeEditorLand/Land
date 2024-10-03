import * as DOM from '../../../../base/browser/dom.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export class WebviewWindowDragMonitor extends Disposable {
    constructor(targetWindow, getWebview) {
        super();
        const onDragStart = () => {
            getWebview()?.windowDidDragStart();
        };
        const onDragEnd = () => {
            getWebview()?.windowDidDragEnd();
        };
        this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.DRAG_START, () => {
            onDragStart();
        }));
        this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.DRAG_END, onDragEnd));
        this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.MOUSE_MOVE, currentEvent => {
            if (currentEvent.buttons === 0) {
                onDragEnd();
            }
        }));
        this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.DRAG, (event) => {
            if (event.shiftKey) {
                onDragEnd();
            }
            else {
                onDragStart();
            }
        }));
        this._register(DOM.addDisposableListener(targetWindow, DOM.EventType.DRAG_OVER, (event) => {
            if (event.shiftKey) {
                onDragEnd();
            }
            else {
                onDragStart();
            }
        }));
    }
}
