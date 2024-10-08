/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { findLast } from '../../../../../base/common/arraysFind.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { derived, derivedObservableWithWritableCache, observableValue, transaction } from '../../../../../base/common/observable.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { localize } from '../../../../../nls.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../../../platform/notification/common/notification.js';
import { LineRange } from '../model/lineRange.js';
import { MergeEditorModel } from '../model/mergeEditorModel.js';
import { observableConfigValue } from '../../../../../platform/observable/common/platformObservableUtils.js';
import { InputCodeEditorView } from './editors/inputCodeEditorView.js';
import { ResultCodeEditorView } from './editors/resultCodeEditorView.js';
let MergeEditorViewModel = class MergeEditorViewModel extends Disposable {
    constructor(model, inputCodeEditorView1, inputCodeEditorView2, resultCodeEditorView, baseCodeEditorView, showNonConflictingChanges, configurationService, notificationService) {
        super();
        this.model = model;
        this.inputCodeEditorView1 = inputCodeEditorView1;
        this.inputCodeEditorView2 = inputCodeEditorView2;
        this.resultCodeEditorView = resultCodeEditorView;
        this.baseCodeEditorView = baseCodeEditorView;
        this.showNonConflictingChanges = showNonConflictingChanges;
        this.configurationService = configurationService;
        this.notificationService = notificationService;
        this.manuallySetActiveModifiedBaseRange = observableValue(this, { range: undefined, counter: 0 });
        this.attachedHistory = this._register(new AttachedHistory(this.model.resultTextModel));
        this.shouldUseAppendInsteadOfAccept = observableConfigValue('mergeEditor.shouldUseAppendInsteadOfAccept', false, this.configurationService);
        this.counter = 0;
        this.lastFocusedEditor = derivedObservableWithWritableCache(this, (reader, lastValue) => {
            const editors = [
                this.inputCodeEditorView1,
                this.inputCodeEditorView2,
                this.resultCodeEditorView,
                this.baseCodeEditorView.read(reader),
            ];
            const view = editors.find((e) => e && e.isFocused.read(reader));
            return view ? { view, counter: this.counter++ } : lastValue || { view: undefined, counter: this.counter++ };
        });
        this.baseShowDiffAgainst = derived(this, reader => {
            const lastFocusedEditor = this.lastFocusedEditor.read(reader);
            if (lastFocusedEditor.view === this.inputCodeEditorView1) {
                return 1;
            }
            else if (lastFocusedEditor.view === this.inputCodeEditorView2) {
                return 2;
            }
            return undefined;
        });
        this.selectionInBase = derived(this, reader => {
            const sourceEditor = this.lastFocusedEditor.read(reader).view;
            if (!sourceEditor) {
                return undefined;
            }
            const selections = sourceEditor.selection.read(reader) || [];
            const rangesInBase = selections.map((selection) => {
                if (sourceEditor === this.inputCodeEditorView1) {
                    return this.model.translateInputRangeToBase(1, selection);
                }
                else if (sourceEditor === this.inputCodeEditorView2) {
                    return this.model.translateInputRangeToBase(2, selection);
                }
                else if (sourceEditor === this.resultCodeEditorView) {
                    return this.model.translateResultRangeToBase(selection);
                }
                else if (sourceEditor === this.baseCodeEditorView.read(reader)) {
                    return selection;
                }
                else {
                    return selection;
                }
            });
            return {
                rangesInBase,
                sourceEditor
            };
        });
        this.activeModifiedBaseRange = derived(this, (reader) => {
            /** @description activeModifiedBaseRange */
            const focusedEditor = this.lastFocusedEditor.read(reader);
            const manualRange = this.manuallySetActiveModifiedBaseRange.read(reader);
            if (manualRange.counter > focusedEditor.counter) {
                return manualRange.range;
            }
            if (!focusedEditor.view) {
                return;
            }
            const cursorLineNumber = focusedEditor.view.cursorLineNumber.read(reader);
            if (!cursorLineNumber) {
                return undefined;
            }
            const modifiedBaseRanges = this.model.modifiedBaseRanges.read(reader);
            return modifiedBaseRanges.find((r) => {
                const range = this.getRangeOfModifiedBaseRange(focusedEditor.view, r, reader);
                return range.isEmpty
                    ? range.startLineNumber === cursorLineNumber
                    : range.contains(cursorLineNumber);
            });
        });
        this._register(resultCodeEditorView.editor.onDidChangeModelContent(e => {
            if (this.model.isApplyingEditInResult || e.isRedoing || e.isUndoing) {
                return;
            }
            const baseRangeStates = [];
            for (const change of e.changes) {
                const rangeInBase = this.model.translateResultRangeToBase(Range.lift(change.range));
                const baseRanges = this.model.findModifiedBaseRangesInRange(new LineRange(rangeInBase.startLineNumber, rangeInBase.endLineNumber - rangeInBase.startLineNumber));
                if (baseRanges.length === 1) {
                    const isHandled = this.model.isHandled(baseRanges[0]).get();
                    if (!isHandled) {
                        baseRangeStates.push(baseRanges[0]);
                    }
                }
            }
            if (baseRangeStates.length === 0) {
                return;
            }
            const element = {
                model: this.model,
                redo() {
                    transaction(tx => {
                        /** @description Mark conflicts touched by manual edits as handled */
                        for (const r of baseRangeStates) {
                            this.model.setHandled(r, true, tx);
                        }
                    });
                },
                undo() {
                    transaction(tx => {
                        /** @description Mark conflicts touched by manual edits as handled */
                        for (const r of baseRangeStates) {
                            this.model.setHandled(r, false, tx);
                        }
                    });
                },
            };
            this.attachedHistory.pushAttachedHistoryElement(element);
            element.redo();
        }));
    }
    getRangeOfModifiedBaseRange(editor, modifiedBaseRange, reader) {
        if (editor === this.resultCodeEditorView) {
            return this.model.getLineRangeInResult(modifiedBaseRange.baseRange, reader);
        }
        else if (editor === this.baseCodeEditorView.get()) {
            return modifiedBaseRange.baseRange;
        }
        else {
            const input = editor === this.inputCodeEditorView1 ? 1 : 2;
            return modifiedBaseRange.getInputRange(input);
        }
    }
    setActiveModifiedBaseRange(range, tx) {
        this.manuallySetActiveModifiedBaseRange.set({ range, counter: this.counter++ }, tx);
    }
    setState(baseRange, state, tx, inputNumber) {
        this.manuallySetActiveModifiedBaseRange.set({ range: baseRange, counter: this.counter++ }, tx);
        this.model.setState(baseRange, state, inputNumber, tx);
        this.lastFocusedEditor.clearCache(tx);
    }
    goToConflict(getModifiedBaseRange) {
        let editor = this.lastFocusedEditor.get().view;
        if (!editor) {
            editor = this.resultCodeEditorView;
        }
        const curLineNumber = editor.editor.getPosition()?.lineNumber;
        if (curLineNumber === undefined) {
            return;
        }
        const modifiedBaseRange = getModifiedBaseRange(editor, curLineNumber);
        if (modifiedBaseRange) {
            const range = this.getRangeOfModifiedBaseRange(editor, modifiedBaseRange, undefined);
            editor.editor.focus();
            let startLineNumber = range.startLineNumber;
            let endLineNumberExclusive = range.endLineNumberExclusive;
            if (range.startLineNumber > editor.editor.getModel().getLineCount()) {
                transaction(tx => {
                    this.setActiveModifiedBaseRange(modifiedBaseRange, tx);
                });
                startLineNumber = endLineNumberExclusive = editor.editor.getModel().getLineCount();
            }
            editor.editor.setPosition({
                lineNumber: startLineNumber,
                column: editor.editor.getModel().getLineFirstNonWhitespaceColumn(startLineNumber),
            });
            editor.editor.revealLinesNearTop(startLineNumber, endLineNumberExclusive, 0 /* ScrollType.Smooth */);
        }
    }
    goToNextModifiedBaseRange(predicate) {
        this.goToConflict((e, l) => this.model.modifiedBaseRanges
            .get()
            .find((r) => predicate(r) &&
            this.getRangeOfModifiedBaseRange(e, r, undefined).startLineNumber > l) ||
            this.model.modifiedBaseRanges
                .get()
                .find((r) => predicate(r)));
    }
    goToPreviousModifiedBaseRange(predicate) {
        this.goToConflict((e, l) => findLast(this.model.modifiedBaseRanges.get(), (r) => predicate(r) &&
            this.getRangeOfModifiedBaseRange(e, r, undefined).endLineNumberExclusive < l) ||
            findLast(this.model.modifiedBaseRanges.get(), (r) => predicate(r)));
    }
    toggleActiveConflict(inputNumber) {
        const activeModifiedBaseRange = this.activeModifiedBaseRange.get();
        if (!activeModifiedBaseRange) {
            this.notificationService.error(localize('noConflictMessage', "There is currently no conflict focused that can be toggled."));
            return;
        }
        transaction(tx => {
            /** @description Toggle Active Conflict */
            this.setState(activeModifiedBaseRange, this.model.getState(activeModifiedBaseRange).get().toggle(inputNumber), tx, inputNumber);
        });
    }
    acceptAll(inputNumber) {
        transaction(tx => {
            /** @description Toggle Active Conflict */
            for (const range of this.model.modifiedBaseRanges.get()) {
                this.setState(range, this.model.getState(range).get().withInputValue(inputNumber, true), tx, inputNumber);
            }
        });
    }
};
MergeEditorViewModel = __decorate([
    __param(6, IConfigurationService),
    __param(7, INotificationService),
    __metadata("design:paramtypes", [MergeEditorModel,
        InputCodeEditorView,
        InputCodeEditorView,
        ResultCodeEditorView, Object, Object, Object, Object])
], MergeEditorViewModel);
export { MergeEditorViewModel };
class AttachedHistory extends Disposable {
    constructor(model) {
        super();
        this.model = model;
        this.attachedHistory = [];
        this.previousAltId = this.model.getAlternativeVersionId();
        this._register(model.onDidChangeContent((e) => {
            const currentAltId = model.getAlternativeVersionId();
            if (e.isRedoing) {
                for (const item of this.attachedHistory) {
                    if (this.previousAltId < item.altId && item.altId <= currentAltId) {
                        item.element.redo();
                    }
                }
            }
            else if (e.isUndoing) {
                for (let i = this.attachedHistory.length - 1; i >= 0; i--) {
                    const item = this.attachedHistory[i];
                    if (currentAltId < item.altId && item.altId <= this.previousAltId) {
                        item.element.undo();
                    }
                }
            }
            else {
                // The user destroyed the redo stack by performing a non redo/undo operation.
                // Thus we also need to remove all history elements after the last version id.
                while (this.attachedHistory.length > 0
                    && this.attachedHistory[this.attachedHistory.length - 1].altId > this.previousAltId) {
                    this.attachedHistory.pop();
                }
            }
            this.previousAltId = currentAltId;
        }));
    }
    /**
     * Pushes an history item that is tied to the last text edit (or an extension of it).
     * When the last text edit is undone/redone, so is is this history item.
     */
    pushAttachedHistoryElement(element) {
        this.attachedHistory.push({ altId: this.model.getAlternativeVersionId(), element });
    }
}
