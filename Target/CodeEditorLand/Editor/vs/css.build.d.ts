/**
 * Invoked by the loader at build-time
 */
export declare function load(name: string, req: AMDLoader.IRelativeRequire, load: AMDLoader.IPluginLoadCallback, config: AMDLoader.IConfigurationOptions): void;
/**
 * Invoked by the loader at build-time
 */
export declare function write(pluginName: string, moduleName: string, write: AMDLoader.IPluginWriteCallback): void;
/**
 * Invoked by the loader at build-time
 */
export declare function writeFile(pluginName: string, moduleName: string, req: AMDLoader.IRelativeRequire, write: AMDLoader.IPluginWriteFileCallback, config: AMDLoader.IConfigurationOptions): void;
export declare function getInlinedResources(): string[];
export declare function rewriteUrls(originalFile: string, newFile: string, contents: string): string;
export declare class CSSPluginUtilities {
    static startsWith(haystack: string, needle: string): boolean;
    /**
     * Find the path of a file.
     */
    static pathOf(filename: string): string;
    /**
     * A conceptual a + b for paths.
     * Takes into account if `a` contains a protocol.
     * Also normalizes the result: e.g.: a/b/ + ../c => a/c
     */
    static joinPaths(a: string, b: string): string;
    static commonPrefix(str1: string, str2: string): string;
    static commonFolderPrefix(fromPath: string, toPath: string): string;
    static relativePath(fromPath: string, toPath: string): string;
    static replaceURL(contents: string, replacer: (url: string) => string): string;
}
