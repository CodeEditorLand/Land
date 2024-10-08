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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { coalesce } from '../../../../../base/common/arrays.js';
import { AsyncIterableObject } from '../../../../../base/common/async.js';
import { VSBuffer } from '../../../../../base/common/buffer.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { isCancellationError } from '../../../../../base/common/errors.js';
import { isEqual } from '../../../../../base/common/resources.js';
import * as strings from '../../../../../base/common/strings.js';
import { isCodeEditor, isDiffEditor } from '../../../../../editor/browser/editorBrowser.js';
import { IBulkEditService, ResourceTextEdit } from '../../../../../editor/browser/services/bulkEditService.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ILanguageService } from '../../../../../editor/common/languages/language.js';
import { ILanguageFeaturesService } from '../../../../../editor/common/services/languageFeatures.js';
import { localize } from '../../../../../nls.js';
import { IDialogService } from '../../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../../platform/files/common/files.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IProgressService } from '../../../../../platform/progress/common/progress.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { ITextFileService } from '../../../../services/textfile/common/textfiles.js';
import { InlineChatController } from '../../../inlineChat/browser/inlineChatController.js';
import { insertCell } from '../../../notebook/browser/controller/cellOperations.js';
import { CellKind, NOTEBOOK_EDITOR_ID } from '../../../notebook/common/notebookCommon.js';
import { getReferencesAsDocumentContext } from '../../common/chatCodeMapperService.js';
import { IChatService } from '../../common/chatService.js';
import { isRequestVM, isResponseVM } from '../../common/chatViewModel.js';
let InsertCodeBlockOperation = class InsertCodeBlockOperation {
    constructor(editorService, textFileService, bulkEditService, codeEditorService, chatService, languageService, dialogService) {
        this.editorService = editorService;
        this.textFileService = textFileService;
        this.bulkEditService = bulkEditService;
        this.codeEditorService = codeEditorService;
        this.chatService = chatService;
        this.languageService = languageService;
        this.dialogService = dialogService;
    }
    async run(context) {
        const activeEditorControl = getEditableActiveCodeEditor(this.editorService);
        if (activeEditorControl) {
            await this.handleTextEditor(activeEditorControl, context);
        }
        else {
            const activeNotebookEditor = getActiveNotebookEditor(this.editorService);
            if (activeNotebookEditor) {
                await this.handleNotebookEditor(activeNotebookEditor, context);
            }
            else {
                this.notify(localize('insertCodeBlock.noActiveEditor', "To insert the code block, open a code editor or notebook editor and set the cursor at the location where to insert the code block."));
            }
        }
        notifyUserAction(this.chatService, context, {
            kind: 'insert',
            codeBlockIndex: context.codeBlockIndex,
            totalCharacters: context.code.length
        });
    }
    async handleNotebookEditor(notebookEditor, codeBlockContext) {
        if (notebookEditor.isReadOnly) {
            this.notify(localize('insertCodeBlock.readonlyNotebook', "Cannot insert the code block to read-only notebook editor."));
            return false;
        }
        const focusRange = notebookEditor.getFocus();
        const next = Math.max(focusRange.end - 1, 0);
        insertCell(this.languageService, notebookEditor, next, CellKind.Code, 'below', codeBlockContext.code, true);
        return true;
    }
    async handleTextEditor(codeEditor, codeBlockContext) {
        const activeModel = codeEditor.getModel();
        if (isReadOnly(activeModel, this.textFileService)) {
            this.notify(localize('insertCodeBlock.readonly', "Cannot insert the code block to read-only code editor."));
            return false;
        }
        const range = codeEditor.getSelection() ?? new Range(activeModel.getLineCount(), 1, activeModel.getLineCount(), 1);
        const text = reindent(codeBlockContext.code, activeModel, range.startLineNumber);
        const edits = [new ResourceTextEdit(activeModel.uri, { range, text })];
        await this.bulkEditService.apply(edits);
        this.codeEditorService.listCodeEditors().find(editor => editor.getModel()?.uri.toString() === activeModel.uri.toString())?.focus();
        return true;
    }
    notify(message) {
        //this.notificationService.notify({ severity: Severity.Info, message });
        this.dialogService.info(message);
    }
};
InsertCodeBlockOperation = __decorate([
    __param(0, IEditorService),
    __param(1, ITextFileService),
    __param(2, IBulkEditService),
    __param(3, ICodeEditorService),
    __param(4, IChatService),
    __param(5, ILanguageService),
    __param(6, IDialogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], InsertCodeBlockOperation);
export { InsertCodeBlockOperation };
let ApplyCodeBlockOperation = class ApplyCodeBlockOperation {
    constructor(editorService, textFileService, bulkEditService, codeEditorService, chatService, languageFeaturesService, progressService, languageService, fileService, dialogService, logService) {
        this.editorService = editorService;
        this.textFileService = textFileService;
        this.bulkEditService = bulkEditService;
        this.codeEditorService = codeEditorService;
        this.chatService = chatService;
        this.languageFeaturesService = languageFeaturesService;
        this.progressService = progressService;
        this.languageService = languageService;
        this.fileService = fileService;
        this.dialogService = dialogService;
        this.logService = logService;
    }
    async run(context) {
        if (this.inlineChatPreview && this.inlineChatPreview.isOpen()) {
            await this.dialogService.info(localize('overlap', "Another code change is being previewed. Please apply or discard the pending changes first."));
            return;
        }
        let activeEditorControl = getEditableActiveCodeEditor(this.editorService);
        if (context.codemapperUri && !isEqual(activeEditorControl?.getModel().uri, context.codemapperUri)) {
            // If the code block is from a code mapper, first reveal the target file
            try {
                // If the file doesn't exist yet, create it
                if (!(await this.fileService.exists(context.codemapperUri))) {
                    // TODO: try to find the file in the workspace
                    await this.fileService.writeFile(context.codemapperUri, VSBuffer.fromString(''));
                }
                await this.editorService.openEditor({ resource: context.codemapperUri });
                activeEditorControl = getEditableActiveCodeEditor(this.editorService);
                if (activeEditorControl) {
                    this.tryToRevealCodeBlock(activeEditorControl, context.code);
                }
            }
            catch (e) {
                this.logService.info('[ApplyCodeBlockOperation] error opening code mapper file', context.codemapperUri, e);
            }
        }
        let result = undefined;
        if (activeEditorControl) {
            await this.handleTextEditor(activeEditorControl, context);
        }
        else {
            const activeNotebookEditor = getActiveNotebookEditor(this.editorService);
            if (activeNotebookEditor) {
                result = await this.handleNotebookEditor(activeNotebookEditor, context);
            }
            else {
                this.notify(localize('applyCodeBlock.noActiveEditor', "To apply this code block, open a code or notebook editor."));
            }
        }
        notifyUserAction(this.chatService, context, {
            kind: 'apply',
            codeBlockIndex: context.codeBlockIndex,
            totalCharacters: context.code.length,
            codeMapper: result?.codeMapper,
            editsProposed: !!result?.edits,
        });
    }
    async handleNotebookEditor(notebookEditor, codeBlockContext) {
        if (notebookEditor.isReadOnly) {
            this.notify(localize('applyCodeBlock.readonlyNotebook', "Cannot apply code block to read-only notebook editor."));
            return undefined;
        }
        const focusRange = notebookEditor.getFocus();
        const next = Math.max(focusRange.end - 1, 0);
        insertCell(this.languageService, notebookEditor, next, CellKind.Code, 'below', codeBlockContext.code, true);
        return undefined;
    }
    async handleTextEditor(codeEditor, codeBlockContext) {
        if (isReadOnly(codeEditor.getModel(), this.textFileService)) {
            this.notify(localize('applyCodeBlock.readonly', "Cannot apply code block to read-only file."));
            return undefined;
        }
        const result = await this.computeEdits(codeEditor, codeBlockContext);
        if (result.edits) {
            const showWithPreview = await this.applyWithInlinePreview(result.edits, codeEditor);
            if (!showWithPreview) {
                await this.bulkEditService.apply(result.edits, { showPreview: true });
                const activeModel = codeEditor.getModel();
                this.codeEditorService.listCodeEditors().find(editor => editor.getModel()?.uri.toString() === activeModel.uri.toString())?.focus();
            }
        }
        return result;
    }
    async computeEdits(codeEditor, codeBlockActionContext) {
        const activeModel = codeEditor.getModel();
        const mappedEditsProviders = this.languageFeaturesService.mappedEditsProvider.ordered(activeModel);
        if (mappedEditsProviders.length > 0) {
            // 0th sub-array - editor selections array if there are any selections
            // 1st sub-array - array with documents used to get the chat reply
            const docRefs = [];
            collectDocumentContextFromSelections(codeEditor, docRefs);
            collectDocumentContextFromContext(codeBlockActionContext, docRefs);
            const cancellationTokenSource = new CancellationTokenSource();
            let codeMapper; // the last used code mapper
            try {
                const result = await this.progressService.withProgress({ location: 15 /* ProgressLocation.Notification */, delay: 500, sticky: true, cancellable: true }, async (progress) => {
                    for (const provider of mappedEditsProviders) {
                        codeMapper = provider.displayName;
                        progress.report({ message: localize('applyCodeBlock.progress', "Applying code block using {0}...", codeMapper) });
                        const mappedEdits = await provider.provideMappedEdits(activeModel, [codeBlockActionContext.code], {
                            documents: docRefs,
                            conversation: getChatConversation(codeBlockActionContext),
                        }, cancellationTokenSource.token);
                        if (mappedEdits) {
                            return { edits: mappedEdits.edits, codeMapper };
                        }
                    }
                    return undefined;
                }, () => cancellationTokenSource.cancel());
                if (result) {
                    return result;
                }
            }
            catch (e) {
                if (!isCancellationError(e)) {
                    this.notify(localize('applyCodeBlock.error', "Failed to apply code block: {0}", e.message));
                }
            }
            finally {
                cancellationTokenSource.dispose();
            }
            return { edits: [], codeMapper };
        }
        return { edits: [], codeMapper: undefined };
    }
    async applyWithInlinePreview(edits, codeEditor) {
        const firstEdit = edits[0];
        if (!ResourceTextEdit.is(firstEdit)) {
            return false;
        }
        const resource = firstEdit.resource;
        const textEdits = coalesce(edits.map(edit => ResourceTextEdit.is(edit) && isEqual(resource, edit.resource) ? edit.textEdit : undefined));
        if (textEdits.length !== edits.length) { // more than one file has changed, fall back to bulk edit preview
            return false;
        }
        const editorToApply = await this.codeEditorService.openCodeEditor({ resource }, codeEditor);
        if (editorToApply) {
            const inlineChatController = InlineChatController.get(editorToApply);
            if (inlineChatController) {
                const tokenSource = new CancellationTokenSource();
                let isOpen = true;
                const firstEdit = textEdits[0];
                editorToApply.revealLineInCenterIfOutsideViewport(firstEdit.range.startLineNumber);
                const promise = inlineChatController.reviewEdits(textEdits[0].range, AsyncIterableObject.fromArray(textEdits), tokenSource.token);
                promise.finally(() => {
                    isOpen = false;
                    tokenSource.dispose();
                });
                this.inlineChatPreview = {
                    promise,
                    isOpen: () => isOpen,
                    cancel: () => tokenSource.cancel(),
                };
                return true;
            }
        }
        return false;
    }
    tryToRevealCodeBlock(codeEditor, codeBlock) {
        const match = codeBlock.match(/(\S[^\n]*)\n/); // substring that starts with a non-whitespace character and ends with a newline
        if (match && match[1].length > 10) {
            const findMatch = codeEditor.getModel().findNextMatch(match[1], { lineNumber: 1, column: 1 }, false, false, null, false);
            if (findMatch) {
                codeEditor.revealRangeInCenter(findMatch.range);
            }
        }
    }
    notify(message) {
        //this.notificationService.notify({ severity: Severity.Info, message });
        this.dialogService.info(message);
    }
};
ApplyCodeBlockOperation = __decorate([
    __param(0, IEditorService),
    __param(1, ITextFileService),
    __param(2, IBulkEditService),
    __param(3, ICodeEditorService),
    __param(4, IChatService),
    __param(5, ILanguageFeaturesService),
    __param(6, IProgressService),
    __param(7, ILanguageService),
    __param(8, IFileService),
    __param(9, IDialogService),
    __param(10, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ApplyCodeBlockOperation);
export { ApplyCodeBlockOperation };
function notifyUserAction(chatService, context, action) {
    if (isResponseVM(context.element)) {
        chatService.notifyUserAction({
            agentId: context.element.agent?.id,
            command: context.element.slashCommand?.name,
            sessionId: context.element.sessionId,
            requestId: context.element.requestId,
            result: context.element.result,
            action
        });
    }
}
function getActiveNotebookEditor(editorService) {
    const activeEditorPane = editorService.activeEditorPane;
    if (activeEditorPane?.getId() === NOTEBOOK_EDITOR_ID) {
        const notebookEditor = activeEditorPane.getControl();
        if (notebookEditor.hasModel()) {
            return notebookEditor;
        }
    }
    return undefined;
}
function getEditableActiveCodeEditor(editorService) {
    const activeCodeEditorInNotebook = getActiveNotebookEditor(editorService)?.activeCodeEditor;
    if (activeCodeEditorInNotebook && activeCodeEditorInNotebook.hasTextFocus() && activeCodeEditorInNotebook.hasModel()) {
        return activeCodeEditorInNotebook;
    }
    let activeEditorControl = editorService.activeTextEditorControl;
    if (isDiffEditor(activeEditorControl)) {
        activeEditorControl = activeEditorControl.getOriginalEditor().hasTextFocus() ? activeEditorControl.getOriginalEditor() : activeEditorControl.getModifiedEditor();
    }
    if (!isCodeEditor(activeEditorControl)) {
        return undefined;
    }
    if (!activeEditorControl.hasModel()) {
        return undefined;
    }
    return activeEditorControl;
}
function isReadOnly(model, textFileService) {
    // Check if model is editable, currently only support untitled and text file
    const activeTextModel = textFileService.files.get(model.uri) ?? textFileService.untitled.get(model.uri);
    return !!activeTextModel?.isReadonly();
}
function collectDocumentContextFromSelections(codeEditor, result) {
    const activeModel = codeEditor.getModel();
    const currentDocUri = activeModel.uri;
    const currentDocVersion = activeModel.getVersionId();
    const selections = codeEditor.getSelections();
    if (selections.length > 0) {
        result.push([
            {
                uri: currentDocUri,
                version: currentDocVersion,
                ranges: selections,
            }
        ]);
    }
}
function collectDocumentContextFromContext(context, result) {
    if (isResponseVM(context.element) && context.element.usedContext?.documents) {
        result.push(context.element.usedContext.documents);
    }
}
function getChatConversation(context) {
    // TODO@aeschli for now create a conversation with just the current element
    // this will be expanded in the future to include the request and any other responses
    if (isResponseVM(context.element)) {
        return [{
                type: 'response',
                message: context.element.response.toMarkdown(),
                references: getReferencesAsDocumentContext(context.element.contentReferences)
            }];
    }
    else if (isRequestVM(context.element)) {
        return [{
                type: 'request',
                message: context.element.messageText,
            }];
    }
    else {
        return [];
    }
}
function reindent(codeBlockContent, model, seletionStartLine) {
    const newContent = strings.splitLines(codeBlockContent);
    if (newContent.length === 0) {
        return codeBlockContent;
    }
    const formattingOptions = model.getFormattingOptions();
    const codeIndentLevel = computeIndentation(model.getLineContent(seletionStartLine), formattingOptions.tabSize).level;
    const indents = newContent.map(line => computeIndentation(line, formattingOptions.tabSize));
    // find the smallest indent level in the code block
    const newContentIndentLevel = indents.reduce((min, indent, index) => {
        if (indent.length !== newContent[index].length) { // ignore empty lines
            return Math.min(indent.level, min);
        }
        return min;
    }, Number.MAX_VALUE);
    if (newContentIndentLevel === Number.MAX_VALUE || newContentIndentLevel === codeIndentLevel) {
        // all lines are empty or the indent is already correct
        return codeBlockContent;
    }
    const newLines = [];
    for (let i = 0; i < newContent.length; i++) {
        const { level, length } = indents[i];
        const newLevel = Math.max(0, codeIndentLevel + level - newContentIndentLevel);
        const newIndentation = formattingOptions.insertSpaces ? ' '.repeat(formattingOptions.tabSize * newLevel) : '\t'.repeat(newLevel);
        newLines.push(newIndentation + newContent[i].substring(length));
    }
    return newLines.join('\n');
}
/**
 * Returns:
 *  - level: the line's the ident level in tabs
 *  - length: the number of characters of the leading whitespace
 */
export function computeIndentation(line, tabSize) {
    let nSpaces = 0;
    let level = 0;
    let i = 0;
    let length = 0;
    const len = line.length;
    while (i < len) {
        const chCode = line.charCodeAt(i);
        if (chCode === 32 /* CharCode.Space */) {
            nSpaces++;
            if (nSpaces === tabSize) {
                level++;
                nSpaces = 0;
                length = i + 1;
            }
        }
        else if (chCode === 9 /* CharCode.Tab */) {
            level++;
            nSpaces = 0;
            length = i + 1;
        }
        else {
            break;
        }
        i++;
    }
    return { level, length };
}
