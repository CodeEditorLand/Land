import { ITimeout } from './algorithms/diffAlgorithm.js';
import { DetailedLineRangeMapping, LineRangeMapping } from '../rangeMapping.js';
export declare function computeMovedLines(changes: DetailedLineRangeMapping[], originalLines: string[], modifiedLines: string[], hashedOriginalLines: number[], hashedModifiedLines: number[], timeout: ITimeout): LineRangeMapping[];
