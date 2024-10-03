import { Range } from '../core/range.js';
import { TrackedRangeStickiness as ActualTrackedRangeStickiness } from '../model.js';
import { ModelDecorationOptions } from './textModel.js';
export declare const enum ClassName {
    EditorHintDecoration = "squiggly-hint",
    EditorInfoDecoration = "squiggly-info",
    EditorWarningDecoration = "squiggly-warning",
    EditorErrorDecoration = "squiggly-error",
    EditorUnnecessaryDecoration = "squiggly-unnecessary",
    EditorUnnecessaryInlineDecoration = "squiggly-inline-unnecessary",
    EditorDeprecatedInlineDecoration = "squiggly-inline-deprecated"
}
export declare const enum NodeColor {
    Black = 0,
    Red = 1
}
export declare function getNodeColor(node: IntervalNode): NodeColor;
export declare function setNodeStickiness(node: IntervalNode, stickiness: ActualTrackedRangeStickiness): void;
export declare class IntervalNode {
    metadata: number;
    parent: IntervalNode;
    left: IntervalNode;
    right: IntervalNode;
    start: number;
    end: number;
    delta: number;
    maxEnd: number;
    id: string;
    ownerId: number;
    options: ModelDecorationOptions;
    cachedVersionId: number;
    cachedAbsoluteStart: number;
    cachedAbsoluteEnd: number;
    range: Range | null;
    constructor(id: string, start: number, end: number);
    reset(versionId: number, start: number, end: number, range: Range): void;
    setOptions(options: ModelDecorationOptions): void;
    setCachedOffsets(absoluteStart: number, absoluteEnd: number, cachedVersionId: number): void;
    detach(): void;
}
export declare const SENTINEL: IntervalNode;
export declare class IntervalTree {
    root: IntervalNode;
    requestNormalizeDelta: boolean;
    constructor();
    intervalSearch(start: number, end: number, filterOwnerId: number, filterOutValidation: boolean, cachedVersionId: number, onlyMarginDecorations: boolean): IntervalNode[];
    search(filterOwnerId: number, filterOutValidation: boolean, cachedVersionId: number, onlyMarginDecorations: boolean): IntervalNode[];
    collectNodesFromOwner(ownerId: number): IntervalNode[];
    collectNodesPostOrder(): IntervalNode[];
    insert(node: IntervalNode): void;
    delete(node: IntervalNode): void;
    resolveNode(node: IntervalNode, cachedVersionId: number): void;
    acceptReplace(offset: number, length: number, textLength: number, forceMoveMarkers: boolean): void;
    getAllInOrder(): IntervalNode[];
    private _normalizeDeltaIfNecessary;
}
export declare function nodeAcceptEdit(node: IntervalNode, start: number, end: number, textLength: number, forceMoveMarkers: boolean): void;
export declare function recomputeMaxEnd(node: IntervalNode): void;
export declare function intervalCompare(aStart: number, aEnd: number, bStart: number, bEnd: number): number;
