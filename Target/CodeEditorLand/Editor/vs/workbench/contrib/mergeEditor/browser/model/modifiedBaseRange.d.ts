import { ITextModel } from '../../../../../editor/common/model.js';
import { LineRangeEdit } from './editing.js';
import { LineRange } from './lineRange.js';
import { DetailedLineRangeMapping } from './mapping.js';
/**
 * Describes modifications in input 1 and input 2 for a specific range in base.
 *
 * The UI offers a mechanism to either apply all changes from input 1 or input 2 or both.
 *
 * Immutable.
*/
export declare class ModifiedBaseRange {
    readonly baseRange: LineRange;
    readonly baseTextModel: ITextModel;
    readonly input1Range: LineRange;
    readonly input1TextModel: ITextModel;
    /**
     * From base to input1
    */
    readonly input1Diffs: readonly DetailedLineRangeMapping[];
    readonly input2Range: LineRange;
    readonly input2TextModel: ITextModel;
    /**
     * From base to input2
    */
    readonly input2Diffs: readonly DetailedLineRangeMapping[];
    static fromDiffs(diffs1: readonly DetailedLineRangeMapping[], diffs2: readonly DetailedLineRangeMapping[], baseTextModel: ITextModel, input1TextModel: ITextModel, input2TextModel: ITextModel): ModifiedBaseRange[];
    readonly input1CombinedDiff: DetailedLineRangeMapping | undefined;
    readonly input2CombinedDiff: DetailedLineRangeMapping | undefined;
    readonly isEqualChange: boolean;
    constructor(baseRange: LineRange, baseTextModel: ITextModel, input1Range: LineRange, input1TextModel: ITextModel, 
    /**
     * From base to input1
    */
    input1Diffs: readonly DetailedLineRangeMapping[], input2Range: LineRange, input2TextModel: ITextModel, 
    /**
     * From base to input2
    */
    input2Diffs: readonly DetailedLineRangeMapping[]);
    getInputRange(inputNumber: 1 | 2): LineRange;
    getInputCombinedDiff(inputNumber: 1 | 2): DetailedLineRangeMapping | undefined;
    getInputDiffs(inputNumber: 1 | 2): readonly DetailedLineRangeMapping[];
    get isConflicting(): boolean;
    get canBeCombined(): boolean;
    get isOrderRelevant(): boolean;
    getEditForBase(state: ModifiedBaseRangeState): {
        edit: LineRangeEdit | undefined;
        effectiveState: ModifiedBaseRangeState;
    };
    private smartInput1LineRangeEdit;
    private smartInput2LineRangeEdit;
    private smartCombineInputs;
    private dumbInput1LineRangeEdit;
    private dumbInput2LineRangeEdit;
    private dumbCombineInputs;
}
export declare enum ModifiedBaseRangeStateKind {
    base = 0,
    input1 = 1,
    input2 = 2,
    both = 3,
    unrecognized = 4
}
export type InputNumber = 1 | 2;
export declare function getOtherInputNumber(inputNumber: InputNumber): InputNumber;
export declare abstract class AbstractModifiedBaseRangeState {
    constructor();
    abstract get kind(): ModifiedBaseRangeStateKind;
    get includesInput1(): boolean;
    get includesInput2(): boolean;
    includesInput(inputNumber: InputNumber): boolean;
    isInputIncluded(inputNumber: InputNumber): boolean;
    abstract toString(): string;
    abstract swap(): ModifiedBaseRangeState;
    abstract withInputValue(inputNumber: InputNumber, value: boolean, smartCombination?: boolean): ModifiedBaseRangeState;
    abstract equals(other: ModifiedBaseRangeState): boolean;
    toggle(inputNumber: InputNumber): ModifiedBaseRangeState;
    getInput(inputNumber: 1 | 2): InputState;
}
export declare class ModifiedBaseRangeStateBase extends AbstractModifiedBaseRangeState {
    get kind(): ModifiedBaseRangeStateKind.base;
    toString(): string;
    swap(): ModifiedBaseRangeState;
    withInputValue(inputNumber: InputNumber, value: boolean, smartCombination?: boolean): ModifiedBaseRangeState;
    equals(other: ModifiedBaseRangeState): boolean;
}
export declare class ModifiedBaseRangeStateInput1 extends AbstractModifiedBaseRangeState {
    get kind(): ModifiedBaseRangeStateKind.input1;
    get includesInput1(): boolean;
    toString(): string;
    swap(): ModifiedBaseRangeState;
    withInputValue(inputNumber: InputNumber, value: boolean, smartCombination?: boolean): ModifiedBaseRangeState;
    equals(other: ModifiedBaseRangeState): boolean;
}
export declare class ModifiedBaseRangeStateInput2 extends AbstractModifiedBaseRangeState {
    get kind(): ModifiedBaseRangeStateKind.input2;
    get includesInput2(): boolean;
    toString(): string;
    swap(): ModifiedBaseRangeState;
    withInputValue(inputNumber: InputNumber, value: boolean, smartCombination?: boolean): ModifiedBaseRangeState;
    equals(other: ModifiedBaseRangeState): boolean;
}
export declare class ModifiedBaseRangeStateBoth extends AbstractModifiedBaseRangeState {
    readonly firstInput: InputNumber;
    readonly smartCombination: boolean;
    constructor(firstInput: InputNumber, smartCombination: boolean);
    get kind(): ModifiedBaseRangeStateKind.both;
    get includesInput1(): boolean;
    get includesInput2(): boolean;
    toString(): string;
    swap(): ModifiedBaseRangeState;
    withInputValue(inputNumber: InputNumber, value: boolean, smartCombination?: boolean): ModifiedBaseRangeState;
    equals(other: ModifiedBaseRangeState): boolean;
    getInput(inputNumber: 1 | 2): InputState;
}
export declare class ModifiedBaseRangeStateUnrecognized extends AbstractModifiedBaseRangeState {
    get kind(): ModifiedBaseRangeStateKind.unrecognized;
    toString(): string;
    swap(): ModifiedBaseRangeState;
    withInputValue(inputNumber: InputNumber, value: boolean, smartCombination?: boolean): ModifiedBaseRangeState;
    equals(other: ModifiedBaseRangeState): boolean;
}
export type ModifiedBaseRangeState = ModifiedBaseRangeStateBase | ModifiedBaseRangeStateInput1 | ModifiedBaseRangeStateInput2 | ModifiedBaseRangeStateInput2 | ModifiedBaseRangeStateBoth | ModifiedBaseRangeStateUnrecognized;
export declare namespace ModifiedBaseRangeState {
    const base: ModifiedBaseRangeStateBase;
    const unrecognized: ModifiedBaseRangeStateUnrecognized;
}
export declare const enum InputState {
    excluded = 0,
    first = 1,
    second = 2,
    unrecognized = 3
}
