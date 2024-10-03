function resetGlobalRegex(reg) {
    if (reg.global) {
        reg.lastIndex = 0;
    }
    return true;
}
export class IndentRulesSupport {
    constructor(indentationRules) {
        this._indentationRules = indentationRules;
    }
    shouldIncrease(text) {
        if (this._indentationRules) {
            if (this._indentationRules.increaseIndentPattern && resetGlobalRegex(this._indentationRules.increaseIndentPattern) && this._indentationRules.increaseIndentPattern.test(text)) {
                return true;
            }
        }
        return false;
    }
    shouldDecrease(text) {
        if (this._indentationRules && this._indentationRules.decreaseIndentPattern && resetGlobalRegex(this._indentationRules.decreaseIndentPattern) && this._indentationRules.decreaseIndentPattern.test(text)) {
            return true;
        }
        return false;
    }
    shouldIndentNextLine(text) {
        if (this._indentationRules && this._indentationRules.indentNextLinePattern && resetGlobalRegex(this._indentationRules.indentNextLinePattern) && this._indentationRules.indentNextLinePattern.test(text)) {
            return true;
        }
        return false;
    }
    shouldIgnore(text) {
        if (this._indentationRules && this._indentationRules.unIndentedLinePattern && resetGlobalRegex(this._indentationRules.unIndentedLinePattern) && this._indentationRules.unIndentedLinePattern.test(text)) {
            return true;
        }
        return false;
    }
    getIndentMetadata(text) {
        let ret = 0;
        if (this.shouldIncrease(text)) {
            ret += 1;
        }
        if (this.shouldDecrease(text)) {
            ret += 2;
        }
        if (this.shouldIndentNextLine(text)) {
            ret += 4;
        }
        if (this.shouldIgnore(text)) {
            ret += 8;
        }
        return ret;
    }
}
