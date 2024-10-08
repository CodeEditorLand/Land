/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { getActiveWindow } from '../../../../base/browser/dom.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable, dispose, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { ThreeKeyMap } from '../../../../base/common/map.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { GlyphRasterizer } from '../raster/glyphRasterizer.js';
import { IdleTaskQueue } from '../taskQueue.js';
import { TextureAtlasPage } from './textureAtlasPage.js';
let TextureAtlas = class TextureAtlas extends Disposable {
    get pages() { return this._pages; }
    constructor(
    /** The maximum texture size supported by the GPU. */
    _maxTextureSize, options, _themeService, _instantiationService) {
        super();
        this._maxTextureSize = _maxTextureSize;
        this._themeService = _themeService;
        this._instantiationService = _instantiationService;
        this._warmUpTask = this._register(new MutableDisposable());
        this._warmedUpRasterizers = new Set();
        /**
         * The main texture atlas pages which are both larger textures and more efficiently packed
         * relative to the scratch page. The idea is the main pages are drawn to and uploaded to the GPU
         * much less frequently so as to not drop frames.
         */
        this._pages = [];
        /**
         * A maps of glyph keys to the page to start searching for the glyph. This is set before
         * searching to have as little runtime overhead (branching, intermediate variables) as possible,
         * so it is not guaranteed to be the actual page the glyph is on. But it is guaranteed that all
         * pages with a lower index do not contain the glyph.
         */
        this._glyphPageIndex = new ThreeKeyMap();
        this._onDidDeleteGlyphs = this._register(new Emitter());
        this.onDidDeleteGlyphs = this._onDidDeleteGlyphs.event;
        this._allocatorType = options?.allocatorType ?? 'slab';
        this._register(Event.runAndSubscribe(this._themeService.onDidColorThemeChange, () => {
            // TODO: Clear entire atlas on theme change
            this._colorMap = this._themeService.getColorTheme().tokenColorMap;
        }));
        const dprFactor = Math.max(1, Math.floor(getActiveWindow().devicePixelRatio));
        this.pageSize = Math.min(1024 * dprFactor, this._maxTextureSize);
        this._initFirstPage();
        this._register(toDisposable(() => dispose(this._pages)));
    }
    _initFirstPage() {
        const firstPage = this._instantiationService.createInstance(TextureAtlasPage, 0, this.pageSize, this._allocatorType);
        this._pages.push(firstPage);
        // IMPORTANT: The first glyph on the first page must be an empty glyph such that zeroed out
        // cells end up rendering nothing
        // TODO: This currently means the first slab is for 0x0 glyphs and is wasted
        const nullRasterizer = new GlyphRasterizer(1, '');
        firstPage.getGlyph(nullRasterizer, '', 0);
        nullRasterizer.dispose();
    }
    clear() {
        // Clear all pages
        for (const page of this._pages) {
            page.dispose();
        }
        this._pages.length = 0;
        this._glyphPageIndex.clear();
        this._warmedUpRasterizers.clear();
        this._warmUpTask.clear();
        // Recreate first
        this._initFirstPage();
        // Tell listeners
        this._onDidDeleteGlyphs.fire();
    }
    getGlyph(rasterizer, chars, metadata) {
        // TODO: Encode font size and family into key
        // Ignore metadata that doesn't affect the glyph
        metadata &= ~(255 /* MetadataConsts.LANGUAGEID_MASK */ | 768 /* MetadataConsts.TOKEN_TYPE_MASK */ | 1024 /* MetadataConsts.BALANCED_BRACKETS_MASK */);
        // Warm up common glyphs
        if (!this._warmedUpRasterizers.has(rasterizer.id)) {
            this._warmUpAtlas(rasterizer);
            this._warmedUpRasterizers.add(rasterizer.id);
        }
        // Try get the glyph, overflowing to a new page if necessary
        return this._tryGetGlyph(this._glyphPageIndex.get(chars, metadata, rasterizer.cacheKey) ?? 0, rasterizer, chars, metadata);
    }
    _tryGetGlyph(pageIndex, rasterizer, chars, metadata) {
        this._glyphPageIndex.set(chars, metadata, rasterizer.cacheKey, pageIndex);
        return (this._pages[pageIndex].getGlyph(rasterizer, chars, metadata)
            ?? (pageIndex + 1 < this._pages.length
                ? this._tryGetGlyph(pageIndex + 1, rasterizer, chars, metadata)
                : undefined)
            ?? this._getGlyphFromNewPage(rasterizer, chars, metadata));
    }
    _getGlyphFromNewPage(rasterizer, chars, metadata) {
        // TODO: Support more than 2 pages and the GPU texture layer limit
        this._pages.push(this._instantiationService.createInstance(TextureAtlasPage, this._pages.length, this.pageSize, this._allocatorType));
        this._glyphPageIndex.set(chars, metadata, rasterizer.cacheKey, this._pages.length - 1);
        return this._pages[this._pages.length - 1].getGlyph(rasterizer, chars, metadata);
    }
    getUsagePreview() {
        return Promise.all(this._pages.map(e => e.getUsagePreview()));
    }
    getStats() {
        return this._pages.map(e => e.getStats());
    }
    /**
     * Warms up the atlas by rasterizing all printable ASCII characters for each token color. This
     * is distrubuted over multiple idle callbacks to avoid blocking the main thread.
     */
    _warmUpAtlas(rasterizer) {
        this._warmUpTask.value?.clear();
        const taskQueue = this._warmUpTask.value = new IdleTaskQueue();
        // Warm up using roughly the larger glyphs first to help optimize atlas allocation
        // A-Z
        for (let code = 65 /* CharCode.A */; code <= 90 /* CharCode.Z */; code++) {
            taskQueue.enqueue(() => {
                for (const fgColor of this._colorMap.keys()) {
                    this.getGlyph(rasterizer, String.fromCharCode(code), (fgColor << 15 /* MetadataConsts.FOREGROUND_OFFSET */) & 16744448 /* MetadataConsts.FOREGROUND_MASK */);
                }
            });
        }
        // a-z
        for (let code = 97 /* CharCode.a */; code <= 122 /* CharCode.z */; code++) {
            taskQueue.enqueue(() => {
                for (const fgColor of this._colorMap.keys()) {
                    this.getGlyph(rasterizer, String.fromCharCode(code), (fgColor << 15 /* MetadataConsts.FOREGROUND_OFFSET */) & 16744448 /* MetadataConsts.FOREGROUND_MASK */);
                }
            });
        }
        // Remaining ascii
        for (let code = 33 /* CharCode.ExclamationMark */; code <= 126 /* CharCode.Tilde */; code++) {
            taskQueue.enqueue(() => {
                for (const fgColor of this._colorMap.keys()) {
                    this.getGlyph(rasterizer, String.fromCharCode(code), (fgColor << 15 /* MetadataConsts.FOREGROUND_OFFSET */) & 16744448 /* MetadataConsts.FOREGROUND_MASK */);
                }
            });
        }
    }
};
TextureAtlas = __decorate([
    __param(2, IThemeService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Number, Object, Object, Object])
], TextureAtlas);
export { TextureAtlas };
