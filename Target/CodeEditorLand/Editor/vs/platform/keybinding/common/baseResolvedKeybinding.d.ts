import { Chord, SingleModifierChord, ResolvedKeybinding, ResolvedChord } from '../../../base/common/keybindings.js';
import { OperatingSystem } from '../../../base/common/platform.js';
export declare abstract class BaseResolvedKeybinding<T extends Chord> extends ResolvedKeybinding {
    protected readonly _os: OperatingSystem;
    protected readonly _chords: readonly T[];
    constructor(os: OperatingSystem, chords: readonly T[]);
    getLabel(): string | null;
    getAriaLabel(): string | null;
    getElectronAccelerator(): string | null;
    getUserSettingsLabel(): string | null;
    isWYSIWYG(): boolean;
    hasMultipleChords(): boolean;
    getChords(): ResolvedChord[];
    private _getChord;
    getDispatchChords(): (string | null)[];
    getSingleModifierDispatchChords(): (SingleModifierChord | null)[];
    protected abstract _getLabel(keybinding: T): string | null;
    protected abstract _getAriaLabel(keybinding: T): string | null;
    protected abstract _getElectronAccelerator(keybinding: T): string | null;
    protected abstract _getUserSettingsLabel(keybinding: T): string | null;
    protected abstract _isWYSIWYG(keybinding: T): boolean;
    protected abstract _getChordDispatch(keybinding: T): string | null;
    protected abstract _getSingleModifierChordDispatch(keybinding: T): SingleModifierChord | null;
}
