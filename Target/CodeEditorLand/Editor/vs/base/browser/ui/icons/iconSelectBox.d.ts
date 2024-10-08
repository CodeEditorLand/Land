import './iconSelectBox.css';
import * as dom from '../../dom.js';
import { IInputBoxStyles, InputBox } from '../inputbox/inputBox.js';
import { Disposable } from '../../../common/lifecycle.js';
import { ThemeIcon } from '../../../common/themables.js';
export interface IIconSelectBoxOptions {
    readonly icons: ThemeIcon[];
    readonly inputBoxStyles: IInputBoxStyles;
    readonly showIconInfo?: boolean;
}
export declare class IconSelectBox extends Disposable {
    private readonly options;
    private static InstanceCount;
    readonly domId: string;
    readonly domNode: HTMLElement;
    private _onDidSelect;
    readonly onDidSelect: import("../../../common/event.js").Event<ThemeIcon>;
    private renderedIcons;
    private focusedItemIndex;
    private numberOfElementsPerRow;
    protected inputBox: InputBox | undefined;
    private scrollableElement;
    private iconsContainer;
    private iconIdElement;
    private readonly iconContainerWidth;
    private readonly iconContainerHeight;
    constructor(options: IIconSelectBoxOptions);
    private create;
    private renderIcons;
    private focusIcon;
    private reveal;
    private matchesContiguous;
    layout(dimension: dom.Dimension): void;
    getFocus(): number[];
    setSelection(index: number): void;
    clearInput(): void;
    focus(): void;
    focusNext(): void;
    focusPrevious(): void;
    focusNextRow(): void;
    focusPreviousRow(): void;
    getFocusedIcon(): ThemeIcon;
}
