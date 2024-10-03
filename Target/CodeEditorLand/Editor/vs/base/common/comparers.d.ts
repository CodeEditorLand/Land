export declare function compareFileNames(one: string | null, other: string | null, caseSensitive?: boolean): number;
export declare function compareFileNamesDefault(one: string | null, other: string | null): number;
export declare function compareFileNamesUpper(one: string | null, other: string | null): number;
export declare function compareFileNamesLower(one: string | null, other: string | null): number;
export declare function compareFileNamesUnicode(one: string | null, other: string | null): 0 | 1 | -1;
export declare function compareFileExtensions(one: string | null, other: string | null): number;
export declare function compareFileExtensionsDefault(one: string | null, other: string | null): number;
export declare function compareFileExtensionsUpper(one: string | null, other: string | null): number;
export declare function compareFileExtensionsLower(one: string | null, other: string | null): number;
export declare function compareFileExtensionsUnicode(one: string | null, other: string | null): 0 | 1 | -1;
export declare function comparePaths(one: string, other: string, caseSensitive?: boolean): number;
export declare function compareAnything(one: string, other: string, lookFor: string): number;
export declare function compareByPrefix(one: string, other: string, lookFor: string): number;
