import { FuzzyScore } from '../../../../base/common/filters.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
export interface ISimpleCompletion {
    /**
     * The completion's label which appears on the left beside the icon.
     */
    label: string;
    /**
     * The completion's icon to show on the left of the suggest widget.
     */
    icon?: ThemeIcon;
    /**
     * The completion's detail which appears on the right of the list.
     */
    detail?: string;
    /**
     * Whether the completion is a file. Files with the same score will be sorted against each other
     * first by extension length and then certain extensions will get a boost based on the OS.
     */
    isFile?: boolean;
    /**
     * Whether the completion is a directory.
     */
    isDirectory?: boolean;
    /**
     * Whether the completion is a keyword.
     */
    isKeyword?: boolean;
}
export declare class SimpleCompletionItem {
    readonly completion: ISimpleCompletion;
    readonly labelLow: string;
    readonly labelLowExcludeFileExt: string;
    readonly fileExtLow: string;
    score: FuzzyScore;
    idx?: number;
    word?: string;
    constructor(completion: ISimpleCompletion);
}
