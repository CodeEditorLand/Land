import { BugIndicatingError } from '../../../../base/common/errors.js';
import { ensureNonNullable } from '../gpuUtils.js';
export class TextureAtlasShelfAllocator {
    constructor(_canvas, _textureIndex) {
        this._canvas = _canvas;
        this._textureIndex = _textureIndex;
        this._currentRow = {
            x: 0,
            y: 0,
            h: 0
        };
        this._allocatedGlyphs = new Set();
        this._nextIndex = 0;
        this._ctx = ensureNonNullable(this._canvas.getContext('2d', {
            willReadFrequently: true
        }));
    }
    allocate(rasterizedGlyph) {
        const glyphWidth = rasterizedGlyph.boundingBox.right - rasterizedGlyph.boundingBox.left + 1;
        const glyphHeight = rasterizedGlyph.boundingBox.bottom - rasterizedGlyph.boundingBox.top + 1;
        if (glyphWidth > this._canvas.width || glyphHeight > this._canvas.height) {
            throw new BugIndicatingError('Glyph is too large for the atlas page');
        }
        if (rasterizedGlyph.boundingBox.right - rasterizedGlyph.boundingBox.left + 1 > this._canvas.width - this._currentRow.x) {
            this._currentRow.x = 0;
            this._currentRow.y += this._currentRow.h;
            this._currentRow.h = 1;
        }
        if (this._currentRow.y + rasterizedGlyph.boundingBox.bottom - rasterizedGlyph.boundingBox.top + 1 > this._canvas.height) {
            return undefined;
        }
        this._ctx.drawImage(rasterizedGlyph.source, rasterizedGlyph.boundingBox.left, rasterizedGlyph.boundingBox.top, glyphWidth, glyphHeight, this._currentRow.x, this._currentRow.y, glyphWidth, glyphHeight);
        const glyph = {
            pageIndex: this._textureIndex,
            glyphIndex: this._nextIndex++,
            x: this._currentRow.x,
            y: this._currentRow.y,
            w: glyphWidth,
            h: glyphHeight,
            originOffsetX: rasterizedGlyph.originOffset.x,
            originOffsetY: rasterizedGlyph.originOffset.y
        };
        this._currentRow.x += glyphWidth;
        this._currentRow.h = Math.max(this._currentRow.h, glyphHeight);
        this._allocatedGlyphs.add(glyph);
        return glyph;
    }
    getUsagePreview() {
        const w = this._canvas.width;
        const h = this._canvas.height;
        const canvas = new OffscreenCanvas(w, h);
        const ctx = ensureNonNullable(canvas.getContext('2d'));
        ctx.fillStyle = "#808080";
        ctx.fillRect(0, 0, w, h);
        const rowHeight = new Map();
        const rowWidth = new Map();
        for (const g of this._allocatedGlyphs) {
            rowHeight.set(g.y, Math.max(rowHeight.get(g.y) ?? 0, g.h));
            rowWidth.set(g.y, Math.max(rowWidth.get(g.y) ?? 0, g.x + g.w));
        }
        for (const g of this._allocatedGlyphs) {
            ctx.fillStyle = "#4040FF";
            ctx.fillRect(g.x, g.y, g.w, g.h);
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(g.x, g.y + g.h, g.w, rowHeight.get(g.y) - g.h);
        }
        for (const [rowY, rowW] of rowWidth.entries()) {
            if (rowY !== this._currentRow.y) {
                ctx.fillStyle = "#FF0000";
                ctx.fillRect(rowW, rowY, w - rowW, rowHeight.get(rowY));
            }
        }
        return canvas.convertToBlob();
    }
    getStats() {
        const w = this._canvas.width;
        const h = this._canvas.height;
        let usedPixels = 0;
        let wastedPixels = 0;
        const totalPixels = w * h;
        const rowHeight = new Map();
        const rowWidth = new Map();
        for (const g of this._allocatedGlyphs) {
            rowHeight.set(g.y, Math.max(rowHeight.get(g.y) ?? 0, g.h));
            rowWidth.set(g.y, Math.max(rowWidth.get(g.y) ?? 0, g.x + g.w));
        }
        for (const g of this._allocatedGlyphs) {
            usedPixels += g.w * g.h;
            wastedPixels += g.w * (rowHeight.get(g.y) - g.h);
        }
        for (const [rowY, rowW] of rowWidth.entries()) {
            if (rowY !== this._currentRow.y) {
                wastedPixels += (w - rowW) * rowHeight.get(rowY);
            }
        }
        return [
            `page${this._textureIndex}:`,
            `     Total: ${totalPixels} (${w}x${h})`,
            `      Used: ${usedPixels} (${((usedPixels / totalPixels) * 100).toPrecision(2)}%)`,
            `    Wasted: ${wastedPixels} (${((wastedPixels / totalPixels) * 100).toPrecision(2)}%)`,
            `Efficiency: ${((usedPixels / (usedPixels + wastedPixels)) * 100).toPrecision(2)}%`,
        ].join('\n');
    }
}
