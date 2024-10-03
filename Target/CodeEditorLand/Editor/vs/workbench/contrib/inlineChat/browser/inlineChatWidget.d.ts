import { Dimension } from '../../../../base/browser/dom.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { IMarkdownString } from '../../../../base/common/htmlContent.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import './media/inlineChat.css';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { ICodeEditorViewState } from '../../../../editor/common/editorCommon.js';
import { IResolvedTextEditorModel, ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IAccessibleViewService } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IWorkbenchButtonBarOptions } from '../../../../platform/actions/browser/buttonbar.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IChatWidgetViewOptions } from '../../chat/browser/chat.js';
import { ChatWidget, IChatWidgetLocationOptions } from '../../chat/browser/chatWidget.js';
import { IChatModel } from '../../chat/common/chatModel.js';
import { IChatService } from '../../chat/common/chatService.js';
import { HunkInformation, Session } from './inlineChatSession.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
export interface InlineChatWidgetViewState {
    editorViewState: ICodeEditorViewState;
    input: string;
    placeholder: string;
}
export interface IInlineChatWidgetConstructionOptions {
    statusMenuId: MenuId | {
        menu: MenuId;
        options: IWorkbenchButtonBarOptions;
    };
    secondaryMenuId?: MenuId;
    chatWidgetViewOptions?: IChatWidgetViewOptions;
}
export interface IInlineChatMessage {
    message: IMarkdownString;
    requestId: string;
}
export interface IInlineChatMessageAppender {
    appendContent(fragment: string): void;
    cancel(): void;
    complete(): void;
}
export declare class InlineChatWidget {
    protected readonly _instantiationService: IInstantiationService;
    private readonly _contextKeyService;
    private readonly _keybindingService;
    private readonly _accessibilityService;
    private readonly _configurationService;
    private readonly _accessibleViewService;
    protected readonly _textModelResolverService: ITextModelService;
    private readonly _chatService;
    private readonly _hoverService;
    protected readonly _elements: {
        root: HTMLDivElement;
        chatWidget: HTMLDivElement;
        accessibleViewer: HTMLDivElement;
        infoLabel: HTMLDivElement;
        toolbar1: HTMLDivElement;
        statusLabel: HTMLDivElement;
        toolbar2: HTMLDivElement;
        status: HTMLDivElement;
    };
    protected readonly _store: DisposableStore;
    private readonly _defaultChatModel;
    private readonly _ctxInputEditorFocused;
    private readonly _ctxResponseFocused;
    private readonly _chatWidget;
    protected readonly _onDidChangeHeight: Emitter<void>;
    readonly onDidChangeHeight: Event<void>;
    private readonly _onDidChangeInput;
    readonly onDidChangeInput: Event<this>;
    private _isLayouting;
    readonly scopedContextKeyService: IContextKeyService;
    constructor(location: IChatWidgetLocationOptions, options: IInlineChatWidgetConstructionOptions, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _keybindingService: IKeybindingService, _accessibilityService: IAccessibilityService, _configurationService: IConfigurationService, _accessibleViewService: IAccessibleViewService, _textModelResolverService: ITextModelService, _chatService: IChatService, _hoverService: IHoverService);
    private _updateAriaLabel;
    dispose(): void;
    get domNode(): HTMLElement;
    get chatWidget(): ChatWidget;
    saveState(): void;
    layout(widgetDim: Dimension): void;
    protected _doLayout(dimension: Dimension): void;
    get contentHeight(): number;
    get minHeight(): number;
    protected _getExtraHeight(): number;
    get value(): string;
    set value(value: string);
    selectAll(includeSlashCommand?: boolean): void;
    set placeholder(value: string);
    toggleStatus(show: boolean): void;
    updateToolbar(show: boolean): void;
    getCodeBlockInfo(codeBlockIndex: number): Promise<IResolvedTextEditorModel | undefined>;
    get responseContent(): string | undefined;
    getChatModel(): IChatModel;
    setChatModel(chatModel: IChatModel): void;
    updateChatMessage(message: IInlineChatMessage, isIncomplete: true): IInlineChatMessageAppender;
    updateChatMessage(message: IInlineChatMessage | undefined): void;
    updateChatMessage(message: IInlineChatMessage | undefined, isIncomplete?: boolean, isCodeBlockEditable?: boolean): IInlineChatMessageAppender | undefined;
    updateInfo(message: string): void;
    updateStatus(message: string, ops?: {
        classes?: string[];
        resetAfter?: number;
        keepMessage?: boolean;
        title?: string;
    }): void;
    reset(): void;
    focus(): void;
    hasFocus(): boolean;
}
export declare class EditorBasedInlineChatWidget extends InlineChatWidget {
    private readonly _parentEditor;
    private readonly _accessibleViewer;
    constructor(location: IChatWidgetLocationOptions, _parentEditor: ICodeEditor, options: IInlineChatWidgetConstructionOptions, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, accessibilityService: IAccessibilityService, configurationService: IConfigurationService, accessibleViewService: IAccessibleViewService, textModelResolverService: ITextModelService, chatService: IChatService, hoverService: IHoverService, layoutService: ILayoutService);
    get contentHeight(): number;
    protected _doLayout(dimension: Dimension): void;
    reset(): void;
    showAccessibleHunk(session: Session, hunkData: HunkInformation): void;
}
