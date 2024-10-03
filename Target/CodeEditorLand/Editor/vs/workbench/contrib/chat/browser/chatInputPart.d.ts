import { IHistoryNavigationWidget } from '../../../../base/browser/history.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ChatAgentLocation } from '../common/chatAgents.js';
import { IChatEditingSession } from '../common/chatEditingService.js';
import { IChatRequestVariableEntry } from '../common/chatModel.js';
import { IChatFollowup } from '../common/chatService.js';
import { IChatResponseViewModel } from '../common/chatViewModel.js';
import { IChatWidgetHistoryService } from '../common/chatWidgetHistoryService.js';
import { ILanguageModelsService } from '../common/languageModels.js';
import { IChatWidget } from './chat.js';
import { IChatViewState } from './chatWidget.js';
interface IChatInputPartOptions {
    renderFollowups: boolean;
    renderStyle?: 'compact';
    menus: {
        executeToolbar: MenuId;
        inputSideToolbar?: MenuId;
        telemetrySource?: string;
    };
    editorOverflowWidgetsDomNode?: HTMLElement;
}
export declare class ChatInputPart extends Disposable implements IHistoryNavigationWidget {
    private readonly location;
    private readonly options;
    private readonly getInputState;
    private readonly historyService;
    private readonly modelService;
    private readonly instantiationService;
    private readonly contextKeyService;
    private readonly configurationService;
    private readonly keybindingService;
    private readonly accessibilityService;
    private readonly languageModelsService;
    private readonly logService;
    private readonly hoverService;
    private readonly fileService;
    private readonly commandService;
    private readonly editorService;
    static readonly INPUT_SCHEME = "chatSessionInput";
    private static _counter;
    private _onDidLoadInputState;
    readonly onDidLoadInputState: Event<any>;
    private _onDidChangeHeight;
    readonly onDidChangeHeight: Event<void>;
    private _onDidFocus;
    readonly onDidFocus: Event<void>;
    private _onDidBlur;
    readonly onDidBlur: Event<void>;
    private _onDidChangeContext;
    readonly onDidChangeContext: Event<{
        removed?: IChatRequestVariableEntry[];
        added?: IChatRequestVariableEntry[];
    }>;
    private _onDidAcceptFollowup;
    readonly onDidAcceptFollowup: Event<{
        followup: IChatFollowup;
        response: IChatResponseViewModel | undefined;
    }>;
    get attachedContext(): ReadonlySet<IChatRequestVariableEntry>;
    private _indexOfLastAttachedContextDeletedWithKeyboard;
    private readonly _attachedContext;
    private readonly _onDidChangeVisibility;
    private readonly _contextResourceLabels;
    private readonly inputEditorMaxHeight;
    private inputEditorHeight;
    private container;
    private inputSideToolbarContainer?;
    private followupsContainer;
    private readonly followupsDisposables;
    private attachedContextContainer;
    private readonly attachedContextDisposables;
    private chatEditingSessionWidgetContainer;
    private _inputPartHeight;
    get inputPartHeight(): number;
    private _followupsHeight;
    get followupsHeight(): number;
    private _inputEditor;
    private _inputEditorElement;
    private executeToolbar;
    private inputActionsToolbar;
    get inputEditor(): CodeEditorWidget;
    private history;
    private historyNavigationBackwardsEnablement;
    private historyNavigationForewardsEnablement;
    private inHistoryNavigation;
    private inputModel;
    private inputEditorHasText;
    private chatCursorAtTop;
    private inputEditorHasFocus;
    private readonly _waitForPersistedLanguageModel;
    private _onDidChangeCurrentLanguageModel;
    private _currentLanguageModel;
    get currentLanguageModel(): string | undefined;
    private cachedDimensions;
    private cachedExecuteToolbarWidth;
    private cachedInputToolbarWidth;
    readonly inputUri: URI;
    private readonly _chatEditsActionsDisposables;
    private readonly _chatEditsDisposables;
    private _chatEditsProgress;
    private _chatEditsListPool;
    private _chatEditList;
    get selectedElements(): URI[];
    constructor(location: ChatAgentLocation, options: IChatInputPartOptions, getInputState: () => any, historyService: IChatWidgetHistoryService, modelService: IModelService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, configurationService: IConfigurationService, keybindingService: IKeybindingService, accessibilityService: IAccessibilityService, languageModelsService: ILanguageModelsService, logService: ILogService, hoverService: IHoverService, fileService: IFileService, commandService: ICommandService, editorService: IEditorService);
    private setCurrentLanguageModelToDefault;
    private setCurrentLanguageModelByUser;
    private loadHistory;
    private _getAriaLabel;
    updateState(inputState: Object): void;
    initForNewChatModel(state: IChatViewState): void;
    logInputHistory(): void;
    setVisible(visible: boolean): void;
    get element(): HTMLElement;
    showPreviousValue(): void;
    showNextValue(): void;
    private navigateHistory;
    setValue(value: string, transient: boolean): void;
    private saveCurrentValue;
    focus(): void;
    hasFocus(): boolean;
    acceptInput(isUserQuery?: boolean): Promise<void>;
    private _acceptInputForVoiceover;
    attachContext(overwrite: boolean, ...contentReferences: IChatRequestVariableEntry[]): void;
    render(container: HTMLElement, initialValue: string, widget: IChatWidget): void;
    private initAttachedContext;
    private attachButtonAndDisposables;
    private createImageElements;
    renderChatEditingSessionState(chatEditingSession: IChatEditingSession | null, initialState?: boolean, chatWidget?: IChatWidget): Promise<void>;
    renderFollowups(items: IChatFollowup[] | undefined, response: IChatResponseViewModel | undefined): Promise<void>;
    get contentHeight(): number;
    layout(height: number, width: number): void;
    private previousInputEditorDimension;
    private _layout;
    private getLayoutData;
    saveState(): void;
}
export {};
