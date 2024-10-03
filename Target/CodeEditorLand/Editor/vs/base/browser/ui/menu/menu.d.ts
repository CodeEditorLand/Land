import { ActionBar, IActionViewItemProvider } from '../actionbar/actionbar.js';
import { AnchorAlignment } from '../contextview/contextview.js';
import { IAction, IActionRunner } from '../../../common/actions.js';
import { ThemeIcon } from '../../../common/themables.js';
import { Event } from '../../../common/event.js';
import { ResolvedKeybinding } from '../../../common/keybindings.js';
import { ScrollEvent } from '../../../common/scrollable.js';
export declare const MENU_MNEMONIC_REGEX: RegExp;
export declare const MENU_ESCAPED_MNEMONIC_REGEX: RegExp;
export declare enum HorizontalDirection {
    Right = 0,
    Left = 1
}
export declare enum VerticalDirection {
    Above = 0,
    Below = 1
}
export interface IMenuDirection {
    horizontal: HorizontalDirection;
    vertical: VerticalDirection;
}
export interface IMenuOptions {
    context?: unknown;
    actionViewItemProvider?: IActionViewItemProvider;
    actionRunner?: IActionRunner;
    getKeyBinding?: (action: IAction) => ResolvedKeybinding | undefined;
    ariaLabel?: string;
    enableMnemonics?: boolean;
    anchorAlignment?: AnchorAlignment;
    expandDirection?: IMenuDirection;
    useEventAsContext?: boolean;
    submenuIds?: Set<string>;
}
export interface IMenuStyles {
    shadowColor: string | undefined;
    borderColor: string | undefined;
    foregroundColor: string | undefined;
    backgroundColor: string | undefined;
    selectionForegroundColor: string | undefined;
    selectionBackgroundColor: string | undefined;
    selectionBorderColor: string | undefined;
    separatorColor: string | undefined;
    scrollbarShadow: string | undefined;
    scrollbarSliderBackground: string | undefined;
    scrollbarSliderHoverBackground: string | undefined;
    scrollbarSliderActiveBackground: string | undefined;
}
export declare const unthemedMenuStyles: IMenuStyles;
export declare class Menu extends ActionBar {
    private readonly menuStyles;
    private mnemonics;
    private scrollableElement;
    private menuElement;
    static globalStyleSheet: HTMLStyleElement;
    protected styleSheet: HTMLStyleElement | undefined;
    constructor(container: HTMLElement, actions: ReadonlyArray<IAction>, options: IMenuOptions, menuStyles: IMenuStyles);
    private initializeOrUpdateStyleSheet;
    private styleScrollElement;
    getContainer(): HTMLElement;
    get onScroll(): Event<ScrollEvent>;
    get scrollOffset(): number;
    trigger(index: number): void;
    private focusItemByElement;
    private setFocusedItem;
    protected updateFocus(fromRight?: boolean): void;
    private doGetActionViewItem;
}
export declare function cleanMnemonic(label: string): string;
export declare function formatRule(c: ThemeIcon): string;
