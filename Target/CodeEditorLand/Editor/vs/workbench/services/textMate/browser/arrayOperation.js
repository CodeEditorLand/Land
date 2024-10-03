import { compareBy, numberComparator } from '../../../../base/common/arrays.js';
export class ArrayEdit {
    constructor(edits) {
        this.edits = edits.slice().sort(compareBy(c => c.offset, numberComparator));
    }
    applyToArray(array) {
        for (let i = this.edits.length - 1; i >= 0; i--) {
            const c = this.edits[i];
            array.splice(c.offset, c.length, ...new Array(c.newLength));
        }
    }
}
export class SingleArrayEdit {
    constructor(offset, length, newLength) {
        this.offset = offset;
        this.length = length;
        this.newLength = newLength;
    }
    toString() {
        return `[${this.offset}, +${this.length}) -> +${this.newLength}}`;
    }
}
export class MonotonousIndexTransformer {
    static fromMany(transformations) {
        const transformers = transformations.map(t => new MonotonousIndexTransformer(t));
        return new CombinedIndexTransformer(transformers);
    }
    constructor(transformation) {
        this.transformation = transformation;
        this.idx = 0;
        this.offset = 0;
    }
    transform(index) {
        let nextChange = this.transformation.edits[this.idx];
        while (nextChange && nextChange.offset + nextChange.length <= index) {
            this.offset += nextChange.newLength - nextChange.length;
            this.idx++;
            nextChange = this.transformation.edits[this.idx];
        }
        if (nextChange && nextChange.offset <= index) {
            return undefined;
        }
        return index + this.offset;
    }
}
export class CombinedIndexTransformer {
    constructor(transformers) {
        this.transformers = transformers;
    }
    transform(index) {
        for (const transformer of this.transformers) {
            const result = transformer.transform(index);
            if (result === undefined) {
                return undefined;
            }
            index = result;
        }
        return index;
    }
}
