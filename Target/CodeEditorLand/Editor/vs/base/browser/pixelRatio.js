import { getWindowId, onDidUnregisterWindow } from './dom.js';
import { Emitter, Event } from '../common/event.js';
import { Disposable, markAsSingleton } from '../common/lifecycle.js';
class DevicePixelRatioMonitor extends Disposable {
    constructor(targetWindow) {
        super();
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._listener = () => this._handleChange(targetWindow, true);
        this._mediaQueryList = null;
        this._handleChange(targetWindow, false);
    }
    _handleChange(targetWindow, fireEvent) {
        this._mediaQueryList?.removeEventListener('change', this._listener);
        this._mediaQueryList = targetWindow.matchMedia(`(resolution: ${targetWindow.devicePixelRatio}dppx)`);
        this._mediaQueryList.addEventListener('change', this._listener);
        if (fireEvent) {
            this._onDidChange.fire();
        }
    }
}
class PixelRatioMonitorImpl extends Disposable {
    get value() {
        return this._value;
    }
    constructor(targetWindow) {
        super();
        this._onDidChange = this._register(new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._value = this._getPixelRatio(targetWindow);
        const dprMonitor = this._register(new DevicePixelRatioMonitor(targetWindow));
        this._register(dprMonitor.onDidChange(() => {
            this._value = this._getPixelRatio(targetWindow);
            this._onDidChange.fire(this._value);
        }));
    }
    _getPixelRatio(targetWindow) {
        const ctx = document.createElement('canvas').getContext('2d');
        const dpr = targetWindow.devicePixelRatio || 1;
        const bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    }
}
class PixelRatioMonitorFacade {
    constructor() {
        this.mapWindowIdToPixelRatioMonitor = new Map();
    }
    _getOrCreatePixelRatioMonitor(targetWindow) {
        const targetWindowId = getWindowId(targetWindow);
        let pixelRatioMonitor = this.mapWindowIdToPixelRatioMonitor.get(targetWindowId);
        if (!pixelRatioMonitor) {
            pixelRatioMonitor = markAsSingleton(new PixelRatioMonitorImpl(targetWindow));
            this.mapWindowIdToPixelRatioMonitor.set(targetWindowId, pixelRatioMonitor);
            markAsSingleton(Event.once(onDidUnregisterWindow)(({ vscodeWindowId }) => {
                if (vscodeWindowId === targetWindowId) {
                    pixelRatioMonitor?.dispose();
                    this.mapWindowIdToPixelRatioMonitor.delete(targetWindowId);
                }
            }));
        }
        return pixelRatioMonitor;
    }
    getInstance(targetWindow) {
        return this._getOrCreatePixelRatioMonitor(targetWindow);
    }
}
export const PixelRatio = new PixelRatioMonitorFacade();
