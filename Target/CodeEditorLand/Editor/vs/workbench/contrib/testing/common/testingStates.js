/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { mapValues } from '../../../../base/common/objects.js';
/**
 * List of display priorities for different run states. When tests update,
 * the highest-priority state from any of their children will be the state
 * reflected in the parent node.
 */
export const statePriority = {
    [2 /* TestResultState.Running */]: 6,
    [6 /* TestResultState.Errored */]: 5,
    [4 /* TestResultState.Failed */]: 4,
    [1 /* TestResultState.Queued */]: 3,
    [3 /* TestResultState.Passed */]: 2,
    [0 /* TestResultState.Unset */]: 0,
    [5 /* TestResultState.Skipped */]: 1,
};
export const isFailedState = (s) => s === 6 /* TestResultState.Errored */ || s === 4 /* TestResultState.Failed */;
export const isStateWithResult = (s) => s === 6 /* TestResultState.Errored */ || s === 4 /* TestResultState.Failed */ || s === 3 /* TestResultState.Passed */;
export const stateNodes = mapValues(statePriority, (priority, stateStr) => {
    const state = Number(stateStr);
    return { statusNode: true, state, priority };
});
export const cmpPriority = (a, b) => statePriority[b] - statePriority[a];
export const maxPriority = (...states) => {
    switch (states.length) {
        case 0:
            return 0 /* TestResultState.Unset */;
        case 1:
            return states[0];
        case 2:
            return statePriority[states[0]] > statePriority[states[1]] ? states[0] : states[1];
        default: {
            let max = states[0];
            for (let i = 1; i < states.length; i++) {
                if (statePriority[max] < statePriority[states[i]]) {
                    max = states[i];
                }
            }
            return max;
        }
    }
};
export const statesInOrder = Object.keys(statePriority).map(s => Number(s)).sort(cmpPriority);
/**
 * Some states are considered terminal; once these are set for a given test run, they
 * are not reset back to a non-terminal state, or to a terminal state with lower
 * priority.
 */
export const terminalStatePriorities = {
    [3 /* TestResultState.Passed */]: 0,
    [5 /* TestResultState.Skipped */]: 1,
    [4 /* TestResultState.Failed */]: 2,
    [6 /* TestResultState.Errored */]: 3,
};
export const makeEmptyCounts = () => {
    // shh! don't tell anyone this is actually an array!
    return new Uint32Array(statesInOrder.length);
};
