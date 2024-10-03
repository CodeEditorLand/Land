import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { IQuickAccessController } from './quickAccess.js';
import { IMatch } from '../../../base/common/filters.js';
import { IItemAccessor } from '../../../base/common/fuzzyScorer.js';
import { ResolvedKeybinding } from '../../../base/common/keybindings.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import Severity from '../../../base/common/severity.js';
import { URI } from '../../../base/common/uri.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
export interface IQuickPickItemHighlights {
    label?: IMatch[];
    description?: IMatch[];
    detail?: IMatch[];
}
export type QuickPickItem = IQuickPickSeparator | IQuickPickItem;
export interface IQuickPickItem {
    type?: 'item';
    id?: string;
    label: string;
    ariaLabel?: string;
    description?: string;
    detail?: string;
    tooltip?: string | IMarkdownString;
    keybinding?: ResolvedKeybinding;
    iconClasses?: readonly string[];
    iconPath?: {
        dark: URI;
        light?: URI;
    };
    iconClass?: string;
    italic?: boolean;
    strikethrough?: boolean;
    highlights?: IQuickPickItemHighlights;
    buttons?: readonly IQuickInputButton[];
    picked?: boolean;
    disabled?: boolean;
    alwaysShow?: boolean;
}
export interface IQuickPickSeparator {
    type: 'separator';
    id?: string;
    label?: string;
    description?: string;
    ariaLabel?: string;
    buttons?: readonly IQuickInputButton[];
    tooltip?: string | IMarkdownString;
}
export interface IKeyMods {
    readonly ctrlCmd: boolean;
    readonly alt: boolean;
}
export declare const NO_KEY_MODS: IKeyMods;
export interface IQuickNavigateConfiguration {
    keybindings: readonly ResolvedKeybinding[];
}
export interface IPickOptions<T extends IQuickPickItem> {
    title?: string;
    value?: string;
    placeHolder?: string;
    matchOnDescription?: boolean;
    matchOnDetail?: boolean;
    matchOnLabel?: boolean;
    ignoreFocusLost?: boolean;
    canPickMany?: boolean;
    quickNavigate?: IQuickNavigateConfiguration;
    hideInput?: boolean;
    contextKey?: string;
    activeItem?: Promise<T> | T;
    onKeyMods?: (keyMods: IKeyMods) => void;
    onDidFocus?: (entry: T) => void;
    onDidTriggerItemButton?: (context: IQuickPickItemButtonContext<T>) => void;
    onDidTriggerSeparatorButton?: (context: IQuickPickSeparatorButtonEvent) => void;
}
export interface IInputOptions {
    title?: string;
    value?: string;
    valueSelection?: readonly [number, number];
    prompt?: string;
    placeHolder?: string;
    password?: boolean;
    ignoreFocusLost?: boolean;
    validateInput?: (input: string) => Promise<string | null | undefined | {
        content: string;
        severity: Severity;
    }>;
}
export declare enum QuickInputHideReason {
    Blur = 1,
    Gesture = 2,
    Other = 3
}
export interface IQuickInputHideEvent {
    reason: QuickInputHideReason;
}
export declare const enum QuickInputType {
    QuickPick = "quickPick",
    InputBox = "inputBox",
    QuickWidget = "quickWidget"
}
export interface IQuickInput extends IDisposable {
    readonly type: QuickInputType;
    readonly onDidHide: Event<IQuickInputHideEvent>;
    readonly onWillHide: Event<IQuickInputHideEvent>;
    readonly onDispose: Event<void>;
    title: string | undefined;
    description: string | undefined;
    widget: any | undefined;
    step: number | undefined;
    totalSteps: number | undefined;
    buttons: ReadonlyArray<IQuickInputButton>;
    readonly onDidTriggerButton: Event<IQuickInputButton>;
    enabled: boolean;
    contextKey: string | undefined;
    busy: boolean;
    ignoreFocusOut: boolean;
    show(): void;
    hide(): void;
    didHide(reason?: QuickInputHideReason): void;
    willHide(reason?: QuickInputHideReason): void;
}
export interface IQuickWidget extends IQuickInput {
    readonly type: QuickInputType.QuickWidget;
    widget: any | undefined;
}
export interface IQuickPickWillAcceptEvent {
    veto(): void;
}
export interface IQuickPickDidAcceptEvent {
    inBackground: boolean;
}
export declare enum ItemActivation {
    NONE = 0,
    FIRST = 1,
    SECOND = 2,
    LAST = 3
}
export declare enum QuickPickFocus {
    First = 1,
    Second = 2,
    Last = 3,
    Next = 4,
    Previous = 5,
    NextPage = 6,
    PreviousPage = 7,
    NextSeparator = 8,
    PreviousSeparator = 9
}
export interface IQuickPick<T extends IQuickPickItem, O extends {
    useSeparators: boolean;
} = {
    useSeparators: false;
}> extends IQuickInput {
    readonly type: QuickInputType.QuickPick;
    value: string;
    filterValue: (value: string) => string;
    ariaLabel: string | undefined;
    placeholder: string | undefined;
    readonly onDidChangeValue: Event<string>;
    readonly onWillAccept: Event<IQuickPickWillAcceptEvent>;
    readonly onDidAccept: Event<IQuickPickDidAcceptEvent>;
    canAcceptInBackground: boolean;
    ok: boolean | 'default';
    readonly onDidCustom: Event<void>;
    customButton: boolean;
    customLabel: string | undefined;
    customHover: string | undefined;
    readonly onDidTriggerItemButton: Event<IQuickPickItemButtonEvent<T>>;
    readonly onDidTriggerSeparatorButton: Event<IQuickPickSeparatorButtonEvent>;
    items: O extends {
        useSeparators: true;
    } ? ReadonlyArray<T | IQuickPickSeparator> : ReadonlyArray<T>;
    canSelectMany: boolean;
    matchOnDescription: boolean;
    matchOnDetail: boolean;
    matchOnLabel: boolean;
    matchOnLabelMode: 'fuzzy' | 'contiguous';
    sortByLabel: boolean;
    keepScrollPosition: boolean;
    quickNavigate: IQuickNavigateConfiguration | undefined;
    activeItems: ReadonlyArray<T>;
    readonly onDidChangeActive: Event<T[]>;
    itemActivation: ItemActivation;
    selectedItems: ReadonlyArray<T>;
    readonly onDidChangeSelection: Event<T[]>;
    readonly keyMods: IKeyMods;
    valueSelection: Readonly<[number, number]> | undefined;
    validationMessage: string | undefined;
    severity: Severity;
    inputHasFocus(): boolean;
    focusOnInput(): void;
    hideInput: boolean;
    hideCountBadge: boolean;
    hideCheckAll: boolean;
    toggles: IQuickInputToggle[] | undefined;
    focus(focus: QuickPickFocus): void;
    accept(inBackground?: boolean): void;
}
export interface IQuickInputToggle {
    onChange: Event<boolean>;
}
export interface IInputBox extends IQuickInput {
    readonly type: QuickInputType.InputBox;
    value: string;
    valueSelection: Readonly<[number, number]> | undefined;
    placeholder: string | undefined;
    password: boolean;
    readonly onDidChangeValue: Event<string>;
    readonly onDidAccept: Event<void>;
    prompt: string | undefined;
    validationMessage: string | undefined;
    severity: Severity;
}
export declare enum QuickInputButtonLocation {
    Title = 1,
    Inline = 2
}
export interface IQuickInputButton {
    iconPath?: {
        dark: URI;
        light?: URI;
    };
    iconClass?: string;
    tooltip?: string;
    alwaysVisible?: boolean;
    location?: QuickInputButtonLocation;
}
export interface IQuickPickItemButtonEvent<T extends IQuickPickItem> {
    button: IQuickInputButton;
    item: T;
}
export interface IQuickPickSeparatorButtonEvent {
    button: IQuickInputButton;
    separator: IQuickPickSeparator;
}
export interface IQuickPickItemButtonContext<T extends IQuickPickItem> extends IQuickPickItemButtonEvent<T> {
    removeItem(): void;
}
export type QuickPickInput<T = IQuickPickItem> = T | IQuickPickSeparator;
export type IQuickPickItemWithResource = IQuickPickItem & {
    resource?: URI;
};
export declare class QuickPickItemScorerAccessor implements IItemAccessor<IQuickPickItemWithResource> {
    private options?;
    constructor(options?: {
        skipDescription?: boolean;
        skipPath?: boolean;
    } | undefined);
    getItemLabel(entry: IQuickPickItemWithResource): string;
    getItemDescription(entry: IQuickPickItemWithResource): string | undefined;
    getItemPath(entry: IQuickPickItemWithResource): string | undefined;
}
export declare const quickPickItemScorerAccessor: QuickPickItemScorerAccessor;
export declare const IQuickInputService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IQuickInputService>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export interface IQuickInputService {
    readonly _serviceBrand: undefined;
    readonly backButton: IQuickInputButton;
    readonly quickAccess: IQuickAccessController;
    readonly onShow: Event<void>;
    readonly onHide: Event<void>;
    pick<T extends IQuickPickItem>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: IPickOptions<T> & {
        canPickMany: true;
    }, token?: CancellationToken): Promise<T[] | undefined>;
    pick<T extends IQuickPickItem>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: IPickOptions<T> & {
        canPickMany: false;
    }, token?: CancellationToken): Promise<T | undefined>;
    pick<T extends IQuickPickItem>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: Omit<IPickOptions<T>, 'canPickMany'>, token?: CancellationToken): Promise<T | undefined>;
    input(options?: IInputOptions, token?: CancellationToken): Promise<string | undefined>;
    createQuickPick<T extends IQuickPickItem>(options: {
        useSeparators: true;
    }): IQuickPick<T, {
        useSeparators: true;
    }>;
    createQuickPick<T extends IQuickPickItem>(options?: {
        useSeparators: boolean;
    }): IQuickPick<T, {
        useSeparators: false;
    }>;
    createInputBox(): IInputBox;
    createQuickWidget(): IQuickWidget;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration): void;
    back(): Promise<void>;
    accept(keyMods?: IKeyMods): Promise<void>;
    cancel(): Promise<void>;
    currentQuickInput: IQuickInput | undefined;
}
