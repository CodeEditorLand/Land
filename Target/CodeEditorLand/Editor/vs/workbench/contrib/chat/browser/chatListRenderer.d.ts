import { DropdownMenuActionViewItem, IDropdownMenuActionViewItemOptions } from '../../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { IListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { ITreeNode, ITreeRenderer } from '../../../../base/browser/ui/tree/tree.js';
import { IAction } from '../../../../base/common/actions.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { Disposable, DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IWorkbenchIssueService } from '../../issue/common/issue.js';
import { IChatFollowup } from '../common/chatService.js';
import { IChatResponseViewModel } from '../common/chatViewModel.js';
import { CodeBlockModelCollection } from '../common/codeBlockModelCollection.js';
import { ChatTreeItem, IChatCodeBlockInfo, IChatFileTreeInfo, IChatListItemRendererOptions } from './chat.js';
import { ChatAgentHover } from './chatAgentHover.js';
import { IChatContentPart } from './chatContentParts/chatContentParts.js';
import { ChatEditorOptions } from './chatOptions.js';
import { CodeBlockPart } from './codeBlockPart.js';
interface IChatListItemTemplate {
    currentElement?: ChatTreeItem;
    renderedParts?: IChatContentPart[];
    readonly rowContainer: HTMLElement;
    readonly titleToolbar?: MenuWorkbenchToolBar;
    readonly footerToolbar: MenuWorkbenchToolBar;
    readonly avatarContainer: HTMLElement;
    readonly username: HTMLElement;
    readonly detail: HTMLElement;
    readonly value: HTMLElement;
    readonly contextKeyService: IContextKeyService;
    readonly instantiationService: IInstantiationService;
    readonly templateDisposables: IDisposable;
    readonly elementDisposables: DisposableStore;
    readonly agentHover: ChatAgentHover;
}
interface IItemHeightChangeParams {
    element: ChatTreeItem;
    height: number;
}
export interface IChatRendererDelegate {
    getListLength(): number;
    readonly onDidScroll?: Event<void>;
}
export declare class ChatListItemRenderer extends Disposable implements ITreeRenderer<ChatTreeItem, FuzzyScore, IChatListItemTemplate> {
    private readonly rendererOptions;
    private readonly delegate;
    private readonly codeBlockModelCollection;
    private readonly instantiationService;
    private readonly logService;
    private readonly contextKeyService;
    private readonly themeService;
    private readonly commandService;
    private readonly hoverService;
    static readonly ID = "item";
    private readonly codeBlocksByResponseId;
    private readonly codeBlocksByEditorUri;
    private readonly fileTreesByResponseId;
    private readonly focusedFileTreesByResponseId;
    private readonly renderer;
    private readonly markdownDecorationsRenderer;
    protected readonly _onDidClickFollowup: Emitter<IChatFollowup>;
    readonly onDidClickFollowup: Event<IChatFollowup>;
    private readonly _onDidClickRerunWithAgentOrCommandDetection;
    readonly onDidClickRerunWithAgentOrCommandDetection: Event<IChatResponseViewModel>;
    protected readonly _onDidChangeItemHeight: Emitter<IItemHeightChangeParams>;
    readonly onDidChangeItemHeight: Event<IItemHeightChangeParams>;
    private readonly _editorPool;
    private readonly _diffEditorPool;
    private readonly _treePool;
    private readonly _contentReferencesListPool;
    private _currentLayoutWidth;
    private _isVisible;
    private _onDidChangeVisibility;
    constructor(editorOptions: ChatEditorOptions, rendererOptions: IChatListItemRendererOptions, delegate: IChatRendererDelegate, codeBlockModelCollection: CodeBlockModelCollection, overflowWidgetsDomNode: HTMLElement | undefined, instantiationService: IInstantiationService, configService: IConfigurationService, logService: ILogService, contextKeyService: IContextKeyService, themeService: IThemeService, commandService: ICommandService, hoverService: IHoverService);
    get templateId(): string;
    editorsInUse(): Iterable<CodeBlockPart>;
    private traceLayout;
    /**
     * Compute a rate to render at in words/s.
     */
    private getProgressiveRenderRate;
    getCodeBlockInfosForResponse(response: IChatResponseViewModel): IChatCodeBlockInfo[];
    getCodeBlockInfoForEditor(uri: URI): IChatCodeBlockInfo | undefined;
    getFileTreeInfosForResponse(response: IChatResponseViewModel): IChatFileTreeInfo[];
    getLastFocusedFileTreeForResponse(response: IChatResponseViewModel): IChatFileTreeInfo | undefined;
    setVisible(visible: boolean): void;
    layout(width: number): void;
    renderTemplate(container: HTMLElement): IChatListItemTemplate;
    renderElement(node: ITreeNode<ChatTreeItem, FuzzyScore>, index: number, templateData: IChatListItemTemplate): void;
    private clearRenderedParts;
    renderChatTreeItem(element: ChatTreeItem, index: number, templateData: IChatListItemTemplate): void;
    private renderDetail;
    private _renderDetail;
    private renderConfirmationAction;
    private renderAvatar;
    private getAgentIcon;
    private basicRenderElement;
    private updateItemHeight;
    /**
     *	@returns true if progressive rendering should be considered complete- the element's data is fully rendered or the view is not visible
     */
    private doNextProgressiveRender;
    private renderChatContentDiff;
    /**
     * Returns all content parts that should be rendered, and trimmed markdown content. We will diff this with the current rendered set.
     */
    private getNextProgressiveRenderContent;
    private getDataForProgressiveRender;
    private diff;
    private renderChatContentPart;
    private renderTreeData;
    private renderContentReferencesListData;
    private renderCodeCitationsListData;
    private renderToolInvocation;
    private renderProgressTask;
    private renderConfirmation;
    private renderAttachments;
    private renderTextEdit;
    private renderMarkdown;
    disposeElement(node: ITreeNode<ChatTreeItem, FuzzyScore>, index: number, templateData: IChatListItemTemplate): void;
    disposeTemplate(templateData: IChatListItemTemplate): void;
}
export declare class ChatListDelegate implements IListVirtualDelegate<ChatTreeItem> {
    private readonly defaultElementHeight;
    private readonly logService;
    constructor(defaultElementHeight: number, logService: ILogService);
    private _traceLayout;
    getHeight(element: ChatTreeItem): number;
    getTemplateId(element: ChatTreeItem): string;
    hasDynamicHeight(element: ChatTreeItem): boolean;
}
export declare class ChatVoteDownButton extends DropdownMenuActionViewItem {
    private readonly commandService;
    private readonly issueService;
    private readonly logService;
    constructor(action: IAction, options: IDropdownMenuActionViewItemOptions | undefined, commandService: ICommandService, issueService: IWorkbenchIssueService, logService: ILogService, contextMenuService: IContextMenuService);
    getActions(): readonly IAction[];
    render(container: HTMLElement): void;
    private getVoteDownDetailAction;
}
export {};
