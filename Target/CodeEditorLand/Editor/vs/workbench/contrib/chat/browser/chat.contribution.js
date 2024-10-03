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
import { timeout } from '../../../../base/common/async.js';
import { MarkdownString, isMarkdownString } from '../../../../base/common/htmlContent.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../base/common/network.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { registerEditorFeature } from '../../../../editor/common/editorFeatures.js';
import * as nls from '../../../../nls.js';
import { AccessibleViewRegistry } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { EditorPaneDescriptor } from '../../../browser/editor.js';
import { Extensions as WorkbenchExtensions, registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { EditorExtensions } from '../../../common/editor.js';
import { IEditorResolverService, RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
import { ChatAgentLocation, ChatAgentNameService, ChatAgentService, IChatAgentNameService, IChatAgentService } from '../common/chatAgents.js';
import { CodeMapperService, ICodeMapperService } from '../common/chatCodeMapperService.js';
import '../common/chatColors.js';
import { IChatEditingService } from '../common/chatEditingService.js';
import { chatVariableLeader } from '../common/chatParserTypes.js';
import { IChatService } from '../common/chatService.js';
import { ChatService } from '../common/chatServiceImpl.js';
import { ChatSlashCommandService, IChatSlashCommandService } from '../common/chatSlashCommands.js';
import { IChatVariablesService } from '../common/chatVariables.js';
import { ChatWidgetHistoryService, IChatWidgetHistoryService } from '../common/chatWidgetHistoryService.js';
import { ILanguageModelsService, LanguageModelsService } from '../common/languageModels.js';
import { ILanguageModelStatsService, LanguageModelStatsService } from '../common/languageModelStats.js';
import { ILanguageModelToolsService, LanguageModelToolsService } from '../common/languageModelToolsService.js';
import { LanguageModelToolsExtensionPointHandler } from '../common/tools/languageModelToolsContribution.js';
import { IVoiceChatService, VoiceChatService } from '../common/voiceChatService.js';
import { ChatAccessibilityHelp } from './actions/chatAccessibilityHelp.js';
import { ChatCommandCenterRendering, registerChatActions } from './actions/chatActions.js';
import { ACTION_ID_NEW_CHAT, registerNewChatActions } from './actions/chatClearActions.js';
import { registerChatCodeBlockActions, registerChatCodeCompareBlockActions } from './actions/chatCodeblockActions.js';
import { registerChatContextActions } from './actions/chatContextActions.js';
import { registerChatCopyActions } from './actions/chatCopyActions.js';
import { registerChatDeveloperActions } from './actions/chatDeveloperActions.js';
import { SubmitAction, registerChatExecuteActions } from './actions/chatExecuteActions.js';
import { registerChatFileTreeActions } from './actions/chatFileTreeActions.js';
import { registerChatExportActions } from './actions/chatImportExport.js';
import { registerMoveActions } from './actions/chatMoveActions.js';
import { registerQuickChatActions } from './actions/chatQuickInputActions.js';
import { registerChatTitleActions } from './actions/chatTitleActions.js';
import { IChatAccessibilityService, IChatCodeBlockContextProviderService, IChatWidgetService, IQuickChatService } from './chat.js';
import { ChatAccessibilityService } from './chatAccessibilityService.js';
import { ChatEditingService } from './chatEditingService.js';
import { ChatEditor } from './chatEditor.js';
import { ChatEditorInput, ChatEditorInputSerializer } from './chatEditorInput.js';
import { ChatGettingStartedContribution } from './chatGettingStarted.js';
import { agentSlashCommandToMarkdown, agentToMarkdown } from './chatMarkdownDecorationsRenderer.js';
import { ChatCompatibilityNotifier, ChatExtensionPointHandler } from './chatParticipantContributions.js';
import { ChatPasteProvidersFeature } from './chatPasteProviders.js';
import { QuickChatService } from './chatQuick.js';
import { ChatResponseAccessibleView } from './chatResponseAccessibleView.js';
import { ChatVariablesService } from './chatVariables.js';
import { ChatWidgetService } from './chatWidget.js';
import { ChatCodeBlockContextProviderService } from './codeBlockContextProviderService.js';
import './contrib/chatContextAttachments.js';
import './contrib/chatInputCompletions.js';
import './contrib/chatInputEditorContrib.js';
import './contrib/chatInputEditorHover.js';
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
    id: 'chatSidebar',
    title: nls.localize('interactiveSessionConfigurationTitle', "Chat"),
    type: 'object',
    properties: {
        'chat.editor.fontSize': {
            type: 'number',
            description: nls.localize('interactiveSession.editor.fontSize', "Controls the font size in pixels in chat codeblocks."),
            default: isMacintosh ? 12 : 14,
        },
        'chat.editor.fontFamily': {
            type: 'string',
            description: nls.localize('interactiveSession.editor.fontFamily', "Controls the font family in chat codeblocks."),
            default: 'default'
        },
        'chat.editor.fontWeight': {
            type: 'string',
            description: nls.localize('interactiveSession.editor.fontWeight', "Controls the font weight in chat codeblocks."),
            default: 'default'
        },
        'chat.editor.wordWrap': {
            type: 'string',
            description: nls.localize('interactiveSession.editor.wordWrap', "Controls whether lines should wrap in chat codeblocks."),
            default: 'off',
            enum: ['on', 'off']
        },
        'chat.editor.lineHeight': {
            type: 'number',
            description: nls.localize('interactiveSession.editor.lineHeight', "Controls the line height in pixels in chat codeblocks. Use 0 to compute the line height from the font size."),
            default: 0
        },
        'chat.commandCenter.enabled': {
            type: 'boolean',
            tags: ['experimental'],
            markdownDescription: nls.localize('chat.commandCenter.enabled', "Controls whether the command center shows a menu for chat actions (requires {0}).", '`#window.commandCenter#`'),
            default: false
        },
        'chat.experimental.implicitContext': {
            type: 'boolean',
            description: nls.localize('chat.experimental.implicitContext', "Controls whether a checkbox is shown to allow the user to determine which implicit context is included with a chat participant's prompt."),
            deprecated: true,
            default: false
        },
        'chat.experimental.variables.editor': {
            type: 'boolean',
            description: nls.localize('chat.experimental.variables.editor', "Enables variables for editor chat."),
            default: true
        },
        'chat.experimental.variables.notebook': {
            type: 'boolean',
            description: nls.localize('chat.experimental.variables.notebook', "Enables variables for notebook chat."),
            default: true
        },
        'chat.experimental.variables.terminal': {
            type: 'boolean',
            description: nls.localize('chat.experimental.variables.terminal', "Enables variables for terminal chat."),
            default: false
        },
        'chat.experimental.detectParticipant.enabled': {
            type: 'boolean',
            description: nls.localize('chat.experimental.detectParticipant.enabled', "Enables chat participant autodetection for panel chat."),
            default: null
        },
    }
});
Registry.as(EditorExtensions.EditorPane).registerEditorPane(EditorPaneDescriptor.create(ChatEditor, ChatEditorInput.EditorID, nls.localize('chat', "Chat")), [
    new SyncDescriptor(ChatEditorInput)
]);
let ChatResolverContribution = class ChatResolverContribution extends Disposable {
    static { this.ID = 'workbench.contrib.chatResolver'; }
    constructor(editorResolverService, instantiationService) {
        super();
        this._register(editorResolverService.registerEditor(`${Schemas.vscodeChatSesssion}:**/**`, {
            id: ChatEditorInput.EditorID,
            label: nls.localize('chat', "Chat"),
            priority: RegisteredEditorPriority.builtin
        }, {
            singlePerResource: true,
            canSupportResource: resource => resource.scheme === Schemas.vscodeChatSesssion
        }, {
            createEditorInput: ({ resource, options }) => {
                return { editor: instantiationService.createInstance(ChatEditorInput, resource, options), options };
            }
        }));
    }
};
ChatResolverContribution = __decorate([
    __param(0, IEditorResolverService),
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], ChatResolverContribution);
AccessibleViewRegistry.register(new ChatResponseAccessibleView());
AccessibleViewRegistry.register(new ChatAccessibilityHelp());
let ChatSlashStaticSlashCommandsContribution = class ChatSlashStaticSlashCommandsContribution extends Disposable {
    constructor(slashCommandService, commandService, chatAgentService, chatVariablesService, instantiationService) {
        super();
        this._store.add(slashCommandService.registerSlashCommand({
            command: 'clear',
            detail: nls.localize('clear', "Start a new chat"),
            sortText: 'z2_clear',
            executeImmediately: true,
            locations: [ChatAgentLocation.Panel]
        }, async () => {
            commandService.executeCommand(ACTION_ID_NEW_CHAT);
        }));
        this._store.add(slashCommandService.registerSlashCommand({
            command: 'help',
            detail: '',
            sortText: 'z1_help',
            executeImmediately: true,
            locations: [ChatAgentLocation.Panel]
        }, async (prompt, progress) => {
            const defaultAgent = chatAgentService.getDefaultAgent(ChatAgentLocation.Panel);
            const agents = chatAgentService.getAgents();
            if (defaultAgent?.metadata.helpTextPrefix) {
                if (isMarkdownString(defaultAgent.metadata.helpTextPrefix)) {
                    progress.report({ content: defaultAgent.metadata.helpTextPrefix, kind: 'markdownContent' });
                }
                else {
                    progress.report({ content: new MarkdownString(defaultAgent.metadata.helpTextPrefix), kind: 'markdownContent' });
                }
                progress.report({ content: new MarkdownString('\n\n'), kind: 'markdownContent' });
            }
            const agentText = (await Promise.all(agents
                .filter(a => a.id !== defaultAgent?.id)
                .filter(a => a.locations.includes(ChatAgentLocation.Panel))
                .map(async (a) => {
                const description = a.description ? `- ${a.description}` : '';
                const agentMarkdown = instantiationService.invokeFunction(accessor => agentToMarkdown(a, true, accessor));
                const agentLine = `- ${agentMarkdown} ${description}`;
                const commandText = a.slashCommands.map(c => {
                    const description = c.description ? `- ${c.description}` : '';
                    return `\t* ${agentSlashCommandToMarkdown(a, c)} ${description}`;
                }).join('\n');
                return (agentLine + '\n' + commandText).trim();
            }))).join('\n');
            progress.report({ content: new MarkdownString(agentText, { isTrusted: { enabledCommands: [SubmitAction.ID] } }), kind: 'markdownContent' });
            if (defaultAgent?.metadata.helpTextVariablesPrefix) {
                progress.report({ content: new MarkdownString('\n\n'), kind: 'markdownContent' });
                if (isMarkdownString(defaultAgent.metadata.helpTextVariablesPrefix)) {
                    progress.report({ content: defaultAgent.metadata.helpTextVariablesPrefix, kind: 'markdownContent' });
                }
                else {
                    progress.report({ content: new MarkdownString(defaultAgent.metadata.helpTextVariablesPrefix), kind: 'markdownContent' });
                }
                const variables = [
                    ...chatVariablesService.getVariables(ChatAgentLocation.Panel),
                    { name: 'file', description: nls.localize('file', "Choose a file in the workspace") }
                ];
                const variableText = variables
                    .map(v => `* \`${chatVariableLeader}${v.name}\` - ${v.description}`)
                    .join('\n');
                progress.report({ content: new MarkdownString('\n' + variableText), kind: 'markdownContent' });
            }
            if (defaultAgent?.metadata.helpTextPostfix) {
                progress.report({ content: new MarkdownString('\n\n'), kind: 'markdownContent' });
                if (isMarkdownString(defaultAgent.metadata.helpTextPostfix)) {
                    progress.report({ content: defaultAgent.metadata.helpTextPostfix, kind: 'markdownContent' });
                }
                else {
                    progress.report({ content: new MarkdownString(defaultAgent.metadata.helpTextPostfix), kind: 'markdownContent' });
                }
            }
            await timeout(200);
        }));
    }
};
ChatSlashStaticSlashCommandsContribution = __decorate([
    __param(0, IChatSlashCommandService),
    __param(1, ICommandService),
    __param(2, IChatAgentService),
    __param(3, IChatVariablesService),
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], ChatSlashStaticSlashCommandsContribution);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(ChatResolverContribution.ID, ChatResolverContribution, 1);
workbenchContributionsRegistry.registerWorkbenchContribution(ChatSlashStaticSlashCommandsContribution, 4);
Registry.as(EditorExtensions.EditorFactory).registerEditorSerializer(ChatEditorInput.TypeID, ChatEditorInputSerializer);
registerWorkbenchContribution2(ChatExtensionPointHandler.ID, ChatExtensionPointHandler, 1);
registerWorkbenchContribution2(LanguageModelToolsExtensionPointHandler.ID, LanguageModelToolsExtensionPointHandler, 2);
registerWorkbenchContribution2(ChatCompatibilityNotifier.ID, ChatCompatibilityNotifier, 4);
registerWorkbenchContribution2(ChatGettingStartedContribution.ID, ChatGettingStartedContribution, 4);
registerWorkbenchContribution2(ChatCommandCenterRendering.ID, ChatCommandCenterRendering, 3);
registerChatActions();
registerChatCopyActions();
registerChatCodeBlockActions();
registerChatCodeCompareBlockActions();
registerChatFileTreeActions();
registerChatTitleActions();
registerChatExecuteActions();
registerQuickChatActions();
registerChatExportActions();
registerMoveActions();
registerNewChatActions();
registerChatContextActions();
registerChatDeveloperActions();
registerEditorFeature(ChatPasteProvidersFeature);
registerSingleton(IChatService, ChatService, 1);
registerSingleton(IChatWidgetService, ChatWidgetService, 1);
registerSingleton(IQuickChatService, QuickChatService, 1);
registerSingleton(IChatAccessibilityService, ChatAccessibilityService, 1);
registerSingleton(IChatWidgetHistoryService, ChatWidgetHistoryService, 1);
registerSingleton(ILanguageModelsService, LanguageModelsService, 1);
registerSingleton(ILanguageModelStatsService, LanguageModelStatsService, 1);
registerSingleton(IChatSlashCommandService, ChatSlashCommandService, 1);
registerSingleton(IChatAgentService, ChatAgentService, 1);
registerSingleton(IChatAgentNameService, ChatAgentNameService, 1);
registerSingleton(IChatVariablesService, ChatVariablesService, 1);
registerSingleton(ILanguageModelToolsService, LanguageModelToolsService, 1);
registerSingleton(IVoiceChatService, VoiceChatService, 1);
registerSingleton(IChatCodeBlockContextProviderService, ChatCodeBlockContextProviderService, 1);
registerSingleton(ICodeMapperService, CodeMapperService, 1);
registerSingleton(IChatEditingService, ChatEditingService, 1);
