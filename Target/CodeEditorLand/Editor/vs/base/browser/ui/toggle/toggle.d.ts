import { IKeyboardEvent } from '../../keyboardEvent.js';
import { BaseActionViewItem, IActionViewItemOptions } from '../actionbar/actionViewItems.js';
import { Widget } from '../widget.js';
import { IAction } from '../../../common/actions.js';
import { ThemeIcon } from '../../../common/themables.js';
import { Event } from '../../../common/event.js';
import './toggle.css';
import { IHoverDelegate } from '../hover/hoverDelegate.js';
export interface IToggleOpts extends IToggleStyles {
    readonly actionClassName?: string;
    readonly icon?: ThemeIcon;
    readonly title: string;
    readonly isChecked: boolean;
    readonly notFocusable?: boolean;
    readonly hoverDelegate?: IHoverDelegate;
}
export interface IToggleStyles {
    readonly inputActiveOptionBorder: string | undefined;
    readonly inputActiveOptionForeground: string | undefined;
    readonly inputActiveOptionBackground: string | undefined;
}
export interface ICheckboxStyles {
    readonly checkboxBackground: string | undefined;
    readonly checkboxBorder: string | undefined;
    readonly checkboxForeground: string | undefined;
}
export declare const unthemedToggleStyles: {
    inputActiveOptionBorder: string;
    inputActiveOptionForeground: string;
    inputActiveOptionBackground: string;
};
export declare class ToggleActionViewItem extends BaseActionViewItem {
    protected readonly toggle: Toggle;
    constructor(context: any, action: IAction, options: IActionViewItemOptions);
    render(container: HTMLElement): void;
    protected updateEnabled(): void;
    protected updateChecked(): void;
    focus(): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
}
export declare class Toggle extends Widget {
    private readonly _onChange;
    readonly onChange: Event<boolean>;
    private readonly _onKeyDown;
    readonly onKeyDown: Event<IKeyboardEvent>;
    private readonly _opts;
    private _icon;
    readonly domNode: HTMLElement;
    private _checked;
    private _hover;
    constructor(opts: IToggleOpts);
    get enabled(): boolean;
    focus(): void;
    get checked(): boolean;
    set checked(newIsChecked: boolean);
    setIcon(icon: ThemeIcon | undefined): void;
    width(): number;
    protected applyStyles(): void;
    enable(): void;
    disable(): void;
    setTitle(newTitle: string): void;
    set visible(visible: boolean);
    get visible(): boolean;
}
export declare class Checkbox extends Widget {
    private title;
    private isChecked;
    static readonly CLASS_NAME = "monaco-checkbox";
    private readonly _onChange;
    readonly onChange: Event<boolean>;
    private checkbox;
    private styles;
    readonly domNode: HTMLElement;
    constructor(title: string, isChecked: boolean, styles: ICheckboxStyles);
    get checked(): boolean;
    set checked(newIsChecked: boolean);
    focus(): void;
    hasFocus(): boolean;
    enable(): void;
    disable(): void;
    protected applyStyles(): void;
}
export interface ICheckboxActionViewItemOptions extends IActionViewItemOptions {
    checkboxStyles: ICheckboxStyles;
}
export declare class CheckboxActionViewItem extends BaseActionViewItem {
    protected readonly toggle: Checkbox;
    private cssClass?;
    constructor(context: any, action: IAction, options: ICheckboxActionViewItemOptions);
    render(container: HTMLElement): void;
    private onChange;
    protected updateEnabled(): void;
    protected updateChecked(): void;
    protected updateClass(): void;
    focus(): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
}
