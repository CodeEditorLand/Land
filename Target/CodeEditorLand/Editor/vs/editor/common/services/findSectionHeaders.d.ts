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
    /**
     * The location of the header text in the text model.
     */
    range: IRange;
    /**
     * The section header text.
     */
    text: string;
    /**
     * Whether the section header includes a separator line.
     */
    hasSeparatorLine: boolean;
    /**
     * This section should be omitted before rendering if it's not in a comment.
     */
    shouldBeInComments: boolean;
}
/**
 * Find section headers in the model.
 *
 * @param model the text model to search in
 * @param options options to search with
 * @returns an array of section headers
 */
export declare function findSectionHeaders(model: ISectionHeaderFinderTarget, options: FindSectionHeaderOptions): SectionHeader[];
