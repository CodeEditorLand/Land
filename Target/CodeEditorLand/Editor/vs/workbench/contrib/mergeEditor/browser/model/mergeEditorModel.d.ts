import { IObservable, IReader, ITransaction } from '../../../../../base/common/observable.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { EditorModel } from '../../../../common/editor/editorModel.js';
import { IMergeDiffComputer } from './diffComputer.js';
import { LineRange } from './lineRange.js';
import { DetailedLineRangeMapping, DocumentLineRangeMap } from './mapping.js';
import { TextModelDiffChangeReason } from './textModelDiffs.js';
import { MergeEditorTelemetry } from '../telemetry.js';
import { InputNumber, ModifiedBaseRange, ModifiedBaseRangeState } from './modifiedBaseRange.js';
export interface InputData {
    readonly textModel: ITextModel;
    readonly title: string | undefined;
    readonly detail: string | undefined;
    readonly description: string | undefined;
}
export declare class MergeEditorModel extends EditorModel {
    readonly base: ITextModel;
    readonly input1: InputData;
    readonly input2: InputData;
    readonly resultTextModel: ITextModel;
    private readonly diffComputer;
    private readonly options;
    readonly telemetry: MergeEditorTelemetry;
    private readonly languageService;
    private readonly undoRedoService;
    private readonly input1TextModelDiffs;
    private readonly input2TextModelDiffs;
    private readonly resultTextModelDiffs;
    readonly modifiedBaseRanges: IObservable<ModifiedBaseRange[], unknown>;
    private readonly modifiedBaseRangeResultStates;
    private readonly resultSnapshot;
    constructor(base: ITextModel, input1: InputData, input2: InputData, resultTextModel: ITextModel, diffComputer: IMergeDiffComputer, options: {
        resetResult: boolean;
    }, telemetry: MergeEditorTelemetry, languageService: ILanguageService, undoRedoService: IUndoRedoService);
    private initialize;
    reset(): Promise<void>;
    private computeAutoMergedResult;
    hasBaseRange(baseRange: ModifiedBaseRange): boolean;
    readonly baseInput1Diffs: IObservable<DetailedLineRangeMapping[], TextModelDiffChangeReason>;
    readonly baseInput2Diffs: IObservable<DetailedLineRangeMapping[], TextModelDiffChangeReason>;
    readonly baseResultDiffs: IObservable<DetailedLineRangeMapping[], TextModelDiffChangeReason>;
    get isApplyingEditInResult(): boolean;
    readonly input1ResultMapping: IObservable<DocumentLineRangeMap, unknown>;
    readonly resultInput1Mapping: IObservable<DocumentLineRangeMap, unknown>;
    readonly input2ResultMapping: IObservable<DocumentLineRangeMap, unknown>;
    readonly resultInput2Mapping: IObservable<DocumentLineRangeMap, unknown>;
    private getInputResultMapping;
    readonly baseResultMapping: IObservable<DocumentLineRangeMap, unknown>;
    readonly resultBaseMapping: IObservable<DocumentLineRangeMap, unknown>;
    translateInputRangeToBase(input: 1 | 2, range: Range): Range;
    translateBaseRangeToInput(input: 1 | 2, range: Range): Range;
    getLineRangeInResult(baseRange: LineRange, reader?: IReader): LineRange;
    translateResultRangeToBase(range: Range): Range;
    translateBaseRangeToResult(range: Range): Range;
    findModifiedBaseRangesInRange(rangeInBase: LineRange): ModifiedBaseRange[];
    readonly diffComputingState: IObservable<MergeEditorModelState, unknown>;
    readonly inputDiffComputingState: IObservable<MergeEditorModelState, unknown>;
    readonly isUpToDate: IObservable<boolean, unknown>;
    readonly onInitialized: Promise<void>;
    private firstRun;
    private updateBaseRangeAcceptedState;
    private computeState;
    getState(baseRange: ModifiedBaseRange): IObservable<ModifiedBaseRangeState>;
    setState(baseRange: ModifiedBaseRange, state: ModifiedBaseRangeState, _markInputAsHandled: boolean | InputNumber, tx: ITransaction, _pushStackElement?: boolean): void;
    resetDirtyConflictsToBase(): void;
    isHandled(baseRange: ModifiedBaseRange): IObservable<boolean>;
    isInputHandled(baseRange: ModifiedBaseRange, inputNumber: InputNumber): IObservable<boolean>;
    setInputHandled(baseRange: ModifiedBaseRange, inputNumber: InputNumber, handled: boolean, tx: ITransaction): void;
    setHandled(baseRange: ModifiedBaseRange, handled: boolean, tx: ITransaction): void;
    readonly unhandledConflictsCount: IObservable<number, unknown>;
    readonly hasUnhandledConflicts: IObservable<boolean, unknown>;
    setLanguageId(languageId: string, source?: string): void;
    getInitialResultValue(): string;
    getResultValueWithConflictMarkers(): Promise<string>;
    get conflictCount(): number;
    get combinableConflictCount(): number;
    get conflictsResolvedWithBase(): number;
    get conflictsResolvedWithInput1(): number;
    get conflictsResolvedWithInput2(): number;
    get conflictsResolvedWithSmartCombination(): number;
    get manuallySolvedConflictCountThatEqualNone(): number;
    get manuallySolvedConflictCountThatEqualSmartCombine(): number;
    get manuallySolvedConflictCountThatEqualInput1(): number;
    get manuallySolvedConflictCountThatEqualInput2(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithBase(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart(): number;
    get manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart(): number;
}
export declare const enum MergeEditorModelState {
    initializing = 1,
    upToDate = 2,
    updating = 3
}
