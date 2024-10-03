import { CharCode } from './charCode.js';
export declare function isPathSeparator(code: number): code is CharCode.Slash | CharCode.Backslash;
export declare function toSlashes(osPath: string): string;
export declare function toPosixPath(osPath: string): string;
export declare function getRoot(path: string, sep?: string): string;
export declare function isUNC(path: string): boolean;
export declare function isValidBasename(name: string | null | undefined, isWindowsOS?: boolean): boolean;
export declare function isEqual(pathA: string, pathB: string, ignoreCase?: boolean): boolean;
export declare function isEqualOrParent(base: string, parentCandidate: string, ignoreCase?: boolean, separator?: "/" | "\\"): boolean;
export declare function isWindowsDriveLetter(char0: number): boolean;
export declare function sanitizeFilePath(candidate: string, cwd: string): string;
export declare function removeTrailingPathSeparator(candidate: string): string;
export declare function isRootOrDriveLetter(path: string): boolean;
export declare function hasDriveLetter(path: string, isWindowsOS?: boolean): boolean;
export declare function getDriveLetter(path: string, isWindowsOS?: boolean): string | undefined;
export declare function indexOfPath(path: string, candidate: string, ignoreCase?: boolean): number;
export interface IPathWithLineAndColumn {
    path: string;
    line?: number;
    column?: number;
}
export declare function parseLineAndColumnAware(rawPath: string): IPathWithLineAndColumn;
export declare function randomPath(parent?: string, prefix?: string, randomLength?: number): string;
