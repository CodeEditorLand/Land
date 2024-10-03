export declare class ReentrancyBarrier {
    private _isOccupied;
    runExclusivelyOrSkip(runner: () => void): void;
    runExclusivelyOrThrow(runner: () => void): void;
    get isOccupied(): boolean;
    makeExclusiveOrSkip<TFunction extends Function>(fn: TFunction): TFunction;
}
