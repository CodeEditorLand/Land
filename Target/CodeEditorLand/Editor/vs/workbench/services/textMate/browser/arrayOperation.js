/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { compareBy, numberComparator } from '../../../../base/common/arrays.js';
export class ArrayEdit {
    constructor(
    /**
     * Disjoint edits that are applied in parallel
     */
    edits) {
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
/**
 * Can only be called with increasing values of `index`.
*/
export class MonotonousIndexTransformer {
    static fromMany(transformations) {
        // TODO improve performance by combining transformations first
        const transformers = transformations.map(t => new MonotonousIndexTransformer(t));
        return new CombinedIndexTransformer(transformers);
    }
    constructor(transformation) {
        this.transformation = transformation;
        this.idx = 0;
        this.offset = 0;
    }
    /**
     * Precondition: index >= previous-value-of(index).
     */
    transform(index) {
        let nextChange = this.transformation.edits[this.idx];
        while (nextChange && nextChange.offset + nextChange.length <= index) {
            this.offset += nextChange.newLength - nextChange.length;
            this.idx++;
            nextChange = this.transformation.edits[this.idx];
        }
        // assert nextChange === undefined || index < nextChange.offset + nextChange.length
        if (nextChange && nextChange.offset <= index) {
            // Offset is touched by the change
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
