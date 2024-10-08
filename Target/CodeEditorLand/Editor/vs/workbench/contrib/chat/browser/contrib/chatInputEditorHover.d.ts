import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { IModelDecoration } from '../../../../../editor/common/model.js';
import { HoverAnchor, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverParts } from '../../../../../editor/contrib/hover/browser/hoverTypes.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatWidgetService } from '../chat.js';
import { IChatAgentData } from '../../common/chatAgents.js';
export declare class ChatAgentHoverParticipant implements IEditorHoverParticipant<ChatAgentHoverPart> {
    private readonly editor;
    private readonly instantiationService;
    private readonly chatWidgetService;
    private readonly commandService;
    readonly hoverOrdinal: number;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, chatWidgetService: IChatWidgetService, commandService: ICommandService);
    computeSync(anchor: HoverAnchor, _lineDecorations: IModelDecoration[]): ChatAgentHoverPart[];
    renderHoverParts(context: IEditorHoverRenderContext, hoverParts: ChatAgentHoverPart[]): IRenderedHoverParts<ChatAgentHoverPart>;
    getAccessibleContent(hoverPart: ChatAgentHoverPart): string;
}
export declare class ChatAgentHoverPart implements IHoverPart {
    readonly owner: IEditorHoverParticipant<ChatAgentHoverPart>;
    readonly range: Range;
    readonly agent: IChatAgentData;
    constructor(owner: IEditorHoverParticipant<ChatAgentHoverPart>, range: Range, agent: IChatAgentData);
    isValidForHoverAnchor(anchor: HoverAnchor): boolean;
}
