import { Modifiers } from './keybindings.js';
import { OperatingSystem } from './platform.js';
export interface ModifierLabels {
    readonly ctrlKey: string;
    readonly shiftKey: string;
    readonly altKey: string;
    readonly metaKey: string;
    readonly separator: string;
}
export interface KeyLabelProvider<T extends Modifiers> {
    (keybinding: T): string | null;
}
export declare class ModifierLabelProvider {
    readonly modifierLabels: ModifierLabels[];
    constructor(mac: ModifierLabels, windows: ModifierLabels, linux?: ModifierLabels);
    toLabel<T extends Modifiers>(OS: OperatingSystem, chords: readonly T[], keyLabelProvider: KeyLabelProvider<T>): string | null;
}
export declare const UILabelProvider: ModifierLabelProvider;
export declare const AriaLabelProvider: ModifierLabelProvider;
export declare const ElectronAcceleratorLabelProvider: ModifierLabelProvider;
export declare const UserSettingsLabelProvider: ModifierLabelProvider;
