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
    isDuplicateModifierCase(): boolean;
}
export declare class ScanCodeChord implements Modifiers {
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly scanCode: ScanCode;
    constructor(ctrlKey: boolean, shiftKey: boolean, altKey: boolean, metaKey: boolean, scanCode: ScanCode);
    equals(other: Chord): boolean;
    getHashCode(): string;
    isDuplicateModifierCase(): boolean;
}
export type Chord = KeyCodeChord | ScanCodeChord;
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
export declare abstract class ResolvedKeybinding {
    abstract getLabel(): string | null;
    abstract getAriaLabel(): string | null;
    abstract getElectronAccelerator(): string | null;
    abstract getUserSettingsLabel(): string | null;
    abstract isWYSIWYG(): boolean;
    abstract hasMultipleChords(): boolean;
    abstract getChords(): ResolvedChord[];
    abstract getDispatchChords(): (string | null)[];
    abstract getSingleModifierDispatchChords(): (SingleModifierChord | null)[];
}
