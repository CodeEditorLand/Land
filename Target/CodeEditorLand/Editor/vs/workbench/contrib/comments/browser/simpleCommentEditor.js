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
import { EditorExtensionsRegistry } from '../../../../editor/browser/editorExtensions.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
// Allowed Editor Contributions:
import { MenuPreventer } from '../../codeEditor/browser/menuPreventer.js';
import { EditorDictation } from '../../codeEditor/browser/dictation/editorDictation.js';
import { ContextMenuController } from '../../../../editor/contrib/contextmenu/browser/contextmenu.js';
import { SuggestController } from '../../../../editor/contrib/suggest/browser/suggestController.js';
import { SnippetController2 } from '../../../../editor/contrib/snippet/browser/snippetController2.js';
import { TabCompletionController } from '../../snippets/browser/tabCompletion.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { CommentContextKeys } from '../common/commentContextKeys.js';
import { ILanguageConfigurationService } from '../../../../editor/common/languages/languageConfigurationRegistry.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { clamp } from '../../../../base/common/numbers.js';
import { CopyPasteController } from '../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js';
import { CodeActionController } from '../../../../editor/contrib/codeAction/browser/codeActionController.js';
import { DropIntoEditorController } from '../../../../editor/contrib/dropOrPasteInto/browser/dropIntoEditorController.js';
import { InlineCompletionsController } from '../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js';
import { LinkDetector } from '../../../../editor/contrib/links/browser/links.js';
import { MessageController } from '../../../../editor/contrib/message/browser/messageController.js';
import { SelectionClipboardContributionID } from '../../codeEditor/browser/selectionClipboard.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { ContentHoverController } from '../../../../editor/contrib/hover/browser/contentHoverController.js';
import { GlyphHoverController } from '../../../../editor/contrib/hover/browser/glyphHoverController.js';
export const ctxCommentEditorFocused = new RawContextKey('commentEditorFocused', false);
export const MIN_EDITOR_HEIGHT = 5 * 18;
export const MAX_EDITOR_HEIGHT = 25 * 18;
let SimpleCommentEditor = class SimpleCommentEditor extends CodeEditorWidget {
    constructor(domElement, options, scopedContextKeyService, parentThread, instantiationService, codeEditorService, commandService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService) {
        const codeEditorWidgetOptions = {
            contributions: [
                { id: MenuPreventer.ID, ctor: MenuPreventer, instantiation: 2 /* EditorContributionInstantiation.BeforeFirstInteraction */ },
                { id: ContextMenuController.ID, ctor: ContextMenuController, instantiation: 2 /* EditorContributionInstantiation.BeforeFirstInteraction */ },
                { id: SuggestController.ID, ctor: SuggestController, instantiation: 0 /* EditorContributionInstantiation.Eager */ },
                { id: SnippetController2.ID, ctor: SnippetController2, instantiation: 4 /* EditorContributionInstantiation.Lazy */ },
                { id: TabCompletionController.ID, ctor: TabCompletionController, instantiation: 0 /* EditorContributionInstantiation.Eager */ }, // eager because it needs to define a context key
                { id: EditorDictation.ID, ctor: EditorDictation, instantiation: 4 /* EditorContributionInstantiation.Lazy */ },
                ...EditorExtensionsRegistry.getSomeEditorContributions([
                    CopyPasteController.ID,
                    DropIntoEditorController.ID,
                    LinkDetector.ID,
                    MessageController.ID,
                    ContentHoverController.ID,
                    GlyphHoverController.ID,
                    SelectionClipboardContributionID,
                    InlineCompletionsController.ID,
                    CodeActionController.ID,
                ])
            ],
            contextMenuId: MenuId.SimpleEditorContext
        };
        super(domElement, options, codeEditorWidgetOptions, instantiationService, codeEditorService, commandService, scopedContextKeyService, themeService, notificationService, accessibilityService, languageConfigurationService, languageFeaturesService);
        this._commentEditorFocused = ctxCommentEditorFocused.bindTo(scopedContextKeyService);
        this._commentEditorEmpty = CommentContextKeys.commentIsEmpty.bindTo(scopedContextKeyService);
        this._commentEditorEmpty.set(!this.getModel()?.getValueLength());
        this._parentThread = parentThread;
        this._register(this.onDidFocusEditorWidget(_ => this._commentEditorFocused.set(true)));
        this._register(this.onDidChangeModelContent(e => this._commentEditorEmpty.set(!this.getModel()?.getValueLength())));
        this._register(this.onDidBlurEditorWidget(_ => this._commentEditorFocused.reset()));
    }
    getParentThread() {
        return this._parentThread;
    }
    _getActions() {
        return EditorExtensionsRegistry.getEditorActions();
    }
    updateOptions(newOptions) {
        const withLineNumberRemoved = { ...newOptions, lineNumbers: 'off' };
        super.updateOptions(withLineNumberRemoved);
    }
    static getEditorOptions(configurationService) {
        return {
            wordWrap: 'on',
            glyphMargin: false,
            lineNumbers: 'off',
            folding: false,
            selectOnLineNumbers: false,
            scrollbar: {
                vertical: 'visible',
                verticalScrollbarSize: 14,
                horizontal: 'auto',
                useShadows: true,
                verticalHasArrows: false,
                horizontalHasArrows: false,
                alwaysConsumeMouseWheel: false
            },
            overviewRulerLanes: 2,
            lineDecorationsWidth: 0,
            scrollBeyondLastLine: false,
            renderLineHighlight: 'none',
            fixedOverflowWidgets: true,
            acceptSuggestionOnEnter: 'smart',
            minimap: {
                enabled: false
            },
            dropIntoEditor: { enabled: true },
            autoClosingBrackets: configurationService.getValue('editor.autoClosingBrackets'),
            quickSuggestions: false,
            accessibilitySupport: configurationService.getValue('editor.accessibilitySupport'),
            fontFamily: configurationService.getValue('editor.fontFamily'),
        };
    }
};
SimpleCommentEditor = __decorate([
    __param(4, IInstantiationService),
    __param(5, ICodeEditorService),
    __param(6, ICommandService),
    __param(7, IThemeService),
    __param(8, INotificationService),
    __param(9, IAccessibilityService),
    __param(10, ILanguageConfigurationService),
    __param(11, ILanguageFeaturesService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], SimpleCommentEditor);
export { SimpleCommentEditor };
export function calculateEditorHeight(parentEditor, editor, currentHeight) {
    const layoutInfo = editor.getLayoutInfo();
    const lineHeight = editor.getOption(69 /* EditorOption.lineHeight */);
    const contentHeight = (editor._getViewModel()?.getLineCount() * lineHeight); // Can't just call getContentHeight() because it returns an incorrect, large, value when the editor is first created.
    if ((contentHeight > layoutInfo.height) ||
        (contentHeight < layoutInfo.height && currentHeight > MIN_EDITOR_HEIGHT)) {
        const linesToAdd = Math.ceil((contentHeight - layoutInfo.height) / lineHeight);
        const proposedHeight = layoutInfo.height + (lineHeight * linesToAdd);
        return clamp(proposedHeight, MIN_EDITOR_HEIGHT, clamp(parentEditor.getLayoutInfo().height - 90, MIN_EDITOR_HEIGHT, MAX_EDITOR_HEIGHT));
    }
    return currentHeight;
}
