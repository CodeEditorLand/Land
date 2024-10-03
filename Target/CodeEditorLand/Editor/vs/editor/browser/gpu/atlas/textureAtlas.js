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
    constructor(_maxTextureSize, options, _themeService, _instantiationService) {
        super();
        this._maxTextureSize = _maxTextureSize;
        this._themeService = _themeService;
        this._instantiationService = _instantiationService;
        this._warmUpTask = this._register(new MutableDisposable());
        this._warmedUpRasterizers = new Set();
        this._pages = [];
        this._glyphPageIndex = new ThreeKeyMap();
        this._onDidDeleteGlyphs = this._register(new Emitter());
        this.onDidDeleteGlyphs = this._onDidDeleteGlyphs.event;
        this._allocatorType = options?.allocatorType ?? 'slab';
        this._register(Event.runAndSubscribe(this._themeService.onDidColorThemeChange, () => {
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
        const nullRasterizer = new GlyphRasterizer(1, '');
        firstPage.getGlyph(nullRasterizer, '', 0);
        nullRasterizer.dispose();
    }
    clear() {
        for (const page of this._pages) {
            page.dispose();
        }
        this._pages.length = 0;
        this._glyphPageIndex.clear();
        this._warmedUpRasterizers.clear();
        this._warmUpTask.clear();
        this._initFirstPage();
        this._onDidDeleteGlyphs.fire();
    }
    getGlyph(rasterizer, chars, metadata) {
        metadata &= ~(255 | 768 | 1024);
        if (!this._warmedUpRasterizers.has(rasterizer.id)) {
            this._warmUpAtlas(rasterizer);
            this._warmedUpRasterizers.add(rasterizer.id);
        }
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
    _warmUpAtlas(rasterizer) {
        this._warmUpTask.value?.clear();
        const taskQueue = this._warmUpTask.value = new IdleTaskQueue();
        for (let code = 65; code <= 90; code++) {
            taskQueue.enqueue(() => {
                for (const fgColor of this._colorMap.keys()) {
                    this.getGlyph(rasterizer, String.fromCharCode(code), (fgColor << 15) & 16744448);
                }
            });
        }
        for (let code = 97; code <= 122; code++) {
            taskQueue.enqueue(() => {
                for (const fgColor of this._colorMap.keys()) {
                    this.getGlyph(rasterizer, String.fromCharCode(code), (fgColor << 15) & 16744448);
                }
            });
        }
        for (let code = 33; code <= 126; code++) {
            taskQueue.enqueue(() => {
                for (const fgColor of this._colorMap.keys()) {
                    this.getGlyph(rasterizer, String.fromCharCode(code), (fgColor << 15) & 16744448);
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
