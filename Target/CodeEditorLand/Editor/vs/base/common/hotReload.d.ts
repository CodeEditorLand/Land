import { IDisposable } from './lifecycle.js';
export declare function isHotReloadEnabled(): boolean;
export declare function registerHotReloadHandler(handler: HotReloadHandler): IDisposable;
/**
 * Takes the old exports of the module to reload and returns a function to apply the new exports.
 * If `undefined` is returned, this handler is not able to handle the module.
 *
 * If no handler can apply the new exports, the module will not be reloaded.
 */
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
