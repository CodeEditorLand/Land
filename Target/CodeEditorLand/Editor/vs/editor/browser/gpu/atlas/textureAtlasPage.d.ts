import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import type { IBoundingBox, IGlyphRasterizer } from '../raster/raster.js';
import type { IReadableTextureAtlasPage, ITextureAtlasAllocator, ITextureAtlasPageGlyph } from './atlas.js';
export type AllocatorType = 'shelf' | 'slab' | ((canvas: OffscreenCanvas, textureIndex: number) => ITextureAtlasAllocator);
export declare class TextureAtlasPage extends Disposable implements IReadableTextureAtlasPage {
    private readonly _logService;
    private readonly _themeService;
    private _version;
    get version(): number;
    static readonly maximumGlyphCount = 5000;
    private _usedArea;
    get usedArea(): Readonly<IBoundingBox>;
    private readonly _canvas;
    get source(): OffscreenCanvas;
    private readonly _glyphMap;
    private readonly _glyphInOrderSet;
    get glyphs(): IterableIterator<ITextureAtlasPageGlyph>;
    private readonly _allocator;
    private _colorMap;
    constructor(textureIndex: number, pageSize: number, allocatorType: AllocatorType, _logService: ILogService, _themeService: IThemeService);
    getGlyph(rasterizer: IGlyphRasterizer, chars: string, metadata: number): Readonly<ITextureAtlasPageGlyph> | undefined;
    private _createGlyph;
    getUsagePreview(): Promise<Blob>;
    getStats(): string;
}
