import { MinimapCharRenderer } from './minimapCharRenderer.js';
export declare class MinimapCharRendererFactory {
    private static lastCreated?;
    private static lastFontFamily?;
    static create(scale: number, fontFamily: string): MinimapCharRenderer;
    static createSampleData(fontFamily: string): ImageData;
    static createFromSampleData(source: Uint8ClampedArray, scale: number): MinimapCharRenderer;
    private static _downsampleChar;
    private static _downsample;
}
