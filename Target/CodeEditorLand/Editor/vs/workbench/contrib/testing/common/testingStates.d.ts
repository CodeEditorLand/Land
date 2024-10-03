import { TestResultState } from './testTypes.js';
export type TreeStateNode = {
    statusNode: true;
    state: TestResultState;
    priority: number;
};
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
export declare const terminalStatePriorities: {
    [key in TestResultState]?: number;
};
export type TestStateCount = {
    [K in TestResultState]: number;
};
export declare const makeEmptyCounts: () => TestStateCount;
