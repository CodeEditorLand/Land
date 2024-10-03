import type { IRasterizedGlyph } from '../raster/raster.js';
import { type ITextureAtlasAllocator, type ITextureAtlasPageGlyph } from './atlas.js';
export interface TextureAtlasSlabAllocatorOptions {
    slabW?: number;
    slabH?: number;
}
export declare class TextureAtlasSlabAllocator implements ITextureAtlasAllocator {
    private readonly _canvas;
    private readonly _textureIndex;
    private readonly _ctx;
    private readonly _slabs;
    private readonly _activeSlabsByDims;
    private readonly _unusedRects;
    private readonly _openRegionsByHeight;
    private readonly _openRegionsByWidth;
    private readonly _allocatedGlyphs;
    private _slabW;
    private _slabH;
    private _slabsPerRow;
    private _slabsPerColumn;
    private _nextIndex;
    constructor(_canvas: OffscreenCanvas, _textureIndex: number, options?: TextureAtlasSlabAllocatorOptions);
    allocate(rasterizedGlyph: IRasterizedGlyph): ITextureAtlasPageGlyph | undefined;
    getUsagePreview(): Promise<Blob>;
    getStats(): string;
}
