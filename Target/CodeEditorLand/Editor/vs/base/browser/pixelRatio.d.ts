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
export declare const PixelRatio: PixelRatioMonitorFacade;
export {};
