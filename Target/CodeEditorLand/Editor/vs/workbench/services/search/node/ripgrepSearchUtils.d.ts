import { ILogService } from '../../../../platform/log/common/log.js';
import { SearchRange } from '../common/search.js';
import * as searchExtTypes from '../common/searchExtTypes.js';
export type Maybe<T> = T | null | undefined;
export declare function anchorGlob(glob: string): string;
export declare function rangeToSearchRange(range: searchExtTypes.Range): SearchRange;
export declare function searchRangeToRange(range: SearchRange): searchExtTypes.Range;
export interface IOutputChannel {
    appendLine(msg: string): void;
}
export declare class OutputChannel implements IOutputChannel {
    private prefix;
    private readonly logService;
    constructor(prefix: string, logService: ILogService);
    appendLine(msg: string): void;
}
