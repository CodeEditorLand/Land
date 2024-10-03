import * as browser from './browser.js';
import { EVENT_KEY_CODE_MAP, KeyCodeUtils } from '../common/keyCodes.js';
import { KeyCodeChord } from '../common/keybindings.js';
import * as platform from '../common/platform.js';
function extractKeyCode(e) {
    if (e.charCode) {
        const char = String.fromCharCode(e.charCode).toUpperCase();
        return KeyCodeUtils.fromString(char);
    }
    const keyCode = e.keyCode;
    if (keyCode === 3) {
        return 7;
    }
    else if (browser.isFirefox) {
        switch (keyCode) {
            case 59: return 85;
            case 60:
                if (platform.isLinux) {
                    return 97;
                }
                break;
            case 61: return 86;
            case 107: return 109;
            case 109: return 111;
            case 173: return 88;
            case 224:
                if (platform.isMacintosh) {
                    return 57;
                }
                break;
        }
    }
    else if (browser.isWebKit) {
        if (platform.isMacintosh && keyCode === 93) {
            return 57;
        }
        else if (!platform.isMacintosh && keyCode === 92) {
            return 57;
        }
    }
    return EVENT_KEY_CODE_MAP[keyCode] || 0;
}
const ctrlKeyMod = (platform.isMacintosh ? 256 : 2048);
const altKeyMod = 512;
const shiftKeyMod = 1024;
const metaKeyMod = (platform.isMacintosh ? 2048 : 256);
export function printKeyboardEvent(e) {
    const modifiers = [];
    if (e.ctrlKey) {
        modifiers.push(`ctrl`);
    }
    if (e.shiftKey) {
        modifiers.push(`shift`);
    }
    if (e.altKey) {
        modifiers.push(`alt`);
    }
    if (e.metaKey) {
        modifiers.push(`meta`);
    }
    return `modifiers: [${modifiers.join(',')}], code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`;
}
export function printStandardKeyboardEvent(e) {
    const modifiers = [];
    if (e.ctrlKey) {
        modifiers.push(`ctrl`);
    }
    if (e.shiftKey) {
        modifiers.push(`shift`);
    }
    if (e.altKey) {
        modifiers.push(`alt`);
    }
    if (e.metaKey) {
        modifiers.push(`meta`);
    }
    return `modifiers: [${modifiers.join(',')}], code: ${e.code}, keyCode: ${e.keyCode} ('${KeyCodeUtils.toString(e.keyCode)}')`;
}
export class StandardKeyboardEvent {
    constructor(source) {
        this._standardKeyboardEventBrand = true;
        const e = source;
        this.browserEvent = e;
        this.target = e.target;
        this.ctrlKey = e.ctrlKey;
        this.shiftKey = e.shiftKey;
        this.altKey = e.altKey;
        this.metaKey = e.metaKey;
        this.altGraphKey = e.getModifierState?.('AltGraph');
        this.keyCode = extractKeyCode(e);
        this.code = e.code;
        this.ctrlKey = this.ctrlKey || this.keyCode === 5;
        this.altKey = this.altKey || this.keyCode === 6;
        this.shiftKey = this.shiftKey || this.keyCode === 4;
        this.metaKey = this.metaKey || this.keyCode === 57;
        this._asKeybinding = this._computeKeybinding();
        this._asKeyCodeChord = this._computeKeyCodeChord();
    }
    preventDefault() {
        if (this.browserEvent && this.browserEvent.preventDefault) {
            this.browserEvent.preventDefault();
        }
    }
    stopPropagation() {
        if (this.browserEvent && this.browserEvent.stopPropagation) {
            this.browserEvent.stopPropagation();
        }
    }
    toKeyCodeChord() {
        return this._asKeyCodeChord;
    }
    equals(other) {
        return this._asKeybinding === other;
    }
    _computeKeybinding() {
        let key = 0;
        if (this.keyCode !== 5 && this.keyCode !== 4 && this.keyCode !== 6 && this.keyCode !== 57) {
            key = this.keyCode;
        }
        let result = 0;
        if (this.ctrlKey) {
            result |= ctrlKeyMod;
        }
        if (this.altKey) {
            result |= altKeyMod;
        }
        if (this.shiftKey) {
            result |= shiftKeyMod;
        }
        if (this.metaKey) {
            result |= metaKeyMod;
        }
        result |= key;
        return result;
    }
    _computeKeyCodeChord() {
        let key = 0;
        if (this.keyCode !== 5 && this.keyCode !== 4 && this.keyCode !== 6 && this.keyCode !== 57) {
            key = this.keyCode;
        }
        return new KeyCodeChord(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
    }
}
