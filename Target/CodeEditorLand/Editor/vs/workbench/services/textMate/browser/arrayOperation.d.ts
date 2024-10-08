export declare class ArrayEdit {
    readonly edits: readonly SingleArrayEdit[];
    constructor(
    /**
     * Disjoint edits that are applied in parallel
     */
    edits: readonly SingleArrayEdit[]);
    applyToArray(array: any[]): void;
}
export declare class SingleArrayEdit {
    readonly offset: number;
    readonly length: number;
    readonly newLength: number;
    constructor(offset: number, length: number, newLength: number);
    toString(): string;
}
export interface IIndexTransformer {
    transform(index: number): number | undefined;
}
/**
 * Can only be called with increasing values of `index`.
*/
export declare class MonotonousIndexTransformer implements IIndexTransformer {
    private readonly transformation;
    static fromMany(transformations: ArrayEdit[]): IIndexTransformer;
    private idx;
    private offset;
    constructor(transformation: ArrayEdit);
    /**
     * Precondition: index >= previous-value-of(index).
     */
    transform(index: number): number | undefined;
}
export declare class CombinedIndexTransformer implements IIndexTransformer {
    private readonly transformers;
    constructor(transformers: IIndexTransformer[]);
    transform(index: number): number | undefined;
}
