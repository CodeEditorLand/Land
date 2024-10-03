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
export declare function removeLinkSuffix(link: string): string;
export declare function removeLinkQueryString(link: string): string;
export declare function detectLinkSuffixes(line: string): ILinkSuffix[];
export declare function getLinkSuffix(link: string): ILinkSuffix | null;
export declare function toLinkSuffix(match: RegExpExecArray | null): ILinkSuffix | null;
export declare function detectLinks(line: string, os: OperatingSystem): IParsedLink[];
export declare const winDrivePrefix = "(?:\\\\\\\\\\?\\\\|file:\\/\\/\\/)?[a-zA-Z]:";
