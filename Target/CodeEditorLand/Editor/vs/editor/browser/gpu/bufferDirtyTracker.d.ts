export interface IBufferDirtyTrackerReader {
    /**
     * The index of the first dirty index.
     */
    readonly dataOffset: number | undefined;
    /**
     * The index of the last dirty index (inclusive).
     */
    readonly dirtySize: number | undefined;
    /**
     * Whether the buffer is dirty.
     */
    readonly isDirty: boolean;
    /**
     * Clear the dirty state.
     */
    clear(): void;
}
/**
 * A simple tracker for dirty regions in a buffer.
 */
export declare class BufferDirtyTracker implements IBufferDirtyTrackerReader {
    private _startIndex;
    private _endIndex;
    get dataOffset(): number | undefined;
    get dirtySize(): number | undefined;
    get isDirty(): boolean;
    /**
     * Flag the index(es) as modified. Returns the index flagged.
     * @param index An index to flag.
     * @param length An optional length to flag. Defaults to 1.
     */
    flag(index: number, length?: number): number;
    private _flag;
    clear(): void;
}
