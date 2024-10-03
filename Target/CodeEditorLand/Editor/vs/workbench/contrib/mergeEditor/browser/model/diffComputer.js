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
import { assertFn, checkAdjacentItems } from '../../../../../base/common/assert.js';
import { IEditorWorkerService } from '../../../../../editor/common/services/editorWorker.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { LineRange } from './lineRange.js';
import { DetailedLineRangeMapping, RangeMapping } from './mapping.js';
import { observableConfigValue } from '../../../../../platform/observable/common/platformObservableUtils.js';
let MergeDiffComputer = class MergeDiffComputer {
    constructor(editorWorkerService, configurationService) {
        this.editorWorkerService = editorWorkerService;
        this.configurationService = configurationService;
        this.mergeAlgorithm = observableConfigValue('mergeEditor.diffAlgorithm', 'advanced', this.configurationService)
            .map(v => v === 'smart' ? 'legacy' : v === 'experimental' ? 'advanced' : v);
    }
    async computeDiff(textModel1, textModel2, reader) {
        const diffAlgorithm = this.mergeAlgorithm.read(reader);
        const inputVersion = textModel1.getVersionId();
        const outputVersion = textModel2.getVersionId();
        const result = await this.editorWorkerService.computeDiff(textModel1.uri, textModel2.uri, {
            ignoreTrimWhitespace: false,
            maxComputationTimeMs: 0,
            computeMoves: false,
        }, diffAlgorithm);
        if (!result) {
            throw new Error('Diff computation failed');
        }
        if (textModel1.isDisposed() || textModel2.isDisposed()) {
            return { diffs: null };
        }
        const changes = result.changes.map(c => new DetailedLineRangeMapping(toLineRange(c.original), textModel1, toLineRange(c.modified), textModel2, c.innerChanges?.map(ic => toRangeMapping(ic))));
        const newInputVersion = textModel1.getVersionId();
        const newOutputVersion = textModel2.getVersionId();
        if (inputVersion !== newInputVersion || outputVersion !== newOutputVersion) {
            return { diffs: null };
        }
        assertFn(() => {
            for (const c of changes) {
                const inputRange = c.inputRange;
                const outputRange = c.outputRange;
                const inputTextModel = c.inputTextModel;
                const outputTextModel = c.outputTextModel;
                for (const map of c.rangeMappings) {
                    let inputRangesValid = inputRange.startLineNumber - 1 <= map.inputRange.startLineNumber
                        && map.inputRange.endLineNumber <= inputRange.endLineNumberExclusive;
                    if (inputRangesValid && map.inputRange.startLineNumber === inputRange.startLineNumber - 1) {
                        inputRangesValid = map.inputRange.endColumn >= inputTextModel.getLineMaxColumn(map.inputRange.startLineNumber);
                    }
                    if (inputRangesValid && map.inputRange.endLineNumber === inputRange.endLineNumberExclusive) {
                        inputRangesValid = map.inputRange.endColumn === 1;
                    }
                    let outputRangesValid = outputRange.startLineNumber - 1 <= map.outputRange.startLineNumber
                        && map.outputRange.endLineNumber <= outputRange.endLineNumberExclusive;
                    if (outputRangesValid && map.outputRange.startLineNumber === outputRange.startLineNumber - 1) {
                        outputRangesValid = map.outputRange.endColumn >= outputTextModel.getLineMaxColumn(map.outputRange.endLineNumber);
                    }
                    if (outputRangesValid && map.outputRange.endLineNumber === outputRange.endLineNumberExclusive) {
                        outputRangesValid = map.outputRange.endColumn === 1;
                    }
                    if (!inputRangesValid || !outputRangesValid) {
                        return false;
                    }
                }
            }
            return changes.length === 0 || (changes[0].inputRange.startLineNumber === changes[0].outputRange.startLineNumber &&
                checkAdjacentItems(changes, (m1, m2) => m2.inputRange.startLineNumber - m1.inputRange.endLineNumberExclusive === m2.outputRange.startLineNumber - m1.outputRange.endLineNumberExclusive &&
                    m1.inputRange.endLineNumberExclusive < m2.inputRange.startLineNumber &&
                    m1.outputRange.endLineNumberExclusive < m2.outputRange.startLineNumber));
        });
        return {
            diffs: changes
        };
    }
};
MergeDiffComputer = __decorate([
    __param(0, IEditorWorkerService),
    __param(1, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object])
], MergeDiffComputer);
export { MergeDiffComputer };
export function toLineRange(range) {
    return new LineRange(range.startLineNumber, range.length);
}
export function toRangeMapping(mapping) {
    return new RangeMapping(mapping.originalRange, mapping.modifiedRange);
}
