import { URI } from '../../../../base/common/uri.js';
import { IMainThreadTestCollection } from './testService.js';
import { AbstractIncrementalTestCollection, ITestUriCanonicalizer, IncrementalChangeCollector, IncrementalTestCollectionItem, InternalTestItem, TestsDiff } from './testTypes.js';
export declare class MainThreadTestCollection extends AbstractIncrementalTestCollection<IncrementalTestCollectionItem> implements IMainThreadTestCollection {
    private readonly expandActual;
    private testsByUrl;
    private busyProvidersChangeEmitter;
    private expandPromises;
    /**
     * @inheritdoc
     */
    get busyProviders(): number;
    /**
     * @inheritdoc
     */
    get rootItems(): Set<IncrementalTestCollectionItem>;
    /**
     * @inheritdoc
     */
    get all(): Generator<IncrementalTestCollectionItem, void, unknown>;
    get rootIds(): Iterable<string>;
    readonly onBusyProvidersChange: import("../../../workbench.web.main.internal.js").Event<number>;
    constructor(uriIdentityService: ITestUriCanonicalizer, expandActual: (id: string, levels: number) => Promise<void>);
    /**
     * @inheritdoc
     */
    expand(testId: string, levels: number): Promise<void>;
    /**
     * @inheritdoc
     */
    getNodeById(id: string): IncrementalTestCollectionItem | undefined;
    /**
     * @inheritdoc
     */
    getNodeByUrl(uri: URI): Iterable<IncrementalTestCollectionItem>;
    /**
     * @inheritdoc
     */
    getReviverDiff(): TestsDiff;
    /**
     * Applies the diff to the collection.
     */
    apply(diff: TestsDiff): void;
    /**
     * Clears everything from the collection, and returns a diff that applies
     * that action.
     */
    clear(): TestsDiff;
    /**
     * @override
     */
    protected createItem(internal: InternalTestItem): IncrementalTestCollectionItem;
    private readonly changeCollector;
    protected createChangeCollector(): IncrementalChangeCollector<IncrementalTestCollectionItem>;
    private getIterator;
}
