/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { stripIcons } from '../../../../base/common/iconLabels.js';
import { localize } from '../../../../nls.js';
const testStateNames = {
    [6 /* TestResultState.Errored */]: localize('testState.errored', 'Errored'),
    [4 /* TestResultState.Failed */]: localize('testState.failed', 'Failed'),
    [3 /* TestResultState.Passed */]: localize('testState.passed', 'Passed'),
    [1 /* TestResultState.Queued */]: localize('testState.queued', 'Queued'),
    [2 /* TestResultState.Running */]: localize('testState.running', 'Running'),
    [5 /* TestResultState.Skipped */]: localize('testState.skipped', 'Skipped'),
    [0 /* TestResultState.Unset */]: localize('testState.unset', 'Not yet run'),
};
export const labelForTestInState = (label, state) => localize({
    key: 'testing.treeElementLabel',
    comment: ['label then the unit tests state, for example "Addition Tests (Running)"'],
}, '{0} ({1})', stripIcons(label), testStateNames[state]);
export const testConfigurationGroupNames = {
    [4 /* TestRunProfileBitset.Debug */]: localize('testGroup.debug', 'Debug'),
    [2 /* TestRunProfileBitset.Run */]: localize('testGroup.run', 'Run'),
    [8 /* TestRunProfileBitset.Coverage */]: localize('testGroup.coverage', 'Coverage'),
};
