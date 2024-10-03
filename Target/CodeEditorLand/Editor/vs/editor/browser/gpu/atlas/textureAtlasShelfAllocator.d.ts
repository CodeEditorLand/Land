import type { IRasterizedGlyph } from '../raster/raster.js';
import { type ITextureAtlasAllocator, type ITextureAtlasPageGlyph } from './atlas.js';
export declare class TextureAtlasShelfAllocator implements ITextureAtlasAllocator {
    private readonly _canvas;
    private readonly _textureIndex;
    private readonly _ctx;
    private _currentRow;
    private readonly _allocatedGlyphs;
    private _nextIndex;
    constructor(_canvas: OffscreenCanvas, _textureIndex: number);
    allocate(rasterizedGlyph: IRasterizedGlyph): ITextureAtlasPageGlyph | undefined;
    getUsagePreview(): Promise<Blob>;
    getStats(): string;
}
