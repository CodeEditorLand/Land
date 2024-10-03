import { IContentActionHandler } from '../../formattedTextRenderer.js';
import { IContextViewProvider } from '../contextview/contextview.js';
import { IListStyles } from '../list/listWidget.js';
import { Widget } from '../widget.js';
import { Event } from '../../../common/event.js';
import { IDisposable } from '../../../common/lifecycle.js';
import './selectBox.css';
export interface ISelectBoxDelegate extends IDisposable {
    readonly onDidSelect: Event<ISelectData>;
    setOptions(options: ISelectOptionItem[], selected?: number): void;
    select(index: number): void;
    setAriaLabel(label: string): void;
    focus(): void;
    blur(): void;
    setFocusable(focus: boolean): void;
    setEnabled(enabled: boolean): void;
    render(container: HTMLElement): void;
}
export interface ISelectBoxOptions {
    useCustomDrawn?: boolean;
    ariaLabel?: string;
    ariaDescription?: string;
    minBottomMargin?: number;
    optionsAsChildren?: boolean;
}
export interface ISelectOptionItem {
    text: string;
    detail?: string;
    decoratorRight?: string;
    description?: string;
    descriptionIsMarkdown?: boolean;
    descriptionMarkdownActionHandler?: IContentActionHandler;
    isDisabled?: boolean;
}
export interface ISelectBoxStyles extends IListStyles {
    readonly selectBackground: string | undefined;
    readonly selectListBackground: string | undefined;
    readonly selectForeground: string | undefined;
    readonly decoratorRightForeground: string | undefined;
    readonly selectBorder: string | undefined;
    readonly selectListBorder: string | undefined;
    readonly focusBorder: string | undefined;
}
export declare const unthemedSelectBoxStyles: ISelectBoxStyles;
export interface ISelectData {
    selected: string;
    index: number;
}
export declare class SelectBox extends Widget implements ISelectBoxDelegate {
    private selectBoxDelegate;
    constructor(options: ISelectOptionItem[], selected: number, contextViewProvider: IContextViewProvider, styles: ISelectBoxStyles, selectBoxOptions?: ISelectBoxOptions);
    get onDidSelect(): Event<ISelectData>;
    setOptions(options: ISelectOptionItem[], selected?: number): void;
    select(index: number): void;
    setAriaLabel(label: string): void;
    focus(): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    setEnabled(enabled: boolean): void;
    render(container: HTMLElement): void;
}
