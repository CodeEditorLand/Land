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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { AccessibilityHelpNLS } from '../../../../editor/common/standaloneStrings.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { AccessibilityHelpAction } from './accessibleViewActions.js';
import { CONTEXT_CHAT_ENABLED } from '../../chat/common/chatContextKeys.js';
import { CommentAccessibilityHelpNLS } from '../../comments/browser/commentsAccessibility.js';
import { CommentContextKeys } from '../../comments/common/commentContextKeys.js';
import { NEW_UNTITLED_FILE_COMMAND_ID } from '../../files/browser/fileConstants.js';
import { IAccessibleViewService } from '../../../../platform/accessibility/browser/accessibleView.js';
export class EditorAccessibilityHelpContribution extends Disposable {
    constructor() {
        super();
        this._register(AccessibilityHelpAction.addImplementation(90, 'editor', async (accessor) => {
            const codeEditorService = accessor.get(ICodeEditorService);
            const accessibleViewService = accessor.get(IAccessibleViewService);
            const instantiationService = accessor.get(IInstantiationService);
            const commandService = accessor.get(ICommandService);
            let codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
            if (!codeEditor) {
                await commandService.executeCommand(NEW_UNTITLED_FILE_COMMAND_ID);
                codeEditor = codeEditorService.getActiveCodeEditor();
            }
            accessibleViewService.show(instantiationService.createInstance(EditorAccessibilityHelpProvider, codeEditor));
        }));
    }
}
let EditorAccessibilityHelpProvider = class EditorAccessibilityHelpProvider extends Disposable {
    onClose() {
        this._editor.focus();
    }
    constructor(_editor, _keybindingService, _contextKeyService) {
        super();
        this._editor = _editor;
        this._keybindingService = _keybindingService;
        this._contextKeyService = _contextKeyService;
        this.id = "editor";
        this.options = { type: "help", readMoreUrl: 'https://go.microsoft.com/fwlink/?linkid=851010' };
        this.verbositySettingKey = "accessibility.verbosity.editor";
    }
    provideContent() {
        const options = this._editor.getOptions();
        const content = [];
        if (options.get(63)) {
            if (options.get(94)) {
                content.push(AccessibilityHelpNLS.readonlyDiffEditor);
            }
            else {
                content.push(AccessibilityHelpNLS.editableDiffEditor);
            }
        }
        else {
            if (options.get(94)) {
                content.push(AccessibilityHelpNLS.readonlyEditor);
            }
            else {
                content.push(AccessibilityHelpNLS.editableEditor);
            }
        }
        content.push(AccessibilityHelpNLS.listSignalSounds);
        content.push(AccessibilityHelpNLS.listAlerts);
        const chatCommandInfo = getChatCommandInfo(this._keybindingService, this._contextKeyService);
        if (chatCommandInfo) {
            content.push(chatCommandInfo);
        }
        const commentCommandInfo = getCommentCommandInfo(this._keybindingService, this._contextKeyService, this._editor);
        if (commentCommandInfo) {
            content.push(commentCommandInfo);
        }
        if (options.get(118).enabled) {
            content.push(AccessibilityHelpNLS.stickScroll);
        }
        if (options.get(147)) {
            content.push(AccessibilityHelpNLS.tabFocusModeOnMsg);
        }
        else {
            content.push(AccessibilityHelpNLS.tabFocusModeOffMsg);
        }
        content.push(AccessibilityHelpNLS.codeFolding);
        content.push(AccessibilityHelpNLS.intellisense);
        content.push(AccessibilityHelpNLS.showOrFocusHover);
        content.push(AccessibilityHelpNLS.goToSymbol);
        content.push(AccessibilityHelpNLS.startDebugging);
        content.push(AccessibilityHelpNLS.setBreakpoint);
        content.push(AccessibilityHelpNLS.debugExecuteSelection);
        content.push(AccessibilityHelpNLS.addToWatch);
        return content.join('\n');
    }
};
EditorAccessibilityHelpProvider = __decorate([
    __param(1, IKeybindingService),
    __param(2, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object])
], EditorAccessibilityHelpProvider);
export function getCommentCommandInfo(keybindingService, contextKeyService, editor) {
    const editorContext = contextKeyService.getContext(editor.getDomNode());
    if (editorContext.getValue(CommentContextKeys.activeEditorHasCommentingRange.key)) {
        return [CommentAccessibilityHelpNLS.intro, CommentAccessibilityHelpNLS.addComment, CommentAccessibilityHelpNLS.nextCommentThread, CommentAccessibilityHelpNLS.previousCommentThread, CommentAccessibilityHelpNLS.nextRange, CommentAccessibilityHelpNLS.previousRange].join('\n');
    }
    return;
}
export function getChatCommandInfo(keybindingService, contextKeyService) {
    if (CONTEXT_CHAT_ENABLED.getValue(contextKeyService)) {
        return [AccessibilityHelpNLS.quickChat, AccessibilityHelpNLS.startInlineChat].join('\n');
    }
    return;
}
