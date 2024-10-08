import { RunOnceScheduler } from '../../../../base/common/async.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { ITestProfileService } from './testProfileService.js';
import { ITestResult, LiveTestResult, TestResultItemChange } from './testResult.js';
import { ITestResultStorage } from './testResultStorage.js';
import { ExtensionRunTestsRequest, ResolvedTestRunRequest, TestResultItem } from './testTypes.js';
export type ResultChangeEvent = {
    completed: LiveTestResult;
} | {
    started: LiveTestResult;
} | {
    inserted: ITestResult;
} | {
    removed: ITestResult[];
};
export interface ITestResultService {
    readonly _serviceBrand: undefined;
    /**
     * Fired after any results are added, removed, or completed.
     */
    readonly onResultsChanged: Event<ResultChangeEvent>;
    /**
     * Fired when a test changed it state, or its computed state is updated.
     */
    readonly onTestChanged: Event<TestResultItemChange>;
    /**
     * List of known test results.
     */
    readonly results: ReadonlyArray<ITestResult>;
    /**
     * Discards all completed test results.
     */
    clear(): void;
    /**
     * Creates a new, live test result.
     */
    createLiveResult(req: ResolvedTestRunRequest | ExtensionRunTestsRequest): LiveTestResult;
    /**
     * Adds a new test result to the collection.
     */
    push<T extends ITestResult>(result: T): T;
    /**
     * Looks up a set of test results by ID.
     */
    getResult(resultId: string): ITestResult | undefined;
    /**
     * Looks up a test's most recent state, by its extension-assigned ID.
     */
    getStateById(extId: string): [results: ITestResult, item: TestResultItem] | undefined;
}
export declare const ITestResultService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestResultService>;
export declare class TestResultService extends Disposable implements ITestResultService {
    private readonly storage;
    private readonly testProfiles;
    private readonly telemetryService;
    _serviceBrand: undefined;
    private changeResultEmitter;
    private _results;
    private readonly _resultsDisposables;
    private testChangeEmitter;
    /**
     * @inheritdoc
     */
    get results(): ITestResult[];
    /**
     * @inheritdoc
     */
    readonly onResultsChanged: Event<ResultChangeEvent>;
    /**
     * @inheritdoc
     */
    readonly onTestChanged: Event<TestResultItemChange>;
    private readonly isRunning;
    private readonly hasAnyResults;
    private readonly loadResults;
    protected readonly persistScheduler: RunOnceScheduler;
    constructor(contextKeyService: IContextKeyService, storage: ITestResultStorage, testProfiles: ITestProfileService, telemetryService: ITelemetryService);
    /**
     * @inheritdoc
     */
    getStateById(extId: string): [results: ITestResult, item: TestResultItem] | undefined;
    /**
     * @inheritdoc
     */
    createLiveResult(req: ResolvedTestRunRequest | ExtensionRunTestsRequest): LiveTestResult;
    /**
     * @inheritdoc
     */
    push<T extends ITestResult>(result: T): T;
    /**
     * @inheritdoc
     */
    getResult(id: string): ITestResult | undefined;
    /**
     * @inheritdoc
     */
    clear(): void;
    private onComplete;
    private resort;
    private updateIsRunning;
    protected persistImmediately(): Promise<void>;
}
