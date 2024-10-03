import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IConfigurationNode } from '../../../../platform/configuration/common/configurationRegistry.js';
export declare const enum TestingConfigKeys {
    AutoRunDelay = "testing.autoRun.delay",
    AutoOpenPeekView = "testing.automaticallyOpenPeekView",
    AutoOpenPeekViewDuringContinuousRun = "testing.automaticallyOpenPeekViewDuringAutoRun",
    OpenTesting = "testing.openTesting",
    FollowRunningTest = "testing.followRunningTest",
    DefaultGutterClickAction = "testing.defaultGutterClickAction",
    GutterEnabled = "testing.gutterEnabled",
    SaveBeforeTest = "testing.saveBeforeTest",
    AlwaysRevealTestOnStateChange = "testing.alwaysRevealTestOnStateChange",
    CountBadge = "testing.countBadge",
    ShowAllMessages = "testing.showAllMessages",
    CoveragePercent = "testing.displayedCoveragePercent",
    ShowCoverageInExplorer = "testing.showCoverageInExplorer",
    CoverageBarThresholds = "testing.coverageBarThresholds",
    CoverageToolbarEnabled = "testing.coverageToolbarEnabled"
}
export declare const enum AutoOpenTesting {
    NeverOpen = "neverOpen",
    OpenOnTestStart = "openOnTestStart",
    OpenOnTestFailure = "openOnTestFailure",
    OpenExplorerOnTestStart = "openExplorerOnTestStart"
}
export declare const enum AutoOpenPeekViewWhen {
    FailureVisible = "failureInVisibleDocument",
    FailureAnywhere = "failureAnywhere",
    Never = "never"
}
export declare const enum DefaultGutterClickAction {
    Run = "run",
    Debug = "debug",
    Coverage = "runWithCoverage",
    ContextMenu = "contextMenu"
}
export declare const enum TestingCountBadge {
    Failed = "failed",
    Off = "off",
    Passed = "passed",
    Skipped = "skipped"
}
export declare const enum TestingDisplayedCoveragePercent {
    TotalCoverage = "totalCoverage",
    Statement = "statement",
    Minimum = "minimum"
}
export declare const testingConfiguration: IConfigurationNode;
export interface ITestingCoverageBarThresholds {
    red: number;
    green: number;
    yellow: number;
}
export interface ITestingConfiguration {
    [TestingConfigKeys.AutoRunDelay]: number;
    [TestingConfigKeys.AutoOpenPeekView]: AutoOpenPeekViewWhen;
    [TestingConfigKeys.AutoOpenPeekViewDuringContinuousRun]: boolean;
    [TestingConfigKeys.CountBadge]: TestingCountBadge;
    [TestingConfigKeys.FollowRunningTest]: boolean;
    [TestingConfigKeys.DefaultGutterClickAction]: DefaultGutterClickAction;
    [TestingConfigKeys.GutterEnabled]: boolean;
    [TestingConfigKeys.SaveBeforeTest]: boolean;
    [TestingConfigKeys.OpenTesting]: AutoOpenTesting;
    [TestingConfigKeys.AlwaysRevealTestOnStateChange]: boolean;
    [TestingConfigKeys.ShowAllMessages]: boolean;
    [TestingConfigKeys.CoveragePercent]: TestingDisplayedCoveragePercent;
    [TestingConfigKeys.ShowCoverageInExplorer]: boolean;
    [TestingConfigKeys.CoverageBarThresholds]: ITestingCoverageBarThresholds;
    [TestingConfigKeys.CoverageToolbarEnabled]: boolean;
}
export declare const getTestingConfiguration: <K extends TestingConfigKeys>(config: IConfigurationService, key: K) => ITestingConfiguration[K];
export declare const observeTestingConfiguration: <K extends TestingConfigKeys>(config: IConfigurationService, key: K) => import("../../../../base/common/observable.js").IObservable<ITestingConfiguration[K], unknown>;
