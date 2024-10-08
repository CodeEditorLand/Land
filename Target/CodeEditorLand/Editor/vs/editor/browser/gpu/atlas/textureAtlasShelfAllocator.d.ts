import type { IRasterizedGlyph } from '../raster/raster.js';
import { type ITextureAtlasAllocator, type ITextureAtlasPageGlyph } from './atlas.js';
/**
 * The shelf allocator is a simple allocator that places glyphs in rows, starting a new row when the
 * current row is full. Due to its simplicity, it can waste space but it is very fast.
 */
export declare class TextureAtlasShelfAllocator implements ITextureAtlasAllocator {
    private readonly _canvas;
    private readonly _textureIndex;
    private readonly _ctx;
    private _currentRow;
    /** A set of all glyphs allocated, this is only tracked to enable debug related functionality */
    private readonly _allocatedGlyphs;
    private _nextIndex;
    constructor(_canvas: OffscreenCanvas, _textureIndex: number);
    allocate(rasterizedGlyph: IRasterizedGlyph): ITextureAtlasPageGlyph | undefined;
    getUsagePreview(): Promise<Blob>;
    getStats(): string;
}
