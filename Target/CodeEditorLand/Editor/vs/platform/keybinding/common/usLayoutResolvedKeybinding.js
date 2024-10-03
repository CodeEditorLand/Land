import { KeyCodeUtils, IMMUTABLE_CODE_TO_KEY_CODE } from '../../../base/common/keyCodes.js';
import { KeyCodeChord } from '../../../base/common/keybindings.js';
import { BaseResolvedKeybinding } from './baseResolvedKeybinding.js';
import { toEmptyArrayIfContainsNull } from './resolvedKeybindingItem.js';
export class USLayoutResolvedKeybinding extends BaseResolvedKeybinding {
    constructor(chords, os) {
        super(os, chords);
    }
    _keyCodeToUILabel(keyCode) {
        if (this._os === 2) {
            switch (keyCode) {
                case 15:
                    return '←';
                case 16:
                    return '↑';
                case 17:
                    return '→';
                case 18:
                    return '↓';
            }
        }
        return KeyCodeUtils.toString(keyCode);
    }
    _getLabel(chord) {
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        return this._keyCodeToUILabel(chord.keyCode);
    }
    _getAriaLabel(chord) {
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        return KeyCodeUtils.toString(chord.keyCode);
    }
    _getElectronAccelerator(chord) {
        return KeyCodeUtils.toElectronAccelerator(chord.keyCode);
    }
    _getUserSettingsLabel(chord) {
        if (chord.isDuplicateModifierCase()) {
            return '';
        }
        const result = KeyCodeUtils.toUserSettingsUS(chord.keyCode);
        return (result ? result.toLowerCase() : result);
    }
    _isWYSIWYG() {
        return true;
    }
    _getChordDispatch(chord) {
        return USLayoutResolvedKeybinding.getDispatchStr(chord);
    }
    static getDispatchStr(chord) {
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
    _getSingleModifierChordDispatch(keybinding) {
        if (keybinding.keyCode === 5 && !keybinding.shiftKey && !keybinding.altKey && !keybinding.metaKey) {
            return 'ctrl';
        }
        if (keybinding.keyCode === 4 && !keybinding.ctrlKey && !keybinding.altKey && !keybinding.metaKey) {
            return 'shift';
        }
        if (keybinding.keyCode === 6 && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.metaKey) {
            return 'alt';
        }
        if (keybinding.keyCode === 57 && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.altKey) {
            return 'meta';
        }
        return null;
    }
    static _scanCodeToKeyCode(scanCode) {
        const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
        if (immutableKeyCode !== -1) {
            return immutableKeyCode;
        }
        switch (scanCode) {
            case 10: return 31;
            case 11: return 32;
            case 12: return 33;
            case 13: return 34;
            case 14: return 35;
            case 15: return 36;
            case 16: return 37;
            case 17: return 38;
            case 18: return 39;
            case 19: return 40;
            case 20: return 41;
            case 21: return 42;
            case 22: return 43;
            case 23: return 44;
            case 24: return 45;
            case 25: return 46;
            case 26: return 47;
            case 27: return 48;
            case 28: return 49;
            case 29: return 50;
            case 30: return 51;
            case 31: return 52;
            case 32: return 53;
            case 33: return 54;
            case 34: return 55;
            case 35: return 56;
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
            case 51: return 88;
            case 52: return 86;
            case 53: return 92;
            case 54: return 94;
            case 55: return 93;
            case 56: return 0;
            case 57: return 85;
            case 58: return 95;
            case 59: return 91;
            case 60: return 87;
            case 61: return 89;
            case 62: return 90;
            case 106: return 97;
        }
        return 0;
    }
    static _toKeyCodeChord(chord) {
        if (!chord) {
            return null;
        }
        if (chord instanceof KeyCodeChord) {
            return chord;
        }
        const keyCode = this._scanCodeToKeyCode(chord.scanCode);
        if (keyCode === 0) {
            return null;
        }
        return new KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode);
    }
    static resolveKeybinding(keybinding, os) {
        const chords = toEmptyArrayIfContainsNull(keybinding.chords.map(chord => this._toKeyCodeChord(chord)));
        if (chords.length > 0) {
            return [new USLayoutResolvedKeybinding(chords, os)];
        }
        return [];
    }
}
