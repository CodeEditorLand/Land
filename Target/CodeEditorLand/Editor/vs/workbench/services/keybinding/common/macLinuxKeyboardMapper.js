import { KeyCodeUtils, IMMUTABLE_CODE_TO_KEY_CODE, IMMUTABLE_KEY_CODE_TO_CODE, ScanCodeUtils } from '../../../../base/common/keyCodes.js';
import { KeyCodeChord, ScanCodeChord } from '../../../../base/common/keybindings.js';
import { BaseResolvedKeybinding } from '../../../../platform/keybinding/common/baseResolvedKeybinding.js';
const CHAR_CODE_TO_KEY_CODE = [];
export class NativeResolvedKeybinding extends BaseResolvedKeybinding {
    constructor(mapper, os, chords) {
        super(os, chords);
        this._mapper = mapper;
    }
    _getLabel(chord) {
        return this._mapper.getUILabelForScanCodeChord(chord);
    }
    _getAriaLabel(chord) {
        return this._mapper.getAriaLabelForScanCodeChord(chord);
    }
    _getElectronAccelerator(chord) {
        return this._mapper.getElectronAcceleratorLabelForScanCodeChord(chord);
    }
    _getUserSettingsLabel(chord) {
        return this._mapper.getUserSettingsLabelForScanCodeChord(chord);
    }
    _isWYSIWYG(binding) {
        if (!binding) {
            return true;
        }
        if (IMMUTABLE_CODE_TO_KEY_CODE[binding.scanCode] !== -1) {
            return true;
        }
        const a = this._mapper.getAriaLabelForScanCodeChord(binding);
        const b = this._mapper.getUserSettingsLabelForScanCodeChord(binding);
        if (!a && !b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return (a.toLowerCase() === b.toLowerCase());
    }
    _getChordDispatch(chord) {
        return this._mapper.getDispatchStrForScanCodeChord(chord);
    }
    _getSingleModifierChordDispatch(chord) {
        if ((chord.scanCode === 157 || chord.scanCode === 161) && !chord.shiftKey && !chord.altKey && !chord.metaKey) {
            return 'ctrl';
        }
        if ((chord.scanCode === 159 || chord.scanCode === 163) && !chord.ctrlKey && !chord.shiftKey && !chord.metaKey) {
            return 'alt';
        }
        if ((chord.scanCode === 158 || chord.scanCode === 162) && !chord.ctrlKey && !chord.altKey && !chord.metaKey) {
            return 'shift';
        }
        if ((chord.scanCode === 160 || chord.scanCode === 164) && !chord.ctrlKey && !chord.shiftKey && !chord.altKey) {
            return 'meta';
        }
        return null;
    }
}
class ScanCodeCombo {
    constructor(ctrlKey, shiftKey, altKey, scanCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.scanCode = scanCode;
    }
    toString() {
        return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${ScanCodeUtils.toString(this.scanCode)}`;
    }
    equals(other) {
        return (this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.scanCode === other.scanCode);
    }
    getProducedCharCode(mapping) {
        if (!mapping) {
            return '';
        }
        if (this.ctrlKey && this.shiftKey && this.altKey) {
            return mapping.withShiftAltGr;
        }
        if (this.ctrlKey && this.altKey) {
            return mapping.withAltGr;
        }
        if (this.shiftKey) {
            return mapping.withShift;
        }
        return mapping.value;
    }
    getProducedChar(mapping) {
        const charCode = MacLinuxKeyboardMapper.getCharCode(this.getProducedCharCode(mapping));
        if (charCode === 0) {
            return ' --- ';
        }
        if (charCode >= 768 && charCode <= 879) {
            return 'U+' + charCode.toString(16);
        }
        return '  ' + String.fromCharCode(charCode) + '  ';
    }
}
class KeyCodeCombo {
    constructor(ctrlKey, shiftKey, altKey, keyCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.keyCode = keyCode;
    }
    toString() {
        return `${this.ctrlKey ? 'Ctrl+' : ''}${this.shiftKey ? 'Shift+' : ''}${this.altKey ? 'Alt+' : ''}${KeyCodeUtils.toString(this.keyCode)}`;
    }
}
class ScanCodeKeyCodeMapper {
    constructor() {
        this._scanCodeToKeyCode = [];
        this._keyCodeToScanCode = [];
        this._scanCodeToKeyCode = [];
        this._keyCodeToScanCode = [];
    }
    registrationComplete() {
        this._moveToEnd(56);
        this._moveToEnd(106);
    }
    _moveToEnd(scanCode) {
        for (let mod = 0; mod < 8; mod++) {
            const encodedKeyCodeCombos = this._scanCodeToKeyCode[(scanCode << 3) + mod];
            if (!encodedKeyCodeCombos) {
                continue;
            }
            for (let i = 0, len = encodedKeyCodeCombos.length; i < len; i++) {
                const encodedScanCodeCombos = this._keyCodeToScanCode[encodedKeyCodeCombos[i]];
                if (encodedScanCodeCombos.length === 1) {
                    continue;
                }
                for (let j = 0, len = encodedScanCodeCombos.length; j < len; j++) {
                    const entry = encodedScanCodeCombos[j];
                    const entryScanCode = (entry >>> 3);
                    if (entryScanCode === scanCode) {
                        for (let k = j + 1; k < len; k++) {
                            encodedScanCodeCombos[k - 1] = encodedScanCodeCombos[k];
                        }
                        encodedScanCodeCombos[len - 1] = entry;
                    }
                }
            }
        }
    }
    registerIfUnknown(scanCodeCombo, keyCodeCombo) {
        if (keyCodeCombo.keyCode === 0) {
            return;
        }
        const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
        const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
        const keyCodeIsDigit = (keyCodeCombo.keyCode >= 21 && keyCodeCombo.keyCode <= 30);
        const keyCodeIsLetter = (keyCodeCombo.keyCode >= 31 && keyCodeCombo.keyCode <= 56);
        const existingKeyCodeCombos = this._scanCodeToKeyCode[scanCodeComboEncoded];
        if (keyCodeIsDigit || keyCodeIsLetter) {
            if (existingKeyCodeCombos) {
                for (let i = 0, len = existingKeyCodeCombos.length; i < len; i++) {
                    if (existingKeyCodeCombos[i] === keyCodeComboEncoded) {
                        return;
                    }
                }
            }
        }
        else {
            if (existingKeyCodeCombos && existingKeyCodeCombos.length !== 0) {
                return;
            }
        }
        this._scanCodeToKeyCode[scanCodeComboEncoded] = this._scanCodeToKeyCode[scanCodeComboEncoded] || [];
        this._scanCodeToKeyCode[scanCodeComboEncoded].unshift(keyCodeComboEncoded);
        this._keyCodeToScanCode[keyCodeComboEncoded] = this._keyCodeToScanCode[keyCodeComboEncoded] || [];
        this._keyCodeToScanCode[keyCodeComboEncoded].unshift(scanCodeComboEncoded);
    }
    lookupKeyCodeCombo(keyCodeCombo) {
        const keyCodeComboEncoded = this._encodeKeyCodeCombo(keyCodeCombo);
        const scanCodeCombosEncoded = this._keyCodeToScanCode[keyCodeComboEncoded];
        if (!scanCodeCombosEncoded || scanCodeCombosEncoded.length === 0) {
            return [];
        }
        const result = [];
        for (let i = 0, len = scanCodeCombosEncoded.length; i < len; i++) {
            const scanCodeComboEncoded = scanCodeCombosEncoded[i];
            const ctrlKey = (scanCodeComboEncoded & 0b001) ? true : false;
            const shiftKey = (scanCodeComboEncoded & 0b010) ? true : false;
            const altKey = (scanCodeComboEncoded & 0b100) ? true : false;
            const scanCode = (scanCodeComboEncoded >>> 3);
            result[i] = new ScanCodeCombo(ctrlKey, shiftKey, altKey, scanCode);
        }
        return result;
    }
    lookupScanCodeCombo(scanCodeCombo) {
        const scanCodeComboEncoded = this._encodeScanCodeCombo(scanCodeCombo);
        const keyCodeCombosEncoded = this._scanCodeToKeyCode[scanCodeComboEncoded];
        if (!keyCodeCombosEncoded || keyCodeCombosEncoded.length === 0) {
            return [];
        }
        const result = [];
        for (let i = 0, len = keyCodeCombosEncoded.length; i < len; i++) {
            const keyCodeComboEncoded = keyCodeCombosEncoded[i];
            const ctrlKey = (keyCodeComboEncoded & 0b001) ? true : false;
            const shiftKey = (keyCodeComboEncoded & 0b010) ? true : false;
            const altKey = (keyCodeComboEncoded & 0b100) ? true : false;
            const keyCode = (keyCodeComboEncoded >>> 3);
            result[i] = new KeyCodeCombo(ctrlKey, shiftKey, altKey, keyCode);
        }
        return result;
    }
    guessStableKeyCode(scanCode) {
        if (scanCode >= 36 && scanCode <= 45) {
            switch (scanCode) {
                case 36: return 22;
                case 37: return 23;
                case 38: return 24;
                case 39: return 25;
                case 40: return 26;
                case 41: return 27;
                case 42: return 28;
                case 43: return 29;
                case 44: return 30;
                case 45: return 21;
            }
        }
        const keyCodeCombos1 = this.lookupScanCodeCombo(new ScanCodeCombo(false, false, false, scanCode));
        const keyCodeCombos2 = this.lookupScanCodeCombo(new ScanCodeCombo(false, true, false, scanCode));
        if (keyCodeCombos1.length === 1 && keyCodeCombos2.length === 1) {
            const shiftKey1 = keyCodeCombos1[0].shiftKey;
            const keyCode1 = keyCodeCombos1[0].keyCode;
            const shiftKey2 = keyCodeCombos2[0].shiftKey;
            const keyCode2 = keyCodeCombos2[0].keyCode;
            if (keyCode1 === keyCode2 && shiftKey1 !== shiftKey2) {
                return keyCode1;
            }
        }
        return -1;
    }
    _encodeScanCodeCombo(scanCodeCombo) {
        return this._encode(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, scanCodeCombo.scanCode);
    }
    _encodeKeyCodeCombo(keyCodeCombo) {
        return this._encode(keyCodeCombo.ctrlKey, keyCodeCombo.shiftKey, keyCodeCombo.altKey, keyCodeCombo.keyCode);
    }
    _encode(ctrlKey, shiftKey, altKey, principal) {
        return (((ctrlKey ? 1 : 0) << 0)
            | ((shiftKey ? 1 : 0) << 1)
            | ((altKey ? 1 : 0) << 2)
            | principal << 3) >>> 0;
    }
}
export class MacLinuxKeyboardMapper {
    constructor(_isUSStandard, rawMappings, _mapAltGrToCtrlAlt, _OS) {
        this._isUSStandard = _isUSStandard;
        this._mapAltGrToCtrlAlt = _mapAltGrToCtrlAlt;
        this._OS = _OS;
        this._scanCodeToLabel = [];
        this._scanCodeToDispatch = [];
        this._codeInfo = [];
        this._scanCodeKeyCodeMapper = new ScanCodeKeyCodeMapper();
        this._scanCodeToLabel = [];
        this._scanCodeToDispatch = [];
        const _registerIfUnknown = (hwCtrlKey, hwShiftKey, hwAltKey, scanCode, kbCtrlKey, kbShiftKey, kbAltKey, keyCode) => {
            this._scanCodeKeyCodeMapper.registerIfUnknown(new ScanCodeCombo(hwCtrlKey ? true : false, hwShiftKey ? true : false, hwAltKey ? true : false, scanCode), new KeyCodeCombo(kbCtrlKey ? true : false, kbShiftKey ? true : false, kbAltKey ? true : false, keyCode));
        };
        const _registerAllCombos = (_ctrlKey, _shiftKey, _altKey, scanCode, keyCode) => {
            for (let ctrlKey = _ctrlKey; ctrlKey <= 1; ctrlKey++) {
                for (let shiftKey = _shiftKey; shiftKey <= 1; shiftKey++) {
                    for (let altKey = _altKey; altKey <= 1; altKey++) {
                        _registerIfUnknown(ctrlKey, shiftKey, altKey, scanCode, ctrlKey, shiftKey, altKey, keyCode);
                    }
                }
            }
        };
        for (let scanCode = 0; scanCode < 193; scanCode++) {
            this._scanCodeToLabel[scanCode] = null;
        }
        for (let scanCode = 0; scanCode < 193; scanCode++) {
            this._scanCodeToDispatch[scanCode] = null;
        }
        for (let scanCode = 0; scanCode < 193; scanCode++) {
            const keyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
            if (keyCode !== -1) {
                _registerAllCombos(0, 0, 0, scanCode, keyCode);
                this._scanCodeToLabel[scanCode] = KeyCodeUtils.toString(keyCode);
                if (keyCode === 0 || keyCode === 5 || keyCode === 57 || keyCode === 6 || keyCode === 4) {
                    this._scanCodeToDispatch[scanCode] = null;
                }
                else {
                    this._scanCodeToDispatch[scanCode] = `[${ScanCodeUtils.toString(scanCode)}]`;
                }
            }
        }
        const missingLatinLettersOverride = {};
        {
            const producesLatinLetter = [];
            for (const strScanCode in rawMappings) {
                if (rawMappings.hasOwnProperty(strScanCode)) {
                    const scanCode = ScanCodeUtils.toEnum(strScanCode);
                    if (scanCode === 0) {
                        continue;
                    }
                    if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
                        continue;
                    }
                    const rawMapping = rawMappings[strScanCode];
                    const value = MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
                    if (value >= 97 && value <= 122) {
                        const upperCaseValue = 65 + (value - 97);
                        producesLatinLetter[upperCaseValue] = true;
                    }
                }
            }
            const _registerLetterIfMissing = (charCode, scanCode, value, withShift) => {
                if (!producesLatinLetter[charCode]) {
                    missingLatinLettersOverride[ScanCodeUtils.toString(scanCode)] = {
                        value: value,
                        withShift: withShift,
                        withAltGr: '',
                        withShiftAltGr: ''
                    };
                }
            };
            _registerLetterIfMissing(65, 10, 'a', 'A');
            _registerLetterIfMissing(66, 11, 'b', 'B');
            _registerLetterIfMissing(67, 12, 'c', 'C');
            _registerLetterIfMissing(68, 13, 'd', 'D');
            _registerLetterIfMissing(69, 14, 'e', 'E');
            _registerLetterIfMissing(70, 15, 'f', 'F');
            _registerLetterIfMissing(71, 16, 'g', 'G');
            _registerLetterIfMissing(72, 17, 'h', 'H');
            _registerLetterIfMissing(73, 18, 'i', 'I');
            _registerLetterIfMissing(74, 19, 'j', 'J');
            _registerLetterIfMissing(75, 20, 'k', 'K');
            _registerLetterIfMissing(76, 21, 'l', 'L');
            _registerLetterIfMissing(77, 22, 'm', 'M');
            _registerLetterIfMissing(78, 23, 'n', 'N');
            _registerLetterIfMissing(79, 24, 'o', 'O');
            _registerLetterIfMissing(80, 25, 'p', 'P');
            _registerLetterIfMissing(81, 26, 'q', 'Q');
            _registerLetterIfMissing(82, 27, 'r', 'R');
            _registerLetterIfMissing(83, 28, 's', 'S');
            _registerLetterIfMissing(84, 29, 't', 'T');
            _registerLetterIfMissing(85, 30, 'u', 'U');
            _registerLetterIfMissing(86, 31, 'v', 'V');
            _registerLetterIfMissing(87, 32, 'w', 'W');
            _registerLetterIfMissing(88, 33, 'x', 'X');
            _registerLetterIfMissing(89, 34, 'y', 'Y');
            _registerLetterIfMissing(90, 35, 'z', 'Z');
        }
        const mappings = [];
        let mappingsLen = 0;
        for (const strScanCode in rawMappings) {
            if (rawMappings.hasOwnProperty(strScanCode)) {
                const scanCode = ScanCodeUtils.toEnum(strScanCode);
                if (scanCode === 0) {
                    continue;
                }
                if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
                    continue;
                }
                this._codeInfo[scanCode] = rawMappings[strScanCode];
                const rawMapping = missingLatinLettersOverride[strScanCode] || rawMappings[strScanCode];
                const value = MacLinuxKeyboardMapper.getCharCode(rawMapping.value);
                const withShift = MacLinuxKeyboardMapper.getCharCode(rawMapping.withShift);
                const withAltGr = MacLinuxKeyboardMapper.getCharCode(rawMapping.withAltGr);
                const withShiftAltGr = MacLinuxKeyboardMapper.getCharCode(rawMapping.withShiftAltGr);
                const mapping = {
                    scanCode: scanCode,
                    value: value,
                    withShift: withShift,
                    withAltGr: withAltGr,
                    withShiftAltGr: withShiftAltGr,
                };
                mappings[mappingsLen++] = mapping;
                this._scanCodeToDispatch[scanCode] = `[${ScanCodeUtils.toString(scanCode)}]`;
                if (value >= 97 && value <= 122) {
                    const upperCaseValue = 65 + (value - 97);
                    this._scanCodeToLabel[scanCode] = String.fromCharCode(upperCaseValue);
                }
                else if (value >= 65 && value <= 90) {
                    this._scanCodeToLabel[scanCode] = String.fromCharCode(value);
                }
                else if (value) {
                    this._scanCodeToLabel[scanCode] = String.fromCharCode(value);
                }
                else {
                    this._scanCodeToLabel[scanCode] = null;
                }
            }
        }
        for (let i = mappings.length - 1; i >= 0; i--) {
            const mapping = mappings[i];
            const scanCode = mapping.scanCode;
            const withShiftAltGr = mapping.withShiftAltGr;
            if (withShiftAltGr === mapping.withAltGr || withShiftAltGr === mapping.withShift || withShiftAltGr === mapping.value) {
                continue;
            }
            const kb = MacLinuxKeyboardMapper._charCodeToKb(withShiftAltGr);
            if (!kb) {
                continue;
            }
            const kbShiftKey = kb.shiftKey;
            const keyCode = kb.keyCode;
            if (kbShiftKey) {
                _registerIfUnknown(1, 1, 1, scanCode, 0, 1, 0, keyCode);
            }
            else {
                _registerIfUnknown(1, 1, 1, scanCode, 0, 0, 0, keyCode);
            }
        }
        for (let i = mappings.length - 1; i >= 0; i--) {
            const mapping = mappings[i];
            const scanCode = mapping.scanCode;
            const withAltGr = mapping.withAltGr;
            if (withAltGr === mapping.withShift || withAltGr === mapping.value) {
                continue;
            }
            const kb = MacLinuxKeyboardMapper._charCodeToKb(withAltGr);
            if (!kb) {
                continue;
            }
            const kbShiftKey = kb.shiftKey;
            const keyCode = kb.keyCode;
            if (kbShiftKey) {
                _registerIfUnknown(1, 0, 1, scanCode, 0, 1, 0, keyCode);
            }
            else {
                _registerIfUnknown(1, 0, 1, scanCode, 0, 0, 0, keyCode);
            }
        }
        for (let i = mappings.length - 1; i >= 0; i--) {
            const mapping = mappings[i];
            const scanCode = mapping.scanCode;
            const withShift = mapping.withShift;
            if (withShift === mapping.value) {
                continue;
            }
            const kb = MacLinuxKeyboardMapper._charCodeToKb(withShift);
            if (!kb) {
                continue;
            }
            const kbShiftKey = kb.shiftKey;
            const keyCode = kb.keyCode;
            if (kbShiftKey) {
                _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode);
                _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode);
                _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode);
                _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode);
            }
            else {
                _registerIfUnknown(0, 1, 0, scanCode, 0, 0, 0, keyCode);
                _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode);
                _registerIfUnknown(0, 1, 1, scanCode, 0, 0, 1, keyCode);
                _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode);
                _registerIfUnknown(1, 1, 0, scanCode, 1, 0, 0, keyCode);
                _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode);
                _registerIfUnknown(1, 1, 1, scanCode, 1, 0, 1, keyCode);
                _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode);
            }
        }
        for (let i = mappings.length - 1; i >= 0; i--) {
            const mapping = mappings[i];
            const scanCode = mapping.scanCode;
            const kb = MacLinuxKeyboardMapper._charCodeToKb(mapping.value);
            if (!kb) {
                continue;
            }
            const kbShiftKey = kb.shiftKey;
            const keyCode = kb.keyCode;
            if (kbShiftKey) {
                _registerIfUnknown(0, 0, 0, scanCode, 0, 1, 0, keyCode);
                _registerIfUnknown(0, 0, 1, scanCode, 0, 1, 1, keyCode);
                _registerIfUnknown(1, 0, 0, scanCode, 1, 1, 0, keyCode);
                _registerIfUnknown(1, 0, 1, scanCode, 1, 1, 1, keyCode);
            }
            else {
                _registerIfUnknown(0, 0, 0, scanCode, 0, 0, 0, keyCode);
                _registerIfUnknown(0, 0, 1, scanCode, 0, 0, 1, keyCode);
                _registerIfUnknown(0, 1, 0, scanCode, 0, 1, 0, keyCode);
                _registerIfUnknown(0, 1, 1, scanCode, 0, 1, 1, keyCode);
                _registerIfUnknown(1, 0, 0, scanCode, 1, 0, 0, keyCode);
                _registerIfUnknown(1, 0, 1, scanCode, 1, 0, 1, keyCode);
                _registerIfUnknown(1, 1, 0, scanCode, 1, 1, 0, keyCode);
                _registerIfUnknown(1, 1, 1, scanCode, 1, 1, 1, keyCode);
            }
        }
        _registerAllCombos(0, 0, 0, 36, 22);
        _registerAllCombos(0, 0, 0, 37, 23);
        _registerAllCombos(0, 0, 0, 38, 24);
        _registerAllCombos(0, 0, 0, 39, 25);
        _registerAllCombos(0, 0, 0, 40, 26);
        _registerAllCombos(0, 0, 0, 41, 27);
        _registerAllCombos(0, 0, 0, 42, 28);
        _registerAllCombos(0, 0, 0, 43, 29);
        _registerAllCombos(0, 0, 0, 44, 30);
        _registerAllCombos(0, 0, 0, 45, 21);
        this._scanCodeKeyCodeMapper.registrationComplete();
    }
    dumpDebugInfo() {
        const result = [];
        const immutableSamples = [
            88,
            104
        ];
        let cnt = 0;
        result.push(`isUSStandard: ${this._isUSStandard}`);
        result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
        for (let scanCode = 0; scanCode < 193; scanCode++) {
            if (IMMUTABLE_CODE_TO_KEY_CODE[scanCode] !== -1) {
                if (immutableSamples.indexOf(scanCode) === -1) {
                    continue;
                }
            }
            if (cnt % 4 === 0) {
                result.push(`|       HW Code combination      |  Key  |    KeyCode combination    | Pri |          UI label         |         User settings          |    Electron accelerator   |       Dispatching string       | WYSIWYG |`);
                result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
            }
            cnt++;
            const mapping = this._codeInfo[scanCode];
            for (let mod = 0; mod < 8; mod++) {
                const hwCtrlKey = (mod & 0b001) ? true : false;
                const hwShiftKey = (mod & 0b010) ? true : false;
                const hwAltKey = (mod & 0b100) ? true : false;
                const scanCodeCombo = new ScanCodeCombo(hwCtrlKey, hwShiftKey, hwAltKey, scanCode);
                const resolvedKb = this.resolveKeyboardEvent({
                    _standardKeyboardEventBrand: true,
                    ctrlKey: scanCodeCombo.ctrlKey,
                    shiftKey: scanCodeCombo.shiftKey,
                    altKey: scanCodeCombo.altKey,
                    metaKey: false,
                    altGraphKey: false,
                    keyCode: -1,
                    code: ScanCodeUtils.toString(scanCode)
                });
                const outScanCodeCombo = scanCodeCombo.toString();
                const outKey = scanCodeCombo.getProducedChar(mapping);
                const ariaLabel = resolvedKb.getAriaLabel();
                const outUILabel = (ariaLabel ? ariaLabel.replace(/Control\+/, 'Ctrl+') : null);
                const outUserSettings = resolvedKb.getUserSettingsLabel();
                const outElectronAccelerator = resolvedKb.getElectronAccelerator();
                const outDispatchStr = resolvedKb.getDispatchChords()[0];
                const isWYSIWYG = (resolvedKb ? resolvedKb.isWYSIWYG() : false);
                const outWYSIWYG = (isWYSIWYG ? '       ' : '   NO  ');
                const kbCombos = this._scanCodeKeyCodeMapper.lookupScanCodeCombo(scanCodeCombo);
                if (kbCombos.length === 0) {
                    result.push(`| ${this._leftPad(outScanCodeCombo, 30)} | ${outKey} | ${this._leftPad('', 25)} | ${this._leftPad('', 3)} | ${this._leftPad(outUILabel, 25)} | ${this._leftPad(outUserSettings, 30)} | ${this._leftPad(outElectronAccelerator, 25)} | ${this._leftPad(outDispatchStr, 30)} | ${outWYSIWYG} |`);
                }
                else {
                    for (let i = 0, len = kbCombos.length; i < len; i++) {
                        const kbCombo = kbCombos[i];
                        let colPriority;
                        const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(kbCombo);
                        if (scanCodeCombos.length === 1) {
                            colPriority = '';
                        }
                        else {
                            let priority = -1;
                            for (let j = 0; j < scanCodeCombos.length; j++) {
                                if (scanCodeCombos[j].equals(scanCodeCombo)) {
                                    priority = j + 1;
                                    break;
                                }
                            }
                            colPriority = String(priority);
                        }
                        const outKeybinding = kbCombo.toString();
                        if (i === 0) {
                            result.push(`| ${this._leftPad(outScanCodeCombo, 30)} | ${outKey} | ${this._leftPad(outKeybinding, 25)} | ${this._leftPad(colPriority, 3)} | ${this._leftPad(outUILabel, 25)} | ${this._leftPad(outUserSettings, 30)} | ${this._leftPad(outElectronAccelerator, 25)} | ${this._leftPad(outDispatchStr, 30)} | ${outWYSIWYG} |`);
                        }
                        else {
                            result.push(`| ${this._leftPad('', 30)} |       | ${this._leftPad(outKeybinding, 25)} | ${this._leftPad(colPriority, 3)} | ${this._leftPad('', 25)} | ${this._leftPad('', 30)} | ${this._leftPad('', 25)} | ${this._leftPad('', 30)} |         |`);
                        }
                    }
                }
            }
            result.push(`----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`);
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
    keyCodeChordToScanCodeChord(chord) {
        if (chord.keyCode === 3) {
            return [new ScanCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, 46)];
        }
        const scanCodeCombos = this._scanCodeKeyCodeMapper.lookupKeyCodeCombo(new KeyCodeCombo(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.keyCode));
        const result = [];
        for (let i = 0, len = scanCodeCombos.length; i < len; i++) {
            const scanCodeCombo = scanCodeCombos[i];
            result[i] = new ScanCodeChord(scanCodeCombo.ctrlKey, scanCodeCombo.shiftKey, scanCodeCombo.altKey, chord.metaKey, scanCodeCombo.scanCode);
        }
        return result;
    }
    getUILabelForScanCodeChord(chord) {
        if (!chord) {
            return null;
        }
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        if (this._OS === 2) {
            switch (chord.scanCode) {
                case 86:
                    return '←';
                case 88:
                    return '↑';
                case 85:
                    return '→';
                case 87:
                    return '↓';
            }
        }
        return this._scanCodeToLabel[chord.scanCode];
    }
    getAriaLabelForScanCodeChord(chord) {
        if (!chord) {
            return null;
        }
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        return this._scanCodeToLabel[chord.scanCode];
    }
    getDispatchStrForScanCodeChord(chord) {
        const codeDispatch = this._scanCodeToDispatch[chord.scanCode];
        if (!codeDispatch) {
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
        result += codeDispatch;
        return result;
    }
    getUserSettingsLabelForScanCodeChord(chord) {
        if (!chord) {
            return null;
        }
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[chord.scanCode];
        if (immutableKeyCode !== -1) {
            return KeyCodeUtils.toUserSettingsUS(immutableKeyCode).toLowerCase();
        }
        const constantKeyCode = this._scanCodeKeyCodeMapper.guessStableKeyCode(chord.scanCode);
        if (constantKeyCode !== -1) {
            const reverseChords = this.keyCodeChordToScanCodeChord(new KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, constantKeyCode));
            for (let i = 0, len = reverseChords.length; i < len; i++) {
                const reverseChord = reverseChords[i];
                if (reverseChord.scanCode === chord.scanCode) {
                    return KeyCodeUtils.toUserSettingsUS(constantKeyCode).toLowerCase();
                }
            }
        }
        return this._scanCodeToDispatch[chord.scanCode];
    }
    getElectronAcceleratorLabelForScanCodeChord(chord) {
        if (!chord) {
            return null;
        }
        const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[chord.scanCode];
        if (immutableKeyCode !== -1) {
            return KeyCodeUtils.toElectronAccelerator(immutableKeyCode);
        }
        const constantKeyCode = this._scanCodeKeyCodeMapper.guessStableKeyCode(chord.scanCode);
        if (this._OS === 3 && !this._isUSStandard) {
            const isOEMKey = (constantKeyCode === 85
                || constantKeyCode === 86
                || constantKeyCode === 87
                || constantKeyCode === 88
                || constantKeyCode === 89
                || constantKeyCode === 90
                || constantKeyCode === 91
                || constantKeyCode === 92
                || constantKeyCode === 93
                || constantKeyCode === 94);
            if (isOEMKey) {
                return null;
            }
        }
        if (constantKeyCode !== -1) {
            return KeyCodeUtils.toElectronAccelerator(constantKeyCode);
        }
        return null;
    }
    _toResolvedKeybinding(chordParts) {
        if (chordParts.length === 0) {
            return [];
        }
        const result = [];
        this._generateResolvedKeybindings(chordParts, 0, [], result);
        return result;
    }
    _generateResolvedKeybindings(chordParts, currentIndex, previousParts, result) {
        const chordPart = chordParts[currentIndex];
        const isFinalIndex = currentIndex === chordParts.length - 1;
        for (let i = 0, len = chordPart.length; i < len; i++) {
            const chords = [...previousParts, chordPart[i]];
            if (isFinalIndex) {
                result.push(new NativeResolvedKeybinding(this, this._OS, chords));
            }
            else {
                this._generateResolvedKeybindings(chordParts, currentIndex + 1, chords, result);
            }
        }
    }
    resolveKeyboardEvent(keyboardEvent) {
        let code = ScanCodeUtils.toEnum(keyboardEvent.code);
        if (code === 94) {
            code = 46;
        }
        const keyCode = keyboardEvent.keyCode;
        if ((keyCode === 15)
            || (keyCode === 16)
            || (keyCode === 17)
            || (keyCode === 18)
            || (keyCode === 20)
            || (keyCode === 19)
            || (keyCode === 14)
            || (keyCode === 13)
            || (keyCode === 12)
            || (keyCode === 11)
            || (keyCode === 1)) {
            const immutableScanCode = IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
            if (immutableScanCode !== -1) {
                code = immutableScanCode;
            }
        }
        else {
            if ((code === 95)
                || (code === 96)
                || (code === 97)
                || (code === 98)
                || (code === 99)
                || (code === 100)
                || (code === 101)
                || (code === 102)
                || (code === 103)
                || (code === 104)
                || (code === 105)) {
                if (keyCode >= 0) {
                    const immutableScanCode = IMMUTABLE_KEY_CODE_TO_CODE[keyCode];
                    if (immutableScanCode !== -1) {
                        code = immutableScanCode;
                    }
                }
            }
        }
        const ctrlKey = keyboardEvent.ctrlKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
        const altKey = keyboardEvent.altKey || (this._mapAltGrToCtrlAlt && keyboardEvent.altGraphKey);
        const chord = new ScanCodeChord(ctrlKey, keyboardEvent.shiftKey, altKey, keyboardEvent.metaKey, code);
        return new NativeResolvedKeybinding(this, this._OS, [chord]);
    }
    _resolveChord(chord) {
        if (!chord) {
            return [];
        }
        if (chord instanceof ScanCodeChord) {
            return [chord];
        }
        return this.keyCodeChordToScanCodeChord(chord);
    }
    resolveKeybinding(keybinding) {
        const chords = keybinding.chords.map(chord => this._resolveChord(chord));
        return this._toResolvedKeybinding(chords);
    }
    static _redirectCharCode(charCode) {
        switch (charCode) {
            case 12290: return 46;
            case 12300: return 91;
            case 12301: return 93;
            case 12304: return 91;
            case 12305: return 93;
            case 65307: return 59;
            case 65292: return 44;
        }
        return charCode;
    }
    static _charCodeToKb(charCode) {
        charCode = this._redirectCharCode(charCode);
        if (charCode < CHAR_CODE_TO_KEY_CODE.length) {
            return CHAR_CODE_TO_KEY_CODE[charCode];
        }
        return null;
    }
    static getCharCode(char) {
        if (char.length === 0) {
            return 0;
        }
        const charCode = char.charCodeAt(0);
        switch (charCode) {
            case 768: return 96;
            case 769: return 180;
            case 770: return 94;
            case 771: return 732;
            case 772: return 175;
            case 773: return 8254;
            case 774: return 728;
            case 775: return 729;
            case 776: return 168;
            case 778: return 730;
            case 779: return 733;
        }
        return charCode;
    }
}
(function () {
    function define(charCode, keyCode, shiftKey) {
        for (let i = CHAR_CODE_TO_KEY_CODE.length; i < charCode; i++) {
            CHAR_CODE_TO_KEY_CODE[i] = null;
        }
        CHAR_CODE_TO_KEY_CODE[charCode] = { keyCode: keyCode, shiftKey: shiftKey };
    }
    for (let chCode = 65; chCode <= 90; chCode++) {
        define(chCode, 31 + (chCode - 65), true);
    }
    for (let chCode = 97; chCode <= 122; chCode++) {
        define(chCode, 31 + (chCode - 97), false);
    }
    define(59, 85, false);
    define(58, 85, true);
    define(61, 86, false);
    define(43, 86, true);
    define(44, 87, false);
    define(60, 87, true);
    define(45, 88, false);
    define(95, 88, true);
    define(46, 89, false);
    define(62, 89, true);
    define(47, 90, false);
    define(63, 90, true);
    define(96, 91, false);
    define(126, 91, true);
    define(91, 92, false);
    define(123, 92, true);
    define(92, 93, false);
    define(124, 93, true);
    define(93, 94, false);
    define(125, 94, true);
    define(39, 95, false);
    define(34, 95, true);
})();
