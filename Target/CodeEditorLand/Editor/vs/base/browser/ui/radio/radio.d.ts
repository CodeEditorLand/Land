import { Widget } from '../widget.js';
import { ThemeIcon } from '../../../common/themables.js';
import './radio.css';
import { IHoverDelegate } from '../hover/hoverDelegate.js';
export interface IRadioStyles {
    readonly activeForeground?: string;
    readonly activeBackground?: string;
    readonly activeBorder?: string;
    readonly inactiveForeground?: string;
    readonly inactiveBackground?: string;
    readonly inactiveHoverBackground?: string;
    readonly inactiveBorder?: string;
}
export interface IRadioOptionItem {
    readonly text: string;
    readonly tooltip?: string;
    readonly isActive?: boolean;
    readonly disabled?: boolean;
}
export interface IRadioOptions {
    readonly items: ReadonlyArray<IRadioOptionItem>;
    readonly activeIcon?: ThemeIcon;
    readonly hoverDelegate?: IHoverDelegate;
}
export declare class Radio extends Widget {
    private readonly _onDidSelect;
    readonly onDidSelect: import("../../../common/event.js").Event<number>;
    readonly domNode: HTMLElement;
    private readonly hoverDelegate;
    private items;
    private activeItem;
    private readonly buttons;
    constructor(opts: IRadioOptions);
    setItems(items: ReadonlyArray<IRadioOptionItem>): void;
    setActiveItem(index: number): void;
    setEnabled(enabled: boolean): void;
    private updateButtons;
}
