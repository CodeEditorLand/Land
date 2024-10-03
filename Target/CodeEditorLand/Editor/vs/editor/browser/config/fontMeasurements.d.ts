import { Disposable } from '../../../base/common/lifecycle.js';
import { BareFontInfo, FontInfo } from '../../common/config/fontInfo.js';
export interface ISerializedFontInfo {
    readonly version: number;
    readonly pixelRatio: number;
    readonly fontFamily: string;
    readonly fontWeight: string;
    readonly fontSize: number;
    readonly fontFeatureSettings: string;
    readonly fontVariationSettings: string;
    readonly lineHeight: number;
    readonly letterSpacing: number;
    readonly isMonospace: boolean;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly typicalFullwidthCharacterWidth: number;
    readonly canUseHalfwidthRightwardsArrow: boolean;
    readonly spaceWidth: number;
    readonly middotWidth: number;
    readonly wsmiddotWidth: number;
    readonly maxDigitWidth: number;
}
export declare class FontMeasurementsImpl extends Disposable {
    private readonly _cache;
    private _evictUntrustedReadingsTimeout;
    private readonly _onDidChange;
    readonly onDidChange: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    dispose(): void;
    clearAllFontInfos(): void;
    private _ensureCache;
    private _writeToCache;
    private _evictUntrustedReadings;
    serializeFontInfo(targetWindow: Window): ISerializedFontInfo[];
    restoreFontInfo(targetWindow: Window, savedFontInfos: ISerializedFontInfo[]): void;
    readFontInfo(targetWindow: Window, bareFontInfo: BareFontInfo): FontInfo;
    private _createRequest;
    private _actualReadFontInfo;
}
export declare const FontMeasurements: FontMeasurementsImpl;
