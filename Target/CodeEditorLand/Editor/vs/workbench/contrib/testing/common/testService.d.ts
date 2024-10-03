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
    busyProviders: number;
    rootIds: Iterable<string>;
    rootItems: Iterable<IncrementalTestCollectionItem>;
    all: Iterable<IncrementalTestCollectionItem>;
    getNodeById(id: string): IncrementalTestCollectionItem | undefined;
    getNodeByUrl(uri: URI): Iterable<IncrementalTestCollectionItem>;
    expand(testId: string, levels: number): Promise<void>;
    getReviverDiff(): TestsDiff;
}
export declare const testCollectionIsEmpty: (collection: IMainThreadTestCollection) => boolean;
export declare const getContextForTestItem: (collection: IMainThreadTestCollection, id: string | TestId) => ITestItemContext | {
    controller: string | undefined;
};
export declare const expandAndGetTestById: (collection: IMainThreadTestCollection, id: string, ct?: Readonly<CancellationToken>) => Promise<IncrementalTestCollectionItem | undefined>;
export declare const testsInFile: (testService: ITestService, ident: IUriIdentityService, uri: URI, waitForIdle?: boolean) => AsyncIterable<IncrementalTestCollectionItem>;
export declare const testsUnderUri: (testService: ITestService, ident: IUriIdentityService, uri: URI, waitForIdle?: boolean) => AsyncIterable<IncrementalTestCollectionItem>;
export declare const simplifyTestsToExecute: (collection: IMainThreadTestCollection, tests: IncrementalTestCollectionItem[]) => IncrementalTestCollectionItem[];
export interface AmbiguousRunTestsRequest {
    group: TestRunProfileBitset;
    tests: readonly InternalTestItem[];
    exclude?: InternalTestItem[];
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
    readonly onDidCancelTestRun: Event<{
        runId: string | undefined;
        taskId: string | undefined;
    }>;
    readonly excluded: TestExclusions;
    readonly collection: IMainThreadTestCollection;
    readonly onWillProcessDiff: Event<TestsDiff>;
    readonly onDidProcessDiff: Event<TestsDiff>;
    readonly showInlineOutput: MutableObservableValue<boolean>;
    registerExtHost(controller: IMainThreadTestHostProxy): IDisposable;
    registerTestController(providerId: string, controller: IMainThreadTestController): IDisposable;
    getTestController(controllerId: string): IMainThreadTestController | undefined;
    refreshTests(controllerId?: string): Promise<void>;
    cancelRefreshTests(): void;
    startContinuousRun(req: ResolvedTestRunRequest, token: CancellationToken): Promise<void>;
    runTests(req: AmbiguousRunTestsRequest, token?: CancellationToken): Promise<ITestResult>;
    runResolvedTests(req: ResolvedTestRunRequest, token?: CancellationToken): Promise<ITestResult>;
    provideTestFollowups(req: TestMessageFollowupRequest, token: CancellationToken): Promise<ITestFollowups>;
    syncTests(): Promise<void>;
    cancelTestRun(runId?: string, taskId?: string): void;
    publishDiff(controllerId: string, diff: TestsDiff): void;
    getTestsRelatedToCode(uri: URI, position: Position, token?: CancellationToken): Promise<InternalTestItem[]>;
    getCodeRelatedToTest(test: InternalTestItem, token?: CancellationToken): Promise<Location[]>;
}
