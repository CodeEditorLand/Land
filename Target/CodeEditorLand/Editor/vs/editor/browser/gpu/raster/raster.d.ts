export interface IGlyphRasterizer {
    readonly id: number;
    readonly cacheKey: string;
    rasterizeGlyph(chars: string, metadata: number, colorMap: string[]): Readonly<IRasterizedGlyph>;
}
export interface IBoundingBox {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
export interface IRasterizedGlyph {
    source: OffscreenCanvas;
    boundingBox: IBoundingBox;
    originOffset: {
        x: number;
        y: number;
    };
}
