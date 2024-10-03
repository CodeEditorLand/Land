export const foldSourceAbbr = {
    [0]: ' ',
    [1]: 'u',
    [2]: 'r',
};
export const MAX_FOLDING_REGIONS = 0xFFFF;
export const MAX_LINE_NUMBER = 0xFFFFFF;
const MASK_INDENT = 0xFF000000;
class BitField {
    constructor(size) {
        const numWords = Math.ceil(size / 32);
        this._states = new Uint32Array(numWords);
    }
    get(index) {
        const arrayIndex = (index / 32) | 0;
        const bit = index % 32;
        return (this._states[arrayIndex] & (1 << bit)) !== 0;
    }
    set(index, newState) {
        const arrayIndex = (index / 32) | 0;
        const bit = index % 32;
        const value = this._states[arrayIndex];
        if (newState) {
            this._states[arrayIndex] = value | (1 << bit);
        }
        else {
            this._states[arrayIndex] = value & ~(1 << bit);
        }
    }
}
export class FoldingRegions {
    constructor(startIndexes, endIndexes, types) {
        if (startIndexes.length !== endIndexes.length || startIndexes.length > MAX_FOLDING_REGIONS) {
            throw new Error('invalid startIndexes or endIndexes size');
        }
        this._startIndexes = startIndexes;
        this._endIndexes = endIndexes;
        this._collapseStates = new BitField(startIndexes.length);
        this._userDefinedStates = new BitField(startIndexes.length);
        this._recoveredStates = new BitField(startIndexes.length);
        this._types = types;
        this._parentsComputed = false;
    }
    ensureParentIndices() {
        if (!this._parentsComputed) {
            this._parentsComputed = true;
            const parentIndexes = [];
            const isInsideLast = (startLineNumber, endLineNumber) => {
                const index = parentIndexes[parentIndexes.length - 1];
                return this.getStartLineNumber(index) <= startLineNumber && this.getEndLineNumber(index) >= endLineNumber;
            };
            for (let i = 0, len = this._startIndexes.length; i < len; i++) {
                const startLineNumber = this._startIndexes[i];
                const endLineNumber = this._endIndexes[i];
                if (startLineNumber > MAX_LINE_NUMBER || endLineNumber > MAX_LINE_NUMBER) {
                    throw new Error('startLineNumber or endLineNumber must not exceed ' + MAX_LINE_NUMBER);
                }
                while (parentIndexes.length > 0 && !isInsideLast(startLineNumber, endLineNumber)) {
                    parentIndexes.pop();
                }
                const parentIndex = parentIndexes.length > 0 ? parentIndexes[parentIndexes.length - 1] : -1;
                parentIndexes.push(i);
                this._startIndexes[i] = startLineNumber + ((parentIndex & 0xFF) << 24);
                this._endIndexes[i] = endLineNumber + ((parentIndex & 0xFF00) << 16);
            }
        }
    }
    get length() {
        return this._startIndexes.length;
    }
    getStartLineNumber(index) {
        return this._startIndexes[index] & MAX_LINE_NUMBER;
    }
    getEndLineNumber(index) {
        return this._endIndexes[index] & MAX_LINE_NUMBER;
    }
    getType(index) {
        return this._types ? this._types[index] : undefined;
    }
    hasTypes() {
        return !!this._types;
    }
    isCollapsed(index) {
        return this._collapseStates.get(index);
    }
    setCollapsed(index, newState) {
        this._collapseStates.set(index, newState);
    }
    isUserDefined(index) {
        return this._userDefinedStates.get(index);
    }
    setUserDefined(index, newState) {
        return this._userDefinedStates.set(index, newState);
    }
    isRecovered(index) {
        return this._recoveredStates.get(index);
    }
    setRecovered(index, newState) {
        return this._recoveredStates.set(index, newState);
    }
    getSource(index) {
        if (this.isUserDefined(index)) {
            return 1;
        }
        else if (this.isRecovered(index)) {
            return 2;
        }
        return 0;
    }
    setSource(index, source) {
        if (source === 1) {
            this.setUserDefined(index, true);
            this.setRecovered(index, false);
        }
        else if (source === 2) {
            this.setUserDefined(index, false);
            this.setRecovered(index, true);
        }
        else {
            this.setUserDefined(index, false);
            this.setRecovered(index, false);
        }
    }
    setCollapsedAllOfType(type, newState) {
        let hasChanged = false;
        if (this._types) {
            for (let i = 0; i < this._types.length; i++) {
                if (this._types[i] === type) {
                    this.setCollapsed(i, newState);
                    hasChanged = true;
                }
            }
        }
        return hasChanged;
    }
    toRegion(index) {
        return new FoldingRegion(this, index);
    }
    getParentIndex(index) {
        this.ensureParentIndices();
        const parent = ((this._startIndexes[index] & MASK_INDENT) >>> 24) + ((this._endIndexes[index] & MASK_INDENT) >>> 16);
        if (parent === MAX_FOLDING_REGIONS) {
            return -1;
        }
        return parent;
    }
    contains(index, line) {
        return this.getStartLineNumber(index) <= line && this.getEndLineNumber(index) >= line;
    }
    findIndex(line) {
        let low = 0, high = this._startIndexes.length;
        if (high === 0) {
            return -1;
        }
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (line < this.getStartLineNumber(mid)) {
                high = mid;
            }
            else {
                low = mid + 1;
            }
        }
        return low - 1;
    }
    findRange(line) {
        let index = this.findIndex(line);
        if (index >= 0) {
            const endLineNumber = this.getEndLineNumber(index);
            if (endLineNumber >= line) {
                return index;
            }
            index = this.getParentIndex(index);
            while (index !== -1) {
                if (this.contains(index, line)) {
                    return index;
                }
                index = this.getParentIndex(index);
            }
        }
        return -1;
    }
    toString() {
        const res = [];
        for (let i = 0; i < this.length; i++) {
            res[i] = `[${foldSourceAbbr[this.getSource(i)]}${this.isCollapsed(i) ? '+' : '-'}] ${this.getStartLineNumber(i)}/${this.getEndLineNumber(i)}`;
        }
        return res.join(', ');
    }
    toFoldRange(index) {
        return {
            startLineNumber: this._startIndexes[index] & MAX_LINE_NUMBER,
            endLineNumber: this._endIndexes[index] & MAX_LINE_NUMBER,
            type: this._types ? this._types[index] : undefined,
            isCollapsed: this.isCollapsed(index),
            source: this.getSource(index)
        };
    }
    static fromFoldRanges(ranges) {
        const rangesLength = ranges.length;
        const startIndexes = new Uint32Array(rangesLength);
        const endIndexes = new Uint32Array(rangesLength);
        let types = [];
        let gotTypes = false;
        for (let i = 0; i < rangesLength; i++) {
            const range = ranges[i];
            startIndexes[i] = range.startLineNumber;
            endIndexes[i] = range.endLineNumber;
            types.push(range.type);
            if (range.type) {
                gotTypes = true;
            }
        }
        if (!gotTypes) {
            types = undefined;
        }
        const regions = new FoldingRegions(startIndexes, endIndexes, types);
        for (let i = 0; i < rangesLength; i++) {
            if (ranges[i].isCollapsed) {
                regions.setCollapsed(i, true);
            }
            regions.setSource(i, ranges[i].source);
        }
        return regions;
    }
    static sanitizeAndMerge(rangesA, rangesB, maxLineNumber, selection) {
        maxLineNumber = maxLineNumber ?? Number.MAX_VALUE;
        const getIndexedFunction = (r, limit) => {
            return Array.isArray(r)
                ? ((i) => { return (i < limit) ? r[i] : undefined; })
                : ((i) => { return (i < limit) ? r.toFoldRange(i) : undefined; });
        };
        const getA = getIndexedFunction(rangesA, rangesA.length);
        const getB = getIndexedFunction(rangesB, rangesB.length);
        let indexA = 0;
        let indexB = 0;
        let nextA = getA(0);
        let nextB = getB(0);
        const stackedRanges = [];
        let topStackedRange;
        let prevLineNumber = 0;
        const resultRanges = [];
        while (nextA || nextB) {
            let useRange = undefined;
            if (nextB && (!nextA || nextA.startLineNumber >= nextB.startLineNumber)) {
                if (nextA && nextA.startLineNumber === nextB.startLineNumber) {
                    if (nextB.source === 1) {
                        useRange = nextB;
                    }
                    else {
                        useRange = nextA;
                        useRange.isCollapsed = nextB.isCollapsed && (nextA.endLineNumber === nextB.endLineNumber || !selection?.startsInside(nextA.startLineNumber + 1, nextA.endLineNumber + 1));
                        useRange.source = 0;
                    }
                    nextA = getA(++indexA);
                }
                else {
                    useRange = nextB;
                    if (nextB.isCollapsed && nextB.source === 0) {
                        useRange.source = 2;
                    }
                }
                nextB = getB(++indexB);
            }
            else {
                let scanIndex = indexB;
                let prescanB = nextB;
                while (true) {
                    if (!prescanB || prescanB.startLineNumber > nextA.endLineNumber) {
                        useRange = nextA;
                        break;
                    }
                    if (prescanB.source === 1 && prescanB.endLineNumber > nextA.endLineNumber) {
                        break;
                    }
                    prescanB = getB(++scanIndex);
                }
                nextA = getA(++indexA);
            }
            if (useRange) {
                while (topStackedRange
                    && topStackedRange.endLineNumber < useRange.startLineNumber) {
                    topStackedRange = stackedRanges.pop();
                }
                if (useRange.endLineNumber > useRange.startLineNumber
                    && useRange.startLineNumber > prevLineNumber
                    && useRange.endLineNumber <= maxLineNumber
                    && (!topStackedRange
                        || topStackedRange.endLineNumber >= useRange.endLineNumber)) {
                    resultRanges.push(useRange);
                    prevLineNumber = useRange.startLineNumber;
                    if (topStackedRange) {
                        stackedRanges.push(topStackedRange);
                    }
                    topStackedRange = useRange;
                }
            }
        }
        return resultRanges;
    }
}
export class FoldingRegion {
    constructor(ranges, index) {
        this.ranges = ranges;
        this.index = index;
    }
    get startLineNumber() {
        return this.ranges.getStartLineNumber(this.index);
    }
    get endLineNumber() {
        return this.ranges.getEndLineNumber(this.index);
    }
    get regionIndex() {
        return this.index;
    }
    get parentIndex() {
        return this.ranges.getParentIndex(this.index);
    }
    get isCollapsed() {
        return this.ranges.isCollapsed(this.index);
    }
    containedBy(range) {
        return range.startLineNumber <= this.startLineNumber && range.endLineNumber >= this.endLineNumber;
    }
    containsLine(lineNumber) {
        return this.startLineNumber <= lineNumber && lineNumber <= this.endLineNumber;
    }
    hidesLine(lineNumber) {
        return this.startLineNumber < lineNumber && lineNumber <= this.endLineNumber;
    }
}
