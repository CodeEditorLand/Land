import { ThemeIcon } from '../../../../base/common/themables.js';
import { IOffsetRange, OffsetRange } from '../../../../editor/common/core/offsetRange.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { ChatAgentLocation, IChatAgentCommand, IChatAgentData, IChatAgentService } from './chatAgents.js';
import { IChatSlashData } from './chatSlashCommands.js';
import { IChatRequestVariableValue } from './chatVariables.js';
import { IToolData } from './languageModelToolsService.js';
export interface IParsedChatRequest {
    readonly parts: ReadonlyArray<IParsedChatRequestPart>;
    readonly text: string;
}
export interface IParsedChatRequestPart {
    readonly kind: string;
    readonly range: IOffsetRange;
    readonly editorRange: IRange;
    readonly text: string;
    /** How this part is represented in the prompt going to the agent */
    readonly promptText: string;
}
export declare function getPromptText(request: IParsedChatRequest): {
    message: string;
    diff: number;
};
export declare class ChatRequestTextPart implements IParsedChatRequestPart {
    readonly range: OffsetRange;
    readonly editorRange: IRange;
    readonly text: string;
    static readonly Kind = "text";
    readonly kind = "text";
    constructor(range: OffsetRange, editorRange: IRange, text: string);
    get promptText(): string;
}
export declare const chatVariableLeader = "#";
export declare const chatAgentLeader = "@";
export declare const chatSubcommandLeader = "/";
/**
 * An invocation of a static variable that can be resolved by the variable service
 */
export declare class ChatRequestVariablePart implements IParsedChatRequestPart {
    readonly range: OffsetRange;
    readonly editorRange: IRange;
    readonly variableName: string;
    readonly variableArg: string;
    readonly variableId: string;
    static readonly Kind = "var";
    readonly kind = "var";
    constructor(range: OffsetRange, editorRange: IRange, variableName: string, variableArg: string, variableId: string);
    get text(): string;
    get promptText(): string;
}
/**
 * An invocation of a tool
 */
export declare class ChatRequestToolPart implements IParsedChatRequestPart {
    readonly range: OffsetRange;
    readonly editorRange: IRange;
    readonly toolName: string;
    readonly toolId: string;
    readonly displayName?: string | undefined;
    readonly icon?: IToolData['icon'];
    static readonly Kind = "tool";
    readonly kind = "tool";
    constructor(range: OffsetRange, editorRange: IRange, toolName: string, toolId: string, displayName?: string | undefined, icon?: IToolData['icon']);
    get text(): string;
    get promptText(): string;
}
/**
 * An invocation of an agent that can be resolved by the agent service
 */
export declare class ChatRequestAgentPart implements IParsedChatRequestPart {
    readonly range: OffsetRange;
    readonly editorRange: IRange;
    readonly agent: IChatAgentData;
    static readonly Kind = "agent";
    readonly kind = "agent";
    constructor(range: OffsetRange, editorRange: IRange, agent: IChatAgentData);
    get text(): string;
    get promptText(): string;
}
/**
 * An invocation of an agent's subcommand
 */
export declare class ChatRequestAgentSubcommandPart implements IParsedChatRequestPart {
    readonly range: OffsetRange;
    readonly editorRange: IRange;
    readonly command: IChatAgentCommand;
    static readonly Kind = "subcommand";
    readonly kind = "subcommand";
    constructor(range: OffsetRange, editorRange: IRange, command: IChatAgentCommand);
    get text(): string;
    get promptText(): string;
}
/**
 * An invocation of a standalone slash command
 */
export declare class ChatRequestSlashCommandPart implements IParsedChatRequestPart {
    readonly range: OffsetRange;
    readonly editorRange: IRange;
    readonly slashCommand: IChatSlashData;
    static readonly Kind = "slash";
    readonly kind = "slash";
    constructor(range: OffsetRange, editorRange: IRange, slashCommand: IChatSlashData);
    get text(): string;
    get promptText(): string;
}
/**
 * An invocation of a dynamic reference like '#file:'
 */
export declare class ChatRequestDynamicVariablePart implements IParsedChatRequestPart {
    readonly range: OffsetRange;
    readonly editorRange: IRange;
    readonly text: string;
    readonly id: string;
    readonly modelDescription: string | undefined;
    readonly data: IChatRequestVariableValue;
    readonly fullName?: string | undefined;
    readonly icon?: ThemeIcon | undefined;
    static readonly Kind = "dynamic";
    readonly kind = "dynamic";
    constructor(range: OffsetRange, editorRange: IRange, text: string, id: string, modelDescription: string | undefined, data: IChatRequestVariableValue, fullName?: string | undefined, icon?: ThemeIcon | undefined);
    get referenceText(): string;
    get promptText(): string;
}
export declare function reviveParsedChatRequest(serialized: IParsedChatRequest): IParsedChatRequest;
export declare function extractAgentAndCommand(parsed: IParsedChatRequest): {
    agentPart: ChatRequestAgentPart | undefined;
    commandPart: ChatRequestAgentSubcommandPart | undefined;
};
export declare function formatChatQuestion(chatAgentService: IChatAgentService, location: ChatAgentLocation, prompt: string, participant?: string | null, command?: string | null): string | undefined;
