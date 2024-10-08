import { OperatingSystem } from '../../../../../base/common/platform.js';
export interface IParsedLink {
    path: ILinkPartialRange;
    prefix?: ILinkPartialRange;
    suffix?: ILinkSuffix;
}
export interface ILinkSuffix {
    row: number | undefined;
    col: number | undefined;
    rowEnd: number | undefined;
    colEnd: number | undefined;
    suffix: ILinkPartialRange;
}
export interface ILinkPartialRange {
    index: number;
    text: string;
}
/**
 * Removes the optional link suffix which contains line and column information.
 * @param link The link to use.
 */
export declare function removeLinkSuffix(link: string): string;
/**
 * Removes any query string from the link.
 * @param link The link to use.
 */
export declare function removeLinkQueryString(link: string): string;
export declare function detectLinkSuffixes(line: string): ILinkSuffix[];
/**
 * Returns the optional link suffix which contains line and column information.
 * @param link The link to parse.
 */
export declare function getLinkSuffix(link: string): ILinkSuffix | null;
export declare function toLinkSuffix(match: RegExpExecArray | null): ILinkSuffix | null;
export declare function detectLinks(line: string, os: OperatingSystem): IParsedLink[];
/**
 * A regex clause that matches the start of an absolute path on Windows, such as: `C:`, `c:`,
 * `file:///c:` (uri) and `\\?\C:` (UNC path).
 */
export declare const winDrivePrefix = "(?:\\\\\\\\\\?\\\\|file:\\/\\/\\/)?[a-zA-Z]:";
