import { CoverageBarSource } from './testCoverageBars.js';
import { ITestingCoverageBarThresholds, TestingDisplayedCoveragePercent } from '../common/configuration.js';
import { TestId } from '../common/testId.js';
import { LiveTestResult } from '../common/testResult.js';
import { ICoverageCount } from '../common/testTypes.js';
export declare const percent: (cc: ICoverageCount) => number;
export declare const getCoverageColor: (pct: number, thresholds: ITestingCoverageBarThresholds) => `var(${string})`;
export declare const displayPercent: (value: number, precision?: number) => string;
export declare const calculateDisplayedStat: (coverage: CoverageBarSource, method: TestingDisplayedCoveragePercent) => number;
export declare function getLabelForItem(result: LiveTestResult, testId: TestId, commonPrefixLen: number): string;
export declare namespace labels {
    const showingFilterFor: (label: string) => string;
    const clickToChangeFiltering: string;
    const percentCoverage: (percent: number, precision?: number) => string;
    const allTests: string;
    const pickShowCoverage: string;
}
