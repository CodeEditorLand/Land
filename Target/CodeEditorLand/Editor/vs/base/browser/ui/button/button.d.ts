import { IContextMenuProvider } from '../../contextmenu.js';
import { IHoverDelegate } from '../hover/hoverDelegate.js';
import { IAction, IActionRunner } from '../../../common/actions.js';
import { Event as BaseEvent } from '../../../common/event.js';
import { IMarkdownString } from '../../../common/htmlContent.js';
import { Disposable, IDisposable } from '../../../common/lifecycle.js';
import { ThemeIcon } from '../../../common/themables.js';
import './button.css';
import { IActionProvider } from '../dropdown/dropdown.js';
export interface IButtonOptions extends Partial<IButtonStyles> {
    readonly title?: boolean | string;
    readonly ariaLabel?: boolean | string;
    readonly supportIcons?: boolean;
    readonly supportShortLabel?: boolean;
    readonly secondary?: boolean;
    readonly hoverDelegate?: IHoverDelegate;
}
export interface IButtonStyles {
    readonly buttonBackground: string | undefined;
    readonly buttonHoverBackground: string | undefined;
    readonly buttonForeground: string | undefined;
    readonly buttonSeparator: string | undefined;
    readonly buttonSecondaryBackground: string | undefined;
    readonly buttonSecondaryHoverBackground: string | undefined;
    readonly buttonSecondaryForeground: string | undefined;
    readonly buttonBorder: string | undefined;
}
export declare const unthemedButtonStyles: IButtonStyles;
export interface IButton extends IDisposable {
    readonly element: HTMLElement;
    readonly onDidClick: BaseEvent<Event | undefined>;
    set label(value: string | IMarkdownString);
    set icon(value: ThemeIcon);
    set enabled(value: boolean);
    set checked(value: boolean);
    focus(): void;
    hasFocus(): boolean;
}
export interface IButtonWithDescription extends IButton {
    description: string;
}
export declare class Button extends Disposable implements IButton {
    protected options: IButtonOptions;
    protected _element: HTMLElement;
    protected _label: string | IMarkdownString;
    protected _labelElement: HTMLElement | undefined;
    protected _labelShortElement: HTMLElement | undefined;
    private _hover;
    private _onDidClick;
    get onDidClick(): BaseEvent<Event>;
    private _onDidEscape;
    get onDidEscape(): BaseEvent<Event>;
    private focusTracker;
    constructor(container: HTMLElement, options: IButtonOptions);
    dispose(): void;
    private getContentElements;
    private updateBackground;
    get element(): HTMLElement;
    set label(value: string | IMarkdownString);
    get label(): string | IMarkdownString;
    set labelShort(value: string);
    set icon(icon: ThemeIcon);
    set enabled(value: boolean);
    get enabled(): boolean;
    set checked(value: boolean);
    get checked(): boolean;
    setTitle(title: string): void;
    focus(): void;
    hasFocus(): boolean;
}
export interface IButtonWithDropdownOptions extends IButtonOptions {
    readonly contextMenuProvider: IContextMenuProvider;
    readonly actions: readonly IAction[] | IActionProvider;
    readonly actionRunner?: IActionRunner;
    readonly addPrimaryActionToDropdown?: boolean;
}
export declare class ButtonWithDropdown extends Disposable implements IButton {
    private readonly button;
    private readonly action;
    private readonly dropdownButton;
    private readonly separatorContainer;
    private readonly separator;
    readonly element: HTMLElement;
    private readonly _onDidClick;
    readonly onDidClick: BaseEvent<Event | undefined>;
    constructor(container: HTMLElement, options: IButtonWithDropdownOptions);
    dispose(): void;
    set label(value: string);
    set icon(icon: ThemeIcon);
    set enabled(enabled: boolean);
    get enabled(): boolean;
    set checked(value: boolean);
    get checked(): boolean;
    focus(): void;
    hasFocus(): boolean;
}
export declare class ButtonWithDescription implements IButtonWithDescription {
    private readonly options;
    private _button;
    private _element;
    private _descriptionElement;
    constructor(container: HTMLElement, options: IButtonOptions);
    get onDidClick(): BaseEvent<Event | undefined>;
    get element(): HTMLElement;
    set label(value: string);
    set icon(icon: ThemeIcon);
    get enabled(): boolean;
    set enabled(enabled: boolean);
    set checked(value: boolean);
    get checked(): boolean;
    focus(): void;
    hasFocus(): boolean;
    dispose(): void;
    set description(value: string);
}
export declare class ButtonBar {
    private readonly container;
    private readonly _buttons;
    private readonly _buttonStore;
    constructor(container: HTMLElement);
    dispose(): void;
    get buttons(): IButton[];
    clear(): void;
    addButton(options: IButtonOptions): IButton;
    addButtonWithDescription(options: IButtonOptions): IButtonWithDescription;
    addButtonWithDropdown(options: IButtonWithDropdownOptions): IButton;
    private pushButton;
}
