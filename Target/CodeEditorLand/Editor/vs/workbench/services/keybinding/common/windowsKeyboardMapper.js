/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { KeyCodeUtils, IMMUTABLE_CODE_TO_KEY_CODE, ScanCodeUtils, NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE } from '../../../../base/common/keyCodes.js';
import { KeyCodeChord, ScanCodeChord } from '../../../../base/common/keybindings.js';
import { UILabelProvider } from '../../../../base/common/keybindingLabels.js';
import { BaseResolvedKeybinding } from '../../../../platform/keybinding/common/baseResolvedKeybinding.js';
import { toEmptyArrayIfContainsNull } from '../../../../platform/keybinding/common/resolvedKeybindingItem.js';
const LOG = false;
function log(str) {
    if (LOG) {
        console.info(str);
    }
}
export class WindowsNativeResolvedKeybinding extends BaseResolvedKeybinding {
    constructor(mapper, chords) {
        super(1 /* OperatingSystem.Windows */, chords);
        this._mapper = mapper;
    }
    _getLabel(chord) {
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        return this._mapper.getUILabelForKeyCode(chord.keyCode);
    }
    _getUSLabelForKeybinding(chord) {
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        return KeyCodeUtils.toString(chord.keyCode);
    }
    getUSLabel() {
        return UILabelProvider.toLabel(this._os, this._chords, (keybinding) => this._getUSLabelForKeybinding(keybinding));
    }
    _getAriaLabel(chord) {
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        return this._mapper.getAriaLabelForKeyCode(chord.keyCode);
    }
    _getElectronAccelerator(chord) {
        return this._mapper.getElectronAcceleratorForKeyBinding(chord);
    }
    _getUserSettingsLabel(chord) {
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        const result = this._mapper.getUserSettingsLabelForKeyCode(chord.keyCode);
        return (result ? result.toLowerCase() : result);
    }
    _isWYSIWYG(chord) {
        return this.__isWYSIWYG(chord.keyCode);
    }
    __isWYSIWYG(keyCode) {
        if (keyCode === 15 /* KeyCode.LeftArrow */
            || keyCode === 16 /* KeyCode.UpArrow */
            || keyCode === 17 /* KeyCode.RightArrow */
            || keyCode === 18 /* KeyCode.DownArrow */) {
            return true;
        }
        const ariaLabel = this._mapper.getAriaLabelForKeyCode(keyCode);
        const userSettingsLabel = this._mapper.getUserSettingsLabelForKeyCode(keyCode);
        return (ariaLabel === userSettingsLabel);
    }
    _getChordDispatch(chord) {
        if (chord.isModifierKey()) {
            return null;
        }
        let result = '';
        if (chord.ctrlKey) {
            result += 'ctrl+';
        }
        if (chord.shiftKey) {
            result += 'shift+';
        }
        if (chord.altKey) {
            result += 'alt+';
        }
        if (chord.metaKey) {
            result += 'meta+';
        }
        result += KeyCodeUtils.toString(chord.keyCode);
        return result;
    }
    _getSingleModifierChordDispatch(chord) {
        if (chord.keyCode === 5 /* KeyCode.Ctrl */ && !chord.shiftKey && !chord.altKey && !chord.metaKey) {
            return 'ctrl';
        }
        if (chord.keyCode === 4 /* KeyCode.Shift */ && !chord.ctrlKey && !chord.altKey && !chord.metaKey) {
            return 'shift';
        }
        if (chord.keyCode === 6 /* KeyCode.Alt */ && !chord.ctrlKey && !chord.shiftKey && !chord.metaKey) {
            return 'alt';
        }
        if (chord.keyCode === 57 /* KeyCode.Meta */ && !chord.ctrlKey && !chord.shiftKey && !chord.altKey) {
            return 'meta';
        }
        return null;
    }
    static getProducedCharCode(chord, mapping) {
        if (!mapping) {
            return null;
        }
        if (chord.ctrlKey && chord.shiftKey && chord.altKey) {
            return mapping.withShiftAltGr;
        }
        if (chord.ctrlKey && chord.altKey) {
            return mapping.withAltGr;
        }
        if (chord.shiftKey) {
            return mapping.withShift;
        }
        return mapping.value;
    }
    static getProducedChar(chord, mapping) {
        const char = this.getProducedCharCode(chord, mapping);
        if (char === null || char.length === 0) {
            return ' --- ';
        }
        return '  ' + char + '  ';
    }
}
export class WindowsKeyboardMapper {
    constructor(_isUSStandard, rawMappings, _mapAltGrToCtrlAlt) {
        this._isUSStandard = _isUSStandard;
        this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
        this._keyCodeToLabel = [];
        this._scanCodeToKeyCode = [];
        this._keyCodeToLabel = [];
        this._keyCodeExists = [];
        this._keyCodeToLabel[0 /* KeyCode.Unknown */] = KeyCodeUtils.toString(0 /* KeyCode.Unknown */);
        for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
            const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
            if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                this._scanCodeToKeyCode[scanCode] = immutableKeyCode;
                this._keyCodeToLabel[immutableKeyCode] = KeyCodeUtils.toString(immutableKeyCode);
                this._keyCodeExists[immutableKeyCode] = true;
            }
        }
        const producesLetter = [];
        let producesLetters = false;
        this._codeInfo = [];
        for (const strCode in rawMappings) {
            if (rawMappings.hasOwnProperty(strCode)) {
                const scanCode = ScanCodeUtils.toEnum(strCode);
                if (scanCode === 0 /* ScanCode.None */) {
                    log(`Unknown scanCode ${strCode} in mapping.`);
                    continue;
                }
                const rawMapping = rawMappings[strCode];
                const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
                if (immutableKeyCode !== -1 /* KeyCode.DependsOnKbLayout */) {
                    const keyCode = NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0 /* KeyCode.Unknown */;
                    if (keyCode === 0 /* KeyCode.Unknown */ || immutableKeyCode === keyCode) {
                        continue;
                    }
                    if (scanCode !== 134 /* ScanCode.NumpadComma */) {
                        // Looks like ScanCode.NumpadComma doesn't always map to KeyCode.NUMPAD_SEPARATOR
                        // e.g. on POR - PTB
                        continue;
                    }
                }
                const value = rawMapping.value;
                const withShift = rawMapping.withShift;
                const withAltGr = rawMapping.withAltGr;
                const withShiftAltGr = rawMapping.withShiftAltGr;
                const keyCode = NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0 /* KeyCode.Unknown */;
                const mapping = {
                    scanCode: scanCode,
                    keyCode: keyCode,
                    value: value,
                    withShift: withShift,
                    withAltGr: withAltGr,
                    withShiftAltGr: withShiftAltGr,
                };
                this._codeInfo[scanCode] = mapping;
                this._scanCodeToKeyCode[scanCode] = keyCode;
                if (keyCode === 0 /* KeyCode.Unknown */) {
                    continue;
                }
                this._keyCodeExists[keyCode] = true;
                if (value.length === 0) {
                    // This key does not produce strings
                    this._keyCodeToLabel[keyCode] = null;
                }
                else if (value.length > 1) {
                    // This key produces a letter representable with multiple UTF-16 code units.
                    this._keyCodeToLabel[keyCode] = value;
                }
                else {
                    const charCode = value.charCodeAt(0);
                    if (charCode >= 97 /* CharCode.a */ && charCode <= 122 /* CharCode.z */) {
                        const upperCaseValue = 65 /* CharCode.A */ + (charCode - 97 /* CharCode.a */);
                        producesLetter[upperCaseValue] = true;
                        producesLetters = true;
                        this._keyCodeToLabel[keyCode] = String.fromCharCode(65 /* CharCode.A */ + (charCode - 97 /* CharCode.a */));
                    }
                    else if (charCode >= 65 /* CharCode.A */ && charCode <= 90 /* CharCode.Z */) {
                        producesLetter[charCode] = true;
                        producesLetters = true;
                        this._keyCodeToLabel[keyCode] = value;
                    }
                    else {
                        this._keyCodeToLabel[keyCode] = value;
                    }
                }
            }
        }
        // Handle keyboard layouts where latin characters are not produced e.g. Cyrillic
        const _registerLetterIfMissing = (charCode, keyCode) => {
            if (!producesLetter[charCode]) {
                this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
            }
        };
        _registerLetterIfMissing(65 /* CharCode.A */, 31 /* KeyCode.KeyA */);
        _registerLetterIfMissing(66 /* CharCode.B */, 32 /* KeyCode.KeyB */);
        _registerLetterIfMissing(67 /* CharCode.C */, 33 /* KeyCode.KeyC */);
        _registerLetterIfMissing(68 /* CharCode.D */, 34 /* KeyCode.KeyD */);
        _registerLetterIfMissing(69 /* CharCode.E */, 35 /* KeyCode.KeyE */);
        _registerLetterIfMissing(70 /* CharCode.F */, 36 /* KeyCode.KeyF */);
        _registerLetterIfMissing(71 /* CharCode.G */, 37 /* KeyCode.KeyG */);
        _registerLetterIfMissing(72 /* CharCode.H */, 38 /* KeyCode.KeyH */);
        _registerLetterIfMissing(73 /* CharCode.I */, 39 /* KeyCode.KeyI */);
        _registerLetterIfMissing(74 /* CharCode.J */, 40 /* KeyCode.KeyJ */);
        _registerLetterIfMissing(75 /* CharCode.K */, 41 /* KeyCode.KeyK */);
        _registerLetterIfMissing(76 /* CharCode.L */, 42 /* KeyCode.KeyL */);
        _registerLetterIfMissing(77 /* CharCode.M */, 43 /* KeyCode.KeyM */);
        _registerLetterIfMissing(78 /* CharCode.N */, 44 /* KeyCode.KeyN */);
        _registerLetterIfMissing(79 /* CharCode.O */, 45 /* KeyCode.KeyO */);
        _registerLetterIfMissing(80 /* CharCode.P */, 46 /* KeyCode.KeyP */);
        _registerLetterIfMissing(81 /* CharCode.Q */, 47 /* KeyCode.KeyQ */);
        _registerLetterIfMissing(82 /* CharCode.R */, 48 /* KeyCode.KeyR */);
        _registerLetterIfMissing(83 /* CharCode.S */, 49 /* KeyCode.KeyS */);
        _registerLetterIfMissing(84 /* CharCode.T */, 50 /* KeyCode.KeyT */);
        _registerLetterIfMissing(85 /* CharCode.U */, 51 /* KeyCode.KeyU */);
        _registerLetterIfMissing(86 /* CharCode.V */, 52 /* KeyCode.KeyV */);
        _registerLetterIfMissing(87 /* CharCode.W */, 53 /* KeyCode.KeyW */);
        _registerLetterIfMissing(88 /* CharCode.X */, 54 /* KeyCode.KeyX */);
        _registerLetterIfMissing(89 /* CharCode.Y */, 55 /* KeyCode.KeyY */);
        _registerLetterIfMissing(90 /* CharCode.Z */, 56 /* KeyCode.KeyZ */);
        if (!producesLetters) {
            // Since this keyboard layout produces no latin letters at all, most of the UI will use the
            // US kb layout equivalent for UI labels, so also try to render other keys with the US labels
            // for consistency...
            const _registerLabel = (keyCode, charCode) => {
                // const existingLabel = this._keyCodeToLabel[keyCode];
                // const existingCharCode = (existingLabel ? existingLabel.charCodeAt(0) : CharCode.Null);
                // if (existingCharCode < 32 || existingCharCode > 126) {
                this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
                // }
            };
            _registerLabel(85 /* KeyCode.Semicolon */, 59 /* CharCode.Semicolon */);
            _registerLabel(86 /* KeyCode.Equal */, 61 /* CharCode.Equals */);
            _registerLabel(87 /* KeyCode.Comma */, 44 /* CharCode.Comma */);
            _registerLabel(88 /* KeyCode.Minus */, 45 /* CharCode.Dash */);
            _registerLabel(89 /* KeyCode.Period */, 46 /* CharCode.Period */);
            _registerLabel(90 /* KeyCode.Slash */, 47 /* CharCode.Slash */);
            _registerLabel(91 /* KeyCode.Backquote */, 96 /* CharCode.BackTick */);
            _registerLabel(92 /* KeyCode.BracketLeft */, 91 /* CharCode.OpenSquareBracket */);
            _registerLabel(93 /* KeyCode.Backslash */, 92 /* CharCode.Backslash */);
            _registerLabel(94 /* KeyCode.BracketRight */, 93 /* CharCode.CloseSquareBracket */);
            _registerLabel(95 /* KeyCode.Quote */, 39 /* CharCode.SingleQuote */);
        }
    }
    dumpDebugInfo() {
        const result = [];
        const immutableSamples = [
            88 /* ScanCode.ArrowUp */,
            104 /* ScanCode.Numpad0 */
        ];
        let cnt = 0;
        result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
        for (let scanCode = 0 /* ScanCode.None */; scanCode < 193 /* ScanCode.MAX_VALUE */; scanCode++) {
            if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1 /* KeyCode.DependsOnKbLayout */) {
                if (immutableSamples.indexOf(scanCode) === -1) {
                    continue;
                }
            }
            if (cnt % 6 === 0) {
                result.push(`|       HW Code combination      |  Key  |    KeyCode combination    |          UI label         |        User settings       | WYSIWYG |`);
                result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
            }
            cnt++;
            const mapping = this._codeInfo[scanCode];
            const strCode = ScanCodeUtils.toString(scanCode);
            const mods = [0b000, 0b010, 0b101, 0b111];
            for (const mod of mods) {
                const ctrlKey = (mod & 0b001) ? true : false;
                const shiftKey = (mod & 0b010) ? true : false;
                const altKey = (mod & 0b100) ? true : false;
                const scanCodeChord = new ScanCodeChord(ctrlKey, shiftKey, altKey, false, scanCode);
                const keyCodeChord = this._resolveChord(scanCodeChord);
                const strKeyCode = (keyCodeChord ? KeyCodeUtils.toString(keyCodeChord.keyCode) : null);
                const resolvedKb = (keyCodeChord ? new WindowsNativeResolvedKeybinding(this, [keyCodeChord]) : null);
                const outScanCode = `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${strCode}`;
                const ariaLabel = (resolvedKb ? resolvedKb.getAriaLabel() : null);
                const outUILabel = (ariaLabel ? ariaLabel.replace(/Control\+/, 'Ctrl+') : null);
                const outUserSettings = (resolvedKb ? resolvedKb.getUserSettingsLabel() : null);
                const outKey = WindowsNativeResolvedKeybinding.getProducedChar(scanCodeChord, mapping);
                const outKb = (strKeyCode ? `${ctrlKey ? 'Ctrl+' : ''}${shiftKey ? 'Shift+' : ''}${altKey ? 'Alt+' : ''}${strKeyCode}` : null);
                const isWYSIWYG = (resolvedKb ? resolvedKb.isWYSIWYG() : false);
                const outWYSIWYG = (isWYSIWYG ? '       ' : '   NO  ');
                result.push(`| ${this._leftPad(outScanCode, 30)} | ${outKey} | ${this._leftPad(outKb, 25)} | ${this._leftPad(outUILabel, 25)} |  ${this._leftPad(outUserSettings, 25)} | ${outWYSIWYG} |`);
            }
            result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
        }
        return result.join('\n');
    }
    _leftPad(str, cnt) {
        if (str === null) {
            str = 'null';
        }
        while (str.length < cnt) {
            str = ' ' + str;
        }
        return str;
    }
    getUILabelForKeyCode(keyCode) {
        return this._getLabelForKeyCode(keyCode);
    }
    getAriaLabelForKeyCode(keyCode) {
        return this._getLabelForKeyCode(keyCode);
    }
    getUserSettingsLabelForKeyCode(keyCode) {
        if (this._isUSStandard) {
            return KeyCodeUtils.toUserSettingsUS(keyCode);
        }
        return KeyCodeUtils.toUserSettingsGeneral(keyCode);
    }
    getElectronAcceleratorForKeyBinding(chord) {
        return KeyCodeUtils.toElectronAccelerator(chord.keyCode);
    }
    _getLabelForKeyCode(keyCode) {
        return this._keyCodeToLabel[keyCode] || KeyCodeUtils.toString(0 /* KeyCode.Unknown */);
    }
    resolveKeyboardEvent(keyboardEvent) {
        const ctrlKey = keyboardEvent.ctrlKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
        const altKey = keyboardEvent.altKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
        const chord = new KeyCodeChord(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, keyboardEvent.keyCode);
        return new WindowsNativeResolvedKeybinding(this, [chord]);
    }
    _resolveChord(chord) {
        if (!chord) {
            return null;
        }
        if (chord instanceof KeyCodeChord) {
            if (!this._keyCodeExists[chord.keyCode]) {
                return null;
            }
            return chord;
        }
        const keyCode = this._scanCodeToKeyCode[chord.scanCode] || 0 /* KeyCode.Unknown */;
        if (keyCode === 0 /* KeyCode.Unknown */ || !this._keyCodeExists[keyCode]) {
            return null;
        }
        return new KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
    }
    resolveKeybinding(keybinding) {
        const chords = toEmptyArrayIfContainsNull(keybinding.chords.map(chord => this._resolveChord(chord)));
        if (chords.length > 0) {
            return [new WindowsNativeResolvedKeybinding(this, chords)];
        }
        return [];
    }
}
