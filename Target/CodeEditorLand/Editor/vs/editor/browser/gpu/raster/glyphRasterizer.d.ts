import { Disposable } from '../../../../base/common/lifecycle.js';
import type { IGlyphRasterizer, IRasterizedGlyph } from './raster.js';
export declare class GlyphRasterizer extends Disposable implements IGlyphRasterizer {
    private readonly _fontSize;
    private readonly _fontFamily;
    readonly id: number;
    get cacheKey(): string;
    private _canvas;
    private _ctx;
    private _workGlyph;
    private _workGlyphConfig;
    constructor(_fontSize: number, _fontFamily: string);
    /**
     * Rasterizes a glyph. Note that the returned object is reused across different glyphs and
     * therefore is only safe for synchronous access.
     */
    rasterizeGlyph(chars: string, metadata: number, colorMap: string[]): Readonly<IRasterizedGlyph>;
    _rasterizeGlyph(chars: string, metadata: number, colorMap: string[]): Readonly<IRasterizedGlyph>;
    private _findGlyphBoundingBox;
}
