export class LinesDiff {
    constructor(changes, moves, hitTimeout) {
        this.changes = changes;
        this.moves = moves;
        this.hitTimeout = hitTimeout;
    }
}
export class MovedText {
    constructor(lineRangeMapping, changes) {
        this.lineRangeMapping = lineRangeMapping;
        this.changes = changes;
    }
    flip() {
        return new MovedText(this.lineRangeMapping.flip(), this.changes.map(c => c.flip()));
    }
}
