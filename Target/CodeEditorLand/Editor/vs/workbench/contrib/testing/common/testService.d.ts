import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Location } from '../../../../editor/common/languages.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { MutableObservableValue } from './observableValue.js';
import { TestExclusions } from './testExclusions.js';
import { TestId } from './testId.js';
import { ITestResult } from './testResult.js';
import { AbstractIncrementalTestCollection, ICallProfileRunHandler, IncrementalTestCollectionItem, InternalTestItem, IStartControllerTests, IStartControllerTestsResult, ITestItemContext, ResolvedTestRunRequest, TestControllerCapability, TestMessageFollowupRequest, TestMessageFollowupResponse, TestRunProfileBitset, TestsDiff } from './testTypes.js';
export declare const ITestService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestService>;
export interface IMainThreadTestController {
    readonly id: string;
    readonly label: IObservable<string>;
    readonly capabilities: IObservable<TestControllerCapability>;
    syncTests(token: CancellationToken): Promise<void>;
    refreshTests(token: CancellationToken): Promise<void>;
    configureRunProfile(profileId: number): void;
    expandTest(id: string, levels: number): Promise<void>;
    getRelatedCode(testId: string, token: CancellationToken): Promise<Location[]>;
    startContinuousRun(request: ICallProfileRunHandler[], token: CancellationToken): Promise<IStartControllerTestsResult[]>;
    runTests(request: IStartControllerTests[], token: CancellationToken): Promise<IStartControllerTestsResult[]>;
}
export interface IMainThreadTestHostProxy {
    provideTestFollowups(req: TestMessageFollowupRequest, token: CancellationToken): Promise<TestMessageFollowupResponse[]>;
    getTestsRelatedToCode(uri: URI, position: Position, token: CancellationToken): Promise<string[]>;
    executeTestFollowup(id: number): Promise<void>;
    disposeTestFollowups(ids: number[]): void;
}
export interface IMainThreadTestCollection extends AbstractIncrementalTestCollection<IncrementalTestCollectionItem> {
    onBusyProvidersChange: Event<number>;
    /**
     * Number of providers working to discover tests.
     */
    busyProviders: number;
    /**
     * Root item IDs.
     */
    rootIds: Iterable<string>;
    /**
     * Root items, correspond to registered controllers.
     */
    rootItems: Iterable<IncrementalTestCollectionItem>;
    /**
     * Iterates over every test in the collection, in strictly descending
     * order of depth.
     */
    all: Iterable<IncrementalTestCollectionItem>;
    /**
     * Gets a node in the collection by ID.
     */
    getNodeById(id: string): IncrementalTestCollectionItem | undefined;
    /**
     * Gets all tests that have the given URL. Tests returned from this
     * method are *not* in any particular order.
     */
    getNodeByUrl(uri: URI): Iterable<IncrementalTestCollectionItem>;
    /**
     * Requests that children be revealed for the given test. "Levels" may
     * be infinite.
     */
    expand(testId: string, levels: number): Promise<void>;
    /**
     * Gets a diff that adds all items currently in the tree to a new collection,
     * allowing it to fully hydrate.
     */
    getReviverDiff(): TestsDiff;
}
export declare const testCollectionIsEmpty: (collection: IMainThreadTestCollection) => boolean;
export declare const getContextForTestItem: (collection: IMainThreadTestCollection, id: string | TestId) => ITestItemContext | {
    controller: string | undefined;
};
/**
 * Ensures the test with the given ID exists in the collection, if possible.
 * If cancellation is requested, or the test cannot be found, it will return
 * undefined.
 */
export declare const expandAndGetTestById: (collection: IMainThreadTestCollection, id: string, ct?: Readonly<CancellationToken>) => Promise<IncrementalTestCollectionItem | undefined>;
/**
 * Iterator that expands to and iterates through tests in the file. Iterates
 * in strictly descending order.
 */
export declare const testsInFile: (testService: ITestService, ident: IUriIdentityService, uri: URI, waitForIdle?: boolean) => AsyncIterable<IncrementalTestCollectionItem>;
/**
 * Iterator that iterates to the top-level children of tests under the given
 * the URI.
 */
export declare const testsUnderUri: (testService: ITestService, ident: IUriIdentityService, uri: URI, waitForIdle?: boolean) => AsyncIterable<IncrementalTestCollectionItem>;
/**
 * Simplifies the array of tests by preferring test item parents if all of
 * their children are included.
 */
export declare const simplifyTestsToExecute: (collection: IMainThreadTestCollection, tests: IncrementalTestCollectionItem[]) => IncrementalTestCollectionItem[];
/**
 * A run request that expresses the intent of the request and allows the
 * test service to resolve the specifics of the group.
 */
export interface AmbiguousRunTestsRequest {
    /** Group to run */
    group: TestRunProfileBitset;
    /** Tests to run. Allowed to be from different controllers */
    tests: readonly InternalTestItem[];
    /** Tests to exclude. If not given, the current UI excluded tests are used */
    exclude?: InternalTestItem[];
    /** Whether this was triggered from an auto run. */
    continuous?: boolean;
}
export interface ITestFollowup {
    message: string;
    execute(): Promise<void>;
}
export interface ITestFollowups extends IDisposable {
    followups: ITestFollowup[];
}
export interface ITestService {
    readonly _serviceBrand: undefined;
    /**
     * Fires when the user requests to cancel a test run -- or all runs, if no
     * runId is given.
     */
    readonly onDidCancelTestRun: Event<{
        runId: string | undefined;
        taskId: string | undefined;
    }>;
    /**
     * Event that fires when the excluded tests change.
     */
    readonly excluded: TestExclusions;
    /**
     * Test collection instance.
     */
    readonly collection: IMainThreadTestCollection;
    /**
     * Event that fires immediately before a diff is processed.
     */
    readonly onWillProcessDiff: Event<TestsDiff>;
    /**
     * Event that fires after a diff is processed.
     */
    readonly onDidProcessDiff: Event<TestsDiff>;
    /**
     * Whether inline editor decorations should be visible.
     */
    readonly showInlineOutput: MutableObservableValue<boolean>;
    /**
     * Registers an interface that represents an extension host..
     */
    registerExtHost(controller: IMainThreadTestHostProxy): IDisposable;
    /**
     * Registers an interface that runs tests for the given provider ID.
     */
    registerTestController(providerId: string, controller: IMainThreadTestController): IDisposable;
    /**
     * Gets a registered test controller by ID.
     */
    getTestController(controllerId: string): IMainThreadTestController | undefined;
    /**
     * Refreshes tests for the controller, or all controllers if no ID is given.
     */
    refreshTests(controllerId?: string): Promise<void>;
    /**
     * Cancels any ongoing test refreshes.
     */
    cancelRefreshTests(): void;
    /**
     * Requests that tests be executed continuously, until the token is cancelled.
     */
    startContinuousRun(req: ResolvedTestRunRequest, token: CancellationToken): Promise<void>;
    /**
     * Requests that tests be executed.
     */
    runTests(req: AmbiguousRunTestsRequest, token?: CancellationToken): Promise<ITestResult>;
    /**
     * Requests that tests be executed.
     */
    runResolvedTests(req: ResolvedTestRunRequest, token?: CancellationToken): Promise<ITestResult>;
    /**
     * Provides followup actions for a test run.
     */
    provideTestFollowups(req: TestMessageFollowupRequest, token: CancellationToken): Promise<ITestFollowups>;
    /**
     * Ensures the test diff from the remote ext host is flushed and waits for
     * any "busy" tests to become idle before resolving.
     */
    syncTests(): Promise<void>;
    /**
     * Cancels an ongoing test run by its ID, or all runs if no ID is given.
     */
    cancelTestRun(runId?: string, taskId?: string): void;
    /**
     * Publishes a test diff for a controller.
     */
    publishDiff(controllerId: string, diff: TestsDiff): void;
    /**
     * Gets all tests related to the given code position.
     */
    getTestsRelatedToCode(uri: URI, position: Position, token?: CancellationToken): Promise<InternalTestItem[]>;
    /**
     * Gets code related to the given test item.
     */
    getCodeRelatedToTest(test: InternalTestItem, token?: CancellationToken): Promise<Location[]>;
}
