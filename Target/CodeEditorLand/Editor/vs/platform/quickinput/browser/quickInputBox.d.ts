import { StandardKeyboardEvent } from '../../../base/browser/keyboardEvent.js';
import { StandardMouseEvent } from '../../../base/browser/mouseEvent.js';
import { IInputBoxStyles, IRange } from '../../../base/browser/ui/inputbox/inputBox.js';
import { IToggleStyles, Toggle } from '../../../base/browser/ui/toggle/toggle.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import Severity from '../../../base/common/severity.js';
import './media/quickInput.css';
export declare class QuickInputBox extends Disposable {
    private parent;
    private container;
    private findInput;
    constructor(parent: HTMLElement, inputBoxStyles: IInputBoxStyles, toggleStyles: IToggleStyles);
    onKeyDown: (handler: (event: StandardKeyboardEvent) => void) => IDisposable;
    onMouseDown: (handler: (event: StandardMouseEvent) => void) => IDisposable;
    onDidChange: (handler: (event: string) => void) => IDisposable;
    get value(): string;
    set value(value: string);
    select(range?: IRange | null): void;
    getSelection(): IRange | null;
    isSelectionAtEnd(): boolean;
    setPlaceholder(placeholder: string): void;
    get placeholder(): string;
    set placeholder(placeholder: string);
    get password(): boolean;
    set password(password: boolean);
    set enabled(enabled: boolean);
    set toggles(toggles: Toggle[] | undefined);
    hasFocus(): boolean;
    setAttribute(name: string, value: string): void;
    removeAttribute(name: string): void;
    showDecoration(decoration: Severity): void;
    stylesForType(decoration: Severity): {
        border: string | undefined;
        background: string | undefined;
        foreground: string | undefined;
    };
    setFocus(): void;
    layout(): void;
}
