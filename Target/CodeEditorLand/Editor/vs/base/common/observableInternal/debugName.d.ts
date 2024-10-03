export interface IDebugNameData {
    readonly owner?: DebugOwner | undefined;
    readonly debugName?: DebugNameSource | undefined;
    readonly debugReferenceFn?: Function | undefined;
}
export declare class DebugNameData {
    readonly owner: DebugOwner | undefined;
    readonly debugNameSource: DebugNameSource | undefined;
    readonly referenceFn: Function | undefined;
    constructor(owner: DebugOwner | undefined, debugNameSource: DebugNameSource | undefined, referenceFn: Function | undefined);
    getDebugName(target: object): string | undefined;
}
export type DebugOwner = object | undefined;
export type DebugNameSource = string | (() => string | undefined);
export declare function getDebugName(target: object, data: DebugNameData): string | undefined;
export declare function getFunctionName(fn: Function): string | undefined;
