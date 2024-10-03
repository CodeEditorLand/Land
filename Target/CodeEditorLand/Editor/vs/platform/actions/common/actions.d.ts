import { IAction, SubmenuAction } from '../../../base/common/actions.js';
import { Event } from '../../../base/common/event.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { ICommandAction, ICommandActionTitle, Icon, ILocalizedString } from '../../action/common/action.js';
import { Categories } from '../../action/common/actionCommonCategories.js';
import { ICommandService } from '../../commands/common/commands.js';
import { ContextKeyExpression, IContextKeyService } from '../../contextkey/common/contextkey.js';
import { ServicesAccessor } from '../../instantiation/common/instantiation.js';
import { IKeybindingRule } from '../../keybinding/common/keybindingsRegistry.js';
export interface IMenuItem {
    command: ICommandAction;
    alt?: ICommandAction;
    when?: ContextKeyExpression;
    group?: 'navigation' | string;
    order?: number;
    isHiddenByDefault?: boolean;
}
export interface ISubmenuItem {
    title: string | ICommandActionTitle;
    submenu: MenuId;
    icon?: Icon;
    when?: ContextKeyExpression;
    group?: 'navigation' | string;
    order?: number;
    isSelection?: boolean;
    rememberDefaultAction?: boolean;
}
export declare function isIMenuItem(item: any): item is IMenuItem;
export declare function isISubmenuItem(item: any): item is ISubmenuItem;
export declare class MenuId {
    private static readonly _instances;
    static readonly CommandPalette: MenuId;
    static readonly DebugBreakpointsContext: MenuId;
    static readonly DebugCallStackContext: MenuId;
    static readonly DebugConsoleContext: MenuId;
    static readonly DebugVariablesContext: MenuId;
    static readonly NotebookVariablesContext: MenuId;
    static readonly DebugHoverContext: MenuId;
    static readonly DebugWatchContext: MenuId;
    static readonly DebugToolBar: MenuId;
    static readonly DebugToolBarStop: MenuId;
    static readonly DebugCallStackToolbar: MenuId;
    static readonly DebugCreateConfiguration: MenuId;
    static readonly EditorContext: MenuId;
    static readonly SimpleEditorContext: MenuId;
    static readonly EditorContent: MenuId;
    static readonly EditorLineNumberContext: MenuId;
    static readonly EditorContextCopy: MenuId;
    static readonly EditorContextPeek: MenuId;
    static readonly EditorContextShare: MenuId;
    static readonly EditorTitle: MenuId;
    static readonly EditorTitleRun: MenuId;
    static readonly EditorTitleContext: MenuId;
    static readonly EditorTitleContextShare: MenuId;
    static readonly EmptyEditorGroup: MenuId;
    static readonly EmptyEditorGroupContext: MenuId;
    static readonly EditorTabsBarContext: MenuId;
    static readonly EditorTabsBarShowTabsSubmenu: MenuId;
    static readonly EditorTabsBarShowTabsZenModeSubmenu: MenuId;
    static readonly EditorActionsPositionSubmenu: MenuId;
    static readonly ExplorerContext: MenuId;
    static readonly ExplorerContextShare: MenuId;
    static readonly ExtensionContext: MenuId;
    static readonly ExtensionEditorContextMenu: MenuId;
    static readonly GlobalActivity: MenuId;
    static readonly CommandCenter: MenuId;
    static readonly CommandCenterCenter: MenuId;
    static readonly LayoutControlMenuSubmenu: MenuId;
    static readonly LayoutControlMenu: MenuId;
    static readonly MenubarMainMenu: MenuId;
    static readonly MenubarAppearanceMenu: MenuId;
    static readonly MenubarDebugMenu: MenuId;
    static readonly MenubarEditMenu: MenuId;
    static readonly MenubarCopy: MenuId;
    static readonly MenubarFileMenu: MenuId;
    static readonly MenubarGoMenu: MenuId;
    static readonly MenubarHelpMenu: MenuId;
    static readonly MenubarLayoutMenu: MenuId;
    static readonly MenubarNewBreakpointMenu: MenuId;
    static readonly PanelAlignmentMenu: MenuId;
    static readonly PanelPositionMenu: MenuId;
    static readonly ActivityBarPositionMenu: MenuId;
    static readonly MenubarPreferencesMenu: MenuId;
    static readonly MenubarRecentMenu: MenuId;
    static readonly MenubarSelectionMenu: MenuId;
    static readonly MenubarShare: MenuId;
    static readonly MenubarSwitchEditorMenu: MenuId;
    static readonly MenubarSwitchGroupMenu: MenuId;
    static readonly MenubarTerminalMenu: MenuId;
    static readonly MenubarViewMenu: MenuId;
    static readonly MenubarHomeMenu: MenuId;
    static readonly OpenEditorsContext: MenuId;
    static readonly OpenEditorsContextShare: MenuId;
    static readonly ProblemsPanelContext: MenuId;
    static readonly SCMInputBox: MenuId;
    static readonly SCMChangesContext: MenuId;
    static readonly SCMChangeContext: MenuId;
    static readonly SCMResourceContext: MenuId;
    static readonly SCMResourceContextShare: MenuId;
    static readonly SCMResourceFolderContext: MenuId;
    static readonly SCMResourceGroupContext: MenuId;
    static readonly SCMSourceControl: MenuId;
    static readonly SCMSourceControlInline: MenuId;
    static readonly SCMSourceControlTitle: MenuId;
    static readonly SCMHistoryTitle: MenuId;
    static readonly SCMTitle: MenuId;
    static readonly SearchContext: MenuId;
    static readonly SearchActionMenu: MenuId;
    static readonly StatusBarWindowIndicatorMenu: MenuId;
    static readonly StatusBarRemoteIndicatorMenu: MenuId;
    static readonly StickyScrollContext: MenuId;
    static readonly TestItem: MenuId;
    static readonly TestItemGutter: MenuId;
    static readonly TestProfilesContext: MenuId;
    static readonly TestMessageContext: MenuId;
    static readonly TestMessageContent: MenuId;
    static readonly TestPeekElement: MenuId;
    static readonly TestPeekTitle: MenuId;
    static readonly TestCallStack: MenuId;
    static readonly TouchBarContext: MenuId;
    static readonly TitleBarContext: MenuId;
    static readonly TitleBarTitleContext: MenuId;
    static readonly TunnelContext: MenuId;
    static readonly TunnelPrivacy: MenuId;
    static readonly TunnelProtocol: MenuId;
    static readonly TunnelPortInline: MenuId;
    static readonly TunnelTitle: MenuId;
    static readonly TunnelLocalAddressInline: MenuId;
    static readonly TunnelOriginInline: MenuId;
    static readonly ViewItemContext: MenuId;
    static readonly ViewContainerTitle: MenuId;
    static readonly ViewContainerTitleContext: MenuId;
    static readonly ViewTitle: MenuId;
    static readonly ViewTitleContext: MenuId;
    static readonly CommentEditorActions: MenuId;
    static readonly CommentThreadTitle: MenuId;
    static readonly CommentThreadActions: MenuId;
    static readonly CommentThreadAdditionalActions: MenuId;
    static readonly CommentThreadTitleContext: MenuId;
    static readonly CommentThreadCommentContext: MenuId;
    static readonly CommentTitle: MenuId;
    static readonly CommentActions: MenuId;
    static readonly CommentsViewThreadActions: MenuId;
    static readonly InteractiveToolbar: MenuId;
    static readonly InteractiveCellTitle: MenuId;
    static readonly InteractiveCellDelete: MenuId;
    static readonly InteractiveCellExecute: MenuId;
    static readonly InteractiveInputExecute: MenuId;
    static readonly InteractiveInputConfig: MenuId;
    static readonly ReplInputExecute: MenuId;
    static readonly IssueReporter: MenuId;
    static readonly NotebookToolbar: MenuId;
    static readonly NotebookStickyScrollContext: MenuId;
    static readonly NotebookCellTitle: MenuId;
    static readonly NotebookCellDelete: MenuId;
    static readonly NotebookCellInsert: MenuId;
    static readonly NotebookCellBetween: MenuId;
    static readonly NotebookCellListTop: MenuId;
    static readonly NotebookCellExecute: MenuId;
    static readonly NotebookCellExecuteGoTo: MenuId;
    static readonly NotebookCellExecutePrimary: MenuId;
    static readonly NotebookDiffCellInputTitle: MenuId;
    static readonly NotebookDiffDocumentMetadata: MenuId;
    static readonly NotebookDiffCellMetadataTitle: MenuId;
    static readonly NotebookDiffCellOutputsTitle: MenuId;
    static readonly NotebookOutputToolbar: MenuId;
    static readonly NotebookOutlineFilter: MenuId;
    static readonly NotebookOutlineActionMenu: MenuId;
    static readonly NotebookEditorLayoutConfigure: MenuId;
    static readonly NotebookKernelSource: MenuId;
    static readonly BulkEditTitle: MenuId;
    static readonly BulkEditContext: MenuId;
    static readonly TimelineItemContext: MenuId;
    static readonly TimelineTitle: MenuId;
    static readonly TimelineTitleContext: MenuId;
    static readonly TimelineFilterSubMenu: MenuId;
    static readonly AccountsContext: MenuId;
    static readonly SidebarTitle: MenuId;
    static readonly PanelTitle: MenuId;
    static readonly AuxiliaryBarTitle: MenuId;
    static readonly AuxiliaryBarHeader: MenuId;
    static readonly TerminalInstanceContext: MenuId;
    static readonly TerminalEditorInstanceContext: MenuId;
    static readonly TerminalNewDropdownContext: MenuId;
    static readonly TerminalTabContext: MenuId;
    static readonly TerminalTabEmptyAreaContext: MenuId;
    static readonly TerminalStickyScrollContext: MenuId;
    static readonly WebviewContext: MenuId;
    static readonly InlineCompletionsActions: MenuId;
    static readonly InlineEditsActions: MenuId;
    static readonly InlineEditActions: MenuId;
    static readonly NewFile: MenuId;
    static readonly MergeInput1Toolbar: MenuId;
    static readonly MergeInput2Toolbar: MenuId;
    static readonly MergeBaseToolbar: MenuId;
    static readonly MergeInputResultToolbar: MenuId;
    static readonly InlineSuggestionToolbar: MenuId;
    static readonly InlineEditToolbar: MenuId;
    static readonly ChatContext: MenuId;
    static readonly ChatCodeBlock: MenuId;
    static readonly ChatCompareBlock: MenuId;
    static readonly ChatMessageTitle: MenuId;
    static readonly ChatMessageFooter: MenuId;
    static readonly ChatExecute: MenuId;
    static readonly ChatExecuteSecondary: MenuId;
    static readonly ChatInput: MenuId;
    static readonly ChatInputSide: MenuId;
    static readonly ChatEditingSessionWidgetToolbar: MenuId;
    static readonly ChatInlineResourceAnchorContext: MenuId;
    static readonly ChatInlineSymbolAnchorContext: MenuId;
    static readonly ChatCommandCenter: MenuId;
    static readonly ChatAttachmentsContext: MenuId;
    static readonly AccessibleView: MenuId;
    static readonly MultiDiffEditorFileToolbar: MenuId;
    static readonly DiffEditorHunkToolbar: MenuId;
    static readonly DiffEditorSelectionToolbar: MenuId;
    static for(identifier: string): MenuId;
    readonly id: string;
    constructor(identifier: string);
}
export interface IMenuActionOptions {
    arg?: any;
    shouldForwardArgs?: boolean;
    renderShortTitle?: boolean;
}
export interface IMenuChangeEvent {
    readonly menu: IMenu;
    readonly isStructuralChange: boolean;
    readonly isToggleChange: boolean;
    readonly isEnablementChange: boolean;
}
export interface IMenu extends IDisposable {
    readonly onDidChange: Event<IMenuChangeEvent>;
    getActions(options?: IMenuActionOptions): [string, Array<MenuItemAction | SubmenuItemAction>][];
}
export interface IMenuData {
    contexts: ReadonlySet<string>;
    actions: [string, Array<MenuItemAction | SubmenuItemAction>][];
}
export declare const IMenuService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMenuService>;
export interface IMenuCreateOptions {
    emitEventsForSubmenuChanges?: boolean;
    eventDebounceDelay?: number;
}
export interface IMenuService {
    readonly _serviceBrand: undefined;
    createMenu(id: MenuId, contextKeyService: IContextKeyService, options?: IMenuCreateOptions): IMenu;
    getMenuActions(id: MenuId, contextKeyService: IContextKeyService, options?: IMenuActionOptions): [string, Array<MenuItemAction | SubmenuItemAction>][];
    getMenuContexts(id: MenuId): ReadonlySet<string>;
    resetHiddenStates(): void;
    resetHiddenStates(menuIds: readonly MenuId[] | undefined): void;
}
type ICommandsMap = Map<string, ICommandAction>;
export interface IMenuRegistryChangeEvent {
    has(id: MenuId): boolean;
}
export interface IMenuRegistry {
    readonly onDidChangeMenu: Event<IMenuRegistryChangeEvent>;
    addCommand(userCommand: ICommandAction): IDisposable;
    getCommand(id: string): ICommandAction | undefined;
    getCommands(): ICommandsMap;
    appendMenuItems(items: Iterable<{
        id: MenuId;
        item: IMenuItem | ISubmenuItem;
    }>): IDisposable;
    appendMenuItem(menu: MenuId, item: IMenuItem | ISubmenuItem): IDisposable;
    getMenuItems(loc: MenuId): Array<IMenuItem | ISubmenuItem>;
}
export declare const MenuRegistry: IMenuRegistry;
export declare class SubmenuItemAction extends SubmenuAction {
    readonly item: ISubmenuItem;
    readonly hideActions: IMenuItemHide | undefined;
    constructor(item: ISubmenuItem, hideActions: IMenuItemHide | undefined, actions: readonly IAction[]);
}
export interface IMenuItemHide {
    readonly isHidden: boolean;
    readonly hide: IAction;
    readonly toggle: IAction;
}
export declare class MenuItemAction implements IAction {
    readonly hideActions: IMenuItemHide | undefined;
    readonly menuKeybinding: IAction | undefined;
    private _commandService;
    static label(action: ICommandAction, options?: IMenuActionOptions): string;
    readonly item: ICommandAction;
    readonly alt: MenuItemAction | undefined;
    private readonly _options;
    readonly id: string;
    readonly label: string;
    readonly tooltip: string;
    readonly class: string | undefined;
    readonly enabled: boolean;
    readonly checked?: boolean;
    constructor(item: ICommandAction, alt: ICommandAction | undefined, options: IMenuActionOptions | undefined, hideActions: IMenuItemHide | undefined, menuKeybinding: IAction | undefined, contextKeyService: IContextKeyService, _commandService: ICommandService);
    run(...args: any[]): Promise<void>;
}
type OneOrN<T> = T | T[];
interface IAction2CommonOptions extends ICommandAction {
    menu?: OneOrN<{
        id: MenuId;
        precondition?: null;
    } & Omit<IMenuItem, 'command'>>;
    keybinding?: OneOrN<Omit<IKeybindingRule, 'id'>>;
}
interface IBaseAction2Options extends IAction2CommonOptions {
    f1?: false;
}
interface ICommandPaletteOptions extends IAction2CommonOptions {
    title: ICommandActionTitle;
    category?: keyof typeof Categories | ILocalizedString;
    f1: true;
}
export type IAction2Options = ICommandPaletteOptions | IBaseAction2Options;
export interface IAction2F1RequiredOptions {
    title: ICommandActionTitle;
    category?: keyof typeof Categories | ILocalizedString;
}
export declare abstract class Action2 {
    readonly desc: Readonly<IAction2Options>;
    constructor(desc: Readonly<IAction2Options>);
    abstract run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare function registerAction2(ctor: {
    new (): Action2;
}): IDisposable;
export {};
