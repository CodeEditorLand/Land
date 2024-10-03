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
    private readonly _maxTextureSize;
    private readonly _themeService;
    private readonly _instantiationService;
    private _colorMap;
    private readonly _warmUpTask;
    private readonly _warmedUpRasterizers;
    private readonly _allocatorType;
    private readonly _pages;
    get pages(): IReadableTextureAtlasPage[];
    readonly pageSize: number;
    private readonly _glyphPageIndex;
    private readonly _onDidDeleteGlyphs;
    readonly onDidDeleteGlyphs: Event<void>;
    constructor(_maxTextureSize: number, options: ITextureAtlasOptions | undefined, _themeService: IThemeService, _instantiationService: IInstantiationService);
    private _initFirstPage;
    clear(): void;
    getGlyph(rasterizer: IGlyphRasterizer, chars: string, metadata: number): Readonly<ITextureAtlasPageGlyph>;
    private _tryGetGlyph;
    private _getGlyphFromNewPage;
    getUsagePreview(): Promise<Blob[]>;
    getStats(): string[];
    private _warmUpAtlas;
}
