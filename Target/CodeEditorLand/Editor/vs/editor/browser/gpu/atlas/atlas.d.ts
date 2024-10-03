import type { ThreeKeyMap } from '../../../../base/common/map.js';
import type { IBoundingBox, IRasterizedGlyph } from '../raster/raster.js';
export interface ITextureAtlasPageGlyph {
    pageIndex: number;
    glyphIndex: number;
    x: number;
    y: number;
    w: number;
    h: number;
    originOffsetX: number;
    originOffsetY: number;
}
export interface ITextureAtlasAllocator {
    allocate(rasterizedGlyph: Readonly<IRasterizedGlyph>): Readonly<ITextureAtlasPageGlyph> | undefined;
    getUsagePreview(): Promise<Blob>;
    getStats(): string;
}
export interface IReadableTextureAtlasPage {
    readonly version: number;
    readonly usedArea: Readonly<IBoundingBox>;
    readonly glyphs: IterableIterator<Readonly<ITextureAtlasPageGlyph>>;
    readonly source: OffscreenCanvas;
    getUsagePreview(): Promise<Blob>;
    getStats(): string;
}
export declare const enum UsagePreviewColors {
    Unused = "#808080",
    Used = "#4040FF",
    Wasted = "#FF0000",
    Restricted = "#FF000088"
}
export type GlyphMap<T> = ThreeKeyMap<string, number, string, T>;
