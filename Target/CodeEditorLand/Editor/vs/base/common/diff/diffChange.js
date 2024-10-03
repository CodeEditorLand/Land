export class DiffChange {
    constructor(originalStart, originalLength, modifiedStart, modifiedLength) {
        this.originalStart = originalStart;
        this.originalLength = originalLength;
        this.modifiedStart = modifiedStart;
        this.modifiedLength = modifiedLength;
    }
    getOriginalEnd() {
        return this.originalStart + this.originalLength;
    }
    getModifiedEnd() {
        return this.modifiedStart + this.modifiedLength;
    }
}
