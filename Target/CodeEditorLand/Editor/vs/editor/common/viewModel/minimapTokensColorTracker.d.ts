import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { RGBA8 } from '../core/rgba.js';
import { ColorId } from '../encodedTokenAttributes.js';
export declare class MinimapTokensColorTracker extends Disposable {
    private static _INSTANCE;
    static getInstance(): MinimapTokensColorTracker;
    private _colors;
    private _backgroundIsLight;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private constructor();
    private _updateColorMap;
    getColor(colorId: ColorId): RGBA8;
    backgroundIsLight(): boolean;
}
