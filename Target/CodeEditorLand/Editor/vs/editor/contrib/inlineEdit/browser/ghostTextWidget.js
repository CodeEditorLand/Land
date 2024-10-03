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
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { derived, observableFromEvent, observableValue } from '../../../../base/common/observable.js';
import './inlineEdit.css';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { ILanguageService } from '../../../common/languages/language.js';
import { InjectedTextCursorStops } from '../../../common/model.js';
import { LineDecoration } from '../../../common/viewLayout/lineDecorations.js';
import { AdditionalLinesWidget } from '../../inlineCompletions/browser/view/ghostText/ghostTextView.js';
import { ColumnRange } from '../../inlineCompletions/browser/utils.js';
import { diffDeleteDecoration, diffLineDeleteDecorationBackgroundWithIndicator } from '../../../browser/widget/diffEditor/registrations.contribution.js';
import { LineTokens } from '../../../common/tokens/lineTokens.js';
import { observableCodeEditor } from '../../../browser/observableCodeEditor.js';
export const INLINE_EDIT_DESCRIPTION = 'inline-edit';
let GhostTextWidget = class GhostTextWidget extends Disposable {
    constructor(_editor, model, languageService) {
        super();
        this._editor = _editor;
        this.model = model;
        this.languageService = languageService;
        this.isDisposed = observableValue(this, false);
        this.currentTextModel = observableFromEvent(this, this._editor.onDidChangeModel, () => this._editor.getModel());
        this._editorObs = observableCodeEditor(this._editor);
        this.uiState = derived(this, reader => {
            if (this.isDisposed.read(reader)) {
                return undefined;
            }
            const textModel = this.currentTextModel.read(reader);
            if (textModel !== this.model.targetTextModel.read(reader)) {
                return undefined;
            }
            const ghostText = this.model.ghostText.read(reader);
            if (!ghostText) {
                return undefined;
            }
            let range = this.model.range?.read(reader);
            if (range && range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
                range = undefined;
            }
            const isSingleLine = (range ? range.startLineNumber === range.endLineNumber : true) && ghostText.parts.length === 1 && ghostText.parts[0].lines.length === 1;
            const isPureRemove = ghostText.parts.length === 1 && ghostText.parts[0].lines.every(l => l.length === 0);
            const inlineTexts = [];
            const additionalLines = [];
            function addToAdditionalLines(lines, className) {
                if (additionalLines.length > 0) {
                    const lastLine = additionalLines[additionalLines.length - 1];
                    if (className) {
                        lastLine.decorations.push(new LineDecoration(lastLine.content.length + 1, lastLine.content.length + 1 + lines[0].length, className, 0));
                    }
                    lastLine.content += lines[0];
                    lines = lines.slice(1);
                }
                for (const line of lines) {
                    additionalLines.push({
                        content: line,
                        decorations: className ? [new LineDecoration(1, line.length + 1, className, 0)] : []
                    });
                }
            }
            const textBufferLine = textModel.getLineContent(ghostText.lineNumber);
            let hiddenTextStartColumn = undefined;
            let lastIdx = 0;
            if (!isPureRemove && (isSingleLine || !range)) {
                for (const part of ghostText.parts) {
                    let lines = part.lines;
                    if (range && !isSingleLine) {
                        addToAdditionalLines(lines, INLINE_EDIT_DESCRIPTION);
                        lines = [];
                    }
                    if (hiddenTextStartColumn === undefined) {
                        inlineTexts.push({
                            column: part.column,
                            text: lines[0],
                            preview: part.preview,
                        });
                        lines = lines.slice(1);
                    }
                    else {
                        addToAdditionalLines([textBufferLine.substring(lastIdx, part.column - 1)], undefined);
                    }
                    if (lines.length > 0) {
                        addToAdditionalLines(lines, INLINE_EDIT_DESCRIPTION);
                        if (hiddenTextStartColumn === undefined && part.column <= textBufferLine.length) {
                            hiddenTextStartColumn = part.column;
                        }
                    }
                    lastIdx = part.column - 1;
                }
                if (hiddenTextStartColumn !== undefined) {
                    addToAdditionalLines([textBufferLine.substring(lastIdx)], undefined);
                }
            }
            const hiddenRange = hiddenTextStartColumn !== undefined ? new ColumnRange(hiddenTextStartColumn, textBufferLine.length + 1) : undefined;
            const lineNumber = (isSingleLine || !range) ? ghostText.lineNumber : range.endLineNumber - 1;
            return {
                inlineTexts,
                additionalLines,
                hiddenRange,
                lineNumber,
                additionalReservedLineCount: this.model.minReservedLineCount.read(reader),
                targetTextModel: textModel,
                range,
                isSingleLine,
                isPureRemove,
            };
        });
        this.decorations = derived(this, reader => {
            const uiState = this.uiState.read(reader);
            if (!uiState) {
                return [];
            }
            const decorations = [];
            if (uiState.hiddenRange) {
                decorations.push({
                    range: uiState.hiddenRange.toRange(uiState.lineNumber),
                    options: { inlineClassName: 'inline-edit-hidden', description: 'inline-edit-hidden', }
                });
            }
            if (uiState.range) {
                const ranges = [];
                if (uiState.isSingleLine) {
                    ranges.push(uiState.range);
                }
                else if (!uiState.isPureRemove) {
                    const lines = uiState.range.endLineNumber - uiState.range.startLineNumber;
                    for (let i = 0; i < lines; i++) {
                        const line = uiState.range.startLineNumber + i;
                        const firstNonWhitespace = uiState.targetTextModel.getLineFirstNonWhitespaceColumn(line);
                        const lastNonWhitespace = uiState.targetTextModel.getLineLastNonWhitespaceColumn(line);
                        const range = new Range(line, firstNonWhitespace, line, lastNonWhitespace);
                        ranges.push(range);
                    }
                }
                for (const range of ranges) {
                    decorations.push({
                        range,
                        options: diffDeleteDecoration
                    });
                }
            }
            if (uiState.range && !uiState.isSingleLine && uiState.isPureRemove) {
                const r = new Range(uiState.range.startLineNumber, 1, uiState.range.endLineNumber - 1, 1);
                decorations.push({
                    range: r,
                    options: diffLineDeleteDecorationBackgroundWithIndicator
                });
            }
            for (const p of uiState.inlineTexts) {
                decorations.push({
                    range: Range.fromPositions(new Position(uiState.lineNumber, p.column)),
                    options: {
                        description: INLINE_EDIT_DESCRIPTION,
                        after: { content: p.text, inlineClassName: p.preview ? 'inline-edit-decoration-preview' : 'inline-edit-decoration', cursorStops: InjectedTextCursorStops.Left },
                        showIfCollapsed: true,
                    }
                });
            }
            return decorations;
        });
        this.additionalLinesWidget = this._register(new AdditionalLinesWidget(this._editor, derived(reader => {
            const uiState = this.uiState.read(reader);
            return uiState && !uiState.isPureRemove && (uiState.isSingleLine || !uiState.range) ? {
                lineNumber: uiState.lineNumber,
                additionalLines: uiState.additionalLines.map(l => ({
                    content: LineTokens.createEmpty(l.content, this.languageService.languageIdCodec),
                    decorations: l.decorations
                })),
                minReservedLineCount: uiState.additionalReservedLineCount,
                targetTextModel: uiState.targetTextModel,
            } : undefined;
        })));
        this._register(toDisposable(() => { this.isDisposed.set(true, undefined); }));
        this._register(this._editorObs.setDecorations(this.decorations));
    }
    ownsViewZone(viewZoneId) {
        return this.additionalLinesWidget.viewZoneId === viewZoneId;
    }
};
GhostTextWidget = __decorate([
    __param(2, ILanguageService),
    __metadata("design:paramtypes", [Object, Object, Object])
], GhostTextWidget);
export { GhostTextWidget };
