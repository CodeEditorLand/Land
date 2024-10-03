import { Emitter } from '../../../base/common/event.js';
import { Disposable, markAsSingleton } from '../../../base/common/lifecycle.js';
import { RGBA8 } from '../core/rgba.js';
import { TokenizationRegistry } from '../languages.js';
export class MinimapTokensColorTracker extends Disposable {
    static { this._INSTANCE = null; }
    static getInstance() {
        if (!this._INSTANCE) {
            this._INSTANCE = markAsSingleton(new MinimapTokensColorTracker());
        }
        return this._INSTANCE;
    }
    constructor() {
        super();
        this._onDidChange = new Emitter();
        this.onDidChange = this._onDidChange.event;
        this._updateColorMap();
        this._register(TokenizationRegistry.onDidChange(e => {
            if (e.changedColorMap) {
                this._updateColorMap();
            }
        }));
    }
    _updateColorMap() {
        const colorMap = TokenizationRegistry.getColorMap();
        if (!colorMap) {
            this._colors = [RGBA8.Empty];
            this._backgroundIsLight = true;
            return;
        }
        this._colors = [RGBA8.Empty];
        for (let colorId = 1; colorId < colorMap.length; colorId++) {
            const source = colorMap[colorId].rgba;
            this._colors[colorId] = new RGBA8(source.r, source.g, source.b, Math.round(source.a * 255));
        }
        const backgroundLuminosity = colorMap[2].getRelativeLuminance();
        this._backgroundIsLight = backgroundLuminosity >= 0.5;
        this._onDidChange.fire(undefined);
    }
    getColor(colorId) {
        if (colorId < 1 || colorId >= this._colors.length) {
            colorId = 2;
        }
        return this._colors[colorId];
    }
    backgroundIsLight() {
        return this._backgroundIsLight;
    }
}
