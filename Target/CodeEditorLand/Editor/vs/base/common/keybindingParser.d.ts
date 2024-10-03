import { Keybinding } from './keybindings.js';
export declare class KeybindingParser {
    private static _readModifiers;
    private static parseChord;
    static parseKeybinding(input: string): Keybinding | null;
}
