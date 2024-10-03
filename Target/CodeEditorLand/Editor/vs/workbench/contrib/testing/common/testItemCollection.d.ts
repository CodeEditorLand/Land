import { Barrier } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITestItem, ITestTag, TestItemExpandState, TestsDiff, TestsDiffOp } from './testTypes.js';
import { TestId } from './testId.js';
import { URI } from '../../../../base/common/uri.js';
interface CollectionItem<T> {
    readonly fullId: TestId;
    actual: T;
    expand: TestItemExpandState;
    expandLevels?: number;
    resolveBarrier?: Barrier;
}
export declare const enum TestItemEventOp {
    Upsert = 0,
    SetTags = 1,
    UpdateCanResolveChildren = 2,
    RemoveChild = 3,
    SetProp = 4,
    Bulk = 5,
    DocumentSynced = 6
}
export interface ITestItemUpsertChild {
    op: TestItemEventOp.Upsert;
    item: ITestItemLike;
}
export interface ITestItemUpdateCanResolveChildren {
    op: TestItemEventOp.UpdateCanResolveChildren;
    state: boolean;
}
export interface ITestItemSetTags {
    op: TestItemEventOp.SetTags;
    new: ITestTag[];
    old: ITestTag[];
}
export interface ITestItemRemoveChild {
    op: TestItemEventOp.RemoveChild;
    id: string;
}
export interface ITestItemSetProp {
    op: TestItemEventOp.SetProp;
    update: Partial<ITestItem>;
}
export interface ITestItemBulkReplace {
    op: TestItemEventOp.Bulk;
    ops: (ITestItemUpsertChild | ITestItemRemoveChild)[];
}
export interface ITestItemDocumentSynced {
    op: TestItemEventOp.DocumentSynced;
}
export type ExtHostTestItemEvent = ITestItemSetTags | ITestItemUpsertChild | ITestItemRemoveChild | ITestItemUpdateCanResolveChildren | ITestItemSetProp | ITestItemBulkReplace | ITestItemDocumentSynced;
export interface ITestItemApi<T> {
    controllerId: string;
    parent?: T;
    listener?: (evt: ExtHostTestItemEvent) => void;
}
export interface ITestItemCollectionOptions<T> {
    controllerId: string;
    getDocumentVersion(uri: URI | undefined): number | undefined;
    getApiFor(item: T): ITestItemApi<T>;
    toITestItem(item: T): ITestItem;
    getChildren(item: T): ITestChildrenLike<T>;
    root: T;
}
export interface ITestChildrenLike<T> extends Iterable<[string, T]> {
    get(id: string): T | undefined;
    delete(id: string): void;
}
export interface ITestItemLike {
    id: string;
    tags: readonly ITestTag[];
    uri?: URI;
    canResolveChildren: boolean;
}
export declare class TestItemCollection<T extends ITestItemLike> extends Disposable {
    private readonly options;
    private readonly debounceSendDiff;
    private readonly diffOpEmitter;
    private _resolveHandler?;
    get root(): T;
    readonly tree: Map<string, CollectionItem<T>>;
    private readonly tags;
    protected diff: TestsDiff;
    constructor(options: ITestItemCollectionOptions<T>);
    set resolveHandler(handler: undefined | ((item: T | undefined) => void));
    get resolveHandler(): undefined | ((item: T | undefined) => void);
    readonly onDidGenerateDiff: import("../../../workbench.web.main.internal.js").Event<TestsDiff>;
    collectDiff(): TestsDiff;
    pushDiff(diff: TestsDiffOp): void;
    expand(testId: string, levels: number): Promise<void> | void;
    dispose(): void;
    private onTestItemEvent;
    private documentSynced;
    private upsertItem;
    private diffTagRefs;
    private incrementTagRefs;
    private decrementTagRefs;
    private setItemParent;
    private connectItem;
    private connectItemAndChildren;
    private updateExpandability;
    private expandChildren;
    private resolveChildren;
    private pushExpandStateUpdate;
    private removeItem;
    flushDiff(): void;
}
export interface ITestItemChildren<T extends ITestItemLike> extends Iterable<[string, T]> {
    readonly size: number;
    replace(items: readonly T[]): void;
    forEach(callback: (item: T, collection: this) => unknown, thisArg?: unknown): void;
    add(item: T): void;
    delete(itemId: string): void;
    get(itemId: string): T | undefined;
    toJSON(): readonly T[];
}
export declare class DuplicateTestItemError extends Error {
    constructor(id: string);
}
export declare class InvalidTestItemError extends Error {
    constructor(id: string);
}
export declare class MixedTestItemController extends Error {
    constructor(id: string, ctrlA: string, ctrlB: string);
}
export declare const createTestItemChildren: <T extends ITestItemLike>(api: ITestItemApi<T>, getApi: (item: T) => ITestItemApi<T>, checkCtor: Function) => ITestItemChildren<T>;
export {};
