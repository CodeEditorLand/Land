import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable, ISettableObservable } from '../../../../base/common/observable.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { TestCoverage } from './testCoverage.js';
import { TestId } from './testId.js';
import { ITestRunTaskResults } from './testResult.js';
import { ITestResultService } from './testResultService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
export declare const ITestCoverageService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestCoverageService>;
export interface ITestCoverageService {
    readonly _serviceBrand: undefined;
    readonly selected: IObservable<TestCoverage | undefined>;
    readonly filterToTest: ISettableObservable<TestId | undefined>;
    readonly showInline: ISettableObservable<boolean>;
    openCoverage(task: ITestRunTaskResults, focus?: boolean): Promise<void>;
    closeCoverage(): void;
}
export declare class TestCoverageService extends Disposable implements ITestCoverageService {
    private readonly viewsService;
    readonly _serviceBrand: undefined;
    private readonly lastOpenCts;
    readonly selected: ISettableObservable<TestCoverage | undefined, void>;
    readonly filterToTest: ISettableObservable<TestId | undefined, void>;
    readonly showInline: ISettableObservable<boolean, void>;
    constructor(contextKeyService: IContextKeyService, resultService: ITestResultService, configService: IConfigurationService, viewsService: IViewsService);
    openCoverage(task: ITestRunTaskResults, focus?: boolean): Promise<void>;
    closeCoverage(): void;
}
