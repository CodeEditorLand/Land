import { TestResultState } from './testTypes.js';
export type TreeStateNode = {
    statusNode: true;
    state: TestResultState;
    priority: number;
};
/**
 * List of display priorities for different run states. When tests update,
 * the highest-priority state from any of their children will be the state
 * reflected in the parent node.
 */
export declare const statePriority: {
    [K in TestResultState]: number;
};
export declare const isFailedState: (s: TestResultState) => s is TestResultState.Failed | TestResultState.Errored;
export declare const isStateWithResult: (s: TestResultState) => s is TestResultState.Passed | TestResultState.Failed | TestResultState.Errored;
export declare const stateNodes: {
    [K in TestResultState]: TreeStateNode;
};
export declare const cmpPriority: (a: TestResultState, b: TestResultState) => number;
export declare const maxPriority: (...states: TestResultState[]) => TestResultState | undefined;
export declare const statesInOrder: TestResultState[];
/**
 * Some states are considered terminal; once these are set for a given test run, they
 * are not reset back to a non-terminal state, or to a terminal state with lower
 * priority.
 */
export declare const terminalStatePriorities: {
    [key in TestResultState]?: number;
};
/**
 * Count of the number of tests in each run state.
 */
export type TestStateCount = {
    [K in TestResultState]: number;
};
export declare const makeEmptyCounts: () => TestStateCount;
