import { VSBuffer } from '../../../../base/common/buffer.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable } from '../../../../base/common/observable.js';
import { WellDefinedPrefixTree } from '../../../../base/common/prefixTree.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { TestCoverage } from './testCoverage.js';
import { TestStateCount } from './testingStates.js';
import { IRichLocation, ISerializedTestResults, ITestItem, ITestMessage, ITestOutputMessage, ITestRunTask, ITestTaskState, ResolvedTestRunRequest, TestResultItem, TestResultState } from './testTypes.js';
export interface ITestRunTaskResults extends ITestRunTask {
    /**
     * Contains test coverage for the result, if it's available.
     */
    readonly coverage: IObservable<TestCoverage | undefined>;
    /**
     * Messages from the task not associated with any specific test.
     */
    readonly otherMessages: ITestOutputMessage[];
    /**
     * Test results output for the task.
     */
    readonly output: ITaskRawOutput;
}
export interface ITestResult {
    /**
     * Count of the number of tests in each run state.
     */
    readonly counts: Readonly<TestStateCount>;
    /**
     * Unique ID of this set of test results.
     */
    readonly id: string;
    /**
     * If the test is completed, the unix milliseconds time at which it was
     * completed. If undefined, the test is still running.
     */
    readonly completedAt: number | undefined;
    /**
     * Whether this test result is triggered from an auto run.
     */
    readonly request: ResolvedTestRunRequest;
    /**
     * Human-readable name of the test result.
     */
    readonly name: string;
    /**
     * Gets all tests involved in the run.
     */
    tests: IterableIterator<TestResultItem>;
    /**
     * List of this result's subtasks.
     */
    tasks: ReadonlyArray<ITestRunTaskResults>;
    /**
     * Gets the state of the test by its extension-assigned ID.
     */
    getStateById(testExtId: string): TestResultItem | undefined;
    /**
     * Serializes the test result. Used to save and restore results
     * in the workspace.
     */
    toJSON(): ISerializedTestResults | undefined;
    /**
     * Serializes the test result, includes messages. Used to send the test states to the extension host.
     */
    toJSONWithMessages(): ISerializedTestResults | undefined;
}
/**
 * Output type exposed from live test results.
 */
export interface ITaskRawOutput {
    readonly onDidWriteData: Event<VSBuffer>;
    readonly endPromise: Promise<void>;
    readonly buffers: VSBuffer[];
    readonly length: number;
    /** Gets a continuous buffer for the desired range */
    getRange(start: number, length: number): VSBuffer;
    /** Gets an iterator of buffers for the range; may avoid allocation of getRange() */
    getRangeIter(start: number, length: number): Iterable<VSBuffer>;
}
export declare class TaskRawOutput implements ITaskRawOutput {
    private readonly writeDataEmitter;
    private readonly endDeferred;
    private offset;
    /** @inheritdoc */
    readonly onDidWriteData: Event<VSBuffer>;
    /** @inheritdoc */
    readonly endPromise: Promise<void>;
    /** @inheritdoc */
    readonly buffers: VSBuffer[];
    /** @inheritdoc */
    get length(): number;
    /** @inheritdoc */
    getRange(start: number, length: number): VSBuffer;
    /** @inheritdoc */
    getRangeIter(start: number, length: number): Generator<VSBuffer, void, unknown>;
    /**
     * Appends data to the output, returning the byte range where the data can be found.
     */
    append(data: VSBuffer, marker?: number): {
        offset: number;
        length: number;
    };
    private push;
    /** Signals the output has ended. */
    end(): void;
}
export declare const resultItemParents: (results: ITestResult, item: TestResultItem) => Generator<TestResultItem, void, unknown>;
export declare const maxCountPriority: (counts: Readonly<TestStateCount>) => TestResultState;
interface TestResultItemWithChildren extends TestResultItem {
    /** Children in the run */
    children: TestResultItemWithChildren[];
}
export declare const enum TestResultItemChangeReason {
    ComputedStateChange = 0,
    OwnStateChange = 1,
    NewMessage = 2
}
export type TestResultItemChange = {
    item: TestResultItem;
    result: ITestResult;
} & ({
    reason: TestResultItemChangeReason.ComputedStateChange;
} | {
    reason: TestResultItemChangeReason.OwnStateChange;
    previousState: TestResultState;
    previousOwnDuration: number | undefined;
} | {
    reason: TestResultItemChangeReason.NewMessage;
    message: ITestMessage;
});
/**
 * Results of a test. These are created when the test initially started running
 * and marked as "complete" when the run finishes.
 */
export declare class LiveTestResult extends Disposable implements ITestResult {
    readonly id: string;
    readonly persist: boolean;
    readonly request: ResolvedTestRunRequest;
    private readonly telemetry;
    private readonly completeEmitter;
    private readonly newTaskEmitter;
    private readonly endTaskEmitter;
    private readonly changeEmitter;
    /** todo@connor4312: convert to a WellDefinedPrefixTree */
    private readonly testById;
    private testMarkerCounter;
    private _completedAt?;
    readonly startedAt: number;
    readonly onChange: Event<TestResultItemChange>;
    readonly onComplete: Event<void>;
    readonly onNewTask: Event<number>;
    readonly onEndTask: Event<number>;
    readonly tasks: (ITestRunTaskResults & {
        output: TaskRawOutput;
    })[];
    readonly name: string;
    /**
     * @inheritdoc
     */
    get completedAt(): number | undefined;
    /**
     * @inheritdoc
     */
    readonly counts: TestStateCount;
    /**
     * @inheritdoc
     */
    get tests(): MapIterator<TestResultItemWithChildren>;
    /** Gets an included test item by ID. */
    getTestById(id: string): ITestItem | undefined;
    private readonly computedStateAccessor;
    constructor(id: string, persist: boolean, request: ResolvedTestRunRequest, telemetry: ITelemetryService);
    /**
     * @inheritdoc
     */
    getStateById(extTestId: string): TestResultItemWithChildren | undefined;
    /**
     * Appends output that occurred during the test run.
     */
    appendOutput(output: VSBuffer, taskId: string, location?: IRichLocation, testId?: string): void;
    /**
     * Adds a new run task to the results.
     */
    addTask(task: ITestRunTask): void;
    /**
     * Add the chain of tests to the run. The first test in the chain should
     * be either a test root, or a previously-known test.
     */
    addTestChainToRun(controllerId: string, chain: ReadonlyArray<ITestItem>): undefined;
    /**
     * Updates the state of the test by its internal ID.
     */
    updateState(testId: string, taskId: string, state: TestResultState, duration?: number): void;
    /**
     * Appends a message for the test in the run.
     */
    appendMessage(testId: string, taskId: string, message: ITestMessage): void;
    /**
     * Marks the task in the test run complete.
     */
    markTaskComplete(taskId: string): void;
    /**
     * Notifies the service that all tests are complete.
     */
    markComplete(): void;
    /**
     * Marks the test and all of its children in the run as retired.
     */
    markRetired(testIds: WellDefinedPrefixTree<undefined> | undefined): void;
    /**
     * @inheritdoc
     */
    toJSON(): ISerializedTestResults | undefined;
    toJSONWithMessages(): ISerializedTestResults | undefined;
    /**
     * Updates all tests in the collection to the given state.
     */
    protected setAllToState(state: TestResultState, taskId: string, when: (task: ITestTaskState, item: TestResultItem) => boolean): void;
    private fireUpdateAndRefresh;
    private addTestToRun;
    private mustGetTaskIndex;
    private readonly doSerialize;
    private readonly doSerializeWithMessages;
}
/**
 * Test results hydrated from a previously-serialized test run.
 */
export declare class HydratedTestResult implements ITestResult {
    private readonly serialized;
    private readonly persist;
    /**
     * @inheritdoc
     */
    readonly counts: TestStateCount;
    /**
     * @inheritdoc
     */
    readonly id: string;
    /**
     * @inheritdoc
     */
    readonly completedAt: number;
    /**
     * @inheritdoc
     */
    readonly tasks: ITestRunTaskResults[];
    /**
     * @inheritdoc
     */
    get tests(): MapIterator<TestResultItem>;
    /**
     * @inheritdoc
     */
    readonly name: string;
    /**
     * @inheritdoc
     */
    readonly request: ResolvedTestRunRequest;
    private readonly testById;
    constructor(identity: IUriIdentityService, serialized: ISerializedTestResults, persist?: boolean);
    /**
     * @inheritdoc
     */
    getStateById(extTestId: string): TestResultItem | undefined;
    /**
     * @inheritdoc
     */
    toJSON(): ISerializedTestResults | undefined;
    /**
     * @inheritdoc
     */
    toJSONWithMessages(): ISerializedTestResults | undefined;
}
export {};
