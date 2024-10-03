var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
let MergeEditorTelemetry = class MergeEditorTelemetry {
    constructor(telemetryService) {
        this.telemetryService = telemetryService;
    }
    reportMergeEditorOpened(args) {
        this.telemetryService.publicLog2('mergeEditor.opened', {
            conflictCount: args.conflictCount,
            combinableConflictCount: args.combinableConflictCount,
            baseVisible: args.baseVisible,
            isColumnView: args.isColumnView,
            baseTop: args.baseTop,
        });
    }
    reportLayoutChange(args) {
        this.telemetryService.publicLog2('mergeEditor.layoutChanged', {
            baseVisible: args.baseVisible,
            isColumnView: args.isColumnView,
            baseTop: args.baseTop,
        });
    }
    reportMergeEditorClosed(args) {
        this.telemetryService.publicLog2('mergeEditor.closed', {
            conflictCount: args.conflictCount,
            combinableConflictCount: args.combinableConflictCount,
            durationOpenedSecs: args.durationOpenedSecs,
            remainingConflictCount: args.remainingConflictCount,
            accepted: args.accepted,
            conflictsResolvedWithBase: args.conflictsResolvedWithBase,
            conflictsResolvedWithInput1: args.conflictsResolvedWithInput1,
            conflictsResolvedWithInput2: args.conflictsResolvedWithInput2,
            conflictsResolvedWithSmartCombination: args.conflictsResolvedWithSmartCombination,
            manuallySolvedConflictCountThatEqualNone: args.manuallySolvedConflictCountThatEqualNone,
            manuallySolvedConflictCountThatEqualSmartCombine: args.manuallySolvedConflictCountThatEqualSmartCombine,
            manuallySolvedConflictCountThatEqualInput1: args.manuallySolvedConflictCountThatEqualInput1,
            manuallySolvedConflictCountThatEqualInput2: args.manuallySolvedConflictCountThatEqualInput2,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithBase: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithBase,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput1,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithInput2,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothNonSmart,
            manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart: args.manuallySolvedConflictCountThatEqualNoneAndStartedWithBothSmart,
        });
    }
    reportAcceptInvoked(inputNumber, otherAccepted) {
        this.telemetryService.publicLog2('mergeEditor.action.accept', {
            otherAccepted: otherAccepted,
            isInput1: inputNumber === 1,
        });
    }
    reportSmartCombinationInvoked(otherAccepted) {
        this.telemetryService.publicLog2('mergeEditor.action.smartCombination', {
            otherAccepted: otherAccepted,
        });
    }
    reportRemoveInvoked(inputNumber, otherAccepted) {
        this.telemetryService.publicLog2('mergeEditor.action.remove', {
            otherAccepted: otherAccepted,
            isInput1: inputNumber === 1,
        });
    }
    reportResetToBaseInvoked() {
        this.telemetryService.publicLog2('mergeEditor.action.resetToBase', {});
    }
    reportNavigationToNextConflict() {
        this.telemetryService.publicLog2('mergeEditor.action.goToNextConflict', {});
    }
    reportNavigationToPreviousConflict() {
        this.telemetryService.publicLog2('mergeEditor.action.goToPreviousConflict', {});
    }
    reportConflictCounterClicked() {
        this.telemetryService.publicLog2('mergeEditor.action.conflictCounterClicked', {});
    }
};
MergeEditorTelemetry = __decorate([
    __param(0, ITelemetryService),
    __metadata("design:paramtypes", [Object])
], MergeEditorTelemetry);
export { MergeEditorTelemetry };
