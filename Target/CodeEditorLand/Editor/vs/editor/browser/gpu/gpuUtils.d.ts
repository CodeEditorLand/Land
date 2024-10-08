import { type IDisposable } from '../../../base/common/lifecycle.js';
export declare const quadVertices: Float32Array;
export declare function ensureNonNullable<T>(value: T | null): T;
export declare function observeDevicePixelDimensions(element: HTMLElement, parentWindow: Window & typeof globalThis, callback: (deviceWidth: number, deviceHeight: number) => void): IDisposable;
