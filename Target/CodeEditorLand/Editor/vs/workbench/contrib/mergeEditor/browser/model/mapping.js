import { compareBy, numberComparator } from '../../../../../base/common/arrays.js';
import { findLast } from '../../../../../base/common/arraysFind.js';
import { assertFn, checkAdjacentItems } from '../../../../../base/common/assert.js';
import { BugIndicatingError } from '../../../../../base/common/errors.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { concatArrays } from '../utils.js';
import { LineRangeEdit } from './editing.js';
import { LineRange } from './lineRange.js';
import { addLength, lengthBetweenPositions, rangeContainsPosition, rangeIsBeforeOrTouching } from './rangeUtils.js';
export class LineRangeMapping {
    static join(mappings) {
        return mappings.reduce((acc, cur) => acc ? acc.join(cur) : cur, undefined);
    }
    constructor(inputRange, outputRange) {
        this.inputRange = inputRange;
        this.outputRange = outputRange;
    }
    extendInputRange(extendedInputRange) {
        if (!extendedInputRange.containsRange(this.inputRange)) {
            throw new BugIndicatingError();
        }
        const startDelta = extendedInputRange.startLineNumber - this.inputRange.startLineNumber;
        const endDelta = extendedInputRange.endLineNumberExclusive - this.inputRange.endLineNumberExclusive;
        return new LineRangeMapping(extendedInputRange, new LineRange(this.outputRange.startLineNumber + startDelta, this.outputRange.lineCount - startDelta + endDelta));
    }
    join(other) {
        return new LineRangeMapping(this.inputRange.join(other.inputRange), this.outputRange.join(other.outputRange));
    }
    get resultingDeltaFromOriginalToModified() {
        return this.outputRange.endLineNumberExclusive - this.inputRange.endLineNumberExclusive;
    }
    toString() {
        return `${this.inputRange.toString()} -> ${this.outputRange.toString()}`;
    }
    addOutputLineDelta(delta) {
        return new LineRangeMapping(this.inputRange, this.outputRange.delta(delta));
    }
    addInputLineDelta(delta) {
        return new LineRangeMapping(this.inputRange.delta(delta), this.outputRange);
    }
    reverse() {
        return new LineRangeMapping(this.outputRange, this.inputRange);
    }
}
export class DocumentLineRangeMap {
    static betweenOutputs(inputToOutput1, inputToOutput2, inputLineCount) {
        const alignments = MappingAlignment.compute(inputToOutput1, inputToOutput2);
        const mappings = alignments.map((m) => new LineRangeMapping(m.output1Range, m.output2Range));
        return new DocumentLineRangeMap(mappings, inputLineCount);
    }
    constructor(lineRangeMappings, inputLineCount) {
        this.lineRangeMappings = lineRangeMappings;
        this.inputLineCount = inputLineCount;
        assertFn(() => {
            return checkAdjacentItems(lineRangeMappings, (m1, m2) => m1.inputRange.isBefore(m2.inputRange) && m1.outputRange.isBefore(m2.outputRange) &&
                m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive);
        });
    }
    project(lineNumber) {
        const lastBefore = findLast(this.lineRangeMappings, r => r.inputRange.startLineNumber <= lineNumber);
        if (!lastBefore) {
            return new LineRangeMapping(new LineRange(lineNumber, 1), new LineRange(lineNumber, 1));
        }
        if (lastBefore.inputRange.contains(lineNumber)) {
            return lastBefore;
        }
        const containingRange = new LineRange(lineNumber, 1);
        const mappedRange = new LineRange(lineNumber +
            lastBefore.outputRange.endLineNumberExclusive -
            lastBefore.inputRange.endLineNumberExclusive, 1);
        return new LineRangeMapping(containingRange, mappedRange);
    }
    get outputLineCount() {
        const last = this.lineRangeMappings.at(-1);
        const diff = last ? last.outputRange.endLineNumberExclusive - last.inputRange.endLineNumberExclusive : 0;
        return this.inputLineCount + diff;
    }
    reverse() {
        return new DocumentLineRangeMap(this.lineRangeMappings.map(r => r.reverse()), this.outputLineCount);
    }
}
export class MappingAlignment {
    static compute(fromInputToOutput1, fromInputToOutput2) {
        const compareByStartLineNumber = compareBy((d) => d.inputRange.startLineNumber, numberComparator);
        const combinedDiffs = concatArrays(fromInputToOutput1.map((diff) => ({ source: 0, diff })), fromInputToOutput2.map((diff) => ({ source: 1, diff }))).sort(compareBy((d) => d.diff, compareByStartLineNumber));
        const currentDiffs = [new Array(), new Array()];
        const deltaFromBaseToInput = [0, 0];
        const alignments = new Array();
        function pushAndReset(inputRange) {
            const mapping1 = LineRangeMapping.join(currentDiffs[0]) || new LineRangeMapping(inputRange, inputRange.delta(deltaFromBaseToInput[0]));
            const mapping2 = LineRangeMapping.join(currentDiffs[1]) || new LineRangeMapping(inputRange, inputRange.delta(deltaFromBaseToInput[1]));
            alignments.push(new MappingAlignment(currentInputRange, mapping1.extendInputRange(currentInputRange).outputRange, currentDiffs[0], mapping2.extendInputRange(currentInputRange).outputRange, currentDiffs[1]));
            currentDiffs[0] = [];
            currentDiffs[1] = [];
        }
        let currentInputRange;
        for (const diff of combinedDiffs) {
            const range = diff.diff.inputRange;
            if (currentInputRange && !currentInputRange.touches(range)) {
                pushAndReset(currentInputRange);
                currentInputRange = undefined;
            }
            deltaFromBaseToInput[diff.source] =
                diff.diff.resultingDeltaFromOriginalToModified;
            currentInputRange = currentInputRange ? currentInputRange.join(range) : range;
            currentDiffs[diff.source].push(diff.diff);
        }
        if (currentInputRange) {
            pushAndReset(currentInputRange);
        }
        return alignments;
    }
    constructor(inputRange, output1Range, output1LineMappings, output2Range, output2LineMappings) {
        this.inputRange = inputRange;
        this.output1Range = output1Range;
        this.output1LineMappings = output1LineMappings;
        this.output2Range = output2Range;
        this.output2LineMappings = output2LineMappings;
    }
    toString() {
        return `${this.output1Range} <- ${this.inputRange} -> ${this.output2Range}`;
    }
}
export class DetailedLineRangeMapping extends LineRangeMapping {
    static join(mappings) {
        return mappings.reduce((acc, cur) => acc ? acc.join(cur) : cur, undefined);
    }
    constructor(inputRange, inputTextModel, outputRange, outputTextModel, rangeMappings) {
        super(inputRange, outputRange);
        this.inputTextModel = inputTextModel;
        this.outputTextModel = outputTextModel;
        this.rangeMappings = rangeMappings || [new RangeMapping(this.inputRange.toRange(), this.outputRange.toRange())];
    }
    addOutputLineDelta(delta) {
        return new DetailedLineRangeMapping(this.inputRange, this.inputTextModel, this.outputRange.delta(delta), this.outputTextModel, this.rangeMappings.map(d => d.addOutputLineDelta(delta)));
    }
    addInputLineDelta(delta) {
        return new DetailedLineRangeMapping(this.inputRange.delta(delta), this.inputTextModel, this.outputRange, this.outputTextModel, this.rangeMappings.map(d => d.addInputLineDelta(delta)));
    }
    join(other) {
        return new DetailedLineRangeMapping(this.inputRange.join(other.inputRange), this.inputTextModel, this.outputRange.join(other.outputRange), this.outputTextModel);
    }
    getLineEdit() {
        return new LineRangeEdit(this.inputRange, this.getOutputLines());
    }
    getReverseLineEdit() {
        return new LineRangeEdit(this.outputRange, this.getInputLines());
    }
    getOutputLines() {
        return this.outputRange.getLines(this.outputTextModel);
    }
    getInputLines() {
        return this.inputRange.getLines(this.inputTextModel);
    }
}
export class RangeMapping {
    constructor(inputRange, outputRange) {
        this.inputRange = inputRange;
        this.outputRange = outputRange;
    }
    toString() {
        function rangeToString(range) {
            return `[${range.startLineNumber}:${range.startColumn}, ${range.endLineNumber}:${range.endColumn})`;
        }
        return `${rangeToString(this.inputRange)} -> ${rangeToString(this.outputRange)}`;
    }
    addOutputLineDelta(deltaLines) {
        return new RangeMapping(this.inputRange, new Range(this.outputRange.startLineNumber + deltaLines, this.outputRange.startColumn, this.outputRange.endLineNumber + deltaLines, this.outputRange.endColumn));
    }
    addInputLineDelta(deltaLines) {
        return new RangeMapping(new Range(this.inputRange.startLineNumber + deltaLines, this.inputRange.startColumn, this.inputRange.endLineNumber + deltaLines, this.inputRange.endColumn), this.outputRange);
    }
    reverse() {
        return new RangeMapping(this.outputRange, this.inputRange);
    }
}
export class DocumentRangeMap {
    constructor(rangeMappings, inputLineCount) {
        this.rangeMappings = rangeMappings;
        this.inputLineCount = inputLineCount;
        assertFn(() => checkAdjacentItems(rangeMappings, (m1, m2) => rangeIsBeforeOrTouching(m1.inputRange, m2.inputRange) &&
            rangeIsBeforeOrTouching(m1.outputRange, m2.outputRange)));
    }
    project(position) {
        const lastBefore = findLast(this.rangeMappings, r => r.inputRange.getStartPosition().isBeforeOrEqual(position));
        if (!lastBefore) {
            return new RangeMapping(Range.fromPositions(position, position), Range.fromPositions(position, position));
        }
        if (rangeContainsPosition(lastBefore.inputRange, position)) {
            return lastBefore;
        }
        const dist = lengthBetweenPositions(lastBefore.inputRange.getEndPosition(), position);
        const outputPos = addLength(lastBefore.outputRange.getEndPosition(), dist);
        return new RangeMapping(Range.fromPositions(position), Range.fromPositions(outputPos));
    }
    projectRange(range) {
        const start = this.project(range.getStartPosition());
        const end = this.project(range.getEndPosition());
        return new RangeMapping(start.inputRange.plusRange(end.inputRange), start.outputRange.plusRange(end.outputRange));
    }
    get outputLineCount() {
        const last = this.rangeMappings.at(-1);
        const diff = last ? last.outputRange.endLineNumber - last.inputRange.endLineNumber : 0;
        return this.inputLineCount + diff;
    }
    reverse() {
        return new DocumentRangeMap(this.rangeMappings.map(m => m.reverse()), this.outputLineCount);
    }
}
