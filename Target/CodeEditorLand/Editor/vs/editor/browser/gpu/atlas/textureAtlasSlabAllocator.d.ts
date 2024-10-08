import type { IRasterizedGlyph } from '../raster/raster.js';
import { type ITextureAtlasAllocator, type ITextureAtlasPageGlyph } from './atlas.js';
export interface TextureAtlasSlabAllocatorOptions {
    slabW?: number;
    slabH?: number;
}
/**
 * The slab allocator is a more complex allocator that places glyphs in square slabs of a fixed
 * size. Slabs are defined by a small range of glyphs sizes they can house, this places like-sized
 * glyphs in the same slab which reduces wasted space.
 *
 * Slabs also may contain "unused" regions on the left and bottom depending on the size of the
 * glyphs they include. This space is used to place very thin or short glyphs, which would otherwise
 * waste a lot of space in their own slab.
 */
export declare class TextureAtlasSlabAllocator implements ITextureAtlasAllocator {
    private readonly _canvas;
    private readonly _textureIndex;
    private readonly _ctx;
    private readonly _slabs;
    private readonly _activeSlabsByDims;
    private readonly _unusedRects;
    private readonly _openRegionsByHeight;
    private readonly _openRegionsByWidth;
    /** A set of all glyphs allocated, this is only tracked to enable debug related functionality */
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
