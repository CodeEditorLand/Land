import { Barrier } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITestItem, ITestTag, TestItemExpandState, TestsDiff, TestsDiffOp } from './testTypes.js';
import { TestId } from './testId.js';
import { URI } from '../../../../base/common/uri.js';
/**
 * @private
 */
interface CollectionItem<T> {
    readonly fullId: TestId;
    actual: T;
    expand: TestItemExpandState;
    /**
     * Number of levels of items below this one that are expanded. May be infinite.
     */
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
    /** Controller ID to use to prefix these test items. */
    controllerId: string;
    /** Gets the document version at the given URI, if it's open */
    getDocumentVersion(uri: URI | undefined): number | undefined;
    /** Gets API for the given test item, used to listen for events and set parents. */
    getApiFor(item: T): ITestItemApi<T>;
    /** Converts the full test item to the common interface. */
    toITestItem(item: T): ITestItem;
    /** Gets children for the item. */
    getChildren(item: T): ITestChildrenLike<T>;
    /** Root to use for the new test collection. */
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
/**
 * Maintains a collection of test items for a single controller.
 */
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
    /**
     * Handler used for expanding test items.
     */
    set resolveHandler(handler: undefined | ((item: T | undefined) => void));
    get resolveHandler(): undefined | ((item: T | undefined) => void);
    /**
     * Fires when an operation happens that should result in a diff.
     */
    readonly onDidGenerateDiff: import("../../../workbench.web.main.internal.js").Event<TestsDiff>;
    /**
     * Gets a diff of all changes that have been made, and clears the diff queue.
     */
    collectDiff(): TestsDiff;
    /**
     * Pushes a new diff entry onto the collected diff list.
     */
    pushDiff(diff: TestsDiffOp): void;
    /**
     * Expands the test and the given number of `levels` of children. If levels
     * is < 0, then all children will be expanded. If it's 0, then only this
     * item will be expanded.
     */
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
    /**
     * Updates the `expand` state of the item. Should be called whenever the
     * resolved state of the item changes. Can automatically expand the item
     * if requested by a consumer.
     */
    private updateExpandability;
    /**
     * Expands all children of the item, "levels" deep. If levels is 0, only
     * the children will be expanded. If it's 1, the children and their children
     * will be expanded. If it's <0, it's a no-op.
     */
    private expandChildren;
    /**
     * Calls `discoverChildren` on the item, refreshing all its tests.
     */
    private resolveChildren;
    private pushExpandStateUpdate;
    private removeItem;
    /**
     * Immediately emits any pending diffs on the collection.
     */
    flushDiff(): void;
}
/** Implementation of vscode.TestItemCollection */
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
