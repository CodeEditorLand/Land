export interface IBufferDirtyTrackerReader {
    readonly dataOffset: number | undefined;
    readonly dirtySize: number | undefined;
    readonly isDirty: boolean;
    clear(): void;
}
export declare class BufferDirtyTracker implements IBufferDirtyTrackerReader {
    private _startIndex;
    private _endIndex;
    get dataOffset(): number | undefined;
    get dirtySize(): number | undefined;
    get isDirty(): boolean;
    flag(index: number, length?: number): number;
    private _flag;
    clear(): void;
}
