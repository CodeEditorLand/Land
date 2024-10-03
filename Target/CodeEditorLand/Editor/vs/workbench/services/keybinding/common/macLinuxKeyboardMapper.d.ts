import { ResolvedKeybinding, KeyCodeChord, SingleModifierChord, ScanCodeChord, Keybinding } from '../../../../base/common/keybindings.js';
import { OperatingSystem } from '../../../../base/common/platform.js';
import { IKeyboardEvent } from '../../../../platform/keybinding/common/keybinding.js';
import { IKeyboardMapper } from '../../../../platform/keyboardLayout/common/keyboardMapper.js';
import { BaseResolvedKeybinding } from '../../../../platform/keybinding/common/baseResolvedKeybinding.js';
import { IMacLinuxKeyboardMapping } from '../../../../platform/keyboardLayout/common/keyboardLayout.js';
export declare class NativeResolvedKeybinding extends BaseResolvedKeybinding<ScanCodeChord> {
    private readonly _mapper;
    constructor(mapper: MacLinuxKeyboardMapper, os: OperatingSystem, chords: ScanCodeChord[]);
    protected _getLabel(chord: ScanCodeChord): string | null;
    protected _getAriaLabel(chord: ScanCodeChord): string | null;
    protected _getElectronAccelerator(chord: ScanCodeChord): string | null;
    protected _getUserSettingsLabel(chord: ScanCodeChord): string | null;
    protected _isWYSIWYG(binding: ScanCodeChord | null): boolean;
    protected _getChordDispatch(chord: ScanCodeChord): string | null;
    protected _getSingleModifierChordDispatch(chord: ScanCodeChord): SingleModifierChord | null;
}
export declare class MacLinuxKeyboardMapper implements IKeyboardMapper {
    private readonly _isUSStandard;
    private readonly _mapAltGrToCtrlAlt;
    private readonly _OS;
    private readonly _codeInfo;
    private readonly _scanCodeKeyCodeMapper;
    private readonly _scanCodeToLabel;
    private readonly _scanCodeToDispatch;
    constructor(_isUSStandard: boolean, rawMappings: IMacLinuxKeyboardMapping, _mapAltGrToCtrlAlt: boolean, _OS: OperatingSystem);
    dumpDebugInfo(): string;
    private _leftPad;
    keyCodeChordToScanCodeChord(chord: KeyCodeChord): ScanCodeChord[];
    getUILabelForScanCodeChord(chord: ScanCodeChord | null): string | null;
    getAriaLabelForScanCodeChord(chord: ScanCodeChord | null): string | null;
    getDispatchStrForScanCodeChord(chord: ScanCodeChord): string | null;
    getUserSettingsLabelForScanCodeChord(chord: ScanCodeChord | null): string | null;
    getElectronAcceleratorLabelForScanCodeChord(chord: ScanCodeChord | null): string | null;
    private _toResolvedKeybinding;
    private _generateResolvedKeybindings;
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): NativeResolvedKeybinding;
    private _resolveChord;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    private static _redirectCharCode;
    private static _charCodeToKb;
    static getCharCode(char: string): number;
}
