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
import { createTrustedTypesPolicy } from '../../../../../../base/browser/trustedTypes.js';
import { Event } from '../../../../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../../../../base/common/lifecycle.js';
import { autorun, derived, observableSignalFromEvent, observableValue } from '../../../../../../base/common/observable.js';
import * as strings from '../../../../../../base/common/strings.js';
import { applyFontInfo } from '../../../../../browser/config/domFontInfo.js';
import { observableCodeEditor } from '../../../../../browser/observableCodeEditor.js';
import { EditorFontLigatures } from '../../../../../common/config/editorOptions.js';
import { OffsetEdit, SingleOffsetEdit } from '../../../../../common/core/offsetEdit.js';
import { Position } from '../../../../../common/core/position.js';
import { Range } from '../../../../../common/core/range.js';
import { StringBuilder } from '../../../../../common/core/stringBuilder.js';
import { ILanguageService } from '../../../../../common/languages/language.js';
import { InjectedTextCursorStops } from '../../../../../common/model.js';
import { LineEditWithAdditionalLines } from '../../../../../common/tokenizationTextModelPart.js';
import { LineTokens } from '../../../../../common/tokens/lineTokens.js';
import { LineDecoration } from '../../../../../common/viewLayout/lineDecorations.js';
import { RenderLineInput, renderViewLine } from '../../../../../common/viewLayout/viewLineRenderer.js';
import { GhostTextReplacement } from '../../model/ghostText.js';
import { ColumnRange } from '../../utils.js';
import './ghostTextView.css';
let GhostTextView = class GhostTextView extends Disposable {
    constructor(_editor, _model, _languageService) {
        super();
        this._editor = _editor;
        this._model = _model;
        this._languageService = _languageService;
        this._isDisposed = observableValue(this, false);
        this._editorObs = observableCodeEditor(this._editor);
        this._useSyntaxHighlighting = this._editorObs.getOption(64 /* EditorOption.inlineSuggest */).map(v => v.syntaxHighlightingEnabled);
        this.uiState = derived(this, reader => {
            if (this._isDisposed.read(reader)) {
                return undefined;
            }
            const textModel = this._editorObs.model.read(reader);
            if (textModel !== this._model.targetTextModel.read(reader)) {
                return undefined;
            }
            const ghostText = this._model.ghostText.read(reader);
            if (!ghostText) {
                return undefined;
            }
            const replacedRange = ghostText instanceof GhostTextReplacement ? ghostText.columnRange : undefined;
            const syntaxHighlightingEnabled = this._useSyntaxHighlighting.read(reader);
            const extraClassName = syntaxHighlightingEnabled ? ' syntax-highlighted' : '';
            const { inlineTexts, additionalLines, hiddenRange } = computeGhostTextViewData(ghostText, textModel, 'ghost-text' + extraClassName);
            const edit = new OffsetEdit(inlineTexts.map(t => SingleOffsetEdit.insert(t.column - 1, t.text)));
            const tokens = syntaxHighlightingEnabled ? textModel.tokenization.tokenizeLineWithEdit(ghostText.lineNumber, new LineEditWithAdditionalLines(edit, additionalLines.map(l => l.content))) : undefined;
            const newRanges = edit.getNewTextRanges();
            const inlineTextsWithTokens = inlineTexts.map((t, idx) => ({ ...t, tokens: tokens?.mainLineTokens?.getTokensInRange(newRanges[idx]) }));
            const tokenizedAdditionalLines = additionalLines.map((l, idx) => ({
                content: tokens?.additionalLines?.[idx] ?? LineTokens.createEmpty(l.content, this._languageService.languageIdCodec),
                decorations: l.decorations,
            }));
            return {
                replacedRange,
                inlineTexts: inlineTextsWithTokens,
                additionalLines: tokenizedAdditionalLines,
                hiddenRange,
                lineNumber: ghostText.lineNumber,
                additionalReservedLineCount: this._model.minReservedLineCount.read(reader),
                targetTextModel: textModel,
                syntaxHighlightingEnabled,
            };
        });
        this.decorations = derived(this, reader => {
            const uiState = this.uiState.read(reader);
            if (!uiState) {
                return [];
            }
            const decorations = [];
            const extraClassName = uiState.syntaxHighlightingEnabled ? ' syntax-highlighted' : '';
            if (uiState.replacedRange) {
                decorations.push({
                    range: uiState.replacedRange.toRange(uiState.lineNumber),
                    options: { inlineClassName: 'inline-completion-text-to-replace' + extraClassName, description: 'GhostTextReplacement' }
                });
            }
            if (uiState.hiddenRange) {
                decorations.push({
                    range: uiState.hiddenRange.toRange(uiState.lineNumber),
                    options: { inlineClassName: 'ghost-text-hidden', description: 'ghost-text-hidden', }
                });
            }
            for (const p of uiState.inlineTexts) {
                decorations.push({
                    range: Range.fromPositions(new Position(uiState.lineNumber, p.column)),
                    options: {
                        description: 'ghost-text-decoration',
                        after: {
                            content: p.text,
                            tokens: p.tokens,
                            inlineClassName: p.preview ? 'ghost-text-decoration-preview' : 'ghost-text-decoration' + extraClassName,
                            cursorStops: InjectedTextCursorStops.Left
                        },
                        showIfCollapsed: true,
                    }
                });
            }
            return decorations;
        });
        this.additionalLinesWidget = this._register(new AdditionalLinesWidget(this._editor, derived(reader => {
            /** @description lines */
            const uiState = this.uiState.read(reader);
            return uiState ? {
                lineNumber: uiState.lineNumber,
                additionalLines: uiState.additionalLines,
                minReservedLineCount: uiState.additionalReservedLineCount,
                targetTextModel: uiState.targetTextModel,
            } : undefined;
        })));
        this._register(toDisposable(() => { this._isDisposed.set(true, undefined); }));
        this._register(this._editorObs.setDecorations(this.decorations));
    }
    ownsViewZone(viewZoneId) {
        return this.additionalLinesWidget.viewZoneId === viewZoneId;
    }
};
GhostTextView = __decorate([
    __param(2, ILanguageService),
    __metadata("design:paramtypes", [Object, Object, Object])
], GhostTextView);
export { GhostTextView };
function computeGhostTextViewData(ghostText, textModel, ghostTextClassName) {
    const inlineTexts = [];
    const additionalLines = [];
    function addToAdditionalLines(lines, className) {
        if (additionalLines.length > 0) {
            const lastLine = additionalLines[additionalLines.length - 1];
            if (className) {
                lastLine.decorations.push(new LineDecoration(lastLine.content.length + 1, lastLine.content.length + 1 + lines[0].length, className, 0 /* InlineDecorationType.Regular */));
            }
            lastLine.content += lines[0];
            lines = lines.slice(1);
        }
        for (const line of lines) {
            additionalLines.push({
                content: line,
                decorations: className ? [new LineDecoration(1, line.length + 1, className, 0 /* InlineDecorationType.Regular */)] : []
            });
        }
    }
    const textBufferLine = textModel.getLineContent(ghostText.lineNumber);
    let hiddenTextStartColumn = undefined;
    let lastIdx = 0;
    for (const part of ghostText.parts) {
        let lines = part.lines;
        if (hiddenTextStartColumn === undefined) {
            inlineTexts.push({ column: part.column, text: lines[0], preview: part.preview });
            lines = lines.slice(1);
        }
        else {
            addToAdditionalLines([textBufferLine.substring(lastIdx, part.column - 1)], undefined);
        }
        if (lines.length > 0) {
            addToAdditionalLines(lines, ghostTextClassName);
            if (hiddenTextStartColumn === undefined && part.column <= textBufferLine.length) {
                hiddenTextStartColumn = part.column;
            }
        }
        lastIdx = part.column - 1;
    }
    if (hiddenTextStartColumn !== undefined) {
        addToAdditionalLines([textBufferLine.substring(lastIdx)], undefined);
    }
    const hiddenRange = hiddenTextStartColumn !== undefined ? new ColumnRange(hiddenTextStartColumn, textBufferLine.length + 1) : undefined;
    return {
        inlineTexts,
        additionalLines,
        hiddenRange,
    };
}
export class AdditionalLinesWidget extends Disposable {
    get viewZoneId() { return this._viewZoneId; }
    constructor(editor, lines) {
        super();
        this.editor = editor;
        this.lines = lines;
        this._viewZoneId = undefined;
        this.editorOptionsChanged = observableSignalFromEvent('editorOptionChanged', Event.filter(this.editor.onDidChangeConfiguration, e => e.hasChanged(33 /* EditorOption.disableMonospaceOptimizations */)
            || e.hasChanged(121 /* EditorOption.stopRenderingLineAfter */)
            || e.hasChanged(103 /* EditorOption.renderWhitespace */)
            || e.hasChanged(98 /* EditorOption.renderControlCharacters */)
            || e.hasChanged(53 /* EditorOption.fontLigatures */)
            || e.hasChanged(52 /* EditorOption.fontInfo */)
            || e.hasChanged(69 /* EditorOption.lineHeight */)));
        this._register(autorun(reader => {
            /** @description update view zone */
            const lines = this.lines.read(reader);
            this.editorOptionsChanged.read(reader);
            if (lines) {
                this.updateLines(lines.lineNumber, lines.additionalLines, lines.minReservedLineCount);
            }
            else {
                this.clear();
            }
        }));
    }
    dispose() {
        super.dispose();
        this.clear();
    }
    clear() {
        this.editor.changeViewZones((changeAccessor) => {
            if (this._viewZoneId) {
                changeAccessor.removeZone(this._viewZoneId);
                this._viewZoneId = undefined;
            }
        });
    }
    updateLines(lineNumber, additionalLines, minReservedLineCount) {
        const textModel = this.editor.getModel();
        if (!textModel) {
            return;
        }
        const { tabSize } = textModel.getOptions();
        this.editor.changeViewZones((changeAccessor) => {
            if (this._viewZoneId) {
                changeAccessor.removeZone(this._viewZoneId);
                this._viewZoneId = undefined;
            }
            const heightInLines = Math.max(additionalLines.length, minReservedLineCount);
            if (heightInLines > 0) {
                const domNode = document.createElement('div');
                renderLines(domNode, tabSize, additionalLines, this.editor.getOptions());
                this._viewZoneId = changeAccessor.addZone({
                    afterLineNumber: lineNumber,
                    heightInLines: heightInLines,
                    domNode,
                    afterColumnAffinity: 1 /* PositionAffinity.Right */
                });
            }
        });
    }
}
function renderLines(domNode, tabSize, lines, opts) {
    const disableMonospaceOptimizations = opts.get(33 /* EditorOption.disableMonospaceOptimizations */);
    const stopRenderingLineAfter = opts.get(121 /* EditorOption.stopRenderingLineAfter */);
    // To avoid visual confusion, we don't want to render visible whitespace
    const renderWhitespace = 'none';
    const renderControlCharacters = opts.get(98 /* EditorOption.renderControlCharacters */);
    const fontLigatures = opts.get(53 /* EditorOption.fontLigatures */);
    const fontInfo = opts.get(52 /* EditorOption.fontInfo */);
    const lineHeight = opts.get(69 /* EditorOption.lineHeight */);
    const sb = new StringBuilder(10000);
    sb.appendString('<div class="suggest-preview-text">');
    for (let i = 0, len = lines.length; i < len; i++) {
        const lineData = lines[i];
        const lineTokens = lineData.content;
        sb.appendString('<div class="view-line');
        sb.appendString('" style="top:');
        sb.appendString(String(i * lineHeight));
        sb.appendString('px;width:1000000px;">');
        const line = lineTokens.getLineContent();
        const isBasicASCII = strings.isBasicASCII(line);
        const containsRTL = strings.containsRTL(line);
        renderViewLine(new RenderLineInput((fontInfo.isMonospace && !disableMonospaceOptimizations), fontInfo.canUseHalfwidthRightwardsArrow, line, false, isBasicASCII, containsRTL, 0, lineTokens, lineData.decorations, tabSize, 0, fontInfo.spaceWidth, fontInfo.middotWidth, fontInfo.wsmiddotWidth, stopRenderingLineAfter, renderWhitespace, renderControlCharacters, fontLigatures !== EditorFontLigatures.OFF, null), sb);
        sb.appendString('</div>');
    }
    sb.appendString('</div>');
    applyFontInfo(domNode, fontInfo);
    const html = sb.build();
    const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
    domNode.innerHTML = trustedhtml;
}
export const ttPolicy = createTrustedTypesPolicy('editorGhostText', { createHTML: value => value });
