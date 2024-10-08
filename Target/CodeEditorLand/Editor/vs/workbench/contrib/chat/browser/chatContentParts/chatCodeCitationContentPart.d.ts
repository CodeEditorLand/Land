import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { ChatTreeItem } from '../chat.js';
import { IChatContentPart, IChatContentPartRenderContext } from './chatContentParts.js';
import { IChatCodeCitations, IChatRendererContent } from '../../common/chatViewModel.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
export declare class ChatCodeCitationContentPart extends Disposable implements IChatContentPart {
    private readonly editorService;
    private readonly telemetryService;
    readonly domNode: HTMLElement;
    constructor(citations: IChatCodeCitations, context: IChatContentPartRenderContext, editorService: IEditorService, telemetryService: ITelemetryService);
    hasSameContent(other: IChatRendererContent, followingContent: IChatRendererContent[], element: ChatTreeItem): boolean;
}
