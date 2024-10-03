import * as platform from '../../../base/common/platform.js';
import { EditorFontVariations, EditorOptions, EDITOR_FONT_DEFAULTS } from './editorOptions.js';
import { EditorZoom } from './editorZoom.js';
const GOLDEN_LINE_HEIGHT_RATIO = platform.isMacintosh ? 1.5 : 1.35;
const MINIMUM_LINE_HEIGHT = 8;
export class BareFontInfo {
    static createFromValidatedSettings(options, pixelRatio, ignoreEditorZoom) {
        const fontFamily = options.get(51);
        const fontWeight = options.get(55);
        const fontSize = options.get(54);
        const fontFeatureSettings = options.get(53);
        const fontVariationSettings = options.get(56);
        const lineHeight = options.get(69);
        const letterSpacing = options.get(66);
        return BareFontInfo._create(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom);
    }
    static createFromRawSettings(opts, pixelRatio, ignoreEditorZoom = false) {
        const fontFamily = EditorOptions.fontFamily.validate(opts.fontFamily);
        const fontWeight = EditorOptions.fontWeight.validate(opts.fontWeight);
        const fontSize = EditorOptions.fontSize.validate(opts.fontSize);
        const fontFeatureSettings = EditorOptions.fontLigatures2.validate(opts.fontLigatures);
        const fontVariationSettings = EditorOptions.fontVariations.validate(opts.fontVariations);
        const lineHeight = EditorOptions.lineHeight.validate(opts.lineHeight);
        const letterSpacing = EditorOptions.letterSpacing.validate(opts.letterSpacing);
        return BareFontInfo._create(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom);
    }
    static _create(fontFamily, fontWeight, fontSize, fontFeatureSettings, fontVariationSettings, lineHeight, letterSpacing, pixelRatio, ignoreEditorZoom) {
        if (lineHeight === 0) {
            lineHeight = GOLDEN_LINE_HEIGHT_RATIO * fontSize;
        }
        else if (lineHeight < MINIMUM_LINE_HEIGHT) {
            lineHeight = lineHeight * fontSize;
        }
        lineHeight = Math.round(lineHeight);
        if (lineHeight < MINIMUM_LINE_HEIGHT) {
            lineHeight = MINIMUM_LINE_HEIGHT;
        }
        const editorZoomLevelMultiplier = 1 + (ignoreEditorZoom ? 0 : EditorZoom.getZoomLevel() * 0.1);
        fontSize *= editorZoomLevelMultiplier;
        lineHeight *= editorZoomLevelMultiplier;
        if (fontVariationSettings === EditorFontVariations.TRANSLATE) {
            if (fontWeight === 'normal' || fontWeight === 'bold') {
                fontVariationSettings = EditorFontVariations.OFF;
            }
            else {
                const fontWeightAsNumber = parseInt(fontWeight, 10);
                fontVariationSettings = `'wght' ${fontWeightAsNumber}`;
                fontWeight = 'normal';
            }
        }
        return new BareFontInfo({
            pixelRatio: pixelRatio,
            fontFamily: fontFamily,
            fontWeight: fontWeight,
            fontSize: fontSize,
            fontFeatureSettings: fontFeatureSettings,
            fontVariationSettings,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing
        });
    }
    constructor(opts) {
        this._bareFontInfoBrand = undefined;
        this.pixelRatio = opts.pixelRatio;
        this.fontFamily = String(opts.fontFamily);
        this.fontWeight = String(opts.fontWeight);
        this.fontSize = opts.fontSize;
        this.fontFeatureSettings = opts.fontFeatureSettings;
        this.fontVariationSettings = opts.fontVariationSettings;
        this.lineHeight = opts.lineHeight | 0;
        this.letterSpacing = opts.letterSpacing;
    }
    getId() {
        return `${this.pixelRatio}-${this.fontFamily}-${this.fontWeight}-${this.fontSize}-${this.fontFeatureSettings}-${this.fontVariationSettings}-${this.lineHeight}-${this.letterSpacing}`;
    }
    getMassagedFontFamily() {
        const fallbackFontFamily = EDITOR_FONT_DEFAULTS.fontFamily;
        const fontFamily = BareFontInfo._wrapInQuotes(this.fontFamily);
        if (fallbackFontFamily && this.fontFamily !== fallbackFontFamily) {
            return `${fontFamily}, ${fallbackFontFamily}`;
        }
        return fontFamily;
    }
    static _wrapInQuotes(fontFamily) {
        if (/[,"']/.test(fontFamily)) {
            return fontFamily;
        }
        if (/[+ ]/.test(fontFamily)) {
            return `"${fontFamily}"`;
        }
        return fontFamily;
    }
}
export const SERIALIZED_FONT_INFO_VERSION = 2;
export class FontInfo extends BareFontInfo {
    constructor(opts, isTrusted) {
        super(opts);
        this._editorStylingBrand = undefined;
        this.version = SERIALIZED_FONT_INFO_VERSION;
        this.isTrusted = isTrusted;
        this.isMonospace = opts.isMonospace;
        this.typicalHalfwidthCharacterWidth = opts.typicalHalfwidthCharacterWidth;
        this.typicalFullwidthCharacterWidth = opts.typicalFullwidthCharacterWidth;
        this.canUseHalfwidthRightwardsArrow = opts.canUseHalfwidthRightwardsArrow;
        this.spaceWidth = opts.spaceWidth;
        this.middotWidth = opts.middotWidth;
        this.wsmiddotWidth = opts.wsmiddotWidth;
        this.maxDigitWidth = opts.maxDigitWidth;
    }
    equals(other) {
        return (this.fontFamily === other.fontFamily
            && this.fontWeight === other.fontWeight
            && this.fontSize === other.fontSize
            && this.fontFeatureSettings === other.fontFeatureSettings
            && this.fontVariationSettings === other.fontVariationSettings
            && this.lineHeight === other.lineHeight
            && this.letterSpacing === other.letterSpacing
            && this.typicalHalfwidthCharacterWidth === other.typicalHalfwidthCharacterWidth
            && this.typicalFullwidthCharacterWidth === other.typicalFullwidthCharacterWidth
            && this.canUseHalfwidthRightwardsArrow === other.canUseHalfwidthRightwardsArrow
            && this.spaceWidth === other.spaceWidth
            && this.middotWidth === other.middotWidth
            && this.wsmiddotWidth === other.wsmiddotWidth
            && this.maxDigitWidth === other.maxDigitWidth);
    }
}
