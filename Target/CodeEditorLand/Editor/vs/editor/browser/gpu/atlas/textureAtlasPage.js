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
var TextureAtlasPage_1;
import { Event } from '../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { ThreeKeyMap } from '../../../../base/common/map.js';
import { ILogService, LogLevel } from '../../../../platform/log/common/log.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { TextureAtlasShelfAllocator } from './textureAtlasShelfAllocator.js';
import { TextureAtlasSlabAllocator } from './textureAtlasSlabAllocator.js';
let TextureAtlasPage = class TextureAtlasPage extends Disposable {
    static { TextureAtlasPage_1 = this; }
    get version() { return this._version; }
    static { this.maximumGlyphCount = 5_000; }
    get usedArea() { return this._usedArea; }
    get source() { return this._canvas; }
    get glyphs() {
        return this._glyphInOrderSet.values();
    }
    constructor(textureIndex, pageSize, allocatorType, _logService, _themeService) {
        super();
        this._logService = _logService;
        this._themeService = _themeService;
        this._version = 0;
        this._usedArea = { left: 0, top: 0, right: 0, bottom: 0 };
        this._glyphMap = new ThreeKeyMap();
        this._glyphInOrderSet = new Set();
        this._canvas = new OffscreenCanvas(pageSize, pageSize);
        switch (allocatorType) {
            case 'shelf':
                this._allocator = new TextureAtlasShelfAllocator(this._canvas, textureIndex);
                break;
            case 'slab':
                this._allocator = new TextureAtlasSlabAllocator(this._canvas, textureIndex);
                break;
            default:
                this._allocator = allocatorType(this._canvas, textureIndex);
                break;
        }
        this._register(Event.runAndSubscribe(this._themeService.onDidColorThemeChange, () => {
            this._colorMap = this._themeService.getColorTheme().tokenColorMap;
        }));
        this._register(toDisposable(() => {
            this._canvas.width = 1;
            this._canvas.height = 1;
        }));
    }
    getGlyph(rasterizer, chars, metadata) {
        return this._glyphMap.get(chars, metadata, rasterizer.cacheKey) ?? this._createGlyph(rasterizer, chars, metadata);
    }
    _createGlyph(rasterizer, chars, metadata) {
        if (this._glyphInOrderSet.size >= TextureAtlasPage_1.maximumGlyphCount) {
            return undefined;
        }
        const rasterizedGlyph = rasterizer.rasterizeGlyph(chars, metadata, this._colorMap);
        const glyph = this._allocator.allocate(rasterizedGlyph);
        if (glyph === undefined) {
            return undefined;
        }
        this._glyphMap.set(chars, metadata, rasterizer.cacheKey, glyph);
        this._glyphInOrderSet.add(glyph);
        this._version++;
        this._usedArea.right = Math.max(this._usedArea.right, glyph.x + glyph.w - 1);
        this._usedArea.bottom = Math.max(this._usedArea.bottom, glyph.y + glyph.h - 1);
        if (this._logService.getLevel() === LogLevel.Trace) {
            this._logService.trace('New glyph', {
                chars,
                metadata,
                rasterizedGlyph,
                glyph
            });
        }
        return glyph;
    }
    getUsagePreview() {
        return this._allocator.getUsagePreview();
    }
    getStats() {
        return this._allocator.getStats();
    }
};
TextureAtlasPage = TextureAtlasPage_1 = __decorate([
    __param(3, ILogService),
    __param(4, IThemeService),
    __metadata("design:paramtypes", [Number, Number, Object, Object, Object])
], TextureAtlasPage);
export { TextureAtlasPage };
