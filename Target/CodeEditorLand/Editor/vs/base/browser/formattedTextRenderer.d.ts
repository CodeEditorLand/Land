import { IKeyboardEvent } from './keyboardEvent.js';
import { IMouseEvent } from './mouseEvent.js';
import { DisposableStore } from '../common/lifecycle.js';
export interface IContentActionHandler {
    callback: (content: string, event: IMouseEvent | IKeyboardEvent) => void;
    readonly disposables: DisposableStore;
}
export interface FormattedTextRenderOptions {
    readonly className?: string;
    readonly inline?: boolean;
    readonly actionHandler?: IContentActionHandler;
    readonly renderCodeSegments?: boolean;
}
export declare function renderText(text: string, options?: FormattedTextRenderOptions): HTMLElement;
export declare function renderFormattedText(formattedText: string, options?: FormattedTextRenderOptions): HTMLElement;
export declare function createElement(options: FormattedTextRenderOptions): HTMLElement;
