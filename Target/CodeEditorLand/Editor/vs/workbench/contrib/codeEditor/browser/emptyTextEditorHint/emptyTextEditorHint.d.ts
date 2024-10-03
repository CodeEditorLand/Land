import './emptyTextEditorHint.css';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IEditorContribution } from '../../../../../editor/common/editorCommon.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { IInlineChatSessionService } from '../../../inlineChat/browser/inlineChatSessionService.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IProductService } from '../../../../../platform/product/common/productService.js';
import { IHoverService } from '../../../../../platform/hover/browser/hover.js';
import { IChatAgentService } from '../../../chat/common/chatAgents.js';
import { IContextMenuService } from '../../../../../platform/contextview/browser/contextView.js';
export interface IEmptyTextEditorHintOptions {
    readonly clickable?: boolean;
}
export declare const emptyTextEditorHintSetting = "workbench.editor.empty.hint";
export declare class EmptyTextEditorHintContribution implements IEditorContribution {
    protected readonly editor: ICodeEditor;
    private readonly editorGroupsService;
    private readonly commandService;
    protected readonly configurationService: IConfigurationService;
    protected readonly hoverService: IHoverService;
    private readonly keybindingService;
    private readonly inlineChatSessionService;
    private readonly chatAgentService;
    private readonly telemetryService;
    protected readonly productService: IProductService;
    private readonly contextMenuService;
    static readonly ID = "editor.contrib.emptyTextEditorHint";
    protected toDispose: IDisposable[];
    private textHintContentWidget;
    constructor(editor: ICodeEditor, editorGroupsService: IEditorGroupsService, commandService: ICommandService, configurationService: IConfigurationService, hoverService: IHoverService, keybindingService: IKeybindingService, inlineChatSessionService: IInlineChatSessionService, chatAgentService: IChatAgentService, telemetryService: ITelemetryService, productService: IProductService, contextMenuService: IContextMenuService);
    protected _getOptions(): IEmptyTextEditorHintOptions;
    protected _shouldRenderHint(): boolean;
    protected update(): void;
    dispose(): void;
}
