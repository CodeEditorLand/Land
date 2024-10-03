import { stripIcons } from '../../../../base/common/iconLabels.js';
import { localize } from '../../../../nls.js';
const testStateNames = {
    [6]: localize('testState.errored', 'Errored'),
    [4]: localize('testState.failed', 'Failed'),
    [3]: localize('testState.passed', 'Passed'),
    [1]: localize('testState.queued', 'Queued'),
    [2]: localize('testState.running', 'Running'),
    [5]: localize('testState.skipped', 'Skipped'),
    [0]: localize('testState.unset', 'Not yet run'),
};
export const labelForTestInState = (label, state) => localize({
    key: 'testing.treeElementLabel',
    comment: ['label then the unit tests state, for example "Addition Tests (Running)"'],
}, '{0} ({1})', stripIcons(label), testStateNames[state]);
export const testConfigurationGroupNames = {
    [4]: localize('testGroup.debug', 'Debug'),
    [2]: localize('testGroup.run', 'Run'),
    [8]: localize('testGroup.coverage', 'Coverage'),
};
