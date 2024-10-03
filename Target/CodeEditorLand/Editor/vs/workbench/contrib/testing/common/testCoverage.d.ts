import { CancellationToken } from '../../../../base/common/cancellation.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { ITransaction } from '../../../../base/common/observable.js';
import { IPrefixTreeNode, WellDefinedPrefixTree } from '../../../../base/common/prefixTree.js';
import { URI } from '../../../../base/common/uri.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { TestId } from './testId.js';
import { LiveTestResult } from './testResult.js';
import { CoverageDetails, ICoverageCount, IFileCoverage } from './testTypes.js';
export interface ICoverageAccessor {
    getCoverageDetails: (id: string, testId: string | undefined, token: CancellationToken) => Promise<CoverageDetails[]>;
}
export declare class TestCoverage {
    readonly result: LiveTestResult;
    readonly fromTaskId: string;
    private readonly uriIdentityService;
    private readonly accessor;
    private readonly fileCoverage;
    readonly didAddCoverage: import("../../../../base/common/observable.js").IObservableSignal<IPrefixTreeNode<AbstractFileCoverage>[]>;
    readonly tree: WellDefinedPrefixTree<AbstractFileCoverage>;
    readonly associatedData: Map<unknown, unknown>;
    constructor(result: LiveTestResult, fromTaskId: string, uriIdentityService: IUriIdentityService, accessor: ICoverageAccessor);
    allPerTestIDs(): Generator<string, void, unknown>;
    append(coverage: IFileCoverage, tx: ITransaction | undefined): void;
    filterTreeForTest(testId: TestId): WellDefinedPrefixTree<AbstractFileCoverage>;
    getAllFiles(): ResourceMap<FileCoverage>;
    getUri(uri: URI): FileCoverage | undefined;
    getComputedForUri(uri: URI): AbstractFileCoverage | undefined;
    private treePathForUri;
    private treePathToUri;
}
export declare const getTotalCoveragePercent: (statement: ICoverageCount, branch: ICoverageCount | undefined, function_: ICoverageCount | undefined) => number;
export declare abstract class AbstractFileCoverage {
    readonly fromResult: LiveTestResult;
    id: string;
    readonly uri: URI;
    statement: ICoverageCount;
    branch?: ICoverageCount;
    declaration?: ICoverageCount;
    readonly didChange: import("../../../../base/common/observable.js").IObservableSignal<void>;
    get tpc(): number;
    perTestData?: Set<string>;
    constructor(coverage: IFileCoverage, fromResult: LiveTestResult);
}
export declare class ComputedFileCoverage extends AbstractFileCoverage {
}
export declare class BypassedFileCoverage extends ComputedFileCoverage {
    constructor(uri: URI, result: LiveTestResult);
}
export declare class FileCoverage extends AbstractFileCoverage {
    private readonly accessor;
    private _details?;
    private resolved?;
    private _detailsForTest?;
    get hasSynchronousDetails(): boolean | undefined;
    constructor(coverage: IFileCoverage, fromResult: LiveTestResult, accessor: ICoverageAccessor);
    detailsForTest(_testId: TestId, token?: Readonly<CancellationToken>): Promise<CoverageDetails[]>;
    details(token?: Readonly<CancellationToken>): Promise<CoverageDetails[]>;
}
export declare const totalFromCoverageDetails: (uri: URI, details: CoverageDetails[]) => IFileCoverage;
