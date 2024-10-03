import { TestResultState } from './testTypes.js';
export interface IComputedStateAccessor<T> {
    getOwnState(item: T): TestResultState | undefined;
    getCurrentComputedState(item: T): TestResultState;
    setComputedState(item: T, state: TestResultState): void;
    getChildren(item: T): Iterable<T>;
    getParents(item: T): Iterable<T>;
}
export interface IComputedStateAndDurationAccessor<T> extends IComputedStateAccessor<T> {
    getOwnDuration(item: T): number | undefined;
    getCurrentComputedDuration(item: T): number | undefined;
    setComputedDuration(item: T, duration: number | undefined): void;
}
export declare const refreshComputedState: <T extends object>(accessor: IComputedStateAccessor<T>, node: T, explicitNewComputedState?: TestResultState, refreshDuration?: boolean) => Set<T>;
