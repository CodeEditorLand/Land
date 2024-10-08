import { IKeyboardEvent } from '../keyboardEvent.js';
import { IMouseEvent } from '../mouseEvent.js';
import { Disposable, IDisposable } from '../../common/lifecycle.js';
export declare abstract class Widget extends Disposable {
    protected onclick(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void;
    protected onmousedown(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void;
    protected onmouseover(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void;
    protected onmouseleave(domNode: HTMLElement, listener: (e: IMouseEvent) => void): void;
    protected onkeydown(domNode: HTMLElement, listener: (e: IKeyboardEvent) => void): void;
    protected onkeyup(domNode: HTMLElement, listener: (e: IKeyboardEvent) => void): void;
    protected oninput(domNode: HTMLElement, listener: (e: Event) => void): void;
    protected onblur(domNode: HTMLElement, listener: (e: Event) => void): void;
    protected onfocus(domNode: HTMLElement, listener: (e: Event) => void): void;
    protected onchange(domNode: HTMLElement, listener: (e: Event) => void): void;
    protected ignoreGesture(domNode: HTMLElement): IDisposable;
}
