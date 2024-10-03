import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { TestService } from './testServiceImpl.js';
import { ITestRunProfile, TestRunProfileBitset } from './testTypes.js';
import { Event } from '../../../../base/common/event.js';
import { ITestProfileService } from './testProfileService.js';
export declare const ITestingContinuousRunService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestingContinuousRunService>;
export interface ITestingContinuousRunService {
    readonly _serviceBrand: undefined;
    readonly lastRunProfileIds: ReadonlySet<number>;
    onDidChange: Event<string | undefined>;
    isSpecificallyEnabledFor(testId: string): boolean;
    isEnabledForAParentOf(testId: string): boolean;
    isEnabledForAChildOf(testId: string): boolean;
    isEnabled(): boolean;
    start(profile: ITestRunProfile[] | TestRunProfileBitset, testId?: string): void;
    stop(testId?: string): void;
}
export declare class TestingContinuousRunService extends Disposable implements ITestingContinuousRunService {
    private readonly testService;
    private readonly testProfileService;
    readonly _serviceBrand: undefined;
    private readonly changeEmitter;
    private globallyRunning?;
    private readonly running;
    private readonly lastRun;
    private readonly isGloballyOn;
    readonly onDidChange: Event<string | undefined>;
    get lastRunProfileIds(): Set<number>;
    constructor(testService: TestService, storageService: IStorageService, contextKeyService: IContextKeyService, testProfileService: ITestProfileService);
    isSpecificallyEnabledFor(testId: string): boolean;
    isEnabledForAParentOf(testId: string): boolean;
    isEnabledForAChildOf(testId: string): boolean;
    isEnabled(): boolean;
    start(profiles: ITestRunProfile[] | TestRunProfileBitset, testId?: string): void;
    stop(testId?: string): void;
}
