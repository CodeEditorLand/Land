import { TestResultState } from './testTypes.js';
/**
 * Accessor for nodes in get and refresh computed state.
 */
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
/**
 * Refreshes the computed state for the node and its parents. Any changes
 * elements cause `addUpdated` to be called.
 */
export declare const refreshComputedState: <T extends object>(accessor: IComputedStateAccessor<T>, node: T, explicitNewComputedState?: TestResultState, refreshDuration?: boolean) => Set<T>;
