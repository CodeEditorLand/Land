import { getActiveWindow } from '../../../base/browser/dom.js';
import { BugIndicatingError } from '../../../base/common/errors.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { CursorColumns } from '../../common/core/cursorColumns.js';
import { fullFileRenderStrategyWgsl } from './fullFileRenderStrategy.wgsl.js';
import { GPULifecycle } from './gpuDisposable.js';
import { quadVertices } from './gpuUtils.js';
import { GlyphRasterizer } from './raster/glyphRasterizer.js';
import { ViewGpuContext } from './viewGpuContext.js';
export class FullFileRenderStrategy extends Disposable {
    static { this._lineCount = 3000; }
    static { this._columnCount = 200; }
    get bindGroupEntries() {
        return [
            { binding: 2, resource: { buffer: this._cellBindBuffer } },
            { binding: 7, resource: { buffer: this._scrollOffsetBindBuffer } }
        ];
    }
    constructor(_context, _device, _canvas, _atlas) {
        super();
        this._context = _context;
        this._device = _device;
        this._canvas = _canvas;
        this._atlas = _atlas;
        this.wgsl = fullFileRenderStrategyWgsl;
        this._activeDoubleBufferIndex = 0;
        this._upToDateLines = [new Set(), new Set()];
        this._visibleObjectCount = 0;
        const fontFamily = this._context.configuration.options.get(51);
        const fontSize = this._context.configuration.options.get(54);
        this._glyphRasterizer = this._register(new GlyphRasterizer(fontSize, fontFamily));
        const bufferSize = FullFileRenderStrategy._lineCount * FullFileRenderStrategy._columnCount * 6 * Float32Array.BYTES_PER_ELEMENT;
        this._cellBindBuffer = this._register(GPULifecycle.createBuffer(this._device, {
            label: 'Monaco full file cell buffer',
            size: bufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })).object;
        this._cellValueBuffers = [
            new ArrayBuffer(bufferSize),
            new ArrayBuffer(bufferSize),
        ];
        const scrollOffsetBufferSize = 2;
        this._scrollOffsetBindBuffer = this._register(GPULifecycle.createBuffer(this._device, {
            label: 'Monaco scroll offset buffer',
            size: scrollOffsetBufferSize * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })).object;
        this._scrollOffsetValueBuffers = [
            new Float32Array(scrollOffsetBufferSize),
            new Float32Array(scrollOffsetBufferSize),
        ];
    }
    reset() {
        for (const bufferIndex of [0, 1]) {
            const buffer = new Float32Array(this._cellValueBuffers[bufferIndex]);
            buffer.fill(0, 0, buffer.length);
            this._device.queue.writeBuffer(this._cellBindBuffer, 0, buffer.buffer, 0, buffer.byteLength);
            this._upToDateLines[bufferIndex].clear();
        }
        this._visibleObjectCount = 0;
    }
    update(viewportData, viewLineOptions) {
        let chars = '';
        let y = 0;
        let x = 0;
        let screenAbsoluteX = 0;
        let screenAbsoluteY = 0;
        let zeroToOneX = 0;
        let zeroToOneY = 0;
        let wgslX = 0;
        let wgslY = 0;
        let xOffset = 0;
        let glyph;
        let cellIndex = 0;
        let tokenStartIndex = 0;
        let tokenEndIndex = 0;
        let tokenMetadata = 0;
        let lineData;
        let content = '';
        let fillStartIndex = 0;
        let fillEndIndex = 0;
        let tokens;
        const dpr = getActiveWindow().devicePixelRatio;
        const scrollOffsetBuffer = this._scrollOffsetValueBuffers[this._activeDoubleBufferIndex];
        scrollOffsetBuffer[0] = this._context.viewLayout.getCurrentScrollLeft() * dpr;
        scrollOffsetBuffer[1] = this._context.viewLayout.getCurrentScrollTop() * dpr;
        this._device.queue.writeBuffer(this._scrollOffsetBindBuffer, 0, scrollOffsetBuffer);
        const cellBuffer = new Float32Array(this._cellValueBuffers[this._activeDoubleBufferIndex]);
        const lineIndexCount = FullFileRenderStrategy._columnCount * 6;
        const upToDateLines = this._upToDateLines[this._activeDoubleBufferIndex];
        let dirtyLineStart = Number.MAX_SAFE_INTEGER;
        let dirtyLineEnd = 0;
        for (y = viewportData.startLineNumber; y <= viewportData.endLineNumber; y++) {
            if (!ViewGpuContext.canRender(viewLineOptions, viewportData, y)) {
                continue;
            }
            dirtyLineStart = Math.min(dirtyLineStart, y);
            dirtyLineEnd = Math.max(dirtyLineEnd, y);
            lineData = viewportData.getViewLineRenderingData(y);
            content = lineData.content;
            xOffset = 0;
            tokens = lineData.tokens;
            tokenStartIndex = lineData.minColumn - 1;
            tokenEndIndex = 0;
            for (let tokenIndex = 0, tokensLen = tokens.getCount(); tokenIndex < tokensLen; tokenIndex++) {
                tokenEndIndex = tokens.getEndOffset(tokenIndex);
                if (tokenEndIndex <= tokenStartIndex) {
                    continue;
                }
                tokenMetadata = tokens.getMetadata(tokenIndex);
                for (x = tokenStartIndex; x < tokenEndIndex; x++) {
                    if (x > FullFileRenderStrategy._columnCount) {
                        break;
                    }
                    chars = content.charAt(x);
                    if (chars === ' ') {
                        continue;
                    }
                    if (chars === '\t') {
                        xOffset = CursorColumns.nextRenderTabStop(x + xOffset, lineData.tabSize) - x - 1;
                        continue;
                    }
                    glyph = this._atlas.getGlyph(this._glyphRasterizer, chars, tokenMetadata);
                    screenAbsoluteX = Math.round((x + xOffset) * viewLineOptions.spaceWidth * dpr);
                    screenAbsoluteY = (Math.ceil((viewportData.relativeVerticalOffset[y - viewportData.startLineNumber] +
                        Math.floor((viewportData.lineHeight - this._context.configuration.options.get(54)) / 2)) * dpr));
                    zeroToOneX = screenAbsoluteX / this._canvas.width;
                    zeroToOneY = screenAbsoluteY / this._canvas.height;
                    wgslX = zeroToOneX * 2 - 1;
                    wgslY = zeroToOneY * 2 - 1;
                    cellIndex = ((y - 1) * FullFileRenderStrategy._columnCount + (x + xOffset)) * 6;
                    cellBuffer[cellIndex + 0] = wgslX;
                    cellBuffer[cellIndex + 1] = -wgslY;
                    cellBuffer[cellIndex + 4] = glyph.glyphIndex;
                    cellBuffer[cellIndex + 5] = glyph.pageIndex;
                }
                tokenStartIndex = tokenEndIndex;
            }
            fillStartIndex = ((y - 1) * FullFileRenderStrategy._columnCount + (tokenEndIndex + xOffset)) * 6;
            fillEndIndex = (y * FullFileRenderStrategy._columnCount) * 6;
            cellBuffer.fill(0, fillStartIndex, fillEndIndex);
            upToDateLines.add(y);
        }
        const visibleObjectCount = (viewportData.endLineNumber - viewportData.startLineNumber + 1) * lineIndexCount;
        if (dirtyLineStart <= dirtyLineEnd) {
            this._device.queue.writeBuffer(this._cellBindBuffer, (dirtyLineStart - 1) * lineIndexCount * Float32Array.BYTES_PER_ELEMENT, cellBuffer.buffer, (dirtyLineStart - 1) * lineIndexCount * Float32Array.BYTES_PER_ELEMENT, (dirtyLineEnd - dirtyLineStart + 1) * lineIndexCount * Float32Array.BYTES_PER_ELEMENT);
        }
        this._activeDoubleBufferIndex = this._activeDoubleBufferIndex ? 0 : 1;
        this._visibleObjectCount = visibleObjectCount;
        return visibleObjectCount;
    }
    draw(pass, viewportData) {
        if (this._visibleObjectCount <= 0) {
            throw new BugIndicatingError('Attempt to draw 0 objects');
        }
        pass.draw(quadVertices.length / 2, this._visibleObjectCount, undefined, (viewportData.startLineNumber - 1) * FullFileRenderStrategy._columnCount);
    }
}
