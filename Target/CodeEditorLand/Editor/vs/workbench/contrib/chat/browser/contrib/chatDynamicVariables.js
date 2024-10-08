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
var ChatDynamicVariableModel_1;
import { coalesce } from '../../../../../base/common/arrays.js';
import { MarkdownString } from '../../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { basename } from '../../../../../base/common/resources.js';
import { URI } from '../../../../../base/common/uri.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../../nls.js';
import { Action2, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { ChatWidget } from '../chatWidget.js';
import { IChatVariablesService } from '../../common/chatVariables.js';
export const dynamicVariableDecorationType = 'chat-dynamic-variable';
let ChatDynamicVariableModel = class ChatDynamicVariableModel extends Disposable {
    static { ChatDynamicVariableModel_1 = this; }
    static { this.ID = 'chatDynamicVariableModel'; }
    get variables() {
        return [...this._variables];
    }
    get id() {
        return ChatDynamicVariableModel_1.ID;
    }
    constructor(widget, labelService) {
        super();
        this.widget = widget;
        this.labelService = labelService;
        this._variables = [];
        this._register(widget.inputEditor.onDidChangeModelContent(e => {
            e.changes.forEach(c => {
                // Don't mutate entries in _variables, since they will be returned from the getter
                this._variables = coalesce(this._variables.map(ref => {
                    const intersection = Range.intersectRanges(ref.range, c.range);
                    if (intersection && !intersection.isEmpty()) {
                        // The reference text was changed, it's broken.
                        // But if the whole reference range was deleted (eg history navigation) then don't try to change the editor.
                        if (!Range.containsRange(c.range, ref.range)) {
                            const rangeToDelete = new Range(ref.range.startLineNumber, ref.range.startColumn, ref.range.endLineNumber, ref.range.endColumn - 1);
                            this.widget.inputEditor.executeEdits(this.id, [{
                                    range: rangeToDelete,
                                    text: '',
                                }]);
                        }
                        return null;
                    }
                    else if (Range.compareRangesUsingStarts(ref.range, c.range) > 0) {
                        const delta = c.text.length - c.rangeLength;
                        return {
                            ...ref,
                            range: {
                                startLineNumber: ref.range.startLineNumber,
                                startColumn: ref.range.startColumn + delta,
                                endLineNumber: ref.range.endLineNumber,
                                endColumn: ref.range.endColumn + delta
                            }
                        };
                    }
                    return ref;
                }));
            });
            this.updateDecorations();
        }));
    }
    getInputState() {
        return this.variables;
    }
    setInputState(s) {
        if (!Array.isArray(s)) {
            s = [];
        }
        this._variables = s;
        this.updateDecorations();
    }
    addReference(ref) {
        this._variables.push(ref);
        this.updateDecorations();
    }
    updateDecorations() {
        this.widget.inputEditor.setDecorationsByType('chat', dynamicVariableDecorationType, this._variables.map((r) => ({
            range: r.range,
            hoverMessage: this.getHoverForReference(r)
        })));
    }
    getHoverForReference(ref) {
        const value = ref.data;
        if (URI.isUri(value)) {
            return new MarkdownString(this.labelService.getUriLabel(value, { relative: true }));
        }
        else {
            return undefined;
        }
    }
};
ChatDynamicVariableModel = ChatDynamicVariableModel_1 = __decorate([
    __param(1, ILabelService),
    __metadata("design:paramtypes", [Object, Object])
], ChatDynamicVariableModel);
export { ChatDynamicVariableModel };
ChatWidget.CONTRIBS.push(ChatDynamicVariableModel);
function isSelectAndInsertFileActionContext(context) {
    return 'widget' in context && 'range' in context;
}
export class SelectAndInsertFileAction extends Action2 {
    static { this.Name = 'files'; }
    static { this.Item = {
        label: localize('allFiles', 'All Files'),
        description: localize('allFilesDescription', 'Search for relevant files in the workspace and provide context from them'),
    }; }
    static { this.ID = 'workbench.action.chat.selectAndInsertFile'; }
    constructor() {
        super({
            id: SelectAndInsertFileAction.ID,
            title: '' // not displayed
        });
    }
    async run(accessor, ...args) {
        const textModelService = accessor.get(ITextModelService);
        const logService = accessor.get(ILogService);
        const quickInputService = accessor.get(IQuickInputService);
        const chatVariablesService = accessor.get(IChatVariablesService);
        const context = args[0];
        if (!isSelectAndInsertFileActionContext(context)) {
            return;
        }
        const doCleanup = () => {
            // Failed, remove the dangling `file`
            context.widget.inputEditor.executeEdits('chatInsertFile', [{ range: context.range, text: `` }]);
        };
        let options;
        // If we have a `files` variable, add an option to select all files in the picker.
        // This of course assumes that the `files` variable has the behavior that it searches
        // through files in the workspace.
        if (chatVariablesService.hasVariable(SelectAndInsertFileAction.Name)) {
            const providerOptions = {
                additionPicks: [SelectAndInsertFileAction.Item, { type: 'separator' }]
            };
            options = { providerOptions };
        }
        // TODO: have dedicated UX for this instead of using the quick access picker
        const picks = await quickInputService.quickAccess.pick('', options);
        if (!picks?.length) {
            logService.trace('SelectAndInsertFileAction: no file selected');
            doCleanup();
            return;
        }
        const editor = context.widget.inputEditor;
        const range = context.range;
        // Handle the special case of selecting all files
        if (picks[0] === SelectAndInsertFileAction.Item) {
            const text = `#${SelectAndInsertFileAction.Name}`;
            const success = editor.executeEdits('chatInsertFile', [{ range, text: text + ' ' }]);
            if (!success) {
                logService.trace(`SelectAndInsertFileAction: failed to insert "${text}"`);
                doCleanup();
            }
            return;
        }
        // Handle the case of selecting a specific file
        const resource = picks[0].resource;
        if (!textModelService.canHandleResource(resource)) {
            logService.trace('SelectAndInsertFileAction: non-text resource selected');
            doCleanup();
            return;
        }
        const fileName = basename(resource);
        const text = `#file:${fileName}`;
        const success = editor.executeEdits('chatInsertFile', [{ range, text: text + ' ' }]);
        if (!success) {
            logService.trace(`SelectAndInsertFileAction: failed to insert "${text}"`);
            doCleanup();
            return;
        }
        context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
            id: 'vscode.file',
            range: { startLineNumber: range.startLineNumber, startColumn: range.startColumn, endLineNumber: range.endLineNumber, endColumn: range.startColumn + text.length },
            data: resource
        });
    }
}
registerAction2(SelectAndInsertFileAction);
function isAddDynamicVariableContext(context) {
    return 'widget' in context &&
        'range' in context &&
        'variableData' in context;
}
export class AddDynamicVariableAction extends Action2 {
    static { this.ID = 'workbench.action.chat.addDynamicVariable'; }
    constructor() {
        super({
            id: AddDynamicVariableAction.ID,
            title: '' // not displayed
        });
    }
    async run(accessor, ...args) {
        const context = args[0];
        if (!isAddDynamicVariableContext(context)) {
            return;
        }
        let range = context.range;
        const variableData = context.variableData;
        const doCleanup = () => {
            // Failed, remove the dangling variable prefix
            context.widget.inputEditor.executeEdits('chatInsertDynamicVariableWithArguments', [{ range: context.range, text: `` }]);
        };
        // If this completion item has no command, return it directly
        if (context.command) {
            // Invoke the command on this completion item along with its args and return the result
            const commandService = accessor.get(ICommandService);
            const selection = await commandService.executeCommand(context.command.id, ...(context.command.arguments ?? []));
            if (!selection) {
                doCleanup();
                return;
            }
            // Compute new range and variableData
            const insertText = ':' + selection;
            const insertRange = new Range(range.startLineNumber, range.endColumn, range.endLineNumber, range.endColumn + insertText.length);
            range = new Range(range.startLineNumber, range.startColumn, range.endLineNumber, range.endColumn + insertText.length);
            const editor = context.widget.inputEditor;
            const success = editor.executeEdits('chatInsertDynamicVariableWithArguments', [{ range: insertRange, text: insertText + ' ' }]);
            if (!success) {
                doCleanup();
                return;
            }
        }
        context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
            id: context.id,
            range: range,
            data: variableData
        });
    }
}
registerAction2(AddDynamicVariableAction);
