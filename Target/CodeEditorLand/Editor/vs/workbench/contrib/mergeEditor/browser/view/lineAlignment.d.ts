import { ModifiedBaseRange } from '../model/modifiedBaseRange.js';
export type LineAlignment = [input1LineNumber: number | undefined, baseLineNumber: number, input2LineNumber: number | undefined];
export declare function getAlignments(m: ModifiedBaseRange): LineAlignment[];
