import { SingleModifierChord, KeyCodeChord, Keybinding } from '../../../base/common/keybindings.js';
import { OperatingSystem } from '../../../base/common/platform.js';
import { BaseResolvedKeybinding } from './baseResolvedKeybinding.js';
export declare class USLayoutResolvedKeybinding extends BaseResolvedKeybinding<KeyCodeChord> {
    constructor(chords: KeyCodeChord[], os: OperatingSystem);
    private _keyCodeToUILabel;
    protected _getLabel(chord: KeyCodeChord): string | null;
    protected _getAriaLabel(chord: KeyCodeChord): string | null;
    protected _getElectronAccelerator(chord: KeyCodeChord): string | null;
    protected _getUserSettingsLabel(chord: KeyCodeChord): string | null;
    protected _isWYSIWYG(): boolean;
    protected _getChordDispatch(chord: KeyCodeChord): string | null;
    static getDispatchStr(chord: KeyCodeChord): string | null;
    protected _getSingleModifierChordDispatch(keybinding: KeyCodeChord): SingleModifierChord | null;
    private static _scanCodeToKeyCode;
    private static _toKeyCodeChord;
    static resolveKeybinding(keybinding: Keybinding, os: OperatingSystem): USLayoutResolvedKeybinding[];
}
