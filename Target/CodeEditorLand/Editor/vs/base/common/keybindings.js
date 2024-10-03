import { illegalArgument } from './errors.js';
export function decodeKeybinding(keybinding, OS) {
    if (typeof keybinding === 'number') {
        if (keybinding === 0) {
            return null;
        }
        const firstChord = (keybinding & 0x0000FFFF) >>> 0;
        const secondChord = (keybinding & 0xFFFF0000) >>> 16;
        if (secondChord !== 0) {
            return new Keybinding([
                createSimpleKeybinding(firstChord, OS),
                createSimpleKeybinding(secondChord, OS)
            ]);
        }
        return new Keybinding([createSimpleKeybinding(firstChord, OS)]);
    }
    else {
        const chords = [];
        for (let i = 0; i < keybinding.length; i++) {
            chords.push(createSimpleKeybinding(keybinding[i], OS));
        }
        return new Keybinding(chords);
    }
}
export function createSimpleKeybinding(keybinding, OS) {
    const ctrlCmd = (keybinding & 2048 ? true : false);
    const winCtrl = (keybinding & 256 ? true : false);
    const ctrlKey = (OS === 2 ? winCtrl : ctrlCmd);
    const shiftKey = (keybinding & 1024 ? true : false);
    const altKey = (keybinding & 512 ? true : false);
    const metaKey = (OS === 2 ? ctrlCmd : winCtrl);
    const keyCode = (keybinding & 255);
    return new KeyCodeChord(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}
export class KeyCodeChord {
    constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyCode = keyCode;
    }
    equals(other) {
        return (other instanceof KeyCodeChord
            && this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.metaKey === other.metaKey
            && this.keyCode === other.keyCode);
    }
    getHashCode() {
        const ctrl = this.ctrlKey ? '1' : '0';
        const shift = this.shiftKey ? '1' : '0';
        const alt = this.altKey ? '1' : '0';
        const meta = this.metaKey ? '1' : '0';
        return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`;
    }
    isModifierKey() {
        return (this.keyCode === 0
            || this.keyCode === 5
            || this.keyCode === 57
            || this.keyCode === 6
            || this.keyCode === 4);
    }
    toKeybinding() {
        return new Keybinding([this]);
    }
    isDuplicateModifierCase() {
        return ((this.ctrlKey && this.keyCode === 5)
            || (this.shiftKey && this.keyCode === 4)
            || (this.altKey && this.keyCode === 6)
            || (this.metaKey && this.keyCode === 57));
    }
}
export class ScanCodeChord {
    constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.scanCode = scanCode;
    }
    equals(other) {
        return (other instanceof ScanCodeChord
            && this.ctrlKey === other.ctrlKey
            && this.shiftKey === other.shiftKey
            && this.altKey === other.altKey
            && this.metaKey === other.metaKey
            && this.scanCode === other.scanCode);
    }
    getHashCode() {
        const ctrl = this.ctrlKey ? '1' : '0';
        const shift = this.shiftKey ? '1' : '0';
        const alt = this.altKey ? '1' : '0';
        const meta = this.metaKey ? '1' : '0';
        return `S${ctrl}${shift}${alt}${meta}${this.scanCode}`;
    }
    isDuplicateModifierCase() {
        return ((this.ctrlKey && (this.scanCode === 157 || this.scanCode === 161))
            || (this.shiftKey && (this.scanCode === 158 || this.scanCode === 162))
            || (this.altKey && (this.scanCode === 159 || this.scanCode === 163))
            || (this.metaKey && (this.scanCode === 160 || this.scanCode === 164)));
    }
}
export class Keybinding {
    constructor(chords) {
        if (chords.length === 0) {
            throw illegalArgument(`chords`);
        }
        this.chords = chords;
    }
    getHashCode() {
        let result = '';
        for (let i = 0, len = this.chords.length; i < len; i++) {
            if (i !== 0) {
                result += ';';
            }
            result += this.chords[i].getHashCode();
        }
        return result;
    }
    equals(other) {
        if (other === null) {
            return false;
        }
        if (this.chords.length !== other.chords.length) {
            return false;
        }
        for (let i = 0; i < this.chords.length; i++) {
            if (!this.chords[i].equals(other.chords[i])) {
                return false;
            }
        }
        return true;
    }
}
export class ResolvedChord {
    constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyLabel = keyLabel;
        this.keyAriaLabel = keyAriaLabel;
    }
}
export class ResolvedKeybinding {
}
