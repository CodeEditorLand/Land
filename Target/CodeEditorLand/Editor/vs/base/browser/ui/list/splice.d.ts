import { ISpliceable } from '../../../common/sequence.js';
export interface ISpreadSpliceable<T> {
    splice(start: number, deleteCount: number, ...elements: T[]): void;
}
export declare class CombinedSpliceable<T> implements ISpliceable<T> {
    private spliceables;
    constructor(spliceables: ISpliceable<T>[]);
    splice(start: number, deleteCount: number, elements: T[]): void;
}
