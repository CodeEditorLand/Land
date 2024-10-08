import { KeyCode, ScanCode } from '../../../../base/common/keyCodes.js';
import { ResolvedKeybinding, KeyCodeChord, SingleModifierChord, ScanCodeChord, Keybinding } from '../../../../base/common/keybindings.js';
import { IKeyboardEvent } from '../../../../platform/keybinding/common/keybinding.js';
import { IKeyboardMapper } from '../../../../platform/keyboardLayout/common/keyboardMapper.js';
import { BaseResolvedKeybinding } from '../../../../platform/keybinding/common/baseResolvedKeybinding.js';
import { IWindowsKeyboardMapping } from '../../../../platform/keyboardLayout/common/keyboardLayout.js';
export interface IScanCodeMapping {
    scanCode: ScanCode;
    keyCode: KeyCode;
    value: string;
    withShift: string;
    withAltGr: string;
    withShiftAltGr: string;
}
export declare class WindowsNativeResolvedKeybinding extends BaseResolvedKeybinding<KeyCodeChord> {
    private readonly _mapper;
    constructor(mapper: WindowsKeyboardMapper, chords: KeyCodeChord[]);
    protected _getLabel(chord: KeyCodeChord): string | null;
    private _getUSLabelForKeybinding;
    getUSLabel(): string | null;
    protected _getAriaLabel(chord: KeyCodeChord): string | null;
    protected _getElectronAccelerator(chord: KeyCodeChord): string | null;
    protected _getUserSettingsLabel(chord: KeyCodeChord): string | null;
    protected _isWYSIWYG(chord: KeyCodeChord): boolean;
    private __isWYSIWYG;
    protected _getChordDispatch(chord: KeyCodeChord): string | null;
    protected _getSingleModifierChordDispatch(chord: KeyCodeChord): SingleModifierChord | null;
    private static getProducedCharCode;
    static getProducedChar(chord: ScanCodeChord, mapping: IScanCodeMapping): string;
}
export declare class WindowsKeyboardMapper implements IKeyboardMapper {
    private readonly _isUSStandard;
    private readonly _mapAltGrToCtrlAlt;
    private readonly _codeInfo;
    private readonly _scanCodeToKeyCode;
    private readonly _keyCodeToLabel;
    private readonly _keyCodeExists;
    constructor(_isUSStandard: boolean, rawMappings: IWindowsKeyboardMapping, _mapAltGrToCtrlAlt: boolean);
    dumpDebugInfo(): string;
    private _leftPad;
    getUILabelForKeyCode(keyCode: KeyCode): string;
    getAriaLabelForKeyCode(keyCode: KeyCode): string;
    getUserSettingsLabelForKeyCode(keyCode: KeyCode): string;
    getElectronAcceleratorForKeyBinding(chord: KeyCodeChord): string | null;
    private _getLabelForKeyCode;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): WindowsNativeResolvedKeybinding;
    private _resolveChord;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
}
