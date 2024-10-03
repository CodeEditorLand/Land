var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { getActiveWindow } from '../../../../base/browser/dom.js';
import { memoize } from '../../../../base/common/decorators.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { StringBuilder } from '../../../common/core/stringBuilder.js';
import { TokenMetadata } from '../../../common/encodedTokenAttributes.js';
import { ensureNonNullable } from '../gpuUtils.js';
let nextId = 0;
export class GlyphRasterizer extends Disposable {
    get cacheKey() {
        return `${this._fontFamily}_${this._fontSize}px`;
    }
    constructor(_fontSize, _fontFamily) {
        super();
        this._fontSize = _fontSize;
        this._fontFamily = _fontFamily;
        this.id = nextId++;
        this._workGlyph = {
            source: null,
            boundingBox: {
                left: 0,
                bottom: 0,
                right: 0,
                top: 0,
            },
            originOffset: {
                x: 0,
                y: 0,
            }
        };
        this._workGlyphConfig = { chars: undefined, metadata: 0 };
        const devicePixelFontSize = Math.ceil(this._fontSize * getActiveWindow().devicePixelRatio);
        this._canvas = new OffscreenCanvas(devicePixelFontSize * 3, devicePixelFontSize * 3);
        this._ctx = ensureNonNullable(this._canvas.getContext('2d', {
            willReadFrequently: true
        }));
        this._ctx.textBaseline = 'top';
        this._ctx.fillStyle = '#FFFFFF';
    }
    rasterizeGlyph(chars, metadata, colorMap) {
        if (chars === '') {
            return {
                source: this._canvas,
                boundingBox: { top: 0, left: 0, bottom: -1, right: -1 },
                originOffset: { x: 0, y: 0 }
            };
        }
        if (this._workGlyphConfig.chars === chars && this._workGlyphConfig.metadata === metadata) {
            return this._workGlyph;
        }
        this._workGlyphConfig.chars = chars;
        this._workGlyphConfig.metadata = metadata;
        return this._rasterizeGlyph(chars, metadata, colorMap);
    }
    _rasterizeGlyph(chars, metadata, colorMap) {
        const devicePixelFontSize = Math.ceil(this._fontSize * getActiveWindow().devicePixelRatio);
        const canvasDim = devicePixelFontSize * 3;
        if (this._canvas.width !== canvasDim) {
            this._canvas.width = canvasDim;
            this._canvas.height = canvasDim;
        }
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        const fontSb = new StringBuilder(200);
        const fontStyle = TokenMetadata.getFontStyle(metadata);
        if (fontStyle & 1) {
            fontSb.appendString('italic ');
        }
        if (fontStyle & 2) {
            fontSb.appendString('bold ');
        }
        fontSb.appendString(`${devicePixelFontSize}px ${this._fontFamily}`);
        this._ctx.font = fontSb.build();
        const originX = devicePixelFontSize;
        const originY = devicePixelFontSize;
        this._ctx.fillStyle = colorMap[TokenMetadata.getForeground(metadata)];
        this._ctx.textBaseline = 'top';
        this._ctx.fillText(chars, originX, originY);
        const imageData = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
        this._findGlyphBoundingBox(imageData, this._workGlyph.boundingBox);
        this._workGlyph.source = this._canvas;
        this._workGlyph.originOffset.x = this._workGlyph.boundingBox.left - originX;
        this._workGlyph.originOffset.y = this._workGlyph.boundingBox.top - originY;
        return this._workGlyph;
    }
    _findGlyphBoundingBox(imageData, outBoundingBox) {
        const height = this._canvas.height;
        const width = this._canvas.width;
        let found = false;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alphaOffset = y * width * 4 + x * 4 + 3;
                if (imageData.data[alphaOffset] !== 0) {
                    outBoundingBox.top = y;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        outBoundingBox.left = 0;
        found = false;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const alphaOffset = y * width * 4 + x * 4 + 3;
                if (imageData.data[alphaOffset] !== 0) {
                    outBoundingBox.left = x;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        outBoundingBox.right = width;
        found = false;
        for (let x = width - 1; x >= outBoundingBox.left; x--) {
            for (let y = 0; y < height; y++) {
                const alphaOffset = y * width * 4 + x * 4 + 3;
                if (imageData.data[alphaOffset] !== 0) {
                    outBoundingBox.right = x;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
        outBoundingBox.bottom = outBoundingBox.top;
        found = false;
        for (let y = height - 1; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const alphaOffset = y * width * 4 + x * 4 + 3;
                if (imageData.data[alphaOffset] !== 0) {
                    outBoundingBox.bottom = y;
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
    }
}
__decorate([
    memoize,
    __metadata("design:type", String),
    __metadata("design:paramtypes", [])
], GlyphRasterizer.prototype, "cacheKey", null);
