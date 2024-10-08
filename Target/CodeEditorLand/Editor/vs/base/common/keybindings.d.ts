import { KeyCode, ScanCode } from './keyCodes.js';
import { OperatingSystem } from './platform.js';
export declare function decodeKeybinding(keybinding: number | number[], OS: OperatingSystem): Keybinding | null;
export declare function createSimpleKeybinding(keybinding: number, OS: OperatingSystem): KeyCodeChord;
export interface Modifiers {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
}
/**
 * Represents a chord which uses the `keyCode` field of keyboard events.
 * A chord is a combination of keys pressed simultaneously.
 */
export declare class KeyCodeChord implements Modifiers {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyCode: KeyCode;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, keyCode: KeyCode);
    equals(other: Chord): boolean;
    getHashCode(): string;
    isModifierKey(): boolean;
    toKeybinding(): Keybinding;
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    isDuplicateModifierCase(): boolean;
}
/**
 * Represents a chord which uses the `code` field of keyboard events.
 * A chord is a combination of keys pressed simultaneously.
 */
export declare class ScanCodeChord implements Modifiers {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly scanCode: ScanCode;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, scanCode: ScanCode);
    equals(other: Chord): boolean;
    getHashCode(): string;
    /**
     * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
     */
    isDuplicateModifierCase(): boolean;
}
export type Chord = KeyCodeChord | ScanCodeChord;
/**
 * A keybinding is a sequence of chords.
 */
export declare class Keybinding {
    readonly chords: Chord[];
    constructor(chords: Chord[]);
    getHashCode(): string;
    equals(other: Keybinding | null): boolean;
}
export declare class ResolvedChord {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyLabel: string | null;
    readonly keyAriaLabel: string | null;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, keyLabel: string | null, keyAriaLabel: string | null);
}
export type SingleModifierChord = 'ctrl' | 'shift' | 'alt' | 'meta';
/**
 * A resolved keybinding. Consists of one or multiple chords.
 */
export declare abstract class ResolvedKeybinding {
    /**
     * This prints the binding in a format suitable for displaying in the UI.
     */
    abstract getLabel(): string | null;
    /**
     * This prints the binding in a format suitable for ARIA.
     */
    abstract getAriaLabel(): string | null;
    /**
     * This prints the binding in a format suitable for electron's accelerators.
     * See https://github.com/electron/electron/blob/master/docs/api/accelerator.md
     */
    abstract getElectronAccelerator(): string | null;
    /**
     * This prints the binding in a format suitable for user settings.
     */
    abstract getUserSettingsLabel(): string | null;
    /**
     * Is the user settings label reflecting the label?
     */
    abstract isWYSIWYG(): boolean;
    /**
     * Does the keybinding consist of more than one chord?
     */
    abstract hasMultipleChords(): boolean;
    /**
     * Returns the chords that comprise of the keybinding.
     */
    abstract getChords(): ResolvedChord[];
    /**
     * Returns the chords as strings useful for dispatching.
     * Returns null for modifier only chords.
     * @example keybinding "Shift" -> null
     * @example keybinding ("D" with shift == true) -> "shift+D"
     */
    abstract getDispatchChords(): (string | null)[];
    /**
     * Returns the modifier only chords as strings useful for dispatching.
     * Returns null for chords that contain more than one modifier or a regular key.
     * @example keybinding "Shift" -> "shift"
     * @example keybinding ("D" with shift == true") -> null
     */
    abstract getSingleModifierDispatchChords(): (SingleModifierChord | null)[];
}
