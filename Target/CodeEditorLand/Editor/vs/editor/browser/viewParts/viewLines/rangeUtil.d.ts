import { FloatHorizontalRange } from '../../view/renderingContext.js';
import { DomReadingContext } from './domReadingContext.js';
export declare class RangeUtil {
    private static _handyReadyRange;
    private static _createRange;
    private static _detachRange;
    private static _readClientRects;
    private static _mergeAdjacentRanges;
    private static _createHorizontalRangesFromClientRects;
    static readHorizontalRanges(domNode: HTMLElement, startChildIndex: number, startOffset: number, endChildIndex: number, endOffset: number, context: DomReadingContext): FloatHorizontalRange[] | null;
}
