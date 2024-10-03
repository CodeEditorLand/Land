import { ActionBar } from '../../../base/browser/ui/actionbar/actionbar.js';
import { Button, IButtonStyles } from '../../../base/browser/ui/button/button.js';
import { CountBadge, ICountBadgeStyles } from '../../../base/browser/ui/countBadge/countBadge.js';
import { IHoverDelegate } from '../../../base/browser/ui/hover/hoverDelegate.js';
import { IInputBoxStyles } from '../../../base/browser/ui/inputbox/inputBox.js';
import { IKeybindingLabelStyles } from '../../../base/browser/ui/keybindingLabel/keybindingLabel.js';
import { IListStyles } from '../../../base/browser/ui/list/listWidget.js';
import { IProgressBarStyles, ProgressBar } from '../../../base/browser/ui/progressbar/progressbar.js';
import { IToggleStyles } from '../../../base/browser/ui/toggle/toggle.js';
import { Event } from '../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import Severity from '../../../base/common/severity.js';
import './media/quickInput.css';
import { IInputBox, IKeyMods, IQuickInput, IQuickInputButton, IQuickInputHideEvent, IQuickInputToggle, IQuickNavigateConfiguration, IQuickPick, IQuickPickDidAcceptEvent, IQuickPickItem, IQuickPickItemButtonEvent, IQuickPickSeparator, IQuickPickSeparatorButtonEvent, IQuickPickWillAcceptEvent, IQuickWidget, ItemActivation, QuickInputHideReason, QuickInputType, QuickPickFocus } from '../common/quickInput.js';
import { QuickInputBox } from './quickInputBox.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IHoverService, WorkbenchHoverDelegate } from '../../hover/browser/hover.js';
import { QuickInputTree } from './quickInputTree.js';
import { RawContextKey } from '../../contextkey/common/contextkey.js';
export declare const inQuickInputContextKeyValue = "inQuickInput";
export declare const InQuickInputContextKey: RawContextKey<boolean>;
export declare const inQuickInputContext: import("../../contextkey/common/contextkey.js").ContextKeyExpression;
export declare const quickInputTypeContextKeyValue = "quickInputType";
export declare const QuickInputTypeContextKey: RawContextKey<QuickInputType>;
export declare const endOfQuickInputBoxContextKeyValue = "cursorAtEndOfQuickInputBox";
export declare const EndOfQuickInputBoxContextKey: RawContextKey<boolean>;
export declare const endOfQuickInputBoxContext: import("../../contextkey/common/contextkey.js").ContextKeyExpression;
export interface IQuickInputOptions {
    idPrefix: string;
    container: HTMLElement;
    ignoreFocusOut(): boolean;
    backKeybindingLabel(): string | undefined;
    setContextKey(id?: string): void;
    linkOpenerDelegate(content: string): void;
    returnFocus(): void;
    hoverDelegate: IHoverDelegate;
    styles: IQuickInputStyles;
}
export interface IQuickInputStyles {
    readonly widget: IQuickInputWidgetStyles;
    readonly inputBox: IInputBoxStyles;
    readonly toggle: IToggleStyles;
    readonly countBadge: ICountBadgeStyles;
    readonly button: IButtonStyles;
    readonly progressBar: IProgressBarStyles;
    readonly keybindingLabel: IKeybindingLabelStyles;
    readonly list: IListStyles;
    readonly pickerGroup: {
        pickerGroupBorder: string | undefined;
        pickerGroupForeground: string | undefined;
    };
}
export interface IQuickInputWidgetStyles {
    readonly quickInputBackground: string | undefined;
    readonly quickInputForeground: string | undefined;
    readonly quickInputTitleBackground: string | undefined;
    readonly widgetBorder: string | undefined;
    readonly widgetShadow: string | undefined;
}
export type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare const backButton: {
    iconClass: string;
    tooltip: string;
    handle: number;
};
export interface QuickInputUI {
    container: HTMLElement;
    styleSheet: HTMLStyleElement;
    leftActionBar: ActionBar;
    titleBar: HTMLElement;
    title: HTMLElement;
    description1: HTMLElement;
    description2: HTMLElement;
    widget: HTMLElement;
    rightActionBar: ActionBar;
    inlineActionBar: ActionBar;
    checkAll: HTMLInputElement;
    inputContainer: HTMLElement;
    filterContainer: HTMLElement;
    inputBox: QuickInputBox;
    visibleCountContainer: HTMLElement;
    visibleCount: CountBadge;
    countContainer: HTMLElement;
    count: CountBadge;
    okContainer: HTMLElement;
    ok: Button;
    message: HTMLElement;
    customButtonContainer: HTMLElement;
    customButton: Button;
    progressBar: ProgressBar;
    list: QuickInputTree;
    onDidAccept: Event<void>;
    onDidCustom: Event<void>;
    onDidTriggerButton: Event<IQuickInputButton>;
    ignoreFocusOut: boolean;
    keyMods: Writeable<IKeyMods>;
    show(controller: QuickInput): void;
    setVisibilities(visibilities: Visibilities): void;
    setEnabled(enabled: boolean): void;
    setContextKey(contextKey?: string): void;
    linkOpenerDelegate(content: string): void;
    hide(): void;
}
export type Visibilities = {
    title?: boolean;
    description?: boolean;
    checkAll?: boolean;
    inputBox?: boolean;
    checkBox?: boolean;
    visibleCount?: boolean;
    count?: boolean;
    message?: boolean;
    list?: boolean;
    ok?: boolean;
    customButton?: boolean;
    progressBar?: boolean;
};
declare abstract class QuickInput extends Disposable implements IQuickInput {
    protected ui: QuickInputUI;
    protected static readonly noPromptMessage: string;
    private _title;
    private _description;
    private _widget;
    private _widgetUpdated;
    private _steps;
    private _totalSteps;
    protected visible: boolean;
    private _enabled;
    private _contextKey;
    private _busy;
    private _ignoreFocusOut;
    private _leftButtons;
    private _rightButtons;
    private _inlineButtons;
    private buttonsUpdated;
    private _toggles;
    private togglesUpdated;
    protected noValidationMessage: string;
    private _validationMessage;
    private _lastValidationMessage;
    private _severity;
    private _lastSeverity;
    private readonly onDidTriggerButtonEmitter;
    private readonly onDidHideEmitter;
    private readonly onWillHideEmitter;
    private readonly onDisposeEmitter;
    protected readonly visibleDisposables: DisposableStore;
    private busyDelay;
    abstract type: QuickInputType;
    constructor(ui: QuickInputUI);
    get title(): string | undefined;
    set title(title: string | undefined);
    get description(): string | undefined;
    set description(description: string | undefined);
    get widget(): unknown | undefined;
    set widget(widget: unknown | undefined);
    get step(): number | undefined;
    set step(step: number | undefined);
    get totalSteps(): number | undefined;
    set totalSteps(totalSteps: number | undefined);
    get enabled(): boolean;
    set enabled(enabled: boolean);
    get contextKey(): string | undefined;
    set contextKey(contextKey: string | undefined);
    get busy(): boolean;
    set busy(busy: boolean);
    get ignoreFocusOut(): boolean;
    set ignoreFocusOut(ignoreFocusOut: boolean);
    protected get titleButtons(): (IQuickInputButton | IQuickInputButton[])[];
    get buttons(): IQuickInputButton[];
    set buttons(buttons: IQuickInputButton[]);
    get toggles(): IQuickInputToggle[];
    set toggles(toggles: IQuickInputToggle[]);
    get validationMessage(): string | undefined;
    set validationMessage(validationMessage: string | undefined);
    get severity(): Severity;
    set severity(severity: Severity);
    readonly onDidTriggerButton: Event<IQuickInputButton>;
    show(): void;
    hide(): void;
    didHide(reason?: QuickInputHideReason): void;
    readonly onDidHide: Event<IQuickInputHideEvent>;
    willHide(reason?: QuickInputHideReason): void;
    readonly onWillHide: Event<IQuickInputHideEvent>;
    protected update(): void;
    private getTitle;
    private getDescription;
    private getSteps;
    protected showMessageDecoration(severity: Severity): void;
    readonly onDispose: Event<void>;
    dispose(): void;
}
export declare class QuickPick<T extends IQuickPickItem, O extends {
    useSeparators: boolean;
} = {
    useSeparators: false;
}> extends QuickInput implements IQuickPick<T, O> {
    private static readonly DEFAULT_ARIA_LABEL;
    private _value;
    private _ariaLabel;
    private _placeholder;
    private readonly onDidChangeValueEmitter;
    private readonly onWillAcceptEmitter;
    private readonly onDidAcceptEmitter;
    private readonly onDidCustomEmitter;
    private _items;
    private itemsUpdated;
    private _canSelectMany;
    private _canAcceptInBackground;
    private _matchOnDescription;
    private _matchOnDetail;
    private _matchOnLabel;
    private _matchOnLabelMode;
    private _sortByLabel;
    private _keepScrollPosition;
    private _itemActivation;
    private _activeItems;
    private activeItemsUpdated;
    private activeItemsToConfirm;
    private readonly onDidChangeActiveEmitter;
    private _selectedItems;
    private selectedItemsUpdated;
    private selectedItemsToConfirm;
    private readonly onDidChangeSelectionEmitter;
    private readonly onDidTriggerItemButtonEmitter;
    private readonly onDidTriggerSeparatorButtonEmitter;
    private _valueSelection;
    private valueSelectionUpdated;
    private _ok;
    private _customButton;
    private _customButtonLabel;
    private _customButtonHover;
    private _quickNavigate;
    private _hideInput;
    private _hideCountBadge;
    private _hideCheckAll;
    private _focusEventBufferer;
    readonly type = QuickInputType.QuickPick;
    get quickNavigate(): IQuickNavigateConfiguration | undefined;
    set quickNavigate(quickNavigate: IQuickNavigateConfiguration | undefined);
    get value(): string;
    set value(value: string);
    private doSetValue;
    filterValue: (value: string) => string;
    set ariaLabel(ariaLabel: string | undefined);
    get ariaLabel(): string | undefined;
    get placeholder(): string | undefined;
    set placeholder(placeholder: string | undefined);
    onDidChangeValue: Event<string>;
    onWillAccept: Event<IQuickPickWillAcceptEvent>;
    onDidAccept: Event<IQuickPickDidAcceptEvent>;
    onDidCustom: Event<void>;
    get items(): O extends {
        useSeparators: true;
    } ? Array<T | IQuickPickSeparator> : Array<T>;
    get scrollTop(): number;
    private set scrollTop(value);
    set items(items: O extends {
        useSeparators: true;
    } ? Array<T | IQuickPickSeparator> : Array<T>);
    get canSelectMany(): boolean;
    set canSelectMany(canSelectMany: boolean);
    get canAcceptInBackground(): boolean;
    set canAcceptInBackground(canAcceptInBackground: boolean);
    get matchOnDescription(): boolean;
    set matchOnDescription(matchOnDescription: boolean);
    get matchOnDetail(): boolean;
    set matchOnDetail(matchOnDetail: boolean);
    get matchOnLabel(): boolean;
    set matchOnLabel(matchOnLabel: boolean);
    get matchOnLabelMode(): 'fuzzy' | 'contiguous';
    set matchOnLabelMode(matchOnLabelMode: 'fuzzy' | 'contiguous');
    get sortByLabel(): boolean;
    set sortByLabel(sortByLabel: boolean);
    get keepScrollPosition(): boolean;
    set keepScrollPosition(keepScrollPosition: boolean);
    get itemActivation(): ItemActivation;
    set itemActivation(itemActivation: ItemActivation);
    get activeItems(): T[];
    set activeItems(activeItems: T[]);
    onDidChangeActive: Event<T[]>;
    get selectedItems(): T[];
    set selectedItems(selectedItems: T[]);
    get keyMods(): IKeyMods;
    get valueSelection(): Readonly<[number, number]> | undefined;
    set valueSelection(valueSelection: Readonly<[number, number]> | undefined);
    get customButton(): boolean;
    set customButton(showCustomButton: boolean);
    get customLabel(): string | undefined;
    set customLabel(label: string | undefined);
    get customHover(): string | undefined;
    set customHover(hover: string | undefined);
    get ok(): boolean | 'default';
    set ok(showOkButton: boolean | 'default');
    inputHasFocus(): boolean;
    focusOnInput(): void;
    get hideInput(): boolean;
    set hideInput(hideInput: boolean);
    get hideCountBadge(): boolean;
    set hideCountBadge(hideCountBadge: boolean);
    get hideCheckAll(): boolean;
    set hideCheckAll(hideCheckAll: boolean);
    onDidChangeSelection: Event<T[]>;
    onDidTriggerItemButton: Event<IQuickPickItemButtonEvent<T>>;
    onDidTriggerSeparatorButton: Event<IQuickPickSeparatorButtonEvent>;
    private trySelectFirst;
    show(): void;
    private handleAccept;
    private registerQuickNavigation;
    protected update(): void;
    focus(focus: QuickPickFocus): void;
    accept(inBackground?: boolean | undefined): void;
}
export declare class InputBox extends QuickInput implements IInputBox {
    private _value;
    private _valueSelection;
    private valueSelectionUpdated;
    private _placeholder;
    private _password;
    private _prompt;
    private readonly onDidValueChangeEmitter;
    private readonly onDidAcceptEmitter;
    readonly type = QuickInputType.InputBox;
    get value(): string;
    set value(value: string);
    get valueSelection(): Readonly<[number, number]> | undefined;
    set valueSelection(valueSelection: Readonly<[number, number]> | undefined);
    get placeholder(): string | undefined;
    set placeholder(placeholder: string | undefined);
    get password(): boolean;
    set password(password: boolean);
    get prompt(): string | undefined;
    set prompt(prompt: string | undefined);
    readonly onDidChangeValue: Event<string>;
    readonly onDidAccept: Event<void>;
    show(): void;
    protected update(): void;
}
export declare class QuickWidget extends QuickInput implements IQuickWidget {
    readonly type = QuickInputType.QuickWidget;
    protected update(): void;
}
export declare class QuickInputHoverDelegate extends WorkbenchHoverDelegate {
    constructor(configurationService: IConfigurationService, hoverService: IHoverService);
    private getOverrideOptions;
}
export {};
