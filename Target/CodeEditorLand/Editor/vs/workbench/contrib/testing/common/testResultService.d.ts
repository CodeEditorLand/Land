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
    readonly onResultsChanged: Event<ResultChangeEvent>;
    readonly onTestChanged: Event<TestResultItemChange>;
    readonly results: ReadonlyArray<ITestResult>;
    clear(): void;
    createLiveResult(req: ResolvedTestRunRequest | ExtensionRunTestsRequest): LiveTestResult;
    push<T extends ITestResult>(result: T): T;
    getResult(resultId: string): ITestResult | undefined;
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
    get results(): ITestResult[];
    readonly onResultsChanged: Event<ResultChangeEvent>;
    readonly onTestChanged: Event<TestResultItemChange>;
    private readonly isRunning;
    private readonly hasAnyResults;
    private readonly loadResults;
    protected readonly persistScheduler: RunOnceScheduler;
    constructor(contextKeyService: IContextKeyService, storage: ITestResultStorage, testProfiles: ITestProfileService, telemetryService: ITelemetryService);
    getStateById(extId: string): [results: ITestResult, item: TestResultItem] | undefined;
    createLiveResult(req: ResolvedTestRunRequest | ExtensionRunTestsRequest): LiveTestResult;
    push<T extends ITestResult>(result: T): T;
    getResult(id: string): ITestResult | undefined;
    clear(): void;
    private onComplete;
    private resort;
    private updateIsRunning;
    protected persistImmediately(): Promise<void>;
}
