export declare class DiffChange {
    originalStart: number;
    originalLength: number;
    modifiedStart: number;
    modifiedLength: number;
    constructor(originalStart: number, originalLength: number, modifiedStart: number, modifiedLength: number);
    getOriginalEnd(): number;
    getModifiedEnd(): number;
}
