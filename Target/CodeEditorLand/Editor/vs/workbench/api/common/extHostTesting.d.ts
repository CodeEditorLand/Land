import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { UriComponents } from '../../../base/common/uri.js';
import { IPosition } from '../../../editor/common/core/position.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtHostTestingShape, ILocationDto, MainThreadTestingShape } from './extHost.protocol.js';
import { IExtHostCommands } from './extHostCommands.js';
import { IExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { ExtHostTestItemCollection } from './extHostTestItem.js';
import { CoverageDetails, ISerializedTestResults, IStartControllerTests, IStartControllerTestsResult, TestMessageFollowupRequest, TestMessageFollowupResponse, TestsDiffOp } from '../../contrib/testing/common/testTypes.js';
import type * as vscode from 'vscode';
interface ControllerInfo {
    controller: vscode.TestController;
    profiles: Map<number, vscode.TestRunProfile>;
    collection: ExtHostTestItemCollection;
    extension: IExtensionDescription;
    relatedCodeProvider?: vscode.TestRelatedCodeProvider;
    activeProfiles: Set<number>;
}
type DefaultProfileChangeEvent = Map</* controllerId */ string, Map</* profileId */ number, boolean>>;
export declare const IExtHostTesting: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostTesting>;
export interface IExtHostTesting extends ExtHostTesting {
    readonly _serviceBrand: undefined;
}
export declare class ExtHostTesting extends Disposable implements ExtHostTestingShape {
    private readonly logService;
    private readonly commands;
    private readonly editors;
    readonly _serviceBrand: undefined;
    private readonly resultsChangedEmitter;
    protected readonly controllers: Map<string, ControllerInfo>;
    private readonly proxy;
    private readonly runTracker;
    private readonly observer;
    private readonly defaultProfilesChangedEmitter;
    private readonly followupProviders;
    private readonly testFollowups;
    onResultsChanged: Event<void>;
    results: ReadonlyArray<vscode.TestRunResult>;
    constructor(rpc: IExtHostRpcService, logService: ILogService, commands: IExtHostCommands, editors: IExtHostDocumentsAndEditors);
    /**
     * Implements vscode.test.registerTestProvider
     */
    createTestController(extension: IExtensionDescription, controllerId: string, label: string, refreshHandler?: (token: CancellationToken) => Thenable<void> | void): vscode.TestController;
    /**
     * Implements vscode.test.createTestObserver
     */
    createTestObserver(): vscode.TestObserver;
    /**
     * Implements vscode.test.runTests
     */
    runTests(req: vscode.TestRunRequest, token?: Readonly<CancellationToken>): Promise<void>;
    /**
     * Implements vscode.test.registerTestFollowupProvider
     */
    registerTestFollowupProvider(provider: vscode.TestFollowupProvider): vscode.Disposable;
    /**
     * @inheritdoc
     */
    $getTestsRelatedToCode(uri: UriComponents, _position: IPosition, token: CancellationToken): Promise<string[]>;
    /**
     * @inheritdoc
     */
    $getCodeRelatedToTest(testId: string, token: CancellationToken): Promise<ILocationDto[]>;
    /**
     * @inheritdoc
     */
    $syncTests(): Promise<void>;
    /**
     * @inheritdoc
     */
    $getCoverageDetails(coverageId: string, testId: string | undefined, token: CancellationToken): Promise<CoverageDetails.Serialized[]>;
    /**
     * @inheritdoc
     */
    $disposeRun(runId: string): Promise<void>;
    /** @inheritdoc */
    $configureRunProfile(controllerId: string, profileId: number): void;
    /** @inheritdoc */
    $setDefaultRunProfiles(profiles: Record</* controller id */ string, /* profile id */ number[]>): void;
    /** @inheritdoc */
    $refreshTests(controllerId: string, token: CancellationToken): Promise<void>;
    /**
     * Updates test results shown to extensions.
     * @override
     */
    $publishTestResults(results: ISerializedTestResults[]): void;
    /**
     * Expands the nodes in the test tree. If levels is less than zero, it will
     * be treated as infinite.
     */
    $expandTest(testId: string, levels: number): Promise<void>;
    /**
     * Receives a test update from the main thread. Called (eventually) whenever
     * tests change.
     */
    $acceptDiff(diff: TestsDiffOp.Serialized[]): void;
    /**
     * Runs tests with the given set of IDs. Allows for test from multiple
     * providers to be run.
     * @inheritdoc
     */
    $runControllerTests(reqs: IStartControllerTests[], token: CancellationToken): Promise<IStartControllerTestsResult[]>;
    /**
     * Starts continuous test runs with the given set of IDs. Allows for test from
     * multiple providers to be run.
     * @inheritdoc
     */
    $startContinuousRun(reqs: IStartControllerTests[], token: CancellationToken): Promise<IStartControllerTestsResult[]>;
    /** @inheritdoc */
    $provideTestFollowups(req: TestMessageFollowupRequest, token: CancellationToken): Promise<TestMessageFollowupResponse[]>;
    $disposeTestFollowups(id: number[]): void;
    $executeTestFollowup(id: number): Promise<void>;
    /**
     * Cancels an ongoing test run.
     */
    $cancelExtensionTestRun(runId: string | undefined, taskId: string | undefined): void;
    getMetadataForRun(run: vscode.TestRun): {
        taskId: string;
        runId: string;
    } | undefined;
    private runControllerTestRequest;
}
declare class TestRunTracker extends Disposable {
    private readonly dto;
    private readonly proxy;
    private readonly logService;
    private readonly profile;
    private readonly extension;
    private state;
    private running;
    private readonly tasks;
    private readonly sharedTestIds;
    private readonly cts;
    private readonly endEmitter;
    private readonly onDidDispose;
    private readonly publishedCoverage;
    /**
     * Fires when a test ends, and no more tests are left running.
     */
    readonly onEnd: Event<void>;
    /**
     * Gets whether there are any tests running.
     */
    get hasRunningTasks(): boolean;
    /**
     * Gets the run ID.
     */
    get id(): string;
    constructor(dto: TestRunDto, proxy: MainThreadTestingShape, logService: ILogService, profile: vscode.TestRunProfile | undefined, extension: IExtensionDescription, parentToken?: CancellationToken);
    /** Gets the task ID from a test run object. */
    getTaskIdForRun(run: vscode.TestRun): string | undefined;
    /** Requests cancellation of the run. On the second call, forces cancellation. */
    cancel(taskId?: string): void;
    /** Gets details for a previously-emitted coverage object. */
    getCoverageDetails(id: string, testId: string | undefined, token: CancellationToken): Promise<vscode.FileCoverageDetail[]>;
    /** Creates the public test run interface to give to extensions. */
    createRun(name: string | undefined): vscode.TestRun;
    private forciblyEndTasks;
    private markEnded;
    private ensureTestIsKnown;
    dispose(): void;
}
/**
 * Queues runs for a single extension and provides the currently-executing
 * run so that `createTestRun` can be properly correlated.
 */
export declare class TestRunCoordinator {
    private readonly proxy;
    private readonly logService;
    private readonly tracked;
    private readonly trackedById;
    get trackers(): MapIterator<TestRunTracker>;
    constructor(proxy: MainThreadTestingShape, logService: ILogService);
    /**
     * Gets a coverage report for a given run and task ID.
     */
    getCoverageDetails(id: string, testId: string | undefined, token: vscode.CancellationToken): never[] | Promise<vscode.FileCoverageDetail[]>;
    /**
     * Disposes the test run, called when the main thread is no longer interested
     * in associated data.
     */
    disposeTestRun(runId: string): void;
    /**
     * Registers a request as being invoked by the main thread, so
     * `$startedExtensionTestRun` is not invoked. The run must eventually
     * be cancelled manually.
     */
    prepareForMainThreadTestRun(extension: IExtensionDescription, req: vscode.TestRunRequest, dto: TestRunDto, profile: vscode.TestRunProfile, token: CancellationToken): TestRunTracker;
    /**
     * Cancels an existing test run via its cancellation token.
     */
    cancelRunById(runId: string, taskId?: string): void;
    /**
     * Cancels an existing test run via its cancellation token.
     */
    cancelAllRuns(): void;
    /**
     * Implements the public `createTestRun` API.
     */
    createTestRun(extension: IExtensionDescription, controllerId: string, collection: ExtHostTestItemCollection, request: vscode.TestRunRequest, name: string | undefined, persist: boolean): vscode.TestRun;
    private getTracker;
}
export declare class TestRunDto {
    readonly controllerId: string;
    readonly id: string;
    readonly isPersisted: boolean;
    readonly colllection: ExtHostTestItemCollection;
    static fromPublic(controllerId: string, collection: ExtHostTestItemCollection, request: vscode.TestRunRequest, persist: boolean): TestRunDto;
    static fromInternal(request: IStartControllerTests, collection: ExtHostTestItemCollection): TestRunDto;
    constructor(controllerId: string, id: string, isPersisted: boolean, colllection: ExtHostTestItemCollection);
}
export declare class TestRunProfileImpl implements vscode.TestRunProfile {
    #private;
    readonly controllerId: string;
    readonly profileId: number;
    private _label;
    readonly kind: vscode.TestRunProfileKind;
    runHandler: (request: vscode.TestRunRequest, token: vscode.CancellationToken) => Thenable<void> | void;
    _tag: vscode.TestTag | undefined;
    private _supportsContinuousRun;
    private _configureHandler?;
    get label(): string;
    set label(label: string);
    get supportsContinuousRun(): boolean;
    set supportsContinuousRun(supports: boolean);
    get isDefault(): boolean;
    set isDefault(isDefault: boolean);
    get tag(): vscode.TestTag | undefined;
    set tag(tag: vscode.TestTag | undefined);
    get configureHandler(): undefined | (() => void);
    set configureHandler(handler: undefined | (() => void));
    get onDidChangeDefault(): Event<boolean>;
    constructor(proxy: MainThreadTestingShape, profiles: Map<number, vscode.TestRunProfile>, activeProfiles: Set<number>, onDidChangeActiveProfiles: Event<DefaultProfileChangeEvent>, controllerId: string, profileId: number, _label: string, kind: vscode.TestRunProfileKind, runHandler: (request: vscode.TestRunRequest, token: vscode.CancellationToken) => Thenable<void> | void, _isDefault?: boolean, _tag?: vscode.TestTag | undefined, _supportsContinuousRun?: boolean);
    dispose(): void;
}
export {};
