import { observableFromEvent } from '../../../../base/common/observable.js';
import { localize } from '../../../../nls.js';
export const testingConfiguration = {
    id: 'testing',
    order: 21,
    title: localize('testConfigurationTitle', "Testing"),
    type: 'object',
    properties: {
        ["testing.autoRun.delay"]: {
            type: 'integer',
            minimum: 0,
            description: localize('testing.autoRun.delay', "How long to wait, in milliseconds, after a test is marked as outdated and starting a new run."),
            default: 1000,
        },
        ["testing.automaticallyOpenPeekView"]: {
            description: localize('testing.automaticallyOpenPeekView', "Configures when the error Peek view is automatically opened."),
            enum: [
                "failureAnywhere",
                "failureInVisibleDocument",
                "never",
            ],
            default: "failureInVisibleDocument",
            enumDescriptions: [
                localize('testing.automaticallyOpenPeekView.failureAnywhere', "Open automatically no matter where the failure is."),
                localize('testing.automaticallyOpenPeekView.failureInVisibleDocument', "Open automatically when a test fails in a visible document."),
                localize('testing.automaticallyOpenPeekView.never', "Never automatically open."),
            ],
        },
        ["testing.showAllMessages"]: {
            description: localize('testing.showAllMessages', "Controls whether to show messages from all test runs."),
            type: 'boolean',
            default: false,
        },
        ["testing.automaticallyOpenPeekViewDuringAutoRun"]: {
            description: localize('testing.automaticallyOpenPeekViewDuringContinuousRun', "Controls whether to automatically open the Peek view during continuous run mode."),
            type: 'boolean',
            default: false,
        },
        ["testing.countBadge"]: {
            description: localize('testing.countBadge', 'Controls the count badge on the Testing icon on the Activity Bar.'),
            enum: [
                "failed",
                "off",
                "passed",
                "skipped",
            ],
            enumDescriptions: [
                localize('testing.countBadge.failed', 'Show the number of failed tests'),
                localize('testing.countBadge.off', 'Disable the testing count badge'),
                localize('testing.countBadge.passed', 'Show the number of passed tests'),
                localize('testing.countBadge.skipped', 'Show the number of skipped tests'),
            ],
            default: "failed",
        },
        ["testing.followRunningTest"]: {
            description: localize('testing.followRunningTest', 'Controls whether the running test should be followed in the Test Explorer view.'),
            type: 'boolean',
            default: true,
        },
        ["testing.defaultGutterClickAction"]: {
            description: localize('testing.defaultGutterClickAction', 'Controls the action to take when left-clicking on a test decoration in the gutter.'),
            enum: [
                "run",
                "debug",
                "runWithCoverage",
                "contextMenu",
            ],
            enumDescriptions: [
                localize('testing.defaultGutterClickAction.run', 'Run the test.'),
                localize('testing.defaultGutterClickAction.debug', 'Debug the test.'),
                localize('testing.defaultGutterClickAction.coverage', 'Run the test with coverage.'),
                localize('testing.defaultGutterClickAction.contextMenu', 'Open the context menu for more options.'),
            ],
            default: "run",
        },
        ["testing.gutterEnabled"]: {
            description: localize('testing.gutterEnabled', 'Controls whether test decorations are shown in the editor gutter.'),
            type: 'boolean',
            default: true,
        },
        ["testing.saveBeforeTest"]: {
            description: localize('testing.saveBeforeTest', 'Control whether save all dirty editors before running a test.'),
            type: 'boolean',
            default: true,
        },
        ["testing.openTesting"]: {
            enum: [
                "neverOpen",
                "openOnTestStart",
                "openOnTestFailure",
                "openExplorerOnTestStart",
            ],
            enumDescriptions: [
                localize('testing.openTesting.neverOpen', 'Never automatically open the testing views'),
                localize('testing.openTesting.openOnTestStart', 'Open the test results view when tests start'),
                localize('testing.openTesting.openOnTestFailure', 'Open the test result view on any test failure'),
                localize('testing.openTesting.openExplorerOnTestStart', 'Open the test explorer when tests start'),
            ],
            default: 'openOnTestStart',
            description: localize('testing.openTesting', "Controls when the testing view should open.")
        },
        ["testing.alwaysRevealTestOnStateChange"]: {
            markdownDescription: localize('testing.alwaysRevealTestOnStateChange', "Always reveal the executed test when {0} is on. If this setting is turned off, only failed tests will be revealed.", '`#testing.followRunningTest#`'),
            type: 'boolean',
            default: false,
        },
        ["testing.showCoverageInExplorer"]: {
            description: localize('testing.ShowCoverageInExplorer', "Whether test coverage should be down in the File Explorer view."),
            type: 'boolean',
            default: true,
        },
        ["testing.displayedCoveragePercent"]: {
            markdownDescription: localize('testing.displayedCoveragePercent', "Configures what percentage is displayed by default for test coverage."),
            default: "totalCoverage",
            enum: [
                "totalCoverage",
                "statement",
                "minimum",
            ],
            enumDescriptions: [
                localize('testing.displayedCoveragePercent.totalCoverage', 'A calculation of the combined statement, function, and branch coverage.'),
                localize('testing.displayedCoveragePercent.statement', 'The statement coverage.'),
                localize('testing.displayedCoveragePercent.minimum', 'The minimum of statement, function, and branch coverage.'),
            ],
        },
        ["testing.coverageBarThresholds"]: {
            markdownDescription: localize('testing.coverageBarThresholds', "Configures the colors used for percentages in test coverage bars."),
            default: { red: 0, yellow: 60, green: 90 },
            properties: {
                red: { type: 'number', minimum: 0, maximum: 100, default: 0 },
                yellow: { type: 'number', minimum: 0, maximum: 100, default: 60 },
                green: { type: 'number', minimum: 0, maximum: 100, default: 90 },
            },
        },
        ["testing.coverageToolbarEnabled"]: {
            description: localize('testing.coverageToolbarEnabled', 'Controls whether the coverage toolbar is shown in the editor.'),
            type: 'boolean',
            default: false,
        },
    }
};
export const getTestingConfiguration = (config, key) => config.getValue(key);
export const observeTestingConfiguration = (config, key) => observableFromEvent(config.onDidChangeConfiguration, () => getTestingConfiguration(config, key));
