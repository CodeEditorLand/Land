import { asyncTransaction, transaction } from '../../../../../base/common/observable.js';
import * as nls from '../../../../../nls.js';
import { Action2, MenuId } from '../../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { EditorAction } from '../../../../browser/editorExtensions.js';
import { EditorContextKeys } from '../../../../common/editorContextKeys.js';
import { Context as SuggestContext } from '../../../suggest/browser/suggest.js';
import { inlineSuggestCommitId, showNextInlineSuggestionActionId, showPreviousInlineSuggestionActionId } from './commandIds.js';
import { InlineCompletionContextKeys } from './inlineCompletionContextKeys.js';
import { InlineCompletionsController } from './inlineCompletionsController.js';
export class ShowNextInlineSuggestionAction extends EditorAction {
    static { this.ID = showNextInlineSuggestionActionId; }
    constructor() {
        super({
            id: ShowNextInlineSuggestionAction.ID,
            label: nls.localize('action.inlineSuggest.showNext', "Show Next Inline Suggestion"),
            alias: 'Show Next Inline Suggestion',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
            kbOpts: {
                weight: 100,
                primary: 512 | 94,
            },
        });
    }
    async run(accessor, editor) {
        const controller = InlineCompletionsController.get(editor);
        controller?.model.get()?.next();
    }
}
export class ShowPreviousInlineSuggestionAction extends EditorAction {
    static { this.ID = showPreviousInlineSuggestionActionId; }
    constructor() {
        super({
            id: ShowPreviousInlineSuggestionAction.ID,
            label: nls.localize('action.inlineSuggest.showPrevious', "Show Previous Inline Suggestion"),
            alias: 'Show Previous Inline Suggestion',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
            kbOpts: {
                weight: 100,
                primary: 512 | 92,
            },
        });
    }
    async run(accessor, editor) {
        const controller = InlineCompletionsController.get(editor);
        controller?.model.get()?.previous();
    }
}
export class TriggerInlineSuggestionAction extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.inlineSuggest.trigger',
            label: nls.localize('action.inlineSuggest.trigger', "Trigger Inline Suggestion"),
            alias: 'Trigger Inline Suggestion',
            precondition: EditorContextKeys.writable
        });
    }
    async run(accessor, editor) {
        const controller = InlineCompletionsController.get(editor);
        await asyncTransaction(async (tx) => {
            await controller?.model.get()?.triggerExplicitly(tx);
            controller?.playAccessibilitySignal(tx);
        });
    }
}
export class AcceptNextWordOfInlineCompletion extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.inlineSuggest.acceptNextWord',
            label: nls.localize('action.inlineSuggest.acceptNextWord', "Accept Next Word Of Inline Suggestion"),
            alias: 'Accept Next Word Of Inline Suggestion',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
            kbOpts: {
                weight: 100 + 1,
                primary: 2048 | 17,
                kbExpr: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
            },
            menuOpts: [{
                    menuId: MenuId.InlineSuggestionToolbar,
                    title: nls.localize('acceptWord', 'Accept Word'),
                    group: 'primary',
                    order: 2,
                }],
        });
    }
    async run(accessor, editor) {
        const controller = InlineCompletionsController.get(editor);
        await controller?.model.get()?.acceptNextWord(controller.editor);
    }
}
export class AcceptNextLineOfInlineCompletion extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.inlineSuggest.acceptNextLine',
            label: nls.localize('action.inlineSuggest.acceptNextLine', "Accept Next Line Of Inline Suggestion"),
            alias: 'Accept Next Line Of Inline Suggestion',
            precondition: ContextKeyExpr.and(EditorContextKeys.writable, InlineCompletionContextKeys.inlineSuggestionVisible),
            kbOpts: {
                weight: 100 + 1,
            },
            menuOpts: [{
                    menuId: MenuId.InlineSuggestionToolbar,
                    title: nls.localize('acceptLine', 'Accept Line'),
                    group: 'secondary',
                    order: 2,
                }],
        });
    }
    async run(accessor, editor) {
        const controller = InlineCompletionsController.get(editor);
        await controller?.model.get()?.acceptNextLine(controller.editor);
    }
}
export class AcceptInlineCompletion extends EditorAction {
    constructor() {
        super({
            id: inlineSuggestCommitId,
            label: nls.localize('action.inlineSuggest.accept', "Accept Inline Suggestion"),
            alias: 'Accept Inline Suggestion',
            precondition: ContextKeyExpr.or(InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.inlineEditVisible),
            menuOpts: [{
                    menuId: MenuId.InlineSuggestionToolbar,
                    title: nls.localize('accept', "Accept"),
                    group: 'primary',
                    order: 1,
                }, {
                    menuId: MenuId.InlineEditsActions,
                    title: nls.localize('accept', "Accept"),
                    group: 'primary',
                    order: 1,
                }],
            kbOpts: {
                primary: 2,
                weight: 200,
                kbExpr: ContextKeyExpr.or(ContextKeyExpr.and(InlineCompletionContextKeys.inlineSuggestionVisible, EditorContextKeys.tabMovesFocus.toNegated(), SuggestContext.Visible.toNegated(), EditorContextKeys.hoverFocused.toNegated(), InlineCompletionContextKeys.inlineSuggestionHasIndentationLessThanTabSize), ContextKeyExpr.and(InlineCompletionContextKeys.inlineEditVisible, EditorContextKeys.tabMovesFocus.toNegated(), SuggestContext.Visible.toNegated(), EditorContextKeys.hoverFocused.toNegated(), InlineCompletionContextKeys.hasSelection.toNegated(), InlineCompletionContextKeys.cursorAtInlineEdit)),
            }
        });
    }
    async run(accessor, editor) {
        const controller = InlineCompletionsController.get(editor);
        if (controller) {
            controller.model.get()?.accept(controller.editor);
            controller.editor.focus();
        }
    }
}
export class JumpToNextInlineEdit extends EditorAction {
    constructor() {
        super({
            id: 'editor.action.inlineSuggest.jump',
            label: nls.localize('action.inlineSuggest.jump', "Jump to next inline edit"),
            alias: 'Jump to next inline edit',
            precondition: InlineCompletionContextKeys.inlineEditVisible,
            menuOpts: [{
                    menuId: MenuId.InlineEditsActions,
                    title: nls.localize('jump', "Jump"),
                    group: 'primary',
                    order: 2,
                    when: InlineCompletionContextKeys.cursorAtInlineEdit.toNegated(),
                }],
            kbOpts: {
                primary: 2,
                weight: 201,
                kbExpr: ContextKeyExpr.and(InlineCompletionContextKeys.inlineEditVisible, InlineCompletionContextKeys.hasSelection.toNegated(), EditorContextKeys.tabMovesFocus.toNegated(), SuggestContext.Visible.toNegated(), EditorContextKeys.hoverFocused.toNegated(), InlineCompletionContextKeys.cursorAtInlineEdit.toNegated()),
            }
        });
    }
    async run(accessor, editor) {
        const controller = InlineCompletionsController.get(editor);
        if (controller) {
            controller.jump();
        }
    }
}
export class HideInlineCompletion extends EditorAction {
    static { this.ID = 'editor.action.inlineSuggest.hide'; }
    constructor() {
        super({
            id: HideInlineCompletion.ID,
            label: nls.localize('action.inlineSuggest.hide', "Hide Inline Suggestion"),
            alias: 'Hide Inline Suggestion',
            precondition: ContextKeyExpr.or(InlineCompletionContextKeys.inlineSuggestionVisible, InlineCompletionContextKeys.inlineEditVisible),
            kbOpts: {
                weight: 100,
                primary: 9,
            }
        });
    }
    async run(accessor, editor) {
        const controller = InlineCompletionsController.get(editor);
        transaction(tx => {
            controller?.model.get()?.stop(tx);
        });
    }
}
export class ToggleAlwaysShowInlineSuggestionToolbar extends Action2 {
    static { this.ID = 'editor.action.inlineSuggest.toggleAlwaysShowToolbar'; }
    constructor() {
        super({
            id: ToggleAlwaysShowInlineSuggestionToolbar.ID,
            title: nls.localize('action.inlineSuggest.alwaysShowToolbar', "Always Show Toolbar"),
            f1: false,
            precondition: undefined,
            menu: [{
                    id: MenuId.InlineSuggestionToolbar,
                    group: 'secondary',
                    order: 10,
                }],
            toggled: ContextKeyExpr.equals('config.editor.inlineSuggest.showToolbar', 'always')
        });
    }
    async run(accessor, editor) {
        const configService = accessor.get(IConfigurationService);
        const currentValue = configService.getValue('editor.inlineSuggest.showToolbar');
        const newValue = currentValue === 'always' ? 'onHover' : 'always';
        configService.updateValue('editor.inlineSuggest.showToolbar', newValue);
    }
}
