import { importAMDNodeModule } from '../../../../../amdX.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { autorun, keepObserved } from '../../../../../base/common/observable.js';
import { countEOL } from '../../../../../editor/common/core/eolCounter.js';
import { LineRange } from '../../../../../editor/common/core/lineRange.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { TokenizationStateStore } from '../../../../../editor/common/model/textModelTokens.js';
import { ContiguousMultilineTokensBuilder } from '../../../../../editor/common/tokens/contiguousMultilineTokensBuilder.js';
import { observableConfigValue } from '../../../../../platform/observable/common/platformObservableUtils.js';
import { ArrayEdit, MonotonousIndexTransformer, SingleArrayEdit } from '../arrayOperation.js';
export class TextMateWorkerTokenizerController extends Disposable {
    static { this._id = 0; }
    constructor(_model, _worker, _languageIdCodec, _backgroundTokenizationStore, _configurationService, _maxTokenizationLineLength) {
        super();
        this._model = _model;
        this._worker = _worker;
        this._languageIdCodec = _languageIdCodec;
        this._backgroundTokenizationStore = _backgroundTokenizationStore;
        this._configurationService = _configurationService;
        this._maxTokenizationLineLength = _maxTokenizationLineLength;
        this.controllerId = TextMateWorkerTokenizerController._id++;
        this._pendingChanges = [];
        this._states = new TokenizationStateStore();
        this._loggingEnabled = observableConfigValue('editor.experimental.asyncTokenizationLogging', false, this._configurationService);
        this._register(keepObserved(this._loggingEnabled));
        this._register(this._model.onDidChangeContent((e) => {
            if (this._shouldLog) {
                console.log('model change', {
                    fileName: this._model.uri.fsPath.split('\\').pop(),
                    changes: changesToString(e.changes),
                });
            }
            this._worker.$acceptModelChanged(this.controllerId, e);
            this._pendingChanges.push(e);
        }));
        this._register(this._model.onDidChangeLanguage((e) => {
            const languageId = this._model.getLanguageId();
            const encodedLanguageId = this._languageIdCodec.encodeLanguageId(languageId);
            this._worker.$acceptModelLanguageChanged(this.controllerId, languageId, encodedLanguageId);
        }));
        const languageId = this._model.getLanguageId();
        const encodedLanguageId = this._languageIdCodec.encodeLanguageId(languageId);
        this._worker.$acceptNewModel({
            uri: this._model.uri,
            versionId: this._model.getVersionId(),
            lines: this._model.getLinesContent(),
            EOL: this._model.getEOL(),
            languageId,
            encodedLanguageId,
            maxTokenizationLineLength: this._maxTokenizationLineLength.get(),
            controllerId: this.controllerId,
        });
        this._register(autorun(reader => {
            const maxTokenizationLineLength = this._maxTokenizationLineLength.read(reader);
            this._worker.$acceptMaxTokenizationLineLength(this.controllerId, maxTokenizationLineLength);
        }));
    }
    dispose() {
        super.dispose();
        this._worker.$acceptRemovedModel(this.controllerId);
    }
    requestTokens(startLineNumber, endLineNumberExclusive) {
        this._worker.$retokenize(this.controllerId, startLineNumber, endLineNumberExclusive);
    }
    async setTokensAndStates(controllerId, versionId, rawTokens, stateDeltas) {
        if (this.controllerId !== controllerId) {
            return;
        }
        let tokens = ContiguousMultilineTokensBuilder.deserialize(new Uint8Array(rawTokens));
        if (this._shouldLog) {
            console.log('received background tokenization result', {
                fileName: this._model.uri.fsPath.split('\\').pop(),
                updatedTokenLines: tokens.map((t) => t.getLineRange()).join(' & '),
                updatedStateLines: stateDeltas.map((s) => new LineRange(s.startLineNumber, s.startLineNumber + s.stateDeltas.length).toString()).join(' & '),
            });
        }
        if (this._shouldLog) {
            const changes = this._pendingChanges.filter(c => c.versionId <= versionId).map(c => c.changes).map(c => changesToString(c)).join(' then ');
            console.log('Applying changes to local states', changes);
        }
        while (this._pendingChanges.length > 0 &&
            this._pendingChanges[0].versionId <= versionId) {
            const change = this._pendingChanges.shift();
            this._states.acceptChanges(change.changes);
        }
        if (this._pendingChanges.length > 0) {
            if (this._shouldLog) {
                const changes = this._pendingChanges.map(c => c.changes).map(c => changesToString(c)).join(' then ');
                console.log('Considering non-processed changes', changes);
            }
            const curToFutureTransformerTokens = MonotonousIndexTransformer.fromMany(this._pendingChanges.map((c) => fullLineArrayEditFromModelContentChange(c.changes)));
            const b = new ContiguousMultilineTokensBuilder();
            for (const t of tokens) {
                for (let i = t.startLineNumber; i <= t.endLineNumber; i++) {
                    const result = curToFutureTransformerTokens.transform(i - 1);
                    if (result !== undefined) {
                        b.add(i, t.getLineTokens(i));
                    }
                }
            }
            tokens = b.finalize();
            for (const change of this._pendingChanges) {
                for (const innerChanges of change.changes) {
                    for (let j = 0; j < tokens.length; j++) {
                        tokens[j].applyEdit(innerChanges.range, innerChanges.text);
                    }
                }
            }
        }
        const curToFutureTransformerStates = MonotonousIndexTransformer.fromMany(this._pendingChanges.map((c) => fullLineArrayEditFromModelContentChange(c.changes)));
        if (!this._applyStateStackDiffFn || !this._initialState) {
            const { applyStateStackDiff, INITIAL } = await importAMDNodeModule('vscode-textmate', 'release/main.js');
            this._applyStateStackDiffFn = applyStateStackDiff;
            this._initialState = INITIAL;
        }
        for (const d of stateDeltas) {
            let prevState = d.startLineNumber <= 1 ? this._initialState : this._states.getEndState(d.startLineNumber - 1);
            for (let i = 0; i < d.stateDeltas.length; i++) {
                const delta = d.stateDeltas[i];
                let state;
                if (delta) {
                    state = this._applyStateStackDiffFn(prevState, delta);
                    this._states.setEndState(d.startLineNumber + i, state);
                }
                else {
                    state = this._states.getEndState(d.startLineNumber + i);
                }
                const offset = curToFutureTransformerStates.transform(d.startLineNumber + i - 1);
                if (offset !== undefined) {
                    this._backgroundTokenizationStore.setEndState(offset + 1, state);
                }
                if (d.startLineNumber + i >= this._model.getLineCount() - 1) {
                    this._backgroundTokenizationStore.backgroundTokenizationFinished();
                }
                prevState = state;
            }
        }
        this._backgroundTokenizationStore.setTokens(tokens);
    }
    get _shouldLog() { return this._loggingEnabled.get(); }
}
function fullLineArrayEditFromModelContentChange(c) {
    return new ArrayEdit(c.map((c) => new SingleArrayEdit(c.range.startLineNumber - 1, c.range.endLineNumber - c.range.startLineNumber + 1, countEOL(c.text)[0] + 1)));
}
function changesToString(changes) {
    return changes.map(c => Range.lift(c.range).toString() + ' => ' + c.text).join(' & ');
}
