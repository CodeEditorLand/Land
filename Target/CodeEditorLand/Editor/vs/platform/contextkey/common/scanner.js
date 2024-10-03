import { illegalState } from '../../../base/common/errors.js';
import { localize } from '../../../nls.js';
function hintDidYouMean(...meant) {
    switch (meant.length) {
        case 1:
            return localize('contextkey.scanner.hint.didYouMean1', "Did you mean {0}?", meant[0]);
        case 2:
            return localize('contextkey.scanner.hint.didYouMean2', "Did you mean {0} or {1}?", meant[0], meant[1]);
        case 3:
            return localize('contextkey.scanner.hint.didYouMean3', "Did you mean {0}, {1} or {2}?", meant[0], meant[1], meant[2]);
        default:
            return undefined;
    }
}
const hintDidYouForgetToOpenOrCloseQuote = localize('contextkey.scanner.hint.didYouForgetToOpenOrCloseQuote', "Did you forget to open or close the quote?");
const hintDidYouForgetToEscapeSlash = localize('contextkey.scanner.hint.didYouForgetToEscapeSlash', "Did you forget to escape the '/' (slash) character? Put two backslashes before it to escape, e.g., '\\\\/\'.");
export class Scanner {
    constructor() {
        this._input = '';
        this._start = 0;
        this._current = 0;
        this._tokens = [];
        this._errors = [];
        this.stringRe = /[a-zA-Z0-9_<>\-\./\\:\*\?\+\[\]\^,#@;"%\$\p{L}-]+/uy;
    }
    static getLexeme(token) {
        switch (token.type) {
            case 0:
                return '(';
            case 1:
                return ')';
            case 2:
                return '!';
            case 3:
                return token.isTripleEq ? '===' : '==';
            case 4:
                return token.isTripleEq ? '!==' : '!=';
            case 5:
                return '<';
            case 6:
                return '<=';
            case 7:
                return '>=';
            case 8:
                return '>=';
            case 9:
                return '=~';
            case 10:
                return token.lexeme;
            case 11:
                return 'true';
            case 12:
                return 'false';
            case 13:
                return 'in';
            case 14:
                return 'not';
            case 15:
                return '&&';
            case 16:
                return '||';
            case 17:
                return token.lexeme;
            case 18:
                return token.lexeme;
            case 19:
                return token.lexeme;
            case 20:
                return 'EOF';
            default:
                throw illegalState(`unhandled token type: ${JSON.stringify(token)}; have you forgotten to add a case?`);
        }
    }
    static { this._regexFlags = new Set(['i', 'g', 's', 'm', 'y', 'u'].map(ch => ch.charCodeAt(0))); }
    static { this._keywords = new Map([
        ['not', 14],
        ['in', 13],
        ['false', 12],
        ['true', 11],
    ]); }
    get errors() {
        return this._errors;
    }
    reset(value) {
        this._input = value;
        this._start = 0;
        this._current = 0;
        this._tokens = [];
        this._errors = [];
        return this;
    }
    scan() {
        while (!this._isAtEnd()) {
            this._start = this._current;
            const ch = this._advance();
            switch (ch) {
                case 40:
                    this._addToken(0);
                    break;
                case 41:
                    this._addToken(1);
                    break;
                case 33:
                    if (this._match(61)) {
                        const isTripleEq = this._match(61);
                        this._tokens.push({ type: 4, offset: this._start, isTripleEq });
                    }
                    else {
                        this._addToken(2);
                    }
                    break;
                case 39:
                    this._quotedString();
                    break;
                case 47:
                    this._regex();
                    break;
                case 61:
                    if (this._match(61)) {
                        const isTripleEq = this._match(61);
                        this._tokens.push({ type: 3, offset: this._start, isTripleEq });
                    }
                    else if (this._match(126)) {
                        this._addToken(9);
                    }
                    else {
                        this._error(hintDidYouMean('==', '=~'));
                    }
                    break;
                case 60:
                    this._addToken(this._match(61) ? 6 : 5);
                    break;
                case 62:
                    this._addToken(this._match(61) ? 8 : 7);
                    break;
                case 38:
                    if (this._match(38)) {
                        this._addToken(15);
                    }
                    else {
                        this._error(hintDidYouMean('&&'));
                    }
                    break;
                case 124:
                    if (this._match(124)) {
                        this._addToken(16);
                    }
                    else {
                        this._error(hintDidYouMean('||'));
                    }
                    break;
                case 32:
                case 13:
                case 9:
                case 10:
                case 160:
                    break;
                default:
                    this._string();
            }
        }
        this._start = this._current;
        this._addToken(20);
        return Array.from(this._tokens);
    }
    _match(expected) {
        if (this._isAtEnd()) {
            return false;
        }
        if (this._input.charCodeAt(this._current) !== expected) {
            return false;
        }
        this._current++;
        return true;
    }
    _advance() {
        return this._input.charCodeAt(this._current++);
    }
    _peek() {
        return this._isAtEnd() ? 0 : this._input.charCodeAt(this._current);
    }
    _addToken(type) {
        this._tokens.push({ type, offset: this._start });
    }
    _error(additional) {
        const offset = this._start;
        const lexeme = this._input.substring(this._start, this._current);
        const errToken = { type: 19, offset: this._start, lexeme };
        this._errors.push({ offset, lexeme, additionalInfo: additional });
        this._tokens.push(errToken);
    }
    _string() {
        this.stringRe.lastIndex = this._start;
        const match = this.stringRe.exec(this._input);
        if (match) {
            this._current = this._start + match[0].length;
            const lexeme = this._input.substring(this._start, this._current);
            const keyword = Scanner._keywords.get(lexeme);
            if (keyword) {
                this._addToken(keyword);
            }
            else {
                this._tokens.push({ type: 17, lexeme, offset: this._start });
            }
        }
    }
    _quotedString() {
        while (this._peek() !== 39 && !this._isAtEnd()) {
            this._advance();
        }
        if (this._isAtEnd()) {
            this._error(hintDidYouForgetToOpenOrCloseQuote);
            return;
        }
        this._advance();
        this._tokens.push({ type: 18, lexeme: this._input.substring(this._start + 1, this._current - 1), offset: this._start + 1 });
    }
    _regex() {
        let p = this._current;
        let inEscape = false;
        let inCharacterClass = false;
        while (true) {
            if (p >= this._input.length) {
                this._current = p;
                this._error(hintDidYouForgetToEscapeSlash);
                return;
            }
            const ch = this._input.charCodeAt(p);
            if (inEscape) {
                inEscape = false;
            }
            else if (ch === 47 && !inCharacterClass) {
                p++;
                break;
            }
            else if (ch === 91) {
                inCharacterClass = true;
            }
            else if (ch === 92) {
                inEscape = true;
            }
            else if (ch === 93) {
                inCharacterClass = false;
            }
            p++;
        }
        while (p < this._input.length && Scanner._regexFlags.has(this._input.charCodeAt(p))) {
            p++;
        }
        this._current = p;
        const lexeme = this._input.substring(this._start, this._current);
        this._tokens.push({ type: 10, lexeme, offset: this._start });
    }
    _isAtEnd() {
        return this._current >= this._input.length;
    }
}
