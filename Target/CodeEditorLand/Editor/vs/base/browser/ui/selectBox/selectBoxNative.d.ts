import { ISelectBoxDelegate, ISelectBoxOptions, ISelectBoxStyles, ISelectData, ISelectOptionItem } from './selectBox.js';
import { Event } from '../../../common/event.js';
import { Disposable } from '../../../common/lifecycle.js';
export declare class SelectBoxNative extends Disposable implements ISelectBoxDelegate {
    private selectElement;
    private selectBoxOptions;
    private options;
    private selected;
    private readonly _onDidSelect;
    private styles;
    constructor(options: ISelectOptionItem[], selected: number, styles: ISelectBoxStyles, selectBoxOptions?: ISelectBoxOptions);
    private registerListeners;
    get onDidSelect(): Event<ISelectData>;
    setOptions(options: ISelectOptionItem[], selected?: number): void;
    select(index: number): void;
    setAriaLabel(label: string): void;
    focus(): void;
    blur(): void;
    setEnabled(enable: boolean): void;
    setFocusable(focusable: boolean): void;
    render(container: HTMLElement): void;
    style(styles: ISelectBoxStyles): void;
    applyStyles(): void;
    private createOption;
}
