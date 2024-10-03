import { IRange } from '../../../common/range.js';
export interface IItem {
    size: number;
}
export interface IRangedGroup {
    range: IRange;
    size: number;
}
export declare function groupIntersect(range: IRange, groups: IRangedGroup[]): IRangedGroup[];
export declare function shift({ start, end }: IRange, much: number): IRange;
export declare function consolidate(groups: IRangedGroup[]): IRangedGroup[];
export interface IRangeMap {
    readonly size: number;
    readonly count: number;
    paddingTop: number;
    splice(index: number, deleteCount: number, items?: IItem[]): void;
    indexAt(position: number): number;
    indexAfter(position: number): number;
    positionAt(index: number): number;
}
export declare class RangeMap implements IRangeMap {
    private groups;
    private _size;
    private _paddingTop;
    get paddingTop(): number;
    set paddingTop(paddingTop: number);
    constructor(topPadding?: number);
    splice(index: number, deleteCount: number, items?: IItem[]): void;
    get count(): number;
    get size(): number;
    indexAt(position: number): number;
    indexAfter(position: number): number;
    positionAt(index: number): number;
}
