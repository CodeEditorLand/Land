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
import { Action } from '../../../../base/common/actions.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { findFirstIdxMonotonousOrArrLen } from '../../../../base/common/arraysFind.js';
import { createCancelablePromise, Delayer } from '../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { DisposableStore, dispose } from '../../../../base/common/lifecycle.js';
import './media/review.css';
import { isCodeEditor, isDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { Range } from '../../../../editor/common/core/range.js';
import { EditorType } from '../../../../editor/common/editorCommon.js';
import { ModelDecorationOptions, TextModel } from '../../../../editor/common/model/textModel.js';
import * as languages from '../../../../editor/common/languages.js';
import * as nls from '../../../../nls.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { CommentGlyphWidget } from './commentGlyphWidget.js';
import { ICommentService } from './commentService.js';
import { CommentWidgetFocus, isMouseUpEventDragFromMouseDown, parseMouseDownInfoFromEvent, ReviewZoneWidget } from './commentThreadZoneWidget.js';
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { EmbeddedCodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { COMMENTS_VIEW_ID } from './commentsTreeViewer.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { COMMENTS_SECTION } from '../common/commentsConfiguration.js';
import { COMMENTEDITOR_DECORATION_KEY } from './commentReply.js';
import { Emitter } from '../../../../base/common/event.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { CommentThreadRangeDecorator } from './commentThreadRangeDecorator.js';
import { status } from '../../../../base/browser/ui/aria/aria.js';
import { CommentContextKeys } from '../common/commentContextKeys.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { URI } from '../../../../base/common/uri.js';
import { threadHasMeaningfulComments } from './commentsModel.js';
export const ID = 'editor.contrib.review';
class CommentingRangeDecoration {
    get id() {
        return this._decorationId;
    }
    set id(id) {
        this._decorationId = id;
    }
    get range() {
        return {
            startLineNumber: this._startLineNumber, startColumn: 1,
            endLineNumber: this._endLineNumber, endColumn: 1
        };
    }
    constructor(_editor, _ownerId, _extensionId, _label, _range, options, commentingRangesInfo, isHover = false) {
        this._editor = _editor;
        this._ownerId = _ownerId;
        this._extensionId = _extensionId;
        this._label = _label;
        this._range = _range;
        this.options = options;
        this.commentingRangesInfo = commentingRangesInfo;
        this.isHover = isHover;
        this._startLineNumber = _range.startLineNumber;
        this._endLineNumber = _range.endLineNumber;
    }
    getCommentAction() {
        return {
            extensionId: this._extensionId,
            label: this._label,
            ownerId: this._ownerId,
            commentingRangesInfo: this.commentingRangesInfo
        };
    }
    getOriginalRange() {
        return this._range;
    }
    getActiveRange() {
        return this.id ? this._editor.getModel().getDecorationRange(this.id) : undefined;
    }
}
class CommentingRangeDecorator {
    static { this.description = 'commenting-range-decorator'; }
    constructor() {
        this.commentingRangeDecorations = [];
        this.decorationIds = [];
        this._lastHover = -1;
        this._onDidChangeDecorationsCount = new Emitter();
        this.onDidChangeDecorationsCount = this._onDidChangeDecorationsCount.event;
        const decorationOptions = {
            description: CommentingRangeDecorator.description,
            isWholeLine: true,
            linesDecorationsClassName: 'comment-range-glyph comment-diff-added'
        };
        this.decorationOptions = ModelDecorationOptions.createDynamic(decorationOptions);
        const hoverDecorationOptions = {
            description: CommentingRangeDecorator.description,
            isWholeLine: true,
            linesDecorationsClassName: `comment-range-glyph line-hover`
        };
        this.hoverDecorationOptions = ModelDecorationOptions.createDynamic(hoverDecorationOptions);
        const multilineDecorationOptions = {
            description: CommentingRangeDecorator.description,
            isWholeLine: true,
            linesDecorationsClassName: `comment-range-glyph multiline-add`
        };
        this.multilineDecorationOptions = ModelDecorationOptions.createDynamic(multilineDecorationOptions);
    }
    updateHover(hoverLine) {
        if (this._editor && this._infos && (hoverLine !== this._lastHover)) {
            this._doUpdate(this._editor, this._infos, hoverLine);
        }
        this._lastHover = hoverLine ?? -1;
    }
    updateSelection(cursorLine, range = new Range(0, 0, 0, 0)) {
        this._lastSelection = range.isEmpty() ? undefined : range;
        this._lastSelectionCursor = range.isEmpty() ? undefined : cursorLine;
        // Some scenarios:
        // Selection is made. Emphasis should show on the drag/selection end location.
        // Selection is made, then user clicks elsewhere. We should still show the decoration.
        if (this._editor && this._infos) {
            this._doUpdate(this._editor, this._infos, cursorLine, range);
        }
    }
    update(editor, commentInfos, cursorLine, range) {
        if (editor) {
            this._editor = editor;
            this._infos = commentInfos;
            this._doUpdate(editor, commentInfos, cursorLine, range);
        }
    }
    _lineHasThread(editor, lineRange) {
        return editor.getDecorationsInRange(lineRange)?.find(decoration => decoration.options.description === CommentGlyphWidget.description);
    }
    _doUpdate(editor, commentInfos, emphasisLine = -1, selectionRange = this._lastSelection) {
        const model = editor.getModel();
        if (!model) {
            return;
        }
        // If there's still a selection, use that.
        emphasisLine = this._lastSelectionCursor ?? emphasisLine;
        const commentingRangeDecorations = [];
        for (const info of commentInfos) {
            info.commentingRanges.ranges.forEach(range => {
                const rangeObject = new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                let intersectingSelectionRange = selectionRange ? rangeObject.intersectRanges(selectionRange) : undefined;
                if ((selectionRange && (emphasisLine >= 0) && intersectingSelectionRange)
                    // If there's only one selection line, then just drop into the else if and show an emphasis line.
                    && !((intersectingSelectionRange.startLineNumber === intersectingSelectionRange.endLineNumber)
                        && (emphasisLine === intersectingSelectionRange.startLineNumber))) {
                    // The emphasisLine should be within the commenting range, even if the selection range stretches
                    // outside of the commenting range.
                    // Clip the emphasis and selection ranges to the commenting range
                    let intersectingEmphasisRange;
                    if (emphasisLine <= intersectingSelectionRange.startLineNumber) {
                        intersectingEmphasisRange = intersectingSelectionRange.collapseToStart();
                        intersectingSelectionRange = new Range(intersectingSelectionRange.startLineNumber + 1, 1, intersectingSelectionRange.endLineNumber, 1);
                    }
                    else {
                        intersectingEmphasisRange = new Range(intersectingSelectionRange.endLineNumber, 1, intersectingSelectionRange.endLineNumber, 1);
                        intersectingSelectionRange = new Range(intersectingSelectionRange.startLineNumber, 1, intersectingSelectionRange.endLineNumber - 1, 1);
                    }
                    commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, intersectingSelectionRange, this.multilineDecorationOptions, info.commentingRanges, true));
                    if (!this._lineHasThread(editor, intersectingEmphasisRange)) {
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, intersectingEmphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
                    }
                    const beforeRangeEndLine = Math.min(intersectingEmphasisRange.startLineNumber, intersectingSelectionRange.startLineNumber) - 1;
                    const hasBeforeRange = rangeObject.startLineNumber <= beforeRangeEndLine;
                    const afterRangeStartLine = Math.max(intersectingEmphasisRange.endLineNumber, intersectingSelectionRange.endLineNumber) + 1;
                    const hasAfterRange = rangeObject.endLineNumber >= afterRangeStartLine;
                    if (hasBeforeRange) {
                        const beforeRange = new Range(range.startLineNumber, 1, beforeRangeEndLine, 1);
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
                    }
                    if (hasAfterRange) {
                        const afterRange = new Range(afterRangeStartLine, 1, range.endLineNumber, 1);
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
                    }
                }
                else if ((rangeObject.startLineNumber <= emphasisLine) && (emphasisLine <= rangeObject.endLineNumber)) {
                    if (rangeObject.startLineNumber < emphasisLine) {
                        const beforeRange = new Range(range.startLineNumber, 1, emphasisLine - 1, 1);
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, beforeRange, this.decorationOptions, info.commentingRanges, true));
                    }
                    const emphasisRange = new Range(emphasisLine, 1, emphasisLine, 1);
                    if (!this._lineHasThread(editor, emphasisRange)) {
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, emphasisRange, this.hoverDecorationOptions, info.commentingRanges, true));
                    }
                    if (emphasisLine < rangeObject.endLineNumber) {
                        const afterRange = new Range(emphasisLine + 1, 1, range.endLineNumber, 1);
                        commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, afterRange, this.decorationOptions, info.commentingRanges, true));
                    }
                }
                else {
                    commentingRangeDecorations.push(new CommentingRangeDecoration(editor, info.uniqueOwner, info.extensionId, info.label, range, this.decorationOptions, info.commentingRanges));
                }
            });
        }
        editor.changeDecorations((accessor) => {
            this.decorationIds = accessor.deltaDecorations(this.decorationIds, commentingRangeDecorations);
            commentingRangeDecorations.forEach((decoration, index) => decoration.id = this.decorationIds[index]);
        });
        const rangesDifference = this.commentingRangeDecorations.length - commentingRangeDecorations.length;
        this.commentingRangeDecorations = commentingRangeDecorations;
        if (rangesDifference) {
            this._onDidChangeDecorationsCount.fire(this.commentingRangeDecorations.length);
        }
    }
    areRangesIntersectingOrTouchingByLine(a, b) {
        // Check if `a` is before `b`
        if (a.endLineNumber < (b.startLineNumber - 1)) {
            return false;
        }
        // Check if `b` is before `a`
        if ((b.endLineNumber + 1) < a.startLineNumber) {
            return false;
        }
        // These ranges must intersect
        return true;
    }
    getMatchedCommentAction(commentRange) {
        if (commentRange === undefined) {
            const foundInfos = this._infos?.filter(info => info.commentingRanges.fileComments);
            if (foundInfos) {
                return foundInfos.map(foundInfo => {
                    return {
                        action: {
                            ownerId: foundInfo.uniqueOwner,
                            extensionId: foundInfo.extensionId,
                            label: foundInfo.label,
                            commentingRangesInfo: foundInfo.commentingRanges
                        }
                    };
                });
            }
            return [];
        }
        // keys is ownerId
        const foundHoverActions = new Map();
        for (const decoration of this.commentingRangeDecorations) {
            const range = decoration.getActiveRange();
            if (range && this.areRangesIntersectingOrTouchingByLine(range, commentRange)) {
                // We can have several commenting ranges that match from the same uniqueOwner because of how
                // the line hover and selection decoration is done.
                // The ranges must be merged so that we can see if the new commentRange fits within them.
                const action = decoration.getCommentAction();
                const alreadyFoundInfo = foundHoverActions.get(action.ownerId);
                if (alreadyFoundInfo?.action.commentingRangesInfo === action.commentingRangesInfo) {
                    // Merge ranges.
                    const newRange = new Range(range.startLineNumber < alreadyFoundInfo.range.startLineNumber ? range.startLineNumber : alreadyFoundInfo.range.startLineNumber, range.startColumn < alreadyFoundInfo.range.startColumn ? range.startColumn : alreadyFoundInfo.range.startColumn, range.endLineNumber > alreadyFoundInfo.range.endLineNumber ? range.endLineNumber : alreadyFoundInfo.range.endLineNumber, range.endColumn > alreadyFoundInfo.range.endColumn ? range.endColumn : alreadyFoundInfo.range.endColumn);
                    foundHoverActions.set(action.ownerId, { range: newRange, action });
                }
                else {
                    foundHoverActions.set(action.ownerId, { range, action });
                }
            }
        }
        const seenOwners = new Set();
        return Array.from(foundHoverActions.values()).filter(action => {
            if (seenOwners.has(action.action.ownerId)) {
                return false;
            }
            else {
                seenOwners.add(action.action.ownerId);
                return true;
            }
        });
    }
    getNearestCommentingRange(findPosition, reverse) {
        let findPositionContainedWithin;
        let decorations;
        if (reverse) {
            decorations = [];
            for (let i = this.commentingRangeDecorations.length - 1; i >= 0; i--) {
                decorations.push(this.commentingRangeDecorations[i]);
            }
        }
        else {
            decorations = this.commentingRangeDecorations;
        }
        for (const decoration of decorations) {
            const range = decoration.getActiveRange();
            if (!range) {
                continue;
            }
            if (findPositionContainedWithin && this.areRangesIntersectingOrTouchingByLine(range, findPositionContainedWithin)) {
                findPositionContainedWithin = Range.plusRange(findPositionContainedWithin, range);
                continue;
            }
            if (range.startLineNumber <= findPosition.lineNumber && findPosition.lineNumber <= range.endLineNumber) {
                findPositionContainedWithin = new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn);
                continue;
            }
            if (!reverse && range.endLineNumber < findPosition.lineNumber) {
                continue;
            }
            if (reverse && range.startLineNumber > findPosition.lineNumber) {
                continue;
            }
            return range;
        }
        return (decorations.length > 0 ? (decorations[0].getActiveRange() ?? undefined) : undefined);
    }
    dispose() {
        this.commentingRangeDecorations = [];
    }
}
/**
* Navigate to the next or previous comment in the current thread.
* @param type
*/
export function moveToNextCommentInThread(commentInfo, type) {
    if (!commentInfo?.comment || !commentInfo?.thread?.comments) {
        return;
    }
    const currentIndex = commentInfo.thread.comments?.indexOf(commentInfo.comment);
    if (currentIndex === undefined || currentIndex < 0) {
        return;
    }
    if (type === 'previous' && currentIndex === 0) {
        return;
    }
    if (type === 'next' && currentIndex === commentInfo.thread.comments.length - 1) {
        return;
    }
    const comment = commentInfo.thread.comments?.[type === 'previous' ? currentIndex - 1 : currentIndex + 1];
    if (!comment) {
        return;
    }
    return {
        ...commentInfo,
        comment,
    };
}
export function revealCommentThread(commentService, editorService, uriIdentityService, commentThread, comment, focusReply, pinned, preserveFocus, sideBySide) {
    if (!commentThread.resource) {
        return;
    }
    if (!commentService.isCommentingEnabled) {
        commentService.enableCommenting(true);
    }
    const range = commentThread.range;
    const focus = focusReply ? CommentWidgetFocus.Editor : (preserveFocus ? CommentWidgetFocus.None : CommentWidgetFocus.Widget);
    const activeEditor = editorService.activeTextEditorControl;
    // If the active editor is a diff editor where one of the sides has the comment,
    // then we try to reveal the comment in the diff editor.
    const currentActiveResources = isDiffEditor(activeEditor) ? [activeEditor.getOriginalEditor(), activeEditor.getModifiedEditor()]
        : (activeEditor ? [activeEditor] : []);
    const threadToReveal = commentThread.threadId;
    const commentToReveal = comment?.uniqueIdInThread;
    const resource = URI.parse(commentThread.resource);
    for (const editor of currentActiveResources) {
        const model = editor.getModel();
        if ((model instanceof TextModel) && uriIdentityService.extUri.isEqual(resource, model.uri)) {
            if (threadToReveal && isCodeEditor(editor)) {
                const controller = CommentController.get(editor);
                controller?.revealCommentThread(threadToReveal, commentToReveal, true, focus);
            }
            return;
        }
    }
    editorService.openEditor({
        resource,
        options: {
            pinned: pinned,
            preserveFocus: preserveFocus,
            selection: range ?? new Range(1, 1, 1, 1)
        }
    }, sideBySide ? SIDE_GROUP : ACTIVE_GROUP).then(editor => {
        if (editor) {
            const control = editor.getControl();
            if (threadToReveal && isCodeEditor(control)) {
                const controller = CommentController.get(control);
                controller?.revealCommentThread(threadToReveal, commentToReveal, true, focus);
            }
        }
    });
}
let CommentController = class CommentController {
    constructor(editor, commentService, instantiationService, codeEditorService, contextMenuService, quickInputService, viewsService, configurationService, contextKeyService, editorService, keybindingService, accessibilityService) {
        this.commentService = commentService;
        this.instantiationService = instantiationService;
        this.codeEditorService = codeEditorService;
        this.contextMenuService = contextMenuService;
        this.quickInputService = quickInputService;
        this.viewsService = viewsService;
        this.configurationService = configurationService;
        this.editorService = editorService;
        this.keybindingService = keybindingService;
        this.accessibilityService = accessibilityService;
        this.globalToDispose = new DisposableStore();
        this.localToDispose = new DisposableStore();
        this.mouseDownInfo = null;
        this._commentingRangeSpaceReserved = false;
        this._commentingRangeAmountReserved = 0;
        this._emptyThreadsToAddQueue = [];
        this._inProcessContinueOnComments = new Map();
        this._editorDisposables = [];
        this._hasRespondedToEditorChange = false;
        this._commentInfos = [];
        this._commentWidgets = [];
        this._pendingNewCommentCache = {};
        this._pendingEditsCache = {};
        this._computePromise = null;
        this._activeCursorHasCommentingRange = CommentContextKeys.activeCursorHasCommentingRange.bindTo(contextKeyService);
        this._activeCursorHasComment = CommentContextKeys.activeCursorHasComment.bindTo(contextKeyService);
        this._activeEditorHasCommentingRange = CommentContextKeys.activeEditorHasCommentingRange.bindTo(contextKeyService);
        if (editor instanceof EmbeddedCodeEditorWidget) {
            return;
        }
        this.editor = editor;
        this._commentingRangeDecorator = new CommentingRangeDecorator();
        this.globalToDispose.add(this._commentingRangeDecorator.onDidChangeDecorationsCount(count => {
            if (count === 0) {
                this.clearEditorListeners();
            }
            else if (this._editorDisposables.length === 0) {
                this.registerEditorListeners();
            }
        }));
        this.globalToDispose.add(this._commentThreadRangeDecorator = new CommentThreadRangeDecorator(this.commentService));
        this.globalToDispose.add(this.commentService.onDidDeleteDataProvider(ownerId => {
            if (ownerId) {
                delete this._pendingNewCommentCache[ownerId];
                delete this._pendingEditsCache[ownerId];
            }
            else {
                this._pendingNewCommentCache = {};
                this._pendingEditsCache = {};
            }
            this.beginCompute();
        }));
        this.globalToDispose.add(this.commentService.onDidSetDataProvider(_ => this.beginComputeAndHandleEditorChange()));
        this.globalToDispose.add(this.commentService.onDidUpdateCommentingRanges(_ => this.beginComputeAndHandleEditorChange()));
        this.globalToDispose.add(this.commentService.onDidSetResourceCommentInfos(async (e) => {
            const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
            if (editorURI && editorURI.toString() === e.resource.toString()) {
                await this.setComments(e.commentInfos.filter(commentInfo => commentInfo !== null));
            }
        }));
        this.globalToDispose.add(this.commentService.onDidChangeCommentingEnabled(e => {
            if (e) {
                this.registerEditorListeners();
                this.beginCompute();
            }
            else {
                this.tryUpdateReservedSpace();
                this.clearEditorListeners();
                this._commentingRangeDecorator.update(this.editor, []);
                this._commentThreadRangeDecorator.update(this.editor, []);
                dispose(this._commentWidgets);
                this._commentWidgets = [];
            }
        }));
        this.globalToDispose.add(this.editor.onWillChangeModel(e => this.onWillChangeModel(e)));
        this.globalToDispose.add(this.editor.onDidChangeModel(_ => this.onModelChanged()));
        this.globalToDispose.add(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('diffEditor.renderSideBySide')) {
                this.beginCompute();
            }
        }));
        this.onModelChanged();
        this.codeEditorService.registerDecorationType('comment-controller', COMMENTEDITOR_DECORATION_KEY, {});
        this.globalToDispose.add(this.commentService.registerContinueOnCommentProvider({
            provideContinueOnComments: () => {
                const pendingComments = [];
                if (this._commentWidgets) {
                    for (const zone of this._commentWidgets) {
                        const zonePendingComments = zone.getPendingComments();
                        const pendingNewComment = zonePendingComments.newComment;
                        if (!pendingNewComment) {
                            continue;
                        }
                        let lastCommentBody;
                        if (zone.commentThread.comments && zone.commentThread.comments.length) {
                            const lastComment = zone.commentThread.comments[zone.commentThread.comments.length - 1];
                            if (typeof lastComment.body === 'string') {
                                lastCommentBody = lastComment.body;
                            }
                            else {
                                lastCommentBody = lastComment.body.value;
                            }
                        }
                        if (pendingNewComment.body !== lastCommentBody) {
                            pendingComments.push({
                                uniqueOwner: zone.uniqueOwner,
                                uri: zone.editor.getModel().uri,
                                range: zone.commentThread.range,
                                comment: pendingNewComment,
                                isReply: (zone.commentThread.comments !== undefined) && (zone.commentThread.comments.length > 0)
                            });
                        }
                    }
                }
                return pendingComments;
            }
        }));
    }
    registerEditorListeners() {
        this._editorDisposables = [];
        if (!this.editor) {
            return;
        }
        this._editorDisposables.push(this.editor.onMouseMove(e => this.onEditorMouseMove(e)));
        this._editorDisposables.push(this.editor.onMouseLeave(() => this.onEditorMouseLeave()));
        this._editorDisposables.push(this.editor.onDidChangeCursorPosition(e => this.onEditorChangeCursorPosition(e.position)));
        this._editorDisposables.push(this.editor.onDidFocusEditorWidget(() => this.onEditorChangeCursorPosition(this.editor?.getPosition() ?? null)));
        this._editorDisposables.push(this.editor.onDidChangeCursorSelection(e => this.onEditorChangeCursorSelection(e)));
        this._editorDisposables.push(this.editor.onDidBlurEditorWidget(() => this.onEditorChangeCursorSelection()));
    }
    clearEditorListeners() {
        dispose(this._editorDisposables);
        this._editorDisposables = [];
    }
    onEditorMouseLeave() {
        this._commentingRangeDecorator.updateHover();
    }
    onEditorMouseMove(e) {
        const position = e.target.position?.lineNumber;
        if (e.event.leftButton.valueOf() && position && this.mouseDownInfo) {
            this._commentingRangeDecorator.updateSelection(position, new Range(this.mouseDownInfo.lineNumber, 1, position, 1));
        }
        else {
            this._commentingRangeDecorator.updateHover(position);
        }
    }
    onEditorChangeCursorSelection(e) {
        const position = this.editor?.getPosition()?.lineNumber;
        if (position) {
            this._commentingRangeDecorator.updateSelection(position, e?.selection);
        }
    }
    onEditorChangeCursorPosition(e) {
        if (!e) {
            return;
        }
        const range = Range.fromPositions(e, { column: -1, lineNumber: e.lineNumber });
        const decorations = this.editor?.getDecorationsInRange(range);
        let hasCommentingRange = false;
        if (decorations) {
            for (const decoration of decorations) {
                if (decoration.options.description === CommentGlyphWidget.description) {
                    // We don't allow multiple comments on the same line.
                    hasCommentingRange = false;
                    break;
                }
                else if (decoration.options.description === CommentingRangeDecorator.description) {
                    hasCommentingRange = true;
                }
            }
        }
        this._activeCursorHasCommentingRange.set(hasCommentingRange);
        this._activeCursorHasComment.set(this.getCommentsAtLine(range).length > 0);
    }
    isEditorInlineOriginal(testEditor) {
        if (this.configurationService.getValue('diffEditor.renderSideBySide')) {
            return false;
        }
        const foundEditor = this.editorService.visibleTextEditorControls.find(editor => {
            if (editor.getEditorType() === EditorType.IDiffEditor) {
                const diffEditor = editor;
                return diffEditor.getOriginalEditor() === testEditor;
            }
            return false;
        });
        return !!foundEditor;
    }
    beginCompute() {
        this._computePromise = createCancelablePromise(token => {
            const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
            if (editorURI) {
                return this.commentService.getDocumentComments(editorURI);
            }
            return Promise.resolve([]);
        });
        this._computeAndSetPromise = this._computePromise.then(async (commentInfos) => {
            await this.setComments(coalesce(commentInfos));
            this._computePromise = null;
        }, error => console.log(error));
        this._computePromise.then(() => this._computeAndSetPromise = undefined);
        return this._computeAndSetPromise;
    }
    beginComputeCommentingRanges() {
        if (this._computeCommentingRangeScheduler) {
            if (this._computeCommentingRangePromise) {
                this._computeCommentingRangePromise.cancel();
                this._computeCommentingRangePromise = null;
            }
            this._computeCommentingRangeScheduler.trigger(() => {
                const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
                if (editorURI) {
                    return this.commentService.getDocumentComments(editorURI);
                }
                return Promise.resolve([]);
            }).then(commentInfos => {
                if (this.commentService.isCommentingEnabled) {
                    const meaningfulCommentInfos = coalesce(commentInfos);
                    this._commentingRangeDecorator.update(this.editor, meaningfulCommentInfos, this.editor?.getPosition()?.lineNumber, this.editor?.getSelection() ?? undefined);
                }
            }, (err) => {
                onUnexpectedError(err);
                return null;
            });
        }
    }
    static get(editor) {
        return editor.getContribution(ID);
    }
    revealCommentThread(threadId, commentUniqueId, fetchOnceIfNotExist, focus) {
        const commentThreadWidget = this._commentWidgets.filter(widget => widget.commentThread.threadId === threadId);
        if (commentThreadWidget.length === 1) {
            commentThreadWidget[0].reveal(commentUniqueId, focus);
        }
        else if (fetchOnceIfNotExist) {
            if (this._computeAndSetPromise) {
                this._computeAndSetPromise.then(_ => {
                    this.revealCommentThread(threadId, commentUniqueId, false, focus);
                });
            }
            else {
                this.beginCompute().then(_ => {
                    this.revealCommentThread(threadId, commentUniqueId, false, focus);
                });
            }
        }
    }
    collapseAll() {
        for (const widget of this._commentWidgets) {
            widget.collapse();
        }
    }
    expandAll() {
        for (const widget of this._commentWidgets) {
            widget.expand();
        }
    }
    expandUnresolved() {
        for (const widget of this._commentWidgets) {
            if (widget.commentThread.state === languages.CommentThreadState.Unresolved) {
                widget.expand();
            }
        }
    }
    nextCommentThread(focusThread) {
        this._findNearestCommentThread(focusThread);
    }
    _findNearestCommentThread(focusThread, reverse) {
        if (!this._commentWidgets.length || !this.editor?.hasModel()) {
            return;
        }
        const after = reverse ? this.editor.getSelection().getStartPosition() : this.editor.getSelection().getEndPosition();
        const sortedWidgets = this._commentWidgets.sort((a, b) => {
            if (reverse) {
                const temp = a;
                a = b;
                b = temp;
            }
            if (a.commentThread.range === undefined) {
                return -1;
            }
            if (b.commentThread.range === undefined) {
                return 1;
            }
            if (a.commentThread.range.startLineNumber < b.commentThread.range.startLineNumber) {
                return -1;
            }
            if (a.commentThread.range.startLineNumber > b.commentThread.range.startLineNumber) {
                return 1;
            }
            if (a.commentThread.range.startColumn < b.commentThread.range.startColumn) {
                return -1;
            }
            if (a.commentThread.range.startColumn > b.commentThread.range.startColumn) {
                return 1;
            }
            return 0;
        });
        const idx = findFirstIdxMonotonousOrArrLen(sortedWidgets, widget => {
            const lineValueOne = reverse ? after.lineNumber : (widget.commentThread.range?.startLineNumber ?? 0);
            const lineValueTwo = reverse ? (widget.commentThread.range?.startLineNumber ?? 0) : after.lineNumber;
            const columnValueOne = reverse ? after.column : (widget.commentThread.range?.startColumn ?? 0);
            const columnValueTwo = reverse ? (widget.commentThread.range?.startColumn ?? 0) : after.column;
            if (lineValueOne > lineValueTwo) {
                return true;
            }
            if (lineValueOne < lineValueTwo) {
                return false;
            }
            if (columnValueOne > columnValueTwo) {
                return true;
            }
            return false;
        });
        const nextWidget = sortedWidgets[idx];
        if (nextWidget !== undefined) {
            this.editor.setSelection(nextWidget.commentThread.range ?? new Range(1, 1, 1, 1));
            nextWidget.reveal(undefined, focusThread ? CommentWidgetFocus.Widget : CommentWidgetFocus.None);
        }
    }
    previousCommentThread(focusThread) {
        this._findNearestCommentThread(focusThread, true);
    }
    _findNearestCommentingRange(reverse) {
        if (!this.editor?.hasModel()) {
            return;
        }
        const after = this.editor.getSelection().getEndPosition();
        const range = this._commentingRangeDecorator.getNearestCommentingRange(after, reverse);
        if (range) {
            const position = reverse ? range.getEndPosition() : range.getStartPosition();
            this.editor.setPosition(position);
            this.editor.revealLineInCenterIfOutsideViewport(position.lineNumber);
        }
        if (this.accessibilityService.isScreenReaderOptimized()) {
            const commentRangeStart = range?.getStartPosition().lineNumber;
            const commentRangeEnd = range?.getEndPosition().lineNumber;
            if (commentRangeStart && commentRangeEnd) {
                const oneLine = commentRangeStart === commentRangeEnd;
                oneLine ? status(nls.localize('commentRange', "Line {0}", commentRangeStart)) : status(nls.localize('commentRangeStart', "Lines {0} to {1}", commentRangeStart, commentRangeEnd));
            }
        }
    }
    nextCommentingRange() {
        this._findNearestCommentingRange();
    }
    previousCommentingRange() {
        this._findNearestCommentingRange(true);
    }
    dispose() {
        this.globalToDispose.dispose();
        this.localToDispose.dispose();
        dispose(this._editorDisposables);
        dispose(this._commentWidgets);
        this.editor = null; // Strict null override - nulling out in dispose
    }
    onWillChangeModel(e) {
        if (e.newModelUrl) {
            this.tryUpdateReservedSpace(e.newModelUrl);
        }
    }
    async handleCommentAdded(editorId, uniqueOwner, thread) {
        const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.uniqueOwner === uniqueOwner && zoneWidget.commentThread.threadId === thread.threadId);
        if (matchedZones.length) {
            return;
        }
        const matchedNewCommentThreadZones = this._commentWidgets.filter(zoneWidget => zoneWidget.uniqueOwner === uniqueOwner && zoneWidget.commentThread.commentThreadHandle === -1 && Range.equalsRange(zoneWidget.commentThread.range, thread.range));
        if (matchedNewCommentThreadZones.length) {
            matchedNewCommentThreadZones[0].update(thread);
            return;
        }
        const continueOnCommentIndex = this._inProcessContinueOnComments.get(uniqueOwner)?.findIndex(pending => {
            if (pending.range === undefined) {
                return thread.range === undefined;
            }
            else {
                return Range.lift(pending.range).equalsRange(thread.range);
            }
        });
        let continueOnCommentText;
        if ((continueOnCommentIndex !== undefined) && continueOnCommentIndex >= 0) {
            continueOnCommentText = this._inProcessContinueOnComments.get(uniqueOwner)?.splice(continueOnCommentIndex, 1)[0].comment.body;
        }
        const pendingCommentText = (this._pendingNewCommentCache[uniqueOwner] && this._pendingNewCommentCache[uniqueOwner][thread.threadId])
            ?? continueOnCommentText;
        const pendingEdits = this._pendingEditsCache[uniqueOwner] && this._pendingEditsCache[uniqueOwner][thread.threadId];
        const shouldReveal = thread.canReply && thread.isTemplate && (!thread.comments || (thread.comments.length === 0)) && (!thread.editorId || (thread.editorId === editorId));
        await this.displayCommentThread(uniqueOwner, thread, shouldReveal, pendingCommentText, pendingEdits);
        this._commentInfos.filter(info => info.uniqueOwner === uniqueOwner)[0].threads.push(thread);
        this.tryUpdateReservedSpace();
    }
    onModelChanged() {
        this.localToDispose.clear();
        this.tryUpdateReservedSpace();
        this.removeCommentWidgetsAndStoreCache();
        if (!this.editor) {
            return;
        }
        this._hasRespondedToEditorChange = false;
        this.localToDispose.add(this.editor.onMouseDown(e => this.onEditorMouseDown(e)));
        this.localToDispose.add(this.editor.onMouseUp(e => this.onEditorMouseUp(e)));
        if (this._editorDisposables.length) {
            this.clearEditorListeners();
            this.registerEditorListeners();
        }
        this._computeCommentingRangeScheduler = new Delayer(200);
        this.localToDispose.add({
            dispose: () => {
                this._computeCommentingRangeScheduler?.cancel();
                this._computeCommentingRangeScheduler = null;
            }
        });
        this.localToDispose.add(this.editor.onDidChangeModelContent(async () => {
            this.beginComputeCommentingRanges();
        }));
        this.localToDispose.add(this.commentService.onDidUpdateCommentThreads(async (e) => {
            const editorURI = this.editor && this.editor.hasModel() && this.editor.getModel().uri;
            if (!editorURI || !this.commentService.isCommentingEnabled) {
                return;
            }
            if (this._computePromise) {
                await this._computePromise;
            }
            const commentInfo = this._commentInfos.filter(info => info.uniqueOwner === e.uniqueOwner);
            if (!commentInfo || !commentInfo.length) {
                return;
            }
            const added = e.added.filter(thread => thread.resource && thread.resource === editorURI.toString());
            const removed = e.removed.filter(thread => thread.resource && thread.resource === editorURI.toString());
            const changed = e.changed.filter(thread => thread.resource && thread.resource === editorURI.toString());
            const pending = e.pending.filter(pending => pending.uri.toString() === editorURI.toString());
            removed.forEach(thread => {
                const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.uniqueOwner === e.uniqueOwner && zoneWidget.commentThread.threadId === thread.threadId && zoneWidget.commentThread.threadId !== '');
                if (matchedZones.length) {
                    const matchedZone = matchedZones[0];
                    const index = this._commentWidgets.indexOf(matchedZone);
                    this._commentWidgets.splice(index, 1);
                    matchedZone.dispose();
                }
                const infosThreads = this._commentInfos.filter(info => info.uniqueOwner === e.uniqueOwner)[0].threads;
                for (let i = 0; i < infosThreads.length; i++) {
                    if (infosThreads[i] === thread) {
                        infosThreads.splice(i, 1);
                        i--;
                    }
                }
            });
            for (const thread of changed) {
                const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.uniqueOwner === e.uniqueOwner && zoneWidget.commentThread.threadId === thread.threadId);
                if (matchedZones.length) {
                    const matchedZone = matchedZones[0];
                    matchedZone.update(thread);
                    this.openCommentsView(thread);
                }
            }
            const editorId = this.editor?.getId();
            for (const thread of added) {
                await this.handleCommentAdded(editorId, e.uniqueOwner, thread);
            }
            for (const thread of pending) {
                await this.resumePendingComment(editorURI, thread);
            }
            this._commentThreadRangeDecorator.update(this.editor, commentInfo);
        }));
        this.beginComputeAndHandleEditorChange();
    }
    async resumePendingComment(editorURI, thread) {
        const matchedZones = this._commentWidgets.filter(zoneWidget => zoneWidget.uniqueOwner === thread.uniqueOwner && Range.lift(zoneWidget.commentThread.range)?.equalsRange(thread.range));
        if (thread.isReply && matchedZones.length) {
            this.commentService.removeContinueOnComment({ uniqueOwner: thread.uniqueOwner, uri: editorURI, range: thread.range, isReply: true });
            matchedZones[0].setPendingComment(thread.comment);
        }
        else if (matchedZones.length) {
            this.commentService.removeContinueOnComment({ uniqueOwner: thread.uniqueOwner, uri: editorURI, range: thread.range, isReply: false });
            const existingPendingComment = matchedZones[0].getPendingComments().newComment;
            // We need to try to reconcile the existing pending comment with the incoming pending comment
            let pendingComment;
            if (!existingPendingComment || thread.comment.body.includes(existingPendingComment.body)) {
                pendingComment = thread.comment;
            }
            else if (existingPendingComment.body.includes(thread.comment.body)) {
                pendingComment = existingPendingComment;
            }
            else {
                pendingComment = { body: `${existingPendingComment}\n${thread.comment.body}`, cursor: thread.comment.cursor };
            }
            matchedZones[0].setPendingComment(pendingComment);
        }
        else if (!thread.isReply) {
            const threadStillAvailable = this.commentService.removeContinueOnComment({ uniqueOwner: thread.uniqueOwner, uri: editorURI, range: thread.range, isReply: false });
            if (!threadStillAvailable) {
                return;
            }
            if (!this._inProcessContinueOnComments.has(thread.uniqueOwner)) {
                this._inProcessContinueOnComments.set(thread.uniqueOwner, []);
            }
            this._inProcessContinueOnComments.get(thread.uniqueOwner)?.push(thread);
            await this.commentService.createCommentThreadTemplate(thread.uniqueOwner, thread.uri, thread.range ? Range.lift(thread.range) : undefined);
        }
    }
    beginComputeAndHandleEditorChange() {
        this.beginCompute().then(() => {
            if (!this._hasRespondedToEditorChange) {
                if (this._commentInfos.some(commentInfo => commentInfo.commentingRanges.ranges.length > 0 || commentInfo.commentingRanges.fileComments)) {
                    this._hasRespondedToEditorChange = true;
                    const verbose = this.configurationService.getValue("accessibility.verbosity.comments" /* AccessibilityVerbositySettingId.Comments */);
                    if (verbose) {
                        const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getAriaLabel();
                        if (keybinding) {
                            status(nls.localize('hasCommentRangesKb', "Editor has commenting ranges, run the command Open Accessibility Help ({0}), for more information.", keybinding));
                        }
                        else {
                            status(nls.localize('hasCommentRangesNoKb', "Editor has commenting ranges, run the command Open Accessibility Help, which is currently not triggerable via keybinding, for more information."));
                        }
                    }
                    else {
                        status(nls.localize('hasCommentRanges', "Editor has commenting ranges."));
                    }
                }
            }
        });
    }
    async openCommentsView(thread) {
        if (thread.comments && (thread.comments.length > 0) && threadHasMeaningfulComments(thread)) {
            const openViewState = this.configurationService.getValue(COMMENTS_SECTION).openView;
            if (openViewState === 'file') {
                return this.viewsService.openView(COMMENTS_VIEW_ID);
            }
            else if (openViewState === 'firstFile' || (openViewState === 'firstFileUnresolved' && thread.state === languages.CommentThreadState.Unresolved)) {
                const hasShownView = this.viewsService.getViewWithId(COMMENTS_VIEW_ID)?.hasRendered;
                if (!hasShownView) {
                    return this.viewsService.openView(COMMENTS_VIEW_ID);
                }
            }
        }
        return undefined;
    }
    async displayCommentThread(uniqueOwner, thread, shouldReveal, pendingComment, pendingEdits) {
        const editor = this.editor?.getModel();
        if (!editor) {
            return;
        }
        if (!this.editor || this.isEditorInlineOriginal(this.editor)) {
            return;
        }
        let continueOnCommentReply;
        if (thread.range && !pendingComment) {
            continueOnCommentReply = this.commentService.removeContinueOnComment({ uniqueOwner, uri: editor.uri, range: thread.range, isReply: true });
        }
        const zoneWidget = this.instantiationService.createInstance(ReviewZoneWidget, this.editor, uniqueOwner, thread, pendingComment ?? continueOnCommentReply?.comment, pendingEdits);
        await zoneWidget.display(thread.range, shouldReveal);
        this._commentWidgets.push(zoneWidget);
        this.openCommentsView(thread);
    }
    onEditorMouseDown(e) {
        this.mouseDownInfo = parseMouseDownInfoFromEvent(e);
    }
    onEditorMouseUp(e) {
        const matchedLineNumber = isMouseUpEventDragFromMouseDown(this.mouseDownInfo, e);
        this.mouseDownInfo = null;
        if (!this.editor || matchedLineNumber === null || !e.target.element) {
            return;
        }
        const mouseUpIsOnDecorator = (e.target.element.className.indexOf('comment-range-glyph') >= 0);
        const lineNumber = e.target.position.lineNumber;
        let range;
        let selection;
        // Check for drag along gutter decoration
        if ((matchedLineNumber !== lineNumber)) {
            if (matchedLineNumber > lineNumber) {
                selection = new Range(matchedLineNumber, this.editor.getModel().getLineLength(matchedLineNumber) + 1, lineNumber, 1);
            }
            else {
                selection = new Range(matchedLineNumber, 1, lineNumber, this.editor.getModel().getLineLength(lineNumber) + 1);
            }
        }
        else if (mouseUpIsOnDecorator) {
            selection = this.editor.getSelection();
        }
        // Check for selection at line number.
        if (selection && (selection.startLineNumber <= lineNumber) && (lineNumber <= selection.endLineNumber)) {
            range = selection;
            this.editor.setSelection(new Range(selection.endLineNumber, 1, selection.endLineNumber, 1));
        }
        else if (mouseUpIsOnDecorator) {
            range = new Range(lineNumber, 1, lineNumber, 1);
        }
        if (range) {
            this.addOrToggleCommentAtLine(range, e);
        }
    }
    getCommentsAtLine(commentRange) {
        return this._commentWidgets.filter(widget => widget.getGlyphPosition() === (commentRange ? commentRange.endLineNumber : 0));
    }
    async addOrToggleCommentAtLine(commentRange, e) {
        // If an add is already in progress, queue the next add and process it after the current one finishes to
        // prevent empty comment threads from being added to the same line.
        if (!this._addInProgress) {
            this._addInProgress = true;
            // The widget's position is undefined until the widget has been displayed, so rely on the glyph position instead
            const existingCommentsAtLine = this.getCommentsAtLine(commentRange);
            if (existingCommentsAtLine.length) {
                const allExpanded = existingCommentsAtLine.every(widget => widget.expanded);
                existingCommentsAtLine.forEach(allExpanded ? widget => widget.collapse() : widget => widget.expand(true));
                this.processNextThreadToAdd();
                return;
            }
            else {
                this.addCommentAtLine(commentRange, e);
            }
        }
        else {
            this._emptyThreadsToAddQueue.push([commentRange, e]);
        }
    }
    processNextThreadToAdd() {
        this._addInProgress = false;
        const info = this._emptyThreadsToAddQueue.shift();
        if (info) {
            this.addOrToggleCommentAtLine(info[0], info[1]);
        }
    }
    clipUserRangeToCommentRange(userRange, commentRange) {
        if (userRange.startLineNumber < commentRange.startLineNumber) {
            userRange = new Range(commentRange.startLineNumber, commentRange.startColumn, userRange.endLineNumber, userRange.endColumn);
        }
        if (userRange.endLineNumber > commentRange.endLineNumber) {
            userRange = new Range(userRange.startLineNumber, userRange.startColumn, commentRange.endLineNumber, commentRange.endColumn);
        }
        return userRange;
    }
    addCommentAtLine(range, e) {
        const newCommentInfos = this._commentingRangeDecorator.getMatchedCommentAction(range);
        if (!newCommentInfos.length || !this.editor?.hasModel()) {
            this._addInProgress = false;
            if (!newCommentInfos.length) {
                throw new Error(`There are no commenting ranges at the current position (${range ? 'with range' : 'without range'}).`);
            }
            return Promise.resolve();
        }
        if (newCommentInfos.length > 1) {
            if (e && range) {
                this.contextMenuService.showContextMenu({
                    getAnchor: () => e.event,
                    getActions: () => this.getContextMenuActions(newCommentInfos, range),
                    getActionsContext: () => newCommentInfos.length ? newCommentInfos[0] : undefined,
                    onHide: () => { this._addInProgress = false; }
                });
                return Promise.resolve();
            }
            else {
                const picks = this.getCommentProvidersQuickPicks(newCommentInfos);
                return this.quickInputService.pick(picks, { placeHolder: nls.localize('pickCommentService', "Select Comment Provider"), matchOnDescription: true }).then(pick => {
                    if (!pick) {
                        return;
                    }
                    const commentInfos = newCommentInfos.filter(info => info.action.ownerId === pick.id);
                    if (commentInfos.length) {
                        const { ownerId } = commentInfos[0].action;
                        const clippedRange = range && commentInfos[0].range ? this.clipUserRangeToCommentRange(range, commentInfos[0].range) : range;
                        this.addCommentAtLine2(clippedRange, ownerId);
                    }
                }).then(() => {
                    this._addInProgress = false;
                });
            }
        }
        else {
            const { ownerId } = newCommentInfos[0].action;
            const clippedRange = range && newCommentInfos[0].range ? this.clipUserRangeToCommentRange(range, newCommentInfos[0].range) : range;
            this.addCommentAtLine2(clippedRange, ownerId);
        }
        return Promise.resolve();
    }
    getCommentProvidersQuickPicks(commentInfos) {
        const picks = commentInfos.map((commentInfo) => {
            const { ownerId, extensionId, label } = commentInfo.action;
            return {
                label: label ?? extensionId ?? ownerId,
                id: ownerId
            };
        });
        return picks;
    }
    getContextMenuActions(commentInfos, commentRange) {
        const actions = [];
        commentInfos.forEach(commentInfo => {
            const { ownerId, extensionId, label } = commentInfo.action;
            actions.push(new Action('addCommentThread', `${label || extensionId}`, undefined, true, () => {
                const clippedRange = commentInfo.range ? this.clipUserRangeToCommentRange(commentRange, commentInfo.range) : commentRange;
                this.addCommentAtLine2(clippedRange, ownerId);
                return Promise.resolve();
            }));
        });
        return actions;
    }
    addCommentAtLine2(range, ownerId) {
        if (!this.editor) {
            return;
        }
        this.commentService.createCommentThreadTemplate(ownerId, this.editor.getModel().uri, range, this.editor.getId());
        this.processNextThreadToAdd();
        return;
    }
    getExistingCommentEditorOptions(editor) {
        const lineDecorationsWidth = editor.getOption(68 /* EditorOption.lineDecorationsWidth */);
        let extraEditorClassName = [];
        const configuredExtraClassName = editor.getRawOptions().extraEditorClassName;
        if (configuredExtraClassName) {
            extraEditorClassName = configuredExtraClassName.split(' ');
        }
        return { lineDecorationsWidth, extraEditorClassName };
    }
    getWithoutCommentsEditorOptions(editor, extraEditorClassName, startingLineDecorationsWidth) {
        let lineDecorationsWidth = startingLineDecorationsWidth;
        const inlineCommentPos = extraEditorClassName.findIndex(name => name === 'inline-comment');
        if (inlineCommentPos >= 0) {
            extraEditorClassName.splice(inlineCommentPos, 1);
        }
        const options = editor.getOptions();
        if (options.get(45 /* EditorOption.folding */) && options.get(114 /* EditorOption.showFoldingControls */) !== 'never') {
            lineDecorationsWidth += 11; // 11 comes from https://github.com/microsoft/vscode/blob/94ee5f58619d59170983f453fe78f156c0cc73a3/src/vs/workbench/contrib/comments/browser/media/review.css#L485
        }
        lineDecorationsWidth -= 24;
        return { extraEditorClassName, lineDecorationsWidth };
    }
    getWithCommentsLineDecorationWidth(editor, startingLineDecorationsWidth) {
        let lineDecorationsWidth = startingLineDecorationsWidth;
        const options = editor.getOptions();
        if (options.get(45 /* EditorOption.folding */) && options.get(114 /* EditorOption.showFoldingControls */) !== 'never') {
            lineDecorationsWidth -= 11;
        }
        lineDecorationsWidth += 24;
        this._commentingRangeAmountReserved = lineDecorationsWidth;
        return this._commentingRangeAmountReserved;
    }
    getWithCommentsEditorOptions(editor, extraEditorClassName, startingLineDecorationsWidth) {
        extraEditorClassName.push('inline-comment');
        return { lineDecorationsWidth: this.getWithCommentsLineDecorationWidth(editor, startingLineDecorationsWidth), extraEditorClassName };
    }
    updateEditorLayoutOptions(editor, extraEditorClassName, lineDecorationsWidth) {
        editor.updateOptions({
            extraEditorClassName: extraEditorClassName.join(' '),
            lineDecorationsWidth: lineDecorationsWidth
        });
    }
    ensureCommentingRangeReservedAmount(editor) {
        const existing = this.getExistingCommentEditorOptions(editor);
        if (existing.lineDecorationsWidth !== this._commentingRangeAmountReserved) {
            editor.updateOptions({
                lineDecorationsWidth: this.getWithCommentsLineDecorationWidth(editor, existing.lineDecorationsWidth)
            });
        }
    }
    tryUpdateReservedSpace(uri) {
        if (!this.editor) {
            return;
        }
        const hasCommentsOrRangesInInfo = this._commentInfos.some(info => {
            const hasRanges = Boolean(info.commentingRanges && (Array.isArray(info.commentingRanges) ? info.commentingRanges : info.commentingRanges.ranges).length);
            return hasRanges || (info.threads.length > 0);
        });
        uri = uri ?? this.editor.getModel()?.uri;
        const resourceHasCommentingRanges = uri ? this.commentService.resourceHasCommentingRanges(uri) : false;
        const hasCommentsOrRanges = hasCommentsOrRangesInInfo || resourceHasCommentingRanges;
        if (hasCommentsOrRanges && this.commentService.isCommentingEnabled) {
            if (!this._commentingRangeSpaceReserved) {
                this._commentingRangeSpaceReserved = true;
                const { lineDecorationsWidth, extraEditorClassName } = this.getExistingCommentEditorOptions(this.editor);
                const newOptions = this.getWithCommentsEditorOptions(this.editor, extraEditorClassName, lineDecorationsWidth);
                this.updateEditorLayoutOptions(this.editor, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
            }
            else {
                this.ensureCommentingRangeReservedAmount(this.editor);
            }
        }
        else if ((!hasCommentsOrRanges || !this.commentService.isCommentingEnabled) && this._commentingRangeSpaceReserved) {
            this._commentingRangeSpaceReserved = false;
            const { lineDecorationsWidth, extraEditorClassName } = this.getExistingCommentEditorOptions(this.editor);
            const newOptions = this.getWithoutCommentsEditorOptions(this.editor, extraEditorClassName, lineDecorationsWidth);
            this.updateEditorLayoutOptions(this.editor, newOptions.extraEditorClassName, newOptions.lineDecorationsWidth);
        }
    }
    async setComments(commentInfos) {
        if (!this.editor || !this.commentService.isCommentingEnabled) {
            return;
        }
        this._commentInfos = commentInfos;
        this.tryUpdateReservedSpace();
        // create viewzones
        this.removeCommentWidgetsAndStoreCache();
        let hasCommentingRanges = false;
        for (const info of this._commentInfos) {
            if (!hasCommentingRanges && (info.commentingRanges.ranges.length > 0 || info.commentingRanges.fileComments)) {
                hasCommentingRanges = true;
            }
            const providerCacheStore = this._pendingNewCommentCache[info.uniqueOwner];
            const providerEditsCacheStore = this._pendingEditsCache[info.uniqueOwner];
            info.threads = info.threads.filter(thread => !thread.isDisposed);
            for (const thread of info.threads) {
                let pendingComment = undefined;
                if (providerCacheStore) {
                    pendingComment = providerCacheStore[thread.threadId];
                }
                let pendingEdits = undefined;
                if (providerEditsCacheStore) {
                    pendingEdits = providerEditsCacheStore[thread.threadId];
                }
                await this.displayCommentThread(info.uniqueOwner, thread, false, pendingComment, pendingEdits);
            }
            for (const thread of info.pendingCommentThreads ?? []) {
                this.resumePendingComment(this.editor.getModel().uri, thread);
            }
        }
        this._commentingRangeDecorator.update(this.editor, this._commentInfos);
        this._commentThreadRangeDecorator.update(this.editor, this._commentInfos);
        if (hasCommentingRanges) {
            this._activeEditorHasCommentingRange.set(true);
        }
        else {
            this._activeEditorHasCommentingRange.set(false);
        }
    }
    closeWidget() {
        this._commentWidgets?.forEach(widget => widget.hide());
        if (this.editor) {
            this.editor.focus();
            this.editor.revealRangeInCenter(this.editor.getSelection());
        }
    }
    removeCommentWidgetsAndStoreCache() {
        if (this._commentWidgets) {
            this._commentWidgets.forEach(zone => {
                const pendingComments = zone.getPendingComments();
                const pendingNewComment = pendingComments.newComment;
                const providerNewCommentCacheStore = this._pendingNewCommentCache[zone.uniqueOwner];
                let lastCommentBody;
                if (zone.commentThread.comments && zone.commentThread.comments.length) {
                    const lastComment = zone.commentThread.comments[zone.commentThread.comments.length - 1];
                    if (typeof lastComment.body === 'string') {
                        lastCommentBody = lastComment.body;
                    }
                    else {
                        lastCommentBody = lastComment.body.value;
                    }
                }
                if (pendingNewComment && (pendingNewComment.body !== lastCommentBody)) {
                    if (!providerNewCommentCacheStore) {
                        this._pendingNewCommentCache[zone.uniqueOwner] = {};
                    }
                    this._pendingNewCommentCache[zone.uniqueOwner][zone.commentThread.threadId] = pendingNewComment;
                }
                else {
                    if (providerNewCommentCacheStore) {
                        delete providerNewCommentCacheStore[zone.commentThread.threadId];
                    }
                }
                const pendingEdits = pendingComments.edits;
                const providerEditsCacheStore = this._pendingEditsCache[zone.uniqueOwner];
                if (Object.keys(pendingEdits).length > 0) {
                    if (!providerEditsCacheStore) {
                        this._pendingEditsCache[zone.uniqueOwner] = {};
                    }
                    this._pendingEditsCache[zone.uniqueOwner][zone.commentThread.threadId] = pendingEdits;
                }
                else if (providerEditsCacheStore) {
                    delete providerEditsCacheStore[zone.commentThread.threadId];
                }
                zone.dispose();
            });
        }
        this._commentWidgets = [];
    }
};
CommentController = __decorate([
    __param(1, ICommentService),
    __param(2, IInstantiationService),
    __param(3, ICodeEditorService),
    __param(4, IContextMenuService),
    __param(5, IQuickInputService),
    __param(6, IViewsService),
    __param(7, IConfigurationService),
    __param(8, IContextKeyService),
    __param(9, IEditorService),
    __param(10, IKeybindingService),
    __param(11, IAccessibilityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], CommentController);
export { CommentController };
