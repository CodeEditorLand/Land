export declare class ArrayEdit {
    readonly edits: readonly SingleArrayEdit[];
    constructor(edits: readonly SingleArrayEdit[]);
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
export declare class MonotonousIndexTransformer implements IIndexTransformer {
    private readonly transformation;
    static fromMany(transformations: ArrayEdit[]): IIndexTransformer;
    private idx;
    private offset;
    constructor(transformation: ArrayEdit);
    transform(index: number): number | undefined;
}
export declare class CombinedIndexTransformer implements IIndexTransformer {
    private readonly transformers;
    constructor(transformers: IIndexTransformer[]);
    transform(index: number): number | undefined;
}
