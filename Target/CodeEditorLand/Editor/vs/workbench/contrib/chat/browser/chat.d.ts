import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IChatViewState, IChatWidgetContrib } from './chatWidget.js';
import { ICodeBlockActionContext } from './codeBlockPart.js';
import { ChatAgentLocation, IChatAgentCommand, IChatAgentData } from '../common/chatAgents.js';
import { IChatRequestVariableEntry, IChatResponseModel } from '../common/chatModel.js';
import { IParsedChatRequest } from '../common/chatParserTypes.js';
import { IChatRequestViewModel, IChatResponseViewModel, IChatViewModel } from '../common/chatViewModel.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { ChatInputPart } from './chatInputPart.js';
export declare const IChatWidgetService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatWidgetService>;
export interface IChatWidgetService {
    readonly _serviceBrand: undefined;
    readonly lastFocusedWidget: IChatWidget | undefined;
    getWidgetByInputUri(uri: URI): IChatWidget | undefined;
    getWidgetBySessionId(sessionId: string): IChatWidget | undefined;
    getWidgetByLocation(location: ChatAgentLocation): IChatWidget[];
}
export declare function showChatView(viewsService: IViewsService): Promise<IChatWidget | undefined>;
export declare function showEditsView(viewsService: IViewsService): Promise<IChatWidget | undefined>;
export declare const IQuickChatService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IQuickChatService>;
export interface IQuickChatService {
    readonly _serviceBrand: undefined;
    readonly onDidClose: Event<void>;
    readonly enabled: boolean;
    readonly focused: boolean;
    toggle(options?: IQuickChatOpenOptions): void;
    focus(): void;
    open(options?: IQuickChatOpenOptions): void;
    close(): void;
    openInChatView(): void;
}
export interface IQuickChatOpenOptions {
    query: string;
    isPartialQuery?: boolean;
    selection?: Selection;
}
export declare const IChatAccessibilityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatAccessibilityService>;
export interface IChatAccessibilityService {
    readonly _serviceBrand: undefined;
    acceptRequest(): number;
    acceptResponse(response: IChatResponseViewModel | string | undefined, requestId: number, isVoiceInput?: boolean): void;
}
export interface IChatCodeBlockInfo {
    readonly ownerMarkdownPartId: string;
    readonly codeBlockIndex: number;
    readonly element: ChatTreeItem;
    readonly uri: URI | undefined;
    codemapperUri: URI | undefined;
    focus(): void;
    getContent(): string;
}
export interface IChatFileTreeInfo {
    treeDataId: string;
    treeIndex: number;
    focus(): void;
}
export type ChatTreeItem = IChatRequestViewModel | IChatResponseViewModel;
export interface IChatListItemRendererOptions {
    readonly renderStyle?: 'compact' | 'minimal';
    readonly noHeader?: boolean;
    readonly noPadding?: boolean;
    readonly editableCodeBlock?: boolean;
    readonly renderTextEditsAsSummary?: (uri: URI) => boolean;
}
export interface IChatWidgetViewOptions {
    renderInputOnTop?: boolean;
    renderFollowups?: boolean;
    renderStyle?: 'compact' | 'minimal';
    supportsFileReferences?: boolean;
    supportsAdditionalParticipants?: boolean;
    filter?: (item: ChatTreeItem) => boolean;
    rendererOptions?: IChatListItemRendererOptions;
    menus?: {
        executeToolbar?: MenuId;
        inputSideToolbar?: MenuId;
        telemetrySource?: string;
    };
    defaultElementHeight?: number;
    editorOverflowWidgetsDomNode?: HTMLElement;
}
export interface IChatViewViewContext {
    viewId: string;
}
export interface IChatResourceViewContext {
    isQuickChat?: boolean;
}
export type IChatWidgetViewContext = IChatViewViewContext | IChatResourceViewContext | {};
export interface IChatWidget {
    readonly onDidChangeViewModel: Event<void>;
    readonly onDidAcceptInput: Event<void>;
    readonly onDidHide: Event<void>;
    readonly onDidSubmitAgent: Event<{
        agent: IChatAgentData;
        slashCommand?: IChatAgentCommand;
    }>;
    readonly onDidChangeAgent: Event<{
        agent: IChatAgentData;
        slashCommand?: IChatAgentCommand;
    }>;
    readonly onDidChangeParsedInput: Event<void>;
    readonly onDidChangeContext: Event<{
        removed?: IChatRequestVariableEntry[];
        added?: IChatRequestVariableEntry[];
    }>;
    readonly location: ChatAgentLocation;
    readonly viewContext: IChatWidgetViewContext;
    readonly viewModel: IChatViewModel | undefined;
    readonly inputEditor: ICodeEditor;
    readonly supportsFileReferences: boolean;
    readonly parsedInput: IParsedChatRequest;
    lastSelectedAgent: IChatAgentData | undefined;
    readonly scopedContextKeyService: IContextKeyService;
    readonly input: ChatInputPart;
    getContrib<T extends IChatWidgetContrib>(id: string): T | undefined;
    reveal(item: ChatTreeItem): void;
    focus(item: ChatTreeItem): void;
    getSibling(item: ChatTreeItem, type: 'next' | 'previous'): ChatTreeItem | undefined;
    getFocus(): ChatTreeItem | undefined;
    setInput(query?: string): void;
    getInput(): string;
    logInputHistory(): void;
    acceptInput(query?: string, isVoiceInput?: boolean): Promise<IChatResponseModel | undefined>;
    acceptInputWithPrefix(prefix: string): void;
    setInputPlaceholder(placeholder: string): void;
    resetInputPlaceholder(): void;
    focusLastMessage(): void;
    focusInput(): void;
    hasInputFocus(): boolean;
    getCodeBlockInfoForEditor(uri: URI): IChatCodeBlockInfo | undefined;
    getCodeBlockInfosForResponse(response: IChatResponseViewModel): IChatCodeBlockInfo[];
    getFileTreeInfosForResponse(response: IChatResponseViewModel): IChatFileTreeInfo[];
    getLastFocusedFileTreeForResponse(response: IChatResponseViewModel): IChatFileTreeInfo | undefined;
    setContext(overwrite: boolean, ...context: IChatRequestVariableEntry[]): void;
    clear(): void;
    getViewState(): IChatViewState;
}
export interface ICodeBlockActionContextProvider {
    getCodeBlockContext(editor?: ICodeEditor): ICodeBlockActionContext | undefined;
}
export declare const IChatCodeBlockContextProviderService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatCodeBlockContextProviderService>;
export interface IChatCodeBlockContextProviderService {
    readonly _serviceBrand: undefined;
    readonly providers: ICodeBlockActionContextProvider[];
    registerProvider(provider: ICodeBlockActionContextProvider, id: string): IDisposable;
}
export declare const GeneratingPhrase: string;
export declare const CHAT_VIEW_ID = "workbench.panel.chat.view.copilot";
export declare const EDITS_VIEW_ID = "workbench.panel.chat.view.edits";
