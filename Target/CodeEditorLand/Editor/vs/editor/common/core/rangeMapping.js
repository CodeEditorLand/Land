/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { findLastMonotonous } from '../../../base/common/arraysFind.js';
import { Range } from './range.js';
import { TextLength } from './textLength.js';
/**
 * Represents a list of mappings of ranges from one document to another.
 */
export class RangeMapping {
    constructor(mappings) {
        this.mappings = mappings;
    }
    mapPosition(position) {
        const mapping = findLastMonotonous(this.mappings, m => m.original.getStartPosition().isBeforeOrEqual(position));
        if (!mapping) {
            return PositionOrRange.position(position);
        }
        if (mapping.original.containsPosition(position)) {
            return PositionOrRange.range(mapping.modified);
        }
        const l = TextLength.betweenPositions(mapping.original.getEndPosition(), position);
        return PositionOrRange.position(l.addToPosition(mapping.modified.getEndPosition()));
    }
    mapRange(range) {
        const start = this.mapPosition(range.getStartPosition());
        const end = this.mapPosition(range.getEndPosition());
        return Range.fromPositions(start.range?.getStartPosition() ?? start.position, end.range?.getEndPosition() ?? end.position);
    }
    reverse() {
        return new RangeMapping(this.mappings.map(mapping => mapping.reverse()));
    }
}
export class SingleRangeMapping {
    constructor(original, modified) {
        this.original = original;
        this.modified = modified;
    }
    reverse() {
        return new SingleRangeMapping(this.modified, this.original);
    }
    toString() {
        return `${this.original.toString()} -> ${this.modified.toString()}`;
    }
}
export class PositionOrRange {
    static position(position) {
        return new PositionOrRange(position, undefined);
    }
    static range(range) {
        return new PositionOrRange(undefined, range);
    }
    constructor(position, range) {
        this.position = position;
        this.range = range;
    }
}
