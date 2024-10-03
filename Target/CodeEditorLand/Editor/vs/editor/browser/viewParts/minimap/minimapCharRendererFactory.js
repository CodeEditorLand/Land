import { MinimapCharRenderer } from './minimapCharRenderer.js';
import { allCharCodes } from './minimapCharSheet.js';
import { prebakedMiniMaps } from './minimapPreBaked.js';
import { toUint8 } from '../../../../base/common/uint.js';
export class MinimapCharRendererFactory {
    static create(scale, fontFamily) {
        if (this.lastCreated && scale === this.lastCreated.scale && fontFamily === this.lastFontFamily) {
            return this.lastCreated;
        }
        let factory;
        if (prebakedMiniMaps[scale]) {
            factory = new MinimapCharRenderer(prebakedMiniMaps[scale](), scale);
        }
        else {
            factory = MinimapCharRendererFactory.createFromSampleData(MinimapCharRendererFactory.createSampleData(fontFamily).data, scale);
        }
        this.lastFontFamily = fontFamily;
        this.lastCreated = factory;
        return factory;
    }
    static createSampleData(fontFamily) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.style.height = `${16}px`;
        canvas.height = 16;
        canvas.width = 96 * 10;
        canvas.style.width = 96 * 10 + 'px';
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${16}px ${fontFamily}`;
        ctx.textBaseline = 'middle';
        let x = 0;
        for (const code of allCharCodes) {
            ctx.fillText(String.fromCharCode(code), x, 16 / 2);
            x += 10;
        }
        return ctx.getImageData(0, 0, 96 * 10, 16);
    }
    static createFromSampleData(source, scale) {
        const expectedLength = 16 * 10 * 4 * 96;
        if (source.length !== expectedLength) {
            throw new Error('Unexpected source in MinimapCharRenderer');
        }
        const charData = MinimapCharRendererFactory._downsample(source, scale);
        return new MinimapCharRenderer(charData, scale);
    }
    static _downsampleChar(source, sourceOffset, dest, destOffset, scale) {
        const width = 1 * scale;
        const height = 2 * scale;
        let targetIndex = destOffset;
        let brightest = 0;
        for (let y = 0; y < height; y++) {
            const sourceY1 = (y / height) * 16;
            const sourceY2 = ((y + 1) / height) * 16;
            for (let x = 0; x < width; x++) {
                const sourceX1 = (x / width) * 10;
                const sourceX2 = ((x + 1) / width) * 10;
                let value = 0;
                let samples = 0;
                for (let sy = sourceY1; sy < sourceY2; sy++) {
                    const sourceRow = sourceOffset + Math.floor(sy) * 3840;
                    const yBalance = 1 - (sy - Math.floor(sy));
                    for (let sx = sourceX1; sx < sourceX2; sx++) {
                        const xBalance = 1 - (sx - Math.floor(sx));
                        const sourceIndex = sourceRow + Math.floor(sx) * 4;
                        const weight = xBalance * yBalance;
                        samples += weight;
                        value += ((source[sourceIndex] * source[sourceIndex + 3]) / 255) * weight;
                    }
                }
                const final = value / samples;
                brightest = Math.max(brightest, final);
                dest[targetIndex++] = toUint8(final);
            }
        }
        return brightest;
    }
    static _downsample(data, scale) {
        const pixelsPerCharacter = 2 * scale * 1 * scale;
        const resultLen = pixelsPerCharacter * 96;
        const result = new Uint8ClampedArray(resultLen);
        let resultOffset = 0;
        let sourceOffset = 0;
        let brightest = 0;
        for (let charIndex = 0; charIndex < 96; charIndex++) {
            brightest = Math.max(brightest, this._downsampleChar(data, sourceOffset, result, resultOffset, scale));
            resultOffset += pixelsPerCharacter;
            sourceOffset += 10 * 4;
        }
        if (brightest > 0) {
            const adjust = 255 / brightest;
            for (let i = 0; i < resultLen; i++) {
                result[i] *= adjust;
            }
        }
        return result;
    }
}
