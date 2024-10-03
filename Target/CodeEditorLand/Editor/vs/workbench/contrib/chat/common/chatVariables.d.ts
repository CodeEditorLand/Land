import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { Location } from '../../../../editor/common/languages.js';
import { ChatAgentLocation } from './chatAgents.js';
import { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from './chatModel.js';
import { IParsedChatRequest } from './chatParserTypes.js';
import { IChatContentReference, IChatProgressMessage } from './chatService.js';
export interface IChatVariableData {
    id: string;
    name: string;
    icon?: ThemeIcon;
    fullName?: string;
    description: string;
    modelDescription?: string;
    isSlow?: boolean;
    canTakeArgument?: boolean;
}
export type IChatRequestVariableValue = string | URI | Location | unknown | Uint8Array;
export type IChatVariableResolverProgress = IChatContentReference | IChatProgressMessage;
export interface IChatVariableResolver {
    (messageText: string, arg: string | undefined, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
}
export declare const IChatVariablesService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatVariablesService>;
export interface IChatVariablesService {
    _serviceBrand: undefined;
    registerVariable(data: IChatVariableData, resolver: IChatVariableResolver): IDisposable;
    hasVariable(name: string): boolean;
    getVariable(name: string): IChatVariableData | undefined;
    getVariables(location: ChatAgentLocation): Iterable<Readonly<IChatVariableData>>;
    getDynamicVariables(sessionId: string): ReadonlyArray<IDynamicVariable>;
    attachContext(name: string, value: string | URI | Location | unknown, location: ChatAgentLocation): void;
    resolveVariables(prompt: IParsedChatRequest, attachedContextVariables: IChatRequestVariableEntry[] | undefined, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableData>;
    resolveVariable(variableName: string, promptText: string, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
}
export interface IDynamicVariable {
    range: IRange;
    id: string;
    fullName?: string;
    icon?: ThemeIcon;
    prefix?: string;
    modelDescription?: string;
    data: IChatRequestVariableValue;
}
