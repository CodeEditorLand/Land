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
import { findFirstIdxMonotonousOrArrLen } from '../../../../../../base/common/arraysFind.js';
import { createCancelablePromise, Delayer } from '../../../../../../base/common/async.js';
import { Disposable, DisposableStore } from '../../../../../../base/common/lifecycle.js';
import { Range } from '../../../../../../editor/common/core/range.js';
import { PrefixSumComputer } from '../../../../../../editor/common/model/prefixSumComputer.js';
import { FindReplaceState } from '../../../../../../editor/contrib/find/browser/findState.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { FindMatchDecorationModel } from './findMatchDecorationModel.js';
import { CellEditState } from '../../notebookBrowser.js';
import { CellKind, NotebookCellsChangeType } from '../../../common/notebookCommon.js';
export class CellFindMatchModel {
    get length() {
        return this._contentMatches.length + this._webviewMatches.length;
    }
    get contentMatches() {
        return this._contentMatches;
    }
    get webviewMatches() {
        return this._webviewMatches;
    }
    constructor(cell, index, contentMatches, webviewMatches) {
        this.cell = cell;
        this.index = index;
        this._contentMatches = contentMatches;
        this._webviewMatches = webviewMatches;
    }
    getMatch(index) {
        if (index >= this.length) {
            throw new Error('NotebookCellFindMatch: index out of range');
        }
        if (index < this._contentMatches.length) {
            return this._contentMatches[index];
        }
        return this._webviewMatches[index - this._contentMatches.length];
    }
}
let FindModel = class FindModel extends Disposable {
    get findMatches() {
        return this._findMatches;
    }
    get currentMatch() {
        return this._currentMatch;
    }
    constructor(_notebookEditor, _state, _configurationService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._state = _state;
        this._configurationService = _configurationService;
        this._findMatches = [];
        this._findMatchesStarts = null;
        this._currentMatch = -1;
        this._computePromise = null;
        this._modelDisposable = this._register(new DisposableStore());
        this._throttledDelayer = new Delayer(20);
        this._computePromise = null;
        this._register(_state.onFindReplaceStateChange(e => {
            this._updateCellStates(e);
            if (e.searchString || e.isRegex || e.matchCase || e.searchScope || e.wholeWord || (e.isRevealed && this._state.isRevealed) || e.filters || e.isReplaceRevealed) {
                this.research();
            }
            if (e.isRevealed && !this._state.isRevealed) {
                this.clear();
            }
        }));
        this._register(this._notebookEditor.onDidChangeModel(e => {
            this._registerModelListener(e);
        }));
        this._register(this._notebookEditor.onDidChangeCellState(e => {
            if (e.cell.cellKind === CellKind.Markup && e.source.editStateChanged) {
                this.research();
            }
        }));
        if (this._notebookEditor.hasModel()) {
            this._registerModelListener(this._notebookEditor.textModel);
        }
        this._findMatchDecorationModel = new FindMatchDecorationModel(this._notebookEditor, this._notebookEditor.getId());
    }
    _updateCellStates(e) {
        if (!this._state.filters?.markupInput || !this._state.filters?.markupPreview || !this._state.filters?.findScope) {
            return;
        }
        const updateEditingState = () => {
            const viewModel = this._notebookEditor.getViewModel();
            if (!viewModel) {
                return;
            }
            const wordSeparators = this._configurationService.inspect('editor.wordSeparators').value;
            const options = {
                regex: this._state.isRegex,
                wholeWord: this._state.wholeWord,
                caseSensitive: this._state.matchCase,
                wordSeparators: wordSeparators,
                includeMarkupInput: true,
                includeCodeInput: false,
                includeMarkupPreview: false,
                includeOutput: false,
                findScope: this._state.filters?.findScope,
            };
            const contentMatches = viewModel.find(this._state.searchString, options);
            for (let i = 0; i < viewModel.length; i++) {
                const cell = viewModel.cellAt(i);
                if (cell && cell.cellKind === CellKind.Markup) {
                    const foundContentMatch = contentMatches.find(m => m.cell.handle === cell.handle && m.contentMatches.length > 0);
                    const targetState = foundContentMatch ? CellEditState.Editing : CellEditState.Preview;
                    const currentEditingState = cell.getEditState();
                    if (currentEditingState === CellEditState.Editing && cell.editStateSource !== 'find') {
                        continue;
                    }
                    if (currentEditingState !== targetState) {
                        cell.updateEditState(targetState, 'find');
                    }
                }
            }
        };
        if (e.isReplaceRevealed && !this._state.isReplaceRevealed) {
            const viewModel = this._notebookEditor.getViewModel();
            if (!viewModel) {
                return;
            }
            for (let i = 0; i < viewModel.length; i++) {
                const cell = viewModel.cellAt(i);
                if (cell && cell.cellKind === CellKind.Markup) {
                    if (cell.getEditState() === CellEditState.Editing && cell.editStateSource === 'find') {
                        cell.updateEditState(CellEditState.Preview, 'find');
                    }
                }
            }
            return;
        }
        if (e.isReplaceRevealed) {
            updateEditingState();
        }
        else if ((e.filters || e.isRevealed || e.searchString || e.replaceString) && this._state.isRevealed && this._state.isReplaceRevealed) {
            updateEditingState();
        }
    }
    ensureFindMatches() {
        if (!this._findMatchesStarts) {
            this.set(this._findMatches, true);
        }
    }
    getCurrentMatch() {
        const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
        const cell = this._findMatches[nextIndex.index].cell;
        const match = this._findMatches[nextIndex.index].getMatch(nextIndex.remainder);
        return {
            cell,
            match,
            isModelMatch: nextIndex.remainder < this._findMatches[nextIndex.index].contentMatches.length
        };
    }
    refreshCurrentMatch(focus) {
        const findMatchIndex = this.findMatches.findIndex(match => match.cell === focus.cell);
        if (findMatchIndex === -1) {
            return;
        }
        const findMatch = this.findMatches[findMatchIndex];
        const index = findMatch.contentMatches.findIndex(match => match.range.intersectRanges(focus.range) !== null);
        if (index === undefined) {
            return;
        }
        const matchesBefore = findMatchIndex === 0 ? 0 : (this._findMatchesStarts?.getPrefixSum(findMatchIndex - 1) ?? 0);
        this._currentMatch = matchesBefore + index;
        this.highlightCurrentFindMatchDecoration(findMatchIndex, index).then(offset => {
            this.revealCellRange(findMatchIndex, index, offset);
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
        });
    }
    find(option) {
        if (!this.findMatches.length) {
            return;
        }
        if (!this._findMatchesStarts) {
            this.set(this._findMatches, true);
            if ('index' in option) {
                this._currentMatch = option.index;
            }
        }
        else {
            const totalVal = this._findMatchesStarts.getTotalSum();
            if ('index' in option) {
                this._currentMatch = option.index;
            }
            else if (this._currentMatch === -1) {
                this._currentMatch = option.previous ? totalVal - 1 : 0;
            }
            else {
                const nextVal = (this._currentMatch + (option.previous ? -1 : 1) + totalVal) % totalVal;
                this._currentMatch = nextVal;
            }
        }
        const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
        this.highlightCurrentFindMatchDecoration(nextIndex.index, nextIndex.remainder).then(offset => {
            this.revealCellRange(nextIndex.index, nextIndex.remainder, offset);
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
        });
    }
    revealCellRange(cellIndex, matchIndex, outputOffset) {
        const findMatch = this._findMatches[cellIndex];
        if (matchIndex >= findMatch.contentMatches.length) {
            this._notebookEditor.focusElement(findMatch.cell);
            const index = this._notebookEditor.getCellIndex(findMatch.cell);
            if (index !== undefined) {
                this._notebookEditor.revealCellOffsetInCenter(findMatch.cell, outputOffset ?? 0);
            }
        }
        else {
            const match = findMatch.getMatch(matchIndex);
            if (findMatch.cell.getEditState() !== CellEditState.Editing) {
                findMatch.cell.updateEditState(CellEditState.Editing, 'find');
            }
            findMatch.cell.isInputCollapsed = false;
            this._notebookEditor.focusElement(findMatch.cell);
            this._notebookEditor.setCellEditorSelection(findMatch.cell, match.range);
            this._notebookEditor.revealRangeInCenterIfOutsideViewportAsync(findMatch.cell, match.range);
        }
    }
    _registerModelListener(notebookTextModel) {
        this._modelDisposable.clear();
        if (notebookTextModel) {
            this._modelDisposable.add(notebookTextModel.onDidChangeContent((e) => {
                if (!e.rawEvents.some(event => event.kind === NotebookCellsChangeType.ChangeCellContent || event.kind === NotebookCellsChangeType.ModelChange)) {
                    return;
                }
                this.research();
            }));
        }
        this.research();
    }
    async research() {
        return this._throttledDelayer.trigger(async () => {
            this._state.change({ isSearching: true }, false);
            await this._research();
            this._state.change({ isSearching: false }, false);
        });
    }
    async _research() {
        this._computePromise?.cancel();
        if (!this._state.isRevealed || !this._notebookEditor.hasModel()) {
            this.set([], false);
            return;
        }
        this._computePromise = createCancelablePromise(token => this._compute(token));
        const findMatches = await this._computePromise;
        if (!findMatches) {
            this.set([], false);
            return;
        }
        if (findMatches.length === 0) {
            this.set([], false);
            return;
        }
        const findFirstMatchAfterCellIndex = (cellIndex) => {
            const matchAfterSelection = findFirstIdxMonotonousOrArrLen(findMatches.map(match => match.index), index => index >= cellIndex);
            this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
        };
        if (this._currentMatch === -1) {
            if (this._notebookEditor.getLength() === 0) {
                this.set(findMatches, false);
                return;
            }
            else {
                const focus = this._notebookEditor.getFocus().start;
                findFirstMatchAfterCellIndex(focus);
                this.set(findMatches, false);
                return;
            }
        }
        const oldCurrIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
        const oldCurrCell = this._findMatches[oldCurrIndex.index].cell;
        const oldCurrMatchCellIndex = this._notebookEditor.getCellIndex(oldCurrCell);
        if (oldCurrMatchCellIndex < 0) {
            if (this._notebookEditor.getLength() === 0) {
                this.set(findMatches, false);
                return;
            }
            findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
            return;
        }
        const cell = this._notebookEditor.cellAt(oldCurrMatchCellIndex);
        if (cell.cellKind === CellKind.Markup && cell.getEditState() === CellEditState.Preview) {
            findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
            return;
        }
        if (!this._findMatchDecorationModel.currentMatchDecorations) {
            findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
            return;
        }
        if (this._findMatchDecorationModel.currentMatchDecorations.kind === 'input') {
            const currentMatchDecorationId = this._findMatchDecorationModel.currentMatchDecorations.decorations.find(decoration => decoration.ownerId === cell.handle);
            if (!currentMatchDecorationId) {
                findFirstMatchAfterCellIndex(oldCurrMatchCellIndex);
                return;
            }
            const matchAfterSelection = findFirstIdxMonotonousOrArrLen(findMatches, match => match.index >= oldCurrMatchCellIndex) % findMatches.length;
            if (findMatches[matchAfterSelection].index > oldCurrMatchCellIndex) {
                this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
                return;
            }
            else {
                let currMatchRangeInEditor = cell.editorAttached && currentMatchDecorationId.decorations[0] ? cell.getCellDecorationRange(currentMatchDecorationId.decorations[0]) : null;
                if (currMatchRangeInEditor === null && oldCurrIndex.remainder < this._findMatches[oldCurrIndex.index].contentMatches.length) {
                    currMatchRangeInEditor = this._findMatches[oldCurrIndex.index].getMatch(oldCurrIndex.remainder).range;
                }
                if (currMatchRangeInEditor !== null) {
                    const cellMatch = findMatches[matchAfterSelection];
                    const matchAfterOldSelection = findFirstIdxMonotonousOrArrLen(cellMatch.contentMatches, match => Range.compareRangesUsingStarts(match.range, currMatchRangeInEditor) >= 0);
                    this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection) + matchAfterOldSelection);
                }
                else {
                    this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
                    return;
                }
            }
        }
        else {
            const matchAfterSelection = findFirstIdxMonotonousOrArrLen(findMatches.map(match => match.index), index => index >= oldCurrMatchCellIndex) % findMatches.length;
            this._updateCurrentMatch(findMatches, this._matchesCountBeforeIndex(findMatches, matchAfterSelection));
        }
    }
    set(cellFindMatches, autoStart) {
        if (!cellFindMatches || !cellFindMatches.length) {
            this._findMatches = [];
            this._findMatchDecorationModel.setAllFindMatchesDecorations([]);
            this.constructFindMatchesStarts();
            this._currentMatch = -1;
            this._findMatchDecorationModel.clearCurrentFindMatchDecoration();
            this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
            return;
        }
        this._findMatches = cellFindMatches;
        this._findMatchDecorationModel.setAllFindMatchesDecorations(cellFindMatches || []);
        this.constructFindMatchesStarts();
        if (autoStart) {
            this._currentMatch = 0;
            this.highlightCurrentFindMatchDecoration(0, 0);
        }
        this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
    }
    async _compute(token) {
        if (!this._notebookEditor.hasModel()) {
            return null;
        }
        let ret = null;
        const val = this._state.searchString;
        const wordSeparators = this._configurationService.inspect('editor.wordSeparators').value;
        const options = {
            regex: this._state.isRegex,
            wholeWord: this._state.wholeWord,
            caseSensitive: this._state.matchCase,
            wordSeparators: wordSeparators,
            includeMarkupInput: this._state.filters?.markupInput ?? true,
            includeCodeInput: this._state.filters?.codeInput ?? true,
            includeMarkupPreview: !!this._state.filters?.markupPreview,
            includeOutput: !!this._state.filters?.codeOutput,
            findScope: this._state.filters?.findScope,
        };
        ret = await this._notebookEditor.find(val, options, token);
        if (token.isCancellationRequested) {
            return null;
        }
        return ret;
    }
    _updateCurrentMatch(findMatches, currentMatchesPosition) {
        this._currentMatch = currentMatchesPosition % findMatches.length;
        this.set(findMatches, false);
        const nextIndex = this._findMatchesStarts.getIndexOf(this._currentMatch);
        this.highlightCurrentFindMatchDecoration(nextIndex.index, nextIndex.remainder);
        this._state.changeMatchInfo(this._currentMatch, this._findMatches.reduce((p, c) => p + c.length, 0), undefined);
    }
    _matchesCountBeforeIndex(findMatches, index) {
        let prevMatchesCount = 0;
        for (let i = 0; i < index; i++) {
            prevMatchesCount += findMatches[i].length;
        }
        return prevMatchesCount;
    }
    constructFindMatchesStarts() {
        if (this._findMatches && this._findMatches.length) {
            const values = new Uint32Array(this._findMatches.length);
            for (let i = 0; i < this._findMatches.length; i++) {
                values[i] = this._findMatches[i].length;
            }
            this._findMatchesStarts = new PrefixSumComputer(values);
        }
        else {
            this._findMatchesStarts = null;
        }
    }
    async highlightCurrentFindMatchDecoration(cellIndex, matchIndex) {
        const cell = this._findMatches[cellIndex].cell;
        const match = this._findMatches[cellIndex].getMatch(matchIndex);
        if (matchIndex < this._findMatches[cellIndex].contentMatches.length) {
            return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInCell(cell, match.range);
        }
        else {
            return this._findMatchDecorationModel.highlightCurrentFindMatchDecorationInWebview(cell, match.index);
        }
    }
    clear() {
        this._computePromise?.cancel();
        this._throttledDelayer.cancel();
        this.set([], false);
    }
    dispose() {
        this._findMatchDecorationModel.dispose();
        super.dispose();
    }
};
FindModel = __decorate([
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, FindReplaceState, Object])
], FindModel);
export { FindModel };
