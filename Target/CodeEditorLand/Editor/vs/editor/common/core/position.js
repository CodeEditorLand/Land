export class Position {
    constructor(lineNumber, column) {
        this.lineNumber = lineNumber;
        this.column = column;
    }
    with(newLineNumber = this.lineNumber, newColumn = this.column) {
        if (newLineNumber === this.lineNumber && newColumn === this.column) {
            return this;
        }
        else {
            return new Position(newLineNumber, newColumn);
        }
    }
    delta(deltaLineNumber = 0, deltaColumn = 0) {
        return this.with(this.lineNumber + deltaLineNumber, this.column + deltaColumn);
    }
    equals(other) {
        return Position.equals(this, other);
    }
    static equals(a, b) {
        if (!a && !b) {
            return true;
        }
        return (!!a &&
            !!b &&
            a.lineNumber === b.lineNumber &&
            a.column === b.column);
    }
    isBefore(other) {
        return Position.isBefore(this, other);
    }
    static isBefore(a, b) {
        if (a.lineNumber < b.lineNumber) {
            return true;
        }
        if (b.lineNumber < a.lineNumber) {
            return false;
        }
        return a.column < b.column;
    }
    isBeforeOrEqual(other) {
        return Position.isBeforeOrEqual(this, other);
    }
    static isBeforeOrEqual(a, b) {
        if (a.lineNumber < b.lineNumber) {
            return true;
        }
        if (b.lineNumber < a.lineNumber) {
            return false;
        }
        return a.column <= b.column;
    }
    static compare(a, b) {
        const aLineNumber = a.lineNumber | 0;
        const bLineNumber = b.lineNumber | 0;
        if (aLineNumber === bLineNumber) {
            const aColumn = a.column | 0;
            const bColumn = b.column | 0;
            return aColumn - bColumn;
        }
        return aLineNumber - bLineNumber;
    }
    clone() {
        return new Position(this.lineNumber, this.column);
    }
    toString() {
        return '(' + this.lineNumber + ',' + this.column + ')';
    }
    static lift(pos) {
        return new Position(pos.lineNumber, pos.column);
    }
    static isIPosition(obj) {
        return (obj
            && (typeof obj.lineNumber === 'number')
            && (typeof obj.column === 'number'));
    }
    toJSON() {
        return {
            lineNumber: this.lineNumber,
            column: this.column
        };
    }
}
