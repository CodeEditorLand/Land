export class LinePart {
    constructor(endIndex, type, metadata, containsRTL) {
        this.endIndex = endIndex;
        this.type = type;
        this.metadata = metadata;
        this.containsRTL = containsRTL;
        this._linePartBrand = undefined;
    }
    isWhitespace() {
        return (this.metadata & 1 ? true : false);
    }
    isPseudoAfter() {
        return (this.metadata & 4 ? true : false);
    }
}
