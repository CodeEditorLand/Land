/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../nls.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export var TestingContextKeys;
(function (TestingContextKeys) {
    TestingContextKeys.providerCount = new RawContextKey('testing.providerCount', 0);
    TestingContextKeys.canRefreshTests = new RawContextKey('testing.canRefresh', false, { type: 'boolean', description: localize('testing.canRefresh', 'Indicates whether any test controller has an attached refresh handler.') });
    TestingContextKeys.isRefreshingTests = new RawContextKey('testing.isRefreshing', false, { type: 'boolean', description: localize('testing.isRefreshing', 'Indicates whether any test controller is currently refreshing tests.') });
    TestingContextKeys.isContinuousModeOn = new RawContextKey('testing.isContinuousModeOn', false, { type: 'boolean', description: localize('testing.isContinuousModeOn', 'Indicates whether continuous test mode is on.') });
    TestingContextKeys.hasDebuggableTests = new RawContextKey('testing.hasDebuggableTests', false, { type: 'boolean', description: localize('testing.hasDebuggableTests', 'Indicates whether any test controller has registered a debug configuration') });
    TestingContextKeys.hasRunnableTests = new RawContextKey('testing.hasRunnableTests', false, { type: 'boolean', description: localize('testing.hasRunnableTests', 'Indicates whether any test controller has registered a run configuration') });
    TestingContextKeys.hasCoverableTests = new RawContextKey('testing.hasCoverableTests', false, { type: 'boolean', description: localize('testing.hasCoverableTests', 'Indicates whether any test controller has registered a coverage configuration') });
    TestingContextKeys.hasNonDefaultProfile = new RawContextKey('testing.hasNonDefaultProfile', false, { type: 'boolean', description: localize('testing.hasNonDefaultConfig', 'Indicates whether any test controller has registered a non-default configuration') });
    TestingContextKeys.hasConfigurableProfile = new RawContextKey('testing.hasConfigurableProfile', false, { type: 'boolean', description: localize('testing.hasConfigurableConfig', 'Indicates whether any test configuration can be configured') });
    TestingContextKeys.supportsContinuousRun = new RawContextKey('testing.supportsContinuousRun', false, { type: 'boolean', description: localize('testing.supportsContinuousRun', 'Indicates whether continous test running is supported') });
    TestingContextKeys.isParentRunningContinuously = new RawContextKey('testing.isParentRunningContinuously', false, { type: 'boolean', description: localize('testing.isParentRunningContinuously', 'Indicates whether the parent of a test is continuously running, set in the menu context of test items') });
    TestingContextKeys.activeEditorHasTests = new RawContextKey('testing.activeEditorHasTests', false, { type: 'boolean', description: localize('testing.activeEditorHasTests', 'Indicates whether any tests are present in the current editor') });
    TestingContextKeys.cursorInsideTestRange = new RawContextKey('testing.cursorInsideTestRange', false, { type: 'boolean', description: localize('testing.cursorInsideTestRange', 'Whether the cursor is currently inside a test range') });
    TestingContextKeys.isTestCoverageOpen = new RawContextKey('testing.isTestCoverageOpen', false, { type: 'boolean', description: localize('testing.isTestCoverageOpen', 'Indicates whether a test coverage report is open') });
    TestingContextKeys.hasPerTestCoverage = new RawContextKey('testing.hasPerTestCoverage', false, { type: 'boolean', description: localize('testing.hasPerTestCoverage', 'Indicates whether per-test coverage is available') });
    TestingContextKeys.isCoverageFilteredToTest = new RawContextKey('testing.isCoverageFilteredToTest', false, { type: 'boolean', description: localize('testing.isCoverageFilteredToTest', 'Indicates whether coverage has been filterd to a single test') });
    TestingContextKeys.coverageToolbarEnabled = new RawContextKey('testing.coverageToolbarEnabled', true, { type: 'boolean', description: localize('testing.coverageToolbarEnabled', 'Indicates whether the coverage toolbar is enabled') });
    TestingContextKeys.inlineCoverageEnabled = new RawContextKey('testing.inlineCoverageEnabled', false, { type: 'boolean', description: localize('testing.inlineCoverageEnabled', 'Indicates whether inline coverage is shown') });
    TestingContextKeys.canGoToRelatedCode = new RawContextKey('testing.canGoToRelatedCode', false, { type: 'boolean', description: localize('testing.canGoToRelatedCode', 'Whether a controller implements a capability to find code related to a test') });
    TestingContextKeys.canGoToRelatedTest = new RawContextKey('testing.canGoToRelatedTest', false, { type: 'boolean', description: localize('testing.canGoToRelatedTest', 'Whether a controller implements a capability to find tests related to code') });
    TestingContextKeys.peekHasStack = new RawContextKey('testing.peekHasStack', false, { type: 'boolean', description: localize('testing.peekHasStack', 'Whether the message shown in a peek view has a stack trace') });
    TestingContextKeys.capabilityToContextKey = {
        [2 /* TestRunProfileBitset.Run */]: TestingContextKeys.hasRunnableTests,
        [8 /* TestRunProfileBitset.Coverage */]: TestingContextKeys.hasCoverableTests,
        [4 /* TestRunProfileBitset.Debug */]: TestingContextKeys.hasDebuggableTests,
        [16 /* TestRunProfileBitset.HasNonDefaultProfile */]: TestingContextKeys.hasNonDefaultProfile,
        [32 /* TestRunProfileBitset.HasConfigurable */]: TestingContextKeys.hasConfigurableProfile,
        [64 /* TestRunProfileBitset.SupportsContinuousRun */]: TestingContextKeys.supportsContinuousRun,
    };
    TestingContextKeys.hasAnyResults = new RawContextKey('testing.hasAnyResults', false);
    TestingContextKeys.viewMode = new RawContextKey('testing.explorerViewMode', "list" /* TestExplorerViewMode.List */);
    TestingContextKeys.viewSorting = new RawContextKey('testing.explorerViewSorting', "location" /* TestExplorerViewSorting.ByLocation */);
    TestingContextKeys.isRunning = new RawContextKey('testing.isRunning', false);
    TestingContextKeys.isInPeek = new RawContextKey('testing.isInPeek', false);
    TestingContextKeys.isPeekVisible = new RawContextKey('testing.isPeekVisible', false);
    TestingContextKeys.peekItemType = new RawContextKey('peekItemType', undefined, {
        type: 'string',
        description: localize('testing.peekItemType', 'Type of the item in the output peek view. Either a "test", "message", "task", or "result".'),
    });
    TestingContextKeys.controllerId = new RawContextKey('controllerId', undefined, {
        type: 'string',
        description: localize('testing.controllerId', 'Controller ID of the current test item')
    });
    TestingContextKeys.testItemExtId = new RawContextKey('testId', undefined, {
        type: 'string',
        description: localize('testing.testId', 'ID of the current test item, set when creating or opening menus on test items')
    });
    TestingContextKeys.testItemHasUri = new RawContextKey('testing.testItemHasUri', false, {
        type: 'boolean',
        description: localize('testing.testItemHasUri', 'Boolean indicating whether the test item has a URI defined')
    });
    TestingContextKeys.testItemIsHidden = new RawContextKey('testing.testItemIsHidden', false, {
        type: 'boolean',
        description: localize('testing.testItemIsHidden', 'Boolean indicating whether the test item is hidden')
    });
    TestingContextKeys.testMessageContext = new RawContextKey('testMessage', undefined, {
        type: 'string',
        description: localize('testing.testMessage', 'Value set in `testMessage.contextValue`, available in editor/content and testing/message/context')
    });
    TestingContextKeys.testResultOutdated = new RawContextKey('testResultOutdated', undefined, {
        type: 'boolean',
        description: localize('testing.testResultOutdated', 'Value available in editor/content and testing/message/context when the result is outdated')
    });
    TestingContextKeys.testResultState = new RawContextKey('testResultState', undefined, {
        type: 'string',
        description: localize('testing.testResultState', 'Value available testing/item/result indicating the state of the item.')
    });
    TestingContextKeys.testProfileContextGroup = new RawContextKey('testing.profile.context.group', undefined, {
        type: 'string',
        description: localize('testing.profile.context.group', 'Type of menu where the configure testing profile submenu exists. Either "run", "debug", or "coverage"')
    });
})(TestingContextKeys || (TestingContextKeys = {}));
