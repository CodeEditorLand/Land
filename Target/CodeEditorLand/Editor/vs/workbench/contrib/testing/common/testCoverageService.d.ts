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
    /**
     * Settable observable that can be used to show the test coverage instance
     * currently in the editor.
     */
    readonly selected: IObservable<TestCoverage | undefined>;
    /**
     * Filter to per-test coverage from the given test ID.
     */
    readonly filterToTest: ISettableObservable<TestId | undefined>;
    /**
     * Whether inline coverage is shown.
     */
    readonly showInline: ISettableObservable<boolean>;
    /**
     * Opens a test coverage report from a task, optionally focusing it in the editor.
     */
    openCoverage(task: ITestRunTaskResults, focus?: boolean): Promise<void>;
    /**
     * Closes any open coverage.
     */
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
    /** @inheritdoc */
    openCoverage(task: ITestRunTaskResults, focus?: boolean): Promise<void>;
    /** @inheritdoc */
    closeCoverage(): void;
}
