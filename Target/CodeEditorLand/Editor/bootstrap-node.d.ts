import type { IProductConfiguration } from './vs/base/common/product';
export declare function devInjectNodeModuleLookupPath(injectPath: string): void;
export declare function removeGlobalNodeJsModuleLookupPaths(): void;
export declare function configurePortable(product: Partial<IProductConfiguration>): {
    portableDataPath: string;
    isPortable: boolean;
};
