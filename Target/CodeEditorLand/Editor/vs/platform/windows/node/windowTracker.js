import { createCancelablePromise } from '../../../base/common/async.js';
import { Event } from '../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
export class ActiveWindowManager extends Disposable {
    constructor({ onDidOpenMainWindow, onDidFocusMainWindow, getActiveWindowId }) {
        super();
        this.disposables = this._register(new DisposableStore());
        const onActiveWindowChange = Event.latch(Event.any(onDidOpenMainWindow, onDidFocusMainWindow));
        onActiveWindowChange(this.setActiveWindow, this, this.disposables);
        this.firstActiveWindowIdPromise = createCancelablePromise(() => getActiveWindowId());
        (async () => {
            try {
                const windowId = await this.firstActiveWindowIdPromise;
                this.activeWindowId = (typeof this.activeWindowId === 'number') ? this.activeWindowId : windowId;
            }
            catch (error) {
            }
            finally {
                this.firstActiveWindowIdPromise = undefined;
            }
        })();
    }
    setActiveWindow(windowId) {
        if (this.firstActiveWindowIdPromise) {
            this.firstActiveWindowIdPromise.cancel();
            this.firstActiveWindowIdPromise = undefined;
        }
        this.activeWindowId = windowId;
    }
    async getActiveClientId() {
        const id = this.firstActiveWindowIdPromise ? (await this.firstActiveWindowIdPromise) : this.activeWindowId;
        return `window:${id}`;
    }
}
