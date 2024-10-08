import { Event } from '../common/event.js';
export interface IPixelRatioMonitor {
    readonly value: number;
    readonly onDidChange: Event<number>;
}
declare class PixelRatioMonitorFacade {
    private readonly mapWindowIdToPixelRatioMonitor;
    private _getOrCreatePixelRatioMonitor;
    getInstance(targetWindow: Window): IPixelRatioMonitor;
}
/**
 * Returns the pixel ratio.
 *
 * This is useful for rendering <canvas> elements at native screen resolution or for being used as
 * a cache key when storing font measurements. Fonts might render differently depending on resolution
 * and any measurements need to be discarded for example when a window is moved from a monitor to another.
 */
export declare const PixelRatio: PixelRatioMonitorFacade;
export {};
