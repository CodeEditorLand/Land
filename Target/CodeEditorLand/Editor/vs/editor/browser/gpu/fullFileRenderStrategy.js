/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
            { binding: 2 /* BindingId.Cells */, resource: { buffer: this._cellBindBuffer } },
            { binding: 7 /* BindingId.ScrollOffset */, resource: { buffer: this._scrollOffsetBindBuffer } }
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
        // TODO: Detect when lines have been tokenized and clear _upToDateLines
        const fontFamily = this._context.configuration.options.get(51 /* EditorOption.fontFamily */);
        const fontSize = this._context.configuration.options.get(54 /* EditorOption.fontSize */);
        this._glyphRasterizer = this._register(new GlyphRasterizer(fontSize, fontFamily));
        const bufferSize = FullFileRenderStrategy._lineCount * FullFileRenderStrategy._columnCount * 6 /* Constants.IndicesPerCell */ * Float32Array.BYTES_PER_ELEMENT;
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
            // Zero out buffer and upload to GPU to prevent stale rows from rendering
            const buffer = new Float32Array(this._cellValueBuffers[bufferIndex]);
            buffer.fill(0, 0, buffer.length);
            this._device.queue.writeBuffer(this._cellBindBuffer, 0, buffer.buffer, 0, buffer.byteLength);
            this._upToDateLines[bufferIndex].clear();
        }
        this._visibleObjectCount = 0;
    }
    update(viewportData, viewLineOptions) {
        // Pre-allocate variables to be shared within the loop - don't trust the JIT compiler to do
        // this optimization to avoid additional blocking time in garbage collector
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
        // Update scroll offset
        const scrollOffsetBuffer = this._scrollOffsetValueBuffers[this._activeDoubleBufferIndex];
        scrollOffsetBuffer[0] = this._context.viewLayout.getCurrentScrollLeft() * dpr;
        scrollOffsetBuffer[1] = this._context.viewLayout.getCurrentScrollTop() * dpr;
        this._device.queue.writeBuffer(this._scrollOffsetBindBuffer, 0, scrollOffsetBuffer);
        // Update cell data
        const cellBuffer = new Float32Array(this._cellValueBuffers[this._activeDoubleBufferIndex]);
        const lineIndexCount = FullFileRenderStrategy._columnCount * 6 /* Constants.IndicesPerCell */;
        const upToDateLines = this._upToDateLines[this._activeDoubleBufferIndex];
        let dirtyLineStart = Number.MAX_SAFE_INTEGER;
        let dirtyLineEnd = 0;
        for (y = viewportData.startLineNumber; y <= viewportData.endLineNumber; y++) {
            // Only attempt to render lines that the GPU renderer can handle
            if (!ViewGpuContext.canRender(viewLineOptions, viewportData, y)) {
                continue;
            }
            // TODO: Update on dirty lines; is this known by line before rendering?
            // if (upToDateLines.has(y)) {
            // 	continue;
            // }
            dirtyLineStart = Math.min(dirtyLineStart, y);
            dirtyLineEnd = Math.max(dirtyLineEnd, y);
            lineData = viewportData.getViewLineRenderingData(y);
            content = lineData.content;
            xOffset = 0;
            // See ViewLine#renderLine
            // const renderLineInput = new RenderLineInput(
            // 	options.useMonospaceOptimizations,
            // 	options.canUseHalfwidthRightwardsArrow,
            // 	lineData.content,
            // 	lineData.continuesWithWrappedLine,
            // 	lineData.isBasicASCII,
            // 	lineData.containsRTL,
            // 	lineData.minColumn - 1,
            // 	lineData.tokens,
            // 	actualInlineDecorations,
            // 	lineData.tabSize,
            // 	lineData.startVisibleColumn,
            // 	options.spaceWidth,
            // 	options.middotWidth,
            // 	options.wsmiddotWidth,
            // 	options.stopRenderingLineAfter,
            // 	options.renderWhitespace,
            // 	options.renderControlCharacters,
            // 	options.fontLigatures !== EditorFontLigatures.OFF,
            // 	selectionsOnLine
            // );
            tokens = lineData.tokens;
            tokenStartIndex = lineData.minColumn - 1;
            tokenEndIndex = 0;
            for (let tokenIndex = 0, tokensLen = tokens.getCount(); tokenIndex < tokensLen; tokenIndex++) {
                tokenEndIndex = tokens.getEndOffset(tokenIndex);
                if (tokenEndIndex <= tokenStartIndex) {
                    // The faux indent part of the line should have no token type
                    continue;
                }
                tokenMetadata = tokens.getMetadata(tokenIndex);
                // console.log(`token: start=${tokenStartIndex}, end=${tokenEndIndex}, fg=${colorMap[tokenFg]}`);
                for (x = tokenStartIndex; x < tokenEndIndex; x++) {
                    // HACK: Prevent rendering past the end of the render buffer
                    // TODO: This needs to move to a dynamic long line rendering strategy
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
                    // TODO: Support non-standard character widths
                    screenAbsoluteX = Math.round((x + xOffset) * viewLineOptions.spaceWidth * dpr);
                    screenAbsoluteY = (Math.ceil((
                    // Top of line including line height
                    viewportData.relativeVerticalOffset[y - viewportData.startLineNumber] +
                        // Delta to top of line after line height
                        Math.floor((viewportData.lineHeight - this._context.configuration.options.get(54 /* EditorOption.fontSize */)) / 2)) * dpr));
                    zeroToOneX = screenAbsoluteX / this._canvas.width;
                    zeroToOneY = screenAbsoluteY / this._canvas.height;
                    wgslX = zeroToOneX * 2 - 1;
                    wgslY = zeroToOneY * 2 - 1;
                    cellIndex = ((y - 1) * FullFileRenderStrategy._columnCount + (x + xOffset)) * 6 /* Constants.IndicesPerCell */;
                    cellBuffer[cellIndex + 0 /* CellBufferInfo.Offset_X */] = wgslX;
                    cellBuffer[cellIndex + 1 /* CellBufferInfo.Offset_Y */] = -wgslY;
                    cellBuffer[cellIndex + 4 /* CellBufferInfo.GlyphIndex */] = glyph.glyphIndex;
                    cellBuffer[cellIndex + 5 /* CellBufferInfo.TextureIndex */] = glyph.pageIndex;
                }
                tokenStartIndex = tokenEndIndex;
            }
            // Clear to end of line
            fillStartIndex = ((y - 1) * FullFileRenderStrategy._columnCount + (tokenEndIndex + xOffset)) * 6 /* Constants.IndicesPerCell */;
            fillEndIndex = (y * FullFileRenderStrategy._columnCount) * 6 /* Constants.IndicesPerCell */;
            cellBuffer.fill(0, fillStartIndex, fillEndIndex);
            upToDateLines.add(y);
        }
        const visibleObjectCount = (viewportData.endLineNumber - viewportData.startLineNumber + 1) * lineIndexCount;
        // Only write when there is changed data
        if (dirtyLineStart <= dirtyLineEnd) {
            // Write buffer and swap it out to unblock writes
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
