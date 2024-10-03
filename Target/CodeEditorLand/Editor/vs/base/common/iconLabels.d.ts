import { IMatch } from './filters.js';
export declare function escapeIcons(text: string): string;
export declare function markdownEscapeEscapedIcons(text: string): string;
export declare function stripIcons(text: string): string;
export declare function getCodiconAriaLabel(text: string | undefined): string;
export interface IParsedLabelWithIcons {
    readonly text: string;
    readonly iconOffsets?: readonly number[];
}
export declare function parseLabelWithIcons(input: string): IParsedLabelWithIcons;
export declare function matchesFuzzyIconAware(query: string, target: IParsedLabelWithIcons, enableSeparateSubstringMatching?: boolean): IMatch[] | null;
