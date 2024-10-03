import { CancellationToken } from './cancellation.js';
export interface IPager<T> {
    firstPage: T[];
    total: number;
    pageSize: number;
    getPage(pageIndex: number, cancellationToken: CancellationToken): Promise<T[]>;
}
export interface IPagedModel<T> {
    length: number;
    isResolved(index: number): boolean;
    get(index: number): T;
    resolve(index: number, cancellationToken: CancellationToken): Promise<T>;
}
export declare function singlePagePager<T>(elements: T[]): IPager<T>;
export declare class PagedModel<T> implements IPagedModel<T> {
    private pager;
    private pages;
    get length(): number;
    constructor(arg: IPager<T> | T[]);
    isResolved(index: number): boolean;
    get(index: number): T;
    resolve(index: number, cancellationToken: CancellationToken): Promise<T>;
}
export declare class DelayedPagedModel<T> implements IPagedModel<T> {
    private model;
    private timeout;
    get length(): number;
    constructor(model: IPagedModel<T>, timeout?: number);
    isResolved(index: number): boolean;
    get(index: number): T;
    resolve(index: number, cancellationToken: CancellationToken): Promise<T>;
}
export declare function mapPager<T, R>(pager: IPager<T>, fn: (t: T) => R): IPager<R>;
