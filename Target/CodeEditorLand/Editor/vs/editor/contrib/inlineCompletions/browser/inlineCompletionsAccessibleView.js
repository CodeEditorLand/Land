/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../../base/common/event.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { InlineCompletionContextKeys } from './controller/inlineCompletionContextKeys.js';
import { InlineCompletionsController } from './controller/inlineCompletionsController.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export class InlineCompletionsAccessibleView {
    constructor() {
        this.type = "view" /* AccessibleViewType.View */;
        this.priority = 95;
        this.name = 'inline-completions';
        this.when = ContextKeyExpr.and(InlineCompletionContextKeys.inlineSuggestionVisible);
    }
    getProvider(accessor) {
        const codeEditorService = accessor.get(ICodeEditorService);
        const editor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
        if (!editor) {
            return;
        }
        const model = InlineCompletionsController.get(editor)?.model.get();
        if (!model?.state.get()) {
            return;
        }
        return new InlineCompletionsAccessibleViewContentProvider(editor, model);
    }
}
class InlineCompletionsAccessibleViewContentProvider extends Disposable {
    constructor(_editor, _model) {
        super();
        this._editor = _editor;
        this._model = _model;
        this._onDidChangeContent = this._register(new Emitter());
        this.onDidChangeContent = this._onDidChangeContent.event;
        this.id = "inlineCompletions" /* AccessibleViewProviderId.InlineCompletions */;
        this.verbositySettingKey = 'accessibility.verbosity.inlineCompletions';
        this.options = { language: this._editor.getModel()?.getLanguageId() ?? undefined, type: "view" /* AccessibleViewType.View */ };
    }
    provideContent() {
        const state = this._model.state.get();
        if (!state) {
            throw new Error('Inline completion is visible but state is not available');
        }
        const lineText = this._model.textModel.getLineContent(state.primaryGhostText.lineNumber);
        const ghostText = state.primaryGhostText.renderForScreenReader(lineText);
        if (!ghostText) {
            throw new Error('Inline completion is visible but ghost text is not available');
        }
        return lineText + ghostText;
    }
    provideNextContent() {
        // asynchronously update the model and fire the event
        this._model.next().then((() => this._onDidChangeContent.fire()));
        return;
    }
    providePreviousContent() {
        // asynchronously update the model and fire the event
        this._model.previous().then((() => this._onDidChangeContent.fire()));
        return;
    }
    onClose() {
        this._model.stop();
        this._editor.focus();
    }
}
