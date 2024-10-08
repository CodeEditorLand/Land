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
import { Disposable, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { LineSource, renderLines, RenderOptions } from '../../../../editor/browser/widget/diffEditor/components/diffEditorViewZones/renderLines.js';
import { diffAddDecoration, diffDeleteDecoration, diffWholeLineAddDecoration } from '../../../../editor/browser/widget/diffEditor/registrations.contribution.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { InlineDecoration } from '../../../../editor/common/viewModel.js';
import { IChatEditingService } from '../common/chatEditingService.js';
let ChatEditorController = class ChatEditorController extends Disposable {
    static { this.ID = 'editor.contrib.chatEditorController'; }
    constructor(_editor, _chatEditingService, _editorWorkerService) {
        super();
        this._editor = _editor;
        this._chatEditingService = _chatEditingService;
        this._editorWorkerService = _editorWorkerService;
        this._sessionStore = this._register(new DisposableStore());
        this._decorations = this._editor.createDecorationsCollection();
        this._viewZones = [];
        this._register(this._editor.onDidChangeModel(() => this._update()));
        this._register(this._chatEditingService.onDidChangeEditingSession(() => this._updateSessionDecorations()));
        this._register(toDisposable(() => this._clearRendering()));
    }
    _update() {
        this._sessionStore.clear();
        if (!this._editor.hasModel()) {
            return;
        }
        if (this._editor.getOption(63 /* EditorOption.inDiffEditor */)) {
            return;
        }
        const model = this._editor.getModel();
        if (this._editor.getOption(63 /* EditorOption.inDiffEditor */)) {
            this._clearRendering();
            return;
        }
        this._sessionStore.add(model.onDidChangeContent(() => this._updateSessionDecorations()));
        this._updateSessionDecorations();
    }
    _updateSessionDecorations() {
        if (!this._editor.hasModel()) {
            this._clearRendering();
            return;
        }
        const model = this._editor.getModel();
        const editingSession = this._chatEditingService.getEditingSession(model.uri);
        const entry = this._getEntry(editingSession, model);
        if (!entry || entry.state.get() !== 0 /* WorkingSetEntryState.Modified */) {
            this._clearRendering();
            return;
        }
        this._editorWorkerService.computeDiff(entry.originalURI, model.uri, {
            ignoreTrimWhitespace: false,
            maxComputationTimeMs: 1073741824 /* Constants.MAX_SAFE_SMALL_INTEGER */,
            computeMoves: false
        }, 'advanced').then(diff => {
            if (!this._editor.hasModel()) {
                this._clearRendering();
                return;
            }
            const model = this._editor.getModel();
            const editingSession = this._chatEditingService.getEditingSession(model.uri);
            const entry = this._getEntry(editingSession, model);
            if (!entry) {
                this._clearRendering();
                return;
            }
            this._updateWithDiff(model, entry, diff);
        });
    }
    _getEntry(editingSession, model) {
        if (!editingSession) {
            return null;
        }
        return editingSession.entries.get().find(e => e.modifiedURI.toString() === model.uri.toString()) || null;
    }
    _clearRendering() {
        this._editor.changeViewZones((viewZoneChangeAccessor) => {
            for (const id of this._viewZones) {
                viewZoneChangeAccessor.removeZone(id);
            }
        });
        this._viewZones = [];
        this._decorations.clear();
    }
    _updateWithDiff(model, entry, diff) {
        if (!diff) {
            this._clearRendering();
            return;
        }
        const originalModel = entry.originalModel;
        // original view zone
        this._editor.changeViewZones((viewZoneChangeAccessor) => {
            for (const id of this._viewZones) {
                viewZoneChangeAccessor.removeZone(id);
            }
            this._viewZones = [];
            const modifiedDecorations = [];
            const mightContainNonBasicASCII = originalModel.mightContainNonBasicASCII();
            const mightContainRTL = originalModel.mightContainRTL();
            const renderOptions = RenderOptions.fromEditor(this._editor);
            for (const diffEntry of diff.changes) {
                const originalRange = diffEntry.original;
                originalModel.tokenization.forceTokenization(originalRange.endLineNumberExclusive - 1);
                const source = new LineSource(originalRange.mapToLineArray(l => originalModel.tokenization.getLineTokens(l)), [], mightContainNonBasicASCII, mightContainRTL);
                const decorations = [];
                for (const i of diffEntry.innerChanges || []) {
                    decorations.push(new InlineDecoration(i.originalRange.delta(-(diffEntry.original.startLineNumber - 1)), diffDeleteDecoration.className, 0 /* InlineDecorationType.Regular */));
                    modifiedDecorations.push({ range: i.modifiedRange, options: diffAddDecoration });
                }
                if (!diffEntry.modified.isEmpty) {
                    modifiedDecorations.push({ range: diffEntry.modified.toInclusiveRange(), options: diffWholeLineAddDecoration });
                }
                const domNode = document.createElement('div');
                domNode.className = 'chat-editing-original-zone line-delete';
                const result = renderLines(source, renderOptions, decorations, domNode);
                const viewZoneData = {
                    afterLineNumber: diffEntry.modified.startLineNumber - 1,
                    heightInLines: result.heightInLines,
                    domNode,
                    ordinal: 50000 + 2 // more than https://github.com/microsoft/vscode/blob/bf52a5cfb2c75a7327c9adeaefbddc06d529dcad/src/vs/workbench/contrib/inlineChat/browser/inlineChatZoneWidget.ts#L42
                };
                this._viewZones.push(viewZoneChangeAccessor.addZone(viewZoneData));
            }
            this._decorations.set(modifiedDecorations);
        });
    }
};
ChatEditorController = __decorate([
    __param(1, IChatEditingService),
    __param(2, IEditorWorkerService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChatEditorController);
export { ChatEditorController };
