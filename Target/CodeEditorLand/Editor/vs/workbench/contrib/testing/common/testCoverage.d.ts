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
/**
 * Class that exposese coverage information for a run.
 */
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
    /** Gets all test IDs that were included in this test run. */
    allPerTestIDs(): Generator<string, void, unknown>;
    append(coverage: IFileCoverage, tx: ITransaction | undefined): void;
    /**
     * Builds a new tree filtered to per-test coverage data for the given ID.
     */
    filterTreeForTest(testId: TestId): WellDefinedPrefixTree<AbstractFileCoverage>;
    /**
     * Gets coverage information for all files.
     */
    getAllFiles(): ResourceMap<FileCoverage>;
    /**
     * Gets coverage information for a specific file.
     */
    getUri(uri: URI): FileCoverage | undefined;
    /**
     * Gets computed information for a file, including DFS-computed information
     * from child tests.
     */
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
    /**
     * Gets the total coverage percent based on information provided.
     * This is based on the Clover total coverage formula
     */
    get tpc(): number;
    /**
     * Per-test coverage data for this file, if available.
     */
    perTestData?: Set<string>;
    constructor(coverage: IFileCoverage, fromResult: LiveTestResult);
}
/**
 * File coverage info computed from children in the tree, not provided by the
 * extension.
 */
export declare class ComputedFileCoverage extends AbstractFileCoverage {
}
/**
 * A virtual node that doesn't have any added coverage info.
 */
export declare class BypassedFileCoverage extends ComputedFileCoverage {
    constructor(uri: URI, result: LiveTestResult);
}
export declare class FileCoverage extends AbstractFileCoverage {
    private readonly accessor;
    private _details?;
    private resolved?;
    private _detailsForTest?;
    /** Gets whether details are synchronously available */
    get hasSynchronousDetails(): boolean | undefined;
    constructor(coverage: IFileCoverage, fromResult: LiveTestResult, accessor: ICoverageAccessor);
    /**
     * Gets per-line coverage details.
     */
    detailsForTest(_testId: TestId, token?: Readonly<CancellationToken>): Promise<CoverageDetails[]>;
    /**
     * Gets per-line coverage details.
     */
    details(token?: Readonly<CancellationToken>): Promise<CoverageDetails[]>;
}
export declare const totalFromCoverageDetails: (uri: URI, details: CoverageDetails[]) => IFileCoverage;
