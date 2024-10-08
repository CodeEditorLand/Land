/**
 * Prevents code from being re-entrant.
*/
export declare class ReentrancyBarrier {
    private _isOccupied;
    /**
     * Calls `runner` if the barrier is not occupied.
     * During the call, the barrier becomes occupied.
     */
    runExclusivelyOrSkip(runner: () => void): void;
    /**
     * Calls `runner`. If the barrier is occupied, throws an error.
     * During the call, the barrier becomes active.
     */
    runExclusivelyOrThrow(runner: () => void): void;
    /**
     * Indicates if some runner occupies this barrier.
    */
    get isOccupied(): boolean;
    makeExclusiveOrSkip<TFunction extends Function>(fn: TFunction): TFunction;
}
