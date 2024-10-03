import { Disposable } from '../../../base/common/lifecycle.js';
import type { ViewportData } from '../../common/viewLayout/viewLinesViewportData.js';
import type { ViewContext } from '../../common/viewModel/viewContext.js';
import type { ViewLineOptions } from '../viewParts/viewLines/viewLineOptions.js';
import type { TextureAtlas } from './atlas/textureAtlas.js';
import { type IGpuRenderStrategy } from './gpu.js';
export declare class FullFileRenderStrategy extends Disposable implements IGpuRenderStrategy {
    private readonly _context;
    private readonly _device;
    private readonly _canvas;
    private readonly _atlas;
    private static _lineCount;
    private static _columnCount;
    readonly wgsl: string;
    private readonly _glyphRasterizer;
    private _cellBindBuffer;
    private _cellValueBuffers;
    private _activeDoubleBufferIndex;
    private readonly _upToDateLines;
    private _visibleObjectCount;
    private _scrollOffsetBindBuffer;
    private _scrollOffsetValueBuffers;
    get bindGroupEntries(): GPUBindGroupEntry[];
    constructor(_context: ViewContext, _device: GPUDevice, _canvas: HTMLCanvasElement, _atlas: TextureAtlas);
    reset(): void;
    update(viewportData: ViewportData, viewLineOptions: ViewLineOptions): number;
    draw(pass: GPURenderPassEncoder, viewportData: ViewportData): void;
}
