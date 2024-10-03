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
type DefaultProfileChangeEvent = Map<string, Map<number, boolean>>;
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
    createTestController(extension: IExtensionDescription, controllerId: string, label: string, refreshHandler?: (token: CancellationToken) => Thenable<void> | void): vscode.TestController;
    createTestObserver(): vscode.TestObserver;
    runTests(req: vscode.TestRunRequest, token?: Readonly<CancellationToken>): Promise<void>;
    registerTestFollowupProvider(provider: vscode.TestFollowupProvider): vscode.Disposable;
    $getTestsRelatedToCode(uri: UriComponents, _position: IPosition, token: CancellationToken): Promise<string[]>;
    $getCodeRelatedToTest(testId: string, token: CancellationToken): Promise<ILocationDto[]>;
    $syncTests(): Promise<void>;
    $getCoverageDetails(coverageId: string, testId: string | undefined, token: CancellationToken): Promise<CoverageDetails.Serialized[]>;
    $disposeRun(runId: string): Promise<void>;
    $configureRunProfile(controllerId: string, profileId: number): void;
    $setDefaultRunProfiles(profiles: Record<string, number[]>): void;
    $refreshTests(controllerId: string, token: CancellationToken): Promise<void>;
    $publishTestResults(results: ISerializedTestResults[]): void;
    $expandTest(testId: string, levels: number): Promise<void>;
    $acceptDiff(diff: TestsDiffOp.Serialized[]): void;
    $runControllerTests(reqs: IStartControllerTests[], token: CancellationToken): Promise<IStartControllerTestsResult[]>;
    $startContinuousRun(reqs: IStartControllerTests[], token: CancellationToken): Promise<IStartControllerTestsResult[]>;
    $provideTestFollowups(req: TestMessageFollowupRequest, token: CancellationToken): Promise<TestMessageFollowupResponse[]>;
    $disposeTestFollowups(id: number[]): void;
    $executeTestFollowup(id: number): Promise<void>;
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
    readonly onEnd: Event<void>;
    get hasRunningTasks(): boolean;
    get id(): string;
    constructor(dto: TestRunDto, proxy: MainThreadTestingShape, logService: ILogService, profile: vscode.TestRunProfile | undefined, extension: IExtensionDescription, parentToken?: CancellationToken);
    getTaskIdForRun(run: vscode.TestRun): string | undefined;
    cancel(taskId?: string): void;
    getCoverageDetails(id: string, testId: string | undefined, token: CancellationToken): Promise<vscode.FileCoverageDetail[]>;
    createRun(name: string | undefined): vscode.TestRun;
    private forciblyEndTasks;
    private markEnded;
    private ensureTestIsKnown;
    dispose(): void;
}
export declare class TestRunCoordinator {
    private readonly proxy;
    private readonly logService;
    private readonly tracked;
    private readonly trackedById;
    get trackers(): MapIterator<TestRunTracker>;
    constructor(proxy: MainThreadTestingShape, logService: ILogService);
    getCoverageDetails(id: string, testId: string | undefined, token: vscode.CancellationToken): never[] | Promise<vscode.FileCoverageDetail[]>;
    disposeTestRun(runId: string): void;
    prepareForMainThreadTestRun(extension: IExtensionDescription, req: vscode.TestRunRequest, dto: TestRunDto, profile: vscode.TestRunProfile, token: CancellationToken): TestRunTracker;
    cancelRunById(runId: string, taskId?: string): void;
    cancelAllRuns(): void;
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
