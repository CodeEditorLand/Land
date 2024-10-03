import { IRange } from '../core/range.js';
import { FoldingRules } from '../languages/languageConfiguration.js';
export interface ISectionHeaderFinderTarget {
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
}
export interface FindSectionHeaderOptions {
    foldingRules?: FoldingRules;
    findRegionSectionHeaders: boolean;
    findMarkSectionHeaders: boolean;
}
export interface SectionHeader {
    range: IRange;
    text: string;
    hasSeparatorLine: boolean;
    shouldBeInComments: boolean;
}
export declare function findSectionHeaders(model: ISectionHeaderFinderTarget, options: FindSectionHeaderOptions): SectionHeader[];
