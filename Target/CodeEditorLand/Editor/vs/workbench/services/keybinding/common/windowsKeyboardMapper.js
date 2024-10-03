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
        super(1, chords);
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
        if (keyCode === 15
            || keyCode === 16
            || keyCode === 17
            || keyCode === 18) {
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
        if (chord.keyCode === 5 && !chord.shiftKey && !chord.altKey && !chord.metaKey) {
            return 'ctrl';
        }
        if (chord.keyCode === 4 && !chord.ctrlKey && !chord.altKey && !chord.metaKey) {
            return 'shift';
        }
        if (chord.keyCode === 6 && !chord.ctrlKey && !chord.shiftKey && !chord.metaKey) {
            return 'alt';
        }
        if (chord.keyCode === 57 && !chord.ctrlKey && !chord.shiftKey && !chord.altKey) {
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
        this._keyCodeToLabel[0] = KeyCodeUtils.toString(0);
        for (let scanCode = 0; scanCode < 193; scanCode++) {
            const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
            if (immutableKeyCode !== -1) {
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
                if (scanCode === 0) {
                    log(`Unknown scanCode ${strCode} in mapping.`);
                    continue;
                }
                const rawMapping = rawMappings[strCode];
                const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
                if (immutableKeyCode !== -1) {
                    const keyCode = NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0;
                    if (keyCode === 0 || immutableKeyCode === keyCode) {
                        continue;
                    }
                    if (scanCode !== 134) {
                        continue;
                    }
                }
                const value = rawMapping.value;
                const withShift = rawMapping.withShift;
                const withAltGr = rawMapping.withAltGr;
                const withShiftAltGr = rawMapping.withShiftAltGr;
                const keyCode = NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE[rawMapping.vkey] || 0;
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
                if (keyCode === 0) {
                    continue;
                }
                this._keyCodeExists[keyCode] = true;
                if (value.length === 0) {
                    this._keyCodeToLabel[keyCode] = null;
                }
                else if (value.length > 1) {
                    this._keyCodeToLabel[keyCode] = value;
                }
                else {
                    const charCode = value.charCodeAt(0);
                    if (charCode >= 97 && charCode <= 122) {
                        const upperCaseValue = 65 + (charCode - 97);
                        producesLetter[upperCaseValue] = true;
                        producesLetters = true;
                        this._keyCodeToLabel[keyCode] = String.fromCharCode(65 + (charCode - 97));
                    }
                    else if (charCode >= 65 && charCode <= 90) {
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
        const _registerLetterIfMissing = (charCode, keyCode) => {
            if (!producesLetter[charCode]) {
                this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
            }
        };
        _registerLetterIfMissing(65, 31);
        _registerLetterIfMissing(66, 32);
        _registerLetterIfMissing(67, 33);
        _registerLetterIfMissing(68, 34);
        _registerLetterIfMissing(69, 35);
        _registerLetterIfMissing(70, 36);
        _registerLetterIfMissing(71, 37);
        _registerLetterIfMissing(72, 38);
        _registerLetterIfMissing(73, 39);
        _registerLetterIfMissing(74, 40);
        _registerLetterIfMissing(75, 41);
        _registerLetterIfMissing(76, 42);
        _registerLetterIfMissing(77, 43);
        _registerLetterIfMissing(78, 44);
        _registerLetterIfMissing(79, 45);
        _registerLetterIfMissing(80, 46);
        _registerLetterIfMissing(81, 47);
        _registerLetterIfMissing(82, 48);
        _registerLetterIfMissing(83, 49);
        _registerLetterIfMissing(84, 50);
        _registerLetterIfMissing(85, 51);
        _registerLetterIfMissing(86, 52);
        _registerLetterIfMissing(87, 53);
        _registerLetterIfMissing(88, 54);
        _registerLetterIfMissing(89, 55);
        _registerLetterIfMissing(90, 56);
        if (!producesLetters) {
            const _registerLabel = (keyCode, charCode) => {
                this._keyCodeToLabel[keyCode] = String.fromCharCode(charCode);
            };
            _registerLabel(85, 59);
            _registerLabel(86, 61);
            _registerLabel(87, 44);
            _registerLabel(88, 45);
            _registerLabel(89, 46);
            _registerLabel(90, 47);
            _registerLabel(91, 96);
            _registerLabel(92, 91);
            _registerLabel(93, 92);
            _registerLabel(94, 93);
            _registerLabel(95, 39);
        }
    }
    dumpDebugInfo() {
        const result = [];
        const immutableSamples = [
            88,
            104
        ];
        let cnt = 0;
        result.push(`-----------------------------------------------------------------------------------------------------------------------------------------`);
        for (let scanCode = 0; scanCode < 193; scanCode++) {
            if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
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
        return this._keyCodeToLabel[keyCode] || KeyCodeUtils.toString(0);
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
        const keyCode = this._scanCodeToKeyCode[chord.scanCode] || 0;
        if (keyCode === 0 || !this._keyCodeExists[keyCode]) {
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
