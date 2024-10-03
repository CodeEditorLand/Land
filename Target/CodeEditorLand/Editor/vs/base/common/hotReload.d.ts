import { IDisposable } from './lifecycle.js';
export declare function isHotReloadEnabled(): boolean;
export declare function registerHotReloadHandler(handler: HotReloadHandler): IDisposable;
export type HotReloadHandler = (args: {
    oldExports: Record<string, unknown>;
    newSrc: string;
    config: IHotReloadConfig;
}) => AcceptNewExportsHandler | undefined;
export type AcceptNewExportsHandler = (newExports: Record<string, unknown>) => boolean;
export type IHotReloadConfig = HotReloadConfig;
interface HotReloadConfig {
    mode?: 'patch-prototype' | undefined;
}
export {};
