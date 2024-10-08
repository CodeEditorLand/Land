import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Location } from '../../../../editor/common/languages.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { MainThreadTestCollection } from './mainThreadTestCollection.js';
import { MutableObservableValue } from './observableValue.js';
import { TestExclusions } from './testExclusions.js';
import { ITestProfileService } from './testProfileService.js';
import { ITestResult } from './testResult.js';
import { ITestResultService } from './testResultService.js';
import { AmbiguousRunTestsRequest, IMainThreadTestController, IMainThreadTestHostProxy, ITestFollowups, ITestService } from './testService.js';
import { InternalTestItem, ResolvedTestRunRequest, TestMessageFollowupRequest, TestsDiff } from './testTypes.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class TestService extends Disposable implements ITestService {
    private readonly uriIdentityService;
    private readonly storage;
    private readonly editorService;
    private readonly testProfiles;
    private readonly notificationService;
    private readonly configurationService;
    private readonly testResults;
    private readonly workspaceTrustRequestService;
    readonly _serviceBrand: undefined;
    private testControllers;
    private testExtHosts;
    private readonly cancelExtensionTestRunEmitter;
    private readonly willProcessDiffEmitter;
    private readonly didProcessDiffEmitter;
    private readonly testRefreshCancellations;
    private readonly isRefreshingTests;
    private readonly activeEditorHasTests;
    /**
     * Cancellation for runs requested by the user being managed by the UI.
     * Test runs initiated by extensions are not included here.
     */
    private readonly uiRunningTests;
    /**
     * @inheritdoc
     */
    readonly onWillProcessDiff: import("../../../workbench.web.main.internal.js").Event<TestsDiff>;
    /**
     * @inheritdoc
     */
    readonly onDidProcessDiff: import("../../../workbench.web.main.internal.js").Event<TestsDiff>;
    /**
     * @inheritdoc
     */
    readonly onDidCancelTestRun: import("../../../workbench.web.main.internal.js").Event<{
        runId: string | undefined;
        taskId: string | undefined;
    }>;
    /**
     * @inheritdoc
     */
    readonly collection: MainThreadTestCollection;
    /**
     * @inheritdoc
     */
    readonly excluded: TestExclusions;
    /**
     * @inheritdoc
     */
    readonly showInlineOutput: MutableObservableValue<boolean>;
    constructor(contextKeyService: IContextKeyService, instantiationService: IInstantiationService, uriIdentityService: IUriIdentityService, storage: IStorageService, editorService: IEditorService, testProfiles: ITestProfileService, notificationService: INotificationService, configurationService: IConfigurationService, testResults: ITestResultService, workspaceTrustRequestService: IWorkspaceTrustRequestService);
    /**
     * @inheritdoc
     */
    expandTest(id: string, levels: number): Promise<void>;
    /**
     * @inheritdoc
     */
    cancelTestRun(runId?: string, taskId?: string): void;
    /**
     * @inheritdoc
     */
    runTests(req: AmbiguousRunTestsRequest, token?: Readonly<CancellationToken>): Promise<ITestResult>;
    /** @inheritdoc */
    startContinuousRun(req: ResolvedTestRunRequest, token: CancellationToken): Promise<void>;
    /**
     * @inheritdoc
     */
    runResolvedTests(req: ResolvedTestRunRequest, token?: Readonly<CancellationToken>): Promise<import("./testResult.js").LiveTestResult>;
    /**
     * @inheritdoc
     */
    provideTestFollowups(req: TestMessageFollowupRequest, token: CancellationToken): Promise<ITestFollowups>;
    /**
     * @inheritdoc
     */
    publishDiff(_controllerId: string, diff: TestsDiff): void;
    /**
     * @inheritdoc
     */
    getTestController(id: string): IMainThreadTestController | undefined;
    /**
     * @inheritdoc
     */
    syncTests(): Promise<void>;
    /**
     * @inheritdoc
     */
    refreshTests(controllerId?: string): Promise<void>;
    /**
     * @inheritdoc
     */
    cancelRefreshTests(): void;
    /**
     * @inheritdoc
     */
    registerExtHost(controller: IMainThreadTestHostProxy): IDisposable;
    /**
     * @inheritdoc
     */
    getTestsRelatedToCode(uri: URI, position: Position, token?: CancellationToken): Promise<InternalTestItem[]>;
    /**
     * @inheritdoc
     */
    registerTestController(id: string, controller: IMainThreadTestController): IDisposable;
    /**
     * @inheritdoc
     */
    getCodeRelatedToTest(test: InternalTestItem, token?: CancellationToken): Promise<Location[]>;
    private updateEditorContextKeys;
    private saveAllBeforeTest;
}
