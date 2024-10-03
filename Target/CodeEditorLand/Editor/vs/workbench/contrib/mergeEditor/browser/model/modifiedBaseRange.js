import { compareBy, equals, numberComparator, tieBreakComparators } from '../../../../../base/common/arrays.js';
import { BugIndicatingError } from '../../../../../base/common/errors.js';
import { splitLines } from '../../../../../base/common/strings.js';
import { Position } from '../../../../../editor/common/core/position.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { LineRangeEdit, RangeEdit } from './editing.js';
import { DetailedLineRangeMapping, MappingAlignment } from './mapping.js';
import { concatArrays } from '../utils.js';
export class ModifiedBaseRange {
    static fromDiffs(diffs1, diffs2, baseTextModel, input1TextModel, input2TextModel) {
        const alignments = MappingAlignment.compute(diffs1, diffs2);
        return alignments.map((a) => new ModifiedBaseRange(a.inputRange, baseTextModel, a.output1Range, input1TextModel, a.output1LineMappings, a.output2Range, input2TextModel, a.output2LineMappings));
    }
    constructor(baseRange, baseTextModel, input1Range, input1TextModel, input1Diffs, input2Range, input2TextModel, input2Diffs) {
        this.baseRange = baseRange;
        this.baseTextModel = baseTextModel;
        this.input1Range = input1Range;
        this.input1TextModel = input1TextModel;
        this.input1Diffs = input1Diffs;
        this.input2Range = input2Range;
        this.input2TextModel = input2TextModel;
        this.input2Diffs = input2Diffs;
        this.input1CombinedDiff = DetailedLineRangeMapping.join(this.input1Diffs);
        this.input2CombinedDiff = DetailedLineRangeMapping.join(this.input2Diffs);
        this.isEqualChange = equals(this.input1Diffs, this.input2Diffs, (a, b) => a.getLineEdit().equals(b.getLineEdit()));
        this.smartInput1LineRangeEdit = null;
        this.smartInput2LineRangeEdit = null;
        this.dumbInput1LineRangeEdit = null;
        this.dumbInput2LineRangeEdit = null;
        if (this.input1Diffs.length === 0 && this.input2Diffs.length === 0) {
            throw new BugIndicatingError('must have at least one diff');
        }
    }
    getInputRange(inputNumber) {
        return inputNumber === 1 ? this.input1Range : this.input2Range;
    }
    getInputCombinedDiff(inputNumber) {
        return inputNumber === 1 ? this.input1CombinedDiff : this.input2CombinedDiff;
    }
    getInputDiffs(inputNumber) {
        return inputNumber === 1 ? this.input1Diffs : this.input2Diffs;
    }
    get isConflicting() {
        return this.input1Diffs.length > 0 && this.input2Diffs.length > 0;
    }
    get canBeCombined() {
        return this.smartCombineInputs(1) !== undefined;
    }
    get isOrderRelevant() {
        const input1 = this.smartCombineInputs(1);
        const input2 = this.smartCombineInputs(2);
        if (!input1 || !input2) {
            return false;
        }
        return !input1.equals(input2);
    }
    getEditForBase(state) {
        const diffs = [];
        if (state.includesInput1 && this.input1CombinedDiff) {
            diffs.push({ diff: this.input1CombinedDiff, inputNumber: 1 });
        }
        if (state.includesInput2 && this.input2CombinedDiff) {
            diffs.push({ diff: this.input2CombinedDiff, inputNumber: 2 });
        }
        if (diffs.length === 0) {
            return { edit: undefined, effectiveState: ModifiedBaseRangeState.base };
        }
        if (diffs.length === 1) {
            return { edit: diffs[0].diff.getLineEdit(), effectiveState: ModifiedBaseRangeState.base.withInputValue(diffs[0].inputNumber, true, false) };
        }
        if (state.kind !== ModifiedBaseRangeStateKind.both) {
            throw new BugIndicatingError();
        }
        const smartCombinedEdit = state.smartCombination ? this.smartCombineInputs(state.firstInput) : this.dumbCombineInputs(state.firstInput);
        if (smartCombinedEdit) {
            return { edit: smartCombinedEdit, effectiveState: state };
        }
        return {
            edit: diffs[getOtherInputNumber(state.firstInput) - 1].diff.getLineEdit(),
            effectiveState: ModifiedBaseRangeState.base.withInputValue(getOtherInputNumber(state.firstInput), true, false),
        };
    }
    smartCombineInputs(firstInput) {
        if (firstInput === 1 && this.smartInput1LineRangeEdit !== null) {
            return this.smartInput1LineRangeEdit;
        }
        else if (firstInput === 2 && this.smartInput2LineRangeEdit !== null) {
            return this.smartInput2LineRangeEdit;
        }
        const combinedDiffs = concatArrays(this.input1Diffs.flatMap((diffs) => diffs.rangeMappings.map((diff) => ({ diff, input: 1 }))), this.input2Diffs.flatMap((diffs) => diffs.rangeMappings.map((diff) => ({ diff, input: 2 })))).sort(tieBreakComparators(compareBy((d) => d.diff.inputRange, Range.compareRangesUsingStarts), compareBy((d) => (d.input === firstInput ? 1 : 2), numberComparator)));
        const sortedEdits = combinedDiffs.map(d => {
            const sourceTextModel = d.input === 1 ? this.input1TextModel : this.input2TextModel;
            return new RangeEdit(d.diff.inputRange, sourceTextModel.getValueInRange(d.diff.outputRange));
        });
        const result = editsToLineRangeEdit(this.baseRange, sortedEdits, this.baseTextModel);
        if (firstInput === 1) {
            this.smartInput1LineRangeEdit = result;
        }
        else {
            this.smartInput2LineRangeEdit = result;
        }
        return result;
    }
    dumbCombineInputs(firstInput) {
        if (firstInput === 1 && this.dumbInput1LineRangeEdit !== null) {
            return this.dumbInput1LineRangeEdit;
        }
        else if (firstInput === 2 && this.dumbInput2LineRangeEdit !== null) {
            return this.dumbInput2LineRangeEdit;
        }
        let input1Lines = this.input1Range.getLines(this.input1TextModel);
        let input2Lines = this.input2Range.getLines(this.input2TextModel);
        if (firstInput === 2) {
            [input1Lines, input2Lines] = [input2Lines, input1Lines];
        }
        const result = new LineRangeEdit(this.baseRange, input1Lines.concat(input2Lines));
        if (firstInput === 1) {
            this.dumbInput1LineRangeEdit = result;
        }
        else {
            this.dumbInput2LineRangeEdit = result;
        }
        return result;
    }
}
function editsToLineRangeEdit(range, sortedEdits, textModel) {
    let text = '';
    const startsLineBefore = range.startLineNumber > 1;
    let currentPosition = startsLineBefore
        ? new Position(range.startLineNumber - 1, textModel.getLineMaxColumn(range.startLineNumber - 1))
        : new Position(range.startLineNumber, 1);
    for (const edit of sortedEdits) {
        const diffStart = edit.range.getStartPosition();
        if (!currentPosition.isBeforeOrEqual(diffStart)) {
            return undefined;
        }
        let originalText = textModel.getValueInRange(Range.fromPositions(currentPosition, diffStart));
        if (diffStart.lineNumber > textModel.getLineCount()) {
            originalText += '\n';
        }
        text += originalText;
        text += edit.newText;
        currentPosition = edit.range.getEndPosition();
    }
    const endsLineAfter = range.endLineNumberExclusive <= textModel.getLineCount();
    const end = endsLineAfter ? new Position(range.endLineNumberExclusive, 1) : new Position(range.endLineNumberExclusive - 1, 1073741824);
    const originalText = textModel.getValueInRange(Range.fromPositions(currentPosition, end));
    text += originalText;
    const lines = splitLines(text);
    if (startsLineBefore) {
        if (lines[0] !== '') {
            return undefined;
        }
        lines.shift();
    }
    if (endsLineAfter) {
        if (lines[lines.length - 1] !== '') {
            return undefined;
        }
        lines.pop();
    }
    return new LineRangeEdit(range, lines);
}
export var ModifiedBaseRangeStateKind;
(function (ModifiedBaseRangeStateKind) {
    ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["base"] = 0] = "base";
    ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["input1"] = 1] = "input1";
    ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["input2"] = 2] = "input2";
    ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["both"] = 3] = "both";
    ModifiedBaseRangeStateKind[ModifiedBaseRangeStateKind["unrecognized"] = 4] = "unrecognized";
})(ModifiedBaseRangeStateKind || (ModifiedBaseRangeStateKind = {}));
export function getOtherInputNumber(inputNumber) {
    return inputNumber === 1 ? 2 : 1;
}
export class AbstractModifiedBaseRangeState {
    constructor() { }
    get includesInput1() { return false; }
    get includesInput2() { return false; }
    includesInput(inputNumber) {
        return inputNumber === 1 ? this.includesInput1 : this.includesInput2;
    }
    isInputIncluded(inputNumber) {
        return inputNumber === 1 ? this.includesInput1 : this.includesInput2;
    }
    toggle(inputNumber) {
        return this.withInputValue(inputNumber, !this.includesInput(inputNumber), true);
    }
    getInput(inputNumber) {
        if (!this.isInputIncluded(inputNumber)) {
            return 0;
        }
        return 1;
    }
}
export class ModifiedBaseRangeStateBase extends AbstractModifiedBaseRangeState {
    get kind() { return ModifiedBaseRangeStateKind.base; }
    toString() { return 'base'; }
    swap() { return this; }
    withInputValue(inputNumber, value, smartCombination = false) {
        if (inputNumber === 1) {
            return value ? new ModifiedBaseRangeStateInput1() : this;
        }
        else {
            return value ? new ModifiedBaseRangeStateInput2() : this;
        }
    }
    equals(other) {
        return other.kind === ModifiedBaseRangeStateKind.base;
    }
}
export class ModifiedBaseRangeStateInput1 extends AbstractModifiedBaseRangeState {
    get kind() { return ModifiedBaseRangeStateKind.input1; }
    get includesInput1() { return true; }
    toString() { return '1✓'; }
    swap() { return new ModifiedBaseRangeStateInput2(); }
    withInputValue(inputNumber, value, smartCombination = false) {
        if (inputNumber === 1) {
            return value ? this : new ModifiedBaseRangeStateBase();
        }
        else {
            return value ? new ModifiedBaseRangeStateBoth(1, smartCombination) : new ModifiedBaseRangeStateInput2();
        }
    }
    equals(other) {
        return other.kind === ModifiedBaseRangeStateKind.input1;
    }
}
export class ModifiedBaseRangeStateInput2 extends AbstractModifiedBaseRangeState {
    get kind() { return ModifiedBaseRangeStateKind.input2; }
    get includesInput2() { return true; }
    toString() { return '2✓'; }
    swap() { return new ModifiedBaseRangeStateInput1(); }
    withInputValue(inputNumber, value, smartCombination = false) {
        if (inputNumber === 2) {
            return value ? this : new ModifiedBaseRangeStateBase();
        }
        else {
            return value ? new ModifiedBaseRangeStateBoth(2, smartCombination) : new ModifiedBaseRangeStateInput2();
        }
    }
    equals(other) {
        return other.kind === ModifiedBaseRangeStateKind.input2;
    }
}
export class ModifiedBaseRangeStateBoth extends AbstractModifiedBaseRangeState {
    constructor(firstInput, smartCombination) {
        super();
        this.firstInput = firstInput;
        this.smartCombination = smartCombination;
    }
    get kind() { return ModifiedBaseRangeStateKind.both; }
    get includesInput1() { return true; }
    get includesInput2() { return true; }
    toString() {
        return '2✓';
    }
    swap() { return new ModifiedBaseRangeStateBoth(getOtherInputNumber(this.firstInput), this.smartCombination); }
    withInputValue(inputNumber, value, smartCombination = false) {
        if (value) {
            return this;
        }
        return inputNumber === 1 ? new ModifiedBaseRangeStateInput2() : new ModifiedBaseRangeStateInput1();
    }
    equals(other) {
        return other.kind === ModifiedBaseRangeStateKind.both && this.firstInput === other.firstInput && this.smartCombination === other.smartCombination;
    }
    getInput(inputNumber) {
        return inputNumber === this.firstInput ? 1 : 2;
    }
}
export class ModifiedBaseRangeStateUnrecognized extends AbstractModifiedBaseRangeState {
    get kind() { return ModifiedBaseRangeStateKind.unrecognized; }
    toString() { return 'unrecognized'; }
    swap() { return this; }
    withInputValue(inputNumber, value, smartCombination = false) {
        if (!value) {
            return this;
        }
        return inputNumber === 1 ? new ModifiedBaseRangeStateInput1() : new ModifiedBaseRangeStateInput2();
    }
    equals(other) {
        return other.kind === ModifiedBaseRangeStateKind.unrecognized;
    }
}
export var ModifiedBaseRangeState;
(function (ModifiedBaseRangeState) {
    ModifiedBaseRangeState.base = new ModifiedBaseRangeStateBase();
    ModifiedBaseRangeState.unrecognized = new ModifiedBaseRangeStateUnrecognized();
})(ModifiedBaseRangeState || (ModifiedBaseRangeState = {}));
