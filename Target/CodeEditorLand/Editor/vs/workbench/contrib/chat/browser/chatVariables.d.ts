import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { Location } from '../../../../editor/common/languages.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { ChatAgentLocation } from '../common/chatAgents.js';
import { IChatModel, IChatRequestVariableData, IChatRequestVariableEntry } from '../common/chatModel.js';
import { IParsedChatRequest } from '../common/chatParserTypes.js';
import { IChatRequestVariableValue, IChatVariableData, IChatVariableResolver, IChatVariableResolverProgress, IChatVariablesService, IDynamicVariable } from '../common/chatVariables.js';
import { IChatWidgetService } from './chat.js';
export declare class ChatVariablesService implements IChatVariablesService {
    private readonly chatWidgetService;
    private readonly viewsService;
    _serviceBrand: undefined;
    private _resolver;
    constructor(chatWidgetService: IChatWidgetService, viewsService: IViewsService);
    resolveVariables(prompt: IParsedChatRequest, attachedContextVariables: IChatRequestVariableEntry[] | undefined, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableData>;
    resolveVariable(variableName: string, promptText: string, model: IChatModel, progress: (part: IChatVariableResolverProgress) => void, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
    hasVariable(name: string): boolean;
    getVariable(name: string): IChatVariableData | undefined;
    getVariables(location: ChatAgentLocation): Iterable<Readonly<IChatVariableData>>;
    getDynamicVariables(sessionId: string): ReadonlyArray<IDynamicVariable>;
    registerVariable(data: IChatVariableData, resolver: IChatVariableResolver): IDisposable;
    attachContext(name: string, value: string | URI | Location, location: ChatAgentLocation): Promise<void>;
}
