export declare const canASAR = false;
/**
 * Utility for importing an AMD node module. This util supports AMD and ESM contexts and should be used while the ESM adoption
 * is on its way.
 *
 * e.g. pass in `vscode-textmate/release/main.js`
 */
export declare function importAMDNodeModule<T>(nodeModuleName: string, pathInsideNodeModule: string, isBuilt?: boolean): Promise<T>;
export declare function resolveAmdNodeModulePath(nodeModuleName: string, pathInsideNodeModule: string): string;
