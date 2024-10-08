export declare class HierarchicalKind {
    readonly value: string;
    static readonly sep = ".";
    static readonly None: HierarchicalKind;
    static readonly Empty: HierarchicalKind;
    constructor(value: string);
    equals(other: HierarchicalKind): boolean;
    contains(other: HierarchicalKind): boolean;
    intersects(other: HierarchicalKind): boolean;
    append(...parts: string[]): HierarchicalKind;
}
