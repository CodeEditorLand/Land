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
import { CancellationToken } from '../../../../../../base/common/cancellation.js';
import { codiconsLibrary } from '../../../../../../base/common/codiconsLibrary.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { Range } from '../../../../../../editor/common/core/range.js';
import { ILanguageFeaturesService } from '../../../../../../editor/common/services/languageFeatures.js';
import { localize } from '../../../../../../nls.js';
import { Action2, registerAction2 } from '../../../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../../../platform/contextkey/common/contextkey.js';
import { IQuickInputService } from '../../../../../../platform/quickinput/common/quickInput.js';
import { registerWorkbenchContribution2 } from '../../../../../common/contributions.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IChatWidgetService } from '../../../../chat/browser/chat.js';
import { ChatInputPart } from '../../../../chat/browser/chatInputPart.js';
import { ChatContextAttachments } from '../../../../chat/browser/contrib/chatContextAttachments.js';
import { ChatDynamicVariableModel } from '../../../../chat/browser/contrib/chatDynamicVariables.js';
import { computeCompletionRanges } from '../../../../chat/browser/contrib/chatInputCompletions.js';
import { ChatAgentLocation, IChatAgentService } from '../../../../chat/common/chatAgents.js';
import { chatVariableLeader } from '../../../../chat/common/chatParserTypes.js';
import { INotebookKernelService } from '../../../common/notebookKernelService.js';
import { getNotebookEditorFromEditorPane } from '../../notebookBrowser.js';
import './cellChatActions.js';
import { CTX_NOTEBOOK_CHAT_HAS_AGENT } from './notebookChatContext.js';
const NotebookKernelVariableKey = 'kernelVariable';
let NotebookChatContribution = class NotebookChatContribution extends Disposable {
    static { this.ID = 'workbench.contrib.notebookChatContribution'; }
    constructor(contextKeyService, chatAgentService, editorService, chatWidgetService, notebookKernelService, languageFeaturesService) {
        super();
        this.editorService = editorService;
        this.chatWidgetService = chatWidgetService;
        this.notebookKernelService = notebookKernelService;
        this.languageFeaturesService = languageFeaturesService;
        this._ctxHasProvider = CTX_NOTEBOOK_CHAT_HAS_AGENT.bindTo(contextKeyService);
        const updateNotebookAgentStatus = () => {
            const hasNotebookAgent = Boolean(chatAgentService.getDefaultAgent(ChatAgentLocation.Notebook));
            this._ctxHasProvider.set(hasNotebookAgent);
        };
        updateNotebookAgentStatus();
        this._register(chatAgentService.onDidChangeAgents(updateNotebookAgentStatus));
        this._register(this.languageFeaturesService.completionProvider.register({ scheme: ChatInputPart.INPUT_SCHEME, hasAccessToAllModels: true }, {
            _debugDisplayName: 'chatKernelDynamicCompletions',
            triggerCharacters: [chatVariableLeader],
            provideCompletionItems: async (model, position, _context, token) => {
                const widget = this.chatWidgetService.getWidgetByInputUri(model.uri);
                if (!widget || !widget.supportsFileReferences) {
                    return null;
                }
                if (widget.location !== ChatAgentLocation.Notebook) {
                    return null;
                }
                const variableNameDef = new RegExp(`${chatVariableLeader}\\w*`, 'g');
                const range = computeCompletionRanges(model, position, variableNameDef, true);
                if (!range) {
                    return null;
                }
                const result = { suggestions: [] };
                const afterRange = new Range(position.lineNumber, range.replace.startColumn, position.lineNumber, range.replace.startColumn + `${chatVariableLeader}${NotebookKernelVariableKey}:`.length);
                result.suggestions.push({
                    label: `${chatVariableLeader}${NotebookKernelVariableKey}`,
                    insertText: `${chatVariableLeader}${NotebookKernelVariableKey}:`,
                    detail: localize('pickKernelVariableLabel', "Pick a variable from the kernel"),
                    range,
                    kind: 18,
                    command: { id: SelectAndInsertKernelVariableAction.ID, title: SelectAndInsertKernelVariableAction.ID, arguments: [{ widget, range: afterRange }] },
                    sortText: 'z'
                });
                await this.addKernelVariableCompletion(widget, result, range, token);
                return result;
            }
        }));
    }
    async addKernelVariableCompletion(widget, result, info, token) {
        let pattern;
        if (info.varWord?.word && info.varWord.word.startsWith(chatVariableLeader)) {
            pattern = info.varWord.word.toLowerCase().slice(1);
        }
        const notebook = getNotebookEditorFromEditorPane(this.editorService.activeEditorPane)?.getViewModel()?.notebookDocument;
        if (!notebook) {
            return;
        }
        const selectedKernel = this.notebookKernelService.getMatchingKernel(notebook).selected;
        const hasVariableProvider = selectedKernel?.hasVariableProvider;
        if (!hasVariableProvider) {
            return;
        }
        const variables = await selectedKernel.provideVariables(notebook.uri, undefined, 'named', 0, CancellationToken.None);
        for await (const variable of variables) {
            if (pattern && !variable.name.toLowerCase().includes(pattern)) {
                continue;
            }
            result.suggestions.push({
                label: { label: variable.name, description: variable.type },
                insertText: `${chatVariableLeader}${NotebookKernelVariableKey}:${variable.name} `,
                filterText: `${chatVariableLeader}${variable.name}`,
                range: info,
                kind: 4,
                sortText: 'z',
                command: { id: SelectAndInsertKernelVariableAction.ID, title: SelectAndInsertKernelVariableAction.ID, arguments: [{ widget, range: info.insert, variable: variable.name }] },
                detail: variable.type,
                documentation: variable.value,
            });
        }
    }
};
NotebookChatContribution = __decorate([
    __param(0, IContextKeyService),
    __param(1, IChatAgentService),
    __param(2, IEditorService),
    __param(3, IChatWidgetService),
    __param(4, INotebookKernelService),
    __param(5, ILanguageFeaturesService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], NotebookChatContribution);
export class SelectAndInsertKernelVariableAction extends Action2 {
    constructor() {
        super({
            id: SelectAndInsertKernelVariableAction.ID,
            title: ''
        });
    }
    static { this.ID = 'notebook.chat.selectAndInsertKernelVariable'; }
    async run(accessor, ...args) {
        const editorService = accessor.get(IEditorService);
        const notebookKernelService = accessor.get(INotebookKernelService);
        const quickInputService = accessor.get(IQuickInputService);
        const notebook = getNotebookEditorFromEditorPane(editorService.activeEditorPane)?.getViewModel()?.notebookDocument;
        if (!notebook) {
            return;
        }
        const context = args[0];
        if (!context || !('widget' in context) || !('range' in context)) {
            return;
        }
        const widget = context.widget;
        const range = context.range;
        const variable = context.variable;
        if (variable !== undefined) {
            this.addVariableReference(widget, variable, range, false);
            return;
        }
        const selectedKernel = notebookKernelService.getMatchingKernel(notebook).selected;
        const hasVariableProvider = selectedKernel?.hasVariableProvider;
        if (!hasVariableProvider) {
            return;
        }
        const variables = await selectedKernel.provideVariables(notebook.uri, undefined, 'named', 0, CancellationToken.None);
        const quickPickItems = [];
        for await (const variable of variables) {
            quickPickItems.push({
                label: variable.name,
                description: variable.value,
                detail: variable.type,
            });
        }
        const pickedVariable = await quickInputService.pick(quickPickItems, { placeHolder: 'Select a kernel variable' });
        if (!pickedVariable) {
            return;
        }
        this.addVariableReference(widget, pickedVariable.label, range, true);
    }
    addVariableReference(widget, variableName, range, updateText) {
        if (range) {
            const text = `#kernelVariable:${variableName}`;
            if (updateText) {
                const editor = widget.inputEditor;
                const success = editor.executeEdits('chatInsertFile', [{ range, text: text + ' ' }]);
                if (!success) {
                    return;
                }
            }
            widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
                id: 'vscode.notebook.variable',
                range: { startLineNumber: range.startLineNumber, startColumn: range.startColumn, endLineNumber: range.endLineNumber, endColumn: range.startColumn + text.length },
                data: variableName,
                fullName: variableName,
                icon: codiconsLibrary.variable,
            });
        }
        else {
            widget.getContrib(ChatContextAttachments.ID)?.setContext(false, ...[{
                    id: 'vscode.notebook.variable',
                    name: variableName,
                    value: variableName,
                    icon: codiconsLibrary.variable,
                    isDynamic: true
                }]);
        }
    }
}
registerAction2(SelectAndInsertKernelVariableAction);
registerWorkbenchContribution2(NotebookChatContribution.ID, NotebookChatContribution, 2);
