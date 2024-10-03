export declare function load(name: string, req: AMDLoader.IRelativeRequire, load: AMDLoader.IPluginLoadCallback, config: AMDLoader.IConfigurationOptions): void;
export declare function write(pluginName: string, moduleName: string, write: AMDLoader.IPluginWriteCallback): void;
export declare function writeFile(pluginName: string, moduleName: string, req: AMDLoader.IRelativeRequire, write: AMDLoader.IPluginWriteFileCallback, config: AMDLoader.IConfigurationOptions): void;
export declare function getInlinedResources(): string[];
export declare function rewriteUrls(originalFile: string, newFile: string, contents: string): string;
export declare class CSSPluginUtilities {
    static startsWith(haystack: string, needle: string): boolean;
    static pathOf(filename: string): string;
    static joinPaths(a: string, b: string): string;
    static commonPrefix(str1: string, str2: string): string;
    static commonFolderPrefix(fromPath: string, toPath: string): string;
    static relativePath(fromPath: string, toPath: string): string;
    static replaceURL(contents: string, replacer: (url: string) => string): string;
}
