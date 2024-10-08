import { Disposable } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITestCoverageService } from '../common/testCoverageService.js';
import { ITestResult } from '../common/testResult.js';
import { ITestResultService } from '../common/testResultService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
/** Workbench contribution that triggers updates in the TestingProgressUi service */
export declare class TestingProgressTrigger extends Disposable {
    private readonly configurationService;
    private readonly viewsService;
    constructor(resultService: ITestResultService, testCoverageService: ITestCoverageService, configurationService: IConfigurationService, viewsService: IViewsService);
    private attachAutoOpenForNewResults;
    private openExplorerView;
    private openResultsView;
}
export type CountSummary = ReturnType<typeof collectTestStateCounts>;
export declare const collectTestStateCounts: (isRunning: boolean, results: ReadonlyArray<ITestResult>) => {
    isRunning: boolean;
    passed: number;
    failed: number;
    runSoFar: number;
    totalWillBeRun: number;
    skipped: number;
};
export declare const getTestProgressText: ({ isRunning, passed, runSoFar, totalWillBeRun, skipped, failed }: CountSummary) => string;
