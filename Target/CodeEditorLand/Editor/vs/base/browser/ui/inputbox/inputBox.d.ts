import { IHistoryNavigationWidget } from '../../history.js';
import { IContextViewProvider } from '../contextview/contextview.js';
import { Widget } from '../widget.js';
import { IAction } from '../../../common/actions.js';
import { Event } from '../../../common/event.js';
import './inputBox.css';
export interface IInputOptions {
    readonly placeholder?: string;
    readonly showPlaceholderOnFocus?: boolean;
    readonly tooltip?: string;
    readonly ariaLabel?: string;
    readonly type?: string;
    readonly validationOptions?: IInputValidationOptions;
    readonly flexibleHeight?: boolean;
    readonly flexibleWidth?: boolean;
    readonly flexibleMaxHeight?: number;
    readonly actions?: ReadonlyArray<IAction>;
    readonly inputBoxStyles: IInputBoxStyles;
}
export interface IInputBoxStyles {
    readonly inputBackground: string | undefined;
    readonly inputForeground: string | undefined;
    readonly inputBorder: string | undefined;
    readonly inputValidationInfoBorder: string | undefined;
    readonly inputValidationInfoBackground: string | undefined;
    readonly inputValidationInfoForeground: string | undefined;
    readonly inputValidationWarningBorder: string | undefined;
    readonly inputValidationWarningBackground: string | undefined;
    readonly inputValidationWarningForeground: string | undefined;
    readonly inputValidationErrorBorder: string | undefined;
    readonly inputValidationErrorBackground: string | undefined;
    readonly inputValidationErrorForeground: string | undefined;
}
export interface IInputValidator {
    (value: string): IMessage | null;
}
export interface IMessage {
    readonly content?: string;
    readonly formatContent?: boolean;
    readonly type?: MessageType;
}
export interface IInputValidationOptions {
    validation?: IInputValidator;
}
export declare const enum MessageType {
    INFO = 1,
    WARNING = 2,
    ERROR = 3
}
export interface IRange {
    start: number;
    end: number;
}
export declare const unthemedInboxStyles: IInputBoxStyles;
export declare class InputBox extends Widget {
    private contextViewProvider?;
    element: HTMLElement;
    protected input: HTMLInputElement;
    private actionbar?;
    private readonly options;
    private message;
    protected placeholder: string;
    private tooltip;
    private ariaLabel;
    private validation?;
    private state;
    private mirror;
    private cachedHeight;
    private cachedContentHeight;
    private maxHeight;
    private scrollableElement;
    private hover;
    private _onDidChange;
    readonly onDidChange: Event<string>;
    private _onDidHeightChange;
    readonly onDidHeightChange: Event<number>;
    constructor(container: HTMLElement, contextViewProvider: IContextViewProvider | undefined, options: IInputOptions);
    protected onBlur(): void;
    protected onFocus(): void;
    setPlaceHolder(placeHolder: string): void;
    setTooltip(tooltip: string): void;
    setAriaLabel(label: string): void;
    getAriaLabel(): string;
    get mirrorElement(): HTMLElement | undefined;
    get inputElement(): HTMLInputElement;
    get value(): string;
    set value(newValue: string);
    get step(): string;
    set step(newValue: string);
    get height(): number;
    focus(): void;
    blur(): void;
    hasFocus(): boolean;
    select(range?: IRange | null): void;
    isSelectionAtEnd(): boolean;
    getSelection(): IRange | null;
    enable(): void;
    disable(): void;
    setEnabled(enabled: boolean): void;
    get width(): number;
    set width(width: number);
    set paddingRight(paddingRight: number);
    private updateScrollDimensions;
    showMessage(message: IMessage, force?: boolean): void;
    hideMessage(): void;
    isInputValid(): boolean;
    validate(): MessageType | undefined;
    stylesForType(type: MessageType | undefined): {
        border: string | undefined;
        background: string | undefined;
        foreground: string | undefined;
    };
    private classForType;
    private _showMessage;
    private _hideMessage;
    private onValueChange;
    private updateMirror;
    protected applyStyles(): void;
    layout(): void;
    insertAtCursor(text: string): void;
    dispose(): void;
}
export interface IHistoryInputOptions extends IInputOptions {
    history: string[];
    readonly showHistoryHint?: () => boolean;
}
export declare class HistoryInputBox extends InputBox implements IHistoryNavigationWidget {
    private readonly history;
    private observer;
    private readonly _onDidFocus;
    readonly onDidFocus: Event<void>;
    private readonly _onDidBlur;
    readonly onDidBlur: Event<void>;
    constructor(container: HTMLElement, contextViewProvider: IContextViewProvider | undefined, options: IHistoryInputOptions);
    dispose(): void;
    addToHistory(always?: boolean): void;
    prependHistory(restoredHistory: string[]): void;
    getHistory(): string[];
    isAtFirstInHistory(): boolean;
    isAtLastInHistory(): boolean;
    isNowhereInHistory(): boolean;
    showNextValue(): void;
    showPreviousValue(): void;
    clearHistory(): void;
    setPlaceHolder(placeHolder: string): void;
    protected onBlur(): void;
    protected onFocus(): void;
    private getCurrentValue;
    private getPreviousValue;
    private getNextValue;
}
