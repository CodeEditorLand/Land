import { KeyCode } from '../common/keyCodes.js';
import { KeyCodeChord } from '../common/keybindings.js';
export interface IKeyboardEvent {
    readonly _standardKeyboardEventBrand: true;
    readonly browserEvent: KeyboardEvent;
    readonly target: HTMLElement;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly altGraphKey: boolean;
    readonly keyCode: KeyCode;
    readonly code: string;
    /**
     * @internal
     */
    toKeyCodeChord(): KeyCodeChord;
    equals(keybinding: number): boolean;
    preventDefault(): void;
    stopPropagation(): void;
}
export declare function printKeyboardEvent(e: KeyboardEvent): string;
export declare function printStandardKeyboardEvent(e: StandardKeyboardEvent): string;
export declare class StandardKeyboardEvent implements IKeyboardEvent {
    readonly _standardKeyboardEventBrand = true;
    readonly browserEvent: KeyboardEvent;
    readonly target: HTMLElement;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly altGraphKey: boolean;
    readonly keyCode: KeyCode;
    readonly code: string;
    private _asKeybinding;
    private _asKeyCodeChord;
    constructor(source: KeyboardEvent);
    preventDefault(): void;
    stopPropagation(): void;
    toKeyCodeChord(): KeyCodeChord;
    equals(other: number): boolean;
    private _computeKeybinding;
    private _computeKeyCodeChord;
}
