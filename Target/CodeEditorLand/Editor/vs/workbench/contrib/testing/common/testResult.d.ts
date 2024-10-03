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
    readonly coverage: IObservable<TestCoverage | undefined>;
    readonly otherMessages: ITestOutputMessage[];
    readonly output: ITaskRawOutput;
}
export interface ITestResult {
    readonly counts: Readonly<TestStateCount>;
    readonly id: string;
    readonly completedAt: number | undefined;
    readonly request: ResolvedTestRunRequest;
    readonly name: string;
    tests: IterableIterator<TestResultItem>;
    tasks: ReadonlyArray<ITestRunTaskResults>;
    getStateById(testExtId: string): TestResultItem | undefined;
    toJSON(): ISerializedTestResults | undefined;
    toJSONWithMessages(): ISerializedTestResults | undefined;
}
export interface ITaskRawOutput {
    readonly onDidWriteData: Event<VSBuffer>;
    readonly endPromise: Promise<void>;
    readonly buffers: VSBuffer[];
    readonly length: number;
    getRange(start: number, length: number): VSBuffer;
    getRangeIter(start: number, length: number): Iterable<VSBuffer>;
}
export declare class TaskRawOutput implements ITaskRawOutput {
    private readonly writeDataEmitter;
    private readonly endDeferred;
    private offset;
    readonly onDidWriteData: Event<VSBuffer>;
    readonly endPromise: Promise<void>;
    readonly buffers: VSBuffer[];
    get length(): number;
    getRange(start: number, length: number): VSBuffer;
    getRangeIter(start: number, length: number): Generator<VSBuffer, void, unknown>;
    append(data: VSBuffer, marker?: number): {
        offset: number;
        length: number;
    };
    private push;
    end(): void;
}
export declare const resultItemParents: (results: ITestResult, item: TestResultItem) => Generator<TestResultItem, void, unknown>;
export declare const maxCountPriority: (counts: Readonly<TestStateCount>) => TestResultState;
interface TestResultItemWithChildren extends TestResultItem {
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
export declare class LiveTestResult extends Disposable implements ITestResult {
    readonly id: string;
    readonly persist: boolean;
    readonly request: ResolvedTestRunRequest;
    private readonly telemetry;
    private readonly completeEmitter;
    private readonly newTaskEmitter;
    private readonly endTaskEmitter;
    private readonly changeEmitter;
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
    get completedAt(): number | undefined;
    readonly counts: TestStateCount;
    get tests(): MapIterator<TestResultItemWithChildren>;
    getTestById(id: string): ITestItem | undefined;
    private readonly computedStateAccessor;
    constructor(id: string, persist: boolean, request: ResolvedTestRunRequest, telemetry: ITelemetryService);
    getStateById(extTestId: string): TestResultItemWithChildren | undefined;
    appendOutput(output: VSBuffer, taskId: string, location?: IRichLocation, testId?: string): void;
    addTask(task: ITestRunTask): void;
    addTestChainToRun(controllerId: string, chain: ReadonlyArray<ITestItem>): undefined;
    updateState(testId: string, taskId: string, state: TestResultState, duration?: number): void;
    appendMessage(testId: string, taskId: string, message: ITestMessage): void;
    markTaskComplete(taskId: string): void;
    markComplete(): void;
    markRetired(testIds: WellDefinedPrefixTree<undefined> | undefined): void;
    toJSON(): ISerializedTestResults | undefined;
    toJSONWithMessages(): ISerializedTestResults | undefined;
    protected setAllToState(state: TestResultState, taskId: string, when: (task: ITestTaskState, item: TestResultItem) => boolean): void;
    private fireUpdateAndRefresh;
    private addTestToRun;
    private mustGetTaskIndex;
    private readonly doSerialize;
    private readonly doSerializeWithMessages;
}
export declare class HydratedTestResult implements ITestResult {
    private readonly serialized;
    private readonly persist;
    readonly counts: TestStateCount;
    readonly id: string;
    readonly completedAt: number;
    readonly tasks: ITestRunTaskResults[];
    get tests(): MapIterator<TestResultItem>;
    readonly name: string;
    readonly request: ResolvedTestRunRequest;
    private readonly testById;
    constructor(identity: IUriIdentityService, serialized: ISerializedTestResults, persist?: boolean);
    getStateById(extTestId: string): TestResultItem | undefined;
    toJSON(): ISerializedTestResults | undefined;
    toJSONWithMessages(): ISerializedTestResults | undefined;
}
export {};
