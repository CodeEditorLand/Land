import { ChatAgentLocation, IChatAgentData, IChatAgentService } from './chatAgents.js';
import { IParsedChatRequest } from './chatParserTypes.js';
import { IChatSlashCommandService } from './chatSlashCommands.js';
import { IChatVariablesService } from './chatVariables.js';
import { ILanguageModelToolsService } from './languageModelToolsService.js';
export interface IChatParserContext {
    selectedAgent?: IChatAgentData;
}
export declare class ChatRequestParser {
    private readonly agentService;
    private readonly variableService;
    private readonly slashCommandService;
    private readonly toolsService;
    constructor(agentService: IChatAgentService, variableService: IChatVariablesService, slashCommandService: IChatSlashCommandService, toolsService: ILanguageModelToolsService);
    parseChatRequest(sessionId: string, message: string, location?: ChatAgentLocation, context?: IChatParserContext): IParsedChatRequest;
    private tryToParseAgent;
    private tryToParseVariable;
    private tryToParseSlashCommand;
    private tryToParseDynamicVariable;
}
