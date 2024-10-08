import type { IProductConfiguration } from './vs/base/common/product';
/**
 * Add support for redirecting the loading of node modules
 *
 * Note: only applies when running out of sources.
 */
export declare function devInjectNodeModuleLookupPath(injectPath: string): void;
export declare function removeGlobalNodeJsModuleLookupPaths(): void;
/**
 * Helper to enable portable mode.
 */
export declare function configurePortable(product: Partial<IProductConfiguration>): {
    portableDataPath: string;
    isPortable: boolean;
};
