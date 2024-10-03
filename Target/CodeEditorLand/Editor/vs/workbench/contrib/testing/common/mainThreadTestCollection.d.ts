import { URI } from '../../../../base/common/uri.js';
import { IMainThreadTestCollection } from './testService.js';
import { AbstractIncrementalTestCollection, ITestUriCanonicalizer, IncrementalChangeCollector, IncrementalTestCollectionItem, InternalTestItem, TestsDiff } from './testTypes.js';
export declare class MainThreadTestCollection extends AbstractIncrementalTestCollection<IncrementalTestCollectionItem> implements IMainThreadTestCollection {
    private readonly expandActual;
    private testsByUrl;
    private busyProvidersChangeEmitter;
    private expandPromises;
    get busyProviders(): number;
    get rootItems(): Set<IncrementalTestCollectionItem>;
    get all(): Generator<IncrementalTestCollectionItem, void, unknown>;
    get rootIds(): Iterable<string>;
    readonly onBusyProvidersChange: import("../../../workbench.web.main.internal.js").Event<number>;
    constructor(uriIdentityService: ITestUriCanonicalizer, expandActual: (id: string, levels: number) => Promise<void>);
    expand(testId: string, levels: number): Promise<void>;
    getNodeById(id: string): IncrementalTestCollectionItem | undefined;
    getNodeByUrl(uri: URI): Iterable<IncrementalTestCollectionItem>;
    getReviverDiff(): TestsDiff;
    apply(diff: TestsDiff): void;
    clear(): TestsDiff;
    protected createItem(internal: InternalTestItem): IncrementalTestCollectionItem;
    private readonly changeCollector;
    protected createChangeCollector(): IncrementalChangeCollector<IncrementalTestCollectionItem>;
    private getIterator;
}
