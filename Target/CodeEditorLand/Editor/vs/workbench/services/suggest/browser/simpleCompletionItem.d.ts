import { FuzzyScore } from '../../../../base/common/filters.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
export interface ISimpleCompletion {
    label: string;
    icon?: ThemeIcon;
    detail?: string;
    isFile?: boolean;
    isDirectory?: boolean;
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
