import { IContextMenuProvider } from '../../contextmenu.js';
import { IMenuOptions } from '../menu/menu.js';
import { ActionRunner, IAction } from '../../../common/actions.js';
import { IDisposable } from '../../../common/lifecycle.js';
import './dropdown.css';
export interface ILabelRenderer {
    (container: HTMLElement): IDisposable | null;
}
interface IBaseDropdownOptions {
    label?: string;
    labelRenderer?: ILabelRenderer;
}
declare class BaseDropdown extends ActionRunner {
    private _element;
    private boxContainer?;
    private _label?;
    private contents?;
    private visible;
    private _onDidChangeVisibility;
    readonly onDidChangeVisibility: import("../../../common/event.js").Event<boolean>;
    private hover;
    constructor(container: HTMLElement, options: IBaseDropdownOptions);
    get element(): HTMLElement;
    get label(): HTMLElement | undefined;
    set tooltip(tooltip: string);
    show(): void;
    hide(): void;
    isVisible(): boolean;
    protected onEvent(_e: Event, activeElement: HTMLElement): void;
    dispose(): void;
}
export interface IActionProvider {
    getActions(): readonly IAction[];
}
export interface IDropdownMenuOptions extends IBaseDropdownOptions {
    contextMenuProvider: IContextMenuProvider;
    readonly actions?: IAction[];
    readonly actionProvider?: IActionProvider;
    menuClassName?: string;
    menuAsChild?: boolean;
    readonly skipTelemetry?: boolean;
}
export declare class DropdownMenu extends BaseDropdown {
    private readonly _options;
    private _menuOptions;
    private _actions;
    constructor(container: HTMLElement, _options: IDropdownMenuOptions);
    set menuOptions(options: IMenuOptions | undefined);
    get menuOptions(): IMenuOptions | undefined;
    private get actions();
    private set actions(value);
    show(): void;
    hide(): void;
    private onHide;
}
export {};
