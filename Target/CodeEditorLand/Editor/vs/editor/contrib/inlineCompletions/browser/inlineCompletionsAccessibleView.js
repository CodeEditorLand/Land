import { Emitter } from '../../../../base/common/event.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { InlineCompletionContextKeys } from './controller/inlineCompletionContextKeys.js';
import { InlineCompletionsController } from './controller/inlineCompletionsController.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export class InlineCompletionsAccessibleView {
    constructor() {
        this.type = "view";
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
        this.id = "inlineCompletions";
        this.verbositySettingKey = 'accessibility.verbosity.inlineCompletions';
        this.options = { language: this._editor.getModel()?.getLanguageId() ?? undefined, type: "view" };
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
        this._model.next().then((() => this._onDidChangeContent.fire()));
        return;
    }
    providePreviousContent() {
        this._model.previous().then((() => this._onDidChangeContent.fire()));
        return;
    }
    onClose() {
        this._model.stop();
        this._editor.focus();
    }
}
