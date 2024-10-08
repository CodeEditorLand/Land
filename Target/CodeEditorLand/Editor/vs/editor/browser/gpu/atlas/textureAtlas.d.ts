import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import type { IGlyphRasterizer } from '../raster/raster.js';
import type { IReadableTextureAtlasPage, ITextureAtlasPageGlyph } from './atlas.js';
import { AllocatorType } from './textureAtlasPage.js';
export interface ITextureAtlasOptions {
    allocatorType?: AllocatorType;
}
export declare class TextureAtlas extends Disposable {
    /** The maximum texture size supported by the GPU. */
    private readonly _maxTextureSize;
    private readonly _themeService;
    private readonly _instantiationService;
    private _colorMap;
    private readonly _warmUpTask;
    private readonly _warmedUpRasterizers;
    private readonly _allocatorType;
    /**
     * The main texture atlas pages which are both larger textures and more efficiently packed
     * relative to the scratch page. The idea is the main pages are drawn to and uploaded to the GPU
     * much less frequently so as to not drop frames.
     */
    private readonly _pages;
    get pages(): IReadableTextureAtlasPage[];
    readonly pageSize: number;
    /**
     * A maps of glyph keys to the page to start searching for the glyph. This is set before
     * searching to have as little runtime overhead (branching, intermediate variables) as possible,
     * so it is not guaranteed to be the actual page the glyph is on. But it is guaranteed that all
     * pages with a lower index do not contain the glyph.
     */
    private readonly _glyphPageIndex;
    private readonly _onDidDeleteGlyphs;
    readonly onDidDeleteGlyphs: Event<void>;
    constructor(
    /** The maximum texture size supported by the GPU. */
    _maxTextureSize: number, options: ITextureAtlasOptions | undefined, _themeService: IThemeService, _instantiationService: IInstantiationService);
    private _initFirstPage;
    clear(): void;
    getGlyph(rasterizer: IGlyphRasterizer, chars: string, metadata: number): Readonly<ITextureAtlasPageGlyph>;
    private _tryGetGlyph;
    private _getGlyphFromNewPage;
    getUsagePreview(): Promise<Blob[]>;
    getStats(): string[];
    /**
     * Warms up the atlas by rasterizing all printable ASCII characters for each token color. This
     * is distrubuted over multiple idle callbacks to avoid blocking the main thread.
     */
    private _warmUpAtlas;
}
