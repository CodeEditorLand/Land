import { ICodeEditor } from '../../../../../../editor/browser/editorBrowser.js';
import { ICommandService } from '../../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IProductService } from '../../../../../../platform/product/common/productService.js';
import { ITelemetryService } from '../../../../../../platform/telemetry/common/telemetry.js';
import { IChatAgentService } from '../../../../chat/common/chatAgents.js';
import { EmptyTextEditorHintContribution, IEmptyTextEditorHintOptions } from '../../../../codeEditor/browser/emptyTextEditorHint/emptyTextEditorHint.js';
import { IInlineChatSessionService } from '../../../../inlineChat/browser/inlineChatSessionService.js';
import { IEditorGroupsService } from '../../../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
export declare class EmptyCellEditorHintContribution extends EmptyTextEditorHintContribution {
    private readonly _editorService;
    static readonly CONTRIB_ID = "notebook.editor.contrib.emptyCellEditorHint";
    constructor(editor: ICodeEditor, _editorService: IEditorService, editorGroupsService: IEditorGroupsService, commandService: ICommandService, configurationService: IConfigurationService, hoverService: IHoverService, keybindingService: IKeybindingService, inlineChatSessionService: IInlineChatSessionService, chatAgentService: IChatAgentService, telemetryService: ITelemetryService, productService: IProductService, contextMenuService: IContextMenuService);
    protected _getOptions(): IEmptyTextEditorHintOptions;
    protected _shouldRenderHint(): boolean;
}
