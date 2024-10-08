import { IKeyboardEvent } from '../../keybinding/common/keybinding.js';
import { IPickerQuickAccessItem } from '../../quickinput/browser/pickerQuickAccess.js';
import { Event } from '../../../base/common/event.js';
import { IAction } from '../../../base/common/actions.js';
import { IQuickPickItem } from '../../quickinput/common/quickInput.js';
import { IDisposable, Disposable } from '../../../base/common/lifecycle.js';
export declare const IAccessibleViewService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IAccessibleViewService>;
export declare const enum AccessibleViewProviderId {
    Terminal = "terminal",
    TerminalChat = "terminal-chat",
    TerminalHelp = "terminal-help",
    DiffEditor = "diffEditor",
    PanelChat = "panelChat",
    InlineChat = "inlineChat",
    QuickChat = "quickChat",
    InlineCompletions = "inlineCompletions",
    KeybindingsEditor = "keybindingsEditor",
    Notebook = "notebook",
    ReplEditor = "replEditor",
    Editor = "editor",
    Hover = "hover",
    Notification = "notification",
    EmptyEditorHint = "emptyEditorHint",
    Comments = "comments",
    CommentThread = "commentThread",
    Repl = "repl",
    ReplHelp = "replHelp",
    RunAndDebug = "runAndDebug",
    Walkthrough = "walkthrough"
}
export declare const enum AccessibleViewType {
    Help = "help",
    View = "view"
}
export declare const enum NavigationType {
    Previous = "previous",
    Next = "next"
}
export interface IAccessibleViewOptions {
    readMoreUrl?: string;
    /**
     * Defaults to markdown
     */
    language?: string;
    type: AccessibleViewType;
    /**
     * By default, places the cursor on the top line of the accessible view.
     * If set to 'initial-bottom', places the cursor on the bottom line of the accessible view and preserves it henceforth.
     * If set to 'bottom', places the cursor on the bottom line of the accessible view.
     */
    position?: 'bottom' | 'initial-bottom';
    /**
     * @returns a string that will be used as the content of the help dialog
     * instead of the one provided by default.
     */
    customHelp?: () => string;
    /**
     * If this provider might want to request to be shown again, provide an ID.
     */
    id?: AccessibleViewProviderId;
    /**
     * Keybinding items to configure
     */
    configureKeybindingItems?: IQuickPickItem[];
    /**
     * Keybinding items that are already configured
     */
    configuredKeybindingItems?: IQuickPickItem[];
}
export interface IAccessibleViewContentProvider extends IBasicContentProvider, IDisposable {
    id: AccessibleViewProviderId;
    verbositySettingKey: string;
    /**
     * Note that a Codicon class should be provided for each action.
     * If not, a default will be used.
     */
    onKeyDown?(e: IKeyboardEvent): void;
    /**
     * When the language is markdown, this is provided by default.
     */
    getSymbols?(): IAccessibleViewSymbol[];
    /**
     * Note that this will only take effect if the provider has an ID.
     */
    onDidRequestClearLastProvider?: Event<AccessibleViewProviderId>;
}
export interface IAccessibleViewSymbol extends IPickerQuickAccessItem {
    markdownToParse?: string;
    firstListItem?: string;
    lineNumber?: number;
    endLineNumber?: number;
}
export interface IPosition {
    lineNumber: number;
    column: number;
}
export interface IAccessibleViewService {
    readonly _serviceBrand: undefined;
    show(provider: AccesibleViewContentProvider, position?: IPosition): void;
    showLastProvider(id: AccessibleViewProviderId): void;
    showAccessibleViewHelp(): void;
    next(): void;
    previous(): void;
    navigateToCodeBlock(type: 'next' | 'previous'): void;
    goToSymbol(): void;
    disableHint(): void;
    getPosition(id: AccessibleViewProviderId): IPosition | undefined;
    setPosition(position: IPosition, reveal?: boolean, select?: boolean): void;
    getLastPosition(): IPosition | undefined;
    /**
     * If the setting is enabled, provides the open accessible view hint as a localized string.
     * @param verbositySettingKey The setting key for the verbosity of the feature
     */
    getOpenAriaHint(verbositySettingKey: string): string | null;
    getCodeBlockContext(): ICodeBlockActionContext | undefined;
    configureKeybindings(unassigned: boolean): void;
    openHelpLink(): void;
}
export interface ICodeBlockActionContext {
    code: string;
    languageId?: string;
    codeBlockIndex: number;
    element: unknown;
}
export type AccesibleViewContentProvider = AccessibleContentProvider | ExtensionContentProvider;
export declare class AccessibleContentProvider extends Disposable implements IAccessibleViewContentProvider {
    id: AccessibleViewProviderId;
    options: IAccessibleViewOptions;
    provideContent: () => string;
    onClose: () => void;
    verbositySettingKey: string;
    onOpen?: (() => void) | undefined;
    actions?: IAction[] | undefined;
    provideNextContent?: (() => string | undefined) | undefined;
    providePreviousContent?: (() => string | undefined) | undefined;
    onDidChangeContent?: Event<void> | undefined;
    onKeyDown?: ((e: IKeyboardEvent) => void) | undefined;
    getSymbols?: (() => IAccessibleViewSymbol[]) | undefined;
    onDidRequestClearLastProvider?: Event<AccessibleViewProviderId> | undefined;
    constructor(id: AccessibleViewProviderId, options: IAccessibleViewOptions, provideContent: () => string, onClose: () => void, verbositySettingKey: string, onOpen?: (() => void) | undefined, actions?: IAction[] | undefined, provideNextContent?: (() => string | undefined) | undefined, providePreviousContent?: (() => string | undefined) | undefined, onDidChangeContent?: Event<void> | undefined, onKeyDown?: ((e: IKeyboardEvent) => void) | undefined, getSymbols?: (() => IAccessibleViewSymbol[]) | undefined, onDidRequestClearLastProvider?: Event<AccessibleViewProviderId> | undefined);
}
export declare class ExtensionContentProvider extends Disposable implements IBasicContentProvider {
    readonly id: string;
    options: IAccessibleViewOptions;
    provideContent: () => string;
    onClose: () => void;
    onOpen?: (() => void) | undefined;
    provideNextContent?: (() => string | undefined) | undefined;
    providePreviousContent?: (() => string | undefined) | undefined;
    actions?: IAction[] | undefined;
    onDidChangeContent?: Event<void> | undefined;
    constructor(id: string, options: IAccessibleViewOptions, provideContent: () => string, onClose: () => void, onOpen?: (() => void) | undefined, provideNextContent?: (() => string | undefined) | undefined, providePreviousContent?: (() => string | undefined) | undefined, actions?: IAction[] | undefined, onDidChangeContent?: Event<void> | undefined);
}
export interface IBasicContentProvider extends IDisposable {
    id: string;
    options: IAccessibleViewOptions;
    onClose(): void;
    provideContent(): string;
    onOpen?(): void;
    actions?: IAction[];
    providePreviousContent?(): void;
    provideNextContent?(): void;
    onDidChangeContent?: Event<void>;
}
