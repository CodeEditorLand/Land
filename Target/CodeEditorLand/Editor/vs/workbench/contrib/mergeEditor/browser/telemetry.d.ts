import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { InputNumber } from './model/modifiedBaseRange.js';
export declare class MergeEditorTelemetry {
    private readonly telemetryService;
    constructor(telemetryService: ITelemetryService);
    reportMergeEditorOpened(args: {
        conflictCount: number;
        combinableConflictCount: number;
        baseVisible: boolean;
        isColumnView: boolean;
        baseTop: boolean;
    }): void;
    reportLayoutChange(args: {
        baseVisible: boolean;
        isColumnView: boolean;
        baseTop: boolean;
    }): void;
    reportMergeEditorClosed(args: {
        conflictCount: number;
        combinableConflictCount: number;
        durationOpenedSecs: number;
        remainingConflictCount: number;
        accepted: boolean;
        conflictsResolvedWithBase: number;
        conflictsResolvedWithInput1: number;
        conflictsResolvedWithInput2: number;
        conflictsResolvedWithSmartCombination: number;
        manuallySolvedConflictCountThatEqualNone: number;
        manuallySolvedConflictCountThatEqualSmartCombine: number;
        manuallySolvedConflictCountThatEqualInput1: number;
        manuallySolvedConflictCountThatEqualInput2: number;
        manuallySolvedConflictCountThatEqualNoneAndStartedWithBase: number;
        manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1: number;
        manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2: number;
        manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart: number;
        manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart: number;
    }): void;
    reportAcceptInvoked(inputNumber: InputNumber, otherAccepted: boolean): void;
    reportSmartCombinationInvoked(otherAccepted: boolean): void;
    reportRemoveInvoked(inputNumber: InputNumber, otherAccepted: boolean): void;
    reportResetToBaseInvoked(): void;
    reportNavigationToNextConflict(): void;
    reportNavigationToPreviousConflict(): void;
    reportConflictCounterClicked(): void;
}
