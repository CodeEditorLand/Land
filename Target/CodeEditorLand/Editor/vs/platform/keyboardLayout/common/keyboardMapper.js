export class CachedKeyboardMapper {
    constructor(actual) {
        this._actual = actual;
        this._cache = new Map();
    }
    dumpDebugInfo() {
        return this._actual.dumpDebugInfo();
    }
    resolveKeyboardEvent(keyboardEvent) {
        return this._actual.resolveKeyboardEvent(keyboardEvent);
    }
    resolveKeybinding(keybinding) {
        const hashCode = keybinding.getHashCode();
        const resolved = this._cache.get(hashCode);
        if (!resolved) {
            const r = this._actual.resolveKeybinding(keybinding);
            this._cache.set(hashCode, r);
            return r;
        }
        return resolved;
    }
}
