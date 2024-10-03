import { mapValues } from '../../../../base/common/objects.js';
export const statePriority = {
    [2]: 6,
    [6]: 5,
    [4]: 4,
    [1]: 3,
    [3]: 2,
    [0]: 0,
    [5]: 1,
};
export const isFailedState = (s) => s === 6 || s === 4;
export const isStateWithResult = (s) => s === 6 || s === 4 || s === 3;
export const stateNodes = mapValues(statePriority, (priority, stateStr) => {
    const state = Number(stateStr);
    return { statusNode: true, state, priority };
});
export const cmpPriority = (a, b) => statePriority[b] - statePriority[a];
export const maxPriority = (...states) => {
    switch (states.length) {
        case 0:
            return 0;
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
export const terminalStatePriorities = {
    [3]: 0,
    [5]: 1,
    [4]: 2,
    [6]: 3,
};
export const makeEmptyCounts = () => {
    return new Uint32Array(statesInOrder.length);
};
