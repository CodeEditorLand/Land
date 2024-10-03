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
import './media/review.css';
import * as dom from '../../../../base/browser/dom.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, dispose, toDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import * as languages from '../../../../editor/common/languages.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { CommentReply } from './commentReply.js';
import { ICommentService } from './commentService.js';
import { CommentThreadBody } from './commentThreadBody.js';
import { CommentThreadHeader } from './commentThreadHeader.js';
import { CommentThreadAdditionalActions } from './commentThreadAdditionalActions.js';
import { CommentContextKeys } from '../common/commentContextKeys.js';
import { contrastBorder, focusBorder, inputValidationErrorBackground, inputValidationErrorBorder, inputValidationErrorForeground, textBlockQuoteBackground, textBlockQuoteBorder, textLinkActiveForeground, textLinkForeground } from '../../../../platform/theme/common/colorRegistry.js';
import { PANEL_BORDER } from '../../../common/theme.js';
import { Range } from '../../../../editor/common/core/range.js';
import { commentThreadStateBackgroundColorVar, commentThreadStateColorVar } from './commentColors.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { registerNavigableContainer } from '../../../browser/actions/widgetNavigationCommands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { COMMENTS_SECTION } from '../common/commentsConfiguration.js';
import { localize } from '../../../../nls.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { DomEmitter } from '../../../../base/browser/event.js';
import { isCodeEditor } from '../../../../editor/browser/editorBrowser.js';
export const COMMENTEDITOR_DECORATION_KEY = 'commenteditordecoration';
let CommentThreadWidget = class CommentThreadWidget extends Disposable {
    get commentThread() {
        return this._commentThread;
    }
    constructor(container, _parentEditor, _owner, _parentResourceUri, _contextKeyService, _scopedInstantiationService, _commentThread, _pendingComment, _pendingEdits, _markdownOptions, _commentOptions, _containerDelegate, commentService, contextMenuService, configurationService, _keybindingService) {
        super();
        this.container = container;
        this._parentEditor = _parentEditor;
        this._owner = _owner;
        this._parentResourceUri = _parentResourceUri;
        this._contextKeyService = _contextKeyService;
        this._scopedInstantiationService = _scopedInstantiationService;
        this._commentThread = _commentThread;
        this._pendingComment = _pendingComment;
        this._pendingEdits = _pendingEdits;
        this._markdownOptions = _markdownOptions;
        this._commentOptions = _commentOptions;
        this._containerDelegate = _containerDelegate;
        this.commentService = commentService;
        this.configurationService = configurationService;
        this._keybindingService = _keybindingService;
        this._commentThreadDisposables = [];
        this._onDidResize = new Emitter();
        this.onDidResize = this._onDidResize.event;
        this._threadIsEmpty = CommentContextKeys.commentThreadIsEmpty.bindTo(this._contextKeyService);
        this._threadIsEmpty.set(!_commentThread.comments || !_commentThread.comments.length);
        this._focusedContextKey = CommentContextKeys.commentFocused.bindTo(this._contextKeyService);
        this._commentMenus = this.commentService.getCommentMenus(this._owner);
        this._register(this._header = new CommentThreadHeader(container, {
            collapse: this.collapse.bind(this)
        }, this._commentMenus, this._commentThread, this._contextKeyService, this._scopedInstantiationService, contextMenuService));
        this._header.updateCommentThread(this._commentThread);
        const bodyElement = dom.$('.body');
        container.appendChild(bodyElement);
        this._register(toDisposable(() => bodyElement.remove()));
        const tracker = this._register(dom.trackFocus(bodyElement));
        this._register(registerNavigableContainer({
            name: 'commentThreadWidget',
            focusNotifiers: [tracker],
            focusNextWidget: () => {
                if (!this._commentReply?.isCommentEditorFocused()) {
                    this._commentReply?.expandReplyAreaAndFocusCommentEditor();
                }
            },
            focusPreviousWidget: () => {
                if (this._commentReply?.isCommentEditorFocused() && this._commentThread.comments?.length) {
                    this._body.focus();
                }
            }
        }));
        this._register(tracker.onDidFocus(() => this._focusedContextKey.set(true)));
        this._register(tracker.onDidBlur(() => this._focusedContextKey.reset()));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("accessibility.verbosity.comments")) {
                this._setAriaLabel();
            }
        }));
        this._body = this._scopedInstantiationService.createInstance(CommentThreadBody, this._parentEditor, this._owner, this._parentResourceUri, bodyElement, this._markdownOptions, this._commentThread, this._pendingEdits, this._scopedInstantiationService, this);
        this._register(this._body);
        this._setAriaLabel();
        this._styleElement = dom.createStyleSheet(this.container);
        this._commentThreadContextValue = CommentContextKeys.commentThreadContext.bindTo(this._contextKeyService);
        this._commentThreadContextValue.set(_commentThread.contextValue);
        const commentControllerKey = CommentContextKeys.commentControllerContext.bindTo(this._contextKeyService);
        const controller = this.commentService.getCommentController(this._owner);
        if (controller?.contextValue) {
            commentControllerKey.set(controller.contextValue);
        }
        this.currentThreadListeners();
        this._register(new DomEmitter(this.container, 'keydown').event(e => {
            if (dom.isKeyboardEvent(e) && e.key === 'Escape') {
                if (Range.isIRange(this.commentThread.range) && isCodeEditor(this._parentEditor)) {
                    this._parentEditor.setSelection(this.commentThread.range);
                }
                this.collapse();
            }
        }));
    }
    _setAriaLabel() {
        let ariaLabel = localize('commentLabel', "Comment");
        let keybinding;
        const verbose = this.configurationService.getValue("accessibility.verbosity.comments");
        if (verbose) {
            keybinding = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp", this._contextKeyService)?.getLabel() ?? undefined;
        }
        if (keybinding) {
            ariaLabel = localize('commentLabelWithKeybinding', "{0}, use ({1}) for accessibility help", ariaLabel, keybinding);
        }
        else if (verbose) {
            ariaLabel = localize('commentLabelWithKeybindingNoKeybinding', "{0}, run the command Open Accessibility Help which is currently not triggerable via keybinding.", ariaLabel);
        }
        this._body.container.ariaLabel = ariaLabel;
    }
    updateCurrentThread(hasMouse, hasFocus) {
        if (hasMouse || hasFocus) {
            this.commentService.setCurrentCommentThread(this.commentThread);
        }
        else {
            this.commentService.setCurrentCommentThread(undefined);
        }
    }
    currentThreadListeners() {
        let hasMouse = false;
        let hasFocus = false;
        this._register(dom.addDisposableListener(this.container, dom.EventType.MOUSE_ENTER, (e) => {
            if (e.toElement === this.container) {
                hasMouse = true;
                this.updateCurrentThread(hasMouse, hasFocus);
            }
        }, true));
        this._register(dom.addDisposableListener(this.container, dom.EventType.MOUSE_LEAVE, (e) => {
            if (e.fromElement === this.container) {
                hasMouse = false;
                this.updateCurrentThread(hasMouse, hasFocus);
            }
        }, true));
        this._register(dom.addDisposableListener(this.container, dom.EventType.FOCUS_IN, () => {
            hasFocus = true;
            this.updateCurrentThread(hasMouse, hasFocus);
        }, true));
        this._register(dom.addDisposableListener(this.container, dom.EventType.FOCUS_OUT, () => {
            hasFocus = false;
            this.updateCurrentThread(hasMouse, hasFocus);
        }, true));
    }
    async updateCommentThread(commentThread) {
        const shouldCollapse = (this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded) && (this._commentThreadState === languages.CommentThreadState.Unresolved)
            && (commentThread.state === languages.CommentThreadState.Resolved);
        this._commentThreadState = commentThread.state;
        this._commentThread = commentThread;
        dispose(this._commentThreadDisposables);
        this._commentThreadDisposables = [];
        this._bindCommentThreadListeners();
        await this._body.updateCommentThread(commentThread, this._commentReply?.isCommentEditorFocused() ?? false);
        this._threadIsEmpty.set(!this._body.length);
        this._header.updateCommentThread(commentThread);
        this._commentReply?.updateCommentThread(commentThread);
        if (this._commentThread.contextValue) {
            this._commentThreadContextValue.set(this._commentThread.contextValue);
        }
        else {
            this._commentThreadContextValue.reset();
        }
        if (shouldCollapse && this.configurationService.getValue(COMMENTS_SECTION).collapseOnResolve) {
            this.collapse();
        }
    }
    async display(lineHeight, focus) {
        const headHeight = Math.max(23, Math.ceil(lineHeight * 1.2));
        this._header.updateHeight(headHeight);
        await this._body.display();
        if (this._commentThread.canReply) {
            this._createCommentForm(focus);
        }
        this._createAdditionalActions();
        this._register(this._body.onDidResize(dimension => {
            this._refresh(dimension);
        }));
        if (this._commentThread.canReply && this._commentReply) {
            this._commentReply.focusIfNeeded();
        }
        this._bindCommentThreadListeners();
    }
    _refresh(dimension) {
        this._body.layout();
        this._onDidResize.fire(dimension);
    }
    dispose() {
        super.dispose();
        dispose(this._commentThreadDisposables);
        this.updateCurrentThread(false, false);
    }
    _bindCommentThreadListeners() {
        this._commentThreadDisposables.push(this._commentThread.onDidChangeCanReply(() => {
            if (this._commentReply) {
                this._commentReply.updateCanReply();
            }
            else {
                if (this._commentThread.canReply) {
                    this._createCommentForm(false);
                }
            }
        }));
        this._commentThreadDisposables.push(this._commentThread.onDidChangeComments(async (_) => {
            await this.updateCommentThread(this._commentThread);
        }));
        this._commentThreadDisposables.push(this._commentThread.onDidChangeLabel(_ => {
            this._header.createThreadLabel();
        }));
    }
    _createCommentForm(focus) {
        this._commentReply = this._scopedInstantiationService.createInstance(CommentReply, this._owner, this._body.container, this._parentEditor, this._commentThread, this._scopedInstantiationService, this._contextKeyService, this._commentMenus, this._commentOptions, this._pendingComment, this, focus, this._containerDelegate.actionRunner);
        this._register(this._commentReply);
    }
    _createAdditionalActions() {
        this._additionalActions = this._scopedInstantiationService.createInstance(CommentThreadAdditionalActions, this._body.container, this._commentThread, this._contextKeyService, this._commentMenus, this._containerDelegate.actionRunner);
        this._register(this._additionalActions);
    }
    getCommentCoords(commentUniqueId) {
        return this._body.getCommentCoords(commentUniqueId);
    }
    getPendingEdits() {
        return this._body.getPendingEdits();
    }
    getPendingComment() {
        if (this._commentReply) {
            return this._commentReply.getPendingComment();
        }
        return undefined;
    }
    setPendingComment(comment) {
        this._pendingComment = comment;
        this._commentReply?.setPendingComment(comment);
    }
    getDimensions() {
        return this._body.getDimensions();
    }
    layout(widthInPixel) {
        this._body.layout(widthInPixel);
        if (widthInPixel !== undefined) {
            this._commentReply?.layout(widthInPixel);
        }
    }
    ensureFocusIntoNewEditingComment() {
        this._body.ensureFocusIntoNewEditingComment();
    }
    focusCommentEditor() {
        this._commentReply?.expandReplyAreaAndFocusCommentEditor();
    }
    focus(commentUniqueId) {
        this._body.focus(commentUniqueId);
    }
    async submitComment() {
        const activeComment = this._body.activeComment;
        if (activeComment) {
            return activeComment.submitComment();
        }
        else if ((this._commentReply?.getPendingComment()?.length ?? 0) > 0) {
            return this._commentReply?.submitComment();
        }
    }
    collapse() {
        this._containerDelegate.collapse();
    }
    applyTheme(theme, fontInfo) {
        const content = [];
        content.push(`.monaco-editor .review-widget > .body { border-top: 1px solid var(${commentThreadStateColorVar}) }`);
        content.push(`.monaco-editor .review-widget > .head { background-color: var(${commentThreadStateBackgroundColorVar}) }`);
        const linkColor = theme.getColor(textLinkForeground);
        if (linkColor) {
            content.push(`.review-widget .body .comment-body a { color: ${linkColor} }`);
        }
        const linkActiveColor = theme.getColor(textLinkActiveForeground);
        if (linkActiveColor) {
            content.push(`.review-widget .body .comment-body a:hover, a:active { color: ${linkActiveColor} }`);
        }
        const focusColor = theme.getColor(focusBorder);
        if (focusColor) {
            content.push(`.review-widget .body .comment-body a:focus { outline: 1px solid ${focusColor}; }`);
            content.push(`.review-widget .body .monaco-editor.focused { outline: 1px solid ${focusColor}; }`);
        }
        const blockQuoteBackground = theme.getColor(textBlockQuoteBackground);
        if (blockQuoteBackground) {
            content.push(`.review-widget .body .review-comment blockquote { background: ${blockQuoteBackground}; }`);
        }
        const blockQuoteBOrder = theme.getColor(textBlockQuoteBorder);
        if (blockQuoteBOrder) {
            content.push(`.review-widget .body .review-comment blockquote { border-color: ${blockQuoteBOrder}; }`);
        }
        const border = theme.getColor(PANEL_BORDER);
        if (border) {
            content.push(`.review-widget .body .review-comment .review-comment-contents .comment-reactions .action-item a.action-label { border-color: ${border}; }`);
        }
        const hcBorder = theme.getColor(contrastBorder);
        if (hcBorder) {
            content.push(`.review-widget .body .comment-form .review-thread-reply-button { outline-color: ${hcBorder}; }`);
            content.push(`.review-widget .body .monaco-editor { outline: 1px solid ${hcBorder}; }`);
        }
        const errorBorder = theme.getColor(inputValidationErrorBorder);
        if (errorBorder) {
            content.push(`.review-widget .validation-error { border: 1px solid ${errorBorder}; }`);
        }
        const errorBackground = theme.getColor(inputValidationErrorBackground);
        if (errorBackground) {
            content.push(`.review-widget .validation-error { background: ${errorBackground}; }`);
        }
        const errorForeground = theme.getColor(inputValidationErrorForeground);
        if (errorForeground) {
            content.push(`.review-widget .body .comment-form .validation-error { color: ${errorForeground}; }`);
        }
        const fontFamilyVar = '--comment-thread-editor-font-family';
        const fontSizeVar = '--comment-thread-editor-font-size';
        const fontWeightVar = '--comment-thread-editor-font-weight';
        this.container?.style.setProperty(fontFamilyVar, fontInfo.fontFamily);
        this.container?.style.setProperty(fontSizeVar, `${fontInfo.fontSize}px`);
        this.container?.style.setProperty(fontWeightVar, fontInfo.fontWeight);
        content.push(`.review-widget .body code {
			font-family: var(${fontFamilyVar});
			font-weight: var(${fontWeightVar});
		}`);
        this._styleElement.textContent = content.join('\n');
        this._commentReply?.setCommentEditorDecorations();
    }
};
CommentThreadWidget = __decorate([
    __param(12, ICommentService),
    __param(13, IContextMenuService),
    __param(14, IConfigurationService),
    __param(15, IKeybindingService),
    __metadata("design:paramtypes", [HTMLElement, Object, String, URI, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], CommentThreadWidget);
export { CommentThreadWidget };
